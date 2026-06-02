"""Select stage — semantic dedup vs topic memory, topic choice, brief parse/validate.

The select agent (prompt: ``pipeline/prompts/select.py``) reads
``plans/task-research/candidates.json``, runs the ``dedup`` CLI here to get a
recommended topic (least similar to prior posts, OQ-5 shared embedder), and writes
``plans/task-select/brief.md`` (pinned frontmatter + sections). This module owns the
deterministic parts: ``semantic_dedup`` / ``choose_topic`` (the dedup mechanic +
cadence-protecting choice) and ``parse_brief`` / ``validate_brief``.

Offline scope: ``dedup`` defaults to the MONOLINGUAL ``FakeEmbedder``. A green suite
locks the MECHANICS (dedup order, the threshold gate, parse/validate), NOT retrieval
quality — the real value of ``DEDUP_SIMILARITY_THRESHOLD`` (OQ-8) and the real
multilingual embedder are task 27's empirical call. LIVE HAND-OFF (task 27/28): the
default embedder is ``fake`` and the CLI never consults ``config.embedder`` (a seam
NAME only), so a live select stage would dedup with the fake unless 27/28 flips the
default OR sets ``PIPELINE_EMBEDDER=real``.
"""
from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path

import yaml

from ..contracts.claim_source_map import ContractError
from ..contracts.embedder import Embedder, PriorTopic, cosine, load_topic_memory
from .research import CandidatesDoc, ResearchCandidate

# OQ-8 PLACEHOLDER — the fake's cosine distribution is unlike the real embedder's,
# so any baked constant is only a default. Threshold is ALWAYS a parameter; task 27
# sets the empirical value. (plan §Step 7)
DEDUP_SIMILARITY_THRESHOLD = 0.82

REQUIRED_BODY_HEADERS = (
    "## Angle",
    "## Outline",
    "## Claim skeleton",
    "## Fallback shortlist",
)


# ---------------------------------------------------------------------------
# Dedup + choice
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class DedupResult:
    """A candidate scored against topic memory (rank preserved from candidates.json)."""

    candidate: ResearchCandidate
    max_similarity: float
    nearest_prior_id: str | None
    too_similar: bool

    def to_dict(self) -> dict:
        return {
            "topic_id": self.candidate.topic_id,
            "dedup_key": self.candidate.dedup_key,
            "max_similarity": self.max_similarity,
            "nearest_prior_id": self.nearest_prior_id,
            "too_similar": self.too_similar,
        }


@dataclass(frozen=True)
class Selection:
    """The dedup recommendation. ``chosen`` is ``None`` only for empty input (raises)."""

    chosen: DedupResult | None
    fallback: list[DedupResult]
    all_too_similar: bool

    def to_dict(self) -> dict:
        return {
            "chosen_topic_id": (
                self.chosen.candidate.topic_id if self.chosen is not None else None
            ),
            "fallback_topic_ids": [r.candidate.topic_id for r in self.fallback],
            "all_too_similar": self.all_too_similar,
        }


def semantic_dedup(
    candidates: list[ResearchCandidate],
    prior_topics: list[PriorTopic],
    embedder: Embedder,
    *,
    threshold: float = DEDUP_SIMILARITY_THRESHOLD,
) -> list[DedupResult]:
    """Score each candidate's ``dedup_key`` against topic memory; flag near-duplicates.

    Uses a prior's precomputed ``embedding`` when present, else embeds its
    ``dedup_key``. ``max_similarity`` is the max cosine over priors (0.0 if none);
    ``too_similar = max_similarity >= threshold``. Output order mirrors ``candidates``
    (rank preserved). Both ``dedup_key``s are the §1.5 canonical form.
    """
    prior_vectors: list[tuple[str, list[float]]] = []
    pending_idx: list[int] = []
    pending_keys: list[str] = []
    for i, prior in enumerate(prior_topics):
        if prior.embedding is not None:
            prior_vectors.append((prior.topic_id, prior.embedding))
        else:
            prior_vectors.append((prior.topic_id, []))  # filled in below
            pending_idx.append(i)
            pending_keys.append(prior.dedup_key)
    if pending_keys:
        embedded = embedder.embed(pending_keys)
        for idx, vec in zip(pending_idx, embedded, strict=True):
            prior_vectors[idx] = (prior_topics[idx].topic_id, vec)

    cand_vectors = embedder.embed([c.dedup_key for c in candidates]) if candidates else []

    results: list[DedupResult] = []
    for candidate, cvec in zip(candidates, cand_vectors, strict=True):
        best_sim = 0.0
        best_id: str | None = None
        for pid, pvec in prior_vectors:
            sim = cosine(cvec, pvec)
            if best_id is None or sim > best_sim:
                best_sim = sim
                best_id = pid
        results.append(
            DedupResult(
                candidate=candidate,
                max_similarity=best_sim,
                nearest_prior_id=best_id,
                too_similar=best_sim >= threshold,
            )
        )
    return results


def choose_topic(results: list[DedupResult]) -> Selection:
    """Pick the highest-ranked non-duplicate; protect cadence if all are duplicates.

    - Empty ``results`` -> raises (a run with zero candidates is a hard error).
    - Some non-dup -> ``chosen`` = the highest-ranked non-dup; ``fallback`` = the
      subsequent non-dups (rank order).
    - ALL too similar -> ``chosen`` = the LEAST-similar result, ``all_too_similar=True``,
      ``fallback`` = the rest ascending by similarity. NEVER returns ``chosen=None``
      here (cadence: publish something rather than nothing, OQ-14a).
    """
    if not results:
        raise ContractError("choose_topic: no candidates (empty results)")
    non_dups = [r for r in results if not r.too_similar]
    if non_dups:
        return Selection(chosen=non_dups[0], fallback=non_dups[1:], all_too_similar=False)
    ascending = sorted(results, key=lambda r: r.max_similarity)
    return Selection(chosen=ascending[0], fallback=ascending[1:], all_too_similar=True)


# ---------------------------------------------------------------------------
# Brief parse + validate
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class BriefMeta:
    """Parsed brief frontmatter (the leading fence only)."""

    chosen_topic_id: str | None
    fallback_topic_ids: list[str]
    angle: str | None
    claim_skeleton: list[dict]


# Leading frontmatter fence only: anchored at start, non-greedy body so the FIRST
# closing `---` line ends it — markdown bodies contain `---` (plan §Step 7).
_FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)


def _parse_frontmatter(text: str) -> dict:
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return {}
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return {}
    return data if isinstance(data, dict) else {}


def parse_brief(text: str) -> BriefMeta:
    """Extract the brief's leading-fence frontmatter into a ``BriefMeta``."""
    fm = _parse_frontmatter(text)
    fallback = fm.get("fallback_topic_ids")
    skeleton = fm.get("claim_skeleton")
    return BriefMeta(
        chosen_topic_id=fm.get("chosen_topic_id"),
        fallback_topic_ids=fallback if isinstance(fallback, list) else [],
        angle=fm.get("angle"),
        claim_skeleton=skeleton if isinstance(skeleton, list) else [],
    )


def _has_header(text: str, header: str) -> bool:
    return re.search(rf"(?m)^{re.escape(header)}[ \t]*$", text) is not None


def validate_brief(text: str, *, candidate_ids: set[str] | None = None) -> list[str]:
    """Return a list of problems (empty == valid).

    Checks: leading frontmatter parses; ``chosen_topic_id`` present; ``fallback_topic_ids``
    is a list; if ``candidate_ids`` given, chosen + fallbacks subset of it; all four body
    headers present; each ``claim_skeleton`` entry has a non-empty ``statement`` + ``source_ids``.
    """
    problems: list[str] = []
    fm = _parse_frontmatter(text)
    if not fm:
        problems.append("frontmatter: missing or unparseable leading --- fence")
    else:
        chosen = fm.get("chosen_topic_id")
        if not (isinstance(chosen, str) and chosen.strip()):
            problems.append("frontmatter: chosen_topic_id must be a non-empty string")
        fallback = fm.get("fallback_topic_ids")
        if not isinstance(fallback, list):
            problems.append("frontmatter: fallback_topic_ids must be a list")
            fallback = []
        if candidate_ids is not None:
            referenced = ([chosen] if isinstance(chosen, str) else []) + [
                f for f in fallback if isinstance(f, str)
            ]
            for tid in referenced:
                if tid not in candidate_ids:
                    problems.append(f"frontmatter: topic id {tid!r} not in candidate_ids")
        skeleton = fm.get("claim_skeleton")
        if not isinstance(skeleton, list) or not skeleton:
            problems.append("frontmatter: claim_skeleton must be a non-empty list")
        else:
            for i, entry in enumerate(skeleton):
                if not isinstance(entry, dict):
                    problems.append(f"claim_skeleton[{i}]: must be a mapping")
                    continue
                if not str(entry.get("statement", "")).strip():
                    problems.append(f"claim_skeleton[{i}]: statement must be non-empty")
                source_ids = entry.get("source_ids")
                if not isinstance(source_ids, list) or not source_ids:
                    problems.append(
                        f"claim_skeleton[{i}]: source_ids must be a non-empty list"
                    )
    for header in REQUIRED_BODY_HEADERS:
        if not _has_header(text, header):
            problems.append(f"body: missing required header {header!r}")
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.select {dedup,validate-brief}
# ---------------------------------------------------------------------------


def _make_embedder(name: str) -> Embedder:
    if name == "fake":
        from ..fakes import FakeEmbedder

        return FakeEmbedder()
    if name == "real":
        raise NotImplementedError(
            "real embedder is wired in task 27 (pipeline/memory/embedder.py)"
        )
    raise ValueError(f"unknown embedder {name!r} (expected 'fake' or 'real')")


def _cmd_dedup(args) -> int:
    run_dir = Path(args.run_dir)
    candidates_path = run_dir / "plans" / "task-research" / "candidates.json"
    try:
        doc = CandidatesDoc.load_path(candidates_path)
        doc.validate()
    except (ContractError, OSError) as exc:
        print(f"INVALID candidates.json: {exc}", file=sys.stderr)
        return 1

    threshold = (
        args.threshold if args.threshold is not None else DEDUP_SIMILARITY_THRESHOLD
    )
    priors = load_topic_memory(args.memory) if args.memory else []
    embedder_name = args.embedder or os.environ.get("PIPELINE_EMBEDDER") or "fake"
    try:
        embedder = _make_embedder(embedder_name)
    except NotImplementedError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    results = semantic_dedup(doc.candidates, priors, embedder, threshold=threshold)
    try:
        selection = choose_topic(results)
    except ContractError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    # A fresh run-dir seeds only the research input, so task-select/ may not exist.
    out = run_dir / "plans" / "task-select" / "dedup.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "threshold": threshold,
        "results": [r.to_dict() for r in results],
        "selection": selection.to_dict(),
    }
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    selected = selection.to_dict()
    print(f"chosen_topic_id: {selected['chosen_topic_id']}")
    print(f"fallback_topic_ids: {selected['fallback_topic_ids']}")
    if selection.all_too_similar:
        print("all_too_similar: true (cadence fallback — chose least-similar)")
    return 0


def _cmd_validate_brief(args) -> int:
    try:
        text = Path(args.path).read_text(encoding="utf-8")
    except OSError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    problems = validate_brief(text)
    if problems:
        for problem in problems:
            print(problem)
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.select",
        description="Select-stage helpers: dedup vs topic memory + brief validation.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_dedup = sub.add_parser(
        "dedup", help="semantic dedup vs topic memory, recommend a topic"
    )
    p_dedup.add_argument("--run-dir", required=True, help="absolute run dir")
    p_dedup.add_argument(
        "--threshold", type=float, default=None, help="dedup cosine threshold"
    )
    p_dedup.add_argument(
        "--memory", default=None, help="path to a topic_memory JSON (else empty)"
    )
    p_dedup.add_argument(
        "--embedder",
        choices=["fake", "real"],
        default=None,
        help="embedder backend (default: $PIPELINE_EMBEDDER or 'fake')",
    )

    p_brief = sub.add_parser("validate-brief", help="validate a brief.md")
    p_brief.add_argument("path", help="path to brief.md")

    args = parser.parse_args(argv)
    if args.cmd == "dedup":
        return _cmd_dedup(args)
    return _cmd_validate_brief(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "DEDUP_SIMILARITY_THRESHOLD",
    "REQUIRED_BODY_HEADERS",
    "DedupResult",
    "Selection",
    "BriefMeta",
    "semantic_dedup",
    "choose_topic",
    "parse_brief",
    "validate_brief",
]

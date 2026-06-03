"""M-4 SOURCE-GROUNDING gate (FR-C2, writing-flow.md section 4.3) -- per language.

Deterministic, BLOCKing checks that every factual statement traces to a cited,
reachable source -- WITHOUT claim<->excerpt token matching (plan section 0.4):

- no uncited load-bearing claim: every source backing a claim is cited inline in the
  draft body as ``[sN]``;
- no dead link: every cited source URL is reachable (via the ``LinkChecker`` seam);
- no dangling citation: every ``[sN]`` in the body resolves to a source in the map.

The ``[sN]`` inline-citation convention is pinned by the draft prompt
(``prompts/draft.py``: source_ids are ``s`` + digits, cited as ``[s1]``). Producer and
consumer must agree on that shape for the dangling-citation regex to be
false-positive-free [MEM: m4-gate-contract].
"""
from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from ..contracts.claim_source_map import ClaimSourceMap, ContractError

# The pinned inline-citation shape: source_ids are 's' + digits (e.g. s1), cited [s1].
# Matches what prompts/draft.py mandates the producer emit (R8 in the plan).
_CITATION_RE = re.compile(r"\[(s\d+)\]")


class LinkChecker(Protocol):
    """Decides whether a source URL is reachable (the source-grounding seam)."""

    def reachable(self, url: str) -> bool:
        ...


@dataclass(frozen=True)
class FakeLinkChecker:
    """OFFLINE double: a URL is reachable iff it is NOT in ``dead_urls``.

    This is the test/CI ``LinkChecker``. The REAL HTTP reachability checker is deferred
    post-secret / post-deploy and raises ``NotImplementedError`` (mirrors the
    Embedder / LLMProvider seam and ``select._make_embedder('real')``). Because the
    research stage captures source EXCERPTS up front, a live re-fetch is "only a
    fallback" (writing-flow.md section 4.1) -- so this offline default is enough to lock
    the gate mechanics; the real checker is not over-invested in here.
    """

    dead_urls: frozenset[str] = frozenset()

    def reachable(self, url: str) -> bool:
        return url not in self.dead_urls


def check_grounding(
    csm: ClaimSourceMap,
    body_text: str,
    lang: str,
    link_checker: LinkChecker,
) -> list[str]:
    """Return a list of grounding problems (empty == grounded)."""
    try:
        csm.validate()
    except ContractError as exc:
        return [f"{lang}: claim_source_map structural: {exc}"]

    by_id = {source.source_id: source for source in csm.sources}
    claims = csm.claims_for(lang)
    cited_source_ids = sorted({claim.source_id for claim in claims})
    problems: list[str] = []

    # No uncited load-bearing claim: every source backing a claim is cited in the body.
    for sid in cited_source_ids:
        if f"[{sid}]" not in body_text:
            problems.append(
                f"{lang}: uncited load-bearing claim: source {sid} backs a claim "
                "but is not cited in the draft body"
            )

    # No dead link: every distinct cited source URL is reachable.
    for sid in cited_source_ids:
        url = by_id[sid].url
        if not link_checker.reachable(url):
            problems.append(f"{lang}: dead link: {url} (source {sid})")

    # No dangling citation: every [sN] in the body resolves to a source in the map.
    for match in sorted(set(_CITATION_RE.findall(body_text))):
        if match not in by_id:
            problems.append(
                f"{lang}: dangling citation [{match}]: no such source in the "
                "claim->source map"
            )
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.grounding --run-dir <dir> --lang {fr,en}
#      [--link-check {fake,real}] [--dead-urls url,url]
# ---------------------------------------------------------------------------


def _make_link_checker(name: str, dead_urls: str | None) -> LinkChecker:
    if name == "real":
        raise NotImplementedError(
            "real link checker is wired post-secret/post-deploy (HTTP reachability); "
            "captured excerpts make a live re-fetch only a fallback"
        )
    if name == "fake":
        dead = frozenset(dead_urls.split(",")) if dead_urls else frozenset()
        return FakeLinkChecker(dead)
    raise ValueError(f"unknown link checker {name!r} (expected 'fake' or 'real')")


def _cmd(run_dir: Path, lang: str, link_check: str, dead_urls: str | None) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    try:
        csm = ClaimSourceMap.load_path(draft_dir / "claim_source_map.json")
    except (ContractError, OSError) as exc:
        print(f"{lang}: cannot load claim_source_map.json: {exc}")
        return 1
    try:
        body_text = (draft_dir / f"draft-{lang}.md").read_text(encoding="utf-8")
    except OSError as exc:
        print(f"{lang}: cannot read draft-{lang}.md: {exc}")
        return 1
    try:
        link_checker = _make_link_checker(link_check, dead_urls)
    except NotImplementedError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    problems = check_grounding(csm, body_text, lang, link_checker)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.grounding",
        description="M-4 source-grounding gate (FR-C2): citations + reachable sources.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    parser.add_argument(
        "--link-check",
        choices=["fake", "real"],
        default="fake",
        help="link reachability backend (default: fake; real is post-secret)",
    )
    parser.add_argument(
        "--dead-urls",
        default=None,
        help="comma-separated URLs the fake checker treats as unreachable",
    )
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang, args.link_check, args.dead_urls)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "LinkChecker",
    "FakeLinkChecker",
    "check_grounding",
]

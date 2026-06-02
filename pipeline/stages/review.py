"""Review stage — the editorial self-gate: claim->source completeness + cpe verdict.

cpe's built-in review loop reviews the implementation PLAN (correctness/completeness/
risk, not style). This module is the EDITORIAL self-check the live draft agent shells
out to (and that task 26's blocking gate reuses): it turns the claim->source map's
per-language completeness into a machine-readable ``## Verdict: APPROVED |
NEEDS_REVISION`` line that cpe's ``runner.check_verdict`` can parse.

Completeness is defined on ``source_id`` SETS per language (plan section 2.2), never by
matching skeleton prose against claim prose (which is flaky). For each language the
brief's skeleton source ids must all be covered by some claim, and FR and EN must cover
the SAME set (NFR-11 parity).

Two verdict vocabularies exist and are never conflated (plan section 2.3): editorial
review here is ``APPROVED | NEEDS_REVISION`` (cpe's sentinel); the style audit
(``humanize.py``) is ``clean | suspicious | revision_needed``.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ..contracts.claim_source_map import ClaimSourceMap, ContractError
from .select import parse_brief

_LANGS = ("fr", "en")


@dataclass(frozen=True)
class ReviewReport:
    """The editorial self-check result. ``coverage`` is the per-language source_id set."""

    verdict: str  # "APPROVED" | "NEEDS_REVISION"
    problems: list[str]
    coverage: dict[str, list[str]]  # {"fr": [source_ids...], "en": [...]}

    def verdict_line(self) -> str:
        """The cpe-parseable sentinel line (``runner.check_verdict`` reads this)."""
        return f"## Verdict: {self.verdict}"

    def to_dict(self) -> dict:
        return {
            "verdict": self.verdict,
            "problems": list(self.problems),
            "coverage": {lang: list(ids) for lang, ids in self.coverage.items()},
        }


def parse_verdict(text: str) -> str | None:
    """Read a verdict from text, mirroring cpe ``runner.check_verdict`` (case-insensitive).

    ``"verdict: approved"`` / ``"verdict:approved"`` -> ``"APPROVED"``;
    ``"verdict: needs_revision"`` / ``"verdict:needs_revision"`` -> ``"NEEDS_REVISION"``;
    otherwise ``None``. APPROVED is checked first (cpe approves on the approved substring).
    """
    lower = text.lower()
    if "verdict: approved" in lower or "verdict:approved" in lower:
        return "APPROVED"
    if "verdict: needs_revision" in lower or "verdict:needs_revision" in lower:
        return "NEEDS_REVISION"
    return None


def _skeleton_source_ids(brief_text: str) -> set[str]:
    """Union of the brief skeleton's ``source_ids`` (defensive: tolerate malformed entries).

    ``parse_brief`` returns raw YAML dicts; the select ``validate-brief`` self-gate
    guarantees a well-formed skeleton in the live path, but we still guard so a stray
    entry yields a clean coverage gap rather than a KeyError/TypeError.
    """
    ids: set[str] = set()
    for entry in parse_brief(brief_text).claim_skeleton:
        if not isinstance(entry, dict):
            continue
        source_ids = entry.get("source_ids") or []
        if not isinstance(source_ids, list):
            continue
        ids.update(sid for sid in source_ids if isinstance(sid, str) and sid.strip())
    return ids


def review_claim_source_map(brief_text: str, csm: ClaimSourceMap) -> ReviewReport:
    """Build the editorial verdict from the brief skeleton + the claim->source map.

    Order (plan section 2.2): structural integrity first (``csm.validate()`` — orphan/
    duplicate source ids, span bounds); then per-language coverage of the skeleton
    source ids; then FR/EN parity. ``APPROVED`` iff there are no problems.
    """
    try:
        csm.validate()
    except ContractError as exc:
        return ReviewReport(
            verdict="NEEDS_REVISION",
            problems=[f"claim_source_map structural: {exc}"],
            coverage={lang: [] for lang in _LANGS},
        )

    skeleton_ids = _skeleton_source_ids(brief_text)
    coverage: dict[str, list[str]] = {}
    problems: list[str] = []
    for lang in _LANGS:
        claims = csm.claims_for(lang)
        covered = {claim.source_id for claim in claims}
        coverage[lang] = sorted(covered)
        if not claims:
            problems.append(f"{lang}: no load-bearing claims for this language")
        for sid in sorted(skeleton_ids - covered):
            problems.append(
                f"{lang}: skeleton source_id {sid!r} is not covered by any claim"
            )
    if set(coverage["fr"]) != set(coverage["en"]):
        problems.append(
            "parity (NFR-11): fr covers "
            f"{coverage['fr']} but en covers {coverage['en']}"
        )

    verdict = "APPROVED" if not problems else "NEEDS_REVISION"
    return ReviewReport(verdict=verdict, problems=problems, coverage=coverage)


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.review check --run-dir <abs>
# ---------------------------------------------------------------------------


def _build_report(brief_path: Path, csm_path: Path) -> ReviewReport:
    try:
        brief_text = brief_path.read_text(encoding="utf-8")
    except OSError as exc:
        return ReviewReport(
            "NEEDS_REVISION", [f"cannot read brief.md: {exc}"], {lang: [] for lang in _LANGS}
        )
    try:
        csm = ClaimSourceMap.load_path(csm_path)
    except (ContractError, OSError) as exc:
        return ReviewReport(
            "NEEDS_REVISION",
            [f"claim_source_map.json: {exc}"],
            {lang: [] for lang in _LANGS},
        )
    return review_claim_source_map(brief_text, csm)


def _cmd_check(args) -> int:
    run_dir = Path(args.run_dir)
    brief_path = run_dir / "plans" / "task-select" / "brief.md"
    csm_path = run_dir / "plans" / "task-draft" / "claim_source_map.json"
    report = _build_report(brief_path, csm_path)

    # Self-check artifact (distinct from cpe's plan-review review-N.md / review-final.md;
    # cpe reads a specific review_path, never a glob, so review.json is inert to it).
    out = run_dir / "plans" / "task-draft" / "review.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        json.dumps(report.to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(report.verdict_line())
    for problem in report.problems:
        print(problem)
    return 0 if report.verdict == "APPROVED" else 1


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.review",
        description="Editorial self-gate: claim->source completeness -> cpe verdict.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_check = sub.add_parser(
        "check", help="check claim->source completeness; print the ## Verdict: line"
    )
    p_check.add_argument("--run-dir", required=True, help="absolute run dir")
    args = parser.parse_args(argv)
    return _cmd_check(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["ReviewReport", "parse_verdict", "review_claim_source_map"]

"""M-4 FACT-CHECK gate (FR-C1, writing-flow.md section 4.3) -- per language.

Two layers, both BLOCK:

1. Structural provenance backstop (``verify_provenance``) -- language-agnostic,
   deterministic: the claim->source map validates (no orphan/duplicate source ids, span
   bounds), every cited ``excerpt_span`` pins a NON-whitespace excerpt slice, and the
   language has at least one load-bearing claim. A degenerate span supports nothing.

2. Per-claim semantic verdicts (``parse_factcheck_findings`` + ``factcheck_passes``) --
   consumes ``factcheck-{lang}.json``, the findings of a SEPARATE fact-check sub-agent
   dispatched by the draft prompt (judge != author, mirroring how ``humanize`` consumes
   the ``style-auditor``'s JSON). The gate BLOCKs on any ``supported: false`` and on a
   MISSING findings file -- the fact-check pass must have run.

LIVE-ONLY BOUNDARY (same as the ``style-auditor`` re-check): the semantic "does this
excerpt support this claim" judgment is multilingual entailment a deterministic check
CANNOT do (the canonical "good" fixture has FR claims backed by ENGLISH excerpts, so any
claim<->excerpt token match would wrongly fail every FR claim). In CI the
``factcheck-{lang}.json`` fixtures stand in for that sub-agent run; this module's
deterministic teeth are the structural backstop + the findings PARSER. The real semantic
independence is the fresh sub-agent on the subscription pool, exercisable only in a live
run. [MEM: m4-gate-contract]
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ..contracts.claim_source_map import ClaimSourceMap, ContractError

# The fact-check sub-agent's verdict vocabulary (distinct from the editorial
# APPROVED / NEEDS_REVISION in review.py and the style clean/.../revision_needed in
# humanize.py -- never conflate the three).
FACTCHECK_VERDICTS = ("supported", "unsupported")


@dataclass(frozen=True)
class FactCheckClaim:
    """One per-claim verdict from the fact-check sub-agent."""

    claim: str
    source_id: str
    supported: bool
    reason: str = ""

    def to_dict(self) -> dict:
        return {
            "claim": self.claim,
            "source_id": self.source_id,
            "supported": self.supported,
            "reason": self.reason,
        }


@dataclass(frozen=True)
class FactCheckReport:
    """A parsed ``factcheck-{lang}.json``. Passes iff verdict 'supported' and every
    claim is supported."""

    verdict: str  # supported | unsupported
    claims: list[FactCheckClaim]

    def to_dict(self) -> dict:
        return {
            "verdict": self.verdict,
            "claims": [claim.to_dict() for claim in self.claims],
        }


def _claim_from_dict(data: object) -> FactCheckClaim:
    """Map one ``claims[]`` entry. ``supported`` MUST be a real bool and present --
    a producer that forgot the field would otherwise silently read as supported."""
    if not isinstance(data, dict):
        raise ContractError(
            f"fact-check claim must be a mapping (got {type(data).__name__})"
        )
    if "supported" not in data:
        raise ContractError("fact-check claim missing required 'supported' field")
    supported = data["supported"]
    if not isinstance(supported, bool):
        raise ContractError(
            f"fact-check claim 'supported' must be a boolean (got {type(supported).__name__})"
        )
    return FactCheckClaim(
        claim=str(data.get("claim", "")),
        source_id=str(data.get("source_id", "")),
        supported=supported,
        reason=str(data.get("reason", "")),
    )


def parse_factcheck_findings(data: dict | str) -> FactCheckReport:
    """Parse the raw fact-check JSON (str -> ``json.loads``) into a ``FactCheckReport``.

    Raises ``ContractError`` on invalid JSON, a non-object payload, an unknown
    ``verdict``, a ``claims`` value that is not a list, or a claim missing ``supported``.
    Mirrors ``humanize.parse_style_findings``.
    """
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid fact-check findings JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ContractError("fact-check findings must be a JSON object")
    verdict = data.get("verdict")
    if verdict not in FACTCHECK_VERDICTS:
        raise ContractError(
            f"fact-check verdict must be one of {FACTCHECK_VERDICTS} (got {verdict!r})"
        )
    raw_claims = data.get("claims")
    if not isinstance(raw_claims, list):
        raise ContractError("fact-check findings 'claims' must be a list")
    return FactCheckReport(
        verdict=verdict,
        claims=[_claim_from_dict(item) for item in raw_claims],
    )


def factcheck_passes(report: FactCheckReport) -> bool:
    """Pass iff the overall verdict is 'supported' AND every claim is supported."""
    return report.verdict == "supported" and all(c.supported for c in report.claims)


def verify_provenance(csm: ClaimSourceMap, lang: str) -> list[str]:
    """Deterministic, language-agnostic structural backstop (empty == clean).

    Does NOT do claim<->excerpt token matching (the FR-claim/EN-excerpt reality makes
    that wrong, plan section 0.4); semantic support is the sub-agent's verdict. Here:
    structural integrity, a non-whitespace excerpt slice for every cited span, and a
    non-empty per-language claim set.
    """
    try:
        csm.validate()
    except ContractError as exc:
        return [f"{lang}: claim_source_map structural: {exc}"]

    by_id = {source.source_id: source for source in csm.sources}
    problems: list[str] = []
    claims = csm.claims_for(lang)
    if not claims:
        problems.append(f"{lang}: no load-bearing claims for this language")
    for claim in claims:
        span = claim.excerpt_span
        if span is None:
            continue
        # csm.validate() already proved 0 <= start < end <= len(excerpt), so the source
        # resolves and the slice is in bounds; here we reject an all-whitespace slice.
        excerpt = by_id[claim.source_id].excerpt
        if not excerpt[span.start : span.end].strip():
            problems.append(
                f"{lang}: claim cites an empty/whitespace excerpt span "
                f"(source {claim.source_id})"
            )
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.factcheck --run-dir <dir> --lang {fr,en}
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path, lang: str) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    try:
        csm = ClaimSourceMap.load_path(draft_dir / "claim_source_map.json")
    except (ContractError, OSError) as exc:
        print(f"{lang}: cannot load claim_source_map.json: {exc}")
        return 1

    problems = verify_provenance(csm, lang)

    findings_path = draft_dir / f"factcheck-{lang}.json"
    try:
        findings_text = findings_path.read_text(encoding="utf-8")
    except OSError:
        problems.append(
            f"{lang}: missing fact-check findings (factcheck-{lang}.json) -- "
            "the fact-check pass did not run"
        )
    else:
        try:
            report = parse_factcheck_findings(findings_text)
        except ContractError as exc:
            problems.append(f"{lang}: invalid fact-check findings: {exc}")
        else:
            if not factcheck_passes(report):
                for claim in report.claims:
                    if not claim.supported:
                        problems.append(
                            f"{lang}: UNSUPPORTED claim [{claim.source_id}]: "
                            f"{claim.claim!r} -- {claim.reason}"
                        )

    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.factcheck",
        description="M-4 fact-check gate (FR-C1): provenance + per-claim supported verdict.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "FACTCHECK_VERDICTS",
    "FactCheckClaim",
    "FactCheckReport",
    "parse_factcheck_findings",
    "factcheck_passes",
    "verify_provenance",
]

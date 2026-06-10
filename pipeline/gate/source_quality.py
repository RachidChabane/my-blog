"""G2 SOURCE-QUALITY gate (writing-rigor task 5; closes G2) -- single gate, ALONGSIDE factcheck.

Built on the shared judge != author substrate (pipeline/gate/judge.py). A FRESH source-quality
judge (dispatched by pipeline/prompts/draft.py via build_judge_dispatch) is handed ONLY the
claim_source_map sources[] (label/url/excerpt/source_date) + the {claim, source_id} pairs --
NOT the prose -- and writes plans/task-draft/source_quality.json. This gate re-reads that
verdict and BLOCKS on 'unsound'.

ALONGSIDE (not replacing) factcheck: factcheck verifies ENTAILMENT (does this excerpt SUPPORT
this claim); a confidently-wrong but faithfully-cited source passes it. This gate verifies the
SOURCE is actually sound -- primary vs secondary, authority of origin, independent corroboration
among the OTHER cited sources. The "supported by this text" vs "the source is actually right"
distinction (factcheck stays a separate gate -- this is alongside, not a replacement).

SINGLE gate, NO --lang: the cited source SET is identical fr/en (stages/review.py enforces
source_id set-equality), and authority/primacy is a property of the SOURCE, not the citing
language.

Fail-closed (mirrors gate/editorial.py + factcheck._claim_from_dict's presence rule): BLOCKS on
an 'unsound' verdict, on a MISSING source_quality.json (the pass must have run), on an
unparseable/malformed verdict (parse_judge_findings RAISES), AND -- as a structural PRESENCE
backstop -- on any per-claim entry MISSING a required boolean (required_item_fields, so a
producer that drops `corroborated` cannot silently pass EVEN ON A 'sound' VERDICT: the parser
validates every item whenever item_key is set, before the verdict is consulted).

DESCRIPTIVE booleans (judge_passes is VERDICT-ONLY): primary=false/authoritative=true is a
legitimately sound SECONDARY source and PASSES -- the per-item booleans are NOT all()-ANDed
(that is factcheck's rule, off this substrate -- see judge.py). Only the judge's 'unsound'
verdict blocks.

Top-level import of ..gate.judge is safe: this module is loaded only via
`python3 -m pipeline.gate.source_quality` (a fresh process) or directly by tests, NEVER through
`import pipeline` (test_gate.py:test_import_pipeline_does_not_import_gate_modules covers it)
[MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..contracts.claim_source_map import ContractError
from .judge import judge_passes, parse_judge_findings

# The source-quality judge's verdict vocabulary -- distinct from factcheck's
# supported/unsupported, the editorial publishable/thin, argument's defensible/weak, and the
# editorial-REVIEW APPROVED/NEEDS_REVISION in review.py (never conflate the vocabularies).
SOURCE_QUALITY_VERDICTS = ("sound", "unsound")

# The per-claim structural PRESENCE backstop. The parser RAISES if any name is absent from an
# entry (a dropped boolean would otherwise read downstream as a falsy default); a present-but-
# FALSE value does NOT auto-fail -- judge_passes is verdict-only. `note` is informational, NOT
# required. Mirrors test_judge_substrate.py:_SQ_REQUIRED exactly.
SOURCE_QUALITY_REQUIRED_FIELDS = ("source_id", "primary", "authoritative", "corroborated")


def check_source_quality(findings_text: str) -> list[str]:
    """Pure combiner: parse source_quality.json -> problems (empty == sound/pass).

    Fail-closed: an unparseable/malformed verdict OR a per-claim entry missing a required
    boolean yields a problem (so the gate BLOCKs); an 'unsound' verdict yields a problem naming
    the verdict + reason, then enumerates each per-claim entry's descriptive booleans + note
    (informational, like editorial.py enumerates issues).
    """
    try:
        report = parse_judge_findings(
            findings_text,
            verdicts=SOURCE_QUALITY_VERDICTS,
            item_key="claims",
            required_item_fields=SOURCE_QUALITY_REQUIRED_FIELDS,
        )
    except ContractError as exc:
        return [f"invalid source-quality findings: {exc}"]
    if not judge_passes(report, pass_verdict="sound"):
        problems = [
            f"source-quality verdict is {report.verdict!r} (not 'sound'): {report.reason}"
        ]
        for claim in report.items:
            problems.append(
                f"  [{claim.get('source_id', '?')}] "
                f"primary={claim.get('primary')} "
                f"authoritative={claim.get('authoritative')} "
                f"corroborated={claim.get('corroborated')} -- {claim.get('note', '')}"
            )
        return problems
    return []


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.source_quality --run-dir <dir>      (NO --lang)
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path) -> int:
    findings_path = run_dir / "plans" / "task-draft" / "source_quality.json"
    try:
        findings_text = findings_path.read_text(encoding="utf-8")
    except OSError:
        print(
            "missing source_quality.json (task-draft) -- the source-quality pass did not run"
        )
        return 1
    problems = check_source_quality(findings_text)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.source_quality",
        description="G2 source-quality gate: BLOCK on an 'unsound' cited-source verdict.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "SOURCE_QUALITY_VERDICTS",
    "SOURCE_QUALITY_REQUIRED_FIELDS",
    "check_source_quality",
]

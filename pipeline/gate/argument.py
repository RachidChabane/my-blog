"""M-4 G1 ARGUMENT-RIGOR gate (writing-flow.md section 7 cadence; closes G1) -- single gate.

Built on the shared judge != author substrate (pipeline/gate/judge.py). A FRESH judge
(dispatched by pipeline/prompts/argue.py) steelmans the brief's thesis, mounts the
strongest attack, and reconciles, writing plans/task-argue/argument.json. This gate
re-reads that verdict and BLOCKS on 'weak'.

Single gate, NO --lang: the brief's claim_skeleton is language-neutral
(stages/select.py BriefMeta -- {id, statement, source_ids}, no lang field), so the
argument is judged once, before the bilingual draft is paid for.

Fail-closed (mirrors gate/factcheck.py): BLOCKS on a 'weak' verdict, on a MISSING
argument.json (the argue pass must have run), and on an unparseable/malformed verdict
(parse_judge_findings RAISES). VERDICT-ONLY: judge_passes keys on the verdict alone
(item_key=None; the schema carries no per-item list).

MANDATE BOUNDARY (keep G1 != G3): this judges the THESIS AS A CLAIM (true / defensible /
non-trivial). It does NOT judge the finished article's craft -- that is the editorial
gate (task 4). The prompt (prompts/argue.py) is written to that distinction.

Top-level import of ..gate.judge is safe: this module is loaded only via
`python3 -m pipeline.gate.argument` (a fresh process) or directly by tests, NEVER through
`import pipeline` (the wildcard guard test_gate.py:test_import_pipeline_does_not_import_gate_modules
covers it) [MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..contracts.claim_source_map import ContractError
from .judge import judge_passes, parse_judge_findings

# The argument judge's verdict vocabulary -- distinct from factcheck's
# supported/unsupported and the editorial APPROVED/NEEDS_REVISION (never conflate).
ARGUMENT_VERDICTS = ("defensible", "weak")


def check_argument(findings_text: str) -> list[str]:
    """Pure combiner: parse argument.json -> problems (empty == defensible/pass).

    Fail-closed: an unparseable/malformed verdict yields a problem (so the gate BLOCKs);
    a 'weak' verdict yields a problem naming the verdict + reason.
    """
    try:
        report = parse_judge_findings(
            findings_text, verdicts=ARGUMENT_VERDICTS, item_key=None
        )
    except ContractError as exc:
        return [f"invalid argument findings: {exc}"]
    if not judge_passes(report, pass_verdict="defensible"):
        return [
            f"argument verdict is {report.verdict!r} (not 'defensible'): {report.reason}"
        ]
    return []


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.argument --run-dir <dir>      (NO --lang)
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path) -> int:
    findings_path = run_dir / "plans" / "task-argue" / "argument.json"
    try:
        findings_text = findings_path.read_text(encoding="utf-8")
    except OSError:
        print(
            "missing argument.json (task-argue) -- the argument-rigor pass did not run"
        )
        return 1
    problems = check_argument(findings_text)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.argument",
        description="G1 argument-rigor gate: BLOCK on a 'weak' thesis verdict.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["ARGUMENT_VERDICTS", "check_argument"]

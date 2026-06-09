"""G3 EDITORIAL-QUALITY gate (writing-rigor task 4; closes G3) -- single gate.

Built on the shared judge != author substrate (pipeline/gate/judge.py). A FRESH editorial
judge (dispatched by pipeline/prompts/draft.py via build_judge_dispatch) reads the brief's
angle/outline + the EN draft as the FINISHED ARTICLE and writes
plans/task-draft/editorial.json. This gate re-reads that verdict and BLOCKS on 'thin'.

POST-DRAFT (unlike G1 argue, which is pre-draft): piece-craft -- structure, whether the
finished article earns its length -- needs the realized piece. SINGLE gate, NO --lang:
judged on the EN draft as the CANONICAL REALIZATION of the shared argument. FR/EN
STRUCTURAL parity rests on review.py's source_id set-equality + the parallel-output house
rule, NOT on this gate (an honest, named live-only-style caveat that avoids fr/en
inflation).

Fail-closed (mirrors gate/argument.py): BLOCKS on a 'thin' verdict, on a MISSING
editorial.json (the editorial pass must have run), and on an unparseable/malformed verdict
(parse_judge_findings RAISES). VERDICT-ONLY: judge_passes keys on the verdict alone
(item_key=None); 'issues' is an informational list read tolerantly from report.data.

MANDATE BOUNDARY (keep G3 != G1): this judges the FINISHED ARTICLE AS AN ARTICLE
(non-obvious / well-built / earns its length / sound structure). G1 (gate/argument.py)
judged the THESIS AS A CLAIM. The prompt (prompts/draft.py:_editorial_section) is written
to that distinction. Distinct too from review.py's editorial-REVIEW self-gate
(APPROVED/NEEDS_REVISION coverage check) -- never conflate the vocabularies.

Top-level import of ..gate.judge is safe: this module is loaded only via
`python3 -m pipeline.gate.editorial` (a fresh process) or directly by tests, NEVER through
`import pipeline` (test_gate.py:test_import_pipeline_does_not_import_gate_modules covers it)
[MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..contracts.claim_source_map import ContractError
from .judge import judge_passes, parse_judge_findings

# The editorial judge's verdict vocabulary -- distinct from argument's defensible/weak, the
# editorial-REVIEW APPROVED/NEEDS_REVISION in review.py, factcheck's supported/unsupported,
# and style's clean/.../revision_needed (never conflate the vocabularies).
EDITORIAL_VERDICTS = ("publishable", "thin")


def check_editorial(findings_text: str) -> list[str]:
    """Pure combiner: parse editorial.json -> problems (empty == publishable/pass).

    Fail-closed: an unparseable/malformed verdict yields a problem (so the gate BLOCKs); a
    'thin' verdict yields a problem naming the verdict + reason, then enumerates each issue
    dimension (informational; read tolerantly from report.data like style.py).
    """
    try:
        report = parse_judge_findings(
            findings_text, verdicts=EDITORIAL_VERDICTS, item_key=None
        )
    except ContractError as exc:
        return [f"invalid editorial findings: {exc}"]
    if not judge_passes(report, pass_verdict="publishable"):
        problems = [
            f"editorial verdict is {report.verdict!r} (not 'publishable'): {report.reason}"
        ]
        for issue in report.data.get("issues") or []:
            if isinstance(issue, dict):
                problems.append(
                    f"  [{issue.get('dimension', '?')}] {issue.get('note', '')}"
                )
        return problems
    return []


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.editorial --run-dir <dir>      (NO --lang)
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path) -> int:
    findings_path = run_dir / "plans" / "task-draft" / "editorial.json"
    try:
        findings_text = findings_path.read_text(encoding="utf-8")
    except OSError:
        print(
            "missing editorial.json (task-draft) -- the editorial-quality pass did not run"
        )
        return 1
    problems = check_editorial(findings_text)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.editorial",
        description="G3 editorial-quality gate: BLOCK on a 'thin' finished-article verdict.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["EDITORIAL_VERDICTS", "check_editorial"]

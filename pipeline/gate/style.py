"""M-4 STYLE gate (FR-C3 / FR-C2, writing-flow.md section 4.3) -- per language.

Reuses the deterministic ``humanize`` helpers (auditor != editor stays intact): the
no-emoji hard rule (``house_style_violations``, D-007) plus a re-check of the
``style-auditor`` verdict (``parse_style_findings`` / ``style_passes`` -- only 'clean'
passes). BLOCKs on any emoji, an unparseable/absent findings file, or a non-clean
verdict.

Top-level import of ``..stages.humanize`` is safe here: ``humanize`` is never executed
as ``__main__`` in the gate process, and this module is imported only via
``python3 -m pipeline.gate.style`` (a fresh process) or directly by the tests -- never
through ``import pipeline`` [MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..contracts.claim_source_map import ContractError
from ..stages.humanize import house_style_violations, parse_style_findings, style_passes


def check_style(body_text: str, style_findings_text: str, lang: str) -> list[str]:
    """Return a list of style problems (empty == clean). Pure combiner of the
    no-emoji scan over the body and the style-auditor verdict re-check."""
    problems = list(house_style_violations(body_text))  # no-emoji (D-007)
    try:
        report = parse_style_findings(style_findings_text)
    except ContractError as exc:
        problems.append(f"{lang}: invalid style findings: {exc}")
        return problems
    if not style_passes(report):
        problems.append(f"{lang}: style verdict is {report.verdict!r} (not 'clean')")
        for issue in report.issues:
            problems.append(f"  [{issue.pattern}] {issue.phrase}")
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.style --run-dir <dir> --lang {fr,en}
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path, lang: str) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    problems: list[str] = []

    try:
        body_text: str | None = (draft_dir / f"draft-{lang}.md").read_text(
            encoding="utf-8"
        )
    except OSError as exc:
        problems.append(f"{lang}: cannot read draft-{lang}.md: {exc}")
        body_text = None
    try:
        style_text: str | None = (draft_dir / f"style-{lang}.json").read_text(
            encoding="utf-8"
        )
    except OSError:
        style_text = None

    if body_text is not None and style_text is not None:
        problems.extend(check_style(body_text, style_text, lang))
    else:
        # Degraded path: still run the no-emoji scan over whatever body we have, and
        # name the missing findings file (the humanize pass must have run).
        if body_text is not None:
            problems.extend(house_style_violations(body_text))
        if style_text is None:
            problems.append(
                f"{lang}: missing style findings (style-{lang}.json) -- "
                "the humanize pass did not run"
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
        prog="pipeline.gate.style",
        description="M-4 style gate (FR-C3): no-emoji + style-auditor 'clean' re-check.",
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["check_style"]

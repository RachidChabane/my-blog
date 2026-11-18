"""M-4 STYLE gate (FR-C3 / FR-C2, writing-flow.md section 4.3) -- per language.

Reuses the deterministic ``humanize`` helpers (judge != editor stays intact): the
no-emoji + no-em-dash hard rules (``house_style_violations``, D-007), the FR-diacritics
hard rule for ``--lang fr`` (``fr_diacritic_violations``, D-007), the voice rules, plus
a re-check of the reader-judge verdict (``style_findings_problems`` -- only 'clean'
passes; the radar publish stage re-checks through the same function). BLOCKs on any
emoji, any em-dash, a deaccented French word, an unparseable/absent findings file, or a
non-clean verdict.

Top-level import of ``..stages.humanize`` is safe here: ``humanize`` is never executed
as ``__main__`` in the gate process, and this module is imported only via
``python3 -m pipeline.gate.style`` (a fresh process) or directly by the tests -- never
through ``import pipeline`` [MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..stages.humanize import (
    fr_diacritic_violations,
    house_style_violations,
    style_findings_problems,
)
from ..voice.rules import (
    REPO_ROOT,
    content_dir,
    split_frontmatter,
    voice_violations,
    worn_headings,
)

ARTICLES_COLLECTION = "articles"


def _deterministic_problems(text: str, lang: str, worn: frozenset[str]) -> list[str]:
    """The scans that need no findings file: no-emoji + no-em-dash (D-007), FR
    diacritics (fr only), and the voice rules over the draft's title and body."""
    problems = list(house_style_violations(text))
    if lang == "fr":
        problems.extend(fr_diacritic_violations(text))
    title, body = split_frontmatter(text)
    problems.extend(voice_violations(title=title, body=body, worn=worn))
    return problems


def check_style(
    body_text: str,
    style_findings_text: str,
    lang: str,
    worn: frozenset[str] = frozenset(),
) -> list[str]:
    """Return a list of style problems (empty == clean). Combines the deterministic
    scans over the draft (``_deterministic_problems``) and the reader-judge verdict
    re-check. ``worn`` is the set of headings worn out by recent publications."""
    problems = _deterministic_problems(body_text, lang, worn)
    problems.extend(style_findings_problems(style_findings_text, lang))
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.style --run-dir <dir> --lang {fr,en} [--repo-root <dir>]
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path, lang: str, repo_root: Path = REPO_ROOT) -> int:
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

    worn = worn_headings(content_dir(repo_root, ARTICLES_COLLECTION), lang)
    if body_text is not None and style_text is not None:
        problems.extend(check_style(body_text, style_text, lang, worn))
    else:
        # Degraded path: still run the deterministic scans over whatever body we have,
        # and name the missing findings file (the humanize pass must have run).
        if body_text is not None:
            problems.extend(_deterministic_problems(body_text, lang, worn))
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
        description=(
            "M-4 style gate (FR-C3): no-emoji + no-em-dash (+ FR diacritics for "
            "--lang fr) + voice rules + reader-judge 'clean' re-check."
        ),
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    parser.add_argument("--lang", required=True, choices=["fr", "en"])
    parser.add_argument(
        "--repo-root",
        default=str(REPO_ROOT),
        help="repository root holding src/content/articles (default: derived from this module)",
    )
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir), args.lang, Path(args.repo_root))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["check_style"]

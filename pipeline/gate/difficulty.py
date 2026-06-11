"""M-4 DIFFICULTY gate -- the 1-5 rubric rating is present, in range, and fr/en-paired.

Deterministic only (no judge): the MEANING of each level is pinned by the versioned
rubric (pipeline/difficulty_rubric.md) the draft prompt injects every run; this gate
enforces the closed range + parity so an unrated or drifting pair can never publish.
SINGLE gate, NO --lang: parity is a property of the PAIR, so both drafts are read at
once (mirrors editorial/source_quality's no-lang shape -- the golden bank extends the
empty ``args: []`` tail).

Top-level import of ``..stages.draft`` is safe here: ``draft`` is never executed as
``__main__`` in the gate process; this module is imported only via
``python3 -m pipeline.gate.difficulty`` (a fresh process) or directly by the tests --
never through ``import pipeline`` [MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path

from ..stages.draft import VALID_DIFFICULTIES, DraftDoc


def check_difficulty(fr_text: str, en_text: str) -> list[str]:
    """Return difficulty problems for the pair (empty == clean): each draft carries an
    integer 1-5 ``difficulty`` frontmatter key, and fr == en (one rating per article)."""
    problems: list[str] = []
    fr = DraftDoc.parse(fr_text)
    en = DraftDoc.parse(en_text)
    for slot, doc in (("fr", fr), ("en", en)):
        if doc.difficulty not in VALID_DIFFICULTIES:
            problems.append(
                f"draft-{slot}: difficulty must be an integer 1-5 rated against "
                f"pipeline/difficulty_rubric.md (got {doc.difficulty!r})"
            )
    if (
        fr.difficulty in VALID_DIFFICULTIES
        and en.difficulty in VALID_DIFFICULTIES
        and fr.difficulty != en.difficulty
    ):
        problems.append(
            f"difficulty parity: fr {fr.difficulty!r} != en {en.difficulty!r} "
            "(fr/en are the same article and must carry one rubric rating)"
        )
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.difficulty --run-dir <dir>
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path) -> int:
    draft_dir = run_dir / "plans" / "task-draft"
    problems: list[str] = []
    texts: dict[str, str | None] = {}
    for slot in ("fr", "en"):
        try:
            texts[slot] = (draft_dir / f"draft-{slot}.md").read_text(encoding="utf-8")
        except OSError as exc:
            problems.append(f"draft-{slot}: cannot read draft-{slot}.md: {exc}")
            texts[slot] = None
    if texts["fr"] is not None and texts["en"] is not None:
        problems.extend(check_difficulty(texts["fr"], texts["en"]))

    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.difficulty",
        description=(
            "M-4 difficulty gate: both drafts carry an integer 1-5 rubric rating "
            "(pipeline/difficulty_rubric.md) and fr == en."
        ),
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["check_difficulty"]

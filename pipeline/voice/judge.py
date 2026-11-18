"""The reader judge: a fresh sub-agent that reads a draft as a blog reader would.

The judge tunes its ear on the human-written reference posts (``references.py``), then
answers one question about the draft: would a regular reader of those blogs take this for
a person writing about something they worked through? It never checks facts or citations;
those have their own gates. Its findings file keeps the shape ``stages/humanize.py``
parses (``verdict`` + ``issues[]``), and only ``clean`` passes.

``build_reader_judge_dispatch`` renders the prompt block (pure, ASCII-only);
``reader_verdict_problems`` reads a findings file and delegates to
``style_findings_problems``, the one blocking re-check the essay style gate and the radar
publish stage share.
"""

from __future__ import annotations

from pathlib import Path

from ..gate.judge import build_judge_dispatch
from ..stages.humanize import style_findings_problems
from .references import REFERENCES_MIN_READ, references_dir

READER_JUDGE_ROLE = "reader judge"
READER_JUDGE_MAX_ISSUES = 8
READER_VERDICT_SCHEMA = (
    '{"verdict": "clean"|"revision_needed", "issues": [{"phrase": "<the passage, '
    'quoted from the text>", "pattern": "<what gives it away, in a few words>", '
    '"why_ai": "<why a reader stops believing a person wrote it>", "suggested_fix": '
    '"<what to change, described; not replacement wording>"}], "summary": "..."}'
)


def build_reader_judge_dispatch(
    *, repo_root: Path, text_desc: str, out_path: Path, lang: str
) -> str:
    """The dispatch block for one language's reader judge (nests under a numbered step)."""
    repo_root = Path(repo_root)
    house_style = repo_root / "pipeline" / "house_style.md"
    refs = references_dir(repo_root) / lang
    dispatch = build_judge_dispatch(
        role=READER_JUDGE_ROLE,
        inputs_desc=(
            f"{text_desc}, the house style at {house_style}, and the reference posts "
            f"under {refs}"
        ),
        out_path=out_path,
        verdict_schema=READER_VERDICT_SCHEMA,
        excludes=(
            "the brief, the claim->source map, the other language, earlier findings, or "
            "the fact that you authored this"
        ),
    )
    return (
        dispatch
        + f"   - The judge first reads at least {REFERENCES_MIN_READ} reference posts in\n"
        f"     {refs}\n"
        "     (personal engineering blogs, written by people) to tune its ear, then reads\n"
        "     the text once, straight through, the way a subscriber would.\n"
        "   - It answers ONE question: would a regular reader of those blogs take this\n"
        "     for a person writing about something they worked through, or for generated\n"
        "     text? It does NOT check facts, citations, or the argument.\n"
        "   - It quotes each passage where the answer tips to 'generated' (a title that\n"
        "     reads like a headline feed, a sentence shape that keeps coming back, a\n"
        "     paragraph that relays a source in the source's order, a stance announced\n"
        "     instead of taken, a section that exists because sections like it always\n"
        "     exist, French that follows English word order), most damaging first, at\n"
        f"     most {READER_JUDGE_MAX_ISSUES}. It reports what it noticed while reading,\n"
        "     not a checklist: 'clean' with no issues is a normal outcome, and a flag it\n"
        "     would not defend to the author is left out.\n"
        '   - verdict is "revision_needed" if and only if issues is non-empty.\n'
    )


def reader_verdict_problems(findings_path: Path, lang: str) -> list[str]:
    """Problems for one language's reader-judge findings file (empty == clean)."""
    try:
        text = Path(findings_path).read_text(encoding="utf-8")
    except OSError:
        return [
            f"{lang}: missing reader-judge findings ({Path(findings_path).name}) -- "
            "the reader judge did not run"
        ]
    return style_findings_problems(text, lang)


__all__ = [
    "READER_JUDGE_ROLE",
    "READER_VERDICT_SCHEMA",
    "build_reader_judge_dispatch",
    "reader_verdict_problems",
]

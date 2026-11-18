"""Journal draft: the author-time file of one language (pure parsing, no I/O)."""

from __future__ import annotations

from dataclasses import dataclass

from ..contracts.published import parse_frontmatter, source_item_problems
from .constants import (
    KEY_SLUG,
    KEY_SOURCES,
    KEY_SUMMARY,
    KEY_TAGS,
    KEY_TITLE,
    REQUIRED_TEXT_KEYS,
)

DRAFT_TEMPLATE = (
    "---\n"
    f'{KEY_TITLE}: ""\n'
    f'{KEY_SLUG}: ""\n'
    f'{KEY_SUMMARY}: ""\n'
    f"{KEY_TAGS}: []\n"
    f"{KEY_SOURCES}: []\n"
    "---\n\n"
)


@dataclass(frozen=True)
class Draft:
    """One language of a journal draft, structurally valid."""

    title: str
    slug: str
    summary: str
    tags: tuple[str, ...]
    sources: tuple[dict, ...]
    body: str


def _text_problems(meta: dict) -> list[str]:
    problems: list[str] = []
    for key in REQUIRED_TEXT_KEYS:
        value = meta.get(key)
        if not (isinstance(value, str) and value.strip()):
            problems.append(f"{key} must be a non-empty string")
    return problems


def _tag_problems(tags: object) -> list[str]:
    if isinstance(tags, list) and all(isinstance(t, str) and t.strip() for t in tags):
        return []
    return [f"{KEY_TAGS} must be a list of non-empty tag ids"]


def _source_list_problems(sources: object) -> list[str]:
    if not isinstance(sources, list):
        return [f"{KEY_SOURCES} must be a list"]
    return source_item_problems(sources)


def parse_draft(text: str) -> tuple[Draft | None, list[str]]:
    """Parse one draft file: the ``Draft`` and no problems, or ``None`` and the problems."""
    try:
        meta, body = parse_frontmatter(text)
    except ValueError as exc:
        return None, [f"frontmatter: {exc}"]
    tags = meta.get(KEY_TAGS) or []
    sources = meta.get(KEY_SOURCES) or []
    problems = [
        *_text_problems(meta),
        *_tag_problems(tags),
        *_source_list_problems(sources),
    ]
    if not body.strip():
        problems.append("body must not be empty")
    if problems:
        return None, problems
    return (
        Draft(
            title=meta[KEY_TITLE].strip(),
            slug=meta[KEY_SLUG].strip(),
            summary=meta[KEY_SUMMARY].strip(),
            tags=tuple(t.strip() for t in tags),
            sources=tuple(dict(s) for s in sources),
            body=body.strip(),
        ),
        [],
    )

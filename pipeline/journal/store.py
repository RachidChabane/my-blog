"""Journal file system edge: published index, tag vocabulary, projection and writes."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import yaml

from ..contracts.published import DDMMYYYY_RE, parse_frontmatter
from ..stages.publish import content_hash
from .constants import (
    DATE_FORMAT,
    DRAFT_FILENAME,
    DRAFTS_REL,
    GITIGNORE_ENTRY,
    GITIGNORE_NAME,
    JOURNAL_REL,
    KEY_CONTENT_HASH,
    KEY_LANG,
    KEY_PUBLISH_DATE,
    KEY_PUBLISH_STATE,
    KEY_SLUG,
    KEY_SOURCES,
    KEY_SUMMARY,
    KEY_TAGS,
    KEY_TITLE,
    KEY_TRANSLATION_KEY,
    LANGS,
    PUBLISH_STATE_PUBLISHED,
    PUBLISHED_FILENAME,
    PUBLISHED_SUFFIX,
    TAG_ID_KEY,
    TAGS_INDEX_REL,
)
from .draft import Draft


@dataclass(frozen=True)
class PublishedPiece:
    path: Path
    translation_key: str
    lang: str
    slug: str
    publish_date: str


def draft_dir(repo_root: Path, translation_key: str) -> Path:
    return repo_root / DRAFTS_REL / translation_key


def read_draft_texts(repo_root: Path, translation_key: str) -> dict[str, str | None]:
    """Raw text of each language's draft file, ``None`` when the file is missing."""
    directory = draft_dir(repo_root, translation_key)
    texts: dict[str, str | None] = {}
    for lang in LANGS:
        path = directory / DRAFT_FILENAME.format(lang=lang)
        texts[lang] = path.read_text(encoding="utf-8") if path.is_file() else None
    return texts


def list_draft_keys(repo_root: Path) -> list[str]:
    root = repo_root / DRAFTS_REL
    return sorted(p.name for p in root.iterdir() if p.is_dir()) if root.is_dir() else []


def load_tag_ids(repo_root: Path) -> frozenset[str]:
    path = repo_root / TAGS_INDEX_REL
    if not path.is_file():
        return frozenset()
    entries = json.loads(path.read_text(encoding="utf-8"))
    return frozenset(e[TAG_ID_KEY] for e in entries if isinstance(e, dict) and TAG_ID_KEY in e)


def load_published(repo_root: Path) -> list[PublishedPiece]:
    """Every published journal piece whose frontmatter is readable."""
    pieces: list[PublishedPiece] = []
    for path in sorted((repo_root / JOURNAL_REL).glob(f"*{PUBLISHED_SUFFIX}")):
        try:
            meta, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        except ValueError:
            continue
        pieces.append(
            PublishedPiece(
                path=path,
                translation_key=str(meta.get(KEY_TRANSLATION_KEY, "")),
                lang=str(meta.get(KEY_LANG, "")),
                slug=str(meta.get(KEY_SLUG, "")),
                publish_date=str(meta.get(KEY_PUBLISH_DATE, "")),
            )
        )
    return pieces


def pieces_of(published: list[PublishedPiece], translation_key: str) -> list[PublishedPiece]:
    return [p for p in published if p.translation_key == translation_key]


def existing_publish_date(published: list[PublishedPiece], translation_key: str) -> str | None:
    """The recorded date of an already published piece (either language), if any."""
    for piece in pieces_of(published, translation_key):
        if DDMMYYYY_RE.match(piece.publish_date):
            return piece.publish_date
    return None


def is_real_date(value: str) -> bool:
    try:
        datetime.strptime(value, DATE_FORMAT)
    except ValueError:
        return False
    return bool(DDMMYYYY_RE.match(value))


def render_published(translation_key: str, lang: str, draft: Draft, publish_date: str) -> str:
    """Published file text; keys in the order the site schema documents."""
    frontmatter = {
        KEY_TRANSLATION_KEY: translation_key,
        KEY_LANG: lang,
        KEY_SLUG: draft.slug,
        KEY_TITLE: draft.title,
        KEY_PUBLISH_DATE: publish_date,
        KEY_SUMMARY: draft.summary,
        KEY_TAGS: list(draft.tags),
        KEY_SOURCES: [dict(s) for s in draft.sources],
        KEY_CONTENT_HASH: content_hash(translation_key, lang, draft.body),
        KEY_PUBLISH_STATE: PUBLISH_STATE_PUBLISHED,
    }
    fence = yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=True)
    return f"---\n{fence}---\n\n{draft.body}\n"


def published_path(repo_root: Path, slug: str, lang: str) -> Path:
    return repo_root / JOURNAL_REL / PUBLISHED_FILENAME.format(slug=slug, lang=lang)


def write_all_or_nothing(texts_by_path: dict[Path, str], stale: list[Path]) -> None:
    """Stage every file next to its target, then swap them in; drop superseded files last."""
    staged: dict[Path, Path] = {}
    try:
        for path, text in texts_by_path.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_name(f".{path.name}.tmp")
            tmp.write_text(text, encoding="utf-8")
            staged[path] = tmp
    except OSError:
        for tmp in staged.values():
            tmp.unlink(missing_ok=True)
        raise
    for path, tmp in staged.items():
        os.replace(tmp, path)
    for path in stale:
        if path not in texts_by_path:
            path.unlink(missing_ok=True)


def ensure_drafts_ignored(repo_root: Path) -> bool:
    """Add the drafts entry to ``.gitignore`` when absent; True when the file changed."""
    path = repo_root / GITIGNORE_NAME
    current = path.read_text(encoding="utf-8") if path.is_file() else ""
    if GITIGNORE_ENTRY in (line.strip() for line in current.splitlines()):
        return False
    separator = "" if not current or current.endswith("\n") else "\n"
    path.write_text(f"{current}{separator}{GITIGNORE_ENTRY}\n", encoding="utf-8")
    return True

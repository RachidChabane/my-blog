"""Named literals of the journal format (paths, keys, verbs)."""

from __future__ import annotations

import re
from pathlib import Path

LANGS = ("fr", "en")
JOURNAL_REL = Path("src") / "content" / "journal"
TAGS_INDEX_REL = Path("src") / "content" / "tags" / "index.json"
DRAFTS_REL = Path("drafts") / "journal"
GITIGNORE_NAME = ".gitignore"
GITIGNORE_ENTRY = "drafts/"
DRAFT_FILENAME = "{lang}.md"
PUBLISHED_FILENAME = "{slug}.{lang}.md"
PUBLISHED_SUFFIX = ".md"
DATE_FORMAT = "%d-%m-%Y"

KEY_TRANSLATION_KEY = "translationKey"
KEY_LANG = "lang"
KEY_SLUG = "slug"
KEY_TITLE = "title"
KEY_PUBLISH_DATE = "publishDate"
KEY_SUMMARY = "summary"
KEY_TAGS = "tags"
KEY_SOURCES = "sources"
KEY_CONTENT_HASH = "contentHash"
KEY_PUBLISH_STATE = "publishState"
PUBLISH_STATE_PUBLISHED = "published"
TAG_ID_KEY = "id"
SOURCE_URL_KEY = "url"
REQUIRED_TEXT_KEYS = (KEY_TITLE, KEY_SLUG, KEY_SUMMARY)

KEBAB_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
H2_LINE_RE = re.compile(r"^## ", re.MULTILINE)

VERB_NEW = "new"
VERB_CHECK = "check"
VERB_PUBLISH = "publish"
VERB_STATUS = "status"

EXIT_OK = 0
EXIT_PROBLEMS = 1
OK_LINE = "OK"

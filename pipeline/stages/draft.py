"""Draft stage — structural validity of the FR+EN draft outputs (the first self-gate).

The draft agent (prompt: ``pipeline/prompts/draft.py``) reads ``brief.md`` + the house
style and writes ``plans/task-draft/{draft-fr.md,draft-en.md,claim_source_map.json}``
as PARALLEL outputs of one topic+sources (writing-flow.md section 6, NFR-11). This
module owns the deterministic structural checks the agent shells out to and that task
26's blocking gate reuses: frontmatter completeness, the FR/EN ``translationKey``
parity join, and (via the pinned contract) the claim->source map's integrity.

The draft frontmatter carries the AUTHOR-TIME subset
``{lang, translationKey, slug, title, tags}`` of ``src/content/schemas.ts``
``articleFrontmatterSchema``; ``publishDate`` / ``contentHash`` / ``publishState`` and
the ``sources[]`` projection are publish-time concerns (task 27).

The leading-fence parser is a deliberate small duplication of ``select._FRONTMATTER_RE``
/ ``select._parse_frontmatter`` (kept local so task-24-tested code is untouched; same
anchored, non-greedy shape so a ``---`` rule inside the body is not mis-parsed).
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import yaml

from ..contracts.claim_source_map import ClaimSourceMap, ContractError

REQUIRED_FRONTMATTER = ("lang", "translationKey", "slug", "title", "tags", "category")

# The 3-way article taxonomy (single-valued `category` field, distinct from free-form
# `tags`). Display/grouping order: essays, then explainers, then briefings.
VALID_CATEGORIES = ("essays", "explainers", "briefings")

# Leading frontmatter fence only: anchored at start, non-greedy body so the FIRST
# closing `---` line ends it (markdown bodies contain `---` rules). A deliberate small
# duplication of select._FRONTMATTER_RE (see module docstring) — kept local so the
# task-24-tested select module is untouched.
_FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)


def _parse_frontmatter(text: str) -> dict:
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return {}
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return {}
    return data if isinstance(data, dict) else {}


def _strip_frontmatter(text: str) -> str:
    """Everything after the leading frontmatter fence (the body)."""
    match = _FRONTMATTER_RE.match(text)
    return text[match.end() :] if match else text


def _str_field(value: object) -> str:
    """Coerce a frontmatter value to ``str`` (None / non-str => '' so validate flags it)."""
    return value if isinstance(value, str) else ""


@dataclass(frozen=True)
class DraftDoc:
    """One language's draft: author-time frontmatter + the markdown body."""

    lang: str
    translation_key: str
    slug: str
    title: str
    tags: list[str]
    body: str
    category: str = ""

    def validate(self) -> list[str]:
        """Return structural problems (empty == valid)."""
        problems: list[str] = []
        if self.lang not in ("fr", "en"):
            problems.append(f"lang must be 'fr' or 'en' (got {self.lang!r})")
        if not self.translation_key.strip():
            problems.append("translationKey must be a non-empty string")
        if not self.slug.strip():
            problems.append("slug must be a non-empty string")
        if not self.title.strip():
            problems.append("title must be a non-empty string")
        if not isinstance(self.tags, list) or not self.tags:
            problems.append("tags must be a non-empty list")
        else:
            for i, tag in enumerate(self.tags):
                if not (isinstance(tag, str) and tag.strip()):
                    problems.append(f"tags[{i}] must be a non-empty string")
        if not self.body.strip():
            problems.append("body must be non-empty")
        if self.category not in VALID_CATEGORIES:
            problems.append(
                f"category must be one of {list(VALID_CATEGORIES)} (got {self.category!r})"
            )
        return problems

    @classmethod
    def parse(cls, text: str) -> DraftDoc:
        """Split the leading frontmatter fence from the body into a ``DraftDoc``."""
        fm = _parse_frontmatter(text)
        tags = fm.get("tags")
        return cls(
            lang=_str_field(fm.get("lang")),
            translation_key=_str_field(fm.get("translationKey")),
            slug=_str_field(fm.get("slug")),
            title=_str_field(fm.get("title")),
            tags=tags if isinstance(tags, list) else [],
            body=_strip_frontmatter(text),
            category=_str_field(fm.get("category")),
        )


def validate_draft_pair(fr_text: str, en_text: str) -> list[str]:
    """Validate both drafts + the FR/EN ``translationKey`` parity (NFR-11).

    Aggregates per-doc problems (prefixed by slot), asserts each doc's ``lang`` matches
    its slot, and flags a ``translationKey`` mismatch across the pair.
    """
    problems: list[str] = []
    fr = DraftDoc.parse(fr_text)
    en = DraftDoc.parse(en_text)
    for slot, doc, expected_lang in (("fr", fr, "fr"), ("en", en, "en")):
        problems.extend(f"draft-{slot}: {p}" for p in doc.validate())
        if doc.lang != expected_lang:
            problems.append(
                f"draft-{slot}: lang must be {expected_lang!r} (got {doc.lang!r})"
            )
    if fr.translation_key != en.translation_key:
        problems.append(
            "translationKey parity (NFR-11): fr "
            f"{fr.translation_key!r} != en {en.translation_key!r}"
        )
    if fr.category != en.category:
        problems.append(
            "category parity: fr "
            f"{fr.category!r} != en {en.category!r} "
            "(fr/en are the same article and must share one category bucket)"
        )
    return problems


def validate_draft_run(run_dir: Path) -> list[str]:
    """Read + validate the three draft artifacts under ``run_dir/plans/task-draft/``.

    A missing/unreadable file yields one problem; an invalid ``claim_source_map.json``
    surfaces its contract error. Returns the aggregated problem list (empty == valid).
    """
    draft_dir = Path(run_dir) / "plans" / "task-draft"
    problems: list[str] = []
    texts: dict[str, str | None] = {}
    for slot in ("fr", "en"):
        path = draft_dir / f"draft-{slot}.md"
        try:
            texts[slot] = path.read_text(encoding="utf-8")
        except OSError as exc:
            problems.append(f"draft-{slot}.md: {exc}")
            texts[slot] = None
    if texts["fr"] is not None and texts["en"] is not None:
        problems.extend(validate_draft_pair(texts["fr"], texts["en"]))
    try:
        ClaimSourceMap.load_path(draft_dir / "claim_source_map.json").validate()
    except (ContractError, OSError) as exc:
        problems.append(f"claim_source_map.json: {exc}")
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.draft validate --run-dir <abs>
# ---------------------------------------------------------------------------


def _cmd_validate(args) -> int:
    problems = validate_draft_run(Path(args.run_dir))
    if problems:
        for problem in problems:
            print(problem)
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.draft",
        description="Draft-stage validation: frontmatter + FR/EN parity + claim map.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_validate = sub.add_parser("validate", help="validate the draft artifacts in a run dir")
    p_validate.add_argument("--run-dir", required=True, help="absolute run dir")
    args = parser.parse_args(argv)
    return _cmd_validate(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "REQUIRED_FRONTMATTER",
    "VALID_CATEGORIES",
    "DraftDoc",
    "validate_draft_pair",
    "validate_draft_run",
]

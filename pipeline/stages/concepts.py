"""Concepts stage -- the knowledge-graph store the publish step appends to daily.

The interactive knowledge-graph page (``/[lang]/graph/``) renders from ONE canonical
store: ``src/content/concepts/index.json`` (the ``concepts`` content collection; Zod
schema ``conceptSchema`` in ``src/content/schemas.ts``). Each record is a concept with
a bilingual label + definition, a theme (cluster), aliases, typed ``related`` edges,
and the citing article ``translationKey``s (citations are first-class in the graph).

CONSISTENCY CONTRACT: definitions are CANONICAL and WRITE-ONCE. ``add`` refuses an
existing id; ``link`` only appends an article citation. A definition is written the
day its concept first appears and is never regenerated on later runs -- the graph
shows one stable definition per concept, not a drifting paraphrase per mention.

The publish prompt drives this CLI after the article write: ``list`` to see what
exists (REUSE aggressively -- aliases count as the same concept), ``link`` per
existing concept the new article mentions, ``add`` per genuinely-new concept. The
store is committed by the publish task's ``git add -A`` commit, so the next deploy
rebuilds the graph page with the day's concepts folded in (the daily reindex).

Deterministic + offline; the store is kept sorted by id with a stable JSON shape
(the file is prettier-ignored; this module owns its formatting). Mirrors the
import-light stages convention [MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

CONCEPTS_REL = "src/content/concepts/index.json"  # store path under repo_root

# Mirrors CONCEPT_THEMES in src/content/schemas.ts (the Zod side of this contract).
VALID_THEMES = ("agentic-ai", "ml-fundamentals", "infra-tooling", "evals-quality")

_ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
_DDMMYYYY_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")
_EM_DASH = "—"


class ConceptError(ValueError):
    """A malformed store / record, or a contract violation (duplicate add, unknown link)."""


def _no_style_violations(text: str, where: str) -> list[str]:
    """The store is rendered verbatim on a public page: no em-dash (the standing owner
    directive) and no emoji (INV-9) in any label/definition/alias."""
    problems: list[str] = []
    if _EM_DASH in text:
        problems.append(f"{where}: em-dash (U+2014) is banned site-wide")
    if any(unicodedata.category(ch) == "So" for ch in text):
        problems.append(f"{where}: pictographic symbol (emoji-class) is banned (INV-9)")
    return problems


@dataclass
class Concept:
    id: str
    label: dict[str, str]
    definition: dict[str, str]
    theme: str
    articles: list[str]
    added_on: str
    aliases: list[str] = field(default_factory=list)
    related: list[str] = field(default_factory=list)

    def validate(self) -> list[str]:
        problems: list[str] = []
        if not _ID_RE.match(self.id):
            problems.append(f"{self.id!r}: id must be a kebab-case slug")
        for fld, mapping in (("label", self.label), ("definition", self.definition)):
            if not isinstance(mapping, dict) or set(mapping) != {"fr", "en"}:
                problems.append(f"{self.id}: {fld} must carry exactly {{fr, en}}")
                continue
            for lang, value in mapping.items():
                if not (isinstance(value, str) and value.strip()):
                    problems.append(f"{self.id}: {fld}.{lang} must be non-empty")
                else:
                    problems.extend(_no_style_violations(value, f"{self.id}: {fld}.{lang}"))
        if self.theme not in VALID_THEMES:
            problems.append(
                f"{self.id}: theme must be one of {list(VALID_THEMES)} (got {self.theme!r})"
            )
        if not (isinstance(self.articles, list) and self.articles
                and all(isinstance(a, str) and a.strip() for a in self.articles)):
            problems.append(f"{self.id}: articles must be a non-empty list of translationKeys")
        elif len(set(self.articles)) != len(self.articles):
            problems.append(f"{self.id}: articles carries duplicates")
        if not _DDMMYYYY_RE.match(self.added_on):
            problems.append(f"{self.id}: addedOn must be DD-MM-YYYY (got {self.added_on!r})")
        for alias in self.aliases:
            problems.extend(_no_style_violations(alias, f"{self.id}: alias"))
        return problems

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "label": dict(self.label),
            "definition": dict(self.definition),
            "theme": self.theme,
            "aliases": list(self.aliases),
            "related": list(self.related),
            "articles": list(self.articles),
            "addedOn": self.added_on,
        }

    @classmethod
    def from_dict(cls, data: dict) -> Concept:
        if not isinstance(data, dict):
            raise ConceptError(f"concept must be an object (got {type(data).__name__})")
        try:
            return cls(
                id=data["id"],
                label=dict(data["label"]),
                definition=dict(data["definition"]),
                theme=data.get("theme", ""),
                articles=list(data.get("articles", [])),
                added_on=data.get("addedOn", ""),
                aliases=list(data.get("aliases", [])),
                related=list(data.get("related", [])),
            )
        except (KeyError, TypeError) as exc:
            raise ConceptError(f"invalid concept record: {exc}") from exc


class ConceptStore:
    """Load -> mutate (add / link) -> save, keeping the file shape deterministic."""

    def __init__(self, path: Path, concepts: list[Concept]):
        self._path = Path(path)
        self._concepts = concepts

    @classmethod
    def load(cls, path: Path) -> ConceptStore:
        path = Path(path)
        if not path.exists():
            return cls(path, [])
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ConceptError(f"cannot load concept store {path}: {exc}") from exc
        if not isinstance(raw, list):
            raise ConceptError(f"{path}: top level must be a JSON array")
        return cls(path, [Concept.from_dict(item) for item in raw])

    def concepts(self) -> list[Concept]:
        return list(self._concepts)

    def get(self, concept_id: str) -> Concept | None:
        return next((c for c in self._concepts if c.id == concept_id), None)

    def validate(self) -> list[str]:
        problems: list[str] = []
        ids = [c.id for c in self._concepts]
        if len(ids) != len(set(ids)):
            dupes = sorted({i for i in ids if ids.count(i) > 1})
            problems.append(f"duplicate concept ids: {dupes}")
        known = set(ids)
        for concept in self._concepts:
            problems.extend(concept.validate())
            for rel in concept.related:
                if rel not in known:
                    problems.append(f"{concept.id}: related id {rel!r} not in the store")
        return problems

    def add(self, concept: Concept) -> None:
        """Append a NEW concept. Refuses an existing id OR an id colliding with another
        concept's alias (canonical definitions are write-once; link instead)."""
        if self.get(concept.id) is not None:
            raise ConceptError(
                f"concept {concept.id!r} already exists -- definitions are write-once; "
                "use `link` to add the article citation"
            )
        alias_owner = next(
            (c for c in self._concepts
             if concept.id in {a.lower().replace(" ", "-") for a in c.aliases}),
            None,
        )
        if alias_owner is not None:
            raise ConceptError(
                f"{concept.id!r} matches an alias of existing concept {alias_owner.id!r}; "
                "use `link` on that concept instead of adding a duplicate"
            )
        problems = concept.validate()
        for rel in concept.related:
            if rel != concept.id and self.get(rel) is None:
                problems.append(f"{concept.id}: related id {rel!r} not in the store")
        if problems:
            raise ConceptError("; ".join(problems))
        self._concepts.append(concept)

    def link(self, concept_id: str, translation_key: str) -> bool:
        """Append an article citation to an EXISTING concept. Idempotent: returns False
        when the citation is already recorded. Raises on an unknown id."""
        concept = self.get(concept_id)
        if concept is None:
            raise ConceptError(
                f"unknown concept {concept_id!r} -- use `add` for a genuinely new concept"
            )
        if translation_key in concept.articles:
            return False
        concept.articles.append(translation_key)
        return True

    def save(self) -> None:
        self._concepts.sort(key=lambda c: c.id)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        payload = [c.to_dict() for c in self._concepts]
        self._path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.concepts {list,link,add,validate}
# ---------------------------------------------------------------------------


def _store_path(args) -> Path:
    if args.store:
        return Path(args.store)
    return Path(args.repo_root) / CONCEPTS_REL


def _cmd_list(args) -> int:
    store = ConceptStore.load(_store_path(args))
    for c in store.concepts():
        alias_note = f" (aliases: {', '.join(c.aliases)})" if c.aliases else ""
        print(f"{c.id} | {c.theme} | {c.label['en']}{alias_note} | {len(c.articles)} article(s)")
    print(f"total: {len(store.concepts())}")
    return 0


def _cmd_link(args) -> int:
    store = ConceptStore.load(_store_path(args))
    try:
        appended = store.link(args.id, args.article)
    except ConceptError as exc:
        print(exc)
        return 1
    if appended:
        store.save()
        print(f"linked {args.article} -> {args.id}")
    else:
        print(f"already linked: {args.article} -> {args.id} (no-op)")
    return 0


def _cmd_add(args) -> int:
    try:
        raw = json.loads(Path(args.file).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"cannot read concept JSON {args.file}: {exc}")
        return 1
    if isinstance(raw, dict) and "addedOn" not in raw:
        raw["addedOn"] = date.today().strftime("%d-%m-%Y")
    store = ConceptStore.load(_store_path(args))
    try:
        store.add(Concept.from_dict(raw))
    except ConceptError as exc:
        print(exc)
        return 1
    store.save()
    print(f"added {raw['id']}")
    return 0


def _cmd_validate(args) -> int:
    try:
        store = ConceptStore.load(_store_path(args))
    except ConceptError as exc:
        print(exc)
        return 1
    problems = store.validate()
    if problems:
        for problem in problems:
            print(problem)
        return 1
    print(f"OK ({len(store.concepts())} concepts)")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.concepts",
        description="Knowledge-graph concept store: list / link / add / validate.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--repo-root", default=".", help="repo root (store lives under it)")
        p.add_argument("--store", default=None, help="override the store path (tests)")

    p_list = sub.add_parser("list", help="list concepts (REUSE these before adding)")
    common(p_list)
    p_list.set_defaults(fn=_cmd_list)

    p_link = sub.add_parser("link", help="append an article citation to an existing concept")
    common(p_link)
    p_link.add_argument("--id", required=True, help="existing concept id")
    p_link.add_argument("--article", required=True, help="the article's translationKey")
    p_link.set_defaults(fn=_cmd_link)

    p_add = sub.add_parser("add", help="add a NEW concept (write-once definition)")
    common(p_add)
    p_add.add_argument("--file", required=True, help="JSON file with the concept record")
    p_add.set_defaults(fn=_cmd_add)

    p_val = sub.add_parser("validate", help="validate the whole store")
    common(p_val)
    p_val.set_defaults(fn=_cmd_validate)

    args = parser.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "CONCEPTS_REL",
    "VALID_THEMES",
    "Concept",
    "ConceptStore",
    "ConceptError",
]

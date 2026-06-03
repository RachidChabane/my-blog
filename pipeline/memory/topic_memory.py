"""The persistent evergreen topic memory (FR-G1) -- reader + publish-time append.

Implements ``contracts.embedder.TopicMemoryReader`` (``prior_topics()``) so the Select
dedup step compares each candidate against previously-published topics, and adds the
publish-time ``append_publication`` (idempotent on ``translation_key``).

File format is a **superset-compatible JSON array**: each record carries the dedup-only
triple ``{topic_id, dedup_key, embedding?}`` that ``contracts.embedder.load_topic_memory``
reads (used by ``select dedup --memory``) plus provenance keys it ignores
(``translation_key`` / ``title`` / ``slugs`` / ``sources`` / ``published_at``). The two
readers therefore agree on the same on-disk file without coupling.

``embedding`` is stored ``None`` (plan §0.8): the only offline embedder is the
MONOLINGUAL fake; baking its vectors into the committed evergreen store would poison
real dedup later. ``semantic_dedup`` embeds a ``None``-embedding prior's ``dedup_key`` on
the fly. Real precompute (keyed by the embedding model's provenance) is a post-secret
optimization, out of scope.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ..contracts.claim_source_map import ContractError
from ..contracts.embedder import PriorTopic


@dataclass(frozen=True)
class TopicRecord:
    """One published topic. ``translation_key`` is the STABLE identity (idempotency key);
    ``topic_id`` is per-run research provenance, NOT identity (plan §0.4 / R-idem)."""

    translation_key: str
    topic_id: str
    dedup_key: str
    title: str
    slugs: dict[str, str]
    sources: list[dict]
    published_at: str
    embedding: list[float] | None = None

    def to_dict(self) -> dict:
        """Emit keys in a fixed order for deterministic file diffs."""
        return {
            "translation_key": self.translation_key,
            "topic_id": self.topic_id,
            "dedup_key": self.dedup_key,
            "title": self.title,
            "slugs": dict(self.slugs),
            "sources": [dict(source) for source in self.sources],
            "published_at": self.published_at,
            "embedding": self.embedding,
        }

    @classmethod
    def from_dict(cls, data: dict) -> TopicRecord:
        """Tolerant load: the dedup triple is required; provenance keys default; the
        optional ``embedding`` comes via ``.get`` (``None`` for the committed store)."""
        try:
            return cls(
                translation_key=data["translation_key"],
                topic_id=data["topic_id"],
                dedup_key=data["dedup_key"],
                title=data.get("title", ""),
                slugs=dict(data.get("slugs", {})),
                sources=list(data.get("sources", [])),
                published_at=data.get("published_at", ""),
                embedding=data.get("embedding"),
            )
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid TopicRecord: {exc}") from exc


class TopicMemory:
    """The persistent store: load -> read (``prior_topics``) / append -> save.

    Publish is the SINGLE writer (the append happens inside the publish command, atomic
    with the article writes), so there is no ``append`` CLI -- only ``validate`` / ``list``.
    """

    def __init__(self, path: str | Path, records: list[TopicRecord] | None = None) -> None:
        self.path = Path(path)
        self._records: list[TopicRecord] = list(records) if records is not None else []

    @classmethod
    def load(cls, path: str | Path) -> TopicMemory:
        """Load the JSON array into a store. Missing file -> empty (a fresh checkout /
        test tmp; the committed ``[]`` guarantees presence in-repo). Malformed JSON or a
        non-array -> ``ContractError`` (fail loud, not silent-empty)."""
        p = Path(path)
        if not p.exists():
            return cls(p, [])
        try:
            raw = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid topic_memory JSON: {exc}") from exc
        if not isinstance(raw, list):
            raise ContractError("topic_memory must be a JSON array")
        return cls(p, [TopicRecord.from_dict(entry) for entry in raw])

    def records(self) -> list[TopicRecord]:
        return list(self._records)

    def prior_topics(self) -> list[PriorTopic]:
        """``TopicMemoryReader``: map each record to the dedup-only ``PriorTopic``.

        With ``embedding=None`` (the default), ``semantic_dedup`` embeds ``dedup_key``
        on the fly -- exactly its existing ``prior.embedding is None`` branch.
        """
        return [
            PriorTopic(
                topic_id=record.topic_id,
                dedup_key=record.dedup_key,
                embedding=record.embedding,
            )
            for record in self._records
        ]

    def has(self, translation_key: str) -> bool:
        return any(record.translation_key == translation_key for record in self._records)

    def append_publication(self, record: TopicRecord) -> bool:
        """Idempotent append keyed on ``translation_key``. Returns ``False`` (no-op) when
        the topic is already recorded -- resume / re-drive / double-publish safe."""
        if self.has(record.translation_key):
            return False
        self._records.append(record)
        return True

    def save(self) -> None:
        """Write the JSON array (indent=2, ensure_ascii=False, trailing newline)."""
        payload = [record.to_dict() for record in self._records]
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.memory.topic_memory {validate,list} <path>
# ---------------------------------------------------------------------------


def _cmd_validate(args) -> int:
    try:
        TopicMemory.load(args.path)
    except ContractError as exc:
        print(f"INVALID: {exc}")
        return 1
    print("OK")
    return 0


def _cmd_list(args) -> int:
    store = TopicMemory.load(args.path)
    for record in store.records():
        print(f"{record.topic_id}\t{record.translation_key}\t{record.dedup_key}")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.memory.topic_memory",
        description="Persistent evergreen topic memory: validate / list the store.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_validate = sub.add_parser("validate", help="load + structurally check a store")
    p_validate.add_argument("path", help="path to a topic_memory JSON array")
    p_list = sub.add_parser("list", help="print topic_id\\ttranslation_key\\tdedup_key")
    p_list.add_argument("path", help="path to a topic_memory JSON array")
    args = parser.parse_args(argv)
    if args.cmd == "validate":
        return _cmd_validate(args)
    return _cmd_list(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["TopicRecord", "TopicMemory"]

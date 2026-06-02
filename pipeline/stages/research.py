"""Research stage data model — the ``candidates.json`` research->select handoff.

The research agent (prompt: ``pipeline/prompts/research.py``) does a native
web-search sweep over cutting-edge AI engineering (D-006), captures source
excerpts, and writes the ranked candidate envelope to
``plans/task-research/candidates.json``. This module is the Python validator it
self-checks against (``--validate`` CLI) and that the select stage loads.

``candidates.json`` is an INTERNAL handoff — Python-validated only (unlike
``claim_source_map.json``, it ships no external JSON Schema). ``SourceRecord`` is
reused from the pinned contract so captured sources flow research -> draft ->
gate -> publish without re-authoring (plan §1.5).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ..contracts.claim_source_map import (
    ContractError,
    SourceRecord,
    _require_nonempty,
)

SCHEMA_VERSION = 1


@dataclass(frozen=True)
class ResearchCandidate:
    """One ranked research candidate (plan §1.5).

    ``dedup_key`` is the canonical topic phrasing the dedup step embeds — one key
    per TOPIC (not per article-language): lowercase, diacritics folded to ASCII,
    a single canonical (English/ASCII) phrasing (M-11). ``sources`` needs >= 2
    (FR-B3 requires >= 2 cited).
    """

    topic_id: str
    dedup_key: str
    title: str
    summary: str
    why_relevant: str
    tags: list[str]
    sources: list[SourceRecord]

    def validate(self) -> None:
        _require_nonempty(self.topic_id, "topic_id")
        _require_nonempty(self.dedup_key, "dedup_key")
        _require_nonempty(self.title, "title")
        _require_nonempty(self.summary, "summary")
        _require_nonempty(self.why_relevant, "why_relevant")
        if not self.tags:
            raise ContractError(f"candidate {self.topic_id!r}: tags must have >= 1 entry")
        for tag in self.tags:
            _require_nonempty(tag, "tag")
        if len(self.sources) < 2:
            raise ContractError(
                f"candidate {self.topic_id!r}: needs >= 2 sources (FR-B3), "
                f"got {len(self.sources)}"
            )
        seen: set[str] = set()
        for source in self.sources:
            source.validate()
            if source.source_id in seen:
                raise ContractError(
                    f"candidate {self.topic_id!r}: duplicate source_id "
                    f"{source.source_id!r}"
                )
            seen.add(source.source_id)

    def to_dict(self) -> dict:
        return {
            "topic_id": self.topic_id,
            "dedup_key": self.dedup_key,
            "title": self.title,
            "summary": self.summary,
            "why_relevant": self.why_relevant,
            "tags": list(self.tags),
            "sources": [source.to_dict() for source in self.sources],
        }

    @classmethod
    def from_dict(cls, data: dict) -> ResearchCandidate:
        try:
            return cls(
                topic_id=data["topic_id"],
                dedup_key=data["dedup_key"],
                title=data["title"],
                summary=data["summary"],
                why_relevant=data["why_relevant"],
                tags=list(data["tags"]),
                sources=[SourceRecord.from_dict(s) for s in data["sources"]],
            )
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid ResearchCandidate: {exc}") from exc


@dataclass(frozen=True)
class CandidatesDoc:
    """``candidates.json`` envelope: ``{"schema_version": 1, "candidates": [...]}``.

    ARRAY ORDER == RANK (first = best); there is no separate ``rank`` field. Empty
    ``candidates`` is structurally valid here (``choose_topic([])`` in select.py is
    what raises).
    """

    schema_version: int
    candidates: list[ResearchCandidate]

    def validate(self) -> None:
        if self.schema_version != SCHEMA_VERSION:
            raise ContractError(
                f"schema_version must be {SCHEMA_VERSION} (got {self.schema_version!r})"
            )
        seen: set[str] = set()
        for candidate in self.candidates:
            candidate.validate()
            if candidate.topic_id in seen:
                raise ContractError(f"duplicate topic_id {candidate.topic_id!r}")
            seen.add(candidate.topic_id)

    def to_dict(self) -> dict:
        return {
            "schema_version": self.schema_version,
            "candidates": [candidate.to_dict() for candidate in self.candidates],
        }

    @classmethod
    def from_dict(cls, data: dict) -> CandidatesDoc:
        try:
            return cls(
                schema_version=data["schema_version"],
                candidates=[
                    ResearchCandidate.from_dict(c) for c in data["candidates"]
                ],
            )
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid CandidatesDoc: {exc}") from exc

    def dumps(self, *, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)

    @classmethod
    def loads(cls, text: str) -> CandidatesDoc:
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid JSON: {exc}") from exc
        if not isinstance(data, dict):
            raise ContractError("candidates.json must be a JSON object envelope")
        return cls.from_dict(data)

    @classmethod
    def load_path(cls, path: str | Path) -> CandidatesDoc:
        return cls.loads(Path(path).read_text(encoding="utf-8"))

    def dump_path(self, path: str | Path) -> None:
        Path(path).write_text(self.dumps() + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.research --validate <candidates.json>
# ---------------------------------------------------------------------------


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.research",
        description="Validate a candidates.json against the research handoff schema.",
    )
    parser.add_argument(
        "--validate",
        metavar="PATH",
        required=True,
        help="path to a candidates.json to load + validate",
    )
    args = parser.parse_args(argv)
    try:
        CandidatesDoc.load_path(args.validate).validate()
    except (ContractError, OSError) as exc:
        print(f"INVALID: {exc}")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = ["SCHEMA_VERSION", "ResearchCandidate", "CandidatesDoc"]

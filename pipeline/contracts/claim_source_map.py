"""The PINNED claim->source provenance contract (docs/persona.md "Shared contracts").

The Draft stage (task 25) PRODUCES ``plans/task-draft/claim_source_map.json``; the
M-4 fact-check gate (task 26) CONSUMES it. This module is the single source of
truth for that file's shape, its runtime validator, and a thin ``--validate`` CLI.
``claim_source_map.schema.json`` (next to this file) is the documentation / external-
tooling mirror; THIS validator is the runtime truth (see plan §1.4 / Step 3).

Design notes (plan §1):
- ``SourceRecord`` is reused by BOTH this map's ``sources[]`` and ``candidates.json``
  (research stage), so captured sources flow research -> draft -> gate -> publish
  without re-authoring. Its ``label`` maps to ``article.sources[].label`` at publish.
- ``Claim.lang`` is a *documented bilingual extension* of the pinned core triple
  ``{claim, source_id, excerpt_span}`` — the map is one file; the gate filters by
  ``lang`` to run per language (NFR-11).
- Field validators are pure functions invoked from ``validate()`` (NOT in
  ``__post_init__``): a structurally-shaped-but-invalid record CONSTRUCTS fine and
  fails at ``.validate()``. ``from_dict`` wraps shape errors (KeyError/TypeError) as
  ``ContractError`` so callers see one error type.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path


class ContractError(ValueError):
    """Raised by the contract validators / loaders with a precise message."""


# ---------------------------------------------------------------------------
# Field validators (pure functions; reused by candidates.json via SourceRecord)
# ---------------------------------------------------------------------------

# Case-insensitive, mirroring schemas.ts `httpUrl` (/i flag). The JSON Schema keeps
# the pattern case-sensitive (inline flags aren't portable) — a deliberate
# schema-as-docs / runtime-as-truth divergence (plan §1.1 Comment C / Step 3).
_URL_RE = re.compile(r"^https?://", re.IGNORECASE)


def _require_nonempty(value: object, field: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{field} must be a non-empty string")


def _validate_url(url: object, field: str = "url") -> None:
    _require_nonempty(url, field)
    assert isinstance(url, str)
    if not _URL_RE.match(url):
        raise ContractError(f"{field} must start with http:// or https:// (got {url!r})")


def _validate_iso_date(value: object, field: str = "retrieved_at") -> None:
    """Accept an ISO-8601 calendar date (YYYY-MM-DD) or a full datetime (RFC3339)."""
    _require_nonempty(value, field)
    assert isinstance(value, str)
    try:
        date.fromisoformat(value)
        return
    except ValueError:
        pass
    try:
        datetime.fromisoformat(value)
    except ValueError as exc:
        raise ContractError(
            f"{field} must be an ISO-8601 date or datetime (got {value!r})"
        ) from exc


# ---------------------------------------------------------------------------
# Dataclasses (plan §1.1-1.4)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ExcerptSpan:
    """Character offsets into the referenced ``SourceRecord.excerpt`` (plan §1.2).

    Invariant (checked against the resolved excerpt in ``ClaimSourceMap.validate``):
    ``0 <= start < end <= len(excerpt)``. Absent ⇒ the whole excerpt supports the claim.
    """

    start: int
    end: int

    def to_dict(self) -> dict[str, int]:
        return {"start": self.start, "end": self.end}

    @classmethod
    def from_dict(cls, data: dict) -> ExcerptSpan:
        try:
            return cls(start=data["start"], end=data["end"])
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid excerpt_span: {exc}") from exc


@dataclass(frozen=True)
class SourceRecord:
    """One captured source passage (plan §1.1). Unique ``source_id`` within a collection.

    One record per ``(url, excerpt)`` pair — the same URL may appear as several ids,
    each with its own single ``excerpt``, keeping ``excerpt_span`` unambiguous.
    """

    source_id: str
    label: str
    url: str
    retrieved_at: str
    excerpt: str
    source_date: str | None = None

    def validate(self) -> None:
        _require_nonempty(self.source_id, "source_id")
        _require_nonempty(self.label, "label")
        _validate_url(self.url, "url")
        _validate_iso_date(self.retrieved_at, "retrieved_at")
        _require_nonempty(self.excerpt, "excerpt")
        if self.source_date is not None:
            _validate_iso_date(self.source_date, "source_date")

    def to_dict(self) -> dict[str, str]:
        data: dict[str, str] = {
            "source_id": self.source_id,
            "label": self.label,
            "url": self.url,
            "retrieved_at": self.retrieved_at,
            "excerpt": self.excerpt,
        }
        if self.source_date is not None:
            data["source_date"] = self.source_date
        return data

    @classmethod
    def from_dict(cls, data: dict) -> SourceRecord:
        try:
            return cls(
                source_id=data["source_id"],
                label=data["label"],
                url=data["url"],
                retrieved_at=data["retrieved_at"],
                excerpt=data["excerpt"],
                source_date=data.get("source_date"),
            )
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid SourceRecord: {exc}") from exc


@dataclass(frozen=True)
class Claim:
    """A load-bearing statement backed by one source (plan §1.3).

    ``lang`` is a documented bilingual extension of the pinned core triple
    ``{claim, source_id, excerpt_span}`` — not a redefinition of it.
    """

    lang: str
    claim: str
    source_id: str
    excerpt_span: ExcerptSpan | None = None

    def validate(self) -> None:
        if self.lang not in ("fr", "en"):
            raise ContractError(f"lang must be 'fr' or 'en' (got {self.lang!r})")
        _require_nonempty(self.claim, "claim")
        _require_nonempty(self.source_id, "source_id")

    def to_dict(self) -> dict:
        data: dict = {
            "lang": self.lang,
            "claim": self.claim,
            "source_id": self.source_id,
        }
        if self.excerpt_span is not None:
            data["excerpt_span"] = self.excerpt_span.to_dict()
        return data

    @classmethod
    def from_dict(cls, data: dict) -> Claim:
        try:
            span = data.get("excerpt_span")
            return cls(
                lang=data["lang"],
                claim=data["claim"],
                source_id=data["source_id"],
                excerpt_span=ExcerptSpan.from_dict(span) if span is not None else None,
            )
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid Claim: {exc}") from exc


@dataclass(frozen=True)
class ClaimSourceMap:
    """``claim_source_map.json`` == ``{"claims": Claim[], "sources": SourceRecord[]}``.

    Empty lists are structurally valid (the fake stub ``{"claims":[],"sources":[]}``
    must pass). ``validate()`` enforces referential integrity (plan §1.4).
    """

    claims: list[Claim]
    sources: list[SourceRecord]

    def validate(self) -> None:
        by_id: dict[str, SourceRecord] = {}
        for source in self.sources:
            source.validate()
            if source.source_id in by_id:
                raise ContractError(f"duplicate source_id {source.source_id!r}")
            by_id[source.source_id] = source
        for claim in self.claims:
            claim.validate()
            source = by_id.get(claim.source_id)
            if source is None:
                raise ContractError(
                    f"claim references unknown source_id {claim.source_id!r}"
                )
            if claim.excerpt_span is not None:
                _validate_span(claim.excerpt_span, source.excerpt)

    def claims_for(self, lang: str) -> list[Claim]:
        """The claims authored in ``lang`` (the gate runs per language)."""
        return [claim for claim in self.claims if claim.lang == lang]

    def to_dict(self) -> dict:
        return {
            "claims": [claim.to_dict() for claim in self.claims],
            "sources": [source.to_dict() for source in self.sources],
        }

    @classmethod
    def from_dict(cls, data: dict) -> ClaimSourceMap:
        try:
            claims = [Claim.from_dict(c) for c in data["claims"]]
            sources = [SourceRecord.from_dict(s) for s in data["sources"]]
        except (KeyError, TypeError) as exc:
            raise ContractError(f"invalid ClaimSourceMap: {exc}") from exc
        return cls(claims=claims, sources=sources)

    def dumps(self, *, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)

    @classmethod
    def loads(cls, text: str) -> ClaimSourceMap:
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid JSON: {exc}") from exc
        if not isinstance(data, dict):
            raise ContractError("claim_source_map must be a JSON object")
        return cls.from_dict(data)

    def dump_path(self, path: str | Path) -> None:
        Path(path).write_text(self.dumps() + "\n", encoding="utf-8")

    @classmethod
    def load_path(cls, path: str | Path) -> ClaimSourceMap:
        return cls.loads(Path(path).read_text(encoding="utf-8"))


def _validate_span(span: ExcerptSpan, excerpt: str) -> None:
    if not (isinstance(span.start, int) and isinstance(span.end, int)):
        raise ContractError("excerpt_span start/end must be integers")
    if not 0 <= span.start < span.end <= len(excerpt):
        raise ContractError(
            "excerpt_span out of bounds: need 0 <= start < end <= "
            f"{len(excerpt)} (got start={span.start}, end={span.end})"
        )


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.contracts.claim_source_map --validate <path>
# ---------------------------------------------------------------------------


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.contracts.claim_source_map",
        description="Validate a claim_source_map.json against the runtime contract.",
    )
    parser.add_argument(
        "--validate",
        metavar="PATH",
        required=True,
        help="path to a claim_source_map.json to load + validate",
    )
    args = parser.parse_args(argv)
    try:
        ClaimSourceMap.load_path(args.validate).validate()
    except (ContractError, OSError) as exc:
        print(f"INVALID: {exc}")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "ContractError",
    "ExcerptSpan",
    "SourceRecord",
    "Claim",
    "ClaimSourceMap",
]

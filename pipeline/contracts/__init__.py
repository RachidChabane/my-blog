"""Pinned contracts for the content engine: provenance map + embedder seam.

- ``claim_source_map``: the PINNED claim->source provenance contract (task 24);
  produced by the draft stage (task 25), consumed by the M-4 gate (task 26).
- ``embedder``: the shared OQ-5 ``Embedder`` / ``TopicMemoryReader`` seams + ``cosine``
  (Python side; real impls land in task 27).
"""
from __future__ import annotations

from .claim_source_map import (
    Claim,
    ClaimSourceMap,
    ContractError,
    ExcerptSpan,
    SourceRecord,
)
from .embedder import (
    Embedder,
    PriorTopic,
    TopicMemoryReader,
    cosine,
    load_topic_memory,
)

__all__ = [
    "Claim",
    "ClaimSourceMap",
    "ContractError",
    "ExcerptSpan",
    "SourceRecord",
    "Embedder",
    "PriorTopic",
    "TopicMemoryReader",
    "cosine",
    "load_topic_memory",
]

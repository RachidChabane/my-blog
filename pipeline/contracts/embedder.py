"""The shared OQ-5 embedder seam (Python side) + topic-memory reader + ``cosine``.

Mirrors ``src/lib/avatar/contracts.ts`` ``Embedder`` so the real implementations
(TS task 18 / Python task 27) target the *same* provider/model and produce
comparable vectors. The seam is **synchronous** here — the pipeline is sync
Python; the TS seam is async. That language difference is intentional.

DEFERRED to task 27 (behind these Protocols): the real multilingual ``Embedder``
(``pipeline/memory/embedder.py``) and the persistent evergreen ``TopicMemory``
(``pipeline/memory/topic_memory.py``). Task 24 ships the seam + fakes only.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol


class Embedder(Protocol):
    """Turns text into dense vectors (OQ-5). Order-preserving batch + single query.

    ``model`` is copied for provenance; ``dimensions`` is the output vector length.
    """

    model: str
    dimensions: int

    def embed(self, texts: list[str]) -> list[list[float]]:
        """Batch-embed ``texts`` in order (used by dedup over candidate keys)."""
        ...

    def embed_query(self, text: str) -> list[float]:
        """Embed a single string."""
        ...


@dataclass(frozen=True)
class PriorTopic:
    """A previously-published topic, keyed by its canonical ``dedup_key`` (§1.5).

    ``embedding`` is precomputed by the topic-memory store when available; if
    ``None`` the dedup step embeds ``dedup_key`` on the fly.
    """

    topic_id: str
    dedup_key: str
    embedding: list[float] | None = None


class TopicMemoryReader(Protocol):
    """Reads the prior-topics corpus dedup compares against (task 27 implements)."""

    def prior_topics(self) -> list[PriorTopic]:
        ...


def load_topic_memory(path: str | Path) -> list[PriorTopic]:
    """Load ``[{topic_id, dedup_key, embedding?}]`` from a JSON file into ``PriorTopic``s.

    The persistent evergreen store implementing ``TopicMemoryReader`` is task 27;
    this is the offline file reader the dedup CLI uses with ``--memory``.
    """
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    return [
        PriorTopic(
            topic_id=entry["topic_id"],
            dedup_key=entry["dedup_key"],
            embedding=entry.get("embedding"),
        )
        for entry in raw
    ]


def cosine(a: list[float], b: list[float]) -> float:
    """Cosine similarity in [-1, 1]; 0.0 for a zero-magnitude vector (no NaN).

    Pure Python (no numpy), single-pass — mirrors ``vector-store.ts`` ``cosineSimilarity``.
    """
    if len(a) != len(b):
        raise ValueError("cosine: vector length mismatch")
    dot = 0.0
    norm_a = 0.0
    norm_b = 0.0
    for x, y in zip(a, b, strict=True):
        dot += x * y
        norm_a += x * x
        norm_b += y * y
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (math.sqrt(norm_a) * math.sqrt(norm_b))


__all__ = [
    "Embedder",
    "PriorTopic",
    "TopicMemoryReader",
    "load_topic_memory",
    "cosine",
]

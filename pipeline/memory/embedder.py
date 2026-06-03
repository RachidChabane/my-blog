"""The shared OQ-5 multilingual ``Embedder`` (Python side) -- defer-and-throw.

Mirrors ``src/lib/avatar/contracts.ts`` ``Embedder`` and
``scripts/reindex.ts`` ``createRealEmbedder``. OQ-5 (the managed multilingual
embedding provider/model) is UNRESOLVED: the TS sibling throws even with a key
present ("present, embedder not wired yet"). So this module ships the conforming
scaffold + a ``create_real_embedder`` factory that raises the SAME fail-loud
contract -- it never silently fabricates vectors against an invented request shape.

Real wiring (BOTH languages, pinned to the same model/dimensions so vectors stay
comparable) is the post-secret step. There is deliberately NO urllib/HTTP client and
NO stubbed-``urlopen`` test here: a green test against a guessed request shape would be
false confidence the moment OQ-5 resolves to a non-OpenAI-compatible API (plan §0.7).
"""
from __future__ import annotations

import os

from ..contracts.embedder import Embedder  # Protocol (documentation/typing only)


class EmbedderNotConfigured(RuntimeError):
    """Raised when the real multilingual embedder (OQ-5) is requested without wiring."""


class RealEmbedder:
    """Real multilingual ``Embedder`` (OQ-5). Scaffold only -- NOT wired (post-secret step).

    Conforms to ``contracts.embedder.Embedder`` (``model`` / ``dimensions`` /
    ``embed`` / ``embed_query``) so a live wiring is a drop-in. ``model`` and
    ``dimensions`` are intentionally NOT hard-coded to a guess -- they are pinned at
    the post-secret step in BOTH languages so vectors stay comparable. Calling
    ``embed`` / ``embed_query`` before wiring raises ``EmbedderNotConfigured`` -- the
    same fail-loud contract as the TS sibling.
    """

    def __init__(
        self,
        *,
        api_key: str,
        model: str | None = None,
        dimensions: int | None = None,
    ) -> None:
        self.api_key = api_key
        self.model = model or "oq5-pending"
        self.dimensions = dimensions or 0

    def embed(self, texts: list[str]) -> list[list[float]]:
        raise EmbedderNotConfigured(
            "Pipeline embedder not wired yet (OQ-5 pending -- see docs/persona.md)."
        )

    def embed_query(self, text: str) -> list[float]:
        raise EmbedderNotConfigured(
            "Pipeline embedder not wired yet (OQ-5 pending -- see docs/persona.md)."
        )


def create_real_embedder(env: dict[str, str] | None = None) -> RealEmbedder:
    """Mirror ``scripts/reindex.ts`` ``createRealEmbedder``. Reads ``EMBEDDINGS_API_KEY``.

    Absent  -> ``EmbedderNotConfigured('... EMBEDDINGS_API_KEY absent ...')``.
    Present -> still raises ('present, embedder not wired yet') -- OQ-5's provider /
    model are unchosen, so we never silently fabricate vectors. The post-secret step
    wires ``RealEmbedder``. ``always raises`` is the point: the offline default stays
    ``fake`` and a live ``--embedder real`` without wiring fails loud, never silent-fake.
    """
    env = os.environ if env is None else env
    has_key = bool(env.get("EMBEDDINGS_API_KEY"))
    raise EmbedderNotConfigured(
        "Pipeline multilingual embedder not configured (OQ-5 pending -- see "
        "docs/persona.md; EMBEDDINGS_API_KEY "
        f"{'present, embedder not wired yet' if has_key else 'absent'})."
    )


__all__ = ["Embedder", "RealEmbedder", "EmbedderNotConfigured", "create_real_embedder"]

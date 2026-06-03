"""The shared multilingual ``Embedder`` (Python side) -- Cloudflare Workers AI bge-m3.

Mirrors ``src/lib/avatar/embedder.ts`` ``WorkersAiRestEmbedder`` and is pinned to the
SAME model/dimensions (``@cf/baai/bge-m3`` / 1024-d) so the vectors this pipeline
produces (dedup over candidate keys, topic memory) stay comparable with the TS index.

Provider resolved (was OQ-5): a stubbed-``urlopen`` test is now legitimate -- the
request/response shape is the Workers AI REST envelope (``{result: {data}, success}``),
not a guess. ``create_real_embedder`` reads the Cloudflare token + account from env and
raises ``EmbedderNotConfigured`` (fail-loud) when either is absent -- it never silently
fabricates vectors, so the offline default stays ``fake`` and a misconfigured
``--embedder real`` fails clearly.
"""
from __future__ import annotations

import json
import os
import urllib.request

from ..contracts.embedder import Embedder  # Protocol (documentation/typing only)

WORKERS_AI_MODEL = "@cf/baai/bge-m3"
WORKERS_AI_DIMENSIONS = 1024
EMBED_BATCH_SIZE = 100  # per-request cap, kept well under Workers AI limits
_CF_API_BASE = "https://api.cloudflare.com/client/v4"
_TIMEOUT = 30.0


class EmbedderNotConfigured(RuntimeError):
    """Raised when the real multilingual embedder is requested without credentials."""


class RealEmbedder:
    """Real multilingual ``Embedder``: Workers AI ``@cf/baai/bge-m3`` over the REST API.

    Conforms to ``contracts.embedder.Embedder`` (``model`` / ``dimensions`` /
    ``embed`` / ``embed_query``). ``urlopen`` is injectable so the offline test
    exercises the request/parse without a network call.
    """

    def __init__(
        self,
        *,
        api_key: str,
        account_id: str,
        model: str = WORKERS_AI_MODEL,
        dimensions: int = WORKERS_AI_DIMENSIONS,
        urlopen=None,
    ) -> None:
        self.api_key = api_key
        self.account_id = account_id
        self.model = model
        self.dimensions = dimensions
        self._urlopen = urlopen if urlopen is not None else urllib.request.urlopen

    def _run_batch(self, texts: list[str]) -> list[list[float]]:
        url = f"{_CF_API_BASE}/accounts/{self.account_id}/ai/run/{self.model}"
        body = json.dumps({"text": texts}).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        with self._urlopen(request, timeout=_TIMEOUT) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        data = (payload.get("result") or {}).get("data")
        if not payload.get("success") or not isinstance(data, list) or len(data) != len(texts):
            raise RuntimeError("Workers AI embeddings: malformed response.")
        return data

    def embed(self, texts: list[str]) -> list[list[float]]:
        out: list[list[float]] = []
        for i in range(0, len(texts), EMBED_BATCH_SIZE):
            out.extend(self._run_batch(texts[i : i + EMBED_BATCH_SIZE]))
        for vec in out:
            if len(vec) != self.dimensions:
                raise RuntimeError(
                    f"Workers AI embeddings: expected {self.dimensions}-d, got {len(vec)}"
                )
        return out

    def embed_query(self, text: str) -> list[float]:
        return self.embed([text])[0]


def create_real_embedder(env: dict[str, str] | None = None, *, urlopen=None) -> RealEmbedder:
    """Mirror ``scripts/build-avatar-index.ts`` ``createWorkersAiRestEmbedder``.

    Reads the CF token from ``EMBEDDINGS_API_KEY`` (or ``CLOUDFLARE_API_TOKEN``) and the
    account from ``CLOUDFLARE_ACCOUNT_ID``. Absent -> ``EmbedderNotConfigured``;
    present -> a working ``RealEmbedder`` pinned to bge-m3 / 1024-d.
    """
    env = os.environ if env is None else env
    api_key = env.get("EMBEDDINGS_API_KEY") or env.get("CLOUDFLARE_API_TOKEN")
    account_id = env.get("CLOUDFLARE_ACCOUNT_ID")
    if not api_key or not account_id:
        raise EmbedderNotConfigured(
            "Workers AI embedder not configured: need EMBEDDINGS_API_KEY (or "
            "CLOUDFLARE_API_TOKEN) + CLOUDFLARE_ACCOUNT_ID (see DEPLOY.md §5). "
            f"token {'present' if api_key else 'absent'}, "
            f"account {'present' if account_id else 'absent'}."
        )
    return RealEmbedder(api_key=api_key, account_id=account_id, urlopen=urlopen)


__all__ = [
    "Embedder",
    "RealEmbedder",
    "EmbedderNotConfigured",
    "create_real_embedder",
    "WORKERS_AI_MODEL",
    "WORKERS_AI_DIMENSIONS",
]

"""Offline test doubles for the content-engine harness.

``FakeClaudeDriver`` is an offline ``SlateDriver``: no ``claude``, no tmux, no
network. It drives state via cpe's **real** ``state.State`` (shape parity is a
requirement — resume tests must exercise the real on-disk shape, not fiction)
and writes minimal per-stage artifact stubs under ``plans/task-<id>/`` so
artifact/resume assertions test reality.

``FakeEmbedder`` / ``FakeTopicMemory`` (task 24) live here — offline doubles for
the OQ-5 ``Embedder`` / ``TopicMemoryReader`` seams (``pipeline.contracts.embedder``),
mirroring the avatar TS fake (``src/lib/avatar/fakes.ts``). No fake ``LLMProvider`` /
web-search lives here yet — those belong to task 27.
"""
from __future__ import annotations

import json
import math
import re
import unicodedata
from datetime import UTC, datetime

from .config import PipelineConfig, ensure_cpe_importable
from .contracts.embedder import PriorTopic
from .runner import AssembledSlate, SlateResult, _usage_limit_code

# Per-stage artifact stubs the fake writes on stage completion. Real content is
# authored by tasks 24-27; these are just enough to be inspectable.
STAGE_ARTIFACTS: dict[str, list[str]] = {
    "research": ["candidates.json"],
    "select": ["brief.md"],
    "draft": ["draft-fr.md", "draft-en.md", "claim_source_map.json"],
    "publish": ["PUBLISHED"],  # marker; real publish writes src/content (task 27)
}

_ARTIFACT_STUBS: dict[str, str] = {
    "candidates.json": "[]\n",
    "brief.md": "# brief\n",
    "draft-fr.md": "# draft (fr)\n",
    "draft-en.md": "# draft (en)\n",
    "claim_source_map.json": '{"claims": [], "sources": []}\n',
    "PUBLISHED": "ok\n",
}


class FakeClaudeDriver:
    """A scriptable, offline ``SlateDriver`` over cpe's real ``state.State``.

    Parameters
    ----------
    interrupt_after:
        Stop after this task id (simulate a usage-limit / crash). With
        ``leave_in_flight=False`` the stage completes (status ``done``, artifacts
        written) before stopping; with ``leave_in_flight=True`` the stage is left
        ``implementing`` with no artifacts (mid-implement interruption).
    usage_limit:
        When True an interruption returns the usage-limit exit code (75) and
        writes the ``plans/USAGE_LIMIT`` sentinel at the path the real loop
        wrapper expects; when False it returns a generic failure (1).
    leave_in_flight:
        See ``interrupt_after``.
    block_task:
        Simulate a blocking M-4 gate: set this task ``blocked`` and return,
        leaving downstream tasks (e.g. ``publish``) unreached.
    """

    def __init__(
        self,
        config: PipelineConfig,
        *,
        interrupt_after: str | None = None,
        usage_limit: bool = True,
        leave_in_flight: bool = False,
        block_task: str | None = None,
    ) -> None:
        self.config = config
        self.interrupt_after = interrupt_after
        self.usage_limit = usage_limit
        self.leave_in_flight = leave_in_flight
        self.block_task = block_task

    def run_slate(self, slate: AssembledSlate, *, resume: bool) -> SlateResult:
        # `resume` is accepted for Protocol parity but unused: the fake skips
        # `done` tasks via state.json regardless, mirroring cpe's behavior.
        ensure_cpe_importable()
        from claude_plan_execute.state import State

        state = State(slate.plans_dir / "state.json")
        for tid in slate.task_ids:  # topological order
            if state.get(tid)["status"] == "done":
                continue  # resume: skip completed stages (mirrors cpe)

            if self.block_task == tid:  # simulate a blocking M-4 gate
                state.set_status(tid, "blocked", block_reason="fake gate failure")
                return SlateResult(1, False, False)  # publish never runs

            state.set_status(tid, "implementing")

            if self.interrupt_after == tid and self.leave_in_flight:
                # mid-implement interruption: leave status=implementing, no artifacts
                self._maybe_sentinel(slate, tid)
                return self._interrupted_result()

            self._write_artifacts(slate, tid)
            state.set_status(tid, "done")

            if self.interrupt_after == tid:  # completed this stage, then hit the cap
                self._maybe_sentinel(slate, tid)
                return self._interrupted_result()

        return SlateResult(0, True, False)

    # -- helpers ----------------------------------------------------------

    def _interrupted_result(self) -> SlateResult:
        code = _usage_limit_code() if self.usage_limit else 1
        return SlateResult(code, False, self.usage_limit)

    def _write_artifacts(self, slate: AssembledSlate, tid: str) -> None:
        task_dir = slate.plans_dir / f"task-{tid}"
        task_dir.mkdir(parents=True, exist_ok=True)
        for name in STAGE_ARTIFACTS.get(tid, []):
            (task_dir / name).write_text(_ARTIFACT_STUBS.get(name, ""), encoding="utf-8")

    def _maybe_sentinel(self, slate: AssembledSlate, tid: str) -> None:
        if not self.usage_limit:
            return
        # Mirror cpe's `_write_usage_limit_sentinel` JSON shape so a real loop
        # wrapper would find + parse it. `hit_at` wall-clock is never asserted.
        sentinel = {
            "reset_at": None,
            "hit_at": datetime.now(UTC).isoformat(),
            "task_id": tid,
            "message": "fake usage limit",
        }
        (slate.plans_dir / "USAGE_LIMIT").write_text(
            json.dumps(sentinel, indent=2), encoding="utf-8"
        )


# ---------------------------------------------------------------------------
# Offline OQ-5 embedder / topic-memory doubles (task 24)
# ---------------------------------------------------------------------------


def tokenize(text: str) -> list[str]:
    """Lowercase, fold diacritics (NFD + strip combining marks), split on non-[a-z0-9].

    FAITHFUL to the avatar TS ``tokenize`` (``src/lib/avatar/lexical.ts:17-24``) — NOT
    the ASCII-only ``re.findall(r"[a-z0-9]+", text.lower())``, which shreds accented FR
    (``"récupération" -> ['r','cup','ration']``) so an accented term and its ASCII
    spelling would never dedup. Folding makes them collapse to the same bag, so the
    fake operates on the §1.5 canonical ``dedup_key`` form.

    ``tokenize("Récupération") == tokenize("recuperation") == ["recuperation"]``.
    """
    folded = unicodedata.normalize("NFD", text.lower())
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    return re.findall(r"[a-z0-9]+", folded)


def _fnv1a(token: str) -> int:
    """FNV-1a 32-bit hash — mirrors the TS ``fnv1a`` (tokens are ASCII post-fold)."""
    h = 2166136261
    for ch in token:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


class FakeEmbedder:
    """Deterministic token-hash bag-of-words ``Embedder`` — mirrors the avatar TS fake.

    Each token bumps slot ``fnv1a(token) % dimensions``; the vector is L2-normalized,
    so texts sharing tokens get high cosine and disjoint vocabularies get ~0.

    LOUD CAVEAT (mirror ``src/lib/avatar/fakes.ts``): this measures literal TOKEN
    OVERLAP, not meaning, and is MONOLINGUAL — recognizing one topic phrased in two
    natural languages is the real multilingual embedder's job (OQ-5, task 27). It is
    safe for dedup HERE only because ``dedup_key``s are a single canonical form by
    convention (§1.5) — its tokenizer folds diacritics so spelling variants of the
    canonical key agree. A green fake suite locks the MECHANICS (dedup order, the
    threshold gate, parse/validate), NOT retrieval quality. Fully deterministic
    (no ``random``/``Date``): the same token bag always yields a bit-identical vector.
    """

    def __init__(self, dimensions: int = 256) -> None:
        self.dimensions = dimensions
        self.model = f"fake-hash-{dimensions}"

    def _vectorize(self, text: str) -> list[float]:
        vec = [0.0] * self.dimensions
        for token in tokenize(text):
            vec[_fnv1a(token) % self.dimensions] += 1.0
        norm = math.sqrt(sum(v * v for v in vec))
        if norm == 0.0:
            return vec  # empty text -> zero vector; cosine() yields 0.0
        return [v / norm for v in vec]

    def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._vectorize(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._vectorize(text)


class FakeTopicMemory:
    """Offline ``TopicMemoryReader`` — wraps a fixed ``list[PriorTopic]`` (task 24).

    The persistent evergreen store implementing this Protocol is task 27.
    """

    def __init__(self, topics: list[PriorTopic]) -> None:
        self._topics = list(topics)

    def prior_topics(self) -> list[PriorTopic]:
        return list(self._topics)


__all__ = [
    "FakeClaudeDriver",
    "STAGE_ARTIFACTS",
    "tokenize",
    "FakeEmbedder",
    "FakeTopicMemory",
]

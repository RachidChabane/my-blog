"""Offline test doubles for the content-engine harness.

``FakeClaudeDriver`` is an offline ``SlateDriver``: no ``claude``, no tmux, no
network. It drives state via cpe's **real** ``state.State`` (shape parity is a
requirement — resume tests must exercise the real on-disk shape, not fiction)
and writes minimal per-stage artifact stubs under ``plans/task-<id>/`` so
artifact/resume assertions test reality.

No fake ``Embedder`` / ``LLMProvider`` / web-search lives here — those belong to
tasks 24/27.
"""
from __future__ import annotations

import json
from datetime import UTC, datetime

from .config import PipelineConfig, ensure_cpe_importable
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


__all__ = ["FakeClaudeDriver", "STAGE_ARTIFACTS"]

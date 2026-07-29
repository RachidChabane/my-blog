"""Radar pipeline config -- the essay ``PipelineConfig`` with radar NAMESPACING.

The single load-bearing difference vs the essay engine (audit finding): the radar run
must NOT share ``runs_root`` / ``template_path`` / ``schedule_state_dir`` with the essay
slate, because ``cadence.run_id_for`` returns a bare ``%Y-%m-%d`` -- a same-day second
``cron run`` against shared paths would find the essay slate's ``tasks.yaml`` and RESUME
it instead of assembling a radar one. Pointing those three paths (plus the topic-memory
store) at radar-private locations makes the two pipelines independent: separate run-dirs,
separate heartbeat/pause/alert ledgers, separate dedup memory.
"""

from __future__ import annotations

import os
from pathlib import Path

from ..config import (
    CPE_BACKEND_ENV,
    PipelineConfig,
    _env_truthy,
    discover_cpe_home,
    discover_loop_bin,
)

# Radar-private paths (relative to repo_root).
RADAR_RUNS_REL = "pipeline/runs-radar"
RADAR_TEMPLATE_REL = "pipeline/radar/tasks-template.yaml"
RADAR_STATE_REL = "pipeline/schedule/state-radar"
RADAR_MEMORY_REL = "pipeline/memory/radar_memory.json"

# Radar drafts need one more review round than the essay default (2). Observed on the
# 2026-07-28 and 2026-07-29 runs: round 1 raises structural issues, the revise fixes them,
# and round 2 -- now reading a changed draft -- raises a NEW small issue with no round left
# to apply it. Both runs blocked at `draft` on `on_max_review_rounds: fail` over a one-word
# fix. A third round lets the loop converge without weakening the gate: `fail` still stands,
# so a draft that genuinely cannot pass review blocks and alerts rather than auto-approving.
RADAR_MAX_REVIEW_ROUNDS = 3


def radar_memory_path(repo_root: Path | str) -> Path:
    """The radar-private topic-memory store (separate from the essay store)."""
    return Path(repo_root) / RADAR_MEMORY_REL


def radar_config_from_env(repo_root: Path | str | None = None) -> PipelineConfig:
    """Build a radar ``PipelineConfig`` -- the essay ``from_env`` knobs + radar paths.

    Same env overrides as ``PipelineConfig.from_env`` (``PIPELINE_MODEL``,
    ``PIPELINE_GIT_PUSH``/``_REMOTE``/``_BRANCH``, alert/uptime URLs, cpe discovery), but
    ``runs_root`` / ``template_path`` / ``schedule_state_dir`` are radar-private so the
    radar schedule cannot collide with the essay one.
    """
    root = Path(repo_root) if repo_root is not None else Path.cwd()
    backend = os.environ.get(CPE_BACKEND_ENV) or "tmux"
    return PipelineConfig(
        repo_root=root,
        runs_root=root / RADAR_RUNS_REL,
        template_path=root / RADAR_TEMPLATE_REL,
        schedule_state_dir=root / RADAR_STATE_REL,
        max_review_rounds=RADAR_MAX_REVIEW_ROUNDS,
        loop_bin=discover_loop_bin(),
        cpe_home=discover_cpe_home(),
        claude_backend=backend,
        model=os.environ.get("PIPELINE_MODEL") or "sonnet",
        alert_webhook_url=os.environ.get("ALERT_WEBHOOK_URL") or None,
        uptime_ping_url=os.environ.get("UPTIME_PING_URL") or None,
        git_push=_env_truthy(os.environ.get("PIPELINE_GIT_PUSH")),
        git_remote=os.environ.get("PIPELINE_GIT_REMOTE") or "origin",
        git_branch=os.environ.get("PIPELINE_GIT_BRANCH") or "main",
    )


__all__ = [
    "RADAR_MAX_REVIEW_ROUNDS",
    "RADAR_RUNS_REL",
    "RADAR_TEMPLATE_REL",
    "RADAR_STATE_REL",
    "RADAR_MEMORY_REL",
    "radar_memory_path",
    "radar_config_from_env",
]

"""Pause/resume the editorial schedule (FR-F4) -- a leaf; stdlib only.

Pause is a ``schedule.json {"paused": bool}`` flag under ``schedule_state_dir``
(gitignored runtime state) -- "a config flag without a code change" (FR-F4). The
owner path is ``cron.py pause`` / ``cron.py resume``, which write that file with
no commit (a fresh checkout has no ``schedule.json`` -> defaults to running).

``PIPELINE_SCHEDULE_PAUSED`` is a TEST/CI-ONLY override (an env var baked into a
crontab ~= a code change, NOT the owner path); when present it wins so a test can
force a value without touching the filesystem.

Imports ``PipelineConfig`` only under ``TYPE_CHECKING`` (import-light); reads the
resolved ``schedule_state_dir`` off the passed config at call time.
"""
from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Mapping

    from ..config import PipelineConfig

PAUSE_ENV = "PIPELINE_SCHEDULE_PAUSED"
_TRUTHY = frozenset({"1", "true", "yes", "on"})


def pause_path(config: PipelineConfig) -> Path:
    """The pause flag file: ``schedule_state_dir / "schedule.json"``."""
    return config.schedule_state_dir / "schedule.json"


def is_paused(config: PipelineConfig, *, env: Mapping[str, str] | None = None) -> bool:
    """Whether the schedule is paused.

    Precedence: if ``PIPELINE_SCHEDULE_PAUSED`` is *present* in ``env`` -> parse
    truthy and return it (lets tests force a value); else read ``schedule.json``
    ``["paused"]``; a missing / unreadable / corrupt file -> ``False`` (default
    running, so a fresh checkout runs).
    """
    env = os.environ if env is None else env
    if PAUSE_ENV in env:
        return env[PAUSE_ENV].strip().lower() in _TRUTHY
    try:
        data = json.loads(pause_path(config).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return False
    return bool(data.get("paused", False)) if isinstance(data, dict) else False


def set_paused(config: PipelineConfig, paused: bool, *, now: datetime) -> Path:
    """Write ``schedule.json {"paused", "updated_at"}`` and return its path.

    What ``cron.py pause`` / ``resume`` call -- no code change, no commit (the
    file is gitignored runtime state). ``now`` is injected (no ``datetime.now``).
    """
    path = pause_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"paused": bool(paused), "updated_at": now.astimezone(UTC).isoformat()}
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return path


__all__ = ["PAUSE_ENV", "pause_path", "is_paused", "set_paused"]

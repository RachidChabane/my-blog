"""Heartbeat ledger + the monitor's MISSED/STALLED verdict (FR-F1/FR-F2).

Imports the leaves ``cadence`` + ``alert`` + ``pause``. It must **never** import
``from .cron`` / ``import ...cron`` -- that back-edge would double-import ``cron``
at ``__main__`` time when the monitor runs as ``python -m pipeline.schedule.cron``
[MEM: pipeline-stages-import-light-runpy]. A static guard test (F3) locks this.

Two-record scheme (distinguishes STALLED from MISSED): a run writes a ``started``
record at launch and a terminal (``ok``/``failed``/``blocked``) record at the end
(``cron.run_scheduled``). A crash/asleep mid-run leaves a lone ``started`` ->
STALLED candidate; a launcher that never fired leaves **no record** -> MISSED
candidate. This is why a long usage-limit sleep (< grace) reads as a benign
``pending``, never a false MISSED.

Ownership split: ``run_scheduled`` owns ``RUN_FAILED``/``RUN_BLOCKED`` at run
time; the monitor (here) owns ``RUN_MISSED``/``RUN_STALLED`` only -- it treats a
``failed``/``blocked`` terminal as ``ok`` (the period self-reported; the run-time
path already alerted it).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import TYPE_CHECKING

from . import pause
from .alert import RUN_MISSED, RUN_STALLED, Alert, AlertSink
from .cadence import DEFAULT_CADENCE, Cadence, run_id_for

if TYPE_CHECKING:
    from ..config import PipelineConfig

_TERMINAL = frozenset({"ok", "failed", "blocked"})


@dataclass(frozen=True)
class HeartbeatRecord:
    """One run event, appended to ``heartbeat.jsonl``."""

    run_id: str
    when: datetime                 # UTC
    status: str                    # "started" | "ok" | "failed" | "blocked" | "paused"
    reason: str | None = None
    topic_id: str | None = None

    def to_json(self) -> dict:
        return {
            "run_id": self.run_id,
            "when": self.when.astimezone(UTC).isoformat(),
            "status": self.status,
            "reason": self.reason,
            "topic_id": self.topic_id,
        }

    @classmethod
    def from_json(cls, d: dict) -> HeartbeatRecord:
        return cls(
            run_id=d["run_id"],
            when=datetime.fromisoformat(d["when"]),
            status=d["status"],
            reason=d.get("reason"),
            topic_id=d.get("topic_id"),
        )


@dataclass(frozen=True)
class HeartbeatVerdict:
    """The monitor's read of one period."""

    status: str            # "ok" | "missed" | "stalled" | "paused" | "pending"
    run_id: str            # the EXPECTED period: run_id_for(previous_fire(now))
    prev_fire: datetime
    next_fire: datetime
    reason: str
    record: HeartbeatRecord | None


def ledger_path(config: PipelineConfig) -> Path:
    """The append-only run ledger: ``schedule_state_dir / "heartbeat.jsonl"``."""
    return config.schedule_state_dir / "heartbeat.jsonl"


def append_heartbeat(config: PipelineConfig, record: HeartbeatRecord) -> None:
    """Append one JSONL line for ``record`` (mkdir parents)."""
    path = ledger_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record.to_json(), ensure_ascii=False) + "\n")


def read_ledger(config: PipelineConfig) -> list[HeartbeatRecord]:
    """Parse the ledger; blank/corrupt lines are SKIPPED (never raises) so one bad
    append can't wedge the monitor."""
    try:
        text = ledger_path(config).read_text(encoding="utf-8")
    except OSError:
        return []
    records: list[HeartbeatRecord] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        try:
            records.append(HeartbeatRecord.from_json(json.loads(stripped)))
        except (ValueError, KeyError, TypeError):
            continue
    return records


def check_heartbeat(
    config: PipelineConfig,
    *,
    now: datetime,
    cadence: Cadence = DEFAULT_CADENCE,
    grace_hours: int | None = None,
) -> HeartbeatVerdict:
    """Classify the most recent expected period (order matters -- plan §2.5 step 5)."""
    now = now.astimezone(UTC)
    prev = cadence.previous_fire(now)
    nxt = cadence.next_fire(now)
    period = run_id_for(prev)

    # 1. PAUSED short-circuit FIRST -- before any overdue computation, else a paused
    #    schedule floods MISSED on every monitor tick (the explicit bug to avoid).
    if pause.is_paused(config):
        return HeartbeatVerdict(
            "paused", period, prev, nxt,
            f"schedule paused; expected run {period} (fire {prev.isoformat()}) "
            "intentionally skipped",
            None,
        )

    # 2. grace window (owner knob; NFR-8 usage-limit sleeps shorter than this are benign)
    hours = grace_hours if grace_hours is not None else config.schedule_grace_hours
    grace = timedelta(hours=hours)

    # 4. THE I1 FIX: match the period by run_id (calendar day), NEVER `r.when >= prev`
    #    -- the 07:00-UTC healthy record of a 09:00-UTC-framed slot would otherwise
    #    be dropped as < prev and mis-read as MISSED on every healthy run (plan §0.6).
    records = [r for r in read_ledger(config) if r.run_id == period]
    paused_recs = [r for r in records if r.status == "paused"]
    terminal_recs = [r for r in records if r.status in _TERMINAL]
    started_recs = [r for r in records if r.status == "started"]

    # 5. classify (nested -- terminal BEFORE stalled keeps the monitor from re-alerting
    #    a run-time failure; started-within-grace -> pending BEFORE anything says missed).
    if paused_recs:
        return HeartbeatVerdict(
            "ok", period, prev, nxt,
            f"run {period} intentionally skipped (paused slot)", paused_recs[-1],
        )
    if terminal_recs:
        last = max(terminal_recs, key=lambda r: r.when)
        return HeartbeatVerdict(
            "ok", period, prev, nxt,
            f"run {period} self-reported {last.status}", last,
        )
    if started_recs:
        last = max(started_recs, key=lambda r: r.when)
        if now - last.when > grace:
            return HeartbeatVerdict(
                "stalled", period, prev, nxt,
                f"run {period} started {last.when.isoformat()} but did not finish "
                f"within {hours}h grace",
                last,
            )
        return HeartbeatVerdict(
            "pending", period, prev, nxt,
            f"run {period} in flight (started {last.when.isoformat()}, within {hours}h "
            "grace)",
            last,
        )
    # no records for the period
    if now - prev > grace:
        return HeartbeatVerdict(
            "missed", period, prev, nxt,
            f"expected run {period} (fire {prev.isoformat()}) has no record after "
            f"{hours}h grace",
            None,
        )
    return HeartbeatVerdict(
        "pending", period, prev, nxt,
        f"run {period} (fire {prev.isoformat()}) not yet due (within {hours}h grace)",
        None,
    )


def _already_alerted(config: PipelineConfig, kind: str, run_id: str) -> bool:
    """Whether ``alerts.jsonl`` already holds a same-``(kind, run_id)`` alert (dedup knob)."""
    path = config.schedule_state_dir / "alerts.jsonl"
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        try:
            d = json.loads(stripped)
        except ValueError:
            continue
        if d.get("kind") == kind and d.get("run_id") == run_id:
            return True
    return False


def check_and_alert(
    config: PipelineConfig,
    sink: AlertSink,
    *,
    now: datetime,
    cadence: Cadence = DEFAULT_CADENCE,
    grace_hours: int | None = None,
    dedup: bool = False,
) -> HeartbeatVerdict:
    """Run ``check_heartbeat``; emit a MISSED/STALLED alert when due.

    Re-emits on every monitor tick by design = reminder-until-resolved. ``dedup``
    (a documented knob, NOT default) scans ``alerts.jsonl`` for an existing
    same-``(kind, run_id)`` alert and skips. The monitor never alerts ``ok`` /
    ``pending`` / ``paused`` (the run-time path owns failed/blocked).
    """
    verdict = check_heartbeat(config, now=now, cadence=cadence, grace_hours=grace_hours)
    kind = {"missed": RUN_MISSED, "stalled": RUN_STALLED}.get(verdict.status)
    if kind is None:
        return verdict
    if dedup and _already_alerted(config, kind, verdict.run_id):
        return verdict
    sink.emit(
        Alert(
            kind=kind,
            run_id=verdict.run_id,
            reason=verdict.reason,
            when=now,
            detail={
                "prev_fire": verdict.prev_fire.isoformat(),
                "next_fire": verdict.next_fire.isoformat(),
            },
        )
    )
    return verdict


__all__ = [
    "HeartbeatRecord",
    "HeartbeatVerdict",
    "ledger_path",
    "append_heartbeat",
    "read_ledger",
    "check_heartbeat",
    "check_and_alert",
]

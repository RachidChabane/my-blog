"""Cadence math for the editorial schedule -- the import LEAF (stdlib only).

No ``pipeline.*`` imports, no cpe, no network: this module is what makes the
no-runpy split work. ``heartbeat`` imports ``from .cadence import ...``; it must
NEVER import ``from .cron`` (that back-edge would double-import ``cron`` at
``__main__`` time) [MEM: pipeline-stages-import-light-runpy].

All datetimes are **tz-aware UTC**. Every public function takes an injected
``now`` and never calls ``datetime.now()`` itself -- determinism + testability.

The dual-frame note (the I1 fix, plan §0.6): macOS cron fires ``0 9 * * 1,4`` at
**09:00 LOCAL** (= 07:00 UTC in Paris summer), but this ``Cadence`` is UTC-framed
(``hour=9``). The two are reconciled by ``run_id_for`` -- the calendar-day period
key shared by the run (the day it ran) and the monitor (the day of the expected
fire), so a healthy 07:00-UTC ``ok`` record matches the 09:00-UTC expected slot.
Holds for any offset west of UTC+10; far-east would need a local-tz Cadence.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta


@dataclass(frozen=True)
class Cadence:
    """A twice-weekly fire schedule, UTC-framed.

    ``weekdays`` use ``date.weekday()`` numbering (Mon=0 .. Sun=6); the default
    ``(0, 3)`` is Mon & Thu. ``hour``/``minute`` are the UTC-framed fire time
    (the local cron entry uses 09:00 *local* clock time -- see the module-level
    dual-frame note; the frames are reconciled by ``run_id_for``).
    """

    weekdays: tuple[int, ...] = (0, 3)
    hour: int = 9
    minute: int = 0

    def fire_on(self, day: date) -> datetime:
        """The fire datetime (tz-aware UTC) for a given calendar ``day``."""
        return datetime(day.year, day.month, day.day, self.hour, self.minute, tzinfo=UTC)

    def previous_fire(self, now: datetime) -> datetime:
        """Latest fire ``<= now`` (walk back <= 7 days over ``weekdays``).

        Iterating offsets ascending (today first), the first fire ``<= now`` is
        the latest one -- so the fire instant itself counts as its own
        ``previous_fire`` (boundary inclusive, which the run_id period key needs).
        """
        now = now.astimezone(UTC)
        for offset in range(8):
            day = (now - timedelta(days=offset)).date()
            if day.weekday() in self.weekdays:
                fire = self.fire_on(day)
                if fire <= now:
                    return fire
        raise ValueError(f"no fire weekday in {self.weekdays!r} within 7 days of {now}")

    def next_fire(self, now: datetime) -> datetime:
        """Earliest fire strictly ``> now`` (walk forward <= 7 days)."""
        now = now.astimezone(UTC)
        for offset in range(8):
            day = (now + timedelta(days=offset)).date()
            if day.weekday() in self.weekdays:
                fire = self.fire_on(day)
                if fire > now:
                    return fire
        raise ValueError(f"no fire weekday in {self.weekdays!r} within 7 days of {now}")


def run_id_for(when: datetime) -> str:
    """The period key: the UTC calendar day of ``when`` (``YYYY-MM-DD``).

    Used by BOTH the run (the day it ran, stamped in ``run_scheduled``) and the
    monitor (the day of the expected fire, ``run_id_for(previous_fire(now))``).
    Absorbing the dual-frame here is the I1 fix (plan §0.6).
    """
    return when.astimezone(UTC).strftime("%Y-%m-%d")


# One source of truth the rest of the package shares (cron + heartbeat).
DEFAULT_CADENCE = Cadence()


__all__ = ["Cadence", "run_id_for", "DEFAULT_CADENCE"]

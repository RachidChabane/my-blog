"""Alert delivery for the editorial schedule (FR-F2) -- a leaf; stdlib only.

The delivery layer FR-F2 needs: an ``Alert`` that NAMES the reason, an
``AlertSink`` Protocol, and concrete File/Log/Collecting/Multi sinks. Run-time
``failed``/``blocked`` alerts come from ``cron.run_scheduled``; the monitor's
``missed``/``stalled`` alerts come from ``heartbeat.check_and_alert``.

POST-SECRET seam (do not over-claim): ``EmailAlertSink`` / ``WebhookAlertSink``
are the live owner-notification channels (env var e.g. ``ALERT_WEBHOOK_URL``);
they are POST-SECRET and intentionally **not built** here -- the build ships
File/Log/Collecting only, behind this same Protocol. A local monitor also cannot
detect a machine that is asleep/off (it shares the runner's failure domain); the
robust form is an **external uptime-ping dead-man's-switch**, also POST-SECRET.

No ``pipeline.*`` runtime imports (leaf).
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from collections.abc import Callable, Sequence
    from typing import TextIO

# kind constants (FR-F2 "naming the reason")
RUN_FAILED = "run_failed"     # exit != 0, not a clean block (run-time, run_scheduled)
RUN_BLOCKED = "run_blocked"   # a task blocked / terminal_failure (run-time, run_scheduled)
RUN_MISSED = "run_missed"     # expected fire had no run (monitor)
RUN_STALLED = "run_stalled"   # run started, never finished within grace (monitor)


@dataclass(frozen=True)
class Alert:
    """A delivered notification. ``reason`` is a human sentence naming the cause."""

    kind: str
    run_id: str
    reason: str
    when: datetime              # UTC, injected
    topic_id: str | None = None
    detail: dict | None = None

    def to_json(self) -> dict:
        """A stable-key-order JSON dict; ``when`` as an ISO UTC string."""
        return {
            "kind": self.kind,
            "run_id": self.run_id,
            "reason": self.reason,
            "when": self.when.astimezone(UTC).isoformat(),
            "topic_id": self.topic_id,
            "detail": self.detail,
        }

    def format_line(self) -> str:
        """One-line human form, e.g. ``[ALERT run_blocked] run=2026-06-04 draft blocked``."""
        return f"[ALERT {self.kind}] run={self.run_id} {self.reason}"


class AlertSink(Protocol):
    """Delivers one ``Alert`` somewhere (file, log, email, webhook, ...)."""

    def emit(self, alert: Alert) -> None: ...


class CollectingAlertSink:
    """In-memory sink for tests: emitted alerts land in ``.alerts``."""

    def __init__(self) -> None:
        self.alerts: list[Alert] = []

    def emit(self, alert: Alert) -> None:
        self.alerts.append(alert)


class LogAlertSink:
    """Prints ``alert.format_line()`` to a stream (default ``sys.stderr``)."""

    def __init__(self, stream: TextIO | None = None) -> None:
        self.stream = stream if stream is not None else sys.stderr

    def emit(self, alert: Alert) -> None:
        print(alert.format_line(), file=self.stream)


class FileAlertSink:
    """Appends one JSONL line per alert to ``path`` (``alerts.jsonl``; mkdir parents)."""

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)

    def emit(self, alert: Alert) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(alert.to_json(), ensure_ascii=False) + "\n")


class MultiAlertSink:
    """Fan-out to several sinks.

    Unattended robustness: a sink that raises is caught + logged to stderr, and
    the remaining sinks still fire -- one broken channel must not swallow the
    others.
    """

    def __init__(self, sinks: Sequence[AlertSink]) -> None:
        self.sinks = list(sinks)

    def emit(self, alert: Alert) -> None:
        for sink in self.sinks:
            try:
                sink.emit(alert)
            except Exception as exc:  # noqa: BLE001 - isolate one channel's failure
                print(
                    f"[ALERT-SINK-ERROR] {type(sink).__name__}: {exc}",
                    file=sys.stderr,
                )


class WebhookAlertSink:
    """POSTs ``alert.to_json()`` as a JSON body to a webhook URL (M-14 owner channel).

    The live owner-notification channel named in the module docstring: a generic
    JSON webhook (Slack/Discord/ntfy/Zapier/your own endpoint), URL from the env
    var ``ALERT_WEBHOOK_URL``. Stays behind the ``AlertSink`` Protocol, so it drops
    into ``_default_sink``'s ``MultiAlertSink`` next to File/Log.

    Delivery contract: a non-2xx response or a transport error RAISES -- so a dead
    channel surfaces, and ``MultiAlertSink`` (which isolates a raising sink) still
    fires File/Log. ``urlopen`` is injectable for the offline test (no network).
    """

    def __init__(
        self,
        url: str,
        *,
        timeout: float = 10.0,
        urlopen: Callable[..., object] | None = None,
    ) -> None:
        self.url = url
        self.timeout = timeout
        # default bound lazily so a test can inject a stub without touching the net
        self._urlopen = urlopen if urlopen is not None else urllib.request.urlopen

    def emit(self, alert: Alert) -> None:
        body = json.dumps(alert.to_json(), ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.url,
            data=body,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        with self._urlopen(request, timeout=self.timeout) as resp:
            status = getattr(resp, "status", None) or resp.getcode()
            resp.read()
            if status is not None and not (200 <= int(status) < 300):
                raise urllib.error.HTTPError(
                    self.url, int(status), "webhook rejected the alert", hdrs=None, fp=None
                )


def ping_uptime(
    url: str,
    *,
    timeout: float = 10.0,
    urlopen: Callable[..., object] | None = None,
) -> bool:
    """Best-effort success ping to an EXTERNAL dead-man's-switch (M-14).

    A local monitor shares the runner's failure domain -- it cannot detect a
    machine that is asleep/off. The robust complement is an external uptime
    service (healthchecks.io, cron-monitor, Uptime Kuma push, ...): the runner
    pings ``url`` on every healthy beat; if the pings STOP, that external service
    -- which does NOT share our failure domain -- raises the alarm.

    Best-effort by design: a failed ping must NEVER fail the editorial run, so all
    errors are swallowed. Returns ``True`` iff the ping was delivered (2xx).
    """
    opener = urlopen if urlopen is not None else urllib.request.urlopen
    try:
        with opener(url, timeout=timeout) as resp:
            status = getattr(resp, "status", None) or resp.getcode()
            resp.read()
            return status is None or 200 <= int(status) < 300
    except Exception as exc:  # noqa: BLE001 - a dead ping must not break the run
        print(f"[UPTIME-PING-ERROR] {url}: {exc}", file=sys.stderr)
        return False


def alert_from_terminal_json(payload: dict, *, run_id: str, now: datetime) -> Alert:
    """Bridge fallback's ``plans/ALERT.json`` artifact -> an ``Alert`` (delivery).

    Maps ``{kind:"terminal_failure", blocked_task, reason, topic_id}`` ->
    ``Alert(kind=RUN_BLOCKED, run_id, reason, when=now, topic_id,
    detail={"blocked_task": ...})`` [MEM: m4-gate-contract].
    """
    return Alert(
        kind=RUN_BLOCKED,
        run_id=run_id,
        reason=payload.get("reason", "terminal failure"),
        when=now,
        topic_id=payload.get("topic_id"),
        detail={"blocked_task": payload.get("blocked_task")},
    )


__all__ = [
    "RUN_FAILED",
    "RUN_BLOCKED",
    "RUN_MISSED",
    "RUN_STALLED",
    "Alert",
    "AlertSink",
    "CollectingAlertSink",
    "LogAlertSink",
    "FileAlertSink",
    "MultiAlertSink",
    "WebhookAlertSink",
    "ping_uptime",
    "alert_from_terminal_json",
]

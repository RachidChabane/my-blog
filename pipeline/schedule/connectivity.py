"""Pre-flight API reachability gate + cross-job run lock for the scheduled pipelines.

Why this exists (2026-09-25): from 2026-09-21 every 07:00 radar and 09:00 essay
run died the same way -- the Claude TUI's FIRST API call failed with
``Connection refused`` after ~3 minutes of retries, the session then idled until
the 30-minute phase cap, and the run ended "incomplete" with nothing published.
The same job kickstarted in the afternoon worked, so the fault is a time-bounded
network condition outside the pipeline. Rather than burn a phase and a whole
day, a run now waits (bounded) for the API to accept a TLS connection before it
drives anything, and every failed probe is logged with the resolved addresses
and the exact error so the cron log itself diagnoses the outage.

Layers: ``wait_until_reachable`` is the pure policy (probe, clock and sleep are
injected); ``tls_probe`` is the real socket adapter; ``run_lock`` serialises the
radar and essay jobs, because a delayed radar run must never overlap the essay
run (both commit to ``main`` with ``git add -A``).
"""
from __future__ import annotations

import fcntl
import socket
import ssl
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Callable, Iterator

API_HOST = "api.anthropic.com"
API_PORT = 443
PROBE_TIMEOUT_SECONDS = 10.0
RETRY_INTERVAL_SECONDS = 5 * 60
MAX_WAIT_SECONDS = 3 * 60 * 60
RUN_LOCK_FILENAME = "pipeline-run.lock"
# Shared by BOTH jobs (the essay state dir; gitignored). The radar keeps its own
# ledgers in state-radar/, but the lock must be one file for the two to exclude.
SHARED_LOCK_DIR_REL = ("pipeline", "schedule", "state")


def shared_lock_dir(repo_root: Path) -> Path:
    return repo_root.joinpath(*SHARED_LOCK_DIR_REL)


@dataclass(frozen=True)
class ProbeResult:
    """One reachability attempt: ``ok`` plus what DNS said and why it failed."""

    ok: bool
    addresses: tuple[str, ...] = ()
    error: str | None = None

    def describe(self) -> str:
        addrs = ", ".join(self.addresses) or "unresolved"
        return "reachable" if self.ok else f"unreachable ({self.error}); resolved to {addrs}"


@dataclass(frozen=True)
class WaitOutcome:
    """The gate's verdict: the last probe plus every failed attempt, for the alert."""

    reachable: bool
    last: ProbeResult
    failures: tuple[ProbeResult, ...] = field(default_factory=tuple)
    waited_seconds: float = 0.0


def _resolve(host: str, port: int) -> tuple[str, ...]:
    try:
        infos = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
    except OSError:
        return ()
    return tuple(dict.fromkeys(info[4][0] for info in infos))


def tls_probe(
    host: str = API_HOST, port: int = API_PORT, timeout: float = PROBE_TIMEOUT_SECONDS
) -> ProbeResult:
    """Real adapter: resolve, then complete a TCP connect AND a TLS handshake."""
    addresses = _resolve(host, port)
    try:
        with socket.create_connection((host, port), timeout=timeout) as raw:
            with ssl.create_default_context().wrap_socket(raw, server_hostname=host):
                return ProbeResult(ok=True, addresses=addresses)
    except (OSError, ssl.SSLError) as exc:
        return ProbeResult(ok=False, addresses=addresses, error=f"{type(exc).__name__}: {exc}")


def wait_until_reachable(
    probe: Callable[[], ProbeResult],
    *,
    clock: Callable[[], float],
    sleep: Callable[[float], None],
    log: Callable[[str], None],
    interval: float = RETRY_INTERVAL_SECONDS,
    max_wait: float = MAX_WAIT_SECONDS,
) -> WaitOutcome:
    """Probe until reachable or ``max_wait`` elapses; log every failed attempt."""
    start = clock()
    failures: list[ProbeResult] = []
    while True:
        result = probe()
        waited = clock() - start
        if result.ok:
            if failures:
                log(f"[connectivity] {API_HOST} reachable again after {waited:.0f}s")
            return WaitOutcome(True, result, tuple(failures), waited)
        failures.append(result)
        log(f"[connectivity] attempt {len(failures)}: {API_HOST} {result.describe()}")
        if waited + interval > max_wait:
            return WaitOutcome(False, result, tuple(failures), waited)
        sleep(interval)


@contextmanager
def run_lock(state_dir: Path) -> Iterator[None]:
    """Exclusive, blocking, process-lifetime lock shared by every scheduled job."""
    state_dir.mkdir(parents=True, exist_ok=True)
    with (state_dir / RUN_LOCK_FILENAME).open("w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


__all__ = [
    "API_HOST",
    "MAX_WAIT_SECONDS",
    "RETRY_INTERVAL_SECONDS",
    "ProbeResult",
    "WaitOutcome",
    "run_lock",
    "shared_lock_dir",
    "tls_probe",
    "wait_until_reachable",
]

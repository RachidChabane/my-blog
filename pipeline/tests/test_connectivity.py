"""Pre-flight API gate + shared run lock (pipeline/schedule/connectivity.py).

Regression for the 2026-09-21..25 outage: every scheduled run hit
``Connection refused`` on its first model call, idled to the phase cap and
published nothing. A run must now wait (bounded) for the API, log what DNS said
and why each probe failed, and never drive against an unreachable API.
"""
from __future__ import annotations

import fcntl
from datetime import UTC, datetime

import pytest

from pipeline.config import PipelineConfig
from pipeline.schedule import connectivity, cron, heartbeat, pause
from pipeline.schedule.alert import API_UNREACHABLE, CollectingAlertSink
from pipeline.schedule.connectivity import ProbeResult, WaitOutcome, wait_until_reachable

_NOW = datetime(2026, 9, 25, 5, 0, tzinfo=UTC)
_REFUSED = ProbeResult(ok=False, addresses=("160.79.104.10",), error="ConnectionRefusedError")
_OK = ProbeResult(ok=True, addresses=("160.79.104.10",))


class _FakeClock:
    def __init__(self) -> None:
        self.now = 0.0
        self.sleeps: list[float] = []

    def __call__(self) -> float:
        return self.now

    def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now += seconds


def _scripted(*results: ProbeResult):
    it = iter(results)
    return lambda: next(it)


@pytest.fixture
def config(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    return PipelineConfig(repo_root=repo, schedule_state_dir=repo / "state")


def test_reachable_first_try_does_not_sleep_or_log():
    clock, lines = _FakeClock(), []
    out = wait_until_reachable(_scripted(_OK), clock=clock, sleep=clock.sleep, log=lines.append)
    assert out.reachable and out.failures == () and clock.sleeps == [] and lines == []


def test_recovers_after_refusals_and_logs_each_attempt_with_dns():
    clock, lines = _FakeClock(), []
    out = wait_until_reachable(
        _scripted(_REFUSED, _REFUSED, _OK),
        clock=clock, sleep=clock.sleep, log=lines.append, interval=300, max_wait=3600,
    )
    assert out.reachable and len(out.failures) == 2
    assert clock.sleeps == [300, 300]
    assert "ConnectionRefusedError" in lines[0] and "160.79.104.10" in lines[0]
    assert lines[-1].endswith("reachable again after 600s")


def test_gives_up_within_the_wait_budget():
    clock, lines = _FakeClock(), []
    out = wait_until_reachable(
        lambda: _REFUSED, clock=clock, sleep=clock.sleep, log=lines.append,
        interval=300, max_wait=900,
    )
    assert not out.reachable
    assert sum(clock.sleeps) <= 900
    assert len(out.failures) == 4  # probes at t=0, 300, 600, 900


def test_preflight_unreachable_alerts_records_and_blocks(config):
    sink = CollectingAlertSink()
    outcome = WaitOutcome(False, _REFUSED, (_REFUSED, _REFUSED), 10800)
    assert not cron.api_preflight(config, sink, run_id="2026-09-25", now=_NOW, wait=lambda: outcome)
    [alert] = sink.alerts
    assert alert.kind == API_UNREACHABLE and "api.anthropic.com" in alert.reason
    assert heartbeat.read_ledger(config)[-1].status == "failed"


def test_preflight_reachable_lets_the_run_proceed_silently(config):
    sink = CollectingAlertSink()
    ok = WaitOutcome(True, _OK)
    assert cron.api_preflight(config, sink, run_id="2026-09-25", now=_NOW, wait=lambda: ok)
    assert sink.alerts == [] and heartbeat.read_ledger(config) == []


def test_preflight_skips_the_wait_while_paused(config):
    pause.set_paused(config, True, now=_NOW)

    def must_not_wait() -> WaitOutcome:
        raise AssertionError("paused runs must not probe or wait")

    assert cron.api_preflight(
        config, CollectingAlertSink(), run_id="2026-09-25", now=_NOW, wait=must_not_wait
    )


def test_run_lock_excludes_a_second_holder(tmp_path):
    lock_dir = tmp_path / "state"
    with connectivity.run_lock(lock_dir):
        with (lock_dir / connectivity.RUN_LOCK_FILENAME).open("w") as other:
            with pytest.raises(BlockingIOError):
                fcntl.flock(other, fcntl.LOCK_EX | fcntl.LOCK_NB)
    with (lock_dir / connectivity.RUN_LOCK_FILENAME).open("w") as other:
        fcntl.flock(other, fcntl.LOCK_EX | fcntl.LOCK_NB)  # released on exit


def test_both_jobs_share_one_lock_dir(tmp_path):
    from pipeline.radar.config import radar_config_from_env  # noqa: PLC0415

    essay = PipelineConfig(repo_root=tmp_path)
    radar = radar_config_from_env(tmp_path)
    assert essay.schedule_state_dir != radar.schedule_state_dir
    assert connectivity.shared_lock_dir(essay.repo_root) == connectivity.shared_lock_dir(
        radar.repo_root
    )

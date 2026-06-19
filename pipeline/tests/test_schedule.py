"""Offline tests for the editorial schedule (task 28, M-5).

Every test runs offline: cadence/pause/alert/heartbeat are pure stdlib; the
``run_scheduled`` integration drives cpe's real ``state.State`` via the
``FakeClaudeDriver`` (no claude/tmux/network). No secrets. ``now`` is ALWAYS an
injected tz-aware UTC datetime -- a naive datetime through ``run_id_for`` would be
read as system-local and silently shift the period key.

The ``_rec`` helper stamps ``run_id = run_id_for(cadence.fire_on(fire_day))`` so
every seeded record carries the run_id of its fire day -- the I1 discipline (a
hand-typed run_id would silently not match the period the monitor computes).
"""

from __future__ import annotations

import ast
import json
import os
import shutil
import subprocess
import sys
import urllib.error
from dataclasses import replace
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace

import pytest

from pipeline.config import PipelineConfig
from pipeline.fakes import FakeClaudeDriver
from pipeline.schedule import cron, deploy, heartbeat, pause
from pipeline.schedule.alert import (
    RUN_BLOCKED,
    RUN_FAILED,
    RUN_MISSED,
    RUN_STALLED,
    Alert,
    CollectingAlertSink,
    FileAlertSink,
    MultiAlertSink,
    WebhookAlertSink,
    alert_from_terminal_json,
    ping_uptime,
)
from pipeline.schedule.cadence import DEFAULT_CADENCE, run_id_for
from pipeline.schedule.heartbeat import (
    HeartbeatRecord,
    check_and_alert,
    check_heartbeat,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]
_PIPELINE_DIR = Path(__file__).resolve().parents[1]

# Known calendar days (2026-06-01 is a Monday; 2026-06-04 a Thursday).
_MON = datetime(2026, 6, 1, tzinfo=UTC).date()
_THU = datetime(2026, 6, 4, tzinfo=UTC).date()
# Mon 09:00 UTC -> the launch instant for the run_id "2026-06-01".
_NOW = datetime(2026, 6, 1, 9, 0, tzinfo=UTC)
# A Tuesday at noon (daily cadence: its own fire is Tue 09:00) -- the A-section cadence
# test uses it to show daily fires every weekday.
_TUE = datetime(2026, 6, 2, 12, 0, tzinfo=UTC)
# Mon 16:00 UTC: 7h past the 09:00 fire (> the 6h grace) on the SAME calendar day as the
# seeded Mon records -- a present record still matches by run_id; an absent one -> MISSED.
_MON_LATE = datetime(2026, 6, 1, 16, 0, tzinfo=UTC)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def config(tmp_path):
    """A PipelineConfig over a tmp repo with an isolated schedule state dir.

    Enough for the cadence/pause/alert/heartbeat unit tests (no slate assembly).
    """
    repo = tmp_path / "repo"
    repo.mkdir()
    return PipelineConfig(repo_root=repo, schedule_state_dir=repo / "state")


@pytest.fixture
def integration_config(tmp_path):
    """config that can ALSO assemble a slate: copies the real template + the files its
    defaults point at, exactly like ``test_runner.py``'s fixture (review C3)."""
    repo = tmp_path / "repo"
    (repo / "pipeline").mkdir(parents=True)
    for name in ("tasks-template.yaml", "house_style.md", "invariants.yaml"):
        shutil.copy(_PIPELINE_DIR / name, repo / "pipeline" / name)
    return PipelineConfig(
        repo_root=repo,
        runs_root=repo / "pipeline" / "runs",
        schedule_state_dir=repo / "state",
    )


def _rec(status, *, fire_day, when=None, reason=None, topic_id=None, cadence=DEFAULT_CADENCE):
    fire = cadence.fire_on(fire_day)
    return HeartbeatRecord(
        run_id=run_id_for(fire),
        when=when if when is not None else fire,
        status=status,
        reason=reason,
        topic_id=topic_id,
    )


# ---------------------------------------------------------------------------
# A. Cadence (the LEAF)
# ---------------------------------------------------------------------------


def test_previous_next_fire_daily():
    c = DEFAULT_CADENCE
    assert c.previous_fire(_TUE) == datetime(2026, 6, 2, 9, 0, tzinfo=UTC)  # Tue's own fire
    assert c.next_fire(_TUE) == datetime(2026, 6, 3, 9, 0, tzinfo=UTC)  # Wed (daily)


def test_previous_next_fire_includes_weekends():
    c = DEFAULT_CADENCE
    fri = datetime(2026, 6, 5, 12, 0, tzinfo=UTC)  # Friday
    assert c.previous_fire(fri) == datetime(2026, 6, 5, 9, 0, tzinfo=UTC)  # Fri's own fire
    assert c.next_fire(fri) == datetime(2026, 6, 6, 9, 0, tzinfo=UTC)  # Sat (daily incl weekend)
    sun = datetime(2026, 6, 7, 12, 0, tzinfo=UTC)  # Sunday
    assert c.next_fire(sun) == datetime(2026, 6, 8, 9, 0, tzinfo=UTC)  # Mon


def test_fire_instant_is_its_own_previous_fire():
    c = DEFAULT_CADENCE
    assert c.previous_fire(_NOW) == _NOW  # inclusive on the fire instant
    assert c.next_fire(_NOW) == datetime(2026, 6, 2, 9, 0, tzinfo=UTC)  # next day (daily)


def test_run_id_for_is_utc_calendar_day():
    # the 07:00-UTC (= 09:00 Paris-summer) and 09:00-UTC instants share a period key
    a = run_id_for(datetime(2026, 6, 1, 7, 0, tzinfo=UTC))
    b = run_id_for(datetime(2026, 6, 1, 9, 0, tzinfo=UTC))
    assert a == b == "2026-06-01"


# ---------------------------------------------------------------------------
# B. Pause (FR-F4)
# ---------------------------------------------------------------------------


def test_pause_default_false_then_file_roundtrip(config):
    assert pause.is_paused(config, env={}) is False
    path = pause.set_paused(config, True, now=_NOW)
    assert path == config.schedule_state_dir / "schedule.json"
    assert pause.is_paused(config, env={}) is True
    pause.set_paused(config, False, now=_NOW)
    assert pause.is_paused(config, env={}) is False


def test_pause_env_override_both_ways_and_truthy(config, monkeypatch):
    pause.set_paused(config, True, now=_NOW)  # file says paused
    monkeypatch.setenv(pause.PAUSE_ENV, "0")
    assert pause.is_paused(config) is False  # env wins -> running
    for truthy in ("1", "true", "TRUE", "On", "yes"):
        monkeypatch.setenv(pause.PAUSE_ENV, truthy)
        assert pause.is_paused(config) is True
    for falsy in ("0", "false", "no", ""):
        monkeypatch.setenv(pause.PAUSE_ENV, falsy)
        assert pause.is_paused(config) is False


# ---------------------------------------------------------------------------
# C. AlertSink delivery (FR-F2)
# ---------------------------------------------------------------------------


def test_collecting_sink_reason_named():
    sink = CollectingAlertSink()
    sink.emit(Alert(RUN_MISSED, "2026-06-01", "expected Mon 09:00 fire had no run", _NOW))
    assert len(sink.alerts) == 1
    assert sink.alerts[0].kind == RUN_MISSED and sink.alerts[0].run_id == "2026-06-01"
    assert sink.alerts[0].reason == "expected Mon 09:00 fire had no run"  # names the cause


def test_file_sink_jsonl_and_multi_fanout(config):
    path = config.schedule_state_dir / "alerts.jsonl"
    coll = CollectingAlertSink()
    multi = MultiAlertSink([coll, FileAlertSink(path)])
    a = Alert(RUN_STALLED, "2026-06-01", "stalled", _NOW, detail={"x": 1})
    multi.emit(a)
    multi.emit(a)
    lines = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    assert len(lines) == 2
    assert lines[0]["kind"] == RUN_STALLED and lines[0]["run_id"] == "2026-06-01"
    assert len(coll.alerts) == 2


def test_multi_sink_isolates_a_raising_sink(config):
    class Boom:
        def emit(self, _alert):
            raise RuntimeError("channel down")

    coll = CollectingAlertSink()
    MultiAlertSink([Boom(), coll]).emit(Alert(RUN_FAILED, "x", "r", _NOW))
    assert len(coll.alerts) == 1  # the other sink still fired


def test_alert_from_terminal_json_bridge():
    payload = {
        "kind": "terminal_failure",
        "blocked_task": "draft",
        "reason": "draft blocked after 2 fallback attempt(s)",
        "topic_id": "t1",
    }
    a = alert_from_terminal_json(payload, run_id="2026-06-04", now=_NOW)
    assert a.kind == RUN_BLOCKED
    assert a.topic_id == "t1"
    assert a.detail == {"blocked_task": "draft"}
    assert a.reason == "draft blocked after 2 fallback attempt(s)"


# ---------------------------------------------------------------------------
# C2. M-13 deploy push + M-14 webhook / uptime channels
# ---------------------------------------------------------------------------


class _FakeResp:
    """Minimal urlopen() return: a context manager exposing .status/.read()."""

    def __init__(self, status: int = 200) -> None:
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return False

    def read(self) -> bytes:
        return b""

    def getcode(self) -> int:
        return self.status


def _capturing_urlopen(status: int = 200, calls: list | None = None):
    def _urlopen(target, timeout=None):  # target: Request (webhook) or str (ping)
        if calls is not None:
            calls.append(target)
        return _FakeResp(status)

    return _urlopen


def test_webhook_sink_posts_alert_json():
    calls: list = []
    sink = WebhookAlertSink("https://hook.example/notify", urlopen=_capturing_urlopen(200, calls))
    sink.emit(Alert(RUN_BLOCKED, "2026-06-01", "draft blocked", _NOW, topic_id="t1"))
    assert len(calls) == 1
    req = calls[0]
    assert req.full_url == "https://hook.example/notify" and req.method == "POST"
    assert req.headers["Content-type"] == "application/json"
    body = json.loads(req.data.decode("utf-8"))
    assert body["kind"] == RUN_BLOCKED and body["run_id"] == "2026-06-01"
    assert body["reason"] == "draft blocked" and body["topic_id"] == "t1"


def test_webhook_sink_non_2xx_raises_and_multi_isolates_it():
    bad = WebhookAlertSink("https://hook.example/notify", urlopen=_capturing_urlopen(500))
    with pytest.raises(urllib.error.HTTPError):
        bad.emit(Alert(RUN_FAILED, "x", "r", _NOW))
    # MultiAlertSink must isolate the raising webhook so File/Collecting still fire.
    coll = CollectingAlertSink()
    MultiAlertSink([bad, coll]).emit(Alert(RUN_FAILED, "x", "r", _NOW))
    assert len(coll.alerts) == 1


def test_ping_uptime_best_effort_true_then_false():
    assert ping_uptime("https://hc.example/ping", urlopen=_capturing_urlopen(200)) is True

    def _boom(target, timeout=None):
        raise OSError("network down")

    # a dead ping must NEVER raise (it would crash an otherwise-successful run)
    assert ping_uptime("https://hc.example/ping", urlopen=_boom) is False


def test_default_sink_adds_webhook_only_when_configured(config):
    plain = cron._default_sink(config)
    assert not any(isinstance(s, WebhookAlertSink) for s in plain.sinks)
    hooked = cron._default_sink(replace(config, alert_webhook_url="https://hook.example/notify"))
    assert any(isinstance(s, WebhookAlertSink) for s in hooked.sinks)


def test_push_after_success_gated_off_by_default(config):
    calls: list = []
    ran = deploy.push_after_success(config, runner=lambda *a, **k: calls.append((a, k)))
    assert ran is False and calls == []  # git_push defaults off -> no push, no runner call


def test_push_after_success_reconciles_builds_then_pushes_when_enabled(config):
    calls: list = []

    def _runner(argv, cwd=None):
        calls.append((argv, cwd))
        return SimpleNamespace(returncode=0)

    cfg = replace(config, git_push=True, git_remote="origin", git_branch="main")
    assert deploy.push_after_success(cfg, runner=_runner) is True
    # reconcile (pull --rebase) runs FIRST, then the build gate, then the push
    assert calls == [
        (["git", "pull", "--rebase", "origin", "main"], str(cfg.repo_root)),
        (["pnpm", "build"], str(cfg.repo_root)),
        (["git", "push", "origin", "main"], str(cfg.repo_root)),
    ]


def test_push_after_success_skips_when_reconcile_fails(config):
    calls: list = []

    def _runner(argv, cwd=None):
        calls.append(argv)
        # the rebase is rejected (conflict / diverged); push must never run
        return SimpleNamespace(returncode=1 if argv[:2] == ["git", "pull"] else 0)

    cfg = replace(config, git_push=True, git_remote="origin", git_branch="main")
    assert deploy.push_after_success(cfg, runner=_runner) is False
    # reconcile fails -> abort the rebase, never build, never push
    assert calls == [
        ["git", "pull", "--rebase", "origin", "main"],
        ["git", "rebase", "--abort"],
    ]


def test_push_after_success_skips_push_when_build_fails(config):
    calls: list = []

    def _runner(argv, cwd=None):
        calls.append(argv)
        # reconcile ok; the build gate fails; the push must never run
        return SimpleNamespace(returncode=1 if argv[0] == "pnpm" else 0)

    cfg = replace(config, git_push=True)
    assert deploy.push_after_success(cfg, runner=_runner) is False
    # reconciled, built, refused, never reached git push
    assert calls == [
        ["git", "pull", "--rebase", config.git_remote, config.git_branch],
        ["pnpm", "build"],
    ]


def test_push_after_success_push_nonzero_exit_is_false_not_raise(config):
    cfg = replace(config, git_push=True)

    def _runner(argv, cwd=None):
        # reconcile + build pass, the push itself fails -> False, never raises
        return SimpleNamespace(returncode=1 if argv[0] == "git" and argv[1] == "push" else 0)

    assert deploy.push_after_success(cfg, runner=_runner) is False


def test_after_run_pings_and_pushes_only_on_completion(config):
    pings: list = []
    pushes: list = []
    fake_ping = lambda url: pings.append(url)  # noqa: E731
    fake_push = lambda cfg: pushes.append(cfg)  # noqa: E731
    cfg = replace(config, uptime_ping_url="https://hc.example/ping")

    completed = cron.ScheduledOutcome(run_id="2026-06-01", ran=True)  # ran, not alerted
    cron._after_run(cfg, completed, ping=fake_ping, push=fake_push)
    assert pings == ["https://hc.example/ping"] and len(pushes) == 1

    pings.clear()
    pushes.clear()
    for skip in (
        cron.ScheduledOutcome(run_id="x", ran=True, alerted=True),  # failed/blocked
        cron.ScheduledOutcome(run_id="x", paused=True),  # paused
        cron.ScheduledOutcome(run_id="x", already_complete=True),  # idempotent no-op
    ):
        cron._after_run(cfg, skip, ping=fake_ping, push=fake_push)
    assert pings == [] and pushes == []


def test_after_run_alerts_when_requested_push_does_not_land(config):
    # git_push ON but the push returns False (diverged/conflict/auth) -> alert, not silence
    sink = CollectingAlertSink()
    cfg = replace(config, git_push=True)
    cron._after_run(
        cfg,
        cron.ScheduledOutcome(run_id="2026-06-19", ran=True),
        now=datetime(2026, 6, 19, 9, 0, tzinfo=UTC),
        push=lambda c: False,  # push did not land
        sink=sink,
    )
    assert len(sink.alerts) == 1
    assert sink.alerts[0].kind == "deploy_push_failed"
    assert sink.alerts[0].run_id == "2026-06-19"


def test_after_run_no_alert_when_push_lands_or_not_requested(config):
    sink = CollectingAlertSink()
    # (a) push lands -> no alert
    cron._after_run(
        replace(config, git_push=True),
        cron.ScheduledOutcome(run_id="x", ran=True),
        push=lambda c: True,
        sink=sink,
    )
    # (b) push not requested (git_push off) -> no alert even when push returns falsy
    cron._after_run(
        config,  # git_push defaults off
        cron.ScheduledOutcome(run_id="x", ran=True),
        push=lambda c: None,
        sink=sink,
    )
    assert sink.alerts == []


def test_after_run_skips_ping_when_no_uptime_url(config):
    pings: list = []
    pushes: list = []
    cron._after_run(
        config,  # no uptime_ping_url
        cron.ScheduledOutcome(run_id="2026-06-01", ran=True),
        ping=lambda url: pings.append(url),
        push=lambda cfg: pushes.append(cfg),
    )
    assert pings == [] and len(pushes) == 1  # push still attempted (it self-gates on git_push)


# ---------------------------------------------------------------------------
# D. Heartbeat ledger + check_heartbeat (the core)
# ---------------------------------------------------------------------------


def test_ledger_roundtrip_and_corrupt_line_skipped(config):
    rec = _rec("ok", fire_day=_MON)
    heartbeat.append_heartbeat(config, rec)
    with heartbeat.ledger_path(config).open("a", encoding="utf-8") as fh:
        fh.write("\n{ not valid json\n")  # blank + corrupt
    out = heartbeat.read_ledger(config)
    assert len(out) == 1 and out[0].run_id == rec.run_id and out[0].status == "ok"


def test_D1_i1_regression_run_id_match_not_instant(config):
    """Seed ONE ok at Mon 07:00 UTC (= 09:00 Paris, STRICTLY < the 09:00-UTC prev) with
    run_id = the Mon fire day; now = Mon 16:00 (same day, past grace); small grace ->
    verdict ok, NOT missed. The naive ``r.when >= prev`` filter would drop the 07:00
    record and mis-fire MISSED."""
    c = DEFAULT_CADENCE
    ok_when = datetime(2026, 6, 1, 7, 0, tzinfo=UTC)  # 07:00 UTC < 09:00 UTC prev
    heartbeat.append_heartbeat(config, _rec("ok", fire_day=_MON, when=ok_when))
    verdict = check_heartbeat(config, now=_MON_LATE, cadence=c, grace_hours=6)
    assert verdict.status == "ok", verdict
    # discrimination guard: prove the record is < prev (so the buggy filter WOULD drop it)
    prev = c.previous_fire(_MON_LATE)
    assert ok_when < prev
    assert [r for r in heartbeat.read_ledger(config) if r.when >= prev] == []


def test_D2_missed_emits_named_alert(config):
    sink = CollectingAlertSink()
    verdict = check_and_alert(config, sink, now=_MON_LATE, grace_hours=6)
    assert verdict.status == "missed"
    assert len(sink.alerts) == 1 and sink.alerts[0].kind == RUN_MISSED
    assert "2026-06-01" in sink.alerts[0].reason  # names the slot (FR-F2)


def test_D3_stalled_lone_started_past_grace(config):
    heartbeat.append_heartbeat(config, _rec("started", fire_day=_MON))  # started at Mon 09:00
    sink = CollectingAlertSink()
    verdict = check_and_alert(config, sink, now=_MON_LATE, grace_hours=6)  # 7h > grace
    assert verdict.status == "stalled" and sink.alerts[0].kind == RUN_STALLED


def test_D4_in_flight_within_grace_no_alert(config):
    heartbeat.append_heartbeat(config, _rec("started", fire_day=_MON))
    now = datetime(2026, 6, 1, 11, 0, tzinfo=UTC)  # 2h after fire < 6h grace
    sink = CollectingAlertSink()
    verdict = check_and_alert(config, sink, now=now, grace_hours=6)
    assert verdict.status == "pending" and sink.alerts == []


def test_D5_paused_short_circuit_no_missed(config):
    now = datetime(2026, 6, 5, 12, 0, tzinfo=UTC)  # well past the Thu fire, no records
    pause.set_paused(config, True, now=now)
    sink = CollectingAlertSink()
    verdict = check_and_alert(config, sink, now=now, grace_hours=6)
    assert verdict.status == "paused" and sink.alerts == []


def test_D6_monitor_does_not_realert_failed_terminal(config):
    heartbeat.append_heartbeat(config, _rec("started", fire_day=_MON))
    failed_when = datetime(2026, 6, 1, 10, 0, tzinfo=UTC)
    heartbeat.append_heartbeat(
        config, _rec("failed", fire_day=_MON, when=failed_when, reason="exit 1")
    )
    sink = CollectingAlertSink()
    verdict = check_and_alert(config, sink, now=_MON_LATE, grace_hours=6)
    assert verdict.status == "ok" and sink.alerts == []


def test_D7_daily_reminder_and_dedup_knob(config):
    # reminder-until-resolved: two ticks -> two alerts
    sink = CollectingAlertSink()
    check_and_alert(config, sink, now=_MON_LATE, grace_hours=6)
    check_and_alert(config, sink, now=_MON_LATE, grace_hours=6)
    assert len(sink.alerts) == 2
    # dedup knob: persist to the canonical alerts.jsonl; second tick is suppressed
    coll = CollectingAlertSink()
    multi = MultiAlertSink([coll, FileAlertSink(config.schedule_state_dir / "alerts.jsonl")])
    check_and_alert(config, multi, now=_MON_LATE, grace_hours=6, dedup=True)
    check_and_alert(config, multi, now=_MON_LATE, grace_hours=6, dedup=True)
    assert len(coll.alerts) == 1


# ---------------------------------------------------------------------------
# E. run_scheduled integration (FakeClaudeDriver + CollectingAlertSink)
# ---------------------------------------------------------------------------


def test_E1_healthy_run(integration_config):
    sink = CollectingAlertSink()
    outcome = cron.run_scheduled(
        integration_config, FakeClaudeDriver(integration_config), sink, now=_NOW
    )
    assert outcome.ran and not outcome.alerted and outcome.run_id == "2026-06-01"
    statuses = [r.status for r in heartbeat.read_ledger(integration_config)]
    assert "started" in statuses and "ok" in statuses
    assert sink.alerts == []


def test_E2_blocked_draft_bridges_alert_json(integration_config):
    sink = CollectingAlertSink()
    outcome = cron.run_scheduled(
        integration_config,
        FakeClaudeDriver(integration_config, block_task="draft"),
        sink,
        now=_NOW,
    )
    assert outcome.ran and outcome.alerted
    assert len(sink.alerts) == 1 and sink.alerts[0].kind == RUN_BLOCKED
    assert sink.alerts[0].detail.get("blocked_task") == "draft"
    assert any(r.status == "blocked" for r in heartbeat.read_ledger(integration_config))


def test_E3_generic_block_names_task(integration_config):
    sink = CollectingAlertSink()
    cron.run_scheduled(
        integration_config,
        FakeClaudeDriver(integration_config, block_task="research"),
        sink,
        now=_NOW,
    )
    assert len(sink.alerts) == 1 and sink.alerts[0].kind == RUN_BLOCKED
    assert "research" in sink.alerts[0].reason
    assert any(r.status == "blocked" for r in heartbeat.read_ledger(integration_config))


def test_E4_pause_blocks_the_run(integration_config):
    class SpyDriver:
        def __init__(self):
            self.calls = 0

        def run_slate(self, slate, *, resume):
            self.calls += 1
            raise AssertionError("paused schedule must not drive the slate")

    pause.set_paused(integration_config, True, now=_NOW)
    sink = CollectingAlertSink()
    spy = SpyDriver()
    outcome = cron.run_scheduled(integration_config, spy, sink, now=_NOW)
    assert outcome.paused and not outcome.ran and spy.calls == 0
    assert sink.alerts == []
    assert not (integration_config.runs_root / "2026-06-01").exists()  # no run dir
    assert any(r.status == "paused" for r in heartbeat.read_ledger(integration_config))


def test_E5_same_day_idempotent_noop(integration_config):
    sink = CollectingAlertSink()
    first = cron.run_scheduled(
        integration_config, FakeClaudeDriver(integration_config), sink, now=_NOW
    )
    second = cron.run_scheduled(
        integration_config, FakeClaudeDriver(integration_config), sink, now=_NOW
    )
    assert first.ran and second.already_complete and not second.ran
    assert sink.alerts == []  # no FileExistsError, no spurious alert


def test_E5_interrupt_then_same_day_resume(integration_config):
    """review C5: the first usage-limited interrupt is neither blocked nor complete, so
    run_scheduled emits a RUN_FAILED alert + a ``failed`` terminal heartbeat under the
    same run_id BEFORE the second same-day call resumes and completes it."""
    sink = CollectingAlertSink()
    first = cron.run_scheduled(
        integration_config,
        FakeClaudeDriver(integration_config, interrupt_after="select"),
        sink,
        now=_NOW,
    )
    assert first.ran and first.alerted
    assert len(sink.alerts) == 1 and sink.alerts[0].kind == RUN_FAILED
    assert any(r.status == "failed" for r in heartbeat.read_ledger(integration_config))
    # second same-day call -> resume (not re-assemble) -> completes; no new alert
    second = cron.run_scheduled(
        integration_config, FakeClaudeDriver(integration_config), sink, now=_NOW
    )
    assert second.ran and not second.alerted
    assert len(sink.alerts) == 1
    assert any(r.status == "ok" for r in heartbeat.read_ledger(integration_config))


def test_E6_run_id_is_utc_day_and_run_dir(integration_config):
    sink = CollectingAlertSink()
    outcome = cron.run_scheduled(
        integration_config, FakeClaudeDriver(integration_config), sink, now=_NOW
    )
    assert outcome.run_id == _NOW.strftime("%Y-%m-%d") == "2026-06-01"
    assert (integration_config.runs_root / outcome.run_id / "tasks.yaml").exists()


# ---------------------------------------------------------------------------
# F. Import-light / no-runpy guards
# ---------------------------------------------------------------------------


def test_F1_cli_no_runpy_double_import(tmp_path):
    # -W error::RuntimeWarning turns the runpy double-import warning into a nonzero exit.
    # `monitor` is fully offline and exercises the lazy `from . import heartbeat` path;
    # cwd=tmp_path isolates any state writes (review C2).
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    for args in (["--help"], ["render"], ["monitor"]):
        proc = subprocess.run(
            [sys.executable, "-W", "error::RuntimeWarning", "-m", "pipeline.schedule.cron", *args],
            capture_output=True,
            text=True,
            env=env,
            cwd=str(tmp_path),
        )
        assert proc.returncode == 0, f"{args}: unexpected warning/error:\n{proc.stderr}"


def test_F2_import_pipeline_does_not_import_schedule():
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    code = (
        "import pipeline, sys; "
        "bad=[m for m in sys.modules if m.startswith('pipeline.schedule.')]; "
        "assert not bad, bad"
    )
    proc = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, env=env)
    assert proc.returncode == 0, proc.stdout + proc.stderr


def test_F3_heartbeat_has_no_cron_back_edge():
    # Static (ast): no import STATEMENT in heartbeat.py references `cron`. Robust to the
    # docstring legitimately mentioning `from .cron` [MEM: static-guard-token-in-comments].
    tree = ast.parse((_PIPELINE_DIR / "schedule" / "heartbeat.py").read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            assert node.module is None or "cron" not in node.module
        elif isinstance(node, ast.Import):
            assert all("cron" not in alias.name for alias in node.names)
    # Runtime: importing heartbeat leaves pipeline.schedule.cron OUT of sys.modules.
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    code = (
        "import pipeline.schedule.heartbeat, sys; "
        "assert 'pipeline.schedule.cron' not in sys.modules"
    )
    proc = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, env=env)
    assert proc.returncode == 0, proc.stdout + proc.stderr


# ---------------------------------------------------------------------------
# G. Render determinism (drift lock)
# ---------------------------------------------------------------------------


def test_G_crontab_example_matches_render():
    committed = (_PIPELINE_DIR / "schedule" / "scheduler.cron.example").read_text(encoding="utf-8")
    assert committed == cron.render_crontab()


def test_G_plist_example_matches_render():
    committed = (_PIPELINE_DIR / "schedule" / "scheduler.plist.example").read_text(encoding="utf-8")
    assert committed == cron.render_launchd_plist()


def test_G_rendered_crontab_content_and_purity():
    out = cron.render_crontab()
    assert "0 9 * * *" in out
    assert "pipeline.schedule.cron run" in out
    assert "pipeline.schedule.cron monitor" in out
    assert "run_id/calendar-day" in out  # the LOCAL-vs-UTC reconciliation comment
    assert "<REPO_ROOT>" in out and "<STATE_DIR>" in out  # placeholder form by default
    assert cron.render_crontab() == out  # pure: re-render is byte-identical


def test_G_render_resolve_substitutes_paths():
    out = cron.render_crontab(repo_root="/x/repo", state_dir="/x/state", python="/x/py")
    assert "<REPO_ROOT>" not in out and "/x/repo" in out and "/x/py" in out


def test_G_rendered_plist_daily_both_agents():
    out = cron.render_launchd_plist()
    assert out.count("<plist version=") == 2  # two LaunchAgents
    assert "<key>Weekday</key>" not in out  # daily -> no weekday restriction
    assert "<key>Hour</key><integer>9</integer>" in out  # run fires at 09:00
    assert "pipeline.schedule.cron" in out


def test_G_rendered_crontab_deploy_env_on_run_only():
    """SCHED-2/3 + ORCH-3/6: the deploy env (push/embedder/model) rides the RUN command,
    NOT the monitor, so a daily article actually pushes+deploys and dedups on the real
    embedder. Regression guard for the orphaned-env bug (install never deployed)."""
    out = cron.render_crontab()
    run_line = next(line for line in out.splitlines() if " run    " in line)
    mon_line = next(line for line in out.splitlines() if " monitor " in line)
    for var in (
        "PIPELINE_GIT_PUSH=1",
        "PIPELINE_EMBEDDER=real",
        "PIPELINE_MODEL=opus",
        "PIPELINE_SOURCE_VERIFY=real",  # REL-2 gate activation rides the run command
    ):
        assert var in run_line, var
        assert var not in mon_line, f"{var} must not ride the monitor command"


def test_G_monitor_hour_clears_grace_window():
    """SCHED-4: the dead-man's-switch monitor must run AFTER the UTC cadence fire + grace,
    in local terms, or it never emits MISSED. The shipped 12:00 ran INSIDE the 6h grace.
    Worst case for the owner is Europe/Paris summer (CEST = UTC+2): the monitor's local
    hour minus 2 must still clear cadence.hour(UTC) + 6h grace."""
    PARIS_MAX_OFFSET = 2  # CEST; winter (CET) is +1, a looser bound
    GRACE_HOURS = 6  # config.schedule_grace_hours default
    monitor_utc_worst_case = cron.DEFAULT_MONITOR_HOUR - PARIS_MAX_OFFSET
    assert monitor_utc_worst_case >= DEFAULT_CADENCE.hour + GRACE_HOURS
    cron_out = cron.render_crontab()
    assert f"0 {cron.DEFAULT_MONITOR_HOUR} * * *" in cron_out
    plist_out = cron.render_launchd_plist()
    assert f"<key>Hour</key><integer>{cron.DEFAULT_MONITOR_HOUR}</integer>" in plist_out


def test_G_rendered_plist_env_on_run_agent_only():
    """The launchd RUN agent carries EnvironmentVariables with the deploy env; the MONITOR
    agent does not (it neither publishes nor pushes)."""
    out = cron.render_launchd_plist()
    run_half, mon_half = out.split("2/2")  # the header splits the two agents
    assert "<key>EnvironmentVariables</key>" in run_half
    assert "PIPELINE_GIT_PUSH" in run_half
    assert "<key>EnvironmentVariables</key>" not in mon_half


# ---------------------------------------------------------------------------
# H. CLI dispatch (the _main -> _cmd_* wiring; FR-F4 round-trip)
# ---------------------------------------------------------------------------


def test_H_cli_pause_resume_roundtrip(config, monkeypatch, capsys):
    """FR-F4 wired path: `cron.py pause`/`resume` flip the flag via the CLI dispatch
    (the round-trip the function-level tests prove the pieces of, end to end)."""
    from pipeline import config as cfgmod

    monkeypatch.setattr(cfgmod.PipelineConfig, "from_env", lambda *a, **k: config)
    assert cron._main(["pause"]) == 0
    assert pause.is_paused(config, env={}) is True
    assert cron._main(["resume"]) == 0
    assert pause.is_paused(config, env={}) is False
    out = capsys.readouterr().out
    assert "paused" in out and "resumed" in out


def test_H_cli_status_reads_ledger(config, monkeypatch, capsys):
    from pipeline import config as cfgmod

    monkeypatch.setattr(cfgmod.PipelineConfig, "from_env", lambda *a, **k: config)
    heartbeat.append_heartbeat(config, _rec("ok", fire_day=_MON))
    assert cron._main(["status"]) == 0
    out = capsys.readouterr().out
    assert "paused:" in out and "next fire:" in out and "2026-06-01" in out

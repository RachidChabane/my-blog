"""LOCAL cron/launchd entrypoint for the editorial run (M-5) -- argparse CLI + __main__.

Top-level imports are **stdlib + cadence ONLY**; everything heavy (``PipelineConfig``,
the runner, ``heartbeat``, ``alert``, ``pause``) is lazy-imported inside the function
that needs it. So ``python -m pipeline.schedule.cron render`` / ``--help`` work with no
cpe install, and the no-runpy guard stays green [MEM: pipeline-stages-import-light-runpy].

Ownership split (plan §2.5/§2.6): ``run_scheduled`` owns ``RUN_FAILED`` / ``RUN_BLOCKED``
at run time and bridges fallback's ``plans/ALERT.json`` artifact -> delivery; the monitor
(``heartbeat.check_and_alert``) owns ``RUN_MISSED`` / ``RUN_STALLED`` only.

Deploy wiring (M-13, [MEM: publish-stage-commit-no-push-gap]): the pure
``run_scheduled`` core stays push-free -- it only commits via the publish stage. The
opt-in ``git push`` lives at the CLI layer (``_after_run`` -> ``deploy.push_after_success``),
gated on ``config.git_push`` (env ``PIPELINE_GIT_PUSH=1``), so a run-to-completion fires
the Cloudflare Pages deploy + reindex while tests/CI never push. ``wrangler``/CI workflow
config itself stays out of this module. Do NOT add a ``pipeline/schedule/__main__.py``:
the entry is the ``cron`` module, and a package ``__main__`` would re-import it.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from .cadence import DEFAULT_CADENCE, Cadence, run_id_for

if TYPE_CHECKING:
    from ..config import PipelineConfig
    from ..runner import RunResult, SlateDriver
    from .alert import AlertSink


# ---------------------------------------------------------------------------
# run_scheduled -- the core run-time function (owns failed/blocked alerts)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ScheduledOutcome:
    """The ``run`` subcommand's result (FR-F1 / test assertions)."""

    run_id: str
    ran: bool = False
    paused: bool = False
    already_complete: bool = False
    alerted: bool = False
    run_result: RunResult | None = None


def run_scheduled(
    config: PipelineConfig,
    driver: SlateDriver,
    sink: AlertSink,
    *,
    now: datetime,
    now_end: datetime | None = None,
    cadence: Cadence = DEFAULT_CADENCE,
) -> ScheduledOutcome:
    """Drive one editorial slate for ``now``'s period, recording heartbeats + alerts.

    ``now_end`` is the terminal-record timestamp; it defaults to the injected ``now``
    (deterministic for tests). Production may pass a fresh ``datetime.now(UTC)`` for an
    accurate ledger time -- but the ``run_id`` is the launch-day id, never recomputed
    (the §0.6 asymmetry vs the monitor's ``run_id_for(previous_fire(now))``: a run that
    crosses UTC midnight still files its terminal record under the launch period).
    """
    from ..runner import load_slate, resume_point, run
    from . import alert, heartbeat, pause

    end = now_end if now_end is not None else now
    run_id = run_id_for(now)

    # (a) PAUSE GATE (FR-F4): paused -> do NOT drive. Record a "paused" heartbeat for
    #     FR-F1 history; emit NO alert; return early.
    if pause.is_paused(config):
        heartbeat.append_heartbeat(
            config,
            heartbeat.HeartbeatRecord(run_id, now, "paused", "schedule paused"),
        )
        return ScheduledOutcome(run_id=run_id, ran=False, paused=True)

    # (b) SAME-DAY IDEMPOTENCY / RESUME (exit-75 wiring part b): run_id == %Y-%m-%d, so a
    #     same-day re-fire must resume (or no-op), never re-assemble (FileExistsError).
    run_dir = config.runs_root / run_id
    if (run_dir / "tasks.yaml").exists():
        if resume_point(load_slate(run_id, config), config).complete:
            return ScheduledOutcome(run_id=run_id, ran=False, already_complete=True)
        resume = True
    else:
        resume = False

    # (c) DRIVE (exit-75 wiring part a: CpeLoopDriver sleeps+relaunches in-process on a
    #     usage limit). Two-record scheme: "started" now, a terminal record at the end.
    heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, now, "started"))
    rr = run(run_id, config, driver, resume=resume)

    # (d) CLASSIFY -> terminal heartbeat + (failed/blocked) alert AT RUN TIME.
    if rr.plan.complete and rr.result.complete:
        heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, end, "ok"))
        return ScheduledOutcome(run_id=run_id, ran=True, run_result=rr)

    alert_json = run_dir / "plans" / "ALERT.json"
    if rr.alerted and alert_json.exists():
        # bridge fallback's terminal ALERT.json artifact -> delivery [MEM: m4-gate-contract]
        payload = json.loads(alert_json.read_text(encoding="utf-8"))
        sink.emit(alert.alert_from_terminal_json(payload, run_id=run_id, now=end))
        status = "blocked"
        reason = payload.get("reason", "terminal failure")
    elif rr.plan.blocked:
        reason = f"task(s) blocked: {', '.join(rr.plan.blocked)}"
        sink.emit(
            alert.Alert(alert.RUN_BLOCKED, run_id, reason, end, detail={"blocked": rr.plan.blocked})
        )
        status = "blocked"
    else:  # incomplete, not a clean block (e.g. a non-0/75 exit the loop wrapper propagated)
        reason = (
            f"run incomplete (exit {rr.result.exit_code}, "
            f"usage_limited={rr.result.usage_limited})"
        )
        sink.emit(alert.Alert(alert.RUN_FAILED, run_id, reason, end))
        status = "failed"
    heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, end, status, reason))
    return ScheduledOutcome(run_id=run_id, ran=True, alerted=True, run_result=rr)


# ---------------------------------------------------------------------------
# Rendering the reference entries (PURE -- no datetime.now, no absolute home path)
# ---------------------------------------------------------------------------
#
# Weekday numbering, three frames: Python date.weekday() is Mon=0..Sun=6 (what Cadence
# uses); cron is Mon=1..Sat=6, Sun=0/7; launchd Weekday is Sun=0, Mon=1..Sat=6. cron and
# launchd agree (Mon=1, Thu=4); only Python differs -- (pywd + 1) % 7 maps to both.

_PLIST_DOCTYPE = (
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" '
    '"http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
)
_PLIST_HEAD = (
    '<?xml version="1.0" encoding="UTF-8"?>\n' + _PLIST_DOCTYPE + '\n<plist version="1.0">'
)


def _cron_weekday(pywd: int) -> int:
    return (pywd + 1) % 7


# Deploy-ready run env baked into the rendered install (audit SCHED-2/3, ORCH-3/6):
#   PIPELINE_GIT_PUSH=1  -> the published commit is pushed so CI (Pages deploy + reindex)
#                           fires; without it the article never leaves local main.
#   PIPELINE_EMBEDDER=real-> select dedups with the multilingual embedder, not the fake.
#   PIPELINE_MODEL=opus   -> the daily run matches the model that produced the reference
#                           articles (owner decision 2026-06-11).
#   PIPELINE_SOURCE_VERIFY=real -> activates the REL-2 source-fidelity gate's live HTTP
#                           backend so a fabricated/misquoted excerpt is caught at publish
#                           time (default-inert otherwise). Validated against the published
#                           corpus with 0 false-blocks before activation (2026-06-17).
# Owner-supplied notification URLs (ALERT_WEBHOOK_URL / UPTIME_PING_URL) are emitted as
# commented TODO lines, not baked, because they are secrets the renderer cannot invent.
DEPLOY_RUN_ENV: tuple[tuple[str, str], ...] = (
    ("PIPELINE_GIT_PUSH", "1"),
    ("PIPELINE_EMBEDDER", "real"),
    ("PIPELINE_MODEL", "opus"),
    ("PIPELINE_SOURCE_VERIFY", "real"),
)
# Dead-man's-switch monitor hour, LOCAL (audit SCHED-4). The Cadence fire is UTC-framed
# (hour=9); the monitor must run at >= cadence_hour_UTC + grace(6h) = 15:00 UTC for MISSED
# to fire. In Europe/Paris (UTC+1/+2) that means a LOCAL hour >= 16/17; 18:00 local
# (16:00-17:00 UTC, 7-8h after the fire) clears the 6h grace year-round including DST.
# The shipped 12:00 ran INSIDE the grace and never fired MISSED. If the cadence, grace,
# or owner timezone changes, re-derive this.
DEFAULT_MONITOR_HOUR = 18


def _run_env_prefix() -> str:
    """`VAR=val VAR=val ` prefix for the cron run command (empty tuple -> '')."""
    return "".join(f"{k}={v} " for k, v in DEPLOY_RUN_ENV)


def render_crontab(
    *,
    repo_root: str = "<REPO_ROOT>",
    state_dir: str = "<STATE_DIR>",
    python: str = "python3",
    cadence: Cadence = DEFAULT_CADENCE,
    monitor_hour: int = DEFAULT_MONITOR_HOUR,
) -> str:
    """Render the reference crontab (placeholder form by default; pure + deterministic)."""
    # A full week collapses to cron's "*" (every day); a subset stays an explicit list.
    full_week = len(set(cadence.weekdays)) == 7
    days = "*" if full_week else ",".join(str(_cron_weekday(wd)) for wd in cadence.weekdays)
    days_desc = "daily" if full_week else f"weekdays {days}"
    hh, mm, mh = cadence.hour, cadence.minute, monitor_hour
    cd = f"cd {repo_root} &&"
    log = f"{state_dir}/cron.log"
    # The deploy env rides the RUN command only (the monitor neither publishes nor pushes).
    run_cmd = f"{cd} {_run_env_prefix()}{python} -m pipeline.schedule.cron run"
    mon_cmd = f"{cd} {python} -m pipeline.schedule.cron monitor"
    run_line = f"{mm} {hh} * * {days}  {run_cmd}    >> {log} 2>&1"
    mon_line = f"{mm} {mh} * * *   {mon_cmd} >> {log} 2>&1"
    lines = [
        "# my-blog content engine - editorial run (M-5). Times below are LOCAL.",
        f"# NOTE: local cron HOUR is wall-clock; the heartbeat Cadence is UTC-framed (hour={hh}).",
        "#   Reconciled by run_id/calendar-day matching (see heartbeat.check_heartbeat).",
        "# The RUN line carries the deploy env (PIPELINE_GIT_PUSH/_EMBEDDER/_MODEL); to be",
        "# notified of failures, ALSO add at the top of the crontab (owner secrets):",
        "#   ALERT_WEBHOOK_URL=https://...   UPTIME_PING_URL=https://...",
        f"# RUN: {days_desc} at {hh:02d}:{mm:02d} local - drive one editorial slate.",
        run_line,
        f"# MONITOR: daily {mh:02d}:{mm:02d} local dead-man's-switch (alert on missed/stalled).",
        mon_line,
    ]
    return "\n".join(lines) + "\n"


def _cal_dict(*, weekday: int | None = None, hour: int, minute: int, indent: str) -> str:
    parts = [f"{indent}<dict>"]
    if weekday is not None:
        parts.append(f"{indent}  <key>Weekday</key><integer>{weekday}</integer>")
    parts.append(f"{indent}  <key>Hour</key><integer>{hour}</integer>")
    parts.append(f"{indent}  <key>Minute</key><integer>{minute}</integer>")
    parts.append(f"{indent}</dict>")
    return "\n".join(parts)


def _env_dict_block(env: tuple[tuple[str, str], ...]) -> list[str]:
    """`<key>EnvironmentVariables</key><dict>...</dict>` lines (empty -> [])."""
    if not env:
        return []
    out = ["  <key>EnvironmentVariables</key>", "  <dict>"]
    for k, v in env:
        out.append(f"    <key>{k}</key><string>{v}</string>")
    out.append("  </dict>")
    return out


def _launch_agent(
    *,
    label: str,
    subcommand: str,
    intervals: str,
    repo_root: str,
    python: str,
    env: tuple[tuple[str, str], ...] = (),
) -> str:
    log = f"{repo_root}/pipeline/schedule/state/cron.log"
    lines = [
        _PLIST_HEAD,
        "<dict>",
        f"  <key>Label</key><string>{label}</string>",
        f"  <key>WorkingDirectory</key><string>{repo_root}</string>",
        *_env_dict_block(env),
        "  <key>ProgramArguments</key>",
        "  <array>",
        f"    <string>{python}</string>",
        "    <string>-m</string>",
        "    <string>pipeline.schedule.cron</string>",
        f"    <string>{subcommand}</string>",
        "  </array>",
        "  <key>StartCalendarInterval</key>",
        "  <array>",
        intervals,
        "  </array>",
        f"  <key>StandardOutPath</key><string>{log}</string>",
        f"  <key>StandardErrorPath</key><string>{log}</string>",
        "</dict>",
        "</plist>",
    ]
    return "\n".join(lines)


def render_launchd_plist(
    *,
    repo_root: str = "<REPO_ROOT>",
    python: str = "python3",
    cadence: Cadence = DEFAULT_CADENCE,
    monitor_hour: int = DEFAULT_MONITOR_HOUR,
) -> str:
    """Render the reference launchd plists (two LaunchAgents; placeholder form by default)."""
    # A full week = one weekday-less interval (launchd fires it daily); a subset = one
    # interval per Weekday.
    if len(set(cadence.weekdays)) == 7:
        run_intervals = _cal_dict(hour=cadence.hour, minute=cadence.minute, indent="    ")
    else:
        run_intervals = "\n".join(
            _cal_dict(
                weekday=_cron_weekday(wd), hour=cadence.hour, minute=cadence.minute, indent="    "
            )
            for wd in cadence.weekdays
        )
    mon_intervals = _cal_dict(hour=monitor_hour, minute=cadence.minute, indent="    ")
    header = (
        "<!-- my-blog content engine - scheduling (M-5). TWO LaunchAgents: save each\n"
        "     as ~/Library/LaunchAgents/<Label>.plist and `launchctl load` it. Edit\n"
        "     <REPO_ROOT>; times are LOCAL (reconciled to the UTC Cadence by run_id/\n"
        "     calendar-day matching). The RUN agent carries the deploy env\n"
        "     (PIPELINE_GIT_PUSH/_EMBEDDER/_MODEL); add ALERT_WEBHOOK_URL +\n"
        "     UPTIME_PING_URL to its EnvironmentVariables for failure alerts. -->"
    )
    run_agent = _launch_agent(
        label="com.rachidchabane.myblog.run",
        subcommand="run",
        intervals=run_intervals,
        repo_root=repo_root,
        python=python,
        env=DEPLOY_RUN_ENV,
    )
    mon_agent = _launch_agent(
        label="com.rachidchabane.myblog.monitor",
        subcommand="monitor",
        intervals=mon_intervals,
        repo_root=repo_root,
        python=python,
    )
    return (
        f"{header}\n\n"
        f"<!-- 1/2 - RUN -->\n{run_agent}\n\n"
        f"<!-- 2/2 - MONITOR (dead-man's-switch) -->\n{mon_agent}\n"
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _default_sink(config: PipelineConfig) -> AlertSink:
    from .alert import (
        AlertSink as _AlertSink,
    )
    from .alert import (
        FileAlertSink,
        LogAlertSink,
        MultiAlertSink,
        WebhookAlertSink,
    )

    sinks: list[_AlertSink] = [
        FileAlertSink(config.schedule_state_dir / "alerts.jsonl"),
        LogAlertSink(),
    ]
    if config.alert_webhook_url:  # M-14 owner channel, off unless configured
        sinks.append(WebhookAlertSink(config.alert_webhook_url))
    return MultiAlertSink(sinks)


def _after_run(config: PipelineConfig, outcome: ScheduledOutcome, *, ping=None, push=None) -> None:
    """Side effects after a run (M-13/M-14), ONLY on a run-to-completion.

    Lazy-imports ``alert``/``deploy`` to preserve the import-light contract; both
    helpers are injectable for the offline test. Healthy beat -> ping the external
    dead-man's-switch (M-14); then push so CI deploys + reindexes (M-13). Paused /
    already-complete / failed / blocked outcomes are skipped (they did not just
    produce a fresh published article)."""
    if not (outcome.ran and not outcome.alerted):
        return
    from . import alert, deploy

    do_ping = ping if ping is not None else alert.ping_uptime
    do_push = push if push is not None else deploy.push_after_success
    if config.uptime_ping_url:
        do_ping(config.uptime_ping_url)
    do_push(config)


def _run_summary(outcome: ScheduledOutcome) -> str:
    if outcome.paused:
        return f"run {outcome.run_id}: schedule paused; not driven"
    if outcome.already_complete:
        return f"run {outcome.run_id}: already complete; idempotent no-op"
    if outcome.alerted:
        return f"run {outcome.run_id}: ran but ended failed/blocked (alert delivered)"
    return f"run {outcome.run_id}: ran to completion"


def _cmd_run(config: PipelineConfig, *, now: datetime) -> int:
    from ..runner import CpeLoopDriver

    outcome = run_scheduled(config, CpeLoopDriver(config), _default_sink(config), now=now)
    print(_run_summary(outcome))
    _after_run(config, outcome)  # M-13 push + M-14 uptime ping (run-to-completion only)
    return 0  # ran / idempotent / paused are all success; only a harness error raises


def _cmd_monitor(config: PipelineConfig, *, now: datetime) -> int:
    from . import alert, heartbeat

    verdict = heartbeat.check_and_alert(config, _default_sink(config), now=now)
    # M-14: a healthy monitor tick is a liveness beat -> ping the external switch.
    if verdict.status == "ok" and config.uptime_ping_url:
        alert.ping_uptime(config.uptime_ping_url)
    print(f"[{verdict.status}] {verdict.reason} (next fire {verdict.next_fire.isoformat()})")
    # Always exit 0: an alert was already delivered; a nonzero would make cron spam mail.
    return 0


def _cmd_set_paused(config: PipelineConfig, paused: bool, *, now: datetime) -> int:
    from . import pause

    path = pause.set_paused(config, paused, now=now)
    print(f"schedule {'paused' if paused else 'resumed'} -> {path}")
    return 0


def _cmd_status(config: PipelineConfig, *, now: datetime) -> int:
    from . import heartbeat, pause

    records = heartbeat.read_ledger(config)
    print(f"paused:     {pause.is_paused(config)}")
    print(f"next fire:  {DEFAULT_CADENCE.next_fire(now).isoformat()}")
    print(f"recent runs ({len(records)} total, last 10):")
    for r in records[-10:]:
        print(f"  {r.when.isoformat()}  {r.run_id}  {r.status}  {r.reason or ''}")
    return 0


def _cmd_render(*, resolve: bool) -> int:
    if resolve:
        from ..config import PipelineConfig

        cfg = PipelineConfig.from_env()
        print(
            render_crontab(
                repo_root=str(cfg.repo_root),
                state_dir=str(cfg.schedule_state_dir),
                python=sys.executable,
            )
        )
        print(render_launchd_plist(repo_root=str(cfg.repo_root), python=sys.executable))
    else:
        print(render_crontab())
        print(render_launchd_plist())
    return 0


def _make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pipeline.schedule.cron",
        description="LOCAL scheduler entrypoint for the editorial run (M-5).",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("run", help="drive one editorial slate (heartbeat + alerts on failure/block)")
    sub.add_parser("monitor", help="dead-man's-switch: alert on missed/stalled/overdue runs")
    sub.add_parser("pause", help="pause the schedule (FR-F4; no code change)")
    sub.add_parser("resume", help="resume the schedule (FR-F4)")
    sub.add_parser("status", help="print recent run history + pause state + next fire (FR-F1)")
    p_render = sub.add_parser("render", help="print the reference crontab + launchd plist")
    p_render.add_argument(
        "--resolve",
        action="store_true",
        help="substitute real repo_root/state_dir/python (to pipe into `crontab -`)",
    )
    return parser


def _main(argv: list[str] | None = None) -> int:
    args = _make_parser().parse_args(argv)
    if args.cmd == "render":
        return _cmd_render(resolve=args.resolve)

    # Commands below need a resolved config (config.py is stdlib-top; no cpe at import).
    from ..config import PipelineConfig

    config = PipelineConfig.from_env()
    now = datetime.now(UTC)
    if args.cmd == "run":
        return _cmd_run(config, now=now)
    if args.cmd == "monitor":
        return _cmd_monitor(config, now=now)
    if args.cmd == "pause":
        return _cmd_set_paused(config, True, now=now)
    if args.cmd == "resume":
        return _cmd_set_paused(config, False, now=now)
    if args.cmd == "status":
        return _cmd_status(config, now=now)
    return 2  # unreachable: subparsers are required


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "ScheduledOutcome",
    "run_scheduled",
    "render_crontab",
    "render_launchd_plist",
]

"""LOCAL cron/launchd entrypoint for the RADAR run -- argparse CLI + __main__.

The radar analog of ``pipeline.schedule.cron``. It reuses the shared scheduling substrate
(``heartbeat`` / ``pause`` / ``alert`` / ``deploy``) -- all keyed off ``config.schedule_state_dir``,
which the radar config points at ``pipeline/schedule/state-radar`` so the radar ledgers,
pause flag, and alerts are SEPARATE from the essay ones. ``run_radar_scheduled`` drives the
radar slate via ``pipeline.radar.runner.run`` (radar prompts), not the essay runner.

Register this as a SECOND cron/launchd job at a DIFFERENT hour from the essay run (e.g.
07:00 vs 09:00, label ``com.rachidchabane.myblog.radar``): because the radar config has its
own ``runs_root`` (``pipeline/runs-radar``), a same-calendar-day radar run can never find /
resume the essay slate, even though ``run_id`` is the shared ``%Y-%m-%d`` period key.

Top-level imports are stdlib + cadence only (the import-light / no-runpy contract); the
heavy bits are lazy-imported inside the functions that need them.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from ..schedule.cadence import run_id_for

if TYPE_CHECKING:
    from ..config import PipelineConfig
    from ..runner import SlateDriver
    from ..schedule.alert import AlertSink
    from .runner import RadarRunResult

# Radar runs an hour before the essay run by default (distinct slot in the crontab/launchd).
RADAR_DEFAULT_HOUR = 7
RADAR_LABEL = "com.rachidchabane.myblog.radar"


@dataclass(frozen=True)
class RadarOutcome:
    run_id: str
    ran: bool = False
    paused: bool = False
    already_complete: bool = False
    alerted: bool = False
    run_result: RadarRunResult | None = None


def run_radar_scheduled(
    config: PipelineConfig,
    driver: SlateDriver,
    sink: AlertSink,
    *,
    now: datetime,
    now_end: datetime | None = None,
) -> RadarOutcome:
    """Drive one radar slate for ``now``'s period, recording heartbeats + alerts.

    Same lifecycle as the essay ``run_scheduled`` (pause gate -> same-day idempotency/
    resume -> drive -> classify), minus the essay-only fallback ALERT.json bridge (radar
    has no argue/draft fallback). All paths come from ``config`` (radar-private state-dir).
    """
    from ..runner import load_slate, resume_point
    from ..schedule import alert, heartbeat, pause
    from . import runner as radar_runner

    end = now_end if now_end is not None else now
    run_id = run_id_for(now)

    if pause.is_paused(config):
        heartbeat.append_heartbeat(
            config, heartbeat.HeartbeatRecord(run_id, now, "paused", "radar schedule paused")
        )
        return RadarOutcome(run_id=run_id, ran=False, paused=True)

    run_dir = config.runs_root / run_id
    if (run_dir / "tasks.yaml").exists():
        if resume_point(load_slate(run_id, config), config).complete:
            return RadarOutcome(run_id=run_id, ran=False, already_complete=True)
        resume = True
    else:
        resume = False

    heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, now, "started"))
    rr = radar_runner.run(run_id, config, driver, resume=resume)

    if rr.plan.complete and rr.result.complete:
        heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, end, "ok"))
        return RadarOutcome(run_id=run_id, ran=True, run_result=rr)

    if rr.plan.blocked:
        reason = f"radar task(s) blocked: {', '.join(rr.plan.blocked)}"
        sink.emit(
            alert.Alert(alert.RUN_BLOCKED, run_id, reason, end, detail={"blocked": rr.plan.blocked})
        )
        status = "blocked"
    else:
        reason = (
            f"radar run incomplete (exit {rr.result.exit_code}, "
            f"usage_limited={rr.result.usage_limited})"
        )
        sink.emit(alert.Alert(alert.RUN_FAILED, run_id, reason, end))
        status = "failed"
    heartbeat.append_heartbeat(config, heartbeat.HeartbeatRecord(run_id, end, status, reason))
    return RadarOutcome(run_id=run_id, ran=True, alerted=True, run_result=rr)


# --------------------------------------------------------------------------- render


def render_crontab(
    *,
    repo_root: str = "<REPO_ROOT>",
    state_dir: str = "<STATE_DIR>",
    python: str = "python3",
    hour: int = RADAR_DEFAULT_HOUR,
) -> str:
    """Render the reference radar crontab line (a SECOND job beside the essay run)."""
    cd = f"cd {repo_root} &&"
    log = f"{state_dir}/radar-cron.log"
    env = "PIPELINE_GIT_PUSH=1 PIPELINE_MODEL=opus "
    run_cmd = f"{cd} {env}{python} -m pipeline.radar.cron run >> {log} 2>&1"
    return (
        "# my-blog RADAR engine -- daily release/spec/tool brief (a SECOND job beside the\n"
        "# essay run at 09:00). Time below is LOCAL; runs-radar/ + state-radar/ keep it\n"
        "# independent of the essay slate. Add ALERT_WEBHOOK_URL at the top for alerts.\n"
        f"# RADAR: daily at {hour:02d}:00 local.\n"
        f"0 {hour} * * *  {run_cmd}\n"
    )


# --------------------------------------------------------------------------- CLI


def _default_sink(config: PipelineConfig) -> AlertSink:
    from ..schedule.alert import AlertSink as _AlertSink
    from ..schedule.alert import FileAlertSink, LogAlertSink, MultiAlertSink, WebhookAlertSink

    sinks: list[_AlertSink] = [
        FileAlertSink(config.schedule_state_dir / "alerts.jsonl"),
        LogAlertSink(),
    ]
    if config.alert_webhook_url:
        sinks.append(WebhookAlertSink(config.alert_webhook_url))
    return MultiAlertSink(sinks)


def _cmd_run(config: PipelineConfig, *, now: datetime) -> int:
    from ..runner import CpeLoopDriver
    from ..schedule import deploy

    outcome = run_radar_scheduled(config, CpeLoopDriver(config), _default_sink(config), now=now)
    if outcome.paused:
        print(f"radar {outcome.run_id}: schedule paused; not driven")
    elif outcome.already_complete:
        print(f"radar {outcome.run_id}: already complete; idempotent no-op")
    elif outcome.alerted:
        print(f"radar {outcome.run_id}: ran but ended failed/blocked (alert delivered)")
    else:
        print(f"radar {outcome.run_id}: ran to completion")
    # M-13 deploy push only on a clean run-to-completion (same gate as the essay cron).
    if outcome.ran and not outcome.alerted:
        deploy.push_after_success(config)
    return 0


def _cmd_render(*, resolve: bool) -> int:
    if resolve:
        from .config import radar_config_from_env

        cfg = radar_config_from_env()
        print(
            render_crontab(
                repo_root=str(cfg.repo_root),
                state_dir=str(cfg.schedule_state_dir),
                python=sys.executable,
            )
        )
    else:
        print(render_crontab())
    return 0


def _make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pipeline.radar.cron", description="LOCAL scheduler entrypoint for the radar run."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("run", help="drive one radar slate (heartbeat + alerts on failure/block)")
    p_render = sub.add_parser("render", help="print the reference radar crontab line")
    p_render.add_argument(
        "--resolve", action="store_true", help="substitute real repo_root/state_dir/python"
    )
    return parser


def _main(argv: list[str] | None = None) -> int:
    args = _make_parser().parse_args(argv)
    if args.cmd == "render":
        return _cmd_render(resolve=args.resolve)
    from .config import radar_config_from_env

    config = radar_config_from_env()
    if args.cmd == "run":
        return _cmd_run(config, now=datetime.now(UTC))
    return 2


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "RadarOutcome",
    "run_radar_scheduled",
    "render_crontab",
    "RADAR_DEFAULT_HOUR",
    "RADAR_LABEL",
]

"""The content-engine harness: assemble / drive / resume an editorial slate.

The production ``SlateDriver`` wraps ``claude-plan-execute-loop`` — the exit-75
auto-resume wrapper (NFR-8), NOT the bare runner. cpe is imported lazily inside
functions (after ``ensure_cpe_importable()``), never at module top, so this
module imports offline.

Run-dir contract (PINNED — see ``pipeline/README.md``): each run lives in
``pipeline/runs/<run_id>/`` with an assembled ``tasks.yaml`` and a ``plans/``
dir (== cpe ``defaults.plans_dir``, *relative*). The production driver passes
``--dir <abs run_dir>`` (cpe ``chdir``s there) + ``--tasks <abs tasks.yaml>`` so
the loop wrapper's USAGE_LIMIT sentinel discovery and cpe's writer agree on one
absolute path, ``run_dir/plans/USAGE_LIMIT``. That agreement is what makes
exit-75 auto-resume actually fire.

Live-run caveat: the *sentinel-found / usage-limit resume* path is only
exercisable in a real tmux run. The offline tests prove the argv/env shape, the
exit-code mapping, and that the fake writes the sentinel at the correct
``plans/USAGE_LIMIT`` location — not that the real loop wrapper consumes it.
"""
from __future__ import annotations

import copy
import os
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import yaml

from .config import (
    CPE_BACKEND_ENV,
    CPE_LOOP_ENV,
    PipelineConfig,
    ensure_cpe_importable,
)

# A blocked `argue` OR `draft` triggers the fallback-to-next-topic re-drive (section 7):
# both gate cadence and both re-run on a fallback. cpe cannot jump back via depends_on, so
# the harness owns the re-drive (fallback.apply_fallback).
_FALLBACK_BLOCKING_TASKS = ("argue", "draft")


def _first_blocker(plan: ResumePlan) -> str | None:
    """The fallback-blocking task that is blocked (argue runs before draft, so at most
    one of the two is blocked at a time); None if neither is."""
    return next(
        (tid for tid in _FALLBACK_BLOCKING_TASKS if tid in plan.blocked), None
    )


def _usage_limit_code() -> int:
    """cpe's usage-limit exit code (== 75), fetched lazily (offline-safe).

    ``claude.py`` top-level imports are stdlib + ``colors`` only, so importing
    this constant needs no tmux/network. Avoids hardcoding 75 (anti-drift).
    """
    ensure_cpe_importable()
    from claude_plan_execute.claude import USAGE_LIMIT_EXIT_CODE

    return USAGE_LIMIT_EXIT_CODE


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class AssembledSlate:
    """A materialized per-run slate (paths + topological task order)."""

    run_id: str
    run_dir: Path
    tasks_path: Path          # run_dir / "tasks.yaml"
    plans_dir: Path           # run_dir / "plans" (== defaults.plans_dir)
    slate_id: str             # == run_id (sticky, seeded into state.json)
    task_ids: list[str]       # topological order


@dataclass(frozen=True)
class SlateResult:
    """Outcome of one driver invocation."""

    exit_code: int
    complete: bool            # exit_code == 0
    usage_limited: bool       # exit_code == USAGE_LIMIT_EXIT_CODE


@dataclass(frozen=True)
class ResumePlan:
    """Advisory read of cpe state — where a run stands."""

    done: list[str]
    in_flight: str | None     # first task in an in-progress cpe status
    next_task: str | None     # in_flight, else first eligible pending task
    blocked: list[str]
    complete: bool


@dataclass(frozen=True)
class RunResult:
    """The full result of a ``run(...)`` call."""

    run_id: str
    slate: AssembledSlate
    result: SlateResult
    plan: ResumePlan
    fallback_attempts: int = 0  # fallback-to-next-topic re-drives taken (OQ-14a)
    alerted: bool = False       # an ALERT.json was written (skip/dry or terminal block)


# ---------------------------------------------------------------------------
# Driver seam
# ---------------------------------------------------------------------------


class SlateDriver(Protocol):
    """Drives an assembled slate to completion (or interruption)."""

    def run_slate(self, slate: AssembledSlate, *, resume: bool) -> SlateResult:
        ...


class CpeLoopDriver:
    """Production driver — wraps ``claude-plan-execute-loop`` (NFR-8 auto-resume).

    Wraps the LOOP wrapper, not the bare runner: the wrapper is what sleeps on a
    usage limit (exit 75 + USAGE_LIMIT sentinel) and relaunches. ``--interactive``
    selects the tmux backend (M-6 subscription pool); the BACKEND env var is set
    to match (cpe precedence: env > flag > defaults — they agree here).
    """

    def __init__(self, config: PipelineConfig) -> None:
        self.config = config

    def run_slate(self, slate: AssembledSlate, *, resume: bool) -> SlateResult:
        if not self.config.loop_bin:
            raise RuntimeError(
                "claude-plan-execute-loop not found. Install/symlink the cpe "
                f"console scripts on PATH or set {CPE_LOOP_ENV}. NFR-8 "
                "auto-resume requires the loop wrapper, not the bare runner."
            )
        argv = [
            self.config.loop_bin,
            "--dir", str(slate.run_dir.resolve()),       # cwd = run_dir (contract)
            "--tasks", str(slate.tasks_path.resolve()),  # absolute (sentinel match)
            "--interactive",                             # backend = tmux (M-6)
        ]
        if self.config.skip_permissions:
            argv.append("--skip-permissions")
        env = {**os.environ, CPE_BACKEND_ENV: self.config.claude_backend}
        # `resume` does not change argv: cpe skips done/blocked tasks via
        # state.json (runner._is_eligible). The loop wrapper handles the
        # usage-limit resume internally; the harness's own resume (a fresh
        # invocation re-driving the same tasks.yaml) covers crash/restart.
        proc = subprocess.run(argv, cwd=str(self.config.repo_root), env=env)
        code = proc.returncode
        return SlateResult(code, code == 0, code == _usage_limit_code())


# ---------------------------------------------------------------------------
# Validation + topo helpers
# ---------------------------------------------------------------------------


def validate_slate(raw: dict):
    """Validate via ``TasksFile.model_validate`` (raises on schema errors).

    NOT ``loader.load_tasks_file`` — that one ``sys.exit(1)``s and prints CLI
    warnings. The "zero warnings against the real loader" guarantee is proven
    separately by the test suite (running the written file through
    ``loader.load_tasks_file`` under captured stdout).
    """
    ensure_cpe_importable()
    from claude_plan_execute.schema import TasksFile

    return TasksFile.model_validate(raw)


def _topo_ids(tasks: list[dict]) -> list[str]:
    """Topological order of task ids via cpe ``deps.validate_dependencies``.

    Takes the TASK LIST (``raw["tasks"]``), not the file dict, and returns task
    dicts in order — projected to string ids. NOTE: cpe's
    ``validate_dependencies`` ``sys.exit(1)``s on a cycle or missing dep rather
    than raising; for the shipped (valid) template that path is never taken.
    """
    ensure_cpe_importable()
    from claude_plan_execute import deps

    ordered = deps.validate_dependencies(tasks)
    return [str(t["id"]) for t in ordered]


# ---------------------------------------------------------------------------
# Assemble / load / resume / run
# ---------------------------------------------------------------------------


def assemble_slate(
    run_id: str,
    config: PipelineConfig,
    *,
    stage_descriptions: dict[str, str] | None = None,
    overwrite: bool = False,
) -> AssembledSlate:
    """Materialize a per-run slate dir from the template (isolated run-dir).

    Deep-copies the template, stamps per-run + config knobs (and any
    ``stage_descriptions`` overrides — the task-24/25 prompt-builder injection
    seam), validates, writes ``tasks.yaml`` deterministically, and seeds
    ``plans/state.json`` with the sticky ``slate_id``.
    """
    run_dir = config.runs_root / run_id
    tasks_path = run_dir / "tasks.yaml"
    plans_dir = run_dir / "plans"
    if tasks_path.exists() and not overwrite:
        raise FileExistsError(
            f"run {run_id!r} already assembled at {tasks_path}. Resume reloads "
            "(load_slate); pass overwrite=True to re-assemble."
        )
    plans_dir.mkdir(parents=True, exist_ok=True)

    raw = copy.deepcopy(
        yaml.safe_load(config.template_path.read_text(encoding="utf-8"))
    )

    defaults = raw.setdefault("defaults", {})
    defaults["plans_dir"] = "plans"                  # relative to --dir (run_dir)
    defaults["model"] = config.model
    defaults["effort"] = config.effort
    defaults["claude_backend"] = config.claude_backend
    caps = defaults.setdefault("caps", {})
    caps["max_minutes_per_phase"] = config.max_minutes_per_phase
    caps["max_review_rounds"] = config.max_review_rounds
    caps["max_gate_repair_rounds"] = config.max_gate_repair_rounds

    # Absolutize the file pointers. cpe `os.chdir(--dir=run_dir)`s BEFORE resolving
    # these (cli.py), so a relative `pipeline/invariants.yaml` would resolve under
    # run_dir and silently NOT load (load_invariants returns [] for a missing path) =>
    # the M-4 gates would never fire in a live run; persona_file has the same latent
    # bug (missing => silent ""). Derived from the fixed config.repo_root, so the
    # written tasks.yaml stays byte-identical across run-ids (assemble determinism). No
    # .resolve() (avoids macOS /private symlink churn; repo_root is already absolute).
    repo_root = config.repo_root
    for key in ("persona_file", "invariants_file"):
        val = defaults.get(key)
        if val and not Path(val).is_absolute():
            defaults[key] = str(repo_root / val)

    if stage_descriptions:
        for task in raw.get("tasks", []):
            tid = str(task.get("id"))
            if tid in stage_descriptions:
                task["description"] = stage_descriptions[tid]

    validate_slate(raw)  # schema errors only; zero-warnings proven in tests

    tasks_path.write_text(
        yaml.safe_dump(raw, sort_keys=False, allow_unicode=True),
        encoding="utf-8",
    )

    task_ids = _topo_ids(raw["tasks"])

    # Seed cpe state with the sticky slate_id (cpe `_resolve_slate_id` returns
    # the cached value first), giving drivers a live state file to update.
    ensure_cpe_importable()
    from claude_plan_execute.state import State

    state = State(plans_dir / "state.json")
    state.data["slate_id"] = run_id
    state.save()

    return AssembledSlate(
        run_id=run_id,
        run_dir=run_dir,
        tasks_path=tasks_path,
        plans_dir=plans_dir,
        slate_id=run_id,
        task_ids=task_ids,
    )


def load_slate(run_id: str, config: PipelineConfig) -> AssembledSlate:
    """Reload an already-assembled slate (the resume path). Never re-stamps."""
    run_dir = config.runs_root / run_id
    tasks_path = run_dir / "tasks.yaml"
    plans_dir = run_dir / "plans"
    if not tasks_path.exists():
        raise FileNotFoundError(
            f"run {run_id!r} not assembled (no {tasks_path}). Call "
            "assemble_slate(...) before resuming."
        )
    raw = yaml.safe_load(tasks_path.read_text(encoding="utf-8"))
    task_ids = _topo_ids(raw["tasks"])
    slate_id = run_id
    state_path = plans_dir / "state.json"
    if state_path.exists():
        ensure_cpe_importable()
        from claude_plan_execute.state import State

        slate_id = State(state_path).data.get("slate_id", run_id)
    return AssembledSlate(
        run_id=run_id,
        run_dir=run_dir,
        tasks_path=tasks_path,
        plans_dir=plans_dir,
        slate_id=slate_id,
        task_ids=task_ids,
    )


def resume_point(slate: AssembledSlate, config: PipelineConfig) -> ResumePlan:
    """Pure read of cpe state -> a resume report (advisory).

    ``in_flight`` covers cpe's full in-progress status set
    (planning/reviewing/revising/approved/implementing/awaiting_human), derived
    from ``state.STATUSES`` so it cannot drift — a crash mid-plan/review is
    reported, not just mid-implement. The report is advisory: cpe's own
    ``_is_eligible`` re-drives any non-done/blocked/split task regardless. No
    writes (reads ``state.data`` directly; does not auto-create entries).
    """
    ensure_cpe_importable()
    from claude_plan_execute.state import STATUSES, State

    in_progress = set(STATUSES) - {"pending", "done", "blocked", "split"}
    state = State(slate.plans_dir / "state.json")

    def status_of(tid: str) -> str:
        entry = state.data.get("tasks", {}).get(str(tid))
        return entry.get("status", "pending") if isinstance(entry, dict) else "pending"

    raw = yaml.safe_load(slate.tasks_path.read_text(encoding="utf-8"))
    deps_by_id = {
        str(t["id"]): [str(d) for d in t.get("depends_on", [])]
        for t in raw["tasks"]
    }

    statuses = {tid: status_of(tid) for tid in slate.task_ids}
    done = [tid for tid in slate.task_ids if statuses[tid] == "done"]
    blocked = [tid for tid in slate.task_ids if statuses[tid] == "blocked"]
    done_set = set(done)
    in_flight = next(
        (tid for tid in slate.task_ids if statuses[tid] in in_progress), None
    )
    next_pending = next(
        (
            tid
            for tid in slate.task_ids
            if statuses[tid] == "pending"
            and all(d in done_set for d in deps_by_id.get(tid, []))
        ),
        None,
    )
    next_task = in_flight if in_flight is not None else next_pending
    complete = all(statuses[tid] == "done" for tid in slate.task_ids)
    return ResumePlan(
        done=done,
        in_flight=in_flight,
        next_task=next_task,
        blocked=blocked,
        complete=complete,
    )


def run(
    run_id: str,
    config: PipelineConfig,
    driver: SlateDriver,
    *,
    resume: bool = False,
) -> RunResult:
    """Assemble (or reload, on resume) -> drive -> read the resume point, then run the
    fallback-to-next-topic re-drive loop (OQ-14a) if ``argue`` OR ``draft`` blocked.

    cpe cannot jump back to ``argue``/``draft`` via a depends_on edge, so the harness owns
    the re-drive: on a blocked ``argue`` or ``draft`` (the ``_FALLBACK_BLOCKING_TASKS``
    pair, section-7 cadence), ``fallback.apply_fallback`` rewrites the brief for the next
    fallback topic (or skips+alerts when the shortlist is dry / the budget is spent) and
    resets BOTH ``argue`` and ``draft`` to pending; we re-drive (resume) and re-read. After
    the budget is spent with the blocker still blocked, write a terminal ALERT.json naming
    it. A non-blocking block (e.g. ``research``) gives ``_first_blocker == None`` -> the
    loop is skipped (cron's generic-block alert handles it); existing resume/interrupt
    behavior is unchanged.
    """
    slate = load_slate(run_id, config) if resume else assemble_slate(run_id, config)
    result = driver.run_slate(slate, resume=resume)
    plan = resume_point(slate, config)

    from .gate import fallback as _fb  # LAZY — keep stages.* out of `import pipeline`

    attempts, alerted = 0, False
    blocker = _first_blocker(plan)
    while blocker is not None and attempts < config.fallback_topic_attempts:
        decision = _fb.apply_fallback(
            slate.run_dir, config, attempts_used=attempts, blocked_task=blocker
        )
        if decision.action == "skip":
            alerted = True  # apply_fallback already wrote ALERT.json (naming `blocker`)
            break
        attempts += 1
        result = driver.run_slate(slate, resume=True)
        plan = resume_point(slate, config)
        blocker = _first_blocker(plan)
    if blocker is not None and not alerted:
        _fb.write_alert(
            slate.run_dir,
            reason=f"terminal failure: {blocker} blocked after {attempts} fallback attempt(s)",
            blocked_task=blocker,
        )
        alerted = True
    return RunResult(
        run_id=run_id,
        slate=slate,
        result=result,
        plan=plan,
        fallback_attempts=attempts,
        alerted=alerted,
    )


__all__ = [
    "AssembledSlate",
    "SlateResult",
    "ResumePlan",
    "RunResult",
    "SlateDriver",
    "CpeLoopDriver",
    "validate_slate",
    "assemble_slate",
    "load_slate",
    "resume_point",
    "run",
]

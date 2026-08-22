# `pipeline/` — the autonomous content engine

The scheduled editorial writing engine (`docs/writing-flow.md`, `M-6`, `NFR-8`,
`NFR-10`). It wraps [`claude-plan-execute`](../README.md) (cpe) as the
orchestration substrate: **one editorial run = one cpe slate** of dependent
tasks, driven on the **tmux** backend (subscription pool) with **exit-code-75
auto-resume**.

This package is **tooling that commits markdown to the repo** — not a hosted
service. Task 23 ships the _harness_ only; stage logic, prompt builders, the M-4
quality gate, topic memory/embedder, the house-style guide, scheduling and the
fallback-to-next-topic policy are named seams owned by tasks 24–28.

## The slate

```
research ──▶ select ──▶ draft (FR+EN) ──▶ publish
```

- **review** = the `draft` task's built-in cpe `APPROVED`/`NEEDS_REVISION` loop.
- **M-4 gate** = agent gates on `draft` (task 26, via `invariants_file` +
  `gates_extra`).
- `publish depends_on [draft]`, so a blocked draft (gate failure) ⇒ publish never
  runs = **bilingual-or-nothing** (`NFR-11`).

The shape lives in [`tasks-template.yaml`](./tasks-template.yaml) (cpe **v2**,
zero loader warnings). `runner.assemble_slate` deep-copies it, stamps per-run +
config knobs (and optional `stage_descriptions`), and writes a per-run
`tasks.yaml`.

## Run-dir contract (PINNED — do not change without re-verifying cpe)

Each run is isolated, so editorial runs never collide with each other (nor, back
when the site was being built, with the build slate's own repo-root `plans/`):

```
pipeline/runs/<run_id>/
  tasks.yaml          # assembled per-run slate (gitignored)
  plans/              # cpe state + per-stage artifacts (== defaults.plans_dir)
    state.json
    task-research/ task-select/ task-draft/ task-publish/
    USAGE_LIMIT       # cpe usage-limit sentinel (when hit)
```

The production driver (`CpeLoopDriver`) invokes:

```
claude-plan-execute-loop \
  --dir   <abs run_dir>          # cpe chdir's here; cwd = run_dir
  --tasks <abs run_dir/tasks.yaml>   # ABSOLUTE (sentinel discovery)
  --interactive                  # backend = tmux (M-6)  [--skip-permissions]
# subprocess cwd = repo_root, env CLAUDE_PLAN_EXECUTE_BACKEND=tmux
```

**Why this exact shape:** the loop wrapper discovers the usage-limit sentinel at
`Path(--tasks).parent / defaults.plans_dir / "USAGE_LIMIT"`, while cpe's writer
resolves `plans_dir` relative to its cwd (`--dir`). With `--dir = run_dir`,
`defaults.plans_dir: plans` (relative), and an **absolute** `--tasks`, both sides
resolve to the same `run_dir/plans/USAGE_LIMIT` — which is what makes exit-75
auto-resume (`NFR-8`) actually fire. Wrap the **loop** wrapper, never the bare
runner.

**Implication for stages (tasks 24–27):** the editorial `claude` agent runs with
**cwd = `run_dir`** (inside the repo). Address repo files (`src/content/…`) via
`config.repo_root`, _not_ cwd-relative. Git still works (`.git` is found upward).

## Running

```python
from pipeline import PipelineConfig, CpeLoopDriver, run
cfg = PipelineConfig.from_env()                 # discovers cpe + loop wrapper
result = run("2026-06-02-am", cfg, CpeLoopDriver(cfg))   # live: needs tmux login
# resume after a crash/restart (re-drives; cpe skips completed stages):
result = run("2026-06-02-am", cfg, CpeLoopDriver(cfg), resume=True)
```

`PipelineConfig.from_env()` discovers `claude-plan-execute-loop` and the cpe
checkout. Overrides: `CLAUDE_PLAN_EXECUTE_LOOP_BIN`, `CLAUDE_PLAN_EXECUTE_HOME`,
`CLAUDE_PLAN_EXECUTE_BACKEND`.

## Scheduling (M-5)

The run is driven on a **LOCAL** cron/launchd schedule (not CI — CI has no Claude
subscription login), via `python -m pipeline.schedule.cron`:

```
run      drive one editorial slate (records a heartbeat; alerts on failure/block)
monitor  dead-man's-switch: alert on a missed / stalled / overdue run
pause    pause the schedule  (FR-F4 — a config flag, no code change)
resume   resume the schedule (FR-F4)
status   recent run history + pause state + next fire (FR-F1)
render   print the reference crontab + launchd plist (`--resolve` fills real paths)
```

**Two entries = a dead-man's-switch** (a missed run can't self-report): a
daily **RUN** (09:00) plus a daily **MONITOR**. Install them as an
owner runner-setup step (same family as the one-time tmux/subscription login) —
copy `pipeline/schedule/scheduler.cron.example` into `crontab -e` (or load
`scheduler.plist.example` as two LaunchAgents) after editing `<REPO_ROOT>` /
`<STATE_DIR>`, or pipe `python -m pipeline.schedule.cron render --resolve` into
`crontab -`. The schedule code **never** auto-installs or touches the real
crontab. Runtime state (heartbeat/alerts ledgers, the `schedule.json` pause flag,
`cron.log`) lives under `pipeline/schedule/state/` and is gitignored.

**Times are dual-framed, reconciled by run_id.** The local cron `HOUR` is
wall-clock (`0 9 * * *` = 09:00 _local_); the heartbeat `Cadence` is UTC-framed.
They are reconciled by matching the period on the **run_id / calendar day**, not
the instant — so a healthy 07:00-UTC (= 09:00 Paris) record is not mis-read as a
missed 09:00-UTC slot (holds for any offset west of UTC+10).

> **Honest limitations (do not over-claim "alerts on missed runs").** The local
> monitor shares the runner's failure domain: it catches _"machine up, run
> failed/overdue"_ but **not** _"machine asleep/off"_ (macOS cron has no
> catch-up). A long usage-limit sleep (shorter than `schedule_grace_hours`, an
> owner knob) reads as a benign in-flight `pending`, never a false missed. The
> build ships **File / Log / Collecting** alert sinks only; a live **email /
> webhook** channel and an **external uptime-ping** dead-man's-switch are
> POST-SECRET seams behind the `AlertSink` Protocol. And the **git push** that
> fires the Cloudflare Pages deploy + reindex is owner/deploy-wiring — **not** a
> push from the schedule code.
>
> **Live runs (post-OQ-5):** set `PIPELINE_EMBEDDER=real` so the `select` stage
> dedups with the real multilingual embedder, not the monolingual offline fake.

## Tests — fully offline

`pytest -q pipeline` runs with **no claude, no tmux, no network, no secrets**.
`FakeClaudeDriver` drives cpe's **real** `state.State` and writes per-stage
artifact stubs, so assembly + resume are tested against the real on-disk shape.
The production driver's argv/env/exit-code mapping is tested via a monkeypatched
`subprocess.run`. cpe is made importable offline by `conftest.py` (discovery →
`sys.path`), so no editable install is required for the gate to be green.

> **Live-only boundary:** the tests prove the driver's argv/env shape, the
> exit-code mapping, and that the fake writes the sentinel at the correct
> `plans/USAGE_LIMIT` path — **not** that the live loop wrapper _consumes_ it and
> auto-resumes. That path is only exercisable in a real tmux run.

Humans wanting the editable install instead of the discovery bootstrap:

```
uv pip install -e /Users/rachid/dev-env/0-git/claude-plan-execute
```

## Notes

- `persona_file: pipeline/house_style.md` and `invariants_file:
pipeline/invariants.yaml` are **intentionally** distinct from the build slate's
  `docs/persona.md` / `docs/invariants.yaml`: the editorial run is a separate
  slate with separate gates. Don't "fix" them to point at `docs/`. Both files are
  authored later (tasks 25/26); cpe injects `""`/empty for a missing file.
- See `docs/writing-flow.md` (the content engine) and `docs/persona.md`
  (conventions). The cpe reference lives with the tool itself, in the
  `claude-plan-execute` repo.

```

```

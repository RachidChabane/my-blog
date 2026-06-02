# `pipeline/` — the autonomous content engine

The scheduled editorial writing engine (`docs/writing-flow.md`, `M-6`, `NFR-8`,
`NFR-10`). It wraps [`claude-plan-execute`](../README.md) (cpe) as the
orchestration substrate: **one editorial run = one cpe slate** of dependent
tasks, driven on the **tmux** backend (subscription pool) with **exit-code-75
auto-resume**.

This package is **tooling that commits markdown to the repo** — not a hosted
service. Task 23 ships the *harness* only; stage logic, prompt builders, the M-4
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

Each run is isolated so editorial runs never collide with the build slate's
repo-root `plans/`:

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
`config.repo_root`, *not* cwd-relative. Git still works (`.git` is found upward).

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

## Tests — fully offline

`pytest -q pipeline` runs with **no claude, no tmux, no network, no secrets**.
`FakeClaudeDriver` drives cpe's **real** `state.State` and writes per-stage
artifact stubs, so assembly + resume are tested against the real on-disk shape.
The production driver's argv/env/exit-code mapping is tested via a monkeypatched
`subprocess.run`. cpe is made importable offline by `conftest.py` (discovery →
`sys.path`), so no editable install is required for the gate to be green.

> **Live-only boundary:** the tests prove the driver's argv/env shape, the
> exit-code mapping, and that the fake writes the sentinel at the correct
> `plans/USAGE_LIMIT` path — **not** that the live loop wrapper *consumes* it and
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
- See `docs/writing-flow.md` (the content engine), `docs/persona.md` (conventions),
  and `inventory/02-claude-plan-execute.md` (the cpe reference).
```

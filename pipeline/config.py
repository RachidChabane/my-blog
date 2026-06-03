"""Configuration + cpe discovery/bootstrap for the content engine.

Pure stdlib at module top — there is intentionally NO ``claude_plan_execute``
import here, so this module parses and ``PipelineConfig`` constructs even when
cpe is not yet importable. cpe is reached lazily via ``ensure_cpe_importable()``
(called by the runner and by the pytest conftest), never at import time.
"""
from __future__ import annotations

import os
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path

CPE_LOOP_ENV = "CLAUDE_PLAN_EXECUTE_LOOP_BIN"
CPE_HOME_ENV = "CLAUDE_PLAN_EXECUTE_HOME"
CPE_BACKEND_ENV = "CLAUDE_PLAN_EXECUTE_BACKEND"


def discover_loop_bin() -> str | None:
    """Path to the ``claude-plan-execute-loop`` exit-75 auto-resume wrapper.

    Env override (``CLAUDE_PLAN_EXECUTE_LOOP_BIN``) wins; otherwise
    ``shutil.which``. Returns ``None`` when neither resolves — the production
    driver raises a clear install hint in that case.
    """
    env = os.environ.get(CPE_LOOP_ENV)
    if env:
        return env
    return shutil.which("claude-plan-execute-loop")


def discover_cpe_home() -> Path | None:
    """Locate the cpe checkout containing ``src/claude_plan_execute/__init__.py``.

    Env override (``CLAUDE_PLAN_EXECUTE_HOME``) wins. Otherwise resolve the
    ``claude-plan-execute`` console script on PATH — a symlink into the cpe
    repo — via ``realpath`` and walk its parents for the ``src/claude_plan_execute``
    package. Returns ``None`` when cpe cannot be located.
    """
    env = os.environ.get(CPE_HOME_ENV)
    if env:
        return Path(env)
    exe = shutil.which("claude-plan-execute")
    if not exe:
        return None
    real = Path(exe).resolve()
    for parent in real.parents:
        if (parent / "src" / "claude_plan_execute" / "__init__.py").is_file():
            return parent
    return None


def ensure_cpe_importable() -> None:
    """Make ``import claude_plan_execute`` succeed offline, with no install.

    Tries the import; on failure, inserts ``discover_cpe_home()/src`` at the
    front of ``sys.path`` and retries. Raises a ``RuntimeError`` naming
    ``CPE_HOME_ENV`` if cpe still cannot be imported. Idempotent.
    """
    try:
        import claude_plan_execute  # noqa: F401
        return
    except ImportError:
        pass
    home = discover_cpe_home()
    if home is not None:
        src = str(home / "src")
        if src not in sys.path:
            sys.path.insert(0, src)
    try:
        import claude_plan_execute  # noqa: F401
    except ImportError as exc:
        raise RuntimeError(
            "claude_plan_execute is not importable. Install/symlink the cpe "
            "console scripts on PATH, or set "
            f"{CPE_HOME_ENV}=<cpe checkout containing src/claude_plan_execute>."
        ) from exc


@dataclass(frozen=True)
class PipelineConfig:
    """Resolved knobs for one editorial run.

    Derived paths (``runs_root``, ``template_path``) and discovered binaries
    (``loop_bin``, ``cpe_home``) are filled lazily — ``from_env()`` for
    production, ``__post_init__`` for path derivation on direct construction —
    so nothing runs ``shutil.which`` or freezes ``cwd`` at import time.
    """

    repo_root: Path
    runs_root: Path | None = None
    template_path: Path | None = None
    loop_bin: str | None = None
    cpe_home: Path | None = None
    claude_backend: str = "tmux"           # M-6 / NFR-10 — subscription pool
    skip_permissions: bool = True          # unattended runs
    model: str = "sonnet"                  # editorial default (overridable)
    effort: str = "medium"                 # editorial default
    max_review_rounds: int = 2             # OQ-14b — stamped into template caps
    max_gate_repair_rounds: int = 1        # OQ-14b — M-4 gate-repair (task 26)
    max_minutes_per_phase: int = 30        # caps
    fallback_topic_attempts: int = 2       # OQ-14a — harness-owned (task 26)
    embedder: str = "shared-multilingual"  # OQ-5 seam name only
    # Scheduling (M-5, task 28). schedule_state_dir holds the gitignored runtime
    # ledgers/flags (heartbeat.jsonl, alerts.jsonl, schedule.json, cron.log);
    # derived under repo_root in __post_init__ when left None.
    schedule_state_dir: Path | None = None
    # owner knob: MISSED/STALLED grace window (usage-limit sleeps stay benign)
    schedule_grace_hours: int = 6

    def __post_init__(self) -> None:
        object.__setattr__(self, "repo_root", Path(self.repo_root))
        runs = self.runs_root
        object.__setattr__(
            self,
            "runs_root",
            self.repo_root / "pipeline" / "runs" if runs is None else Path(runs),
        )
        tmpl = self.template_path
        object.__setattr__(
            self,
            "template_path",
            self.repo_root / "pipeline" / "tasks-template.yaml"
            if tmpl is None
            else Path(tmpl),
        )
        object.__setattr__(
            self,
            "schedule_state_dir",
            self.repo_root / "pipeline" / "schedule" / "state"
            if self.schedule_state_dir is None
            else Path(self.schedule_state_dir),
        )
        if self.cpe_home is not None:
            object.__setattr__(self, "cpe_home", Path(self.cpe_home))

    @classmethod
    def from_env(cls, repo_root: Path | str | None = None) -> PipelineConfig:
        """Build a config from the environment + discovery.

        Thin override layer: reads ``CLAUDE_PLAN_EXECUTE_BACKEND`` (default
        ``tmux``) and resolves ``loop_bin``/``cpe_home`` via discovery (which
        honor ``CLAUDE_PLAN_EXECUTE_LOOP_BIN`` / ``_HOME``). No config file is
        read at this task.
        """
        root = Path(repo_root) if repo_root is not None else Path.cwd()
        backend = os.environ.get(CPE_BACKEND_ENV) or "tmux"
        return cls(
            repo_root=root,
            loop_bin=discover_loop_bin(),
            cpe_home=discover_cpe_home(),
            claude_backend=backend,
        )

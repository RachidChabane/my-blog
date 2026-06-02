"""my-blog content engine — the autonomous editorial writing pipeline.

This package is the *substrate* for the scheduled editorial run described in
``docs/writing-flow.md``. It wraps `claude-plan-execute` (cpe) as the
orchestration engine: a single editorial run is one cpe **slate** of dependent
tasks (research -> select -> draft(FR+EN) -> publish), driven on the **tmux**
backend (subscription pool, M-6/NFR-10) with exit-code-75 auto-resume (NFR-8).

Task 23 builds the harness only. Stage logic, prompt builders, the M-4 quality
gate, topic memory/embedder, the house-style guide, scheduling and the
fallback-to-next-topic policy are left as named seams for tasks 24-28.

Public API is re-exported from ``pipeline.runner`` / ``pipeline.config`` /
``pipeline.fakes`` (see ``__all__`` below).
"""
from __future__ import annotations

from .config import (
    PipelineConfig,
    discover_cpe_home,
    discover_loop_bin,
    ensure_cpe_importable,
)
from .fakes import FakeClaudeDriver
from .runner import (
    AssembledSlate,
    CpeLoopDriver,
    ResumePlan,
    RunResult,
    SlateDriver,
    SlateResult,
    assemble_slate,
    load_slate,
    resume_point,
    run,
)

__all__ = [
    "PipelineConfig",
    "discover_cpe_home",
    "discover_loop_bin",
    "ensure_cpe_importable",
    "SlateDriver",
    "CpeLoopDriver",
    "FakeClaudeDriver",
    "AssembledSlate",
    "SlateResult",
    "ResumePlan",
    "RunResult",
    "assemble_slate",
    "load_slate",
    "resume_point",
    "run",
]

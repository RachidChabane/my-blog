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
from .contracts import (
    Claim,
    ClaimSourceMap,
    ContractError,
    Embedder,
    ExcerptSpan,
    PriorTopic,
    SourceRecord,
    TopicMemoryReader,
    cosine,
    load_topic_memory,
)
from .fakes import (
    FakeClaudeDriver,
    FakeEmbedder,
    FakeTopicMemory,
    tokenize,
)
from .prompts import (
    build_draft_prompt,
    build_research_prompt,
    build_revise_prompt,
    build_select_prompt,
    editorial_stage_descriptions,
)
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
    # contracts (task 24)
    "Claim",
    "ClaimSourceMap",
    "ContractError",
    "ExcerptSpan",
    "SourceRecord",
    "Embedder",
    "PriorTopic",
    "TopicMemoryReader",
    "cosine",
    "load_topic_memory",
    # offline doubles (task 24)
    "FakeEmbedder",
    "FakeTopicMemory",
    "tokenize",
    # prompt builders (task 24 + task 25 draft/revise)
    "build_research_prompt",
    "build_select_prompt",
    "build_draft_prompt",
    "build_revise_prompt",
    "editorial_stage_descriptions",
]
# Stage symbols (DraftDoc / ReviewReport / StyleReport, ...) are intentionally NOT
# re-exported here: importing them would pull pipeline.stages.{draft,review,humanize}
# into sys.modules during `import pipeline`, reintroducing the runpy double-import
# RuntimeWarning the import-light stages package avoids (review-1.md I1). Import them
# directly from pipeline.stages.<name>, as the tests do.

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
    build_argue_prompt,
    build_draft_prompt,
    build_publish_prompt,
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
    # prompt builders (task 24 + task 3 argue + task 25 draft/revise + task 27 publish)
    "build_research_prompt",
    "build_select_prompt",
    "build_argue_prompt",
    "build_draft_prompt",
    "build_revise_prompt",
    "build_publish_prompt",
    "editorial_stage_descriptions",
]
# Stage symbols (DraftDoc / ReviewReport / StyleReport, ...) are intentionally NOT
# re-exported here: importing them would pull pipeline.stages.{draft,review,humanize}
# into sys.modules during `import pipeline`, reintroducing the runpy double-import
# RuntimeWarning the import-light stages package avoids (review-1.md I1). Import them
# directly from pipeline.stages.<name>, as the tests do.
#
# The M-4 gate package (task 26) is held to the SAME rule and is even stricter: NOTHING
# from pipeline.gate.* is re-exported here -- not the factcheck/grounding/style CLIs (same
# runpy hazard) and not pipeline.gate.fallback either. fallback imports pipeline.stages.
# {select,research}, so re-exporting it would pull those into `import pipeline` and break
# `python -m pipeline.stages.select`'s no-runpy guarantee. runner.run() imports fallback
# LAZILY; the tests import every gate symbol directly from pipeline.gate.<name>.
#
# Task 27 holds pipeline.stages.publish AND the whole pipeline.memory.* package to the same
# rule: only the import-light PROMPT build_publish_prompt is re-exported above. The publish
# stage CLI, pipeline.memory.topic_memory, and pipeline.memory.embedder are NOT re-exported
# (publish imports the other stages; that's safe under `python -m pipeline.stages.publish`
# only because none of them is the -m target, which requires they stay out of this eager
# graph). Import them directly from their submodules, as the tests do.

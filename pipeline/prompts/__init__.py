"""Editorial prompt builders + the stage-description composition seam.

``editorial_stage_descriptions`` returns the ``{task_id: description}`` overrides
that task 28's scheduler passes to ``assemble_slate(stage_descriptions=...)``. Task
24 fills ``research`` + ``select``; task 25 adds ``draft``; task 27 adds ``publish``.
``run()`` / ``assemble_slate`` are NOT modified here — wiring is the seam.
"""
from __future__ import annotations

from pathlib import Path

from ..config import PipelineConfig
from .draft import build_draft_prompt, build_revise_prompt
from .publish import build_publish_prompt
from .research import build_research_prompt
from .select import build_select_prompt


def editorial_stage_descriptions(
    config: PipelineConfig,
    run_dir: Path,
    *,
    topic_memory_summary: str = "",
) -> dict[str, str]:
    """Compose per-stage prompt descriptions keyed by cpe task id.

    Returns ``{"research": ..., "select": ..., "draft": ..., "publish": ...}``.
    """
    return {
        "research": build_research_prompt(
            repo_root=config.repo_root,
            run_dir=run_dir,
            topic_memory_summary=topic_memory_summary,
        ),
        "select": build_select_prompt(
            repo_root=config.repo_root,
            run_dir=run_dir,
        ),
        "draft": build_draft_prompt(
            repo_root=config.repo_root,
            run_dir=run_dir,
        ),
        "publish": build_publish_prompt(
            repo_root=config.repo_root,
            run_dir=run_dir,
        ),
    }


__all__ = [
    "build_research_prompt",
    "build_select_prompt",
    "build_draft_prompt",
    "build_revise_prompt",
    "build_publish_prompt",
    "editorial_stage_descriptions",
]

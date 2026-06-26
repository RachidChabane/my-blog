"""Radar run driver -- assemble + drive a radar slate (reuses the essay harness).

A thin wrapper over ``pipeline.runner`` (``assemble_slate`` / ``load_slate`` /
``resume_point`` + the ``CpeLoopDriver``). The ONLY radar-specific behavior is injecting
``radar_stage_descriptions`` (research/draft/publish) instead of the essay
``editorial_stage_descriptions``. No argue/fallback loop: radar has no thesis-argue stage,
and a malformed draft simply blocks publish (bilingual-or-nothing) without a fallback
re-drive. The radar config (``radar_config_from_env``) supplies the radar-private
``runs_root`` / ``template_path``, so this never touches the essay slate.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..config import PipelineConfig
from ..runner import (
    AssembledSlate,
    ResumePlan,
    SlateDriver,
    SlateResult,
    assemble_slate,
    load_slate,
    resume_point,
)
from .prompts import radar_stage_descriptions


@dataclass(frozen=True)
class RadarRunResult:
    run_id: str
    slate: AssembledSlate
    result: SlateResult
    plan: ResumePlan


def _radar_descriptions(run_id: str, config: PipelineConfig) -> dict[str, str]:
    """Radar stage descriptions, with an AVOID list from the radar topic memory.

    An optional one-run ``RADAR_STEER`` env var is threaded into the research stage as
    an editorial nudge (e.g. a vendor focus); it never relaxes the genuine-and-sourced
    bar and leaves the default (unset) behavior unchanged.
    """
    import os

    from ..memory.topic_memory import TopicMemory
    from .config import radar_memory_path

    run_dir = config.runs_root / run_id
    try:
        records = TopicMemory.load(radar_memory_path(config.repo_root)).records()
    except Exception:  # advisory AVOID list only -- never gate the run on it
        records = []
    summary = "\n".join(f"- {r.title} :: {r.dedup_key}" for r in records if r.dedup_key)
    steer = os.environ.get("RADAR_STEER", "")
    return radar_stage_descriptions(
        config, run_dir, topic_memory_summary=summary, editorial_steer=steer
    )


def run(
    run_id: str, config: PipelineConfig, driver: SlateDriver, *, resume: bool = False
) -> RadarRunResult:
    """Assemble (or reload) the radar slate -> drive -> read the resume point."""
    slate = (
        load_slate(run_id, config)
        if resume
        else assemble_slate(run_id, config, stage_descriptions=_radar_descriptions(run_id, config))
    )
    result = driver.run_slate(slate, resume=resume)
    plan = resume_point(slate, config)
    return RadarRunResult(run_id=run_id, slate=slate, result=result, plan=plan)


__all__ = ["RadarRunResult", "run"]

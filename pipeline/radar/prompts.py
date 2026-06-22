"""Radar stage prompt builders + the radar stage-description composition seam.

The radar analog of ``pipeline/prompts``. Three stages: research -> draft -> publish.
The research bar is the INVERSE of the essay bar: releases, spec revisions, version
bumps, and new tools ARE the point here (the essay pipeline discards them as "a minor
version bump"). The draft mandates the schema/code/impact section contract. All paths are
ABSOLUTE; shell-outs use ``PYTHONPATH={repo_root} python3 -m ...`` (cwd = run_dir). No
emojis, no em-dashes (D-007 + owner directive).
"""

from __future__ import annotations

from pathlib import Path

from ..config import PipelineConfig

_FR_SECTIONS = "## Ce qui change / ## Le schéma / ## En pratique / ## Impact pour une équipe"
_EN_SECTIONS = "## What changed / ## The schema / ## In practice / ## Impact on your team"


def build_radar_research_prompt(
    *, repo_root: Path, run_dir: Path, topic_memory_summary: str = ""
) -> str:
    repo_root, run_dir = Path(repo_root), Path(run_dir)
    out = run_dir / "plans" / "task-research" / "radar-candidates.json"
    avoid = (
        "AVOID re-covering briefs already published. Recent radar topics:\n"
        f"{topic_memory_summary.strip()}\n"
        if topic_memory_summary.strip()
        else "AVOID re-covering already-published radar topics (none supplied this run).\n"
    )
    return (
        "STAGE: Radar research.\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        "GOAL: native web-search sweep for the FRESHEST (last ~3 weeks) AI-engineering\n"
        "RELEASES / SPEC CHANGES / NEW TOOLS / BENCHMARKS in: agentic AI and AI-assisted\n"
        "coding, frontier and open-weight LLMs, MCP and agent infrastructure, evals,\n"
        "RAG/retrieval, inference/serving. Unlike the essay pipeline, a release, a spec\n"
        "revision, a version bump, or a new tool IS exactly what belongs here -- this is\n"
        "the 'what shipped this week an AI engineer must know' feed.\n\n"
        "For the single best candidate, capture >= 2 INDEPENDENT real sources (a primary/\n"
        "origin source -- the spec, the release notes, the repo -- plus an independent\n"
        "corroboration). Per source record: label, url, the source's own date (ISO), and a\n"
        "VERBATIM excerpt you actually read. Pin the concrete technical details (real\n"
        "schema/type/config/protocol/API field names) the draft will show -- the writer\n"
        "must NOT invent any. If you cannot confirm a candidate from >= 2 independent\n"
        "sources, do not pick it.\n\n"
        f"{avoid}\n"
        "Pick the kind from: spec-change, release, tool, benchmark, security, research.\n"
        "No emojis, no em-dashes (use ' - ').\n\n"
        f"Write the chosen candidate (ranked list, best first) to: {out}\n"
        "Each candidate: {topic_id, kind, title, summary, why_relevant, tags[], "
        "schema_facts, sources:[{label,url,date,excerpt}]}.\n"
    )


def build_radar_draft_prompt(*, repo_root: Path, run_dir: Path) -> str:
    repo_root, run_dir = Path(repo_root), Path(run_dir)
    candidates = run_dir / "plans" / "task-research" / "radar-candidates.json"
    entry = run_dir / "plans" / "task-draft" / "entry.json"
    return (
        "STAGE: Radar draft (bilingual FR+EN).\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        f"1. READ the chosen candidate at: {candidates} (use the top-ranked one).\n\n"
        "2. WRITE a bilingual radar brief. The FR body MUST use EXACTLY these H2 headers\n"
        f"   in order: {_FR_SECTIONS}\n"
        f"   The EN body MUST use EXACTLY these H2 headers in order: {_EN_SECTIONS}\n"
        "   Rules:\n"
        "   - 'The schema'/'Le schéma': a FENCED CODE BLOCK with the REAL schema/type/\n"
        "     config/protocol/API surface (real field names from the sources, never\n"
        "     invented). Label the fence language.\n"
        "   - 'In practice'/'En pratique': a second FENCED CODE BLOCK -- a minimal usage\n"
        "     example an engineer could adapt.\n"
        "   - 'Impact on your team'/'Impact pour une équipe': concrete prose (who cares,\n"
        "     what to do, a deadline/risk/migration). A '> [!IMPORTANT]' callout is fine.\n"
        "   - 'What changed'/'Ce qui change': 2-4 sentences, what is new and WHEN (real date).\n"
        "   - ~250-450 words/language. Same brief in both languages. No emojis, no em-dashes.\n\n"
        f"3. WRITE the structured entry as JSON to: {entry}\n"
        "   {translationKey, kind, tags:[..], slug_fr, slug_en, title_fr, title_en,\n"
        "    summary_fr, summary_en, body_fr, body_en, sources:[{label,url,date,excerpt}]}\n"
        "   (date is the source's publish date as DD-MM-YYYY; >= 2 sources).\n"
    )


def build_radar_publish_prompt(*, repo_root: Path, run_dir: Path) -> str:
    repo_root, run_dir = Path(repo_root), Path(run_dir)
    entry = run_dir / "plans" / "task-draft" / "entry.json"
    cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.radar.stages publish"
        f" --run-dir {run_dir} --repo-root {repo_root}"
    )
    return (
        "STAGE: Radar publish.\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        f"The draft wrote the structured entry to {entry}. Publish it (project + validate\n"
        "BOTH languages + write BOTH or NEITHER into src/content/radar + append the radar\n"
        "topic memory) by shelling out to the deterministic publish stage:\n\n"
        f"  {cmd}\n\n"
        "Fix any reported structural problem in entry.json and re-run until it prints the\n"
        "two published paths. No manual step on this path (D-002).\n"
    )


def radar_stage_descriptions(
    config: PipelineConfig, run_dir: Path, *, topic_memory_summary: str = ""
) -> dict[str, str]:
    """Compose per-stage prompt descriptions keyed by radar cpe task id."""
    return {
        "research": build_radar_research_prompt(
            repo_root=config.repo_root, run_dir=run_dir, topic_memory_summary=topic_memory_summary
        ),
        "draft": build_radar_draft_prompt(repo_root=config.repo_root, run_dir=run_dir),
        "publish": build_radar_publish_prompt(repo_root=config.repo_root, run_dir=run_dir),
    }


__all__ = [
    "build_radar_research_prompt",
    "build_radar_draft_prompt",
    "build_radar_publish_prompt",
    "radar_stage_descriptions",
]

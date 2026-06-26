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

# Only the load-bearing opening + closing sections are required; the middle is discretionary.
_FR_REQUIRED = ("## Ce qui change", "## Impact pour une équipe")
_EN_REQUIRED = ("## What changed", "## Impact on your team")


def build_radar_research_prompt(
    *,
    repo_root: Path,
    run_dir: Path,
    topic_memory_summary: str = "",
    editorial_steer: str = "",
) -> str:
    repo_root, run_dir = Path(repo_root), Path(run_dir)
    out = run_dir / "plans" / "task-research" / "radar-candidates.json"
    avoid = (
        "AVOID re-covering briefs already published. Recent radar topics:\n"
        f"{topic_memory_summary.strip()}\n"
        if topic_memory_summary.strip()
        else "AVOID re-covering already-published radar topics (none supplied this run).\n"
    )
    steer = (
        "EDITORIAL STEER FOR THIS RUN (honor it unless no genuine, well-sourced\n"
        "candidate fits it; never fabricate or stretch a topic to comply):\n"
        f"{editorial_steer.strip()}\n\n"
        if editorial_steer.strip()
        else ""
    )
    return (
        "STAGE: Radar research.\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        f"{steer}"
        "GOAL: native web-search sweep for the FRESHEST AI-engineering RELEASES / SPEC\n"
        "CHANGES / NEW TOOLS / BENCHMARKS in: agentic AI and AI-assisted coding, frontier\n"
        "and open-weight LLMs (Anthropic / Claude, OpenAI / GPT, Google / Gemini, and the\n"
        "open-weight families), MCP and agent infrastructure, evals, RAG/retrieval,\n"
        "inference/serving. Unlike the essay pipeline, a release, a spec revision, a\n"
        "version bump, or a new tool IS exactly what belongs here -- this is the 'what\n"
        "shipped THIS WEEK an AI engineer must know' feed.\n\n"
        "FRESHNESS IS THE WHOLE POINT (this is a daily radar, not a recap):\n"
        "  - Strongly prefer developments from the LAST ~7 DAYS. Reach back to ~2 weeks\n"
        "    ONLY for something still genuinely current and uncovered. Anything older\n"
        "    than ~2 weeks is NOT radar material, however important -- it is old news the\n"
        "    reader already saw.\n"
        "  - VERIFY the item is STILL CURRENT as of today. HARD-REJECT anything that has\n"
        "    since been superseded by a newer version, withdrawn, suspended, paused,\n"
        "    deprecated, or is no longer publicly available. Check for a later update or\n"
        "    'access changed' notice on the primary source before you pick it. A brief\n"
        "    telling readers to adopt something they can no longer get is worse than no\n"
        "    brief. The source's own publish date being recent is NOT enough; confirm the\n"
        "    thing it describes is live right now.\n"
        "  - Today's date is the run date in the run_id; treat 'this week' relative to it.\n\n"
        "For the single best candidate, capture >= 2 INDEPENDENT real sources (a primary/\n"
        "origin source -- the spec, the release notes, the repo -- plus an independent\n"
        "corroboration). Per source record: label, url, the source's own date (ISO), and a\n"
        "VERBATIM excerpt you actually read. Pin the concrete technical details (real\n"
        "schema/type/config/protocol/API field names) the draft will show -- the writer\n"
        "must NOT invent any. If you cannot confirm a candidate from >= 2 independent\n"
        "sources, do not pick it.\n\n"
        f"{avoid}\n"
        "Pick the kind from: spec-change, release, tool, benchmark, security, research.\n\n"
        "TAGS are how a reader filters the radar by what they actually use, so they must\n"
        "name the concrete things involved, not vague themes. INCLUDE the proper names of\n"
        "every vendor, product, model, protocol, or library the brief is about: e.g.\n"
        "'Claude', 'GPT-5', 'Gemini', 'MCP', 'vLLM', 'LangGraph'. A brief about an\n"
        "Anthropic / Claude development MUST carry the 'Claude' tag. Add 1-2 topical tags\n"
        "(e.g. 'agents', 'evals', 'rag') alongside the proper-name tags. 2-5 tags total.\n"
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
        "2. WRITE a bilingual radar brief. Only TWO H2 sections are REQUIRED, and they\n"
        "   must open and close the body:\n"
        f"   FR: '{_FR_REQUIRED[0]}' first, '{_FR_REQUIRED[1]}' last.\n"
        f"   EN: '{_EN_REQUIRED[0]}' first, '{_EN_REQUIRED[1]}' last.\n"
        "   Everything BETWEEN them is editorial discretion - add what THIS brief needs to\n"
        "   land, nothing boilerplate. Tools to reach for, ONLY when they genuinely help:\n"
        "   - A DIAGRAM, when a flow / round-trip / relationship is the crux (e.g. a request\n"
        "     sequence). Author it as INLINE SVG (the site renders raw SVG; no library, no\n"
        "     client JS). Keep it simple and theme it with the site tokens via inline style\n"
        "     so it adapts to light/dark. Template:\n"
        '       <figure class="rc-diagram"><svg viewBox="0 0 W H" role="img"\n'
        '         aria-label="...">...lines/rects/text using style="stroke: var(--accent)",\n'
        '         style="fill: var(--fg)", font-family via var(--font-mono)...</svg>\n'
        "         <figcaption>one-line caption</figcaption></figure>\n"
        "     Do NOT add a diagram just to have one. Most briefs need none.\n"
        "   - A CODE EXAMPLE, when a real snippet (request, config, CLI) helps an engineer\n"
        "     act: a FENCED CODE BLOCK with real field names from the sources, never invented.\n"
        "   - A real MARKDOWN TABLE for inherently tabular facts (pricing/capability matrix);\n"
        "     never cram a table into a plaintext code fence.\n"
        "   - '> [!IMPORTANT]' callouts for the load-bearing caveat.\n"
        "   Use your own H2 headings for any middle sections (e.g. '## In practice',\n"
        "   '## The round-trip'). 'What changed' = 2-4 sentences, what is new and WHEN (real\n"
        "   date). 'Impact' = who cares + what to do (deadline/risk/migration).\n"
        "   ~250-450 words/language. Same brief in both languages. No emojis, no em-dashes.\n\n"
        "   REFLECT, DO NOT PARAPHRASE. A radar brief is short, but it is not a press\n"
        "   release in your own words. 'What changed' may state the facts plainly; but the\n"
        "   middle and 'Impact' must carry a THOUGHT a reader could not get from the\n"
        "   release notes themselves. Earn the brief by doing at least one of: take a\n"
        "   stance (is this worth adopting, what is overhyped, what would you actually\n"
        "   use); connect it to what came before or to a competing option (how it differs\n"
        "   from the prior version or a rival, what it makes obsolete); surface the\n"
        "   non-obvious (the hidden cost, the migration trap, the failure mode, what the\n"
        "   announcement does NOT say); or give a concrete practitioner call (what to do\n"
        "   now, what to wait on, what to ignore). 'Impact' is never a generic 'teams\n"
        "   should evaluate this' -- it names a specific decision, risk, or deadline. If\n"
        "   the whole brief could be reconstructed from the release notes alone, it is not\n"
        "   yet worth publishing.\n\n"
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
    config: PipelineConfig,
    run_dir: Path,
    *,
    topic_memory_summary: str = "",
    editorial_steer: str = "",
) -> dict[str, str]:
    """Compose per-stage prompt descriptions keyed by radar cpe task id.

    ``editorial_steer`` is an optional one-run nudge for the research stage (e.g. a
    vendor/topic focus passed via the ``RADAR_STEER`` env var); it never overrides the
    "must be genuine and well-sourced" bar.
    """
    return {
        "research": build_radar_research_prompt(
            repo_root=config.repo_root,
            run_dir=run_dir,
            topic_memory_summary=topic_memory_summary,
            editorial_steer=editorial_steer,
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

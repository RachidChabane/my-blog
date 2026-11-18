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


def _radar_paths(run_dir: Path) -> dict[str, Path]:
    draft_dir = run_dir / "plans" / "task-draft"
    return {
        "candidates": run_dir / "plans" / "task-research" / "radar-candidates.json",
        "entry": draft_dir / "entry.json",
        "style_fr": draft_dir / "style-fr.json",
        "style_en": draft_dir / "style-en.json",
    }


def _radar_cmd(repo_root: Path, run_dir: Path, verb: str) -> str:
    return (
        f"PYTHONPATH={repo_root} python3 -m pipeline.radar.stages {verb}"
        f" --run-dir {run_dir} --repo-root {repo_root}"
    )


def build_radar_draft_prompt(*, repo_root: Path, run_dir: Path) -> str:
    # lazy: keep prompts import-light
    from ..stages.humanize import MAX_HUMANIZE_ROUNDS
    from ..voice.judge import build_reader_judge_dispatch

    repo_root, run_dir = Path(repo_root), Path(run_dir)
    p = _radar_paths(run_dir)
    house_style = repo_root / "pipeline" / "house_style.md"
    check = _radar_cmd(repo_root, run_dir, "check")
    judges = "".join(
        f"   READER JUDGE ({lang}):\n"
        + build_reader_judge_dispatch(
            repo_root=repo_root,
            text_desc=(
                f"the title_{lang}, summary_{lang} and body_{lang} fields of {p['entry']} "
                "as a finished short post"
            ),
            out_path=p[f"style_{lang}"],
            lang=lang,
        )
        for lang in ("fr", "en")
    )
    return (
        "STAGE: Radar draft (bilingual FR+EN).\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        f"1. READ the chosen candidate at: {p['candidates']} (use the top-ranked one)\n"
        f"   and the house style at: {house_style}\n\n"
        "2. WRITE a bilingual radar brief: a short post from one engineer to others\n"
        "   about something that shipped, ~250-450 words per language, the same brief in\n"
        "   both. No emojis, no em-dashes.\n"
        "   TITLE: what happened, in one clause a person would say aloud (house_style.md\n"
        "   section 2). One fact. The second fact, the caveat and the number go in the\n"
        "   body.\n"
        "   SUMMARY: one or two sentences saying what shipped and why it matters to\n"
        "   someone who runs this in production. It is not a table of contents of the\n"
        "   body and it does not end on a labelled recommendation.\n"
        "   BODY: say what changed and when (real date) in the first sentences, then\n"
        "   what you make of it and what a team should do about it. The reader must\n"
        "   leave with something the release notes do not say: whether it is worth\n"
        "   adopting, how it differs from the previous version or a rival, the migration\n"
        "   trap, what the announcement leaves out, or what to do now. Name a specific\n"
        "   decision, risk or deadline; 'teams should evaluate this' is not one. If the\n"
        "   whole brief could be rebuilt from the release notes, it is not worth\n"
        "   publishing.\n"
        "   SHAPE: the content decides it. A brief this short often needs no heading;\n"
        "   when one helps, write it for this brief and reuse none from earlier briefs\n"
        "   (the publish stage blocks a heading recent briefs already used). The brief\n"
        "   has no fixed sections. Reach for these only when the content has that shape:\n"
        "   - A CODE EXAMPLE (a FENCED CODE BLOCK) when a real request, config or command\n"
        "     helps an engineer act: real field names from the sources, never invented.\n"
        "   - A MARKDOWN TABLE for facts that are tabular by nature (a pricing or\n"
        "     capability matrix); never a table inside a plaintext code fence.\n"
        "   - A '> [!IMPORTANT]' callout for the one caveat the reader must not miss.\n"
        "   - A DIAGRAM when a flow or round-trip is the crux, as INLINE SVG themed with\n"
        "     the site tokens via inline style so it adapts to light/dark:\n"
        '       <figure class="rc-diagram"><svg viewBox="0 0 W H" role="img"\n'
        '         aria-label="...">...lines/rects/text using style="stroke: var(--accent)",\n'
        '         style="fill: var(--fg)", font-family via var(--font-mono)...</svg>\n'
        "         <figcaption>one-line caption</figcaption></figure>\n"
        "   CITATIONS FOLLOW THE POINT: write your sentence, put the [sN] after the fact\n"
        "   it rests on, and cite a source once per paragraph. Name a source in the\n"
        "   prose only when who said it matters, and once. A judgment of yours needs no\n"
        "   label: a sentence without [sN] is read as yours.\n\n"
        f"3. WRITE the structured entry as JSON to: {p['entry']}\n"
        "   {translationKey, kind, tags:[..], slug_fr, slug_en, title_fr, title_en,\n"
        "    summary_fr, summary_en, body_fr, body_en, sources:[{label,url,date,excerpt}]}\n"
        "   (date is the source's publish date as DD-MM-YYYY; >= 2 sources).\n\n"
        "4. VOICE -- the brief must read as written by a person. First the deterministic\n"
        "   rules (structure, title shape, opinion-marker and attribution counts, a\n"
        "   citation repeated inside a paragraph, a heading recent briefs already used).\n"
        "   Fix entry.json until this prints OK:\n"
        f"     {check}\n"
        "   A rule is met by writing the sentence a person would have written, never by\n"
        "   swapping the counted word for a synonym.\n"
        + judges
        + "   FOR EITHER LANGUAGE, when a verdict is not 'clean': rewrite the flagged\n"
        "   passages in entry.json in the author's voice (each suggested_fix says what to\n"
        "   change; the wording is yours; every fact and citation stays), re-run the\n"
        "   check, then dispatch a NEW reader judge for that language -- up to\n"
        f"   {MAX_HUMANIZE_ROUNDS} rounds. The judge's last verdict stands; never argue a\n"
        "   flag away. The publish stage refuses an entry without two 'clean' verdicts.\n"
    )


def build_radar_publish_prompt(*, repo_root: Path, run_dir: Path) -> str:
    repo_root, run_dir = Path(repo_root), Path(run_dir)
    p = _radar_paths(run_dir)
    cmd = _radar_cmd(repo_root, run_dir, "publish")
    return (
        "STAGE: Radar publish.\n\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n\n"
        f"The draft wrote the structured entry to {p['entry']} and the reader judges\n"
        f"wrote {p['style_fr'].name} and {p['style_en'].name} beside it. Publish it\n"
        "(project + validate BOTH languages + write BOTH or NEITHER into\n"
        "src/content/radar + append the radar topic memory) by shelling out to the\n"
        "deterministic publish stage:\n\n"
        f"  {cmd}\n\n"
        "Fix any reported structural or voice-rule problem in entry.json and re-run\n"
        "until it prints the two published paths. A reader-judge verdict is never\n"
        "edited: a missing or non-clean verdict means the draft stage is not done. No\n"
        "manual step on this path (D-002).\n"
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

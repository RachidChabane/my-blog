"""Editorial prompt builder for the RESEARCH stage (writing-flow.md §3 role 1 / §4).

``build_research_prompt`` returns the instruction string injected as the research
task's ``description`` (via ``assemble_slate(stage_descriptions=...)``, wired by
task 28). The agent runs with ``cwd = run_dir`` inside the repo, so all paths are
ABSOLUTE and shell-outs use ``PYTHONPATH={repo_root} python3 -m ...``
[MEM: pipeline-cpe-harness-contract]. The prompt itself contains no emojis (D-007).
"""
from __future__ import annotations

from pathlib import Path


def build_research_prompt(
    *,
    repo_root: Path,
    run_dir: Path,
    num_candidates: int = 5,
    topic_memory_summary: str = "",
) -> str:
    """Build the research-stage instruction (pure function of its inputs)."""
    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    candidates_path = run_dir / "plans" / "task-research" / "candidates.json"

    if topic_memory_summary.strip():
        avoid = (
            "AVOID re-covering topics already published. Recently covered topics:\n"
            f"{topic_memory_summary.strip()}\n"
        )
    else:
        avoid = "AVOID re-covering already-published topics (none supplied this run).\n"

    return (
        "STAGE: Research (writing-flow.md section 3 role 1 / section 4).\n"
        "\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n"
        "Address repo files via that ABSOLUTE repo_root, never cwd-relative.\n"
        "\n"
        "GOAL: use your native web search to sweep cutting-edge AI engineering\n"
        "(D-006): agentic AI and AI-assisted coding, frontier and open-source (OSS)\n"
        "LLMs, and building with AI. Find the topics with real engineering depth and\n"
        f"rank {num_candidates} candidates best-first (array order IS the rank; there\n"
        "is no separate rank field).\n"
        "\n"
        "Prefer topics that leave ROOM FOR A NON-OBVIOUS TAKE: a tension, a contested\n"
        "trade-off, a gap between the demo and production, a second-order consequence.\n"
        "A development you can only summarize is a worse candidate than one you can\n"
        "argue about. Use why_relevant to name the non-obvious angle the piece could\n"
        "take, not just to assert the topic matters.\n"
        "\n"
        "For EACH candidate capture at least two sources (FR-B3 requires two or more\n"
        "cited sources), and SOURCE INDEPENDENCE IS A HARD BAR, not a nicety: the\n"
        "load-bearing facts must trace to at least TWO GENUINELY INDEPENDENT origins. A\n"
        "second source counts as independent ONLY when it adds its OWN evidence or\n"
        "judgment -- an independent benchmark or measurement, an independent analysis or\n"
        "critique, or corroboration by a DIFFERENT party. It does NOT count when it\n"
        "merely restates the primary: a vendor page repeating a paper's numbers,\n"
        "secondary coverage reciting a study's figures, or two outlets re-running one\n"
        "press release are ALL a single origin. This is load-bearing, not advisory: the\n"
        "argue stage runs a source-independence judge that BLOCKS any chosen topic whose\n"
        "sourcing traces to one origin, and the WHOLE RUN DIES (draft and publish never\n"
        "run) when every candidate is single-origin. So do NOT advance a single-origin\n"
        "story as a news candidate, however fresh; it is simply not coverable by this\n"
        "pipeline. Include a skeptical or contrarian source too where one exists.\n"
        "\n"
        "Topic archetypes that reliably HAVE independent sourcing -- favor these:\n"
        "  - a model or product release: the vendor's own announcement PLUS independent\n"
        "    benchmarks (Artificial Analysis, LMArena, independent evals) or independent\n"
        "    hands-on reviews;\n"
        "  - a research result: the paper PLUS independent commentary, a replication, a\n"
        "    critique, or a second result on the same question from a different group;\n"
        "  - a trend or practice: several independent teams or practitioners reporting\n"
        "    it from their own experience.\n"
        "Archetypes that are usually single-origin (cover ONLY with genuine independent\n"
        "corroboration): a lone paper with only vendor restatements; one vendor's study\n"
        "with only secondary coverage; one company statement with only news echoes.\n"
        "\n"
        "For EACH source, record from the page you read:\n"
        "  - label: a short display name for the citation\n"
        "  - url: the http(s) URL\n"
        "  - excerpt: a verbatim passage you actually read (capture EXCERPTS, not\n"
        "    just links; the fact-check provenance chain rests on captured text,\n"
        "    writing-flow section 4)\n"
        "  - retrieved_at: the retrieval date in ISO-8601 (YYYY-MM-DD)\n"
        "  - source_date: the source's own publish/updated date (ISO), when known\n"
        "    (optional)\n"
        "\n"
        "Set a canonical dedup_key per candidate: ONE key per TOPIC (not per\n"
        "language), lowercase, diacritics folded to ASCII, a single canonical\n"
        "English/ASCII technical phrasing or slug (M-11). Semantic dedup compares\n"
        "candidates against prior topics using this dedup_key.\n"
        "\n"
        f"{avoid}"
        "\n"
        "NO-USABLE-NEWS FALLBACK -- the LESSON path. After the sweep, make an explicit\n"
        "call: is at least one candidate BOTH genuinely worth covering today (recent,\n"
        "material to practitioners, real engineering depth -- not a rehash, a minor\n"
        "version bump, or marketing) AND independently sourced to the HARD BAR above? A\n"
        "great single-origin story does NOT count -- it cannot clear the argue gate, so\n"
        "for this pipeline it is a no-usable-news day. If NO candidate clears BOTH bars,\n"
        "the run writes a LESSON instead of a news piece (a lesson reliably has\n"
        "independent authoritative sources, and a published lesson beats a blocked run):\n"
        "  - Get the next lesson topic DETERMINISTICALLY (never pick one ad hoc;\n"
        "    the backlog balances an expert agentic track against a beginner\n"
        "    ml-fundamentals progression):\n"
        f"      PYTHONPATH={repo_root} python3 -m pipeline.stages.lesson next-topic\n"
        "  - Research THAT subject the same way you would a news topic: primary\n"
        "    documentation, papers, and authoritative tutorials, with captured\n"
        "    verbatim excerpts and two or more INDEPENDENT authoritative sources (the\n"
        "    same independence bar -- distinct origins, e.g. the official docs PLUS a\n"
        "    paper PLUS an independent tutorial, never one source restated).\n"
        "  - Emit it as the SINGLE candidate, copying the CLI's recommendation\n"
        "    verbatim into the envelope fields: topic_id = the CLI's topic_id (the\n"
        "    'lesson-' prefix is the downstream mode switch), dedup_key = the CLI's\n"
        "    dedup_key, title from its title, summary from its focus, why_relevant\n"
        "    from its why. Tags still apply (e.g. agents, evaluation, rag).\n"
        "  Do NOT mix modes: either a ranked news list (normal day) or exactly one\n"
        "  lesson candidate (no-news day).\n"
        "\n"
        "PRIVACY / SECRET HYGIENE (FR-D3): never include secrets, private-repo\n"
        "internals, internal codenames, or third-party personal data in any field.\n"
        "\n"
        "Use no emojis anywhere (D-007); professional prose only.\n"
        "\n"
        f"Write EXACTLY this JSON envelope to: {candidates_path}\n"
        "{\n"
        '  "schema_version": 1,\n'
        '  "candidates": [\n'
        "    {\n"
        '      "topic_id": "<stable slug, unique in the doc>",\n'
        '      "dedup_key": "<canonical topic phrasing, see above>",\n'
        '      "title": "<working title>",\n'
        '      "summary": "<1-2 sentences>",\n'
        '      "why_relevant": "<engineering-depth rationale, D-006>",\n'
        '      "tags": ["<at least one tag>"],\n'
        '      "sources": [\n'
        '        {"source_id": "s1", "label": "...", "url": "https://...",\n'
        '         "retrieved_at": "YYYY-MM-DD", "excerpt": "...",\n'
        '         "source_date": "YYYY-MM-DD"}\n'
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "\n"
        "SELF-CHECK before finishing: run\n"
        f"  PYTHONPATH={repo_root} python3 -m pipeline.stages.research --validate"
        f" {candidates_path}\n"
        "and fix the file until it prints OK.\n"
    )


__all__ = ["build_research_prompt"]

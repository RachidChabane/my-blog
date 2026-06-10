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
        "For EACH candidate capture at least two sources (two or more; FR-B3 requires\n"
        "two or more cited sources). Aim for INDEPENDENT sourcing from the start: a\n"
        "PRIMARY or origin source (the paper, the release, the commit), an INDEPENDENT\n"
        "corroboration from a different origin (NOT a re-run of the same wire story or\n"
        "press release), and a skeptical or contrarian source where one exists. Two URLs\n"
        "that echo a single press release are NOT two independent sources. For EACH\n"
        "source, record from the page you read:\n"
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

"""Editorial prompt builder for the SELECT stage (writing-flow.md §3 role 2 / §8).

``build_select_prompt`` returns the instruction injected as the select task's
``description``. The agent reads candidates.json, runs the ``dedup`` CLI for a
recommended topic, and writes ``brief.md`` (pinned frontmatter + sections). All
paths are ABSOLUTE; shell-outs use ``PYTHONPATH={repo_root} python3 -m ...``
[MEM: pipeline-cpe-harness-contract]. No emojis (D-007).
"""
from __future__ import annotations

from pathlib import Path


def build_select_prompt(
    *,
    repo_root: Path,
    run_dir: Path,
    threshold: float | None = None,
) -> str:
    """Build the select-stage instruction (pure function of its inputs)."""
    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    candidates_path = run_dir / "plans" / "task-research" / "candidates.json"
    brief_path = run_dir / "plans" / "task-select" / "brief.md"
    topic_memory = repo_root / "pipeline" / "memory" / "topic_memory.json"

    # --memory: query the persistent evergreen topic memory (FR-G1; the committed `[]`
    # store guarantees the path exists in a live run). No --embedder: the live stage uses
    # the configured/default embedder -- task 28 sets PIPELINE_EMBEDDER=real, which fails
    # loud with no key (the intended flip off the fake, never silent-fake)
    # [MEM: select-dedup-fake-embedder-default]. --threshold only when the caller overrides.
    dedup_cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.stages.select dedup"
        f" --run-dir {run_dir} --memory {topic_memory}"
    )
    if threshold is not None:
        dedup_cmd += f" --threshold {threshold}"
    validate_cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.stages.select validate-brief"
        f" {brief_path}"
    )

    return (
        "STAGE: Select (writing-flow.md section 3 role 2 / section 8).\n"
        "\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n"
        "Use that ABSOLUTE repo_root for repo files; never cwd-relative.\n"
        "\n"
        f"1. READ the research candidates at: {candidates_path}\n"
        "\n"
        "2. RUN the semantic-dedup tool. It embeds each candidate's dedup_key,\n"
        "   compares against topic memory, and recommends the least-similar topic\n"
        "   (protecting cadence, OQ-14a):\n"
        f"     {dedup_cmd}\n"
        "   It prints the recommended chosen_topic_id and fallback_topic_ids and\n"
        "   writes plans/task-select/dedup.json. USE the recommended chosen_topic_id\n"
        "   unless there is a strong editorial reason to pick another candidate.\n"
        "   LESSON DAY: a single candidate whose topic_id starts with 'lesson-' means\n"
        "   the research stage found no news worth covering and pulled the next entry\n"
        "   from the balanced lesson backlog. CHOOSE IT (no editorial override; the\n"
        "   backlog manages track balance), and write the angle as the lesson's\n"
        "   central explanatory claim: the one framing of the subject most\n"
        "   introductions get wrong or miss, which this lesson teaches correctly.\n"
        "\n"
        "   THE ANGLE IS WHERE THIS RUN EARNS THE READER'S TIME. An angle is NOT a\n"
        "   summary of the topic; it is the one contestable, non-obvious thing this\n"
        "   piece will argue that a knowledgeable reader does not already hold. A strong\n"
        "   angle does at least two of: takes a stance someone could disagree with\n"
        "   (which default is wrong and what to do instead); connects the topic to a\n"
        "   prior result, an opposing trend, or the reader's real stack (synthesis\n"
        "   across the sources, not a recap of one); surfaces a second-order\n"
        "   consequence, hidden cost, or failure mode the sources do not spell out; or\n"
        "   names the concrete decision or risk it changes for a practitioner. Reject an\n"
        "   angle that only restates what the sources report: that is paraphrase, and\n"
        "   the editorial-quality gate fails it as obvious or thin. The insight usually\n"
        "   lives in the GAP between two sources, not inside any single one.\n"
        "\n"
        f"3. WRITE the brief to: {brief_path}\n"
        "   It MUST begin with a YAML frontmatter fence with these keys:\n"
        "     chosen_topic_id: <the chosen candidate's topic_id>\n"
        "     fallback_topic_ids: <list of the fallback shortlist topic_ids>\n"
        "     angle: <the editorial angle>\n"
        "     claim_skeleton:\n"
        "       - id: c1\n"
        "         statement: <a load-bearing claim>\n"
        "         source_ids: [<source_id from candidates.json>, ...]\n"
        "   Then the body with EXACTLY these section headers:\n"
        "     ## Angle\n"
        "     ## Outline\n"
        "     ## Claim skeleton\n"
        "     ## Fallback shortlist\n"
        "   The claim skeleton must cite the BACKING source_ids from candidates.json,\n"
        "   which pre-stages the draft's claim->source map. The fallback shortlist\n"
        "   is the fallback_topic_ids the dedup tool reported (protect cadence,\n"
        "   OQ-14a).\n"
        "\n"
        "Use no emojis anywhere (D-007).\n"
        "\n"
        "VALIDATE before finishing:\n"
        f"  {validate_cmd}\n"
        "and fix the brief until it prints OK.\n"
    )


__all__ = ["build_select_prompt"]

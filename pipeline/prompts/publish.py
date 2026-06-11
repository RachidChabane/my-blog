"""Editorial prompt builder for the PUBLISH stage (writing-flow.md section 6, FR-B5/FR-G*).

``build_publish_prompt`` returns the instruction injected as the publish task's
``description``. The agent reads the approved + gated FR/EN drafts + the claim->source map,
then shells out to the deterministic publish helper (it does the projection +
bilingual-or-nothing write + topic-memory append + manifest). All paths are ABSOLUTE;
shell-outs use ``PYTHONPATH={repo_root} python3 -m ...``
[MEM: pipeline-cpe-harness-contract]. ASCII-only (no emoji, D-007).
"""
from __future__ import annotations

from pathlib import Path


def build_publish_prompt(*, repo_root: Path, run_dir: Path) -> str:
    """Build the publish-stage instruction (pure function of its inputs)."""
    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    draft_dir = run_dir / "plans" / "task-draft"
    draft_fr = draft_dir / "draft-fr.md"
    draft_en = draft_dir / "draft-en.md"
    csm = draft_dir / "claim_source_map.json"

    publish_cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.stages.publish publish"
        f" --run-dir {run_dir} --repo-root {repo_root}"
    )
    validate_cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.stages.publish validate"
        f" --run-dir {run_dir}"
    )
    concepts_base = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.stages.concepts"
    )
    concepts_validate_cmd = f"{concepts_base} validate --repo-root {repo_root}"

    return (
        "STAGE: Publish (writing-flow.md section 6; FR-B5, FR-G1/G2).\n"
        "\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n"
        "Use that ABSOLUTE repo_root for repo files; never cwd-relative.\n"
        "\n"
        "1. READ the approved + gated inputs (all six M-4 gates already passed):\n"
        f"   - the FR draft: {draft_fr}\n"
        f"   - the EN draft: {draft_en}\n"
        f"   - the claim->source map: {csm}\n"
        "\n"
        "2. PUBLISH via the helper. It projects each draft into a full published-article\n"
        "   file (adds publishDate, the sources[] table, contentHash, publishState), then\n"
        "   writes BOTH languages or NEITHER (bilingual-or-nothing, NFR-11), appends the\n"
        "   evergreen topic memory, and emits the run-local manifest:\n"
        f"     {publish_cmd}\n"
        "   The published targets are localized:\n"
        "     src/content/articles/<fr-slug>.fr.md\n"
        "     src/content/articles/<en-slug>.en.md\n"
        "   (under the ABSOLUTE repo_root via --repo-root). If it prints problems, fix the\n"
        "   drafts / map and re-run; it writes nothing on any problem.\n"
        "\n"
        "3. CONCEPT EXTRACTION (the knowledge-graph daily reindex). The graph page\n"
        "   renders from the canonical concept store; fold the day's article in NOW so\n"
        "   the next deploy carries it:\n"
        "   - SEE what already exists (REUSE aggressively; an alias counts as the same\n"
        "     concept; never create a near-duplicate):\n"
        f"       {concepts_base} list --repo-root {repo_root}\n"
        "   - IDENTIFY the 3-8 AI concepts the published article genuinely teaches or\n"
        "     leans on (named techniques, mechanisms, architectures, practices -- not\n"
        "     every noun; a reader should learn about that concept by reading this\n"
        "     article).\n"
        "   - For each concept ALREADY in the store, cite the article on it (idempotent;\n"
        "     <translationKey> is the published article's translationKey):\n"
        f"       {concepts_base} link --repo-root {repo_root} --id <concept-id>"
        " --article <translationKey>\n"
        "   - For each GENUINELY NEW concept, write a JSON record and add it:\n"
        '       {"id": "<kebab-slug>", "label": {"fr": "...", "en": "..."},\n'
        '        "definition": {"fr": "...", "en": "..."}, "theme": "<one of:\n'
        "        agentic-ai | ml-fundamentals | infra-tooling | evals-quality>\",\n"
        '        "aliases": [...], "related": ["<existing concept ids>"],\n'
        '        "articles": ["<translationKey>"]}\n'
        "     Definitions: 1-2 sentences per language, self-contained, factual, written\n"
        "     for a practitioner; FR is idiomatic French (accents mandatory), not a\n"
        "     calque; NO em-dashes, NO emoji. The definition is CANONICAL and WRITE-ONCE:\n"
        "     the store refuses to overwrite it on later runs, so write it to stand for\n"
        "     years. Save the record to plans/task-publish/concept-<id>.json, then:\n"
        f"       {concepts_base} add --repo-root {repo_root}"
        " --file plans/task-publish/concept-<id>.json\n"
        "   - VALIDATE the store before finishing:\n"
        f"       {concepts_validate_cmd}\n"
        "\n"
        "4. The publish task's commit (git add -A && git commit, run by the harness) RECORDS\n"
        "   the durable FR + EN publish on main -- no manual step on this path (D-002). You\n"
        "   do NOT run pnpm, wrangler, or git push yourself. The site build (CF Pages) and\n"
        "   the avatar reindex fire only when that commit is later PUSHED to the remote (the\n"
        "   scheduled runner / task 28), NOT from this local commit.\n"
        "\n"
        "5. PRIVACY / SECRET HYGIENE (FR-D3): no secrets, private-repo internals, internal\n"
        "   codenames, or third-party personal data reaches a public article file.\n"
        "   Use no emojis anywhere (D-007).\n"
        "\n"
        "VALIDATE before finishing (dry-run self-gate; writes nothing):\n"
        f"  {validate_cmd}\n"
        "and fix until it prints OK.\n"
    )


__all__ = ["build_publish_prompt"]

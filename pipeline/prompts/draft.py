"""Editorial prompt builders for the DRAFT stage (writing-flow.md section 3 roles 3/4/4b).

The single ``draft`` cpe task folds Writing (role 3), the editorial Review self-gate
(role 4), and Humanizing (role 4b) into one implement-phase instruction. ``build_draft_prompt``
returns that instruction; ``build_revise_prompt`` is the SEPARATE revise step the humanize
loop dispatches (auditor != editor, writing-flow section 5).

Both are pure functions of their inputs; ASCII-only (no emoji, D-007); all paths are
ABSOLUTE and shell-outs use ``PYTHONPATH={repo_root} python3 -m ...``
[MEM: pipeline-cpe-harness-contract]. The humanize round cap lives in
``pipeline.stages.humanize.MAX_HUMANIZE_ROUNDS``; it is imported LAZILY inside
``build_draft_prompt`` (default ``max_humanize_rounds=None``) so importing this module —
and therefore ``pipeline`` — does not pull ``pipeline.stages.humanize`` into
``sys.modules`` before ``python3 -m pipeline.stages.humanize`` executes (which would emit
the runpy double-import RuntimeWarning the import-light ``stages`` package avoids). Mirrors
the lazy ``select._make_embedder`` idiom.
"""
from __future__ import annotations

from pathlib import Path


def _draft_paths(run_dir: Path) -> dict[str, Path]:
    draft_dir = run_dir / "plans" / "task-draft"
    return {
        "brief": run_dir / "plans" / "task-select" / "brief.md",
        "draft_fr": draft_dir / "draft-fr.md",
        "draft_en": draft_dir / "draft-en.md",
        "csm": draft_dir / "claim_source_map.json",
        "style_fr": draft_dir / "style-fr.json",
        "style_en": draft_dir / "style-en.json",
    }


def _cmd(repo_root: Path, tail: str) -> str:
    """A ``PYTHONPATH={repo_root} python3 -m ...`` shell-out line."""
    return f"PYTHONPATH={repo_root} python3 -m {tail}"


def _draft_section(repo_root: Path, run_dir: Path) -> str:
    p = _draft_paths(run_dir)
    house_style = repo_root / "pipeline" / "house_style.md"
    return (
        f"1. READ your inputs:\n"
        f"   - the brief: {p['brief']}\n"
        f"     (topic, angle, outline, and the claim skeleton with its source_ids)\n"
        f"   - the house style: {house_style}\n"
        f"     (voice, the no emoji rule, AI-tell avoidance, citation + parity rules)\n"
        "\n"
        "2. DRAFT both languages as parallel outputs of one topic+sources -- this is\n"
        "   not a raw machine translation; each is idiomatic in its own language.\n"
        f"   Write:\n"
        f"     {p['draft_fr']}\n"
        f"     {p['draft_en']}\n"
        "   Each MUST begin with a YAML frontmatter fence with the author-time keys:\n"
        "     lang: fr            # 'fr' for draft-fr.md, 'en' for draft-en.md\n"
        "     translationKey: <IDENTICAL for both languages -- the bilingual join, NFR-11>\n"
        "     slug: <localized slug>\n"
        "     title: <localized title>\n"
        "     tags: [<at least one tag>]\n"
        "   Then the body: a lead paragraph (the dek is derived from it -- there is no\n"
        "   dek field), section headers following the outline, and INLINE citations to\n"
        "   source_ids (citations precede prose).\n"
        "\n"
        f"3. PRODUCE the claim->source map (task-24 contract): {p['csm']}\n"
        "   Add a claim {lang, claim, source_id, excerpt_span?} for EVERY load-bearing\n"
        "   claim in EACH language, covering EVERY skeleton source_id in BOTH languages;\n"
        "   sources[] carries the captured excerpts from the brief/candidates. Reuse the\n"
        "   same source_id values the brief's claim skeleton uses; do not mint new ids --\n"
        "   otherwise review check computes every skeleton id as uncovered and the loop\n"
        "   thrashes.\n"
    )


def _review_section(repo_root: Path, run_dir: Path) -> str:
    draft_validate = _cmd(
        repo_root, f"pipeline.stages.draft validate --run-dir {run_dir}"
    )
    review_check = _cmd(repo_root, f"pipeline.stages.review check --run-dir {run_dir}")
    return (
        "4. REVIEW self-gate (role 4) -- run BOTH and fix until both pass:\n"
        f"     {draft_validate}\n"
        f"     {review_check}\n"
        "   review check MUST print '## Verdict: APPROVED' (not\n"
        "   '## Verdict: NEEDS_REVISION'). It enforces that the claim->source map is\n"
        "   COMPLETE: every skeleton source_id is covered in both fr and en, and fr/en\n"
        "   cover the SAME set (NFR-11 parity).\n"
    )


def _humanize_section(
    repo_root: Path, run_dir: Path, *, max_humanize_rounds: int, style_auditor: str
) -> str:
    p = _draft_paths(run_dir)
    house_style = repo_root / "pipeline" / "house_style.md"
    scan_fr = _cmd(repo_root, f"pipeline.stages.humanize scan {p['draft_fr']}")
    scan_en = _cmd(repo_root, f"pipeline.stages.humanize scan {p['draft_en']}")
    verdict_fr = _cmd(repo_root, f"pipeline.stages.humanize verdict {p['style_fr']}")
    verdict_en = _cmd(repo_root, f"pipeline.stages.humanize verdict {p['style_en']}")
    return (
        "5. HUMANIZE each language draft (role 4b) -- auditor != editor; keeping the\n"
        "   judge and the editor as separate agents is what gives the gate teeth:\n"
        f"   - Invoke the global {style_auditor} sub-agent as AUDITOR ONLY: it flags\n"
        "     AI-tells and off-voice prose and suggests fixes; it does not rewrite.\n"
        "     Hand it a context label and point it at the house style so it does not\n"
        "     stall asking for context:\n"
        '       context: "personal practitioner AI-engineering blog post; no emoji;\n'
        '       voice per pipeline/house_style.md"\n'
        f"       (also point it at {house_style})\n"
        f"     Save its JSON output to:\n"
        f"       {p['style_fr']}\n"
        f"       {p['style_en']}\n"
        "   - If a draft's verdict is not 'clean': run a separate revise step (it applies\n"
        "     only the suggested_fix edits, preserving meaning + citations), then\n"
        f"     re-invoke {style_auditor} to re-check -- up to {max_humanize_rounds} rounds\n"
        "     (OQ-14b); do not let the same agent both rewrite and judge.\n"
        "   - Then BOTH the no emoji hard gate and the clean confirmation must pass per\n"
        "     language:\n"
        f"       {scan_fr}\n"
        f"       {scan_en}\n"
        f"       {verdict_fr}\n"
        f"       {verdict_en}\n"
    )


def build_draft_prompt(
    *,
    repo_root: Path,
    run_dir: Path,
    max_humanize_rounds: int | None = None,
    style_auditor: str = "style-auditor",
) -> str:
    """Build the single draft+review+humanize instruction (pure function of its inputs).

    ``max_humanize_rounds`` defaults to ``humanize.MAX_HUMANIZE_ROUNDS`` (imported lazily;
    see the module docstring for why).
    """
    if max_humanize_rounds is None:
        from ..stages.humanize import MAX_HUMANIZE_ROUNDS

        max_humanize_rounds = MAX_HUMANIZE_ROUNDS
    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    return (
        "STAGE: Draft+Review+Humanize (writing-flow.md section 3 roles 3/4/4b, section 5).\n"
        "\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n"
        "Use that ABSOLUTE repo_root for repo files; never cwd-relative.\n"
        "\n"
        + _draft_section(repo_root, run_dir)
        + "\n"
        + _review_section(repo_root, run_dir)
        + "\n"
        + _humanize_section(
            repo_root,
            run_dir,
            max_humanize_rounds=max_humanize_rounds,
            style_auditor=style_auditor,
        )
        + "\n"
        "6. Use no emojis anywhere (D-007). PRIVACY / SECRET HYGIENE (FR-D3): no secrets,\n"
        "   private-repo internals, internal codenames, or third-party personal data in\n"
        "   either draft or in any field.\n"
    )


def build_revise_prompt(*, repo_root: Path, run_dir: Path, lang: str) -> str:
    """Build the SEPARATE revise-step instruction for one language (auditor != editor)."""
    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    draft_path = run_dir / "plans" / "task-draft" / f"draft-{lang}.md"
    style_path = run_dir / "plans" / "task-draft" / f"style-{lang}.json"
    return (
        f"STAGE: Revise ({lang}) -- apply the style-auditor's suggested fixes only.\n"
        "\n"
        f"You run INSIDE the repo at repo_root: {repo_root}\n"
        "\n"
        f"1. READ the draft: {draft_path}\n"
        f"2. READ the style findings: {style_path}\n"
        "3. APPLY ONLY the suggested_fix edits from each issue, minimally -- preserve\n"
        "   meaning and every citation. Prefer deleting AI-tell filler over rewriting.\n"
        f"4. WRITE the revised draft back to: {draft_path}\n"
        "\n"
        "Constraint: do not re-audit the draft yourself -- the style-auditor re-checks\n"
        "separately (auditor != editor is what gives the gate teeth). Use no emojis\n"
        "anywhere (D-007).\n"
    )


__all__ = ["build_draft_prompt", "build_revise_prompt"]

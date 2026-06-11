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
        "argument": run_dir / "plans" / "task-argue" / "argument.json",
        "draft_fr": draft_dir / "draft-fr.md",
        "draft_en": draft_dir / "draft-en.md",
        "csm": draft_dir / "claim_source_map.json",
        "style_fr": draft_dir / "style-fr.json",
        "style_en": draft_dir / "style-en.json",
        "factcheck_fr": draft_dir / "factcheck-fr.json",
        "factcheck_en": draft_dir / "factcheck-en.json",
        "editorial": draft_dir / "editorial.json",
        "source_quality": draft_dir / "source_quality.json",   # task 5: G2 findings
    }


def _cmd(repo_root: Path, tail: str) -> str:
    """A ``PYTHONPATH={repo_root} python3 -m ...`` shell-out line."""
    return f"PYTHONPATH={repo_root} python3 -m {tail}"


def _draft_section(repo_root: Path, run_dir: Path) -> str:
    p = _draft_paths(run_dir)
    house_style = repo_root / "pipeline" / "house_style.md"
    rubric = repo_root / "pipeline" / "difficulty_rubric.md"
    return (
        f"1. READ your inputs:\n"
        f"   - the brief: {p['brief']}\n"
        f"     (topic, angle, outline, and the claim skeleton with its source_ids)\n"
        f"   - the surviving argument: {p['argument']}\n"
        "     (the argument-rigor judge's reconciliation and strengthened_argument -- the thesis\n"
        "     that survived steelman/attack/reconcile). Let the strengthened_argument SHAPE the\n"
        "     draft's one load-bearing claim; do not re-derive a weaker version of it.\n"
        f"   - the house style: {house_style}\n"
        f"     (voice, the no emoji rule, AI-tell avoidance, citation + parity rules)\n"
        f"   - the difficulty rubric: {rubric}\n"
        "     (the SINGLE fixed 1-5 scale every article is rated against -- a level must\n"
        "     mean the same degree of difficulty across the whole blog; rate against the\n"
        "     rubric's anchors, never by ad-hoc judgment)\n"
        "\n"
        "2. DRAFT both languages as parallel outputs of one topic+sources -- this is\n"
        "   not a raw machine translation; each is idiomatic in its own language.\n"
        "   Write French as a French engineer writes: restructure for French syntax, use\n"
        "   native technical register and connectors, and never transliterate the English\n"
        "   clause order or calque idioms (no 'un defaut robuste' for 'a robust default').\n"
        "   FR and EN share the argument, the numbers, and the source_ids -- not the\n"
        "   sentence shapes (house_style.md section 6).\n"
        "   In French, every accent is mandatory and load-bearing: write the correct\n"
        "   accents on EVERY word -- in the title and the section headings as well as\n"
        "   the body. 'modele', 'fenetre', 'probleme', 'decouper' are misspellings; the\n"
        "   slug is the ONLY field that is deliberately ASCII. A dropped accent fails\n"
        "   the deterministic style gate.\n"
        f"   Write:\n"
        f"     {p['draft_fr']}\n"
        f"     {p['draft_en']}\n"
        "   Each MUST begin with a YAML frontmatter fence with the author-time keys:\n"
        "     lang: fr            # 'fr' for draft-fr.md, 'en' for draft-en.md\n"
        "     translationKey: <IDENTICAL for both languages -- the bilingual join, NFR-11>\n"
        "     slug: <localized slug>\n"
        "     title: <localized title>\n"
        "     tags: [<at least one tag>]\n"
        "     category: <one of: essays | explainers | briefings | lessons>\n"
        "       # essays = an argued/opinion take (your position, defended);\n"
        "       # explainers = a technical how-it-works deep dive (mechanisms, trade-offs,\n"
        "       #   measured results); briefings = a timely short field note on what changed;\n"
        "       # lessons = RESERVED for lesson-mode runs (see LESSON MODE below): use it\n"
        "       #   if and only if the brief's chosen_topic_id starts with 'lesson-'.\n"
        "       # Choose the SINGLE best-fitting category; it is identical for fr and en.\n"
        "     difficulty: <integer 1-5>\n"
        "       # Rate the FINISHED article against the difficulty rubric read in step 1\n"
        "       # (pipeline/difficulty_rubric.md): prerequisite knowledge, conceptual\n"
        "       # density, math/code depth. Rate the article AS WRITTEN, not the topic's\n"
        "       # reputation; when torn between two levels choose the HIGHER. IDENTICAL\n"
        "       # for fr and en (one rating per article; the gate enforces parity).\n"
        "   Then the body. The lead paragraph MUST open on the problem, the stakes, or\n"
        "   your take -- NOT a definition of the subject; put the thesis in its first\n"
        "   sentence (the reading-surface derives the dek from this first block and\n"
        "   truncates near 180 chars, so the point lands early and the block stands\n"
        "   alone). Make ONE load-bearing argument the reader could disagree with\n"
        "   (typically what most teams get wrong about the topic) and anchor it in at\n"
        "   least one concrete number, command, or named failure mode. Every NUMBER is a\n"
        "   load-bearing claim: cite it [sN] from a captured source -- never an unsourced\n"
        "   figure, not even from your own work (house_style.md sections 1 and 4). Then\n"
        "   section headers following the outline, and INLINE citations to source_ids\n"
        "   (citations precede prose). Vary sentence length; no textbook 'X is/does Y'\n"
        "   openers.\n"
        "   LENGTH + DEPTH (category-aware; length must be EARNED by substance, never\n"
        "   padding): an essay or explainer is substantial -- typically 1200-1800 words\n"
        "   across several sections that develop the argument with real depth; a briefing\n"
        "   is tighter -- typically 500-800 words. Whatever the length, the piece MUST\n"
        "   carry: a genuinely contestable thesis; at least one steelmanned\n"
        "   counter-position you then ANSWER (state the strongest case against your take,\n"
        "   fairly, before refuting it); concrete mechanisms, commands, and at least one\n"
        "   named failure mode; and every load-bearing number cited [sN]. Multiple\n"
        "   substantive sections, not one block padded to a count.\n"
        "\n"
        "   LESSON MODE -- applies if and only if the brief's chosen_topic_id starts\n"
        "   with 'lesson-' (a no-news day; the research stage pulled the next entry\n"
        "   from the balanced lesson backlog). A Lesson TEACHES one specific subject;\n"
        "   it must not read as a news summary. Overrides for this mode:\n"
        "     - category: lessons (both languages).\n"
        "     - The lead paragraph states what the reader will UNDERSTAND or be able\n"
        "       to DO by the end (the brief's angle is the lesson's central\n"
        "       explanatory claim -- the framing most introductions get wrong; that\n"
        "       claim is your contestable thesis, so the rigor gates still bite).\n"
        "     - Build concepts IN ORDER: each section assumes only what earlier\n"
        "       sections established. Track calibration: an ml-fundamentals lesson\n"
        "       assumes little background and adds rigor gradually (difficulty\n"
        "       typically 1-2); an agentic lesson is for a fluent practitioner and\n"
        "       goes deep (difficulty typically 3-5). Rate against the rubric as\n"
        "       always.\n"
        "     - At least one DIAGRAM: a fenced code block (``` ... ```) drawing the\n"
        "       core mechanism as a labelled ASCII schema (boxes/arrows), with a\n"
        "       one-line caption in prose right below the fence. Two diagrams when\n"
        "       the subject has both a structure and a flow. Same diagrams in both\n"
        "       languages (labels translated).\n"
        "     - End with a quiz section header ('## Quiz' / '## Quiz' in fr too):\n"
        "       3-5 questions that test UNDERSTANDING (not recall of phrasings).\n"
        "       Wrap each answer so readers can self-test before revealing:\n"
        "         <details><summary>(the question)</summary>(the answer, with the\n"
        "         reasoning in one or two sentences)</details>\n"
        "       Questions are plain text in the summary; no markdown inside the\n"
        "       HTML block beyond inline code.\n"
        "     - Worked examples beat abstractions: trace at least one concrete\n"
        "       example with real numbers or a real command sequence.\n"
        "     - Citations still apply: every load-bearing claim/number cites [sN]\n"
        "       from the captured sources (docs, papers, tutorials).\n"
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
        '       no em-dashes (U+2014, the long dash, banned outright).\n'
        '       voice per pipeline/house_style.md. Flag specifically: any em-dash; flat\n'
        '       definitional or textbook leads (X is/does Y openers, field-describing\n'
        '       intros); a\n'
        '       missing opinionated stance (neutral explainer prose with no take); the\n'
        '       absence of a concrete number, command, or named failure mode in the\n'
        '       argument; and, for the FR draft, French that reads like a translation of\n'
        '       English (calqued clause order, literal idioms like un defaut robuste)."\n'
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


def _factcheck_section(repo_root: Path, run_dir: Path) -> str:
    """The fact-check PRODUCER step (FR-C1, plan section 3.9 / D2).

    Live-only boundary: the genuine judge != author independence is a fresh sub-agent on
    the subscription pool, exercisable only in a real run. The shipped OFFLINE gate's
    teeth are structural provenance + the findings PARSER (pipeline/gate/factcheck.py); a
    ``factcheck-{lang}.json`` fixture stands in for a sub-agent run in CI, as
    ``style_findings.*`` stands in for the ``style-auditor``. [MEM: m4-gate-contract]
    """
    p = _draft_paths(run_dir)
    factcheck_fr = _cmd(repo_root, f"pipeline.gate.factcheck --run-dir {run_dir} --lang fr")
    factcheck_en = _cmd(repo_root, f"pipeline.gate.factcheck --run-dir {run_dir} --lang en")
    return (
        "6. FACT-CHECK every load-bearing claim (role 4 / FR-C1) -- judge != author, the\n"
        "   same separation the humanize step gets from the auditor. Do NOT grade your own\n"
        "   claims: a self-graded check would rubber-stamp every claim and the gate would\n"
        "   verify nothing.\n"
        "   - Dispatch a separate sub-agent (a fresh general-purpose Task with clean\n"
        "     context): it does not see the draft prose, the brief, or the fact that you\n"
        "     authored the claims. Hand it ONLY, per language, the list of\n"
        "     {claim, source_id} from the claim->source map paired with each mapped\n"
        "     sources[].excerpt (and the excerpt_span when present).\n"
        "   - For EACH claim the sub-agent judges -- semantically, across languages --\n"
        "     whether the EXCERPT supports the CLAIM, and assigns supported: true|false\n"
        "     plus a one-line reason. (This multilingual entailment is the judgment the\n"
        "     deterministic gate cannot make: a fr claim may be backed by an English\n"
        "     excerpt, so a token match would wrongly fail it.)\n"
        "   - The sub-agent WRITES these files (you do NOT write them yourself, and you do\n"
        "     NOT override its verdict):\n"
        f"       {p['factcheck_fr']}\n"
        f"       {p['factcheck_en']}\n"
        '     each shaped {"verdict": "supported"|"unsupported", "claims": [{"claim",\n'
        '     "source_id", "supported": <bool>, "reason"}]}, where verdict is\n'
        '     "unsupported" if and only if ANY claim is supported: false.\n'
        "   - Then the blocking M-4 fact-check gate parses it and BLOCKS on any\n"
        "     supported: false (and on a missing findings file -- the pass must have run):\n"
        f"       {factcheck_fr}\n"
        f"       {factcheck_en}\n"
        "     A claim whose excerpt does not support it must be RE-SOURCED or CUT; do not\n"
        "     fabricate support.\n"
        "   - CITATION CONVENTION (producer and consumer must agree): source_ids are 's'\n"
        "     plus digits (e.g. s1), cited inline in the body as [s1]. The grounding gate\n"
        "     keys its dangling-citation check on exactly that [sN] shape.\n"
    )


def _editorial_section(repo_root: Path, run_dir: Path) -> str:
    """The G3 editorial-quality PRODUCER step (writing-rigor task 4; closes G3).

    POST-DRAFT (unlike G1 argue): piece-craft needs the realized piece. SINGLE gate on the
    EN draft as the CANONICAL REALIZATION of the shared argument; fr/en STRUCTURAL parity
    rests on the review self-gate's source_id set-equality + the parallel-output house
    rule, NOT on this gate (live-only caveat; avoids fr/en inflation).

    MANDATE BOUNDARY (G3 != G1): judges the FINISHED ARTICLE AS AN ARTICLE; argument-rigor
    judged the THESIS AS A CLAIM. build_judge_dispatch is imported LAZILY (keep this module
    import-light) -- mirrors argue.build_argue_prompt + the lazy humanize import.
    """
    from ..gate.judge import build_judge_dispatch  # lazy: keep prompts import-light

    p = _draft_paths(run_dir)
    editorial_gate = _cmd(repo_root, f"pipeline.gate.editorial --run-dir {run_dir}")
    dispatch = build_judge_dispatch(
        role="editorial judge",
        inputs_desc=(
            "the brief's angle and outline, and the EN draft body as the finished article "
            "(the canonical realization of the shared argument)"
        ),
        out_path=p["editorial"],
        excludes=(
            "the FR draft, the claim->source map, or the fact that you authored this"
        ),
        verdict_schema=(
            '{"verdict": "publishable"|"thin", "issues": [{"dimension": '
            '"non_obviousness"|"angle"|"structure", "note": "..."}], "reason": "..."}'
        ),
    )
    return (
        "7. EDITORIAL-QUALITY judgment (G3 -- writing-rigor) -- judge != author, the same\n"
        "   separation the fact-check and humanize steps get. This judges the FINISHED\n"
        "   ARTICLE AS AN ARTICLE; do NOT grade your own craft.\n"
        + dispatch
        + "   - The judge decides whether the piece is NON-OBVIOUS (says something a\n"
        "     knowledgeable reader did not already hold), its ANGLE is sound, and its\n"
        "     STRUCTURE earns the article's length. The verdict is \"thin\" if the angle is\n"
        "     obvious, the structure is incoherent, or the piece does not earn its length;\n"
        "     otherwise \"publishable\".\n"
        "   - MANDATE BOUNDARY (G3 != G1): judge the article's CRAFT, not the thesis as a\n"
        "     claim (that was the argue gate). A 'thin'/obvious angle is NOT fixable by\n"
        "     re-drafting -- it burns one gate-repair round, then the run falls back to a\n"
        "     new topic (correct: a bad angle should yield the slot to a better topic).\n"
        "   - SINGLE gate on the EN draft: fr/en STRUCTURAL parity rests on the review\n"
        "     self-gate's source_id set-equality + the parallel-output house rule, not on\n"
        "     this gate.\n"
        "   - Then the blocking editorial-quality gate parses it and BLOCKS on a 'thin'\n"
        "     verdict (and on a missing editorial.json -- the pass must have run):\n"
        f"       {editorial_gate}\n"
    )


def _source_quality_section(repo_root: Path, run_dir: Path) -> str:
    """The G2 source-quality PRODUCER step (writing-rigor task 5; closes G2).

    ALONGSIDE (not replacing) factcheck: factcheck judges ENTAILMENT (does the excerpt support
    the claim); this judges whether the SOURCE is actually sound -- primary vs secondary,
    authority of origin, independent corroboration among the OTHER cited sources. The judge is
    handed ONLY the claim->source map's sources[] + {claim, source_id} pairs -- NOT the prose
    (the DEFAULT build_judge_dispatch excludes withholds the draft, exactly as factcheck does;
    unlike the editorial judge, which overrides excludes to READ the finished draft).

    SINGLE gate, NO --lang: the cited source SET is identical fr/en (review.py set-equality), so
    authority/primacy is judged once. build_judge_dispatch is imported LAZILY (keep this module
    import-light) -- mirrors _editorial_section + the lazy humanize import.
    """
    from ..gate.judge import build_judge_dispatch  # lazy: keep prompts import-light

    p = _draft_paths(run_dir)
    sq_gate = _cmd(repo_root, f"pipeline.gate.source_quality --run-dir {run_dir}")
    dispatch = build_judge_dispatch(
        role="source-quality judge",
        inputs_desc=(
            "the claim->source map's sources[] (each source's label, url, excerpt, and "
            "source_date) and the list of {claim, source_id} pairs"
        ),
        out_path=p["source_quality"],
        verdict_schema=(
            '{"verdict": "sound"|"unsound", "claims": [{"source_id", "primary": <bool>, '
            '"authoritative": <bool>, "corroborated": <bool>, "note": "..."}], "reason": "..."}'
        ),
    )
    return (
        "8. SOURCE-QUALITY judgment (G2 -- writing-rigor) -- ALONGSIDE the fact-check, the\n"
        "   same judge != author separation. Fact-check asks 'does this excerpt SUPPORT this\n"
        "   claim'; this asks whether the SOURCE is actually right. A confidently-wrong but\n"
        "   faithfully-cited source passes fact-check and must fail HERE.\n"
        + dispatch
        + "   - The judge sees the SOURCES, not how they are written up. For each load-bearing\n"
        "     source it assesses: primary vs secondary; authority of the origin; and whether\n"
        "     the claim has INDEPENDENT corroboration among the OTHER cited sources. It records\n"
        "     per source_id: primary, authoritative, corroborated (booleans) + a note.\n"
        "   - The verdict is \"unsound\" iff a load-bearing claim rests on a non-authoritative\n"
        "     / confidently-wrong / single-origin source with no corroboration; otherwise\n"
        "     \"sound\". The booleans are DESCRIPTIVE, not a checklist: a sound SECONDARY source\n"
        "     (primary=false, authoritative=true, corroborated=true) is legitimately sound and\n"
        "     PASSES -- only the verdict blocks the gate.\n"
        "   - SINGLE gate on the cited source SET: it is identical fr/en (review.py\n"
        "     set-equality), so authority/primacy is judged once, not per language.\n"
        "   - Then the blocking source-quality gate parses it and BLOCKS on an 'unsound'\n"
        "     verdict (and on a missing source_quality.json -- the pass must have run):\n"
        f"       {sq_gate}\n"
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
        + _factcheck_section(repo_root, run_dir)
        + "\n"
        + _editorial_section(repo_root, run_dir)
        + "\n"
        + _source_quality_section(repo_root, run_dir)
        + "\n"
        "9. Use no emojis anywhere (D-007). PRIVACY / SECRET HYGIENE (FR-D3): no secrets,\n"
        "   private-repo internals, internal codenames, or third-party personal data in\n"
        "   either draft or in any field.\n"
        "\n"
        "Nine gates BLOCK this task (publish never runs while draft is blocked): the six\n"
        "per-language M-4 gates -- factcheck-fr, factcheck-en, grounding-fr, grounding-en,\n"
        "style-fr, style-en (fact-check provenance + supported verdict; source-grounding\n"
        "citations + reachable sources; style no-emoji + 'clean') -- plus editorial-quality\n"
        "(G3, a fresh judge on the EN draft: non-obvious / sound structure / earns its\n"
        "length), source-quality (G2, a fresh judge on the cited source SET: primary vs\n"
        "secondary / authority / independent corroboration), and difficulty-rating (the\n"
        "1-5 rubric rating present in both drafts, fr == en). Write so they pass on the\n"
        "first try.\n"
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

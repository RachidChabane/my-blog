"""Editorial prompt builder for the ARGUE stage (G1 argument-rigor; writing-flow.md section 7).

build_argue_prompt returns the instruction injected as the `argue` task's description. The
agent reads the brief's thesis + claim skeleton and dispatches TWO fresh judges (judge !=
author, via the task-1 build_judge_dispatch): a thesis judge (argument-rigor) that STEELMANs
the thesis, mounts the STRONGEST ATTACK, then RECONCILEs (plans/task-argue/argument.json),
and a source-independence judge (G4) that checks the chosen candidate's cited sources do not
all trace to ONE origin (plans/task-argue/independence.json). A 'weak' verdict BLOCKS
argument-rigor; a 'single_origin' verdict or < 2 distinct registrable domains BLOCKS
source-independence -> the run falls back to the next-ranked topic and re-argues it (section 7).

MANDATE BOUNDARY (keep G1 != G3): judge the THESIS AS A CLAIM (true / defensible /
non-trivial), NOT the finished article's craft (prose/structure/citations -- the editorial
gate, task 4). Written to that distinction so G3 is not a redundant re-run.

Pure function of its inputs; ASCII-only (D-007); paths ABSOLUTE; shell-outs use
PYTHONPATH={repo_root} python3 -m ... [MEM: pipeline-cpe-harness-contract].
build_judge_dispatch is imported LAZILY inside the function so importing this module --
and therefore `import pipeline` -- pulls NO pipeline.gate.* into sys.modules (the wildcard
guard test_gate.py:test_import_pipeline_does_not_import_gate_modules). Mirrors the lazy
draft._humanize import idiom.
"""
from __future__ import annotations

from pathlib import Path


def build_argue_prompt(*, repo_root: Path, run_dir: Path) -> str:
    """Build the argue-stage instruction (pure function of its inputs)."""
    from ..gate.judge import build_judge_dispatch  # lazy: keep prompts import-light

    repo_root = Path(repo_root)
    run_dir = Path(run_dir)
    brief = run_dir / "plans" / "task-select" / "brief.md"
    out = run_dir / "plans" / "task-argue" / "argument.json"
    candidates = run_dir / "plans" / "task-research" / "candidates.json"
    independence_out = run_dir / "plans" / "task-argue" / "independence.json"
    argument_gate = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.gate.argument --run-dir {run_dir}"
    )
    independence_gate = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.gate.independence --run-dir {run_dir}"
    )

    dispatch = build_judge_dispatch(
        role="argument-rigor judge",
        inputs_desc=(
            "ONLY the brief's THESIS and claim skeleton -- the angle plus each claim "
            "statement and its source_ids from the frontmatter. There is NO drafted prose "
            "yet; do not ask for any"
        ),
        out_path=out,
        verdict_schema=(
            '{"verdict": "defensible"|"weak", "steelman": "...", '
            '"strongest_attack": "...", "reconciliation": "...", '
            '"strengthened_argument": "...", "reason": "..."}'
        ),
    )

    independence_dispatch = build_judge_dispatch(
        role="source-independence judge",
        inputs_desc=(
            "ONLY the chosen candidate's cited sources -- each source's label, url, excerpt, and "
            "source_date as captured in the research candidates"
        ),
        out_path=independence_out,
        verdict_schema=(
            '{"verdict": "independent"|"single_origin", "origins": ["..."], "reason": "..."}'
        ),
    )

    return (
        "STAGE: Argue (G1 argument-rigor -- writing-flow.md section 7 cadence).\n"
        "\n"
        f"You run with cwd = the run dir, INSIDE the repo at repo_root: {repo_root}\n"
        "Use that ABSOLUTE repo_root for repo files; never cwd-relative.\n"
        "\n"
        f"1. READ the brief (angle + claim skeleton): {brief}\n"
        "\n"
        "2. PRESSURE-TEST the thesis BEFORE it is drafted bilingually -- a weak angle must\n"
        "   be killed here, not after paying to write it in two languages. The judge must:\n"
        "   - STEELMAN the thesis: state its strongest, most precise form.\n"
        "   - mount the STRONGEST ATTACK: is the thesis wrong, weak, trivially-true,\n"
        "     aging-badly, or does it say nothing non-obvious as a CLAIM? Pick the single\n"
        "     most damaging objection and make it as hard as it can be.\n"
        "   - RECONCILE: decide whether the thesis survives that attack; if it does,\n"
        "     produce the STRENGTHENED form the draft will actually use.\n"
        + dispatch
        + "   The verdict is \"weak\" IF AND ONLY IF the strongest attack WINS, or the\n"
        "   thesis is unfalsifiable / trivially-true (says nothing a reader could disagree\n"
        "   with). Otherwise \"defensible\".\n"
        "\n"
        "3. MANDATE BOUNDARY -- judge the THESIS AS A CLAIM (true / defensible /\n"
        "   non-trivial), NOT the finished article's craft. Prose quality, structure, and\n"
        "   citation formatting are the editorial gate's job, not this one. Do NOT withhold\n"
        "   'defensible' for writing-quality reasons, and do NOT pass a hollow thesis just\n"
        "   because it could be written well.\n"
        + "\n"
        "4. SOURCE-INDEPENDENCE check (G4 -- writing-flow.md section 7) -- a SECOND fresh judge\n"
        "   alongside the thesis judge; both are pre-draft chosen-topic checks. '>= 2 sources' is\n"
        "   a COUNT, not independence: two echoes of one press release are not two independent\n"
        "   sources. Catch a chosen topic whose sourcing traces to a single origin BEFORE paying\n"
        "   to draft it in two languages.\n"
        "   - Resolve the chosen candidate: the brief's chosen_topic_id names it; find that\n"
        "     candidate in the research candidates and take ITS cited sources:\n"
        f"       {candidates}\n"
        + independence_dispatch
        + "   - The judge decides whether those cited sources are genuinely INDEPENDENT or share\n"
        "     ONE ORIGIN -- the same wire story or press release re-run across outlets (distinct\n"
        "     URLs, even distinct hosts, but one source). The verdict is \"single_origin\" iff\n"
        "     the load-bearing sourcing traces to a single origin; otherwise \"independent\".\n"
        "     Record the distinct origins you identify in `origins`.\n"
        "   - A deterministic backstop ALSO runs in the gate: the chosen candidate's cited\n"
        "     sources must span at least two distinct registrable domains (it catches the lazy\n"
        "     two-URLs-same-host echo); the judge catches cross-outlet syndication the domain\n"
        "     check cannot see.\n"
        "\n"
        "Use no emojis anywhere (D-007).\n"
        "\n"
        "TWO gates BLOCK this task, and a blocked argue means draft never runs and publish never\n"
        "runs (bilingual-or-nothing):\n"
        "  - argument-rigor BLOCKS on a 'weak' thesis verdict (=> the run falls back to the\n"
        "    next-ranked topic and re-argues it, writing-flow.md section 7);\n"
        "  - source-independence BLOCKS on a 'single_origin' verdict OR fewer than two distinct\n"
        "    registrable domains among the chosen candidate's cited sources.\n"
        "Run BOTH and fix until each prints OK:\n"
        f"  {argument_gate}\n"
        f"  {independence_gate}\n"
    )


__all__ = ["build_argue_prompt"]

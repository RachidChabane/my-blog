"""Editorial prompt builder for the ARGUE stage (G1 argument-rigor; writing-flow.md section 7).

build_argue_prompt returns the instruction injected as the `argue` task's description. The
agent reads the brief's thesis + claim skeleton and dispatches ONE FRESH judge (judge !=
author, via the task-1 build_judge_dispatch) to STEELMAN the thesis, mount the STRONGEST
ATTACK, then RECONCILE, writing plans/task-argue/argument.json. A 'weak' verdict BLOCKS
the argument-rigor gate -> the run falls back to the next-ranked topic (section 7).

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
    gate_cmd = (
        f"PYTHONPATH={repo_root} python3 -m pipeline.gate.argument --run-dir {run_dir}"
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
        "\n"
        "Use no emojis anywhere (D-007).\n"
        "\n"
        "The argument-rigor gate BLOCKS this task on a 'weak' verdict (=> the run falls\n"
        "back to the next-ranked topic and re-argues it, writing-flow.md section 7). A\n"
        "blocked argue means draft never runs and publish never runs\n"
        "(bilingual-or-nothing). Run it and fix until it prints OK:\n"
        f"  {gate_cmd}\n"
    )


__all__ = ["build_argue_prompt"]

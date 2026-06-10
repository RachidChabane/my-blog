"""Golden adversarial defect-bank tests (writing-rigor task 2).

Two layers, mirroring test_gate.py's MECHANISM vs the live-judge boundary:

- DETERMINISTIC (default `pytest -q pipeline`): the bank is well-formed (fail-closed); the
  bank's gate invocations match pipeline/invariants.yaml; and every planted defect makes its
  gate BLOCK (exit 1) naming the defect, using FIXTURE findings (a planted factcheck-*.json /
  style_findings.* stands in for the live judge, exactly as test_gate.py does).

- LIVE-ONLY (GOLDEN_LIVE=1, default-skip): the judgment proof -- a FRESH judge on the entry's
  genuinely-adversarial artifacts must independently produce a blocking verdict. Run at bring-up
  (DEPLOY.md section 3); produce_live_findings() is the dispatch seam.

Fail-closed: a malformed/truncated bank raises BankError at load (collection error), never zero
silently-green tests. The runner drives gates by SUBPROCESS, so this module imports no
pipeline.gate.* (parser-agnostic); ClaimSourceMap / house_style_violations are used only to
prove the LIVE adversarial artifacts are structurally clean (so a live block is the VERDICT).
"""
from __future__ import annotations

import os

import pytest
import yaml

from pipeline.contracts.claim_source_map import ClaimSourceMap
from pipeline.stages.humanize import house_style_violations
from pipeline.tests.golden import (
    EXPECTED_MIN_ENTRIES,
    GATE_ARTIFACT_SUBDIR,
    REPO_ROOT,
    BankEntry,
    artifact_path,
    load_bank,
    materialize,
    produce_live_findings,
    run_gate,
)

# Loaded at collection: a malformed/empty bank raises BankError here -> collection ERROR
# (fail-closed), never a silently-green empty parametrization.
_BANK = load_bank()
_LIVE = [e for e in _BANK if e.live is not None]
_INVARIANTS = REPO_ROOT / "pipeline" / "invariants.yaml"
_GOLDEN_LIVE = bool(os.environ.get("GOLDEN_LIVE"))
_SEED_IDS = {"factcheck-unsupported-claim", "style-ai-tell", "grounding-dead-link", "style-emoji"}


# --- fail-closed bank integrity -------------------------------------------------

def test_bank_meets_floor_and_seeds_present():
    assert len(_BANK) >= EXPECTED_MIN_ENTRIES, (
        f"bank has {len(_BANK)} entries; expected >= {EXPECTED_MIN_ENTRIES}. A truncated bank "
        "must FAIL, not silently parametrize fewer defects."
    )
    assert _SEED_IDS <= {e.id for e in _BANK}, "the seeded retro-proof defects must be present"


def test_argue_golden_entries_present():
    # task 3: the three G1 argument-rigor archetypes (trivially-true / aging / attack-wins).
    assert {"argument-trivially-true", "argument-aging-badly", "argument-attack-wins"} <= {
        e.id for e in _BANK
    }


def test_editorial_golden_entry_present():
    # task 4: the G3 editorial-quality archetype (obvious angle / thin structure).
    assert "editorial-thin-obvious" in {e.id for e in _BANK}


def test_source_quality_golden_entries_present():
    # task 5: the two G2 source-quality archetypes (confidently-wrong / single-origin).
    assert {"source-quality-confidently-wrong", "source-quality-single-origin"} <= {
        e.id for e in _BANK
    }


def test_independence_golden_entry_present():
    # task 6: the G4 source-independence archetype (cross-outlet syndication).
    assert "independence-cross-outlet-syndication" in {e.id for e in _BANK}


def test_seeded_live_split_is_correct():
    # The two judge-backed defects carry a live block; the deterministic ones do not. (Later
    # tasks ADD live entries -- a subset assertion, so appending one needs no edit here.)
    live_ids = {e.id for e in _LIVE}
    assert {"factcheck-unsupported-claim", "style-ai-tell"} <= live_ids
    by_id = {e.id: e for e in _BANK}
    assert by_id["grounding-dead-link"].live is None  # no judge: --dead-urls is the proof
    assert by_id["style-emoji"].live is None           # deterministic no-emoji scan


# --- the bank cannot drift from the wired gate invocations (anti-drift) ---------

def _wired_invocations() -> dict[str, set[tuple[str, ...]]]:
    """module -> {arg-tails} from pipeline/invariants.yaml `command:` lines, where a tail is
    everything after `--run-dir .` (e.g. ('--lang','fr')). A no-lang gate yields ()."""
    out: dict[str, set[tuple[str, ...]]] = {}
    for entry in yaml.safe_load(_INVARIANTS.read_text(encoding="utf-8")):
        toks = entry["command"].split()
        module = toks[toks.index("-m") + 1]
        i = toks.index("--run-dir")
        out.setdefault(module, set()).add(tuple(toks[i + 2:]))  # skip --run-dir and its '.'
    return out


def test_bank_gate_invocations_match_invariants():
    wired = _wired_invocations()
    for e in _BANK:
        module = f"pipeline.gate.{e.gate}"
        assert module in wired, f"{e.id}: gate {module} is not wired in invariants.yaml"
        # A wired invocation must be a PREFIX of the bank args: the bank may ADD test-only flags
        # (e.g. --dead-urls) on top, but never DROP a wired flag (which would argparse-exit 2).
        assert any(tuple(e.args[: len(tail)]) == tail for tail in wired[module]), (
            f"{e.id}: args {e.args} do not extend any wired invocation {wired[module]}"
        )


# --- DETERMINISTIC: every planted defect blocks its gate, naming the defect ------

@pytest.mark.parametrize("entry", _BANK, ids=lambda e: e.id)
def test_golden_mechanism_blocks_and_names_defect(entry: BankEntry, tmp_path):
    run_dir = materialize(
        entry.artifacts, tmp_path,
        subdir=GATE_ARTIFACT_SUBDIR.get(entry.gate, "task-draft"),
    )
    proc = run_gate(entry.gate, entry.args, run_dir)
    # returncode == 1 (a BLOCK), not just != 0: argparse misuse exits 2, a traceback exits 1
    # with a stderr dump; the substring check below disambiguates a real verdict block.
    assert proc.returncode == 1, (
        f"{entry.id}: expected gate BLOCK (exit 1), got {proc.returncode}\n"
        f"STDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}"
    )
    for needle in entry.expect_contains:
        assert needle in proc.stdout, (
            f"{entry.id}: gate blocked but did not name the defect {needle!r}\n"
            f"STDOUT:\n{proc.stdout}"
        )


# --- LIVE adversarial artifacts are structurally clean (so a live block is the VERDICT) ---

def test_live_adversarial_artifacts_are_clean_and_isolating():
    from urllib.parse import urlsplit

    from pipeline.stages.research import CandidatesDoc
    from pipeline.stages.select import parse_brief

    for entry in _LIVE:
        assert entry.live is not None
        for target, source in entry.live.adversarial_artifacts.items():
            path = artifact_path(source)
            if target == "claim_source_map.json":
                # structurally valid => verify_provenance returns [] => only the judge can block
                ClaimSourceMap.load_path(path).validate()
            if target.startswith("draft-") and target.endswith(".md"):
                # emoji-free => the live style block is the auditor verdict, not the no-emoji scan
                assert house_style_violations(path.read_text(encoding="utf-8")) == [], (
                    f"{entry.id}: adversarial draft must be emoji-free "
                    "so the live block is the verdict"
                )
        if entry.gate == "independence":
            # backstop must PASS on the adversarial set so the live block is the judge's
            # single_origin verdict (NOT the domain backstop). hosts here must ALSO be distinct
            # REGISTRABLE domains (review#2): a future sub-domain fixture (a.x / b.x) would pass
            # this >=2-hosts guard yet trip _registrable_domain, silently shifting the block.
            files = {
                t.rpartition("/")[2]: artifact_path(s)
                for t, s in entry.live.adversarial_artifacts.items()
            }
            doc = CandidatesDoc.load_path(files["candidates.json"])
            doc.validate()
            chosen = parse_brief(files["brief.md"].read_text(encoding="utf-8")).chosen_topic_id
            cand = next(c for c in doc.candidates if c.topic_id == chosen)
            hosts = {urlsplit(s.url).hostname for s in cand.sources}
            assert len(hosts) >= 2, (
                f"{entry.id}: adversarial candidate must span >= 2 hosts so the live block is "
                "the judge's single_origin verdict, not the domain backstop"
            )


# --- LIVE-ONLY: the fresh judge's verdict must independently BLOCK (bring-up) -----

@pytest.mark.skipif(
    not _GOLDEN_LIVE,
    reason=(
        "live judgment proof; set GOLDEN_LIVE=1 + GOLDEN_LIVE_DIR at bring-up "
        "(DEPLOY.md section 3)"
    ),
)
@pytest.mark.parametrize("entry", _LIVE, ids=lambda e: e.id)
def test_golden_live_judgment_blocks(entry: BankEntry, tmp_path):
    assert entry.live is not None
    run_dir = materialize(
        entry.live.adversarial_artifacts, tmp_path,
        subdir=GATE_ARTIFACT_SUBDIR.get(entry.gate, "task-draft"),
    )
    produce_live_findings(entry, run_dir)  # the fresh judge's output (raises loudly if missing)
    proc = run_gate(entry.gate, entry.args, run_dir)
    assert proc.returncode == 1, (
        f"{entry.id}: the FRESH judge's verdict did not BLOCK (exit {proc.returncode})\n"
        f"STDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}"
    )
    for needle in entry.live.expect_contains:
        assert needle in proc.stdout, (
            f"{entry.id}: live block did not name {needle!r}\n{proc.stdout}"
        )

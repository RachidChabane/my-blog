"""Golden adversarial defect-bank harness (writing-rigor task 2).

A parser-agnostic runner over a curated bank of PLANTED defects (bank.json). Each entry names
a gate, its argv tail, and the draft-dir artifacts that reproduce one defect; the runner
materializes the artifacts into a run-dir and drives the gate by its CLI
(python3 -m pipeline.gate.<gate> --run-dir <dir> + args). It proves the bespoke
factcheck/grounding/style parsers AND the task-1 substrate gates UNIFORMLY -- by exit code +
the named finding, never by re-parsing a gate's output format.

Two layers (see test_golden.py):
  - DETERMINISTIC (default `pytest -q pipeline`): materialize each entry's FIXTURE artifacts
    (a planted findings file stands in for the live judge, exactly as test_gate.py does) and
    assert the gate BLOCKS naming the defect. No LLM / network / secret.
  - LIVE-ONLY (GOLDEN_LIVE=1, default-skip): materialize the entry's genuinely-adversarial
    artifacts (no findings file) + the findings a FRESH judge produced, then assert the gate
    blocks. The judgment proof, run at bring-up (DEPLOY.md section 3). produce_live_findings()
    is the dispatch seam: at bring-up the supervising instance dispatches the judge and drops
    its output under GOLDEN_LIVE_DIR -- mirroring grounding._make_link_checker('real') deferring
    the real backend to bring-up.

Pure stdlib; drives gates by SUBPROCESS and imports NO pipeline.gate.* (parser-agnostic).
Artifact sources resolve under pipeline/tests/ (e.g. "fixtures/..." or "golden/artifacts/...").
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

_TESTS_DIR = Path(__file__).resolve().parents[1]   # pipeline/tests
REPO_ROOT = Path(__file__).resolve().parents[3]    # repo root
GOLDEN_DIR = Path(__file__).resolve().parent       # pipeline/tests/golden
BANK_PATH = GOLDEN_DIR / "bank.json"

# Gate modules the bank may drive. Tasks 3-6 EXTEND this as they add gates
# (argument, editorial, source_quality, independence). A bank entry naming any other gate
# is malformed (fail-closed in _entry_from_dict).
KNOWN_GATES = ("factcheck", "grounding", "style", "argument", "editorial", "source_quality")

# Floor for the seeded retro-proof. A truncated bank => fewer entries => the floor test fails
# rather than silently parametrizing zero defects. Tasks may raise it as they add entries.
EXPECTED_MIN_ENTRIES = 10

# Most gates read plans/task-draft/; the argue (G1) gate -- and task 6's independence (G4)
# -- read plans/task-argue/. The bank stays purely additive (no new bank.json field): the
# subdir is DERIVED from the gate. Tasks adding a cross-dir gate add one entry here.
# CADENCE-SAFETY (task 8 bring-up note): argue now gates cadence; an over-aggressive judge
# could block every fallback candidate and burn the whole shortlist. The argue golden-LIVE
# entries are the calibration signal -- validate them at bring-up (DEPLOY.md section 3).
GATE_ARTIFACT_SUBDIR: dict[str, str] = {"argument": "task-argue"}


class BankError(AssertionError):
    """A malformed bank entry / missing artifact. AssertionError so a bad bank is a TEST
    ERROR (fail-closed), never a silent skip."""


@dataclass(frozen=True)
class LiveSpec:
    """The live-judgment dimension of a defect (present iff the defect has a real judge).

    ``adversarial_artifacts`` are GENUINELY defective and DO NOT include the findings file:
    a fresh judge handed these must independently produce ``produces`` with a blocking
    verdict. ``expect_contains`` is the live assertion's substrings -- looser than the
    deterministic ones where the exact verdict word can vary (a real style-auditor may say
    'suspicious' or 'revision_needed'; both block)."""

    produces: str
    adversarial_artifacts: dict[str, str]
    expect_contains: list[str]


@dataclass(frozen=True)
class BankEntry:
    id: str
    gate: str
    args: list[str]
    artifacts: dict[str, str]
    expect_contains: list[str]
    why: str
    live: LiveSpec | None = None


def _require(cond: bool, msg: str) -> None:
    if not cond:
        raise BankError(msg)


def artifact_path(rel: str) -> Path:
    """Resolve an artifact source (e.g. 'fixtures/...' / 'golden/artifacts/...') under
    pipeline/tests/. Raises BankError if it escapes that root or is missing (fail-closed)."""
    path = (_TESTS_DIR / rel).resolve()
    _require(
        _TESTS_DIR == path or _TESTS_DIR in path.parents,
        f"artifact source escapes pipeline/tests/: {rel!r}",
    )
    _require(path.is_file(), f"artifact source not found: {rel!r}")
    return path


def _validate_artifacts(artifacts: object, where: str) -> dict[str, str]:
    _require(
        isinstance(artifacts, dict) and bool(artifacts),
        f"{where}: artifacts must be a non-empty object",
    )
    assert isinstance(artifacts, dict)
    for target, source in artifacts.items():
        _require(
            isinstance(target, str) and "/" not in target and target not in ("", ".", ".."),
            f"{where}: bad artifact target filename {target!r}",
        )
        _require(
            isinstance(source, str),
            f"{where}: artifact source for {target!r} must be a string",
        )
        artifact_path(source)  # existence-checks at load (fail-closed)
    return dict(artifacts)


def _str_list(value: object, where: str) -> list[str]:
    _require(
        isinstance(value, list) and bool(value) and all(isinstance(s, str) for s in value),
        f"{where} must be a non-empty list of strings",
    )
    assert isinstance(value, list)
    return list(value)


def _entry_from_dict(raw: object) -> BankEntry:
    _require(isinstance(raw, dict), f"bank entry must be an object (got {type(raw).__name__})")
    assert isinstance(raw, dict)
    for key in ("id", "gate", "args", "artifacts", "expect_contains", "why"):
        _require(key in raw, f"bank entry missing required key {key!r}")
    eid = raw["id"]
    _require(isinstance(eid, str) and bool(eid), "bank entry 'id' must be a non-empty string")
    _require(
        raw["gate"] in KNOWN_GATES,
        f"{eid}: unknown gate {raw['gate']!r} (known: {KNOWN_GATES})",
    )
    _require(
        isinstance(raw["args"], list) and all(isinstance(a, str) for a in raw["args"]),
        f"{eid}: 'args' must be a list of strings",
    )
    _require(
        isinstance(raw["why"], str) and bool(raw["why"]),
        f"{eid}: 'why' must be a non-empty string",
    )
    artifacts = _validate_artifacts(raw["artifacts"], eid)
    expect_contains = _str_list(raw["expect_contains"], f"{eid}: expect_contains")

    live: LiveSpec | None = None
    live_raw = raw.get("live")
    if live_raw is not None:
        _require(isinstance(live_raw, dict), f"{eid}: 'live' must be an object")
        assert isinstance(live_raw, dict)
        for key in ("produces", "adversarial_artifacts", "expect_contains"):
            _require(key in live_raw, f"{eid}: live missing required key {key!r}")
        produces = live_raw["produces"]
        _require(
            isinstance(produces, str) and "/" not in produces and bool(produces),
            f"{eid}: live.produces must be a bare filename",
        )
        adversarial = _validate_artifacts(live_raw["adversarial_artifacts"], f"{eid}.live")
        _require(
            produces not in adversarial,
            f"{eid}: live.produces must NOT be pre-supplied in adversarial_artifacts "
            "(the fresh judge writes it)",
        )
        live = LiveSpec(
            produces=produces,
            adversarial_artifacts=adversarial,
            expect_contains=_str_list(live_raw["expect_contains"], f"{eid}: live.expect_contains"),
        )
    return BankEntry(
        id=eid, gate=raw["gate"], args=list(raw["args"]),
        artifacts=artifacts, expect_contains=expect_contains, why=raw["why"], live=live,
    )


def load_bank(path: Path | None = None) -> list[BankEntry]:
    """Load + structurally validate the bank. RAISES BankError on malformed JSON, a non-array
    top level, an EMPTY bank, any malformed entry, a missing artifact, or a duplicate id -- so
    a truncated/garbled bank is a loud error at collection, never zero-tests-green."""
    bank_path = path or BANK_PATH
    try:
        raw = json.loads(bank_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise BankError(f"cannot load bank {bank_path}: {exc}") from exc
    _require(isinstance(raw, list), "bank.json top level must be a JSON array")
    assert isinstance(raw, list)
    _require(len(raw) > 0, "bank.json must be non-empty (fail-closed: an empty bank is an error)")
    entries = [_entry_from_dict(item) for item in raw]
    ids = [e.id for e in entries]
    _require(len(ids) == len(set(ids)), f"duplicate bank entry ids: {ids}")
    return entries


def materialize(artifacts: dict[str, str], run_dir: Path, *, subdir: str = "task-draft") -> Path:
    """Copy each (target_filename -> source_rel) into run_dir/plans/<subdir> (mirrors
    test_gate.py:_make_draft_run). ``subdir`` DEFAULTS to ``task-draft`` (keeps every
    existing call site/entry unchanged); a cross-dir gate (argue G1) passes its own subdir
    derived from GATE_ARTIFACT_SUBDIR. Returns run_dir (the gate's --run-dir)."""
    dest_dir = run_dir / "plans" / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    for target, source in artifacts.items():
        shutil.copyfile(artifact_path(source), dest_dir / target)
    return run_dir


def run_gate(gate: str, args: list[str], run_dir: Path) -> subprocess.CompletedProcess[str]:
    """Drive a gate by its CLI exactly as the wired pipeline does (mirrors test_gate.py:_cli):
    python3 -m pipeline.gate.<gate> --run-dir <run_dir> + args, PYTHONPATH=<repo root>."""
    env = {**os.environ, "PYTHONPATH": str(REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", f"pipeline.gate.{gate}", "--run-dir", str(run_dir), *args],
        capture_output=True, text=True, env=env,
    )


def produce_live_findings(entry: BankEntry, run_dir: Path) -> Path:
    """LIVE seam: place the FRESH judge's findings file into the run-dir.

    Default (bring-up) impl: copy <GOLDEN_LIVE_DIR>/<entry.id>/<live.produces> -- the output a
    fresh judge wrote when the supervising instance dispatched it on the entry's adversarial
    artifacts -- into run_dir/plans/task-draft. RAISES (never silent-skips) when GOLDEN_LIVE_DIR
    is unset or the file is absent, so an operator who opts into GOLDEN_LIVE without supplying
    the judge output sees a loud failure. The dispatch itself is bring-up's job (DEPLOY.md
    section 3), exactly as grounding._make_link_checker('real') defers the real backend."""
    assert entry.live is not None, f"{entry.id}: produce_live_findings on a non-live entry"
    base = os.environ.get("GOLDEN_LIVE_DIR")
    _require(
        bool(base),
        f"{entry.id}: GOLDEN_LIVE_DIR unset -- dispatch a fresh judge on the adversarial "
        f"artifacts and drop its {entry.live.produces} at "
        f"$GOLDEN_LIVE_DIR/{entry.id}/{entry.live.produces} (see DEPLOY.md section 3)",
    )
    assert base is not None
    src = Path(base) / entry.id / entry.live.produces
    _require(
        src.is_file(),
        f"{entry.id}: live findings not found at {src} -- the fresh judge did not produce them",
    )
    subdir = GATE_ARTIFACT_SUBDIR.get(entry.gate, "task-draft")  # argue G1 reads task-argue/
    dest = run_dir / "plans" / subdir / entry.live.produces
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    return dest


__all__ = [
    "BankEntry", "LiveSpec", "BankError",
    "KNOWN_GATES", "EXPECTED_MIN_ENTRIES", "GATE_ARTIFACT_SUBDIR",
    "REPO_ROOT", "GOLDEN_DIR", "BANK_PATH",
    "artifact_path", "load_bank", "materialize", "run_gate", "produce_live_findings",
]

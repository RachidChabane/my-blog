"""Offline tests for task 1: the shared judge != author verdict substrate.

Deterministic MECHANISM only -- no live LLM / sub-agent, no network, no secret. They
lock the substrate's fail-closed parser (it RAISES on every malformed shape), the
VERDICT-ONLY ``judge_passes`` predicate (a present-and-FALSE descriptive boolean still
PASSES -- only the verdict decides), and the pure ``build_judge_dispatch`` helper
(deterministic, ASCII-only, names the out_path + the "fresh sub-agent / do not override"
separation). The parser raise-matrix mirrors
``test_gate.py:test_parse_factcheck_bad_inputs_raise``.

There is no live-only assertion here -- the substrate is exercised by the gates that use
it (tasks 3-6) and proven live by the golden adversarial set (task 2). Import convention
[MEM: pipeline-stages-import-light-runpy]: the substrate is imported DIRECTLY from
``pipeline.gate.judge``; the existing wildcard guard
``test_gate.py:test_import_pipeline_does_not_import_gate_modules`` already proves
``import pipeline`` pulls in no ``pipeline.gate.*`` module (judge.py included), so no
new import guard is duplicated here.
"""
from __future__ import annotations

import json

import pytest

from pipeline.contracts.claim_source_map import ContractError
from pipeline.gate.judge import (
    JudgeReport,
    build_judge_dispatch,
    judge_passes,
    parse_judge_findings,
)

# The one vocabulary that uses item_key + required_item_fields (source-quality, task 5);
# argument/editorial/independence are item_key=None (verdict-only).
_SQ_VERDICTS = ("sound", "unsound")
_SQ_REQUIRED = ("source_id", "primary", "authoritative", "corroborated")
_ARG_VERDICTS = ("defensible", "weak")


def _sq_claim(**over) -> dict:
    """A well-formed source-quality per-claim entry; override fields per test."""
    base = {
        "source_id": "s1",
        "primary": True,
        "authoritative": True,
        "corroborated": True,
        "note": "ok",
    }
    base.update(over)
    return base


# ---------------------------------------------------------------------------
# parse_judge_findings -- the FAIL-CLOSED raise matrix
# ---------------------------------------------------------------------------


def test_parse_invalid_json_raises():
    with pytest.raises(ContractError):
        parse_judge_findings("{not valid json", verdicts=_SQ_VERDICTS, item_key="claims")


def test_parse_non_object_payload_raises():
    # valid JSON but not a findings object (array / scalar)
    with pytest.raises(ContractError):
        parse_judge_findings("[1, 2]", verdicts=_SQ_VERDICTS, item_key="claims")
    with pytest.raises(ContractError):
        parse_judge_findings('"a string"', verdicts=_SQ_VERDICTS, item_key="claims")


def test_parse_unknown_verdict_raises():
    with pytest.raises(ContractError):
        parse_judge_findings(
            {"verdict": "bogus", "claims": []}, verdicts=_SQ_VERDICTS, item_key="claims"
        )


def test_parse_missing_verdict_raises():
    with pytest.raises(ContractError):
        parse_judge_findings({"claims": []}, verdicts=_SQ_VERDICTS, item_key="claims")


def test_parse_non_list_items_raises():
    with pytest.raises(ContractError):
        parse_judge_findings(
            {"verdict": "sound", "claims": "nope"},
            verdicts=_SQ_VERDICTS,
            item_key="claims",
        )


def test_parse_absent_item_list_raises_fail_closed():
    # item_key set + the field ABSENT -> fail-closed raise (the producer must emit it,
    # [] when empty). This is the deliberate divergence from style.py's tolerant `or []`.
    with pytest.raises(ContractError):
        parse_judge_findings(
            {"verdict": "sound"}, verdicts=_SQ_VERDICTS, item_key="claims"
        )


def test_parse_item_missing_required_field_raises():
    bad = _sq_claim()
    del bad["corroborated"]  # drop a required per-item field
    with pytest.raises(ContractError):
        parse_judge_findings(
            {"verdict": "sound", "claims": [bad]},
            verdicts=_SQ_VERDICTS,
            item_key="claims",
            required_item_fields=_SQ_REQUIRED,
        )


def test_parse_non_mapping_item_raises():
    with pytest.raises(ContractError):
        parse_judge_findings(
            {"verdict": "sound", "claims": ["x"]},
            verdicts=_SQ_VERDICTS,
            item_key="claims",
            required_item_fields=_SQ_REQUIRED,
        )


# ---------------------------------------------------------------------------
# parse_judge_findings -- the valid shapes
# ---------------------------------------------------------------------------


def test_parse_accepts_dict_and_str_equivalently():
    payload = {"verdict": "sound", "claims": []}
    from_dict = parse_judge_findings(payload, verdicts=_SQ_VERDICTS, item_key="claims")
    from_str = parse_judge_findings(
        json.dumps(payload), verdicts=_SQ_VERDICTS, item_key="claims"
    )
    assert isinstance(from_dict, JudgeReport)
    assert from_dict.verdict == from_str.verdict == "sound"
    assert from_dict.items == from_str.items == []


def test_parse_empty_item_list_is_valid():
    # an empty list is valid (distinct from an ABSENT list, which raises above)
    report = parse_judge_findings(
        {"verdict": "sound", "claims": []},
        verdicts=_SQ_VERDICTS,
        item_key="claims",
        required_item_fields=_SQ_REQUIRED,
    )
    assert report.items == []


def test_parse_item_key_none_ignores_lists_and_exposes_data():
    # argument/independence shape: verdict-only, no per-item validation; informational
    # fields (steelman, origins) remain reachable via report.data.
    report = parse_judge_findings(
        {
            "verdict": "defensible",
            "steelman": "the strong form",
            "origins": ["a", "b"],  # a scalar list is NOT validated when item_key is None
        },
        verdicts=_ARG_VERDICTS,
        item_key=None,
    )
    assert report.items == []
    assert report.data["steelman"] == "the strong form"
    assert report.data["origins"] == ["a", "b"]


def test_parse_presence_backstop_is_not_type_checked():
    # PRESENCE, not TYPE: a non-bool `primary` is present, so it parses (the verdict, not
    # the boolean, decides the gate).
    report = parse_judge_findings(
        {"verdict": "sound", "claims": [_sq_claim(primary="yes")]},
        verdicts=_SQ_VERDICTS,
        item_key="claims",
        required_item_fields=_SQ_REQUIRED,
    )
    assert report.items[0]["primary"] == "yes"


def test_reason_convenience():
    report = parse_judge_findings(
        {"verdict": "weak", "reason": "the attack wins"},
        verdicts=_ARG_VERDICTS,
        item_key=None,
    )
    assert report.reason == "the attack wins"
    absent = parse_judge_findings(
        {"verdict": "weak"}, verdicts=_ARG_VERDICTS, item_key=None
    )
    assert absent.reason == ""


# ---------------------------------------------------------------------------
# judge_passes -- VERDICT-ONLY (the descriptive-boolean regression guard)
# ---------------------------------------------------------------------------


def test_judge_passes_on_pass_verdict():
    report = parse_judge_findings(
        {"verdict": "sound", "claims": [_sq_claim()]},
        verdicts=_SQ_VERDICTS,
        item_key="claims",
        required_item_fields=_SQ_REQUIRED,
    )
    assert judge_passes(report, pass_verdict="sound") is True


def test_judge_passes_present_and_false_boolean_still_passes():
    # THE regression guard: a sound SECONDARY source has primary=false (and no direct
    # corroboration) but the verdict is "sound" -> the gate PASSES. Do NOT all()-AND the
    # per-item booleans (that is factcheck's rule, off this substrate).
    report = parse_judge_findings(
        {"verdict": "sound", "claims": [_sq_claim(primary=False, corroborated=False)]},
        verdicts=_SQ_VERDICTS,
        item_key="claims",
        required_item_fields=_SQ_REQUIRED,
    )
    assert judge_passes(report, pass_verdict="sound") is True


def test_judge_passes_blocks_on_non_pass_verdict():
    # even with every per-item boolean true, an "unsound" verdict blocks.
    report = parse_judge_findings(
        {"verdict": "unsound", "claims": [_sq_claim()]},
        verdicts=_SQ_VERDICTS,
        item_key="claims",
        required_item_fields=_SQ_REQUIRED,
    )
    assert judge_passes(report, pass_verdict="sound") is False


def test_judge_passes_verdict_only_item_key_none():
    defensible = parse_judge_findings(
        {"verdict": "defensible"}, verdicts=_ARG_VERDICTS, item_key=None
    )
    weak = parse_judge_findings(
        {"verdict": "weak"}, verdicts=_ARG_VERDICTS, item_key=None
    )
    assert judge_passes(defensible, pass_verdict="defensible") is True
    assert judge_passes(weak, pass_verdict="defensible") is False


# ---------------------------------------------------------------------------
# build_judge_dispatch -- pure, ASCII-only, names the seam
# ---------------------------------------------------------------------------

_ABS_OUT = "/abs/repo/pipeline/runs/run-1/plans/task-argue/argument.json"


def _dispatch() -> str:
    return build_judge_dispatch(
        role="argument-rigor judge",
        inputs_desc="the brief's thesis + claim skeleton (no prose)",
        out_path=_ABS_OUT,
        verdict_schema='{"verdict": "defensible"|"weak", "reason": "..."}',
    )


def test_build_judge_dispatch_deterministic_and_ascii():
    assert _dispatch() == _dispatch()
    assert _dispatch().isascii()  # D-007: no emoji in the prompt itself


def test_build_judge_dispatch_names_outpath_and_separation():
    block = _dispatch()
    assert _ABS_OUT in block  # the absolute out_path is embedded verbatim
    # collapse newlines/indentation so phrase checks are robust to line wrapping
    flat = " ".join(block.split())
    for needle in [
        "argument-rigor judge",                 # the role
        "the brief's thesis",                   # the inputs_desc
        '"verdict": "defensible"',              # the verdict_schema
        "do NOT grade your own work",           # judge != author
        "FRESH general-purpose sub-agent",
        "clean context",
        "does NOT see the draft",
        "do NOT write it yourself",
        "do NOT override its verdict",
    ]:
        assert needle in flat, f"dispatch block missing {needle!r}"


def test_build_judge_dispatch_accepts_path_object():
    from pathlib import Path

    block = build_judge_dispatch(
        role="r",
        inputs_desc="i",
        out_path=Path(_ABS_OUT),
        verdict_schema="{}",
    )
    assert _ABS_OUT in block

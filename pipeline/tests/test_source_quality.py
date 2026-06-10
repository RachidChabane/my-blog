"""Offline tests for task 5: the G2 source-quality gate (mechanism only).

Deterministic MECHANISM (mirrors test_quality_gates.py / test_argue.py) -- no live LLM / judge
sub-agent, no network, no secret. The verdict PARSER + the item_key/required_item_fields presence
backstop are proven in test_judge_substrate.py; here we prove the GATE WIRING (the source-quality
verdict vocabulary + pass_verdict='sound' + the 4 block paths incl. the structural per-item
backstop) end-to-end via subprocess, plus the pure check_source_quality combiner.

KEY regression guard (the analogue of test_parse_factcheck_supported_passes): a 'sound' verdict
whose claim rests on a legitimately sound SECONDARY source (primary=false) PASSES -- the per-item
booleans are DESCRIPTIVE and are NOT all()-ANDed (that is factcheck's rule, off this substrate).

Import-light is already guarded by test_gate.py:test_import_pipeline_does_not_import_gate_modules
(it covers every pipeline.gate.* incl. source_quality); no new guard duplicated here.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from pipeline.gate.source_quality import SOURCE_QUALITY_VERDICTS, check_source_quality

_REPO_ROOT = Path(__file__).resolve().parents[2]

# A sound report whose only claim is a legitimately sound SECONDARY source (primary=false).
_SOUND_SECONDARY = (
    '{"verdict": "sound", "claims": [{"source_id": "s1", "primary": false, '
    '"authoritative": true, "corroborated": true, "note": "sound secondary"}], '
    '"reason": "the secondary source is authoritative and corroborated"}'
)
_UNSOUND = (
    '{"verdict": "unsound", "claims": [{"source_id": "s2", "primary": false, '
    '"authoritative": false, "corroborated": false, "note": "self-reported blog figure"}], '
    '"reason": "non-authoritative single-origin source"}'
)
# A 'sound' verdict whose claim DROPS the required `corroborated` boolean: the structural
# presence backstop must BLOCK even though the verdict is sound.
_SOUND_MISSING_BOOL = (
    '{"verdict": "sound", "claims": [{"source_id": "s1", "primary": true, '
    '"authoritative": true, "note": "dropped corroborated"}], "reason": "ok"}'
)


def _cli(run_dir: Path) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.gate.source_quality", "--run-dir", str(run_dir)],
        capture_output=True, text=True, env=env,
    )


def _write(tmp_path: Path, text: str) -> Path:
    d = tmp_path / "plans" / "task-draft"
    d.mkdir(parents=True, exist_ok=True)
    (d / "source_quality.json").write_text(text, encoding="utf-8")
    return tmp_path


# --- pure combiner -------------------------------------------------------------
def test_check_source_quality_sound_secondary_is_clean():
    # THE regression guard: primary=false (sound secondary) + verdict 'sound' -> PASS.
    assert check_source_quality(_SOUND_SECONDARY) == []


def test_check_source_quality_unsound_names_verdict_and_source():
    problems = check_source_quality(_UNSOUND)
    assert any("source-quality verdict is" in p and "unsound" in p for p in problems)
    assert any("s2" in p for p in problems)  # the offending source enumerated


def test_check_source_quality_missing_required_boolean_is_fail_closed():
    # presence backstop fires EVEN ON A 'sound' verdict (parser validates items regardless).
    assert check_source_quality(_SOUND_MISSING_BOOL)


def test_check_source_quality_unparseable_is_fail_closed():
    assert check_source_quality('{"verdict": "bogus", "claims": []}')  # not in vocab
    assert check_source_quality("{not json")
    assert "sound" in SOURCE_QUALITY_VERDICTS and "unsound" in SOURCE_QUALITY_VERDICTS


# --- CLI (the 4 block paths + the pass path) -----------------------------------
def test_gate_passes_on_sound_secondary(tmp_path):
    ok = _cli(_write(tmp_path, _SOUND_SECONDARY))
    assert ok.returncode == 0, ok.stdout + ok.stderr
    assert "OK" in ok.stdout


def test_gate_blocks_on_unsound(tmp_path):
    bad = _cli(_write(tmp_path, _UNSOUND))
    assert bad.returncode == 1
    assert "source-quality verdict is" in bad.stdout and "unsound" in bad.stdout


def test_gate_blocks_on_missing(tmp_path):
    (tmp_path / "plans" / "task-draft").mkdir(parents=True)  # no source_quality.json
    miss = _cli(tmp_path)
    assert miss.returncode == 1
    assert "missing source_quality.json" in miss.stdout


def test_gate_blocks_on_missing_required_boolean(tmp_path):
    bad = _cli(_write(tmp_path, _SOUND_MISSING_BOOL))
    assert bad.returncode == 1
    assert "invalid source-quality findings" in bad.stdout


def test_gate_blocks_on_unparseable(tmp_path):
    bad = _cli(_write(tmp_path, '{"verdict": "bogus", "claims": []}'))
    assert bad.returncode == 1
    assert "invalid source-quality findings" in bad.stdout

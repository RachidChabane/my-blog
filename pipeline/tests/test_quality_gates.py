"""Offline tests for task 4: the G3 editorial-quality gate (mechanism only).

Deterministic MECHANISM (mirrors test_argue.py) -- no live LLM / judge sub-agent, no
network, no secret. The verdict PARSER is proven in test_judge_substrate.py; here we prove
the GATE WIRING (the editorial verdict vocabulary + pass_verdict='publishable' + the 3
block paths) end-to-end via subprocess, plus the pure check_editorial combiner.

Import-light is already guarded by
test_gate.py:test_import_pipeline_does_not_import_gate_modules (it covers every
pipeline.gate.* incl. editorial); no new guard duplicated here.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from pipeline.gate.editorial import EDITORIAL_VERDICTS, check_editorial

_REPO_ROOT = Path(__file__).resolve().parents[2]

_PUBLISHABLE = '{"verdict": "publishable", "issues": [], "reason": "earns its length"}'
_THIN = ('{"verdict": "thin", "issues": [{"dimension": "non_obviousness", '
         '"note": "obvious angle"}], "reason": "says nothing non-obvious"}')


def _cli(run_dir: Path) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.gate.editorial", "--run-dir", str(run_dir)],
        capture_output=True, text=True, env=env,
    )


def _write_editorial(tmp_path: Path, text: str) -> Path:
    d = tmp_path / "plans" / "task-draft"
    d.mkdir(parents=True, exist_ok=True)
    (d / "editorial.json").write_text(text, encoding="utf-8")
    return tmp_path


# --- pure combiner -------------------------------------------------------------
def test_check_editorial_publishable_is_clean():
    assert check_editorial(_PUBLISHABLE) == []


def test_check_editorial_thin_names_verdict_and_dimension():
    problems = check_editorial(_THIN)
    assert any("editorial verdict is" in p and "thin" in p for p in problems)
    assert any("non_obviousness" in p for p in problems)  # issue enumerated


def test_check_editorial_unparseable_is_fail_closed():
    assert check_editorial('{"verdict": "bogus"}')        # not in EDITORIAL_VERDICTS
    assert check_editorial("{not json")
    assert "publishable" in EDITORIAL_VERDICTS and "thin" in EDITORIAL_VERDICTS


# --- CLI (the 3 block paths the task names) ------------------------------------
def test_editorial_gate_passes_on_publishable(tmp_path):
    ok = _cli(_write_editorial(tmp_path, _PUBLISHABLE))
    assert ok.returncode == 0, ok.stdout + ok.stderr
    assert "OK" in ok.stdout


def test_editorial_gate_blocks_on_thin(tmp_path):
    bad = _cli(_write_editorial(tmp_path, _THIN))
    assert bad.returncode == 1
    assert "editorial verdict is" in bad.stdout and "thin" in bad.stdout


def test_editorial_gate_blocks_on_missing(tmp_path):
    (tmp_path / "plans" / "task-draft").mkdir(parents=True)  # no editorial.json
    miss = _cli(tmp_path)
    assert miss.returncode == 1
    assert "missing editorial.json" in miss.stdout


def test_editorial_gate_blocks_on_unparseable(tmp_path):
    bad = _cli(_write_editorial(tmp_path, '{"verdict": "bogus"}'))
    assert bad.returncode == 1
    assert "invalid editorial findings" in bad.stdout

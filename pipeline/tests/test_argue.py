"""Offline tests for task 3: the G1 argument-rigor gate + prompt + composition binding.

Deterministic MECHANISM only (mirrors test_gate.py) -- no live LLM / sub-agent, no
network, no secret. The verdict PARSER is already proven in test_judge_substrate.py (with
_ARG_VERDICTS); here we prove the GATE WIRING (the argument verdict vocabulary +
pass_verdict='defensible' + the 3 block paths) end-to-end via subprocess, the prompt's
determinism/ASCII/substrings, and that editorial_stage_descriptions binds the 'argue' key.

Import-light is already guarded by test_gate.py:test_import_pipeline_does_not_import_gate_modules
(it covers pipeline.gate.argument + pipeline.gate.judge); if build_argue_prompt regresses to
a module-top judge import, that test fails. No new guard duplicated here.
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from pipeline import PipelineConfig, build_argue_prompt, editorial_stage_descriptions

_REPO_ROOT = Path(__file__).resolve().parents[2]
_ABS_REPO = Path("/abs/repo")
_ABS_RUN = Path("/abs/repo/pipeline/runs/run-1")


def _cli(run_dir: Path) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.gate.argument", "--run-dir", str(run_dir)],
        capture_output=True, text=True, env=env,
    )


def _write_argument(tmp_path: Path, text: str) -> Path:
    d = tmp_path / "plans" / "task-argue"
    d.mkdir(parents=True, exist_ok=True)
    (d / "argument.json").write_text(text, encoding="utf-8")
    return tmp_path


_DEFENSIBLE = '{"verdict": "defensible", "reason": "survives the attack"}'
_WEAK = '{"verdict": "weak", "reason": "unfalsifiable / says nothing non-obvious"}'


def test_argument_gate_passes_on_defensible(tmp_path):
    rd = _write_argument(tmp_path, _DEFENSIBLE)
    ok = _cli(rd)
    assert ok.returncode == 0, ok.stdout + ok.stderr
    assert "OK" in ok.stdout


def test_argument_gate_blocks_on_weak(tmp_path):
    rd = _write_argument(tmp_path, _WEAK)
    bad = _cli(rd)
    assert bad.returncode == 1
    assert "argument verdict is" in bad.stdout and "weak" in bad.stdout


def test_argument_gate_blocks_on_missing(tmp_path):
    (tmp_path / "plans").mkdir(parents=True)  # no task-argue/argument.json
    miss = _cli(tmp_path)
    assert miss.returncode == 1
    assert "missing argument.json" in miss.stdout


def test_argument_gate_blocks_on_unparseable(tmp_path):
    rd = _write_argument(tmp_path, '{"verdict": "bogus"}')  # not in ARGUMENT_VERDICTS
    bad = _cli(rd)
    assert bad.returncode == 1
    assert "invalid argument findings" in bad.stdout


def test_argue_prompt_deterministic_and_ascii():
    p1 = build_argue_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    p2 = build_argue_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    assert p1 == p2
    assert p1.isascii()  # D-007: no emoji in the prompt itself


def test_argue_prompt_substrings():
    p = build_argue_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    # Flatten first: build_judge_dispatch wraps some phrases across a newline + indent
    # (judge.py:171-172 emits "...you do NOT\n     override its verdict"), so assert against
    # the whitespace-collapsed copy -- mirrors test_judge_substrate.py:266-277. The absolute
    # paths and PYTHONPATH=/abs/repo needles carry no internal whitespace, so flattening leaves
    # them intact; it also immunizes every dispatch-derived needle against future line-wrap drift.
    flat = " ".join(p.split())
    for needle in [
        "/abs/repo/pipeline/runs/run-1/plans/task-select/brief.md",
        "/abs/repo/pipeline/runs/run-1/plans/task-argue/argument.json",
        "STEELMAN", "STRONGEST ATTACK", "RECONCILE",
        "strengthened_argument",                 # in the verdict schema
        '"verdict": "defensible"',               # the verdict vocabulary
        "THESIS AS A CLAIM",                     # mandate boundary (G1 != G3)
        "not this one",                          # craft is the editorial gate's job
        "FRESH general-purpose sub-agent",       # judge != author (from build_judge_dispatch)
        "do NOT override its verdict",           # spans a newline in dispatch -> needs the flatten
        "PYTHONPATH=/abs/repo",
        "python3 -m pipeline.gate.argument",
    ]:
        assert needle in flat, f"argue prompt missing {needle!r}"


def test_editorial_descriptions_binds_argue():
    config = PipelineConfig(repo_root=_ABS_REPO)
    descriptions = editorial_stage_descriptions(config, _ABS_RUN)
    assert descriptions["argue"] == build_argue_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)

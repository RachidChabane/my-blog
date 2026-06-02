"""Offline unit tests for the content-engine harness (task 23).

Every test runs offline: the FAKE driver (cpe's real ``state.State``, no
claude/tmux/network) or a monkeypatched ``subprocess.run``. No secrets.

Scope note (review #3 / plan §6 risk 1): these tests prove the driver's
argv/env shape (B1-B2), the exit-code mapping (B3), and that the FAKE writes the
USAGE_LIMIT sentinel at the path the real loop wrapper expects (C1). They do NOT
prove that the live ``claude-plan-execute-loop`` consumes that sentinel and
auto-resumes — that path is only exercisable in a real tmux run. Correct
test-scoping, not a gap.
"""
from __future__ import annotations

import dataclasses
import json
import shutil
import types
from pathlib import Path

import pytest
import yaml

from pipeline import (
    CpeLoopDriver,
    FakeClaudeDriver,
    PipelineConfig,
    assemble_slate,
    discover_cpe_home,
    discover_loop_bin,
    ensure_cpe_importable,
    run,
    runner,
)
from pipeline import config as cfgmod

_TEMPLATE = Path(__file__).resolve().parents[1] / "tasks-template.yaml"
_SPINE = ["research", "select", "draft", "publish"]


@pytest.fixture
def config(tmp_path):
    """A PipelineConfig over an isolated temp repo with the real template copied in."""
    repo = tmp_path / "repo"
    (repo / "pipeline").mkdir(parents=True)
    shutil.copy(_TEMPLATE, repo / "pipeline" / "tasks-template.yaml")
    return PipelineConfig(repo_root=repo, runs_root=repo / "pipeline" / "runs")


@pytest.fixture
def driver_config(config):
    """config with a stub loop_bin so the production driver builds an argv."""
    return dataclasses.replace(
        config, loop_bin="/usr/local/bin/claude-plan-execute-loop"
    )


def _read_tasks(slate):
    return yaml.safe_load(slate.tasks_path.read_text())


def _by_id(raw):
    return {t["id"]: t for t in raw["tasks"]}


def _capture_subprocess(monkeypatch, *, returncode=0):
    captured = {}

    def fake_run(argv, cwd=None, env=None):
        captured["argv"] = list(argv)
        captured["cwd"] = cwd
        captured["env"] = env
        return types.SimpleNamespace(returncode=returncode)

    monkeypatch.setattr(runner.subprocess, "run", fake_run)
    return captured


# ---------------------------------------------------------------------------
# A. Slate assembly (structural invariants — robust to tasks 24-27)
# ---------------------------------------------------------------------------


def test_template_validates_as_cpe_v2(config):
    raw = yaml.safe_load(config.template_path.read_text())
    tf = runner.validate_slate(raw)
    assert raw["version"] == 2
    assert tf.version == 2


def test_assembled_file_loads_with_zero_warnings(config, capsys):
    slate = assemble_slate("run-a2", config)
    ensure_cpe_importable()
    from claude_plan_execute import loader

    loader.load_tasks_file(slate.tasks_path)
    captured = capsys.readouterr()
    assert "Warning:" not in captured.out
    assert "Warning:" not in captured.err


def test_assemble_creates_isolated_run_dir(config):
    slate = assemble_slate("run-a3", config)
    assert slate.run_dir == config.runs_root / "run-a3"
    assert slate.tasks_path.is_file()
    assert (slate.plans_dir / "state.json").is_file()
    # nothing leaks into repo_root/plans (the build slate's dir)
    assert not (config.repo_root / "plans").exists()


def test_spine_present_and_acyclic(config):
    slate = assemble_slate("run-a4", config)
    raw = _read_tasks(slate)
    ensure_cpe_importable()
    from claude_plan_execute import deps

    order = [str(t["id"]) for t in deps.validate_dependencies(raw["tasks"])]
    for tid in _SPINE:
        assert tid in order
    assert len(order) == len(raw["tasks"])  # acyclic: every task ordered
    by_id = _by_id(raw)
    assert by_id["select"]["depends_on"] == ["research"]
    assert by_id["draft"]["depends_on"] == ["select"]
    assert by_id["publish"]["depends_on"] == ["draft"]


def test_publish_is_bilingual_gated(config):
    slate = assemble_slate("run-a5", config)
    raw = _read_tasks(slate)
    # a blocked draft => publish unreachable (bilingual-or-nothing, NFR-11)
    assert _by_id(raw)["publish"]["depends_on"] == ["draft"]
    # the M-4 gate seam is present on the draft phase
    assert raw["defaults"]["caps"]["max_gate_repair_rounds"] == config.max_gate_repair_rounds
    assert raw["defaults"]["invariants_file"]  # default present (task 26 authors)


def test_backend_is_tmux_and_caps_set(config):
    slate = assemble_slate("run-a6", config)
    raw = _read_tasks(slate)
    assert raw["defaults"]["claude_backend"] == "tmux"
    caps = raw["defaults"]["caps"]
    assert caps["max_review_rounds"] == config.max_review_rounds
    assert caps["max_gate_repair_rounds"] == config.max_gate_repair_rounds


def test_assemble_seeds_sticky_slate_id(config):
    slate = assemble_slate("run-a7", config)
    data = json.loads((slate.plans_dir / "state.json").read_text())
    assert data["slate_id"] == "run-a7"
    assert slate.slate_id == "run-a7"


def test_assemble_is_deterministic(config):
    # run_id is seeded only into state.json (slate_id), never into tasks.yaml,
    # so the assembled tasks.yaml is byte-identical across distinct run ids.
    a = assemble_slate("run-a8a", config)
    b = assemble_slate("run-a8b", config)
    assert a.tasks_path.read_text() == b.tasks_path.read_text()


def test_assemble_refuses_overwrite_without_flag(config):
    assemble_slate("run-a9", config)
    with pytest.raises(FileExistsError):
        assemble_slate("run-a9", config)
    # overwrite=True re-assembles in place
    assemble_slate("run-a9", config, overwrite=True)


def test_stage_descriptions_injection(config):
    slate = assemble_slate("run-a10", config, stage_descriptions={"research": "X"})
    by_id = _by_id(_read_tasks(slate))
    assert by_id["research"]["description"] == "X"
    assert by_id["select"]["description"] != "X"  # untouched placeholder


# ---------------------------------------------------------------------------
# B. Production driver — CpeLoopDriver (M-6 + NFR-8)
# ---------------------------------------------------------------------------


def test_driver_invokes_loop_wrapper(driver_config, monkeypatch):
    captured = _capture_subprocess(monkeypatch)
    slate = assemble_slate("run-b1", driver_config)
    CpeLoopDriver(driver_config).run_slate(slate, resume=False)
    assert captured["argv"][0].endswith("claude-plan-execute-loop")


def test_driver_passes_interactive_and_paths(driver_config, monkeypatch):
    captured = _capture_subprocess(monkeypatch)
    slate = assemble_slate("run-b2", driver_config)
    CpeLoopDriver(driver_config).run_slate(slate, resume=False)
    argv = captured["argv"]
    assert "--interactive" in argv
    assert "--skip-permissions" in argv
    dir_arg = Path(argv[argv.index("--dir") + 1])
    tasks_arg = Path(argv[argv.index("--tasks") + 1])
    assert dir_arg.is_absolute() and dir_arg == slate.run_dir.resolve()
    assert tasks_arg.is_absolute() and tasks_arg == slate.tasks_path.resolve()
    assert captured["cwd"] == str(driver_config.repo_root)
    assert captured["env"]["CLAUDE_PLAN_EXECUTE_BACKEND"] == "tmux"


@pytest.mark.parametrize(
    "code,complete,usage",
    [(0, True, False), (75, False, True), (1, False, False)],
)
def test_driver_maps_exit_codes(driver_config, monkeypatch, code, complete, usage):
    monkeypatch.setattr(
        runner.subprocess, "run",
        lambda *a, **k: types.SimpleNamespace(returncode=code),
    )
    slate = assemble_slate(f"run-b3-{code}", driver_config)
    res = CpeLoopDriver(driver_config).run_slate(slate, resume=False)
    assert res.exit_code == code
    assert res.complete is complete
    assert res.usage_limited is usage


def test_driver_resume_uses_same_tasks(driver_config, monkeypatch):
    captured = _capture_subprocess(monkeypatch)
    slate = assemble_slate("run-b4", driver_config)
    drv = CpeLoopDriver(driver_config)
    drv.run_slate(slate, resume=False)
    argv_fresh = list(captured["argv"])
    drv.run_slate(slate, resume=True)
    argv_resume = list(captured["argv"])
    assert argv_fresh == argv_resume  # resume does not change argv
    tasks_arg = argv_resume[argv_resume.index("--tasks") + 1]
    assert Path(tasks_arg) == slate.tasks_path.resolve()


def test_driver_errors_without_loop_bin(config, monkeypatch):
    spawned = {"n": 0}
    monkeypatch.setattr(
        runner.subprocess, "run",
        lambda *a, **k: spawned.__setitem__("n", spawned["n"] + 1),
    )
    no_bin = dataclasses.replace(config, loop_bin=None)
    slate = assemble_slate("run-b5", no_bin)
    with pytest.raises(RuntimeError, match="claude-plan-execute-loop"):
        CpeLoopDriver(no_bin).run_slate(slate, resume=False)
    assert spawned["n"] == 0  # no subprocess spawned


# ---------------------------------------------------------------------------
# C. Resume (crash/restart via FAKE + real state.State)
# ---------------------------------------------------------------------------


def test_interrupt_then_resume_completes(config):
    rr = run(
        "run-c1", config,
        FakeClaudeDriver(config, interrupt_after="select"),
        resume=False,
    )
    assert not rr.result.complete
    assert rr.result.usage_limited
    assert (rr.slate.plans_dir / "USAGE_LIMIT").is_file()
    assert set(rr.plan.done) == {"research", "select"}
    assert rr.plan.next_task == "draft"
    assert not rr.plan.complete

    rr2 = run("run-c1", config, FakeClaudeDriver(config), resume=True)
    assert rr2.result.complete
    assert set(rr2.plan.done) == set(_SPINE)
    assert rr2.plan.complete


def test_resume_reads_cpe_state_shape(config):
    rr = run(
        "run-c2", config,
        FakeClaudeDriver(config, interrupt_after="research"),
        resume=False,
    )
    data = json.loads((rr.slate.plans_dir / "state.json").read_text())
    # parity with cpe's on-disk shape, not fiction
    assert "schema_version" in data
    assert "tasks" in data
    assert data["slate_id"] == "run-c2"
    assert "research" in rr.plan.done


def test_resume_never_reassembles(config, monkeypatch):
    assemble_slate("run-c3", config)  # pre-assemble before patching

    def boom(*a, **k):
        raise AssertionError("assemble_slate must not run on resume")

    monkeypatch.setattr(runner, "assemble_slate", boom)
    rr = run("run-c3", config, FakeClaudeDriver(config), resume=True)
    assert rr.result.complete


def test_in_flight_detection(config):
    rr = run(
        "run-c4", config,
        FakeClaudeDriver(config, interrupt_after="select", leave_in_flight=True),
        resume=False,
    )
    assert rr.plan.in_flight == "select"      # mid-implement, status=implementing
    assert rr.plan.next_task == "select"      # re-drive the in-flight stage
    assert "select" not in rr.plan.done


def test_bilingual_or_nothing_blocked_draft(config):
    rr = run(
        "run-c5", config,
        FakeClaudeDriver(config, block_task="draft"),
        resume=False,
    )
    assert "draft" in rr.plan.blocked
    assert not rr.plan.complete
    assert rr.plan.next_task != "publish"
    assert "publish" not in rr.plan.done
    assert not (rr.slate.plans_dir / "task-publish").exists()


# ---------------------------------------------------------------------------
# D. Config
# ---------------------------------------------------------------------------


def test_from_env_defaults(tmp_path, monkeypatch):
    monkeypatch.delenv(cfgmod.CPE_BACKEND_ENV, raising=False)
    cfg = PipelineConfig.from_env(repo_root=tmp_path)
    assert cfg.claude_backend == "tmux"
    assert cfg.max_review_rounds == 2          # OQ-14b
    assert cfg.max_gate_repair_rounds == 1     # OQ-14b
    assert cfg.fallback_topic_attempts == 2    # OQ-14a
    assert cfg.runs_root == tmp_path / "pipeline" / "runs"
    assert cfg.template_path == tmp_path / "pipeline" / "tasks-template.yaml"


def test_discover_loop_bin_and_cpe_home(monkeypatch):
    monkeypatch.delenv(cfgmod.CPE_LOOP_ENV, raising=False)
    monkeypatch.delenv(cfgmod.CPE_HOME_ENV, raising=False)
    loop = discover_loop_bin()
    home = discover_cpe_home()
    if loop is None or home is None:
        pytest.skip("cpe console scripts not on PATH; discovery untestable here")
    assert loop.endswith("claude-plan-execute-loop")
    assert (home / "src" / "claude_plan_execute" / "__init__.py").is_file()


def test_env_overrides(tmp_path, monkeypatch):
    monkeypatch.setenv(cfgmod.CPE_BACKEND_ENV, "print")
    monkeypatch.setenv(cfgmod.CPE_LOOP_ENV, "/custom/claude-plan-execute-loop")
    monkeypatch.setenv(cfgmod.CPE_HOME_ENV, str(tmp_path / "cpe"))
    assert discover_loop_bin() == "/custom/claude-plan-execute-loop"
    assert discover_cpe_home() == tmp_path / "cpe"
    cfg = PipelineConfig.from_env(repo_root=tmp_path)
    assert cfg.claude_backend == "print"
    assert cfg.loop_bin == "/custom/claude-plan-execute-loop"
    assert cfg.cpe_home == tmp_path / "cpe"

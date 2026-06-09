"""Offline tests for task 26: the M-4 quality gate + terminal-failure fallback + wiring.

Every test runs offline with on-disk fixtures: no live LLM / fact-check or style
sub-agent, no network, no secret. They lock the gate MECHANISM deterministically --
structural provenance + the findings PARSER (fact-check), body-citation consistency +
dead-link via the FakeLinkChecker (grounding), no-emoji + style 'clean' re-check (style),
and the fallback decision / brief-rewrite / state-reset / skip+alert (fallback). The
``factcheck-{lang}.json`` / ``style_findings.*`` fixtures stand in for a real sub-agent
run, exactly as ``test_draft_review.py`` describes; semantic entailment and real link
reachability are the live/post-secret nets, not exercised here.

Import convention [MEM: pipeline-stages-import-light-runpy]: gate symbols are imported
DIRECTLY from ``pipeline.gate.{factcheck,grounding,style,fallback}`` -- never via
``import pipeline`` (a no-runpy + sys.modules regression guard below locks that).
"""
from __future__ import annotations

import io
import json
import os
import shutil
import subprocess
import sys
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

import pytest
import yaml

from pipeline import (
    FakeClaudeDriver,
    PipelineConfig,
    assemble_slate,
    run,
)
from pipeline.config import ensure_cpe_importable
from pipeline.contracts.claim_source_map import ClaimSourceMap, ContractError
from pipeline.gate.factcheck import (
    factcheck_passes,
    parse_factcheck_findings,
    verify_provenance,
)
from pipeline.gate.fallback import (
    apply_fallback,
    decide_fallback,
    rewrite_brief_for_fallback,
    write_alert,
)
from pipeline.gate.grounding import FakeLinkChecker, check_grounding
from pipeline.gate.style import check_style
from pipeline.stages.research import CandidatesDoc
from pipeline.stages.review import review_claim_source_map
from pipeline.stages.select import parse_brief, validate_brief

_FIXTURES = Path(__file__).resolve().parent / "fixtures"
_PIPELINE_DIR = Path(__file__).resolve().parents[1]
_REPO_ROOT = Path(__file__).resolve().parents[2]

_DRAFT_GATE_NAMES = [
    "factcheck-fr",
    "factcheck-en",
    "grounding-fr",
    "grounding-en",
    "style-fr",
    "style-en",
    "editorial-quality",  # task 4: G3, a draft gate -> precedes the argue gate in load order
]
_ARGUE_GATE_NAMES = ["argument-rigor"]
_ALL_GATE_NAMES = _DRAFT_GATE_NAMES + _ARGUE_GATE_NAMES  # invariants.yaml load order
_S1_URL = "https://arxiv.example/abs/agentic-harness"  # source s1 in the complete map


def _fixture_text(name: str) -> str:
    return (_FIXTURES / name).read_text(encoding="utf-8")


def _complete_dict() -> dict:
    return json.loads(_fixture_text("claim_source_map.complete.json"))


def _complete_map() -> ClaimSourceMap:
    return ClaimSourceMap.load_path(_FIXTURES / "claim_source_map.complete.json")


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", *args], capture_output=True, text=True, env=env
    )


def _make_draft_run(tmp_path: Path, files: dict[str, str]) -> Path:
    """Write ``files`` (name -> text) under ``tmp_path/plans/task-draft``; return tmp_path
    as the run-dir (the gate CLIs take ``--run-dir``)."""
    draft = tmp_path / "plans" / "task-draft"
    draft.mkdir(parents=True, exist_ok=True)
    for name, text in files.items():
        (draft / name).write_text(text, encoding="utf-8")
    return tmp_path


@pytest.fixture
def config(tmp_path):
    """A PipelineConfig over an isolated temp repo with the real template + the files its
    defaults point at (house_style.md, invariants.yaml) copied in."""
    repo = tmp_path / "repo"
    (repo / "pipeline").mkdir(parents=True)
    for name in ("tasks-template.yaml", "house_style.md", "invariants.yaml"):
        shutil.copy(_PIPELINE_DIR / name, repo / "pipeline" / name)
    return PipelineConfig(repo_root=repo, runs_root=repo / "pipeline" / "runs")


# ---------------------------------------------------------------------------
# Fact-check — factcheck.py (FR-C1)
# ---------------------------------------------------------------------------


def test_verify_provenance_complete_map_clean():
    csm = _complete_map()
    assert verify_provenance(csm, "en") == []
    assert verify_provenance(csm, "fr") == []


def test_verify_provenance_orphan_source_id_is_structural():
    data = _complete_dict()
    data["claims"][0]["source_id"] = "ghost"  # references no source
    problems = verify_provenance(ClaimSourceMap.from_dict(data), "en")
    assert any("structural" in p for p in problems)


def test_verify_provenance_whitespace_span():
    # craft a source whose [start:end] slice is all spaces (a degenerate span pins
    # nothing) while still satisfying csm.validate()'s bounds (0 <= 2 < 5 <= 7).
    data = {
        "claims": [
            {"lang": "en", "claim": "X", "source_id": "s1",
             "excerpt_span": {"start": 2, "end": 5}}
        ],
        "sources": [
            {"source_id": "s1", "label": "L", "url": "https://e.example/1",
             "retrieved_at": "2026-01-01", "excerpt": "ab   cd"}
        ],
    }
    problems = verify_provenance(ClaimSourceMap.from_dict(data), "en")
    assert any("whitespace" in p for p in problems)


def test_verify_provenance_empty_language():
    data = _complete_dict()
    data["claims"] = [c for c in data["claims"] if c["lang"] != "en"]
    problems = verify_provenance(ClaimSourceMap.from_dict(data), "en")
    assert any("no load-bearing claims" in p for p in problems)


def test_parse_factcheck_supported_passes():
    report = parse_factcheck_findings(_fixture_text("factcheck.supported.json"))
    assert factcheck_passes(report) is True
    assert all(c.supported for c in report.claims)


def test_parse_factcheck_unsupported_fails_and_names_claim():
    report = parse_factcheck_findings(_fixture_text("factcheck.unsupported.json"))
    assert factcheck_passes(report) is False
    failing = [c for c in report.claims if not c.supported]
    assert failing and failing[0].source_id == "s2"
    assert failing[0].reason  # carries a reason


def test_parse_factcheck_bad_inputs_raise():
    with pytest.raises(ContractError):
        parse_factcheck_findings("{not valid json")
    with pytest.raises(ContractError):
        parse_factcheck_findings({"verdict": "bogus", "claims": []})
    with pytest.raises(ContractError):
        parse_factcheck_findings({"claims": []})  # missing verdict
    with pytest.raises(ContractError):
        # a claim that forgot 'supported' must be rejected (else it reads as supported)
        parse_factcheck_findings(
            {"verdict": "supported", "claims": [{"claim": "x", "source_id": "s1"}]}
        )
    with pytest.raises(ContractError):
        parse_factcheck_findings({"verdict": "supported", "claims": "nope"})


def test_factcheck_cli(tmp_path):
    complete = _fixture_text("claim_source_map.complete.json")
    run_dir = _make_draft_run(
        tmp_path,
        {
            "claim_source_map.json": complete,
            "factcheck-fr.json": _fixture_text("factcheck.supported.json"),
            "factcheck-en.json": _fixture_text("factcheck.supported.json"),
        },
    )
    for lang in ("fr", "en"):
        ok = _cli(["pipeline.gate.factcheck", "--run-dir", str(run_dir), "--lang", lang])
        assert ok.returncode == 0, ok.stdout + ok.stderr
        assert "OK" in ok.stdout

    # an unsupported finding blocks and names the claim
    (run_dir / "plans" / "task-draft" / "factcheck-en.json").write_text(
        _fixture_text("factcheck.unsupported.json"), encoding="utf-8"
    )
    bad = _cli(["pipeline.gate.factcheck", "--run-dir", str(run_dir), "--lang", "en"])
    assert bad.returncode == 1
    assert "UNSUPPORTED" in bad.stdout and "s2" in bad.stdout

    # a missing findings file blocks (the fact-check pass must have run)
    (run_dir / "plans" / "task-draft" / "factcheck-en.json").unlink()
    missing = _cli(["pipeline.gate.factcheck", "--run-dir", str(run_dir), "--lang", "en"])
    assert missing.returncode == 1
    assert "missing fact-check findings" in missing.stdout


# ---------------------------------------------------------------------------
# Grounding — grounding.py (FR-C2)
# ---------------------------------------------------------------------------


def test_fake_link_checker():
    checker = FakeLinkChecker(frozenset({"https://dead.example"}))
    assert checker.reachable("https://live.example") is True
    assert checker.reachable("https://dead.example") is False


def test_check_grounding_clean():
    csm = _complete_map()
    for lang in ("fr", "en"):
        body = _fixture_text(f"draft-{lang}.valid.md")
        assert check_grounding(csm, body, lang, FakeLinkChecker()) == []


def test_check_grounding_dead_link():
    csm = _complete_map()
    body = _fixture_text("draft-en.valid.md")
    problems = check_grounding(csm, body, "en", FakeLinkChecker(frozenset({_S1_URL})))
    assert any("dead link" in p and _S1_URL in p for p in problems)


def test_check_grounding_uncited_claim():
    csm = _complete_map()
    body = _fixture_text("draft-en.valid.md").replace("[s2]", "")  # drop the s2 citation
    problems = check_grounding(csm, body, "en", FakeLinkChecker())
    assert any("uncited load-bearing claim" in p and "s2" in p for p in problems)


def test_check_grounding_dangling_citation():
    csm = _complete_map()
    body = _fixture_text("draft-en.valid.md") + "\nA stray citation [s9].\n"
    problems = check_grounding(csm, body, "en", FakeLinkChecker())
    assert any("dangling citation [s9]" in p for p in problems)


def test_grounding_cli(tmp_path):
    run_dir = _make_draft_run(
        tmp_path,
        {
            "claim_source_map.json": _fixture_text("claim_source_map.complete.json"),
            "draft-en.md": _fixture_text("draft-en.valid.md"),
        },
    )
    ok = _cli(["pipeline.gate.grounding", "--run-dir", str(run_dir), "--lang", "en"])
    assert ok.returncode == 0, ok.stdout + ok.stderr

    dead = _cli(
        ["pipeline.gate.grounding", "--run-dir", str(run_dir), "--lang", "en",
         "--dead-urls", _S1_URL]
    )
    assert dead.returncode == 1
    assert "dead link" in dead.stdout

    real = _cli(
        ["pipeline.gate.grounding", "--run-dir", str(run_dir), "--lang", "en",
         "--link-check", "real"]
    )
    assert real.returncode == 1
    assert "real link checker" in real.stderr  # NotImplementedError surfaced


# ---------------------------------------------------------------------------
# Style — style.py (FR-C3)
# ---------------------------------------------------------------------------


def test_check_style_clean():
    body = _fixture_text("draft-en.valid.md")
    findings = _fixture_text("style_findings.clean.json")
    assert check_style(body, findings, "en") == []


def test_check_style_emoji():
    findings = _fixture_text("style_findings.clean.json")
    problems = check_style("A body with an emoji \U0001F680 in it.", findings, "en")
    assert any("emoji" in p.lower() for p in problems)


def test_check_style_revision_needed():
    body = _fixture_text("draft-en.valid.md")
    findings = _fixture_text("style_findings.revision_needed.json")
    problems = check_style(body, findings, "en")
    assert any("style verdict is" in p for p in problems)
    # each flagged issue is enumerated as a [pattern] phrase line
    assert any(p.strip().startswith("[") for p in problems)


def test_style_cli(tmp_path):
    clean_body = _fixture_text("draft-en.valid.md")
    clean_style = _fixture_text("style_findings.clean.json")
    run_dir = _make_draft_run(
        tmp_path, {"draft-en.md": clean_body, "style-en.json": clean_style}
    )
    ok = _cli(["pipeline.gate.style", "--run-dir", str(run_dir), "--lang", "en"])
    assert ok.returncode == 0, ok.stdout + ok.stderr

    # an emoji in the body blocks
    (run_dir / "plans" / "task-draft" / "draft-en.md").write_text(
        "Body with \U0001F680 emoji.\n", encoding="utf-8"
    )
    emoji = _cli(["pipeline.gate.style", "--run-dir", str(run_dir), "--lang", "en"])
    assert emoji.returncode == 1

    # a non-clean style verdict blocks
    _make_draft_run(
        run_dir,
        {"draft-en.md": clean_body,
         "style-en.json": _fixture_text("style_findings.revision_needed.json")},
    )
    rev = _cli(["pipeline.gate.style", "--run-dir", str(run_dir), "--lang", "en"])
    assert rev.returncode == 1

    # a missing style findings file blocks
    (run_dir / "plans" / "task-draft" / "style-en.json").unlink()
    missing = _cli(["pipeline.gate.style", "--run-dir", str(run_dir), "--lang", "en"])
    assert missing.returncode == 1
    assert "missing style findings" in missing.stdout


# ---------------------------------------------------------------------------
# Fallback — fallback.py (OQ-14a terminal-failure / cadence)
# ---------------------------------------------------------------------------

_BRIEF_2FB = "---\nchosen_topic_id: t1\nfallback_topic_ids: [t2, t3]\n---\n\nbody\n"
_BRIEF_NOFB = "---\nchosen_topic_id: t1\nfallback_topic_ids: []\n---\n\nbody\n"


def test_decide_fallback_retry():
    d = decide_fallback(_BRIEF_2FB, attempts_used=0, max_attempts=2)
    assert d.action == "retry"
    assert d.topic_id == "t2"
    assert d.remaining == ["t3"]


def test_decide_fallback_exhausted_before_dry():
    # the attempt budget is checked first: exhausted skips even with a non-empty shortlist
    d = decide_fallback(_BRIEF_2FB, attempts_used=2, max_attempts=2)
    assert d.action == "skip"
    assert "exhausted" in d.reason


def test_decide_fallback_dry():
    d = decide_fallback(_BRIEF_NOFB, attempts_used=0, max_attempts=2)
    assert d.action == "skip"
    assert "dry" in d.reason


def test_rewrite_brief_for_fallback_is_consistent():
    doc = CandidatesDoc.load_path(_FIXTURES / "candidates.valid.json")
    candidate = next(c for c in doc.candidates if c.topic_id == "oss-llm-finetuning")
    candidate_ids = {c.topic_id for c in doc.candidates}
    rewritten = rewrite_brief_for_fallback(
        _fixture_text("brief.valid.md"), candidate, ["rrf-hybrid-retrieval"]
    )
    # internally consistent: validates, names the fallback topic, skeleton == its sources
    assert validate_brief(rewritten, candidate_ids=candidate_ids) == []
    meta = parse_brief(rewritten)
    assert meta.chosen_topic_id == "oss-llm-finetuning"
    assert meta.claim_skeleton[0]["source_ids"] == [s.source_id for s in candidate.sources]
    # D5 dead-end fixed: a draft covering those source ids reviews APPROVED (the complete
    # map covers s1+s2 in both languages, matching the candidate's sources)
    report = review_claim_source_map(rewritten, _complete_map())
    assert report.verdict == "APPROVED"


def test_write_alert(tmp_path):
    path = write_alert(tmp_path, reason="boom", blocked_task="draft", topic_id="t1")
    assert path == tmp_path / "plans" / "ALERT.json"
    assert json.loads(path.read_text(encoding="utf-8")) == {
        "kind": "terminal_failure",
        "blocked_task": "draft",
        "reason": "boom",
        "topic_id": "t1",
    }
    # FR-F2: an argue block names 'argue', not the old hardcoded 'draft'
    argue_path = write_alert(tmp_path, reason="weak thesis", blocked_task="argue")
    assert json.loads(argue_path.read_text(encoding="utf-8"))["blocked_task"] == "argue"


def _seed_state_blocked_draft(run_dir: Path) -> None:
    ensure_cpe_importable()
    from claude_plan_execute.state import State

    state = State(run_dir / "plans" / "state.json")
    state.set_status("draft", "blocked", block_reason="fake gate failure")


def test_apply_fallback_retry(tmp_path):
    cfg = PipelineConfig(repo_root=tmp_path / "repo")
    run_dir = tmp_path / "run"
    (run_dir / "plans" / "task-select").mkdir(parents=True)
    (run_dir / "plans" / "task-research").mkdir(parents=True)
    (run_dir / "plans" / "task-select" / "brief.md").write_text(
        _fixture_text("brief.valid.md"), encoding="utf-8"  # fallback -> oss-llm-finetuning
    )
    (run_dir / "plans" / "task-research" / "candidates.json").write_text(
        _fixture_text("candidates.valid.json"), encoding="utf-8"
    )
    stale = _make_draft_run(
        run_dir,
        {"claim_source_map.json": "{stale}", "editorial.json": '{"verdict":"thin"}'},
    )
    # a SURVIVING argument.json + a 'done' argue state from the KILLED topic: the re-driven
    # draft must NOT consume the killed topic's strengthened_argument (the bug task 3 fixes).
    argue_dir = run_dir / "plans" / "task-argue"
    argue_dir.mkdir(parents=True)
    (argue_dir / "argument.json").write_text(
        '{"verdict": "defensible", "reason": "stale (killed topic)"}', encoding="utf-8"
    )
    ensure_cpe_importable()
    from claude_plan_execute.state import State

    State(run_dir / "plans" / "state.json").set_status("argue", "done")
    _seed_state_blocked_draft(run_dir)

    decision = apply_fallback(run_dir, cfg, attempts_used=0, blocked_task="draft")
    assert decision.action == "retry"
    assert decision.topic_id == "oss-llm-finetuning"
    # brief rewritten for the fallback topic
    assert parse_brief(
        (run_dir / "plans" / "task-select" / "brief.md").read_text(encoding="utf-8")
    ).chosen_topic_id == "oss-llm-finetuning"
    # draft reset to pending; stale claim_source_map removed
    state = State(run_dir / "plans" / "state.json")
    assert state.get("draft")["status"] == "pending"
    assert not (stale / "plans" / "task-draft" / "claim_source_map.json").exists()
    # task 4: stale G3 editorial findings cleared too -- a re-draft must re-dispatch the judge
    assert not (run_dir / "plans" / "task-draft" / "editorial.json").exists()
    assert not (run_dir / "plans" / "ALERT.json").exists()
    # MUST-KEEP (review-1 C1): the SOLE guard for argue-reset-on-blocked-draft. Without the
    # _STALE_ARGUE_ARTIFACTS clear, a re-driven fallback draft silently consumes the KILLED
    # topic's strengthened_argument.
    assert state.get("argue")["status"] == "pending"           # argue reset for the new thesis
    assert not (argue_dir / "argument.json").exists()          # stale argue artifact cleared


def test_apply_fallback_dry_skips_and_alerts(tmp_path):
    cfg = PipelineConfig(repo_root=tmp_path / "repo")
    run_dir = tmp_path / "run"
    (run_dir / "plans" / "task-select").mkdir(parents=True)
    (run_dir / "plans" / "task-select" / "brief.md").write_text(
        _BRIEF_NOFB, encoding="utf-8"
    )
    _seed_state_blocked_draft(run_dir)

    decision = apply_fallback(run_dir, cfg, attempts_used=0, blocked_task="draft")
    assert decision.action == "skip"
    assert (run_dir / "plans" / "ALERT.json").is_file()
    payload = json.loads((run_dir / "plans" / "ALERT.json").read_text(encoding="utf-8"))
    assert payload["blocked_task"] == "draft"


# ---------------------------------------------------------------------------
# Runner integration — the fallback re-drive loop (harness mechanics only)
# ---------------------------------------------------------------------------


def test_run_fallback_retry_then_pass(config):
    rr = run(
        "run-fb1", config,
        FakeClaudeDriver(config, block_draft_attempts=1, seed_research_select=True),
    )
    assert rr.result.complete
    assert rr.fallback_attempts == 1
    assert not rr.alerted
    assert not (rr.slate.plans_dir / "ALERT.json").exists()


def test_run_fallback_dry_shortlist_skips_and_alerts(config):
    rr = run(
        "run-fb2", config,
        FakeClaudeDriver(
            config,
            block_draft_attempts=99,  # always blocks
            seed_research_select=True,
            seed_fallback_ids=("fallback-topic-1",),  # 1-entry shortlist -> goes dry
        ),
    )
    assert "draft" in rr.plan.blocked
    assert rr.alerted
    assert (rr.slate.plans_dir / "ALERT.json").is_file()
    assert "publish" not in rr.plan.done
    assert not (rr.slate.plans_dir / "task-publish").exists()


def test_run_fallback_attempts_exhausted_alerts(config):
    # a 2-entry shortlist with a permanently-blocking draft exhausts the attempt budget
    # (fallback_topic_attempts == 2) and hits the post-loop terminal alert.
    rr = run(
        "run-fb3", config,
        FakeClaudeDriver(
            config,
            block_draft_attempts=99,
            seed_research_select=True,
            seed_fallback_ids=("fallback-topic-1", "fallback-topic-2"),
        ),
    )
    assert "draft" in rr.plan.blocked
    assert rr.alerted
    assert rr.fallback_attempts == config.fallback_topic_attempts
    payload = json.loads((rr.slate.plans_dir / "ALERT.json").read_text(encoding="utf-8"))
    assert payload["kind"] == "terminal_failure"


def test_run_fallback_on_blocked_argue_retries_then_passes(config):
    # the section-7 cadence fires on a blocked ARGUE too (not only draft): block-then-pass
    rr = run(
        "run-fb-argue", config,
        FakeClaudeDriver(config, block_argue_attempts=1, seed_research_select=True),
    )
    assert rr.result.complete
    assert rr.fallback_attempts == 1
    assert not rr.alerted


def test_run_fallback_blocked_argue_dry_skip_names_argue(config):
    # a 1-entry shortlist goes dry on the 2nd reach; the SKIP-path ALERT must name `argue`
    rr = run(
        "run-fb-argue-dry", config,
        FakeClaudeDriver(
            config, block_argue_attempts=99, seed_research_select=True,
            seed_fallback_ids=("fallback-topic-1",),
        ),
    )
    assert "argue" in rr.plan.blocked
    assert rr.alerted
    payload = json.loads((rr.slate.plans_dir / "ALERT.json").read_text(encoding="utf-8"))
    assert payload["blocked_task"] == "argue"   # FR-F2 on the SKIP path


# ---------------------------------------------------------------------------
# Wiring / invariants — the gates load, compile, and resolve
# ---------------------------------------------------------------------------


def test_invariants_load_as_eight_blocking_shell_gates():
    ensure_cpe_importable()
    from claude_plan_execute.gates import GateRegistry
    from claude_plan_execute.gates.invariants import (
        load_invariants,
        register_invariants_on,
    )

    out, err = io.StringIO(), io.StringIO()
    with redirect_stdout(out), redirect_stderr(err):
        pairs = load_invariants(_PIPELINE_DIR / "invariants.yaml")
    # load order == _DRAFT_GATE_NAMES + _ARGUE_GATE_NAMES: the 6 M-4 + editorial-quality
    # (task 4, a draft gate) precede argument-rigor (task 3, the argue gate), appended LAST.
    assert [name for name, _ in pairs] == _ALL_GATE_NAMES
    assert all(gate.kind == "shell" for _, gate in pairs)
    assert all(gate.on_failure == "block" for _, gate in pairs)
    assert "Warning:" not in out.getvalue()
    assert "Warning:" not in err.getvalue()

    registry = GateRegistry()  # a LOCAL registry, not the singleton
    register_invariants_on(registry, pairs)
    resolved, unknown = registry.resolve(_ALL_GATE_NAMES)
    assert len(resolved) == 8
    assert unknown == []


def test_assembled_template_wires_gates_and_absolute_pointers(config):
    slate = assemble_slate("run-wire", config)
    raw = yaml.safe_load(slate.tasks_path.read_text())
    by_id = {t["id"]: t for t in raw["tasks"]}
    assert by_id["draft"]["gates_extra"] == _DRAFT_GATE_NAMES
    assert by_id["argue"]["gates_extra"] == _ARGUE_GATE_NAMES
    # the G1 gate is scoped to `argue`, NOT mis-scoped onto `select` (no editorial gate there)
    assert not by_id["select"].get("gates_extra")
    # gates are scoped to tasks ONLY (not added to defaults.gates) -- R7
    assert not raw["defaults"].get("gates")
    inv = raw["defaults"]["invariants_file"]
    assert Path(inv).is_absolute() and inv.endswith("pipeline/invariants.yaml")
    assert Path(raw["defaults"]["persona_file"]).is_absolute()


def test_gate_clis_have_no_runpy_double_import_warning():
    # mirror test_draft_review.py's stage guard for the gate CLIs: with
    # -W error::RuntimeWarning the runpy double-import warning becomes a nonzero exit, so
    # a future re-export of a gate CLI from pipeline/__init__.py would fail here.
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    for mod in ("factcheck", "grounding", "style", "argument", "editorial"):
        proc = subprocess.run(
            [sys.executable, "-W", "error::RuntimeWarning", "-m",
             f"pipeline.gate.{mod}", "--help"],
            capture_output=True, text=True, env=env,
        )
        assert proc.returncode == 0, f"{mod}: unexpected warning/error:\n{proc.stderr}"


def test_import_pipeline_does_not_import_gate_modules():
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    code = (
        "import pipeline, sys; "
        "bad = [m for m in sys.modules if m.startswith('pipeline.gate.')]; "
        "assert not bad, bad"
    )
    proc = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, env=env
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr

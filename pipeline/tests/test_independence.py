"""Offline tests for task 6: the G4 source-independence gate (mechanism only).

Deterministic MECHANISM (mirrors test_source_quality.py / test_gate.py's factcheck two-layer) -- no
live LLM / judge sub-agent, no network, no secret. The verdict PARSER (item_key=None) is proven in
test_judge_substrate.py; here we prove the GATE WIRING end-to-end via subprocess:
  - layer (a) the deterministic distinct-registrable-domain backstop BLOCKS a same-host pair;
  - layer (b) the judge BLOCKS a 'single_origin' fixture;
  - fail-closed: missing brief / missing independence.json / unparseable verdict all BLOCK;
plus the pure check_domain_independence / check_independence_findings / _registrable_domain helpers.

Import-light is guarded by test_gate.py:test_import_pipeline_does_not_import_gate_modules (covers
every pipeline.gate.* incl. independence); the runpy guard covers the CLI (test_gate.py loop).
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from pipeline.gate.independence import (
    INDEPENDENCE_VERDICTS,
    _registrable_domain,
    check_domain_independence,
    check_independence_findings,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]

# A valid CandidatesDoc; the chosen candidate's two sources sit on DISTINCT hosts (backstop passes).
_CANDIDATES_DISTINCT = (
    '{"schema_version": 1, "candidates": [{"topic_id": "t-ind", '
    '"dedup_key": "t ind", "title": "T", "summary": "S.", "why_relevant": "W.", '
    '"tags": ["x"], "sources": ['
    '{"source_id": "s1", "label": "A", "url": "https://alpha.example/a", '
    '"retrieved_at": "2026-02-01", "excerpt": "Alpha."}, '
    '{"source_id": "s2", "label": "B", "url": "https://beta.example/b", '
    '"retrieved_at": "2026-02-01", "excerpt": "Beta."}]}]}'
)
# Same chosen candidate but both sources on the SAME host (backstop must BLOCK).
_CANDIDATES_SAME_HOST = (
    '{"schema_version": 1, "candidates": [{"topic_id": "t-ind", '
    '"dedup_key": "t ind", "title": "T", "summary": "S.", "why_relevant": "W.", '
    '"tags": ["x"], "sources": ['
    '{"source_id": "s1", "label": "A", "url": "https://echo.example/a", '
    '"retrieved_at": "2026-02-01", "excerpt": "One."}, '
    '{"source_id": "s2", "label": "B", "url": "https://echo.example/b", '
    '"retrieved_at": "2026-02-01", "excerpt": "Two."}]}]}'
)
_BRIEF = (
    "---\nchosen_topic_id: t-ind\nfallback_topic_ids: []\n"
    "angle: A.\nclaim_skeleton:\n  - id: c1\n    statement: S.\n    source_ids: [s1, s2]\n---\n\n"
    "## Angle\n\nA.\n\n## Outline\n\n- p\n\n## Claim skeleton\n\n- c1 (s1, s2): S.\n\n"
    "## Fallback shortlist\n"
)
_INDEPENDENT = '{"verdict": "independent", "origins": ["alpha", "beta"], "reason": "two origins"}'
_SINGLE_ORIGIN = (
    '{"verdict": "single_origin", "origins": ["one wire report"], '
    '"reason": "both sources syndicate one release"}'
)


def _cli(run_dir: Path) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.gate.independence", "--run-dir", str(run_dir)],
        capture_output=True, text=True, env=env,
    )


def _seed(tmp_path: Path, *, candidates: str, brief: str = _BRIEF, findings: str | None) -> Path:
    """Write brief (task-select) + candidates (task-research) + optional independence.json
    (task-argue) -- the three dirs the cross-dir gate reads. Returns the run-dir."""
    (tmp_path / "plans" / "task-select").mkdir(parents=True, exist_ok=True)
    (tmp_path / "plans" / "task-research").mkdir(parents=True, exist_ok=True)
    (tmp_path / "plans" / "task-select" / "brief.md").write_text(brief, encoding="utf-8")
    cand_path = tmp_path / "plans" / "task-research" / "candidates.json"
    cand_path.write_text(candidates, encoding="utf-8")
    if findings is not None:
        d = tmp_path / "plans" / "task-argue"
        d.mkdir(parents=True, exist_ok=True)
        (d / "independence.json").write_text(findings, encoding="utf-8")
    return tmp_path


# --- pure helpers --------------------------------------------------------------
def test_registrable_domain_strips_www_and_collapses_subdomains():
    assert _registrable_domain("https://www.example.com/x") == "example.com"
    assert _registrable_domain("https://blog.example.com/x") == "example.com"
    assert _registrable_domain("https://bbc.co.uk/news") == "bbc.co.uk"   # second-level suffix
    assert _registrable_domain("https://arxiv.org/abs/1") == "arxiv.org"


def test_check_domain_independence_same_host_blocks():
    problems = check_domain_independence(["https://e.example/a", "https://e.example/b"])
    assert any("distinct registrable domain" in p for p in problems)


def test_check_domain_independence_distinct_domains_pass():
    assert check_domain_independence(["https://a.example/x", "https://b.example/y"]) == []


def test_check_independence_findings_single_origin_blocks():
    problems = check_independence_findings(_SINGLE_ORIGIN)
    assert any("source-independence verdict is" in p and "single_origin" in p for p in problems)


def test_check_independence_findings_independent_passes():
    assert check_independence_findings(_INDEPENDENT) == []


def test_check_independence_findings_unparseable_is_fail_closed():
    assert check_independence_findings('{"verdict": "bogus"}')      # not in vocab
    assert check_independence_findings("{not json")
    assert "independent" in INDEPENDENCE_VERDICTS and "single_origin" in INDEPENDENCE_VERDICTS


# --- CLI (both layers + the fail-closed paths) ---------------------------------
def test_gate_passes_on_independent_distinct_domains(tmp_path):
    ok = _cli(_seed(tmp_path, candidates=_CANDIDATES_DISTINCT, findings=_INDEPENDENT))
    assert ok.returncode == 0, ok.stdout + ok.stderr
    assert "OK" in ok.stdout


def test_gate_blocks_on_single_origin_judge(tmp_path):
    bad = _cli(_seed(tmp_path, candidates=_CANDIDATES_DISTINCT, findings=_SINGLE_ORIGIN))
    assert bad.returncode == 1
    assert "source-independence verdict is" in bad.stdout and "single_origin" in bad.stdout


def test_gate_blocks_on_same_host_backstop(tmp_path):
    # backstop BLOCKS even when the judge says 'independent' (the two layers are independent)
    bad = _cli(_seed(tmp_path, candidates=_CANDIDATES_SAME_HOST, findings=_INDEPENDENT))
    assert bad.returncode == 1
    assert "distinct registrable domain" in bad.stdout


def test_gate_blocks_on_missing_independence_json(tmp_path):
    miss = _cli(_seed(tmp_path, candidates=_CANDIDATES_DISTINCT, findings=None))
    assert miss.returncode == 1
    assert "missing independence.json" in miss.stdout


def test_gate_blocks_on_missing_brief(tmp_path):
    # no brief at all -> backstop cannot resolve the chosen topic (fail-closed)
    (tmp_path / "plans" / "task-argue").mkdir(parents=True)
    ind_path = tmp_path / "plans" / "task-argue" / "independence.json"
    ind_path.write_text(_INDEPENDENT, encoding="utf-8")
    miss = _cli(tmp_path)
    assert miss.returncode == 1
    assert "cannot read brief.md" in miss.stdout


def test_gate_blocks_on_unparseable_findings(tmp_path):
    bad = _cli(_seed(tmp_path, candidates=_CANDIDATES_DISTINCT, findings='{"verdict": "bogus"}'))
    assert bad.returncode == 1
    assert "invalid source-independence findings" in bad.stdout

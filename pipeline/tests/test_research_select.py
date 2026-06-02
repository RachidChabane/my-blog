"""Offline tests for task 24: claim->source contract, research/select stages, prompts.

Every test runs offline with FAKES + on-disk fixtures: no ``claude``, no network, no
secret. The ``FakeEmbedder`` measures literal TOKEN OVERLAP, not meaning, and is
MONOLINGUAL (mirror of ``src/lib/avatar/fakes.ts``). A green suite locks the
MECHANICS — dedup order, the threshold gate, parse/validate, the contract validators
— NOT retrieval quality or cross-language topic matching; the real value of
``DEDUP_SIMILARITY_THRESHOLD`` (OQ-8) and the real multilingual embedder are task 27.

Scope note: these tests prove the helpers, the contract validators, and that the
prompt strings carry the right instructions/paths. They do NOT prove a live ``claude``
agent follows the prompt — that path is only exercisable in a real tmux run.
"""
from __future__ import annotations

import copy
import json
import os
import subprocess
import sys
from dataclasses import MISSING, fields
from pathlib import Path

import pytest

from pipeline import build_research_prompt, build_select_prompt, editorial_stage_descriptions
from pipeline.config import PipelineConfig
from pipeline.contracts.claim_source_map import (
    Claim,
    ClaimSourceMap,
    ContractError,
    ExcerptSpan,
    SourceRecord,
)
from pipeline.contracts.embedder import PriorTopic, cosine, load_topic_memory
from pipeline.fakes import FakeEmbedder, FakeTopicMemory, tokenize
from pipeline.stages.research import CandidatesDoc, ResearchCandidate
from pipeline.stages.select import (
    DEDUP_SIMILARITY_THRESHOLD,
    DedupResult,
    Selection,
    choose_topic,
    parse_brief,
    semantic_dedup,
    validate_brief,
)

_FIXTURES = Path(__file__).resolve().parent / "fixtures"
_REPO_ROOT = Path(__file__).resolve().parents[2]
_CSM_SCHEMA = _REPO_ROOT / "pipeline" / "contracts" / "claim_source_map.schema.json"


def _fixture_text(name: str) -> str:
    return (_FIXTURES / name).read_text(encoding="utf-8")


def _csm_valid_dict() -> dict:
    return json.loads(_fixture_text("claim_source_map.valid.json"))


def _candidates_valid_dict() -> dict:
    return json.loads(_fixture_text("candidates.valid.json"))


def _required(cls) -> set[str]:
    return {f.name for f in fields(cls) if f.default is MISSING and f.default_factory is MISSING}


def _all_field_names(cls) -> set[str]:
    return {f.name for f in fields(cls)}


def _mk_source(i: int) -> SourceRecord:
    return SourceRecord(f"s{i}", f"L{i}", f"https://x.example/{i}", "2026-01-01", f"excerpt {i}")


def _mk_candidate(tid: str, key: str) -> ResearchCandidate:
    return ResearchCandidate(
        tid, key, "Title", "summary", "why", ["ai"], [_mk_source(1), _mk_source(2)]
    )


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", *args], capture_output=True, text=True, env=env
    )


# ---------------------------------------------------------------------------
# Contract — claim_source_map
# ---------------------------------------------------------------------------


def test_01_valid_map_roundtrips_and_validates():
    csm = ClaimSourceMap.from_dict(_csm_valid_dict())
    csm.validate()
    assert ClaimSourceMap.from_dict(csm.to_dict()).to_dict() == csm.to_dict()
    assert ClaimSourceMap.loads(csm.dumps()).to_dict() == csm.to_dict()


def test_02_orphan_claim_source_id_errors():
    data = _csm_valid_dict()
    data["claims"][0]["source_id"] = "does-not-exist"
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_03_duplicate_source_id_errors():
    data = _csm_valid_dict()
    data["sources"][1]["source_id"] = data["sources"][0]["source_id"]
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_04_bad_url_errors():
    data = _csm_valid_dict()
    data["sources"][0]["url"] = "ftp://not-http.example/x"
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_05_bad_retrieved_at_errors():
    data = _csm_valid_dict()
    data["sources"][0]["retrieved_at"] = "15/01/2026"
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_06_empty_excerpt_errors():
    data = _csm_valid_dict()
    data["sources"][0]["excerpt"] = "   "
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_07_excerpt_span_out_of_bounds_errors():
    data = _csm_valid_dict()
    excerpt_len = len(data["sources"][0]["excerpt"])
    data["claims"][0]["excerpt_span"] = {"start": 0, "end": excerpt_len + 5}
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()
    data["claims"][0]["excerpt_span"] = {"start": 5, "end": 5}  # start >= end
    with pytest.raises(ContractError):
        ClaimSourceMap.from_dict(data).validate()


def test_08_empty_map_is_valid():
    ClaimSourceMap.from_dict({"claims": [], "sources": []}).validate()


def test_09_schema_code_drift_guard_primary():
    """PRIMARY guard (runs everywhere): schema $defs.required + properties == dataclasses."""
    schema = json.loads(_CSM_SCHEMA.read_text(encoding="utf-8"))
    defs = schema["$defs"]
    assert set(schema["required"]) == _required(ClaimSourceMap)
    assert set(schema["properties"]) == _all_field_names(ClaimSourceMap)
    assert set(defs["excerptSpan"]["required"]) == _required(ExcerptSpan)
    assert set(defs["excerptSpan"]["properties"]) == _all_field_names(ExcerptSpan)
    assert set(defs["sourceRecord"]["required"]) == _required(SourceRecord)
    assert set(defs["sourceRecord"]["properties"]) == _all_field_names(SourceRecord)
    assert set(defs["claim"]["required"]) == _required(Claim)
    assert set(defs["claim"]["properties"]) == _all_field_names(Claim)


def test_09b_jsonschema_validates_fixture_bonus():
    """Bonus: validate the valid fixture against the JSON Schema (skips if absent)."""
    jsonschema = pytest.importorskip("jsonschema")
    schema = json.loads(_CSM_SCHEMA.read_text(encoding="utf-8"))
    jsonschema.validate(_csm_valid_dict(), schema)


def test_10_claims_for_filters_by_lang():
    csm = ClaimSourceMap.from_dict(_csm_valid_dict())
    assert len(csm.claims_for("en")) == 1
    assert len(csm.claims_for("fr")) == 1
    assert csm.claims_for("en")[0].lang == "en"
    assert csm.claims_for("de") == []


# ---------------------------------------------------------------------------
# Contract — candidates (research)
# ---------------------------------------------------------------------------


def test_11_valid_candidates_parse_validate_roundtrip():
    doc = CandidatesDoc.from_dict(_candidates_valid_dict())
    doc.validate()
    assert CandidatesDoc.from_dict(doc.to_dict()).to_dict() == doc.to_dict()
    assert CandidatesDoc.loads(doc.dumps()).to_dict() == doc.to_dict()


def test_12_candidate_with_fewer_than_two_sources_errors():
    data = _candidates_valid_dict()
    data["candidates"][0]["sources"] = data["candidates"][0]["sources"][:1]
    with pytest.raises(ContractError):
        CandidatesDoc.from_dict(data).validate()


def test_13_bad_source_inside_candidate_errors():
    data = _candidates_valid_dict()
    data["candidates"][0]["sources"][0]["url"] = "not-a-url"
    with pytest.raises(ContractError):
        CandidatesDoc.from_dict(data).validate()


def test_14_duplicate_topic_id_and_bad_schema_version_error():
    data = _candidates_valid_dict()
    data["candidates"][1]["topic_id"] = data["candidates"][0]["topic_id"]
    with pytest.raises(ContractError):
        CandidatesDoc.from_dict(data).validate()
    bad_version = _candidates_valid_dict()
    bad_version["schema_version"] = 2
    with pytest.raises(ContractError):
        CandidatesDoc.from_dict(bad_version).validate()


# ---------------------------------------------------------------------------
# Select — dedup / choose (threshold-robust fixtures)
# ---------------------------------------------------------------------------


def test_15_empty_prior_memory_no_duplicates():
    cands = [_mk_candidate("c1", "agentic coding harness"), _mk_candidate("c2", "rrf fusion")]
    results = semantic_dedup(cands, [], FakeEmbedder())
    assert all(not r.too_similar for r in results)
    assert all(r.max_similarity == 0.0 for r in results)
    assert all(r.nearest_prior_id is None for r in results)


@pytest.mark.parametrize("threshold", [0.2, 0.5, 0.82])
def test_16_identical_prior_flags_only_that_candidate(threshold):
    # Identical-text vs disjoint-vocab so the outcome holds for any threshold in (0.1, 1.0].
    cands = [
        _mk_candidate("c1", "kubernetes operator reconcile loop"),
        _mk_candidate("c2", "reciprocal rank fusion hybrid retrieval"),
    ]
    priors = [PriorTopic("p1", "reciprocal rank fusion hybrid retrieval")]
    results = semantic_dedup(cands, priors, FakeEmbedder(), threshold=threshold)
    assert results[1].too_similar
    assert results[1].max_similarity == pytest.approx(1.0)
    assert results[1].nearest_prior_id == "p1"
    assert not results[0].too_similar
    assert results[0].max_similarity == pytest.approx(0.0)


def test_17_choose_topic_picks_highest_ranked_non_dup():
    # #1 free -> chosen #1.
    free = [DedupResult(_mk_candidate("c1", "a"), 0.0, None, False),
            DedupResult(_mk_candidate("c2", "b"), 0.0, None, False)]
    sel = choose_topic(free)
    assert sel.chosen.candidate.topic_id == "c1"
    assert [r.candidate.topic_id for r in sel.fallback] == ["c2"]
    assert not sel.all_too_similar
    # #1 dup, #2 free -> chosen #2.
    mixed = [DedupResult(_mk_candidate("c1", "a"), 0.95, "p", True),
             DedupResult(_mk_candidate("c2", "b"), 0.0, None, False)]
    sel2 = choose_topic(mixed)
    assert sel2.chosen.candidate.topic_id == "c2"
    assert sel2.fallback == []


def test_18_all_duplicates_picks_least_similar_never_none():
    results = [DedupResult(_mk_candidate("c1", "a"), 0.97, "p", True),
               DedupResult(_mk_candidate("c2", "b"), 0.90, "p", True),
               DedupResult(_mk_candidate("c3", "c"), 0.93, "p", True)]
    sel = choose_topic(results)
    assert sel.all_too_similar
    assert sel.chosen is not None
    assert sel.chosen.candidate.topic_id == "c2"  # least similar (0.90)
    assert [r.candidate.topic_id for r in sel.fallback] == ["c3", "c1"]  # ascending
    with pytest.raises(ContractError):
        choose_topic([])


def test_19_precomputed_embedding_and_text_only_both_work():
    embedder = FakeEmbedder()
    cands = [_mk_candidate("c2", "reciprocal rank fusion hybrid retrieval")]
    precomputed = embedder.embed_query("reciprocal rank fusion hybrid retrieval")
    prior_pc = [PriorTopic("p1", "ignored-key-because-embedding-present", precomputed)]
    prior_text = [PriorTopic("p1", "reciprocal rank fusion hybrid retrieval")]
    res_pc = semantic_dedup(cands, prior_pc, embedder, threshold=0.5)
    res_text = semantic_dedup(cands, prior_text, embedder, threshold=0.5)
    assert res_pc[0].too_similar and res_pc[0].max_similarity == pytest.approx(1.0)
    assert res_text[0].too_similar and res_text[0].max_similarity == pytest.approx(1.0)


def test_20_determinism_and_cosine_and_embedder_sanity():
    cands = [_mk_candidate("c1", "agentic coding harness"), _mk_candidate("c2", "rrf fusion")]
    priors = [PriorTopic("p1", "rrf fusion")]
    assert semantic_dedup(cands, priors, FakeEmbedder()) == semantic_dedup(
        cands, priors, FakeEmbedder()
    )
    assert cosine([0.0, 0.0], [1.0, 1.0]) == 0.0
    assert cosine([1.0, 2.0, 3.0], [1.0, 2.0, 3.0]) == pytest.approx(1.0)
    embedder = FakeEmbedder()
    assert embedder.dimensions == 256
    assert embedder.model == "fake-hash-256"
    vec = embedder.embed_query("hybrid retrieval reciprocal rank fusion")
    assert len(vec) == 256
    assert sum(v * v for v in vec) == pytest.approx(1.0)  # L2-normalized
    # OQ-8 placeholder default is a sane in-range threshold (real value: task 27).
    assert 0.0 < DEDUP_SIMILARITY_THRESHOLD < 1.0


def test_20a_diacritic_fold_regression_lock():
    # tokenize folds diacritics so accented FR and its ASCII spelling share a bag.
    assert tokenize("Recuperation") == tokenize("recuperation") == ["recuperation"]
    assert tokenize("Récupération") == ["recuperation"]
    assert tokenize("Génération augmentée") == ["generation", "augmentee"]
    embedder = FakeEmbedder()
    # Assert VECTOR EQUALITY (same bag -> bit-identical vector), not cosine ~ 1.0.
    assert embedder.embed(["Récupération"])[0] == embedder.embed(["recuperation"])[0]
    assert (
        embedder.embed(["Génération augmentée"])[0]
        == embedder.embed(["generation augmentee"])[0]
    )


# ---------------------------------------------------------------------------
# Select — brief
# ---------------------------------------------------------------------------


def test_21_valid_brief_has_no_problems():
    assert validate_brief(_fixture_text("brief.valid.md")) == []


def test_22_brief_problems_are_reported():
    brief = _fixture_text("brief.valid.md")
    # missing a body header
    assert any("Outline" in p for p in validate_brief(brief.replace("## Outline", "## Outlinexx")))
    # missing fallback_topic_ids (drop the key + its list item lines)
    no_fallback = brief.replace("fallback_topic_ids:\n  - oss-llm-finetuning\n", "")
    assert any("fallback_topic_ids" in p for p in validate_brief(no_fallback))
    # a fallback id not in candidate_ids
    problems = validate_brief(brief, candidate_ids={"agentic-coding-harness"})
    assert any("oss-llm-finetuning" in p for p in problems)
    # valid against the real candidate id set
    full = {"agentic-coding-harness", "rrf-hybrid-retrieval", "oss-llm-finetuning"}
    assert validate_brief(brief, candidate_ids=full) == []


def test_23_parse_brief_leading_fence_only():
    meta = parse_brief(_fixture_text("brief.valid.md"))
    assert meta.chosen_topic_id == "agentic-coding-harness"
    assert meta.fallback_topic_ids == ["oss-llm-finetuning"]
    assert meta.angle.startswith("A hands-on look")
    assert [c["id"] for c in meta.claim_skeleton] == ["c1", "c2"]
    assert meta.claim_skeleton[0]["source_ids"] == ["s1"]
    # The body contains a '---' horizontal rule that must NOT be parsed as frontmatter.
    assert "\n---\n" in _fixture_text("brief.valid.md").split("## Angle", 1)[1]


# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

_ABS_REPO = Path("/abs/repo")
_ABS_RUN = Path("/abs/repo/pipeline/runs/run-1")


def test_24_research_prompt_substrings_deterministic_no_emoji():
    prompt = build_research_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    assert prompt == build_research_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    for needle in [
        "/abs/repo",
        "/abs/repo/pipeline/runs/run-1/plans/task-research/candidates.json",
        "python3 -m pipeline.stages.research --validate",
        "web search",
        "search",
        "agentic",
        "cutting-edge AI engineering",
        "open-source (OSS)",
        "building with AI",
        "excerpt",
        "label",
        "retrieved_at",
        "dedup_key",
        "two sources",
        "FR-D3",
        "schema_version",
    ]:
        assert needle in prompt, f"research prompt missing {needle!r}"
    assert "no emoji" in prompt.lower()
    assert prompt.isascii()  # ASCII-only => no emoji in the prompt itself


def test_25_select_prompt_substrings_no_emoji():
    prompt = build_select_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    for needle in [
        "/abs/repo/pipeline/runs/run-1/plans/task-research/candidates.json",
        "select dedup --run-dir",
        "/abs/repo/pipeline/runs/run-1/plans/task-select/brief.md",
        "chosen_topic_id",
        "fallback_topic_ids",
        "angle",
        "claim_skeleton",
        "validate-brief",
        "fallback shortlist",
        "claim->source",
    ]:
        assert needle in prompt, f"select prompt missing {needle!r}"
    assert "no emoji" in prompt.lower()
    assert prompt.isascii()


def test_26_prompts_absolute_paths_and_composition_seam():
    research = build_research_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    select = build_select_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    assert "PYTHONPATH=/abs/repo" in research
    assert "PYTHONPATH=/abs/repo" in select
    config = PipelineConfig(repo_root=_ABS_REPO)
    descriptions = editorial_stage_descriptions(config, _ABS_RUN)
    # task 25 adds the "draft" key to the composition seam (task 27 will add "publish").
    assert set(descriptions) == {"research", "select", "draft"}
    assert descriptions["research"] == research
    assert descriptions["select"] == select


# ---------------------------------------------------------------------------
# CLI (subprocess over a tmp run-dir)
# ---------------------------------------------------------------------------


def test_27_select_dedup_cli_writes_and_recommends(tmp_path):
    run_dir = tmp_path
    research_dir = run_dir / "plans" / "task-research"
    research_dir.mkdir(parents=True)
    (research_dir / "candidates.json").write_text(
        _fixture_text("candidates.valid.json"), encoding="utf-8"
    )
    memory = _FIXTURES / "topic_memory.json"
    proc = _cli(
        [
            "pipeline.stages.select",
            "dedup",
            "--run-dir",
            str(run_dir),
            "--memory",
            str(memory),
        ]
    )
    assert proc.returncode == 0, proc.stderr
    assert "chosen_topic_id: agentic-coding-harness" in proc.stdout
    dedup_path = run_dir / "plans" / "task-select" / "dedup.json"
    assert dedup_path.exists()
    payload = json.loads(dedup_path.read_text(encoding="utf-8"))
    by_id = {r["topic_id"]: r for r in payload["results"]}
    assert by_id["rrf-hybrid-retrieval"]["too_similar"] is True
    assert by_id["agentic-coding-harness"]["too_similar"] is False
    assert payload["selection"]["chosen_topic_id"] == "agentic-coding-harness"


def test_27b_select_dedup_real_embedder_errors(tmp_path):
    run_dir = tmp_path
    research_dir = run_dir / "plans" / "task-research"
    research_dir.mkdir(parents=True)
    (research_dir / "candidates.json").write_text(
        _fixture_text("candidates.valid.json"), encoding="utf-8"
    )
    proc = _cli(
        ["pipeline.stages.select", "dedup", "--run-dir", str(run_dir), "--embedder", "real"]
    )
    assert proc.returncode != 0
    assert "task 27" in (proc.stdout + proc.stderr)


def test_28_validate_clis_exit_codes(tmp_path):
    # claim_source_map --validate
    csm_ok = tmp_path / "csm.json"
    csm_ok.write_text(_fixture_text("claim_source_map.valid.json"), encoding="utf-8")
    ok = _cli(["pipeline.contracts.claim_source_map", "--validate", str(csm_ok)])
    assert ok.returncode == 0 and "OK" in ok.stdout
    bad = copy.deepcopy(_csm_valid_dict())
    bad["claims"][0]["source_id"] = "orphan"
    csm_bad = tmp_path / "csm_bad.json"
    csm_bad.write_text(json.dumps(bad), encoding="utf-8")
    bad_run = _cli(["pipeline.contracts.claim_source_map", "--validate", str(csm_bad)])
    assert bad_run.returncode == 1

    # research --validate
    cand_ok = tmp_path / "candidates.json"
    cand_ok.write_text(_fixture_text("candidates.valid.json"), encoding="utf-8")
    ok2 = _cli(["pipeline.stages.research", "--validate", str(cand_ok)])
    assert ok2.returncode == 0 and "OK" in ok2.stdout
    bad2 = copy.deepcopy(_candidates_valid_dict())
    bad2["candidates"][0]["sources"] = bad2["candidates"][0]["sources"][:1]
    cand_bad = tmp_path / "candidates_bad.json"
    cand_bad.write_text(json.dumps(bad2), encoding="utf-8")
    bad2_run = _cli(["pipeline.stages.research", "--validate", str(cand_bad)])
    assert bad2_run.returncode == 1


def test_29_load_topic_memory_and_fake_topic_memory():
    priors = load_topic_memory(_FIXTURES / "topic_memory.json")
    assert [p.topic_id for p in priors] == ["prior-rrf", "prior-astro"]
    assert all(p.embedding is None for p in priors)
    reader = FakeTopicMemory(priors)
    assert reader.prior_topics() == priors
    # Selection.to_dict shape (used by the dedup CLI artifact).
    sel = Selection(chosen=None, fallback=[], all_too_similar=False)
    assert sel.to_dict() == {
        "chosen_topic_id": None,
        "fallback_topic_ids": [],
        "all_too_similar": False,
    }

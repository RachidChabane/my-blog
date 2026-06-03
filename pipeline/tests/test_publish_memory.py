"""Offline tests for task 27: publish stage + topic memory + shared embedder seam.

Every test runs offline with real fixtures + fakes: no claude/tmux, no network, no
secret. They lock the publish MECHANISM deterministically -- the projection
(``project_sources`` / ``build_article`` / ``validate_published`` against
``src/content/schemas.ts``), bilingual-or-nothing write, the idempotent topic-memory
append, the Workers AI bge-m3 embedder seam (stubbed urlopen -- no network), and the
import-light invariant -- NOT live retrieval/LLM quality (the post-secret nets).

Real-repo safety: every publish path passes a TMP ``--repo-root`` and a TMP ``--memory``
(the default ``--memory`` derives from ``repo_root``, so a tmp repo keeps it tmp). No test
writes ``src/content/articles/*`` or appends the real ``pipeline/memory/topic_memory.json``.

Import convention [MEM: pipeline-stages-import-light-runpy]: publish/topic_memory/embedder
are imported DIRECTLY from their submodules; only the import-light PROMPT comes via
``import pipeline``. A no-runpy + sys.modules regression guard (tests 20a/20b) locks that.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

from pipeline import build_publish_prompt, editorial_stage_descriptions
from pipeline.config import PipelineConfig
from pipeline.contracts.claim_source_map import ClaimSourceMap, ContractError
from pipeline.contracts.embedder import load_topic_memory
from pipeline.memory.embedder import (
    EmbedderNotConfigured,
    RealEmbedder,
    create_real_embedder,
)
from pipeline.memory.topic_memory import TopicMemory, TopicRecord
from pipeline.stages.publish import (
    iso_to_ddmmyyyy,
    project_sources,
    publish_run,
    validate_published,
)

_FIXTURES = Path(__file__).resolve().parent / "fixtures"
_REPO_ROOT = Path(__file__).resolve().parents[2]

_ABS_REPO = Path("/abs/repo")
_ABS_RUN = Path("/abs/repo/pipeline/runs/run-1")

_TRANSLATION_KEY = "agentic-coding-harness-eval"
_FR_SLUG = "evaluer-harnais-codage-agentique"
_EN_SLUG = "agentic-coding-harness-eval"

# Same anchored, non-greedy leading-fence shape the stage modules use (so a body `---`
# rule is not mis-parsed). Local to the test helper.
_FENCE_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)


def _fixture_text(name: str) -> str:
    return (_FIXTURES / name).read_text(encoding="utf-8")


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", *args], capture_output=True, text=True, env=env
    )


def _frontmatter(text: str) -> dict:
    match = _FENCE_RE.match(text)
    assert match, "no leading frontmatter fence"
    return yaml.safe_load(match.group(1))


def _good_drafts() -> dict[str, str]:
    # complete map: s1+s2 are the agentic-harness sources matching the drafts (C3).
    return {
        "draft-fr.md": _fixture_text("draft-fr.valid.md"),
        "draft-en.md": _fixture_text("draft-en.valid.md"),
        "claim_source_map.json": _fixture_text("claim_source_map.complete.json"),
    }


def _good_select() -> dict[str, str]:
    return {"brief.md": _fixture_text("brief.valid.md")}


def _good_research() -> dict[str, str]:
    return {"candidates.json": _fixture_text("candidates.valid.json")}


def _make_publish_run(
    run_dir: Path,
    *,
    draft: dict[str, str] | None = None,
    select: dict[str, str] | None = None,
    research: dict[str, str] | None = None,
) -> Path:
    """Write the run-dir stage inputs under ``plans/task-{draft,select,research}/``."""
    for sub, files in (
        ("task-draft", draft or {}),
        ("task-select", select or {}),
        ("task-research", research or {}),
    ):
        directory = run_dir / "plans" / sub
        directory.mkdir(parents=True, exist_ok=True)
        for name, text in files.items():
            (directory / name).write_text(text, encoding="utf-8")
    return run_dir


def _record(**overrides) -> TopicRecord:
    base = {
        "translation_key": "tk-1",
        "topic_id": "t1",
        "dedup_key": "k1",
        "title": "T",
        "slugs": {"fr": "fr-s", "en": "en-s"},
        "sources": [{"label": "L", "url": "https://e.example/1", "date": "01-01-2026"}],
        "published_at": "2026-06-01",
        "embedding": None,
    }
    base.update(overrides)
    return TopicRecord(**base)


# ---------------------------------------------------------------------------
# Embedder -- memory/embedder.py (Workers AI bge-m3, REST; stubbed urlopen)
# ---------------------------------------------------------------------------


class _StubResp:
    """Minimal urlopen() return: a context manager whose .read() yields the payload."""

    def __init__(self, payload: dict) -> None:
        self._body = json.dumps(payload).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *_exc):
        return False

    def read(self) -> bytes:
        return self._body


def _stub_urlopen(payload: dict, calls: list | None = None):
    def _open(request, timeout=None):
        if calls is not None:
            calls.append(request)
        return _StubResp(payload)

    return _open


def test_01_create_real_embedder_absent_raises():
    with pytest.raises(EmbedderNotConfigured) as exc:
        create_real_embedder({})
    msg = str(exc.value)
    assert "EMBEDDINGS_API_KEY" in msg and "CLOUDFLARE_ACCOUNT_ID" in msg and "absent" in msg


def test_02_create_real_embedder_token_without_account_raises():
    # fail-loud: a token but no account id must still raise (never silent-fake).
    with pytest.raises(EmbedderNotConfigured) as exc:
        create_real_embedder({"EMBEDDINGS_API_KEY": "x"})
    assert "account absent" in str(exc.value)


def test_03_create_real_embedder_configured_returns_bge_m3():
    emb = create_real_embedder({"EMBEDDINGS_API_KEY": "tok", "CLOUDFLARE_ACCOUNT_ID": "acc"})
    assert isinstance(emb, RealEmbedder)
    assert emb.model == "@cf/baai/bge-m3" and emb.dimensions == 1024


def test_03b_real_embedder_posts_and_parses_workers_ai():
    calls: list = []
    payload = {"success": True, "result": {"data": [[0.0, 1.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]]}}
    emb = RealEmbedder(
        api_key="tok", account_id="acc", dimensions=4, urlopen=_stub_urlopen(payload, calls)
    )
    assert emb.embed(["hello", "world"]) == [[0.0, 1.0, 0.0, 0.0], [1.0, 0.0, 0.0, 0.0]]
    req = calls[0]
    assert req.full_url == (
        "https://api.cloudflare.com/client/v4/accounts/acc/ai/run/@cf/baai/bge-m3"
    )
    assert req.get_header("Authorization") == "Bearer tok"
    assert json.loads(req.data.decode("utf-8")) == {"text": ["hello", "world"]}


def test_03c_real_embedder_malformed_response_raises():
    bad = RealEmbedder(
        api_key="t", account_id="a", dimensions=4,
        urlopen=_stub_urlopen({"success": False, "result": {}}),
    )
    with pytest.raises(RuntimeError):
        bad.embed(["x"])


# ---------------------------------------------------------------------------
# Topic memory -- memory/topic_memory.py (FR-G1)
# ---------------------------------------------------------------------------


def test_04_topic_memory_missing_file_is_empty(tmp_path):
    mem = TopicMemory.load(tmp_path / "nope.json")
    assert mem.records() == []
    assert mem.prior_topics() == []


def test_05_append_save_superset_compatible(tmp_path):
    store = tmp_path / "store.json"
    mem = TopicMemory(store)
    assert mem.append_publication(_record()) is True
    mem.save()
    raw = json.loads(store.read_text(encoding="utf-8"))
    assert isinstance(raw, list) and len(raw) == 1
    # the file the contracts reader (select dedup --memory) consumes -- superset lock.
    priors = load_topic_memory(store)
    assert len(priors) == 1
    assert priors[0].topic_id == "t1" and priors[0].dedup_key == "k1"
    assert priors[0].embedding is None


def test_06_append_publication_idempotent(tmp_path):
    mem = TopicMemory(tmp_path / "s.json")
    assert mem.append_publication(_record()) is True
    # same translation_key (even with a different topic_id) is a no-op.
    assert mem.append_publication(_record(topic_id="other")) is False
    assert len(mem.records()) == 1


def test_07_prior_topics_roundtrips_embedding(tmp_path):
    store = tmp_path / "s.json"
    mem = TopicMemory(store)
    mem.append_publication(_record())  # embedding None
    mem.append_publication(_record(translation_key="tk-2", topic_id="t2", embedding=[0.1, 0.2]))
    mem.save()
    pts = TopicMemory.load(store).prior_topics()
    assert pts[0].embedding is None
    assert pts[1].embedding == [0.1, 0.2]


def test_08_topic_memory_validate_cli(tmp_path):
    store = tmp_path / "s.json"
    mem = TopicMemory(store)
    mem.append_publication(_record())
    mem.save()
    ok = _cli(["pipeline.memory.topic_memory", "validate", str(store)])
    assert ok.returncode == 0 and "OK" in ok.stdout
    bad = tmp_path / "bad.json"
    bad.write_text('{"not": "an array"}', encoding="utf-8")
    bad_run = _cli(["pipeline.memory.topic_memory", "validate", str(bad)])
    assert bad_run.returncode == 1


# ---------------------------------------------------------------------------
# Publish projection / bilingual-or-nothing -- stages/publish.py
# ---------------------------------------------------------------------------


def test_09_iso_to_ddmmyyyy():
    assert iso_to_ddmmyyyy("2025-12-01") == "01-12-2025"
    assert iso_to_ddmmyyyy("2026-01-15T10:00:00Z") == "15-01-2026"  # RFC3339 datetime
    with pytest.raises(ContractError):
        iso_to_ddmmyyyy("not-a-date")


def test_10_project_sources_dates():
    csm = ClaimSourceMap.load_path(_FIXTURES / "claim_source_map.valid.json")
    sources = project_sources(csm)
    assert len(sources) >= 2
    assert sources[0]["date"] == "01-12-2025"  # s1 source_date
    assert sources[1]["date"] == "16-01-2026"  # s2 retrieved_at fallback
    assert all(set(s) == {"label", "url", "date"} for s in sources)


def test_11_publish_happy_path_writes_both(tmp_path):
    run = _make_publish_run(
        tmp_path / "run",
        draft=_good_drafts(),
        select=_good_select(),
        research=_good_research(),
    )
    repo = tmp_path / "repo"
    store = tmp_path / "store.json"
    store.write_text("[]\n", encoding="utf-8")
    proc = _cli(
        [
            "pipeline.stages.publish", "publish",
            "--run-dir", str(run),
            "--repo-root", str(repo),
            "--publish-date", "01-06-2026",
            "--memory", str(store),
        ]
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr

    fr = repo / "src" / "content" / "articles" / f"{_FR_SLUG}.fr.md"
    en = repo / "src" / "content" / "articles" / f"{_EN_SLUG}.en.md"
    assert fr.is_file() and en.is_file()

    # advisor #3: assert TYPED reloaded values, not merely that it parses.
    for path, lang in ((fr, "fr"), (en, "en")):
        fm = _frontmatter(path.read_text(encoding="utf-8"))
        assert fm["publishState"] == "published"
        assert fm["publishDate"] == "01-06-2026"
        assert fm["lang"] == lang
        assert fm["translationKey"] == _TRANSLATION_KEY
        assert isinstance(fm["tags"], list) and fm["tags"]
        assert isinstance(fm["sources"], list) and len(fm["sources"]) >= 2
        assert all(set(s) == {"label", "url", "date"} for s in fm["sources"])
        assert isinstance(fm["contentHash"], str) and fm["contentHash"]
        assert validate_published(path.read_text(encoding="utf-8")) == []

    # bodies preserved (each idiomatic in its own language)
    assert "tool-use loops over a task suite" in en.read_text(encoding="utf-8")
    assert "harnais de codage agentique" in fr.read_text(encoding="utf-8")


def test_12_bilingual_or_nothing_writes_neither(tmp_path):
    drafts = _good_drafts()
    # drop EN translationKey -> parity fails -> write NEITHER
    drafts["draft-en.md"] = drafts["draft-en.md"].replace(
        f"translationKey: {_TRANSLATION_KEY}\n", ""
    )
    run = _make_publish_run(tmp_path / "run", draft=drafts)
    repo = tmp_path / "repo"
    proc = _cli(
        [
            "pipeline.stages.publish", "publish",
            "--run-dir", str(run),
            "--repo-root", str(repo),
            "--publish-date", "01-06-2026",
            "--memory", str(tmp_path / "s.json"),
        ]
    )
    assert proc.returncode == 1
    assert proc.stdout.strip()  # problems printed
    assert not (repo / "src" / "content" / "articles").exists()


def test_13_translationkey_parity_mismatch_reported(tmp_path):
    drafts = _good_drafts()
    drafts["draft-en.md"] = drafts["draft-en.md"].replace(
        f"translationKey: {_TRANSLATION_KEY}", "translationKey: a-different-key"
    )
    run = _make_publish_run(tmp_path / "run", draft=drafts)
    result = publish_run(
        run, tmp_path / "repo", publish_date="01-06-2026", memory_path=tmp_path / "s.json"
    )
    assert result.ok is False
    assert any("parity" in p for p in result.problems)
    assert not (tmp_path / "repo" / "src" / "content" / "articles").exists()


def test_14_validate_dry_run_no_writes(tmp_path):
    run = _make_publish_run(tmp_path / "run", draft=_good_drafts())
    ok = _cli(["pipeline.stages.publish", "validate", "--run-dir", str(run)])
    assert ok.returncode == 0 and "OK" in ok.stdout
    assert not (run / "plans" / "task-publish").exists()  # validate writes no manifest

    bad_drafts = _good_drafts()
    bad_drafts["draft-en.md"] = bad_drafts["draft-en.md"].replace(
        f"translationKey: {_TRANSLATION_KEY}\n", ""
    )
    bad_run = _make_publish_run(tmp_path / "bad", draft=bad_drafts)
    bad = _cli(["pipeline.stages.publish", "validate", "--run-dir", str(bad_run)])
    assert bad.returncode == 1
    assert bad.stdout.strip()
    # validate has no --repo-root -> it can never create an articles dir
    assert not (tmp_path / "src").exists()


def test_15_topic_memory_append_and_degrade(tmp_path):
    run = _make_publish_run(
        tmp_path / "run",
        draft=_good_drafts(),
        select=_good_select(),
        research=_good_research(),
    )
    store = tmp_path / "store.json"
    store.write_text("[]\n", encoding="utf-8")
    result = publish_run(run, tmp_path / "repo", publish_date="01-06-2026", memory_path=store)
    assert result.ok and result.manifest["topic_memory"]["recorded"] is True
    mem = TopicMemory.load(store)
    assert mem.has(_TRANSLATION_KEY)
    assert [r.topic_id for r in mem.records()] == ["agentic-coding-harness"]

    # degrade: no brief.md -> articles still written, recorded False with a reason, store empty
    run2 = _make_publish_run(tmp_path / "run2", draft=_good_drafts(), research=_good_research())
    repo2 = tmp_path / "repo2"
    store2 = tmp_path / "store2.json"
    store2.write_text("[]\n", encoding="utf-8")
    result2 = publish_run(run2, repo2, publish_date="01-06-2026", memory_path=store2)
    assert result2.ok is True
    assert (repo2 / "src" / "content" / "articles" / f"{_EN_SLUG}.en.md").is_file()
    assert result2.manifest["topic_memory"]["recorded"] is False
    assert result2.manifest["topic_memory"]["reason"]
    assert TopicMemory.load(store2).records() == []


def test_16_manifest_shape(tmp_path):
    run = _make_publish_run(
        tmp_path / "run",
        draft=_good_drafts(),
        select=_good_select(),
        research=_good_research(),
    )
    result = publish_run(
        run, tmp_path / "repo", publish_date="01-06-2026", memory_path=tmp_path / "s.json"
    )
    assert result.ok
    manifest_path = run / "plans" / "task-publish" / "published.json"
    assert manifest_path.is_file()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert [a["url"] for a in manifest["articles"]] == [
        f"/fr/blog/{_FR_SLUG}/",
        f"/en/blog/{_EN_SLUG}/",
    ]
    assert manifest["reindex"]["event"] == "publish"
    assert manifest["reindex"]["changed_slugs"] == [_FR_SLUG, _EN_SLUG]
    assert manifest["translationKey"] == _TRANSLATION_KEY


def test_17_idempotent_republish(tmp_path):
    run = _make_publish_run(
        tmp_path / "run",
        draft=_good_drafts(),
        select=_good_select(),
        research=_good_research(),
    )
    repo = tmp_path / "repo"
    store = tmp_path / "store.json"
    store.write_text("[]\n", encoding="utf-8")
    first = publish_run(run, repo, publish_date="01-06-2026", memory_path=store)
    second = publish_run(run, repo, publish_date="01-06-2026", memory_path=store)
    assert first.ok and second.ok
    assert len(list((repo / "src" / "content" / "articles").glob("*.md"))) == 2
    assert len(TopicMemory.load(store).records()) == 1  # second append is a no-op
    assert second.manifest["topic_memory"]["recorded"] is False


# ---------------------------------------------------------------------------
# Prompt + composition seam
# ---------------------------------------------------------------------------


def test_18_publish_prompt_substrings():
    prompt = build_publish_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    assert prompt == build_publish_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)  # deterministic
    for needle in [
        "/abs/repo",
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/draft-fr.md",
        "src/content/articles",
        "pipeline.stages.publish publish",
        "pipeline.stages.publish validate",
        "--repo-root",
        "bilingual",
        "reindex",
        "claim_source_map.json",
        "PYTHONPATH=/abs/repo",
    ]:
        assert needle in prompt, f"publish prompt missing {needle!r}"
    assert "no emoji" in prompt.lower()
    assert prompt.isascii()


def test_19_editorial_descriptions_includes_publish():
    config = PipelineConfig(repo_root=_ABS_REPO)
    descriptions = editorial_stage_descriptions(config, _ABS_RUN)
    assert set(descriptions) == {"research", "select", "draft", "publish"}
    assert descriptions["publish"] == build_publish_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)


# ---------------------------------------------------------------------------
# Import-light regression guard (mirror test_gate's)
# ---------------------------------------------------------------------------


def test_20a_import_pipeline_does_not_import_publish_or_memory():
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    code = (
        "import pipeline, sys; "
        "bad=[m for m in sys.modules if m=='pipeline.stages.publish' "
        "or m.startswith('pipeline.memory.')]; "
        "assert not bad, bad"
    )
    proc = subprocess.run(
        [sys.executable, "-c", code], capture_output=True, text=True, env=env
    )
    assert proc.returncode == 0, proc.stdout + proc.stderr


def test_20b_publish_and_memory_clis_no_runpy_warning(tmp_path):
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    # -W error::RuntimeWarning makes the runpy double-import warning a nonzero exit, so a
    # future re-export from pipeline/__init__.py would fail here.
    for mod in ("pipeline.stages.publish", "pipeline.memory.topic_memory"):
        proc = subprocess.run(
            [sys.executable, "-W", "error::RuntimeWarning", "-m", mod, "--help"],
            capture_output=True, text=True, env=env,
        )
        assert proc.returncode == 0, f"{mod}: unexpected warning/error:\n{proc.stderr}"

    run = _make_publish_run(tmp_path / "run", draft=_good_drafts())
    proc = subprocess.run(
        [sys.executable, "-W", "error::RuntimeWarning", "-m",
         "pipeline.stages.publish", "validate", "--run-dir", str(run)],
        capture_output=True, text=True, env=env,
    )
    assert proc.returncode == 0, proc.stderr
    assert "RuntimeWarning" not in proc.stderr


# ---------------------------------------------------------------------------
# Select wiring (cross-file smoke) -- the new store flows into dedup --memory
# ---------------------------------------------------------------------------


def test_21_select_dedup_with_new_store(tmp_path):
    run = tmp_path
    research = run / "plans" / "task-research"
    research.mkdir(parents=True)
    (research / "candidates.json").write_text(
        _fixture_text("candidates.valid.json"), encoding="utf-8"
    )
    # a one-record store written by the NEW writer (TopicMemory), keyed on the rrf topic.
    store = tmp_path / "store.json"
    mem = TopicMemory(store)
    mem.append_publication(
        _record(
            translation_key="prior-1",
            topic_id="prior-rrf",
            dedup_key="reciprocal rank fusion hybrid retrieval",
        )
    )
    mem.save()
    proc = _cli(["pipeline.stages.select", "dedup", "--run-dir", str(run), "--memory", str(store)])
    assert proc.returncode == 0, proc.stderr
    dedup = json.loads((run / "plans" / "task-select" / "dedup.json").read_text(encoding="utf-8"))
    by_id = {r["topic_id"]: r for r in dedup["results"]}
    assert by_id["rrf-hybrid-retrieval"]["too_similar"] is True
    assert by_id["agentic-coding-harness"]["too_similar"] is False
    assert dedup["selection"]["chosen_topic_id"] == "agentic-coding-harness"

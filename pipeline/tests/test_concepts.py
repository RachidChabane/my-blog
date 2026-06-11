"""Offline tests for the knowledge-graph concept store (pipeline/stages/concepts.py).

Locks the store's two contracts: definitions are CANONICAL + WRITE-ONCE (`add` refuses
an existing id or an alias collision; only `link` touches an existing concept), and the
on-disk shape is deterministic (sorted by id, stable JSON). Also proves the COMMITTED
store (src/content/concepts/index.json, the backfill) validates and cites only real
article translationKeys -- so the graph page never renders a dangling citation.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

from pipeline.stages.concepts import (
    CONCEPTS_REL,
    VALID_THEMES,
    Concept,
    ConceptError,
    ConceptStore,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]


def _concept(cid: str = "test-concept", **over) -> Concept:
    base = dict(
        id=cid,
        label={"fr": "Concept", "en": "Concept"},
        definition={"fr": "Une définition canonique.", "en": "A canonical definition."},
        theme="agentic-ai",
        articles=["some-article"],
        added_on="11-06-2026",
        aliases=[],
        related=[],
    )
    base.update(over)
    return Concept(**base)


def _store(tmp_path: Path) -> ConceptStore:
    return ConceptStore.load(tmp_path / "index.json")


# --- write-once + link semantics ---------------------------------------------------


def test_add_then_reload_roundtrips(tmp_path):
    store = _store(tmp_path)
    store.add(_concept("rag"))
    store.add(_concept("agents"))
    store.save()
    again = ConceptStore.load(tmp_path / "index.json")
    assert [c.id for c in again.concepts()] == ["agents", "rag"]  # sorted by id
    assert again.validate() == []


def test_add_refuses_existing_id_definition_is_write_once(tmp_path):
    store = _store(tmp_path)
    store.add(_concept("rag"))
    with pytest.raises(ConceptError, match="write-once"):
        store.add(_concept("rag", definition={"fr": "Autre.", "en": "Other."}))


def test_add_refuses_alias_collision(tmp_path):
    store = _store(tmp_path)
    store.add(_concept("rag", aliases=["retrieval augmented generation"]))
    with pytest.raises(ConceptError, match="alias"):
        store.add(_concept("retrieval-augmented-generation"))


def test_add_validates_theme_style_and_related(tmp_path):
    store = _store(tmp_path)
    with pytest.raises(ConceptError, match="theme"):
        store.add(_concept(theme="astrology"))
    with pytest.raises(ConceptError, match="em-dash"):
        store.add(_concept(definition={"fr": "Avec un — tiret.", "en": "Fine."}))
    with pytest.raises(ConceptError, match="related"):
        store.add(_concept(related=["not-in-store"]))


def test_link_appends_idempotently_and_rejects_unknown(tmp_path):
    store = _store(tmp_path)
    store.add(_concept("rag", articles=["first-article"]))
    assert store.link("rag", "second-article") is True
    assert store.link("rag", "second-article") is False  # idempotent no-op
    assert store.get("rag").articles == ["first-article", "second-article"]
    with pytest.raises(ConceptError, match="unknown concept"):
        store.link("ghost", "x")


# --- the CLI the publish prompt drives ---------------------------------------------


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.stages.concepts", *args],
        capture_output=True, text=True, env=env,
    )


def test_cli_add_link_list_validate_flow(tmp_path):
    store_path = tmp_path / "index.json"
    record = _concept("tool-use").to_dict()
    record_file = tmp_path / "concept-tool-use.json"
    record_file.write_text(json.dumps(record), encoding="utf-8")

    proc = _cli(["add", "--store", str(store_path), "--file", str(record_file)])
    assert proc.returncode == 0, proc.stdout + proc.stderr
    # duplicate add blocks (write-once)
    proc = _cli(["add", "--store", str(store_path), "--file", str(record_file)])
    assert proc.returncode == 1 and "write-once" in proc.stdout

    proc = _cli(["link", "--store", str(store_path), "--id", "tool-use",
                 "--article", "another-key"])
    assert proc.returncode == 0 and "linked" in proc.stdout
    proc = _cli(["link", "--store", str(store_path), "--id", "missing",
                 "--article", "another-key"])
    assert proc.returncode == 1

    proc = _cli(["list", "--store", str(store_path)])
    assert proc.returncode == 0 and "tool-use" in proc.stdout and "total: 1" in proc.stdout

    proc = _cli(["validate", "--store", str(store_path)])
    assert proc.returncode == 0 and proc.stdout.startswith("OK")


def test_cli_add_defaults_added_on_when_absent(tmp_path):
    store_path = tmp_path / "index.json"
    record = _concept("fresh").to_dict()
    del record["addedOn"]
    record_file = tmp_path / "c.json"
    record_file.write_text(json.dumps(record), encoding="utf-8")
    proc = _cli(["add", "--store", str(store_path), "--file", str(record_file)])
    assert proc.returncode == 0, proc.stdout + proc.stderr
    saved = json.loads(store_path.read_text(encoding="utf-8"))
    assert re.match(r"^\d{2}-\d{2}-\d{4}$", saved[0]["addedOn"])


# --- the COMMITTED store (the backfill) is sound ------------------------------------


def test_committed_store_validates_and_cites_real_articles():
    store = ConceptStore.load(_REPO_ROOT / CONCEPTS_REL)
    assert len(store.concepts()) >= 20, "the backfill seeds the graph"
    assert store.validate() == []
    # every cited translationKey resolves to a published article pair on disk
    keys = set()
    for md in (_REPO_ROOT / "src/content/articles").glob("*.md"):
        for line in md.read_text(encoding="utf-8").splitlines()[:15]:
            if line.startswith("translationKey:"):
                keys.add(line.split(":", 1)[1].strip())
    for concept in store.concepts():
        for tk in concept.articles:
            assert tk in keys, f"{concept.id} cites unknown article {tk!r}"
    # every theme is represented (the graph's clusters are all live)
    themes = {c.theme for c in store.concepts()}
    assert themes == set(VALID_THEMES)

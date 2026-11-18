"""Tests for the voice reference registry, HTML extraction, fetch and status CLI.

No network: ``_download`` is monkeypatched wherever a fetch happens.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from ..voice import references
from ..voice.references import (
    REFERENCES_MIN_READ,
    Reference,
    cache_path,
    cached_counts,
    fetch_reference,
    html_to_text,
    load_registry,
    status_problems,
)

LONG_TEXT = "A paragraph written by a person. " * 80


def _registry(repo: Path, entries: list[dict]) -> None:
    path = repo / references.REGISTRY_REL
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump({"references": entries}), encoding="utf-8")


def _entry(**overrides) -> dict:
    entry = {
        "lang": "en",
        "author": "Jane Doe",
        "title": "Notes on Caching",
        "url": "https://blog.example.com/caching",
    }
    entry.update(overrides)
    return entry


def _ref(**overrides) -> Reference:
    return Reference(**{**_entry(), **overrides})


def _page(text: str = LONG_TEXT) -> str:
    return f"<html><body><article><p>{text}</p></article></body></html>"


# --------------------------------------------------------------------------- registry


def test_load_registry_valid(tmp_path):
    _registry(tmp_path, [_entry(), _entry(lang="fr", title="Un titre")])
    refs = load_registry(tmp_path)
    assert [r.lang for r in refs] == ["en", "fr"]
    assert refs[0].slug == "jane-doe-notes-on-caching"


@pytest.mark.parametrize(
    "bad, fragment",
    [
        (_entry(lang="de"), "lang must be one of"),
        (_entry(url="ftp://blog.example.com/x"), "url must be http"),
        ({k: v for k, v in _entry().items() if k != "title"}, "missing field"),
    ],
)
def test_load_registry_rejects_a_malformed_entry(tmp_path, bad, fragment):
    _registry(tmp_path, [bad])
    with pytest.raises(ValueError, match=fragment):
        load_registry(tmp_path)


def test_load_registry_empty_file_is_empty_list(tmp_path):
    path = tmp_path / references.REGISTRY_REL
    path.parent.mkdir(parents=True)
    path.write_text("", encoding="utf-8")
    assert load_registry(tmp_path) == []


# --------------------------------------------------------------------------- html_to_text


def test_html_to_text_drops_script_and_nav():
    page = (
        "<html><head><style>p{color:red}</style><script>var x = 1;</script></head>"
        "<body><nav>Home About</nav><p>Real prose.</p></body></html>"
    )
    text = html_to_text(page)
    assert text == "Real prose."


def test_html_to_text_prefers_the_article_block():
    page = "<body><div>Sidebar chatter</div><article><p>The post.</p></article></body>"
    assert html_to_text(page) == "The post."


def test_html_to_text_keeps_paragraph_breaks_and_unescapes_entities():
    page = "<article><p>First &amp; foremost.</p><p>Second &lt;one&gt;.</p></article>"
    assert html_to_text(page) == "First & foremost.\n\nSecond <one>."


# --------------------------------------------------------------------------- fetch


def test_fetch_reference_writes_header_and_text(tmp_path, monkeypatch):
    monkeypatch.setattr(references, "_download", lambda url: _page())
    ref = _ref()
    assert fetch_reference(tmp_path, ref) is None
    written = cache_path(tmp_path, ref).read_text(encoding="utf-8")
    assert written.startswith("Notes on Caching\nJane Doe\nhttps://blog.example.com/caching\n\n")
    assert "A paragraph written by a person." in written


def test_fetch_reference_skips_a_cached_post_unless_forced(tmp_path, monkeypatch):
    calls: list[str] = []
    monkeypatch.setattr(references, "_download", lambda url: calls.append(url) or _page())
    ref = _ref()
    assert fetch_reference(tmp_path, ref) is None
    assert fetch_reference(tmp_path, ref) is None
    assert len(calls) == 1
    assert fetch_reference(tmp_path, ref, force=True) is None
    assert len(calls) == 2


def test_fetch_reference_reports_too_short_text_without_writing(tmp_path, monkeypatch):
    monkeypatch.setattr(references, "_download", lambda url: _page("tiny"))
    ref = _ref()
    problem = fetch_reference(tmp_path, ref)
    assert problem is not None and "characters of text extracted" in problem
    assert not cache_path(tmp_path, ref).exists()


def test_fetch_reference_reports_a_download_error_without_writing(tmp_path, monkeypatch):
    def boom(url: str) -> str:
        raise OSError("connection refused")

    monkeypatch.setattr(references, "_download", boom)
    ref = _ref()
    problem = fetch_reference(tmp_path, ref)
    assert problem == "https://blog.example.com/caching: connection refused"
    assert not cache_path(tmp_path, ref).exists()


# --------------------------------------------------------------------------- status


def _seed_cache(repo: Path, lang: str, count: int) -> None:
    base = references.references_dir(repo) / lang
    base.mkdir(parents=True, exist_ok=True)
    for i in range(count):
        (base / f"post-{i}.txt").write_text("text", encoding="utf-8")


def test_cached_counts_per_language(tmp_path):
    _seed_cache(tmp_path, "fr", 2)
    assert cached_counts(tmp_path) == {"fr": 2, "en": 0}


def test_status_problems_flag_each_short_language(tmp_path):
    _seed_cache(tmp_path, "fr", REFERENCES_MIN_READ)
    _seed_cache(tmp_path, "en", REFERENCES_MIN_READ - 1)
    problems = status_problems(tmp_path)
    assert len(problems) == 1 and problems[0].startswith("en:")


def test_status_cli_exit_codes(tmp_path, capsys):
    argv = ["status", "--repo-root", str(tmp_path)]
    assert references._main(argv) == 1
    assert "cached reference posts" in capsys.readouterr().err
    _seed_cache(tmp_path, "fr", REFERENCES_MIN_READ)
    _seed_cache(tmp_path, "en", REFERENCES_MIN_READ)
    assert references._main(argv) == 0
    assert "fr: 3 cached" in capsys.readouterr().out


def test_fetch_cli_caches_registry_posts_and_reports_status(tmp_path, monkeypatch, capsys):
    _registry(tmp_path, [_entry(title=f"Post {i}") for i in range(REFERENCES_MIN_READ)])
    monkeypatch.setattr(references, "_download", lambda url: _page())
    assert references._main(["fetch", "--repo-root", str(tmp_path)]) == 1  # fr still empty
    assert cached_counts(tmp_path)["en"] == REFERENCES_MIN_READ
    assert "fr: 0 cached reference posts" in capsys.readouterr().err

"""Journal tool tests: scaffold, every check problem, publish contract, date rule, status.

All offline; every test works in a tmp repo root.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

from ..journal.constants import GITIGNORE_ENTRY
from ..journal.publish import main, resolve_publish_date
from ..stages.publish import content_hash

KEY = "on-slow-ideas"
PUBLISHED_KEYS = [
    "translationKey",
    "lang",
    "slug",
    "title",
    "publishDate",
    "summary",
    "tags",
    "sources",
    "contentHash",
    "publishState",
]
SOURCE = {"label": "A source", "url": "https://example.com/a", "date": "01-06-2026"}
FR_BODY = "## Une idée lente\n\nTexte.\n\n## Ce que j'en garde\n\nSuite."
EN_BODY = "## A slow idea\n\nText.\n\n## What I keep\n\nMore."


def _file(
    *,
    title="Titre",
    slug="idee",
    summary="Resume.",
    tags=("agents",),
    sources=(SOURCE,),
    body=FR_BODY,
    omit=(),
) -> str:
    meta = {
        "title": title,
        "slug": slug,
        "summary": summary,
        "tags": list(tags),
        "sources": [dict(s) for s in sources],
    }
    for key in omit:
        meta.pop(key)
    return f"---\n{yaml.safe_dump(meta, allow_unicode=True)}---\n\n{body}\n"


def _fr(**kw) -> str:
    return _file(**kw)


def _en(**kw) -> str:
    base = {"title": "Title", "slug": "idea", "summary": "Summary.", "body": EN_BODY}
    return _file(**{**base, **kw})


@pytest.fixture
def repo(tmp_path: Path) -> Path:
    tags = tmp_path / "src" / "content" / "tags"
    tags.mkdir(parents=True)
    index = [{"id": t, "slug": t, "label": {"fr": t, "en": t}} for t in ("agents", "rag")]
    (tags / "index.json").write_text(json.dumps(index), encoding="utf-8")
    return tmp_path


def _write_draft(repo: Path, fr: str | None, en: str | None, key: str = KEY) -> None:
    directory = repo / "drafts" / "journal" / key
    directory.mkdir(parents=True, exist_ok=True)
    for lang, text in (("fr", fr), ("en", en)):
        if text is not None:
            (directory / f"{lang}.md").write_text(text, encoding="utf-8")


def _run(repo: Path, *argv: str) -> int:
    return main([*argv, "--repo-root", str(repo)])


def _check(repo: Path, capsys, key: str = KEY) -> tuple[int, list[str]]:
    code = _run(repo, "check", key)
    return code, capsys.readouterr().out.splitlines()


def _problems(repo: Path, capsys) -> list[str]:
    code, lines = _check(repo, capsys)
    assert code == 1
    return lines


def _clean(repo: Path) -> None:
    _write_draft(repo, _fr(), _en())


def _journal(repo: Path) -> Path:
    return repo / "src" / "content" / "journal"


def _published_meta(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8").split("---\n")[1])


# ---------------------------------------------------------------- new


def test_new_scaffolds_both_languages_and_refuses_overwrite(repo, capsys):
    assert _run(repo, "new", KEY) == 0
    out = capsys.readouterr().out.splitlines()
    assert out == [f"drafts/journal/{KEY}/fr.md", f"drafts/journal/{KEY}/en.md"]
    for lang in ("fr", "en"):
        text = (repo / "drafts" / "journal" / KEY / f"{lang}.md").read_text()
        meta = yaml.safe_load(text.split("---\n")[1])
        assert meta == {"title": "", "slug": "", "summary": "", "tags": [], "sources": []}
    (repo / "drafts" / "journal" / KEY / "fr.md").write_text("mine", encoding="utf-8")
    assert _run(repo, "new", KEY) == 1
    assert "not overwriting" in capsys.readouterr().out
    assert (repo / "drafts" / "journal" / KEY / "fr.md").read_text() == "mine"


@pytest.mark.parametrize("bad", ["Upper", "with_underscore", "trailing-", "a b", "é"])
def test_new_rejects_bad_keys(repo, capsys, bad):
    assert _run(repo, "new", bad) == 1
    assert "translationKey must be lowercase ASCII" in capsys.readouterr().out
    assert not (repo / "drafts").exists()


def test_new_scaffold_fails_check_until_filled(repo, capsys):
    _run(repo, "new", KEY)
    capsys.readouterr()
    problems = _problems(repo, capsys)
    assert "fr: title must be a non-empty string" in problems
    assert "en: body must not be empty" in problems


def test_gitignore_entry_added_once(repo):
    _run(repo, "new", "first")
    _run(repo, "new", "second")
    lines = (repo / ".gitignore").read_text().splitlines()
    assert lines.count(GITIGNORE_ENTRY) == 1


def test_gitignore_entry_appended_to_existing_file_without_trailing_newline(repo):
    (repo / ".gitignore").write_text("dist/", encoding="utf-8")
    _run(repo, "new", KEY)
    assert (repo / ".gitignore").read_text().splitlines() == ["dist/", GITIGNORE_ENTRY]


# ---------------------------------------------------------------- check


def test_clean_pair_checks_ok(repo, capsys):
    _clean(repo)
    assert _check(repo, capsys) == (0, ["OK"])


@pytest.mark.parametrize("lang", ["fr", "en"])
def test_missing_file(repo, capsys, lang):
    _write_draft(repo, _fr() if lang == "en" else None, _en() if lang == "fr" else None)
    assert f"{lang}: draft file is missing" in _problems(repo, capsys)


def test_unparseable_frontmatter(repo, capsys):
    _write_draft(repo, "no fence here", "---\n: [unclosed\n---\nbody")
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr: frontmatter:") for p in problems)
    assert any(p.startswith("en: frontmatter:") for p in problems)


@pytest.mark.parametrize("key", ["title", "slug", "summary"])
def test_missing_or_empty_required_key(repo, capsys, key):
    _write_draft(repo, _fr(omit=(key,)), _en(**{key: "  "}))
    problems = _problems(repo, capsys)
    assert f"fr: {key} must be a non-empty string" in problems
    assert f"en: {key} must be a non-empty string" in problems


@pytest.mark.parametrize("lang", ["fr", "en"])
def test_empty_body(repo, capsys, lang):
    kw = {"body": ""}
    _write_draft(repo, _fr(**kw) if lang == "fr" else _fr(), _en(**kw) if lang == "en" else _en())
    assert f"{lang}: body must not be empty" in _problems(repo, capsys)


@pytest.mark.parametrize("bad", ["Upper", "snake_case", "double--hyphen", "accentué", "-x"])
def test_slug_must_be_kebab_ascii(repo, capsys, bad):
    _write_draft(repo, _fr(slug=bad), _en(slug=bad + "-en"))
    assert any(p.startswith("fr: slug must be lowercase ASCII") for p in _problems(repo, capsys))


def test_slug_must_differ_between_languages(repo, capsys):
    _write_draft(repo, _fr(slug="same"), _en(slug="same"))
    assert any("slug must differ between fr and en" in p for p in _problems(repo, capsys))


def test_slug_used_by_another_published_piece(repo, capsys):
    _journal(repo).mkdir(parents=True)
    other = _journal(repo) / "idee.fr.md"
    other.write_text(
        "---\ntranslationKey: someone-else\nlang: fr\nslug: idee\n"
        "publishDate: 01-01-2026\n---\n\nx\n"
    )
    _clean(repo)
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr: slug 'idee' is already used") for p in problems)
    assert not any(p.startswith("en:") for p in problems)


def test_slug_of_own_published_piece_is_not_a_clash(repo, capsys):
    _clean(repo)
    assert _run(repo, "publish", KEY) == 0
    capsys.readouterr()
    assert _check(repo, capsys) == (0, ["OK"])


def test_unknown_tags_in_both_languages(repo, capsys):
    _write_draft(repo, _fr(tags=("agents", "nope")), _en(tags=("agents", "nope")))
    problems = _problems(repo, capsys)
    assert "fr: unknown tag id 'nope' (not in the tags index)" in problems
    assert "en: unknown tag id 'nope' (not in the tags index)" in problems


def test_tags_must_be_a_list_of_ids(repo, capsys):
    _write_draft(repo, "---\ntitle: T\nslug: s\nsummary: S\ntags: agents\n---\n\nb\n", _en())
    assert "fr: tags must be a list of non-empty tag ids" in _problems(repo, capsys)


def test_tag_sets_must_match(repo, capsys):
    _write_draft(repo, _fr(tags=("agents",)), _en(tags=("agents", "rag")))
    assert any("tags differ between fr" in p for p in _problems(repo, capsys))


def test_tags_may_be_absent_in_both(repo, capsys):
    _write_draft(repo, _fr(omit=("tags",)), _en(omit=("tags",)))
    assert _check(repo, capsys) == (0, ["OK"])


@pytest.mark.parametrize(
    ("source", "expected"),
    [
        ({"label": " ", "url": "https://x.org", "date": "01-01-2026"}, "label must be"),
        ({"label": "L", "url": "ftp://x.org", "date": "01-01-2026"}, "url must be http(s)"),
        ({"label": "L", "url": "https://x.org", "date": "2026-01-01"}, "date must match"),
    ],
)
def test_malformed_sources(repo, capsys, source, expected):
    _write_draft(repo, _fr(sources=(source,)), _en(sources=(source,)))
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr: sources[0].") and expected in p for p in problems)
    assert any(p.startswith("en: sources[0].") and expected in p for p in problems)


def test_source_url_sets_must_match(repo, capsys):
    other = {**SOURCE, "url": "https://example.com/b"}
    _write_draft(repo, _fr(sources=(SOURCE,)), _en(sources=(other,)))
    assert "source urls differ between fr and en" in _problems(repo, capsys)


def test_house_style_violations_in_title_summary_and_body(repo, capsys):
    dash = "a — b"
    _write_draft(
        repo,
        _fr(title=dash, body=FR_BODY + "\n\nok \U0001f600"),
        _en(summary=dash, body=EN_BODY + "\n\n" + dash),
    )
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr:") and "no-emoji" in p for p in problems)
    assert any(p.startswith("fr:") and "no-em-dash" in p for p in problems)
    assert any(p.startswith("en:") and "no-em-dash" in p for p in problems)


def test_fr_diacritics_checked_for_fr_only(repo, capsys):
    _write_draft(
        repo,
        _fr(body=FR_BODY + "\n\nUn probleme.\n"),
        _en(body=EN_BODY + "\n\nUn probleme.\n"),
    )
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr:") and "probleme" in p for p in problems)
    assert not any(p.startswith("en:") and "probleme" in p for p in problems)


def test_title_rule(repo, capsys):
    _write_draft(repo, _fr(), _en(title="A long idea, and also another one; " + "x" * 80))
    assert any(p.startswith("en: voice:") for p in _problems(repo, capsys))


def test_repeated_citation(repo, capsys):
    body = EN_BODY + "\n\nClaim [s1] and again [s1].\n"
    _write_draft(repo, _fr(), _en(body=body))
    assert any(p.startswith("en: voice: repeated-citation") for p in _problems(repo, capsys))


def _published_piece(repo: Path, name: str, lang: str, headings: str, date: str) -> None:
    _journal(repo).mkdir(parents=True, exist_ok=True)
    (_journal(repo) / f"{name}.{lang}.md").write_text(
        f"---\ntranslationKey: {name}\nlang: {lang}\nslug: {name}\n"
        f"publishDate: {date}\n---\n\n{headings}\n"
    )


def test_worn_headings_use_journal_pieces_only(repo, capsys):
    shared = "## Une idée lente"
    articles = repo / "src" / "content" / "articles"
    articles.mkdir(parents=True)
    for i in range(3):
        (articles / f"a{i}.fr.md").write_text(
            f"---\nlang: fr\npublishDate: 0{i + 1}-01-2026\n---\n\n{shared}\n"
        )
    _clean(repo)
    assert _check(repo, capsys) == (0, ["OK"])
    for i in range(2):
        _published_piece(repo, f"old{i}", "fr", shared, f"0{i + 1}-02-2026")
    problems = _problems(repo, capsys)
    assert any(p.startswith("fr: voice: reused-heading") for p in problems)
    assert not any(p.startswith("en:") for p in problems)


def test_heading_count_parity_ignores_fenced_code(repo, capsys):
    fenced = FR_BODY + "\n\n```\n## not a heading\n```\n"
    _write_draft(repo, _fr(body=fenced), _en())
    assert _check(repo, capsys) == (0, ["OK"])
    _write_draft(repo, _fr(body=FR_BODY + "\n\n## Un de plus\n\nx"), _en())
    assert any("structural parity" in p for p in _problems(repo, capsys))


# ---------------------------------------------------------------- publish


def test_publish_writes_both_files_with_exact_contract(repo, capsys):
    _clean(repo)
    assert _run(repo, "publish", KEY, "--publish-date", "05-03-2026") == 0
    assert capsys.readouterr().out.splitlines() == [
        "src/content/journal/idee.fr.md",
        "src/content/journal/idea.en.md",
    ]
    for lang, slug, body in (("fr", "idee", FR_BODY), ("en", "idea", EN_BODY)):
        path = _journal(repo) / f"{slug}.{lang}.md"
        text = path.read_text(encoding="utf-8")
        meta = _published_meta(path)
        assert list(meta) == PUBLISHED_KEYS
        assert meta["translationKey"] == KEY
        assert meta["lang"] == lang
        assert meta["publishDate"] == "05-03-2026"
        assert meta["tags"] == ["agents"]
        assert meta["sources"] == [SOURCE]
        assert meta["publishState"] == "published"
        assert meta["contentHash"] == content_hash(KEY, lang, body)
        assert text.endswith(f"---\n\n{body}\n")
    assert list(_journal(repo).glob(".*")) == []


def test_publish_keeps_unicode_and_empty_lists(repo):
    _write_draft(
        repo,
        _fr(title="Idée à garder", tags=(), sources=()),
        _en(tags=(), sources=()),
    )
    assert _run(repo, "publish", KEY) == 0
    text = (_journal(repo) / "idee.fr.md").read_text(encoding="utf-8")
    assert "title: Idée à garder" in text
    assert "tags: []" in text and "sources: []" in text


def test_publish_defaults_to_today(repo):
    from datetime import date

    _clean(repo)
    _run(repo, "publish", KEY)
    expected = date.today().strftime("%d-%m-%Y")
    assert _published_meta(_journal(repo) / "idee.fr.md")["publishDate"] == expected


def test_publish_writes_nothing_when_one_language_fails(repo, capsys):
    _write_draft(repo, _fr(), _en(tags=("agents", "nope")))
    assert _run(repo, "publish", KEY) == 1
    assert "en: unknown tag id" in capsys.readouterr().out
    assert not _journal(repo).exists()


def test_publish_rejects_bad_date_format(repo, capsys):
    _clean(repo)
    assert _run(repo, "publish", KEY, "--publish-date", "2026-03-05") == 1
    assert "--publish-date must be a real DD-MM-YYYY date" in capsys.readouterr().out
    assert _run(repo, "publish", KEY, "--publish-date", "31-02-2026") == 1
    assert not _journal(repo).exists()


def test_republish_keeps_date_and_replaces_text(repo, capsys):
    _clean(repo)
    _run(repo, "publish", KEY, "--publish-date", "05-03-2026")
    _write_draft(repo, _fr(body=FR_BODY + "\n\nAjout."), _en(body=EN_BODY + "\n\nAddition."))
    assert _run(repo, "publish", KEY) == 0
    path = _journal(repo) / "idee.fr.md"
    meta = _published_meta(path)
    assert meta["publishDate"] == "05-03-2026"
    assert "Ajout." in path.read_text(encoding="utf-8")
    assert meta["contentHash"] == content_hash(KEY, "fr", FR_BODY + "\n\nAjout.")


def test_republish_accepts_the_same_explicit_date_and_refuses_another(repo, capsys):
    _clean(repo)
    _run(repo, "publish", KEY, "--publish-date", "05-03-2026")
    capsys.readouterr()
    assert _run(repo, "publish", KEY, "--publish-date", "05-03-2026") == 0
    capsys.readouterr()
    before = (_journal(repo) / "idee.fr.md").read_text()
    assert _run(repo, "publish", KEY, "--publish-date", "06-03-2026") == 1
    assert "date is kept" in capsys.readouterr().out
    assert (_journal(repo) / "idee.fr.md").read_text() == before


def test_republish_finds_the_date_from_either_language(repo):
    _clean(repo)
    _run(repo, "publish", KEY, "--publish-date", "05-03-2026")
    (_journal(repo) / "idee.fr.md").unlink()
    assert _run(repo, "publish", KEY) == 0
    assert _published_meta(_journal(repo) / "idee.fr.md")["publishDate"] == "05-03-2026"


def test_slug_rename_removes_the_old_file_for_that_language(repo):
    _clean(repo)
    _run(repo, "publish", KEY, "--publish-date", "05-03-2026")
    _write_draft(repo, _fr(slug="idee-renommee"), _en())
    assert _run(repo, "publish", KEY) == 0
    assert not (_journal(repo) / "idee.fr.md").exists()
    assert (_journal(repo) / "idee-renommee.fr.md").is_file()
    assert (_journal(repo) / "idea.en.md").is_file()
    assert sorted(p.name for p in _journal(repo).iterdir()) == [
        "idea.en.md",
        "idee-renommee.fr.md",
    ]


def test_resolve_publish_date_rules():
    assert resolve_publish_date(None, None, "01-01-2026") == ("01-01-2026", [])
    assert resolve_publish_date(None, "02-02-2026", "01-01-2026") == ("02-02-2026", [])
    assert resolve_publish_date("03-03-2026", None, "01-01-2026") == ("03-03-2026", [])
    date_, problems = resolve_publish_date("03-03-2026", "04-04-2026", "01-01-2026")
    assert date_ is None and len(problems) == 1


# ---------------------------------------------------------------- status & CLI


def test_status_lines(repo, capsys):
    _write_draft(repo, _fr(), _en(), key="alpha-idea")
    _write_draft(repo, _fr(), None, key="beta-idea")
    _write_draft(repo, _fr(slug="gamma"), _en(slug="gamma-en"), key="gamma-idea")
    _run(repo, "publish", "gamma-idea", "--publish-date", "07-07-2026")
    capsys.readouterr()
    assert _run(repo, "status") == 0
    lines = capsys.readouterr().out.splitlines()
    assert lines[0] == "alpha-idea  clean  not published"
    assert lines[1].startswith("beta-idea  ") and "problems" in lines[1]
    assert lines[1].endswith("not published")
    assert lines[2] == "gamma-idea  clean  published 07-07-2026"


def test_status_without_drafts_prints_nothing(repo, capsys):
    assert _run(repo, "status") == 0
    assert capsys.readouterr().out == ""


def test_main_requires_a_verb():
    with pytest.raises(SystemExit) as exc:
        main([])
    assert exc.value.code == 2


def test_module_cli_exit_codes(repo):
    root = Path(__file__).resolve().parents[2]

    def run(*argv: str) -> subprocess.CompletedProcess:
        return subprocess.run(
            [sys.executable, "-m", "pipeline.journal.publish", *argv, "--repo-root", str(repo)],
            cwd=root,
            capture_output=True,
            text=True,
            check=False,
        )

    bad = run("check", KEY)
    assert bad.returncode == 1 and "draft file is missing" in bad.stdout
    assert "RuntimeWarning" not in bad.stderr
    _clean(repo)
    good = run("check", KEY)
    assert (good.returncode, good.stdout.strip()) == (0, "OK")

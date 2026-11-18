"""Tests for the reader judge: the dispatch block and the verdict re-check."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ..contracts.claim_source_map import ContractError
from ..stages.humanize import parse_style_findings
from ..voice.judge import (
    READER_JUDGE_MAX_ISSUES,
    READER_VERDICT_SCHEMA,
    build_reader_judge_dispatch,
    reader_verdict_problems,
)
from ..voice.references import REFERENCES_MIN_READ

REPO = Path("/abs/repo")
OUT = Path("/abs/run/plans/task-draft/style-fr.json")


def _dispatch(lang: str = "fr") -> str:
    return build_reader_judge_dispatch(
        repo_root=REPO, text_desc="the fr draft as a finished post", out_path=OUT, lang=lang
    )


def test_dispatch_is_ascii_and_deterministic():
    assert _dispatch().isascii()
    assert _dispatch() == _dispatch()


@pytest.mark.parametrize("lang", ["fr", "en"])
def test_dispatch_names_the_language_reference_dir(lang):
    text = _dispatch(lang)
    assert f"/abs/repo/pipeline/voice/cache/{lang}" in text
    other = "en" if lang == "fr" else "fr"
    assert f"/abs/repo/pipeline/voice/cache/{other}" not in text


def test_dispatch_names_house_style_out_path_and_schema():
    text = _dispatch()
    assert "/abs/repo/pipeline/house_style.md" in text
    assert str(OUT) in text
    assert READER_VERDICT_SCHEMA in text
    assert '"clean"|"revision_needed"' in text
    assert "suspicious" not in text
    assert f"at least {REFERENCES_MIN_READ} reference posts" in text
    assert f"most {READER_JUDGE_MAX_ISSUES}." in text


def test_dispatch_carries_the_excludes_clause():
    text = _dispatch()
    excluded_items = ("the brief", "the claim->source map", "the other language")
    for excluded in (*excluded_items, "earlier findings"):
        assert excluded in text
    assert "authored this" in text


def test_verdict_schema_matches_what_the_parser_accepts():
    sample = {"verdict": "revision_needed", "issues": [{"phrase": "p", "pattern": "q"}]}
    assert parse_style_findings(sample).verdict == "revision_needed"
    with pytest.raises(ContractError):
        parse_style_findings({"verdict": "suspicious", "issues": []})


def _write(tmp_path: Path, payload) -> Path:
    path = tmp_path / "style-fr.json"
    path.write_text(payload if isinstance(payload, str) else json.dumps(payload), "utf-8")
    return path


def test_missing_file_is_a_problem(tmp_path):
    problems = reader_verdict_problems(tmp_path / "style-fr.json", "fr")
    assert len(problems) == 1
    assert "missing reader-judge findings" in problems[0]
    assert problems[0].startswith("fr:")


def test_invalid_json_is_a_problem(tmp_path):
    problems = reader_verdict_problems(_write(tmp_path, "{not json"), "fr")
    assert len(problems) == 1 and "invalid style findings" in problems[0]


def test_unknown_verdict_is_a_problem(tmp_path):
    problems = reader_verdict_problems(_write(tmp_path, {"verdict": "suspicious"}), "en")
    assert len(problems) == 1
    assert problems[0].startswith("en:") and "invalid style findings" in problems[0]


def test_revision_needed_lists_the_issues(tmp_path):
    payload = {
        "verdict": "revision_needed",
        "issues": [
            {"phrase": "It is worth noting", "pattern": "filler opener"},
            {"phrase": "In conclusion", "pattern": "announced close"},
        ],
    }
    problems = reader_verdict_problems(_write(tmp_path, payload), "fr")
    assert problems[0] == "fr: style verdict is 'revision_needed' (not 'clean')"
    assert "  [filler opener] It is worth noting" in problems
    assert "  [announced close] In conclusion" in problems


def test_clean_returns_no_problem(tmp_path):
    assert reader_verdict_problems(_write(tmp_path, {"verdict": "clean", "issues": []}), "fr") == []

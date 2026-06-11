"""Offline tests for the Lesson recommender (pipeline/stages/lesson.py).

The lesson path's DETERMINISTIC core: the versioned backlog loads fail-closed, the
track-balance + first-uncovered-in-order rule is fixed, and the CLI the research
prompt shells out to emits a machine-readable recommendation. The prompt conditionals
(research no-news fallback, draft LESSON MODE) are locked by substring tests in
test_draft_review.py / the prompt suites; the live judgment that a day has no news
worth covering is the agent's call and is not simulated here.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

from pipeline.memory.topic_memory import TopicRecord
from pipeline.stages.lesson import (
    TOPIC_ID_PREFIX,
    TRACKS,
    BacklogError,
    LessonEntry,
    covered_by_track,
    load_backlog,
    next_lesson,
)

_REPO_ROOT = Path(__file__).resolve().parents[2]


def _record(topic_id: str, dedup_key: str = "") -> TopicRecord:
    return TopicRecord(
        translation_key=f"tk-{topic_id}",
        topic_id=topic_id,
        dedup_key=dedup_key or topic_id,
        title="T",
        slugs={"fr": "s-fr", "en": "s-en"},
        sources=[],
        published_at="2026-06-11",
    )


def _tiny_backlog(tmp_path: Path) -> Path:
    path = tmp_path / "backlog.yaml"
    path.write_text(
        "version: 1\n"
        "tracks:\n"
        "  agentic:\n"
        "    - {id: a1, title: A1, focus: F, why: W}\n"
        "    - {id: a2, title: A2, focus: F, why: W}\n"
        "  ml-fundamentals:\n"
        "    - {id: m1, title: M1, focus: F, why: W}\n"
        "    - {id: m2, title: M2, focus: F, why: W}\n",
        encoding="utf-8",
    )
    return path


# --- the REAL backlog file is well-formed (fail-closed) --------------------------


def test_real_backlog_loads_with_both_tracks_populated():
    entries = load_backlog()
    by_track = {t: [e for e in entries if e.track == t] for t in TRACKS}
    assert all(len(by_track[t]) >= 5 for t in TRACKS), "both tracks need real depth"
    ids = [e.id for e in entries]
    assert len(ids) == len(set(ids))
    # entry ids slug-shaped (they become topic_id 'lesson-<id>' + the dedup key)
    assert all(i.replace("-", "").isalnum() for i in ids)


def test_malformed_backlogs_raise(tmp_path):
    bad_track = tmp_path / "b1.yaml"
    bad_track.write_text(
        "tracks:\n  rocket-science:\n    - {id: x, title: T, focus: F, why: W}\n"
    )
    with pytest.raises(BacklogError):
        load_backlog(bad_track)

    dup = tmp_path / "b2.yaml"
    dup.write_text(
        "tracks:\n  agentic:\n"
        "    - {id: x, title: T, focus: F, why: W}\n"
        "    - {id: x, title: T2, focus: F, why: W}\n"
    )
    with pytest.raises(BacklogError):
        load_backlog(dup)

    missing = tmp_path / "b3.yaml"
    missing.write_text("tracks:\n  agentic:\n    - {id: x, title: T}\n")
    with pytest.raises(BacklogError):
        load_backlog(missing)

    with pytest.raises(BacklogError):
        load_backlog(tmp_path / "absent.yaml")


# --- the recommendation rule ------------------------------------------------------


def test_first_recommendation_is_ml_fundamentals_progression_start(tmp_path):
    entries = load_backlog(_tiny_backlog(tmp_path))
    # empty memory: 0-0 tie -> ml-fundamentals (the beginner progression leads)
    rec = next_lesson(entries, [])
    assert rec is not None and (rec.track, rec.id) == ("ml-fundamentals", "m1")
    assert rec.topic_id == f"{TOPIC_ID_PREFIX}m1"


def test_balance_alternates_tracks(tmp_path):
    entries = load_backlog(_tiny_backlog(tmp_path))
    # m1 covered -> ml=1, agentic=0 -> the agentic track is behind, goes next
    rec = next_lesson(entries, [_record("lesson-m1")])
    assert rec is not None and (rec.track, rec.id) == ("agentic", "a1")
    # both at 1 -> tie -> ml again, next IN ORDER (m2, never m1 again)
    rec = next_lesson(entries, [_record("lesson-m1"), _record("lesson-a1")])
    assert rec is not None and (rec.track, rec.id) == ("ml-fundamentals", "m2")


def test_coverage_matches_dedup_key_too(tmp_path):
    entries = load_backlog(_tiny_backlog(tmp_path))
    # a record carrying the entry's dedup_key (not the lesson- topic_id) still covers it
    rec = next_lesson(entries, [_record("some-run-id", dedup_key="m1")])
    assert rec is not None and rec.id == "a1"  # ml=1 via dedup_key -> agentic next


def test_exhausted_track_falls_through_and_full_backlog_returns_none(tmp_path):
    entries = load_backlog(_tiny_backlog(tmp_path))
    ml_done = [_record("lesson-m1"), _record("lesson-m2")]
    # ml exhausted (2) vs agentic (0): agentic next, in order
    assert next_lesson(entries, ml_done).id == "a1"
    all_done = ml_done + [_record("lesson-a1"), _record("lesson-a2")]
    assert next_lesson(entries, all_done) is None
    assert covered_by_track(entries, all_done) == {"agentic": 2, "ml-fundamentals": 2}


def test_lesson_entry_derived_keys():
    entry = LessonEntry(track="agentic", id="tool-use-design", title="T", focus="F", why="W")
    assert entry.topic_id == "lesson-tool-use-design"
    assert entry.dedup_key == "tool-use-design"


# --- the CLI the research prompt shells out to ------------------------------------


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", "pipeline.stages.lesson", *args],
        capture_output=True, text=True, env=env,
    )


def test_cli_next_topic_emits_machine_readable_recommendation(tmp_path):
    backlog = _tiny_backlog(tmp_path)
    memory = tmp_path / "memory.json"
    memory.write_text(json.dumps([_record("lesson-m1").to_dict()]), encoding="utf-8")
    proc = _cli(["next-topic", "--backlog", str(backlog), "--memory", str(memory)])
    assert proc.returncode == 0, proc.stderr
    rec = json.loads(proc.stdout)
    assert rec["topic_id"] == "lesson-a1" and rec["track"] == "agentic"
    assert rec["covered_counts"] == {"agentic": 0, "ml-fundamentals": 1}


def test_cli_next_topic_exhausted_backlog_exits_1(tmp_path):
    backlog = _tiny_backlog(tmp_path)
    memory = tmp_path / "memory.json"
    records = [_record(f"lesson-{i}").to_dict() for i in ("m1", "m2", "a1", "a2")]
    memory.write_text(json.dumps(records), encoding="utf-8")
    proc = _cli(["next-topic", "--backlog", str(backlog), "--memory", str(memory)])
    assert proc.returncode == 1
    assert "exhausted" in proc.stdout


def test_cli_absent_memory_means_nothing_covered(tmp_path):
    backlog = _tiny_backlog(tmp_path)
    proc = _cli(["next-topic", "--backlog", str(backlog), "--memory", str(tmp_path / "nope.json")])
    assert proc.returncode == 0, proc.stderr
    assert json.loads(proc.stdout)["topic_id"] == "lesson-m1"

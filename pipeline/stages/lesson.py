"""Lesson stage -- the deterministic next-lesson recommender for no-news days.

On a day where the research sweep finds NO agentic-AI news worth covering, the run
writes a LESSON instead (category ``lessons``): a structured educational deep-dive on
one subject. WHICH lesson is not the agent's ad-hoc call: this module reads the
versioned backlog (``pipeline/lesson_backlog.yaml``, two tracks calibrated to the
owner's profile) plus the topic memory, and recommends the next entry by a fixed rule:

  - track balance: the track with FEWER published lessons goes next (the spec's
    "balance the two tracks over time so neither stalls"); tie -> ``ml-fundamentals``
    (the beginner progression must not stall behind the expert track);
  - within a track: the FIRST uncovered entry in file order (the ml-fundamentals
    order is a load-bearing fundamentals-first progression);
  - coverage: an entry is covered when a topic-memory record carries its
    ``topic_id`` (``lesson-<id>``) or its ``dedup_key`` (``<id>``).

The research prompt shells out to ``python3 -m pipeline.stages.lesson next-topic``
and researches the recommended subject like any other candidate (captured excerpts,
two or more sources), emitting it as the lesson candidate. Downstream stages key
lesson behavior on the ``lesson-`` topic_id prefix; no slate-shape change.

Import-light per the stages convention [MEM: pipeline-stages-import-light-runpy]:
no symbol here is re-exported from ``pipeline/__init__``; ``TopicMemory`` is imported
at module level (it is never executed as ``__main__`` in this process).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import yaml

from ..memory.topic_memory import TopicMemory, TopicRecord

_PIPELINE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_BACKLOG_PATH = _PIPELINE_DIR / "lesson_backlog.yaml"
DEFAULT_MEMORY_PATH = _PIPELINE_DIR / "memory" / "topic_memory.json"

# The two tracks, pinned: balance is computed over exactly these, and the tie goes to
# the FIRST one listed here losing -- i.e. ml-fundamentals wins ties (see next_lesson).
TRACKS = ("agentic", "ml-fundamentals")

TOPIC_ID_PREFIX = "lesson-"


class BacklogError(ValueError):
    """A malformed backlog file (fail-closed: a garbled backlog is a loud error)."""


@dataclass(frozen=True)
class LessonEntry:
    track: str
    id: str
    title: str
    focus: str
    why: str

    @property
    def topic_id(self) -> str:
        return f"{TOPIC_ID_PREFIX}{self.id}"

    @property
    def dedup_key(self) -> str:
        return self.id


def load_backlog(path: Path | None = None) -> list[LessonEntry]:
    """Load + validate the backlog. Returns entries in file order (order is load-bearing
    for the ml-fundamentals progression). Raises ``BacklogError`` on a missing/garbled
    file, an unknown track, a missing field, or a duplicate id."""
    backlog_path = Path(path) if path else DEFAULT_BACKLOG_PATH
    try:
        raw = yaml.safe_load(backlog_path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise BacklogError(f"cannot load backlog {backlog_path}: {exc}") from exc
    if not isinstance(raw, dict) or not isinstance(raw.get("tracks"), dict):
        raise BacklogError(f"{backlog_path}: top level must carry a 'tracks' mapping")
    unknown = set(raw["tracks"]) - set(TRACKS)
    if unknown:
        raise BacklogError(f"{backlog_path}: unknown tracks {sorted(unknown)} (known: {TRACKS})")

    entries: list[LessonEntry] = []
    seen: set[str] = set()
    for track in TRACKS:
        items = raw["tracks"].get(track) or []
        if not isinstance(items, list):
            raise BacklogError(f"{backlog_path}: tracks.{track} must be a list")
        for i, item in enumerate(items):
            if not isinstance(item, dict):
                raise BacklogError(f"{backlog_path}: tracks.{track}[{i}] must be a mapping")
            missing = [k for k in ("id", "title", "focus", "why") if not item.get(k)]
            if missing:
                raise BacklogError(
                    f"{backlog_path}: tracks.{track}[{i}] missing {missing}"
                )
            entry_id = str(item["id"])
            if entry_id in seen:
                raise BacklogError(f"{backlog_path}: duplicate lesson id {entry_id!r}")
            seen.add(entry_id)
            entries.append(
                LessonEntry(
                    track=track,
                    id=entry_id,
                    title=str(item["title"]).strip(),
                    focus=str(item["focus"]).strip(),
                    why=str(item["why"]).strip(),
                )
            )
    if not entries:
        raise BacklogError(f"{backlog_path}: backlog has no entries")
    return entries


def _is_covered(entry: LessonEntry, records: list[TopicRecord]) -> bool:
    return any(
        r.topic_id == entry.topic_id or r.dedup_key == entry.dedup_key for r in records
    )


def covered_by_track(
    entries: list[LessonEntry], records: list[TopicRecord]
) -> dict[str, int]:
    """Published-lesson count per track (coverage matched on topic_id / dedup_key)."""
    counts = {track: 0 for track in TRACKS}
    for entry in entries:
        if _is_covered(entry, records):
            counts[entry.track] += 1
    return counts


def next_lesson(
    entries: list[LessonEntry], records: list[TopicRecord]
) -> LessonEntry | None:
    """The deterministic recommendation: balance the tracks, then first-uncovered in
    file order. Falls through to the other track when the preferred one is exhausted;
    ``None`` when the whole backlog is covered (extend the backlog file)."""
    counts = covered_by_track(entries, records)
    # fewer-covered first; tie -> ml-fundamentals (TRACKS order reversed = ml first on tie)
    preferred = sorted(TRACKS, key=lambda t: (counts[t], TRACKS.index(t) * -1))
    for track in preferred:
        for entry in entries:
            if entry.track == track and not _is_covered(entry, records):
                return entry
    return None


def _load_records(memory_path: Path) -> list[TopicRecord]:
    try:
        return TopicMemory.load(memory_path).records()
    except Exception:  # noqa: BLE001 -- an absent/garbled memory means nothing covered
        return []


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.lesson {next-topic,status}
# ---------------------------------------------------------------------------


def _cmd_next_topic(args) -> int:
    entries = load_backlog(Path(args.backlog) if args.backlog else None)
    records = _load_records(Path(args.memory) if args.memory else DEFAULT_MEMORY_PATH)
    entry = next_lesson(entries, records)
    if entry is None:
        print(
            "lesson backlog exhausted: every entry is covered; extend "
            "pipeline/lesson_backlog.yaml (append entries, never reuse ids)"
        )
        return 1
    counts = covered_by_track(entries, records)
    print(
        json.dumps(
            {
                "track": entry.track,
                "id": entry.id,
                "title": entry.title,
                "focus": entry.focus,
                "why": entry.why,
                "topic_id": entry.topic_id,
                "dedup_key": entry.dedup_key,
                "covered_counts": counts,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 0


def _cmd_status(args) -> int:
    entries = load_backlog(Path(args.backlog) if args.backlog else None)
    records = _load_records(Path(args.memory) if args.memory else DEFAULT_MEMORY_PATH)
    for entry in entries:
        mark = "x" if _is_covered(entry, records) else " "
        print(f"[{mark}] {entry.track:15s} {entry.id}")
    counts = covered_by_track(entries, records)
    print(f"covered: {counts}")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.lesson",
        description="Deterministic next-lesson recommendation from the versioned backlog.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    for name, fn in (("next-topic", _cmd_next_topic), ("status", _cmd_status)):
        p = sub.add_parser(name)
        p.add_argument(
            "--backlog", default=None,
            help="backlog yaml (default: pipeline/lesson_backlog.yaml)",
        )
        p.add_argument(
            "--memory", default=None,
            help="topic_memory.json (default: pipeline/memory/topic_memory.json)",
        )
        p.set_defaults(fn=fn)
    args = parser.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "TRACKS",
    "TOPIC_ID_PREFIX",
    "DEFAULT_BACKLOG_PATH",
    "BacklogError",
    "LessonEntry",
    "load_backlog",
    "covered_by_track",
    "next_lesson",
]

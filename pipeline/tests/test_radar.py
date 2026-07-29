"""Radar pipeline tests -- namespacing (the load-bearing collision guard), the cpe
template (loader-clean), and the deterministic publish projection (bilingual-or-nothing +
the section/kind/no-em-dash contract). All offline; cpe-dependent tests rely on the
conftest's PATH-symlink discovery like the rest of the suite.
"""

from __future__ import annotations

import json
from dataclasses import replace
from pathlib import Path

import pytest
import yaml

from ..config import PipelineConfig
from ..radar.config import (
    RADAR_MAX_REVIEW_ROUNDS,
    RADAR_RUNS_REL,
    RADAR_STATE_REL,
    RADAR_TEMPLATE_REL,
    radar_config_from_env,
    radar_memory_path,
)
from ..radar.stages import (
    RADAR_KINDS,
    REQUIRED_SECTIONS,
    build_radar_article,
    validate_radar_published,
    write_entries,
)
from ..runner import assemble_slate

REPO_ROOT = Path(__file__).resolve().parents[2]


def _valid_entry() -> dict:
    fr_body = "\n\n".join(f"{h}\n\nTexte." for h in REQUIRED_SECTIONS["fr"])
    en_body = "\n\n".join(f"{h}\n\nProse." for h in REQUIRED_SECTIONS["en"])
    return {
        "translationKey": "demo-radar-brief",
        "kind": "spec-change",
        "tags": ["mcp", "agents"],
        "slug_fr": "breve-demo",
        "slug_en": "demo-brief",
        "title_fr": "Titre demo",
        "title_en": "Demo title",
        "summary_fr": "Resume FR.",
        "summary_en": "Summary EN.",
        "body_fr": fr_body,
        "body_en": en_body,
        "sources": [
            {"label": "Primary spec", "url": "https://example.com/spec", "date": "01-06-2026"},
            {
                "label": "Corroboration",
                "url": "https://other.example.com/post",
                "date": "02-06-2026",
            },
        ],
    }


# --------------------------------------------------------------------------- namespacing


def test_radar_config_namespacing():
    cfg = radar_config_from_env(REPO_ROOT)
    assert cfg.runs_root == REPO_ROOT / RADAR_RUNS_REL
    assert cfg.template_path == REPO_ROOT / RADAR_TEMPLATE_REL
    assert cfg.schedule_state_dir == REPO_ROOT / RADAR_STATE_REL
    # Distinct from the essay engine's defaults -> independent run-dirs + ledgers.
    essay = PipelineConfig(repo_root=REPO_ROOT)
    assert cfg.runs_root != essay.runs_root
    assert cfg.template_path != essay.template_path
    assert cfg.schedule_state_dir != essay.schedule_state_dir
    assert radar_memory_path(REPO_ROOT) != REPO_ROOT / "pipeline" / "memory" / "topic_memory.json"


def test_radar_gets_an_extra_review_round():
    """Radar drafts converge on round 3, not round 2 (the 07-28/07-29 block).

    Round 2 reads a draft the round-1 revise already changed, so it can legitimately
    raise something new; with a cap of 2 that verdict has nowhere to land and the task
    blocks. The cap is radar-private -- the essay slate keeps its own default.
    """
    cfg = radar_config_from_env(REPO_ROOT)
    assert cfg.max_review_rounds == RADAR_MAX_REVIEW_ROUNDS == 3
    assert cfg.max_review_rounds > PipelineConfig(repo_root=REPO_ROOT).max_review_rounds
    # The blocking behaviour itself is unchanged: a draft that cannot pass still fails.
    assert cfg.max_gate_repair_rounds == 1


def test_assembled_radar_slate_stamps_the_review_cap(tmp_path):
    """The cap must reach the generated tasks.yaml -- config alone changes nothing."""
    cfg = replace(radar_config_from_env(REPO_ROOT), runs_root=tmp_path)
    slate = assemble_slate("2026-07-30", cfg, stage_descriptions=None)
    written = yaml.safe_load(slate.tasks_path.read_text(encoding="utf-8"))
    assert written["defaults"]["caps"]["max_review_rounds"] == RADAR_MAX_REVIEW_ROUNDS
    assert written["defaults"]["on_max_review_rounds"] == "fail"


def test_run_id_collision_regression(tmp_path):
    """A same-calendar-day radar run must NOT resume the essay slate (the audit trap).

    With the shared ``%Y-%m-%d`` run_id, the only thing keeping the two pipelines apart is
    the radar-private ``runs_root``. Assemble a radar slate; the essay config (its own,
    empty runs_root) must NOT see it.
    """
    from ..runner import assemble_slate, load_slate

    run_id = "2026-06-22"  # the shared period key both pipelines would compute
    radar_cfg = PipelineConfig(
        repo_root=REPO_ROOT,
        runs_root=tmp_path / "runs-radar",
        template_path=REPO_ROOT / RADAR_TEMPLATE_REL,
    )
    essay_cfg = PipelineConfig(repo_root=REPO_ROOT, runs_root=tmp_path / "runs")

    assemble_slate(run_id, radar_cfg)
    # Radar can reload its own slate...
    assert load_slate(run_id, radar_cfg).run_id == run_id
    # ...but the essay engine, at the SAME run_id, finds nothing (no cross-pipeline resume).
    with pytest.raises(FileNotFoundError):
        load_slate(run_id, essay_cfg)


def test_radar_template_assembles_and_loads_clean(tmp_path, capsys):
    from ..runner import assemble_slate

    cfg = PipelineConfig(
        repo_root=REPO_ROOT,
        runs_root=tmp_path / "runs-radar",
        template_path=REPO_ROOT / RADAR_TEMPLATE_REL,
    )
    slate = assemble_slate("radar-t1", cfg)
    assert slate.task_ids == ["research", "draft", "publish"]

    from claude_plan_execute import loader

    loader.load_tasks_file(slate.tasks_path)
    captured = capsys.readouterr()
    assert "Warning:" not in captured.out
    assert "Warning:" not in captured.err


# --------------------------------------------------------------------------- publish


def test_radar_publish_projection(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    mem = tmp_path / "radar_memory.json"
    results = write_entries([_valid_entry()], repo, publish_date="22-06-2026", memory_path=mem)
    assert len(results) == 1 and results[0].ok, results[0].problems
    fr = repo / "src" / "content" / "radar" / "breve-demo.fr.md"
    en = repo / "src" / "content" / "radar" / "demo-brief.en.md"
    assert fr.exists() and en.exists()
    assert validate_radar_published(en.read_text(encoding="utf-8")) == []
    assert validate_radar_published(fr.read_text(encoding="utf-8")) == []
    # radar memory recorded the brief
    records = json.loads(mem.read_text(encoding="utf-8"))
    assert any(r["translation_key"] == "demo-radar-brief" for r in records)


def test_radar_publish_bilingual_or_nothing(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    bad = _valid_entry()
    bad["body_en"] = "## What changed\n\nMissing the other three required sections."
    results = write_entries([bad], repo, publish_date="22-06-2026", memory_path=tmp_path / "m.json")
    assert not results[0].ok
    # neither file written
    assert not (repo / "src" / "content" / "radar").exists() or not list(
        (repo / "src" / "content" / "radar").glob("*.md")
    )


def test_radar_publish_rejects_em_dash(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    entry = _valid_entry()
    # An em-dash that survived (build_radar_article sanitizes via RadarEntry.from_dict,
    # so inject straight into the article builder to exercise the validator).
    from ..radar.stages import RadarEntry

    e = RadarEntry.from_dict(entry)
    article = build_radar_article(e, "en", publish_date="22-06-2026").replace(
        "Prose.", "Prose with an — dash."
    )
    assert any("em-dash" in p for p in validate_radar_published(article))


def test_kind_enum_matches_required_sections():
    assert set(REQUIRED_SECTIONS) == {"fr", "en"}
    assert "spec-change" in RADAR_KINDS and len(RADAR_KINDS) == 6


def test_seed_radar_files_on_disk_validate():
    """Every committed seed brief in src/content/radar passes the publish validator."""
    radar_dir = REPO_ROOT / "src" / "content" / "radar"
    files = sorted(radar_dir.glob("*.md"))
    assert files, "expected seed radar briefs on disk"
    for f in files:
        problems = validate_radar_published(f.read_text(encoding="utf-8"))
        assert problems == [], f"{f.name}: {problems}"

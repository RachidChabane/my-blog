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
from ..radar import stages as radar_stages
from ..radar.config import (
    RADAR_MAX_REVIEW_ROUNDS,
    RADAR_RUNS_REL,
    RADAR_STATE_REL,
    RADAR_TEMPLATE_REL,
    radar_config_from_env,
    radar_memory_path,
)
from ..radar.prompts import build_radar_draft_prompt, build_radar_publish_prompt
from ..radar.stages import (
    RADAR_KINDS,
    RadarEntry,
    build_radar_article,
    entry_problems,
    validate_radar_published,
    write_entries,
)
from ..runner import assemble_slate

REPO_ROOT = Path(__file__).resolve().parents[2]


def _valid_entry() -> dict:
    fr_body = "## Le contrat de l'outil\n\nTexte.\n\n## Ce que cela coûte à l'équipe\n\nTexte."
    en_body = "## The tool contract\n\nProse.\n\n## What it costs the team\n\nProse."
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
    bad["body_en"] = "## The tool contract\n\nThe spec lands [s1] and then it lands again [s1]."
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


def test_kind_enum_has_six_kinds():
    assert "spec-change" in RADAR_KINDS and len(RADAR_KINDS) == 6


def test_radar_section_headings_are_free(tmp_path):
    repo = tmp_path / "repo"
    repo.mkdir()
    entry = _valid_entry()
    entry["body_en"] = "A plain brief without any section heading."
    entry["body_fr"] = "Une brève simple, sans intertitre."
    results = write_entries(
        [entry], repo, publish_date="22-06-2026", memory_path=tmp_path / "m.json"
    )
    assert results[0].ok, results[0].problems


def test_radar_validate_reports_voice_rules():
    entry = RadarEntry.from_dict(_valid_entry())
    long_title = replace(
        entry, title_en="A title that runs on, and then keeps going with a second clause"
    )
    problems = validate_radar_published(
        build_radar_article(long_title, "en", publish_date="22-06-2026")
    )
    assert any(p.startswith("voice: title-clauses") for p in problems)
    repeated = replace(entry, body_en="One claim [s1] and the same source again [s1].")
    problems = validate_radar_published(
        build_radar_article(repeated, "en", publish_date="22-06-2026")
    )
    assert any(p.startswith("voice: repeated-citation") for p in problems)


def _seed_worn_radar(repo: Path, headings: tuple[str, ...]) -> None:
    out = repo / "src" / "content" / "radar"
    out.mkdir(parents=True)
    for i in range(2):
        body = "\n\n".join(f"## {h}\n\nText." for h in headings)
        (out / f"old-{i}.en.md").write_text(
            f"---\ntitle: Old {i}\nlang: en\npublishDate: 0{i + 1}-06-2026\n---\n\n{body}\n",
            encoding="utf-8",
        )


def test_radar_publish_blocks_a_worn_heading_in_either_language(tmp_path):
    repo = tmp_path / "repo"
    _seed_worn_radar(repo, ("The tool contract",))
    results = write_entries(
        [_valid_entry()], repo, publish_date="22-06-2026", memory_path=tmp_path / "m.json"
    )
    assert not results[0].ok
    assert any(p.startswith("en: voice: reused-heading") for p in results[0].problems)
    assert not (repo / "src" / "content" / "radar" / "demo-brief.en.md").exists()
    assert not (repo / "src" / "content" / "radar" / "breve-demo.fr.md").exists()


def test_seed_radar_files_on_disk_validate():
    """Every committed seed brief in src/content/radar passes the structural validator
    (frontmatter schema, no em-dash). Voice rules are a drafting gate: briefs published
    before they existed are not rewritten, so ``voice:`` findings are excluded here."""
    radar_dir = REPO_ROOT / "src" / "content" / "radar"
    files = sorted(radar_dir.glob("*.md"))
    assert files, "expected seed radar briefs on disk"
    for f in files:
        problems = [
            p
            for p in validate_radar_published(f.read_text(encoding="utf-8"))
            if not p.startswith("voice:")
        ]
        assert problems == [], f"{f.name}: {problems}"


# --------------------------------------------------------------------------- prompts

_ABS_REPO = Path("/abs/repo")
_ABS_RUN = Path("/abs/repo/pipeline/runs-radar/run-1")
_DRAFT_DIR = "/abs/repo/pipeline/runs-radar/run-1/plans/task-draft"
_FIXED_SECTION_NAMES = (
    "What changed",
    "Ce qui change",
    "Impact on your team",
    "Impact pour une",
)


def _radar_prompts() -> dict[str, str]:
    return {
        "draft": build_radar_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN),
        "publish": build_radar_publish_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN),
    }


@pytest.mark.parametrize("stage", ["draft", "publish"])
def test_radar_prompts_are_ascii_and_deterministic(stage):
    assert _radar_prompts()[stage].isascii()
    assert _radar_prompts()[stage] == _radar_prompts()[stage]


def test_radar_draft_prompt_names_check_and_both_verdict_paths():
    p = _radar_prompts()["draft"]
    check = (
        "PYTHONPATH=/abs/repo python3 -m pipeline.radar.stages check "
        "--run-dir /abs/repo/pipeline/runs-radar/run-1 --repo-root /abs/repo"
    )
    assert check in p
    assert f"{_DRAFT_DIR}/style-fr.json" in p
    assert f"{_DRAFT_DIR}/style-en.json" in p
    assert f"{_DRAFT_DIR}/entry.json" in p
    assert "READER JUDGE (fr)" in p and "READER JUDGE (en)" in p
    assert "/abs/repo/pipeline/voice/cache/fr" in p and "/abs/repo/pipeline/voice/cache/en" in p
    assert "style-auditor" not in p


def test_radar_draft_prompt_guides_title_and_summary():
    p = _radar_prompts()["draft"]
    assert "TITLE: what happened, in one clause" in p
    assert "SUMMARY: one or two sentences" in p
    assert "CITATIONS FOLLOW THE POINT" in p


def test_radar_publish_prompt_names_publish_and_verdict_files():
    p = _radar_prompts()["publish"]
    assert (
        "PYTHONPATH=/abs/repo python3 -m pipeline.radar.stages publish "
        "--run-dir /abs/repo/pipeline/runs-radar/run-1 --repo-root /abs/repo"
    ) in p
    assert "style-fr.json" in p and "style-en.json" in p


@pytest.mark.parametrize("stage", ["draft", "publish"])
def test_radar_prompts_fix_no_section_names(stage):
    p = _radar_prompts()[stage]
    for name in _FIXED_SECTION_NAMES:
        assert name not in p


# --------------------------------------------------------------------------- entry_problems


def test_entry_problems_empty_for_a_valid_entry(tmp_path):
    entry = RadarEntry.from_dict(_valid_entry())
    assert entry_problems(entry, tmp_path, publish_date="22-06-2026") == []


def test_entry_problems_reports_missing_key_and_equal_slugs(tmp_path):
    raw = _valid_entry()
    raw["translationKey"] = ""
    raw["slug_en"] = raw["slug_fr"]
    problems = entry_problems(RadarEntry.from_dict(raw), tmp_path, publish_date="22-06-2026")
    assert "translationKey is empty" in problems
    assert any("slug_fr and slug_en must differ" in p for p in problems)


def test_entry_problems_prefixes_each_language(tmp_path):
    raw = _valid_entry()
    raw["body_fr"] = "Un point [s1] puis le meme point [s1]."
    raw["body_en"] = "A point [s1] and the same point again [s1]."
    problems = entry_problems(RadarEntry.from_dict(raw), tmp_path, publish_date="22-06-2026")
    assert any(p.startswith("fr: voice: repeated-citation") for p in problems)
    assert any(p.startswith("en: voice: repeated-citation") for p in problems)


# --------------------------------------------------------------------------- check / publish verbs


def _write_run(run_dir: Path, raw: dict | None = None) -> Path:
    draft_dir = run_dir / "plans" / "task-draft"
    draft_dir.mkdir(parents=True)
    (draft_dir / "entry.json").write_text(json.dumps(raw or _valid_entry()), encoding="utf-8")
    return draft_dir


def _write_verdict(draft_dir: Path, lang: str, verdict: str) -> None:
    issues = [] if verdict == "clean" else [{"phrase": "a flagged passage", "pattern": "tell"}]
    (draft_dir / f"style-{lang}.json").write_text(
        json.dumps({"verdict": verdict, "issues": issues}), encoding="utf-8"
    )


def _run_verb(verb: str, run_dir: Path, repo: Path) -> int:
    argv = [verb, "--run-dir", str(run_dir), "--repo-root", str(repo)]
    if verb in ("check", "publish"):
        argv += ["--publish-date", "22-06-2026"]
    return radar_stages._main(argv)


def _published_files(repo: Path) -> list[Path]:
    return sorted((repo / "src" / "content" / "radar").glob("*.md"))


def test_check_verb_prints_ok_for_a_valid_entry(tmp_path, capsys):
    run, repo = tmp_path / "run", tmp_path / "repo"
    repo.mkdir()
    _write_run(run)
    assert _run_verb("check", run, repo) == 0
    assert capsys.readouterr().out.strip() == "OK"


def test_check_verb_lists_problems_and_exits_one(tmp_path, capsys):
    run, repo = tmp_path / "run", tmp_path / "repo"
    repo.mkdir()
    raw = _valid_entry()
    raw["body_en"] = "A point [s1] and the same point again [s1]."
    _write_run(run, raw)
    assert _run_verb("check", run, repo) == 1
    assert "en: voice: repeated-citation" in capsys.readouterr().out


def test_check_verb_exits_one_without_an_entry(tmp_path, capsys):
    assert _run_verb("check", tmp_path / "run", tmp_path) == 1
    assert "INVALID" in capsys.readouterr().err


def test_publish_refuses_a_missing_verdict_and_writes_nothing(tmp_path, capsys):
    run, repo = tmp_path / "run", tmp_path / "repo"
    repo.mkdir()
    draft_dir = _write_run(run)
    _write_verdict(draft_dir, "fr", "clean")
    assert _run_verb("publish", run, repo) == 1
    assert "en: missing reader-judge findings" in capsys.readouterr().out
    assert _published_files(repo) == []
    assert not radar_memory_path(repo).exists()


def test_publish_refuses_a_revision_needed_verdict_and_writes_nothing(tmp_path, capsys):
    run, repo = tmp_path / "run", tmp_path / "repo"
    repo.mkdir()
    draft_dir = _write_run(run)
    _write_verdict(draft_dir, "fr", "clean")
    _write_verdict(draft_dir, "en", "revision_needed")
    assert _run_verb("publish", run, repo) == 1
    out = capsys.readouterr().out
    assert "en: style verdict is 'revision_needed'" in out
    assert "[tell] a flagged passage" in out
    assert _published_files(repo) == []
    assert not radar_memory_path(repo).exists()


def test_publish_writes_both_languages_when_both_verdicts_are_clean(tmp_path):
    run, repo = tmp_path / "run", tmp_path / "repo"
    repo.mkdir()
    draft_dir = _write_run(run)
    _write_verdict(draft_dir, "fr", "clean")
    _write_verdict(draft_dir, "en", "clean")
    assert _run_verb("publish", run, repo) == 0
    assert [f.name for f in _published_files(repo)] == ["breve-demo.fr.md", "demo-brief.en.md"]
    assert radar_memory_path(repo).exists()


def test_reader_judge_problems_collects_both_languages(tmp_path):
    draft_dir = _write_run(tmp_path / "run")
    _write_verdict(draft_dir, "fr", "revision_needed")
    problems = radar_stages.reader_judge_problems(tmp_path / "run")
    assert any(p.startswith("fr: style verdict is") for p in problems)
    assert any(p.startswith("en: missing reader-judge findings") for p in problems)

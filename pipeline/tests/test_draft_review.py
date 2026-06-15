"""Offline tests for task 25: draft + review + humanize stages, prompts, house style.

Every test runs offline with on-disk fixtures: no ``claude`` sub-agent, no network, no
secret. These lock the MECHANICS the live draft agent shells out to — frontmatter +
FR/EN parity (``draft.py``), claim->source completeness -> the cpe-parseable verdict
(``review.py``), the style-findings parser + the no-emoji scan (``humanize.py``) — and
that the prompt strings carry the right instructions/paths. They do NOT prove a live
agent obeys the prompt or that the ``style-auditor`` runs; that path is only exercisable
in a real tmux run (the stated boundary in ``test_research_select.py``).

Import convention (review-1.md I1): stage symbols are imported DIRECTLY from
``pipeline.stages.{draft,review,humanize}`` (as ``test_research_select.py`` does); only
the prompt builders + the composition seam come from ``pipeline``. Re-exporting stage
symbols from ``pipeline/__init__.py`` would reintroduce the runpy double-import warning
the import-light ``stages`` package avoids — locked by
``test_stage_clis_have_no_runpy_double_import_warning`` below.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

from pipeline import build_draft_prompt, build_revise_prompt, editorial_stage_descriptions
from pipeline.config import PipelineConfig
from pipeline.contracts.claim_source_map import ClaimSourceMap, ContractError
from pipeline.stages.draft import DraftDoc, validate_draft_pair, validate_draft_run
from pipeline.stages.humanize import (
    MAX_HUMANIZE_ROUNDS,
    find_emoji,
    fr_diacritic_violations,
    house_style_violations,
    parse_style_findings,
    style_passes,
)
from pipeline.stages.review import ReviewReport, parse_verdict, review_claim_source_map

_FIXTURES = Path(__file__).resolve().parent / "fixtures"
_REPO_ROOT = Path(__file__).resolve().parents[2]


def _fixture_text(name: str) -> str:
    return (_FIXTURES / name).read_text(encoding="utf-8")


def _complete_dict() -> dict:
    return json.loads(_fixture_text("claim_source_map.complete.json"))


def _cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    return subprocess.run(
        [sys.executable, "-m", *args], capture_output=True, text=True, env=env
    )


_ABS_REPO = Path("/abs/repo")
_ABS_RUN = Path("/abs/repo/pipeline/runs/run-1")


# ---------------------------------------------------------------------------
# Draft — draft.py
# ---------------------------------------------------------------------------


def test_valid_draft_pair_parses_and_validates():
    fr = _fixture_text("draft-fr.valid.md")
    en = _fixture_text("draft-en.valid.md")
    assert DraftDoc.parse(fr).lang == "fr"
    assert DraftDoc.parse(en).lang == "en"
    assert validate_draft_pair(fr, en) == []


def test_draft_frontmatter_problems():
    # bad lang
    assert any("lang" in p for p in DraftDoc("de", "k", "s", "T", ["a"], "b").validate())
    # empty title
    assert any("title" in p for p in DraftDoc("en", "k", "s", "  ", ["a"], "b").validate())
    # empty tags
    assert any("tags" in p for p in DraftDoc("en", "k", "s", "T", [], "b").validate())
    # a blank tag entry
    assert any("tags[0]" in p for p in DraftDoc("en", "k", "s", "T", [""], "b").validate())
    # empty body
    assert any("body" in p for p in DraftDoc("en", "k", "s", "T", ["a"], "   ").validate())
    # parse path: a draft missing the title key entirely
    txt = "---\nlang: en\ntranslationKey: k\nslug: s\ntags:\n  - a\n---\n\nBody.\n"
    assert any("title" in p for p in DraftDoc.parse(txt).validate())


def test_translation_key_parity_enforced():
    fr = _fixture_text("draft-fr.valid.md")
    # change only the EN translationKey (it precedes the slug line in the fixture)
    en = _fixture_text("draft-en.valid.md").replace(
        "translationKey: agentic-coding-harness-eval",
        "translationKey: a-different-key",
        1,
    )
    problems = validate_draft_pair(fr, en)
    assert any("parity" in p.lower() for p in problems)
    assert any("translationkey" in p.lower() for p in problems)


def test_category_parity_enforced():
    fr = _fixture_text("draft-fr.valid.md")
    # both valid categories, but DIFFERENT -> fr/en would land in different buckets
    en = _fixture_text("draft-en.valid.md").replace(
        "category: explainers", "category: essays", 1
    )
    problems = validate_draft_pair(fr, en)
    assert any("category" in p.lower() and "parity" in p.lower() for p in problems)


def test_difficulty_required_in_range_and_integer():
    # the valid fixtures carry difficulty: 3 (the rubric rating is REQUIRED frontmatter)
    assert DraftDoc.parse(_fixture_text("draft-en.valid.md")).difficulty == 3
    # missing key -> 0 sentinel -> named problem
    no_diff = _fixture_text("draft-en.valid.md").replace("difficulty: 3\n", "", 1)
    assert any("difficulty" in p for p in DraftDoc.parse(no_diff).validate())
    # out of range / wrong type all coerce or flag (a quoted '3' is NOT an int)
    for bad in ("difficulty: 0", "difficulty: 6", "difficulty: '3'", "difficulty: 2.5"):
        txt = _fixture_text("draft-en.valid.md").replace("difficulty: 3", bad, 1)
        assert any(
            "difficulty must be an integer 1-5" in p
            for p in DraftDoc.parse(txt).validate()
        ), bad


def test_difficulty_parity_enforced():
    fr = _fixture_text("draft-fr.valid.md")
    # both in range, but DIFFERENT -> one article would carry two ratings
    en = _fixture_text("draft-en.valid.md").replace(
        "difficulty: 3", "difficulty: 4", 1
    )
    problems = validate_draft_pair(fr, en)
    assert any("difficulty" in p.lower() and "parity" in p.lower() for p in problems)


def test_leading_fence_not_confused_by_body_rule():
    doc = DraftDoc.parse(_fixture_text("draft-en.valid.md"))
    # frontmatter parsed from the LEADING fence only
    assert doc.title == "Evaluating agentic coding harnesses"
    assert doc.lang == "en"
    # the body's '---' horizontal rule survived (was not consumed as frontmatter)
    assert "\n---\n" in doc.body
    assert "Measuring success" in doc.body


def test_validate_draft_run_reads_artifacts(tmp_path):
    draft_dir = tmp_path / "plans" / "task-draft"
    draft_dir.mkdir(parents=True)
    (draft_dir / "draft-fr.md").write_text(_fixture_text("draft-fr.valid.md"), encoding="utf-8")
    (draft_dir / "draft-en.md").write_text(_fixture_text("draft-en.valid.md"), encoding="utf-8")
    (draft_dir / "claim_source_map.json").write_text(
        _fixture_text("claim_source_map.complete.json"), encoding="utf-8"
    )
    assert validate_draft_run(tmp_path) == []
    # an invalid claim_source_map (orphan source_id) surfaces a problem
    bad = _complete_dict()
    bad["claims"][0]["source_id"] = "orphan"
    (draft_dir / "claim_source_map.json").write_text(json.dumps(bad), encoding="utf-8")
    problems = validate_draft_run(tmp_path)
    assert any("claim_source_map" in p for p in problems)


# ---------------------------------------------------------------------------
# Review — review.py
# ---------------------------------------------------------------------------


def test_parse_verdict():
    assert parse_verdict("## Verdict: APPROVED") == "APPROVED"
    assert parse_verdict("## verdict:approved") == "APPROVED"  # case-insensitive, no space
    assert parse_verdict("## Verdict: NEEDS_REVISION") == "NEEDS_REVISION"
    assert parse_verdict("noise\nVERDICT: NEEDS_REVISION\nmore") == "NEEDS_REVISION"
    assert parse_verdict("no verdict at all here") is None


def test_complete_map_is_approved():
    csm = ClaimSourceMap.load_path(_FIXTURES / "claim_source_map.complete.json")
    report = review_claim_source_map(_fixture_text("brief.valid.md"), csm)
    assert report.verdict == "APPROVED"
    assert report.problems == []
    assert report.coverage == {"fr": ["s1", "s2"], "en": ["s1", "s2"]}


def test_partial_coverage_needs_revision():
    # claim_source_map.valid.json: en covers {s1}, fr covers {s2} vs skeleton {s1,s2}.
    csm = ClaimSourceMap.load_path(_FIXTURES / "claim_source_map.valid.json")
    report = review_claim_source_map(_fixture_text("brief.valid.md"), csm)
    assert report.verdict == "NEEDS_REVISION"
    assert any("en" in p and "s2" in p for p in report.problems)  # en missing s2
    assert any("fr" in p and "s1" in p for p in report.problems)  # fr missing s1


def test_empty_language_claims_needs_revision():
    data = _complete_dict()
    data["claims"] = [c for c in data["claims"] if c["lang"] != "en"]
    csm = ClaimSourceMap.from_dict(data)
    report = review_claim_source_map(_fixture_text("brief.valid.md"), csm)
    assert report.verdict == "NEEDS_REVISION"
    assert any("en" in p and "no load-bearing claims" in p for p in report.problems)


def test_parity_mismatch_flagged():
    # drop en/s2 only: fr covers {s1,s2}, en covers {s1} -> parity mismatch.
    data = _complete_dict()
    data["claims"] = [
        c for c in data["claims"] if not (c["lang"] == "en" and c["source_id"] == "s2")
    ]
    csm = ClaimSourceMap.from_dict(data)
    report = review_claim_source_map(_fixture_text("brief.valid.md"), csm)
    assert report.verdict == "NEEDS_REVISION"
    assert report.coverage["fr"] == ["s1", "s2"]
    assert report.coverage["en"] == ["s1"]
    assert any("parity" in p for p in report.problems)


def test_orphan_source_id_caught_first():
    data = _complete_dict()
    data["claims"][0]["source_id"] = "ghost"  # references no source -> structural failure
    csm = ClaimSourceMap.from_dict(data)
    report = review_claim_source_map(_fixture_text("brief.valid.md"), csm)
    assert report.verdict == "NEEDS_REVISION"
    assert any("structural" in p for p in report.problems)


def test_review_verdict_line_is_cpe_parseable():
    for verdict in ("APPROVED", "NEEDS_REVISION"):
        report = ReviewReport(verdict=verdict, problems=[], coverage={"fr": [], "en": []})
        # our emitted line round-trips through the cpe-mirroring parser
        assert parse_verdict(report.verdict_line()) == verdict


# ---------------------------------------------------------------------------
# Humanize — humanize.py
# ---------------------------------------------------------------------------


def test_parse_clean_findings_passes():
    report = parse_style_findings(_fixture_text("style_findings.clean.json"))
    assert style_passes(report) is True
    assert report.issues == []


def test_parse_revision_findings_fails():
    report = parse_style_findings(_fixture_text("style_findings.revision_needed.json"))
    assert style_passes(report) is False
    assert report.issues
    for issue in report.issues:
        assert issue.phrase and issue.pattern


def test_suspicious_does_not_pass():
    # only "clean" passes; "suspicious" / "revision_needed" fail.
    assert style_passes(parse_style_findings({"verdict": "suspicious", "issues": []})) is False
    assert style_passes(parse_style_findings({"verdict": "clean", "issues": []})) is True


def test_bad_style_json_raises():
    with pytest.raises(ContractError):
        parse_style_findings("{not valid json")
    with pytest.raises(ContractError):
        parse_style_findings({"verdict": "totally_bogus", "issues": []})
    with pytest.raises(ContractError):
        parse_style_findings({"issues": []})  # missing verdict


def test_find_emoji():
    # astral-plane emoji are flagged
    assert find_emoji("ship it \U0001F680 party \U0001F389") == ["\U0001F680", "\U0001F389"]
    # ZERO false positives on text symbols + accented FR ([MEM: emoji-detection-regex])
    assert find_emoji("(c) © (r) ® tm ™ cafe café resume résumé") == []
    assert find_emoji("plain ascii only, no glyphs") == []
    # documented recall gap (review-1.md C1): a BMP default-presentation emoji such as
    # U+2705 is NOT caught by the astral-only scan -- the style-auditor is the net.
    assert find_emoji("done ✅") == []


def test_house_style_violations_emoji():
    # the clean draft fixtures (incl. accented FR prose) have no violations
    assert house_style_violations(_fixture_text("draft-en.valid.md")) == []
    assert house_style_violations(_fixture_text("draft-fr.valid.md")) == []
    # a body with an emoji yields at least one violation
    violations = house_style_violations("A draft body with an emoji \U0001F680 in it.")
    assert len(violations) >= 1
    assert any("emoji" in v.lower() for v in violations)


# ---------------------------------------------------------------------------
# Prompts — prompts/draft.py
# ---------------------------------------------------------------------------


def test_draft_prompt_deterministic_and_ascii():
    p1 = build_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    p2 = build_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    assert p1 == p2
    assert p1.isascii()  # ASCII-only => no emoji in the prompt itself (D-007)


def test_draft_prompt_substrings():
    p = build_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)
    for needle in [
        "/abs/repo/pipeline/runs/run-1/plans/task-select/brief.md",
        # task 3: the draft consumes the surviving argument (argue cannot regress to decorative)
        "/abs/repo/pipeline/runs/run-1/plans/task-argue/argument.json",
        "strengthened_argument",
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/draft-fr.md",
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/draft-en.md",
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/claim_source_map.json",
        "/abs/repo/pipeline/house_style.md",
        "claim->source",
        "style-auditor",
        "AUDITOR",
        "separate",
        "does not rewrite",
        "## Verdict: APPROVED",
        "NEEDS_REVISION",
        "parallel",
        "not a raw machine translation",
        "same source_id",
        "D-007",
        "no emoji",
        "context",  # the style context label handed to the auditor
        "python3 -m pipeline.stages.draft validate",
        "python3 -m pipeline.stages.review check",
        "python3 -m pipeline.stages.humanize scan",
        "PYTHONPATH=/abs/repo",
        # fact-check PRODUCER step (task 26 / FR-C1) — judge != author
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/factcheck-fr.json",
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/factcheck-en.json",
        "python3 -m pipeline.gate.factcheck",
        "supported",
        "separate sub-agent",  # the judge != author separation
        "does not see the draft",
        "[s1]",  # the pinned [sN] citation convention the grounding gate keys on
        # G3 editorial-quality PRODUCER step (task 4) -- judge != author, EN-only. All five
        # needles sit on single rendered lines (build_judge_dispatch wraps some phrases, so
        # avoid spanned spans like "FINISHED ARTICLE AS AN ARTICLE"): un-flattened `in p`.
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/editorial.json",  # out_path
        "python3 -m pipeline.gate.editorial",  # the gate shell-out
        '"publishable"',  # verdict vocab (in verdict_schema)
        "editorial judge",  # the dispatched role
        "judge the article's CRAFT",  # the G3 != G1 mandate boundary bullet
        # G2 source-quality PRODUCER step (task 5) -- judge != author, sources-only (no prose)
        "/abs/repo/pipeline/runs/run-1/plans/task-draft/source_quality.json",  # out_path
        "python3 -m pipeline.gate.source_quality",  # the gate shell-out
        "source-quality judge",  # the dispatched role
        '"unsound"',  # verdict vocab (in verdict_schema, on one line: "sound"|"unsound")
        "ALONGSIDE the fact-check",  # the G2-alongside-factcheck framing
        "INDEPENDENT corroboration",  # the corroboration dimension
        # difficulty rating: the rubric is READ (path) + the frontmatter key + the gate
        "/abs/repo/pipeline/difficulty_rubric.md",  # the versioned rubric, read every run
        "difficulty: <integer 1-5>",  # the frontmatter key spec
        "choose the HIGHER",  # the rubric's round-toward-the-reader rule
        # LESSON MODE (no-news days): keyed on the brief's lesson- topic_id prefix
        "LESSON MODE",
        "lesson-",
        "category: lessons",
        "## Quiz",
        "<details><summary>",
        "DIAGRAM",
        # DOSSIER body constructs (the two-column documentation reading surface): the
        # prompt must teach callouts, the verdict pair, GFM tables, and ## sections,
        # plus the faithfulness guards (INFERRED is source-free; placement; parity).
        "BODY CONSTRUCTS",
        "table-of-contents rail",
        "[!NOTE]",
        "[!CAUTION]",
        "VERDICT PAIR",
        "[!CONFIRMED]",
        "[!INFERRED]",
        "SOURCE-FREE BY CONSTRUCTION",  # the INFERRED card carries no [sN]
        "GFM table",
        "NEVER opens the body",  # the dek-placement guard
    ]:
        assert needle in p, f"draft prompt missing {needle!r}"
    assert "Nine gates BLOCK this task" in p  # +difficulty-rating on top of the eight
    # the round cap is interpolated into the humanize section (asserted in context, not
    # as a bare '2' which would also match paths / 's2'). Use a distinctive value.
    p7 = build_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN, max_humanize_rounds=7)
    assert "up to 7 round" in p7
    assert "up to 7 round" not in p  # the default differs from 7
    assert f"up to {MAX_HUMANIZE_ROUNDS} round" in p  # default == the canonical constant


def test_revise_prompt_separation():
    r = build_revise_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN, lang="fr")
    assert r.isascii()
    assert "/abs/repo/pipeline/runs/run-1/plans/task-draft/style-fr.json" in r
    assert "/abs/repo/pipeline/runs/run-1/plans/task-draft/draft-fr.md" in r
    assert "suggested_fix" in r
    assert "apply" in r.lower()
    assert "do not re-audit" in r  # the auditor != editor separation
    assert "no emoji" in r.lower()


def test_editorial_stage_descriptions_includes_draft():
    config = PipelineConfig(repo_root=_ABS_REPO)
    descriptions = editorial_stage_descriptions(config, _ABS_RUN)
    # task 3 added "argue"; task 27 adds "publish" to the composition seam.
    assert set(descriptions) == {"research", "select", "argue", "draft", "publish"}
    assert descriptions["draft"] == build_draft_prompt(repo_root=_ABS_REPO, run_dir=_ABS_RUN)


# ---------------------------------------------------------------------------
# House style — house_style.md
# ---------------------------------------------------------------------------


def test_house_style_no_emoji_and_covers_rules():
    text = (_REPO_ROOT / "pipeline" / "house_style.md").read_text(encoding="utf-8")
    assert find_emoji(text) == []  # the guide self-passes the no-emoji scan
    low = text.lower()
    for needle in (
        "no emoji",
        "d-007",
        "citation",
        "translationkey",
        "bilingual",
        "voice",
        # the DOSSIER reading-surface constructs the draft prompt delegates here
        "callout",
        "verdict pair",
        "[!confirmed]",
        "[!inferred]",
        "contents rail",
    ):
        assert needle in low, f"house_style.md missing {needle!r}"


# ---------------------------------------------------------------------------
# DOSSIER body constructs survive the deterministic draft path unchanged.
# The render contract (src/lib/remark-callouts.mjs + src/components/Prose.astro)
# is GitHub-alert callouts, an adjacent CONFIRMED/INFERRED verdict pair, GFM
# tables, and ## sections. None of the deterministic stages (draft validate, the
# style/diacritic scans, the frontmatter split) may reject or mangle them; this
# locks that in so a future scan tweak cannot silently break generated articles.
# ---------------------------------------------------------------------------

_CONSTRUCTS_EN = """\
---
lang: en
translationKey: dossier-constructs-fixture
slug: dossier-constructs-fixture
title: Constructs survive the pipeline
category: explainers
difficulty: 3
tags:
  - rendering
---

A harness runs tool-use loops over a task suite [s1]. This is the take.

## How it actually scores

Benchmarks measure pass rate across multi-step tasks [s2].

> [!NOTE]
> Needle-in-a-haystack recall is not the same as agentic success.

| Retriever | Catches | Misses |
| --- | :---: | ---: |
| Lexical | Exact ids | Paraphrases |
| Vector | Paraphrases | Exact ids |

> [!CONFIRMED]
> The benchmark reports end-to-end completion, not per-step accuracy [s2].

> [!INFERRED]
> In my experience that gap is where most harnesses quietly fail.
"""

_CONSTRUCTS_FR = """\
---
lang: fr
translationKey: dossier-constructs-fixture
slug: les-constructs-survivent
title: Les constructs survivent au pipeline
category: explainers
difficulty: 3
tags:
  - rendering
---

Un harnais exécute des boucles d'outils sur une suite de tâches [s1]. Voici la thèse.

## Comment on le mesure vraiment

Les benchmarks mesurent le taux de réussite sur des tâches multi-étapes [s2].

> [!NOTE]
> La recherche d'aiguille dans une botte de foin n'est pas la réussite agentique.

| Récupérateur | Attrape | Manque |
| --- | :---: | ---: |
| Lexical | Identifiants exacts | Paraphrases |
| Vectoriel | Paraphrases | Identifiants exacts |

> [!CONFIRMED]
> Le benchmark mesure l'achèvement de bout en bout, pas la précision par étape [s2].

> [!INFERRED]
> D'après mon expérience, c'est là que la plupart des harnais échouent.
"""


def test_dossier_constructs_pass_deterministic_scans():
    # The lang-agnostic hard scans (no-emoji + no-em-dash) see nothing to flag in a
    # body full of callouts, a verdict pair, and a GFM table; the FR-diacritic scan
    # is clean because the construct bodies keep their accents (markers stay ASCII).
    for text in (_CONSTRUCTS_EN, _CONSTRUCTS_FR):
        assert house_style_violations(text) == []
    assert fr_diacritic_violations(_CONSTRUCTS_FR) == []


def test_dossier_constructs_parse_and_validate():
    # The author-time self-gate accepts the pair (frontmatter + parity); it imposes no
    # structural constraint on the body, so the constructs neither fail nor are required.
    assert validate_draft_pair(_CONSTRUCTS_FR, _CONSTRUCTS_EN) == []


def test_dossier_constructs_survive_frontmatter_split_verbatim():
    # DraftDoc.parse strips only the leading fence; every construct must reach the body
    # untouched (publish concatenates this body verbatim, so what parses here ships).
    for text in (_CONSTRUCTS_EN, _CONSTRUCTS_FR):
        body = DraftDoc.parse(text).body
        for fragment in ("## ", "> [!NOTE]", "> [!CONFIRMED]", "> [!INFERRED]", ":---:"):
            assert fragment in body, f"construct {fragment!r} lost in frontmatter split"
    # Faithfulness contract: the INFERRED card is source-free (only CONFIRMED cites).
    en_inferred = _CONSTRUCTS_EN.split("> [!INFERRED]", 1)[1]
    assert "[s" not in en_inferred


# ---------------------------------------------------------------------------
# CLI self-gates (subprocess over a tmp run-dir) — DoD section 7
# ---------------------------------------------------------------------------


def test_draft_validate_cli(tmp_path):
    draft_dir = tmp_path / "plans" / "task-draft"
    draft_dir.mkdir(parents=True)
    (draft_dir / "draft-fr.md").write_text(_fixture_text("draft-fr.valid.md"), encoding="utf-8")
    (draft_dir / "draft-en.md").write_text(_fixture_text("draft-en.valid.md"), encoding="utf-8")
    (draft_dir / "claim_source_map.json").write_text(
        _fixture_text("claim_source_map.complete.json"), encoding="utf-8"
    )
    ok = _cli(["pipeline.stages.draft", "validate", "--run-dir", str(tmp_path)])
    assert ok.returncode == 0, ok.stderr
    assert "OK" in ok.stdout
    # break FR/EN parity -> exit 1
    (draft_dir / "draft-en.md").write_text(
        _fixture_text("draft-en.valid.md").replace(
            "translationKey: agentic-coding-harness-eval", "translationKey: mismatch", 1
        ),
        encoding="utf-8",
    )
    bad = _cli(["pipeline.stages.draft", "validate", "--run-dir", str(tmp_path)])
    assert bad.returncode == 1


def test_review_check_cli_writes_review_json(tmp_path):
    sel = tmp_path / "plans" / "task-select"
    sel.mkdir(parents=True)
    (sel / "brief.md").write_text(_fixture_text("brief.valid.md"), encoding="utf-8")
    draft_dir = tmp_path / "plans" / "task-draft"
    draft_dir.mkdir(parents=True)
    (draft_dir / "claim_source_map.json").write_text(
        _fixture_text("claim_source_map.complete.json"), encoding="utf-8"
    )
    ok = _cli(["pipeline.stages.review", "check", "--run-dir", str(tmp_path)])
    assert ok.returncode == 0, ok.stderr
    assert "## Verdict: APPROVED" in ok.stdout
    review_json = draft_dir / "review.json"
    assert review_json.exists()
    payload = json.loads(review_json.read_text(encoding="utf-8"))
    assert payload["verdict"] == "APPROVED"
    assert payload["coverage"] == {"fr": ["s1", "s2"], "en": ["s1", "s2"]}
    # a partial map -> NEEDS_REVISION + exit 1
    (draft_dir / "claim_source_map.json").write_text(
        _fixture_text("claim_source_map.valid.json"), encoding="utf-8"
    )
    bad = _cli(["pipeline.stages.review", "check", "--run-dir", str(tmp_path)])
    assert bad.returncode == 1
    assert "## Verdict: NEEDS_REVISION" in bad.stdout


def test_humanize_scan_cli(tmp_path):
    clean = tmp_path / "clean.md"
    clean.write_text(_fixture_text("draft-en.valid.md"), encoding="utf-8")
    ok = _cli(["pipeline.stages.humanize", "scan", str(clean)])
    assert ok.returncode == 0, ok.stderr
    assert "OK" in ok.stdout
    emoji = tmp_path / "emoji.md"
    emoji.write_text("Body with \U0001F680 emoji.\n", encoding="utf-8")
    bad = _cli(["pipeline.stages.humanize", "scan", str(emoji)])
    assert bad.returncode == 1


def test_humanize_verdict_cli():
    ok = _cli(["pipeline.stages.humanize", "verdict", str(_FIXTURES / "style_findings.clean.json")])
    assert ok.returncode == 0, ok.stderr
    assert "clean" in ok.stdout
    rn_path = str(_FIXTURES / "style_findings.revision_needed.json")
    bad = _cli(["pipeline.stages.humanize", "verdict", rn_path])
    assert bad.returncode == 1


def test_stage_clis_have_no_runpy_double_import_warning():
    # Regression lock for review-1.md I1 / the import-light pipeline.stages invariant:
    # running a stage module must not emit the runpy double-import RuntimeWarning. With
    # -W error::RuntimeWarning the warning becomes a nonzero exit, so a future regression
    # (re-exporting stage symbols from pipeline/__init__.py, or a top-level constant
    # import in prompts/draft.py) fails here even though it is stderr-only at runtime.
    env = {**os.environ, "PYTHONPATH": str(_REPO_ROOT)}
    for mod in ("draft", "review", "humanize"):
        argv = [sys.executable, "-W", "error::RuntimeWarning", "-m", f"pipeline.stages.{mod}"]
        proc = subprocess.run(
            [*argv, "--help"], capture_output=True, text=True, env=env
        )
        assert proc.returncode == 0, f"{mod}: unexpected warning/error:\n{proc.stderr}"

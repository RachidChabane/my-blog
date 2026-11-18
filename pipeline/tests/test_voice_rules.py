"""Voice rules: every rule in both languages, thresholds, exemptions, worn headings, CLI."""

from __future__ import annotations

import random
import subprocess
import sys
from pathlib import Path

import pytest

from ..voice import rules
from ..voice.rules import (
    ATTRIBUTION_FLOOR,
    EXEMPT_HEADINGS,
    OPINION_MARKER_FLOOR,
    TITLE_MAX_CHARS,
    attribution_violations,
    count_words,
    opinion_marker_violations,
    repeated_citation_violations,
    reused_heading_violations,
    split_frontmatter,
    title_violations,
    voice_violations,
    worn_headings,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
FILLER = "word"
SEED = 20260718


def _padded(sentences: list[str], words: int = 0) -> str:
    text = " ".join(sentences)
    return text + (" " + " ".join([FILLER] * words) if words else "")


def _publish(directory: Path, name: str, date: str, headings: list[str], lang: str = "en") -> None:
    body = "\n\n".join(f"## {h}\n\nText." for h in headings)
    (directory / f"{name}.{lang}.md").write_text(
        f"---\ntitle: {name}\nlang: {lang}\npublishDate: {date}\n---\n\n{body}\n",
        encoding="utf-8",
    )


# ------------------------------------------------------------------ title


@pytest.mark.parametrize(
    "title",
    ["Evaluating agentic coding harnesses", "Évaluer les harnais de codage agentique"],
)
def test_title_single_clause_passes(title):
    assert title_violations(title) == []


@pytest.mark.parametrize(
    "title",
    [
        "Caches are cheap, and misses are not",
        "Les caches coûtent peu, et les ratés beaucoup",
        "A fast model, but a slow gate",
        "Un modèle rapide, mais une barrière lente",
        "Ship it, so the team can learn",
        "Livrer, donc apprendre",
        "Tests pass, while builds fail",
        "Les tests passent, alors que le build échoue",
        "Latency drops, where caches hit",
        "La latence baisse, où le cache répond",
        "Retries help, when errors are transient",
        "Réessayer aide, quand l'erreur passe",
        "It is fast, not safe",
        "Rapide, pas sûr",
        "Rapide, non fiable",
        "One idea; another idea",
    ],
)
def test_title_clause_joiner_fails(title):
    problems = title_violations(title)
    assert len(problems) == 1 and problems[0].startswith("voice: title-clauses")


def test_title_joiner_is_case_insensitive():
    assert title_violations("Fast, AND cheap")


def test_title_comma_without_joiner_passes():
    assert title_violations("Agents, tools, loops") == []
    assert title_violations("Agents, nonlinear flows") == []


def test_title_length_boundary():
    assert title_violations("a" * TITLE_MAX_CHARS) == []
    problems = title_violations("a" * (TITLE_MAX_CHARS + 1))
    assert len(problems) == 1 and "title-length" in problems[0]


def test_generated_short_joiner_free_titles_pass():
    rng = random.Random(SEED)
    alphabet = "abcdefghijklmnopqrstuvwxyz -"
    for _ in range(200):
        title = "".join(rng.choice(alphabet) for _ in range(rng.randint(0, TITLE_MAX_CHARS)))
        assert title_violations(title) == [], title


# ------------------------------------------------------------------ opinion markers


def test_opinion_at_floor_passes_and_above_fails_en():
    ok = _padded(["I think so.", "In my view, yes."])
    assert OPINION_MARKER_FLOOR == 2 and opinion_marker_violations(ok) == []
    problems = opinion_marker_violations(ok + " I believe it.")
    assert len(problems) == 1
    assert "3" in problems[0] and "allowed 2" in problems[0]
    assert "i think" in problems[0] and "in my view" in problems[0]


def test_opinion_at_floor_passes_and_above_fails_fr():
    ok = "Je pense que oui. À mon avis, oui."
    assert opinion_marker_violations(ok) == []
    assert len(opinion_marker_violations(ok + " Selon moi, non.")) == 1


def test_opinion_curly_apostrophe_matches_straight():
    body = "D’après mon expérience, oui. d'après mon expérience, non. D’après mon expérience."
    # 'd'après mon expérience' x3 (> floor of 2)
    assert len(opinion_marker_violations(body)) == 1


def test_opinion_allowance_scales_with_length():
    markers = " ".join(["I think so."] * 4)
    short = markers
    long = markers + " " + " ".join([FILLER] * 2000)  # 2000+ words -> allowance 4
    assert opinion_marker_violations(short)
    assert opinion_marker_violations(long) == []
    assert opinion_marker_violations(markers + " " + " ".join([FILLER] * 1900))


def test_opinion_longest_marker_counts_once():
    assert opinion_marker_violations("In my reading. In my reading. In my reading.")


def test_opinion_word_boundary_and_code_exemption():
    assert opinion_marker_violations("I thinking I thinker " * 5) == []
    fenced = "```\nI think I think I think I think\n```\nPlain."
    assert opinion_marker_violations(fenced) == []


def test_generated_bodies_without_markers_pass():
    rng = random.Random(SEED)
    vocab = ["agent", "loop", "cache", "token", "modèle", "pense", "croire", "think", "my", "view"]
    for _ in range(100):
        body = " ".join(rng.choice(vocab) for _ in range(rng.randint(0, 300)))
        # 'my view' alone is not a marker; guard the one real marker 'my reading' / 'in my view'
        if "in my view" in body:
            continue
        assert opinion_marker_violations(body) == [], body


# ------------------------------------------------------------------ attributions


def test_attribution_at_floor_passes_and_above_fails_en():
    ok = "According to the spec, a. Anthropic says b. Google and OpenAI note c."
    assert ATTRIBUTION_FLOOR == 3 and attribution_violations(ok) == []
    problems = attribution_violations(ok + " Wang et al. found d.")
    assert len(problems) == 1 and "4" in problems[0] and "allowed 3" in problems[0]


def test_attribution_at_floor_passes_and_above_fails_fr():
    ok = "Selon le billet, a. Anthropic écrit b. D'après Google, c."
    assert attribution_violations(ok) == []
    assert attribution_violations(ok + " Mughal et Bilal rapportent d.")
    assert attribution_violations("À en croire X, a. Selon Y, b. Selon Z, c. D’après W, d.")


def test_attribution_nouns_and_pronouns_are_not_sources():
    text = (
        "The report shows it. It shows more. This shows that. La mesure montre. My claim says. " * 3
    )
    assert attribution_violations(text) == []


def test_attribution_mid_sentence_selon_is_not_a_lead():
    assert (
        attribution_violations(
            "Cela varie selon le cas, selon la taille, selon le but, selon tout."
        )
        == []
    )


def test_attribution_allowance_scales_with_length():
    text = " ".join(["Anthropic says a."] * 6)
    assert attribution_violations(text)
    assert attribution_violations(text + " " + " ".join([FILLER] * 3000)) == []


def test_attribution_ignores_fenced_code():
    fenced = "```\n" + "Anthropic says a.\n" * 10 + "```\n"
    assert attribution_violations(fenced) == []


# ------------------------------------------------------------------ repeated citation


def test_repeated_citation_fails_in_one_paragraph_en_and_fr():
    for text in (
        "The loop runs [s1] and the loop ends [s1].",
        "La boucle tourne [s2] et la boucle finit [s2].",
    ):
        problems = repeated_citation_violations(text)
        assert len(problems) == 1 and problems[0].startswith("voice: repeated-citation")
        assert "[s1]" in problems[0] or "[s2]" in problems[0]


def test_repeated_citation_across_paragraphs_passes():
    assert repeated_citation_violations("First [s1].\n\nSecond [s1].") == []


def test_repeated_citation_distinct_ids_pass():
    assert repeated_citation_violations("A [s1] B [s2] C [s10].") == []


def test_repeated_citation_one_problem_per_paragraph():
    body = "A [s1] [s1].\n\nB [s2] [s2] [s3].\n\nC [s4]."
    assert len(repeated_citation_violations(body)) == 2


def test_repeated_citation_exempts_table_rows_and_code():
    table = "| a | b |\n| - | - |\n| x [s1] | y [s1] |\n| z [s1] | w |"
    assert repeated_citation_violations(table) == []
    fenced = "```\nx [s1]\ny [s1]\n```"
    assert repeated_citation_violations(fenced) == []


def test_repeated_citation_table_rows_do_not_hide_prose_duplicates():
    body = "| a [s1] |\nProse [s1] and again [s1]."
    assert len(repeated_citation_violations(body)) == 1


# ------------------------------------------------------------------ headings


def test_reused_heading_normalization_en_and_fr():
    worn = frozenset({"what changed", "ce qui change"})
    assert reused_heading_violations("## What changed\n\nx", worn)
    assert reused_heading_violations("##   WHAT   Changed:  \n\nx", worn)
    assert reused_heading_violations("## Ce qui change ?\n\nx", worn)
    assert reused_heading_violations("## A fresh heading\n\nx", worn) == []


def test_reused_heading_only_level_two_and_not_in_code():
    worn = frozenset({"what changed"})
    assert reused_heading_violations("### What changed\n\nx", worn) == []
    assert reused_heading_violations("```\n## What changed\n```", worn) == []


def test_quiz_is_exempt():
    assert "quiz" in EXEMPT_HEADINGS
    assert reused_heading_violations("## Quiz\n\nx", frozenset({"quiz"})) == []


# ------------------------------------------------------------------ worn_headings


def test_worn_headings_min_uses_and_window(tmp_path):
    _publish(tmp_path, "a", "01-06-2026", ["Shared", "Only a"])
    _publish(tmp_path, "b", "02-06-2026", ["Shared"])
    _publish(tmp_path, "c", "03-06-2026", ["Other"])
    assert worn_headings(tmp_path, "en") == frozenset({"shared"})
    assert worn_headings(tmp_path, "en", min_uses=3) == frozenset()
    assert worn_headings(tmp_path, "en", min_uses=1) == frozenset({"shared", "only a", "other"})
    # window=2 keeps the two most recent (c, b): 'shared' is used once only
    assert worn_headings(tmp_path, "en", window=2) == frozenset()
    assert worn_headings(tmp_path, "en", window=2, min_uses=1) == frozenset({"shared", "other"})


def test_worn_headings_sorts_by_publish_date_not_filename_and_breaks_ties_by_name(tmp_path):
    _publish(tmp_path, "zzz", "01-01-2026", ["Old"])
    _publish(tmp_path, "aaa", "09-12-2026", ["New"])
    assert worn_headings(tmp_path, "en", window=1, min_uses=1) == frozenset({"new"})
    _publish(tmp_path, "mmm", "09-12-2026", ["Tie"])
    assert worn_headings(tmp_path, "en", window=1, min_uses=1) == frozenset({"tie"})


def test_worn_headings_is_per_language_and_counts_a_file_once(tmp_path):
    _publish(tmp_path, "a", "01-06-2026", ["Twice", "Twice"], lang="fr")
    _publish(tmp_path, "b", "02-06-2026", ["Twice"], lang="en")
    assert worn_headings(tmp_path, "fr") == frozenset()
    assert worn_headings(tmp_path, "en") == frozenset()


def test_worn_headings_missing_dir_and_bad_dates(tmp_path):
    assert worn_headings(tmp_path / "nope", "en") == frozenset()
    (tmp_path / "x.en.md").write_text("---\ntitle: x\n---\n## H\n", encoding="utf-8")
    (tmp_path / "y.en.md").write_text("no frontmatter\n## H\n", encoding="utf-8")
    assert worn_headings(tmp_path, "en") == frozenset({"h"})


# ------------------------------------------------------------------ composition + helpers


def test_voice_violations_composes_all_rules():
    body = "## Worn\n\nA [s1] B [s1]. " + "I think so. " * 3
    problems = voice_violations(title="One, and two", body=body, worn=frozenset({"worn"}))
    kinds = {p.split()[1] for p in problems}
    assert kinds == {"title-clauses:", "opinion-markers:", "repeated-citation:", "reused-heading:"}
    assert all(p.startswith("voice: ") for p in problems)


def test_voice_violations_clean_text_is_empty():
    assert voice_violations(title="A clean title", body="## Fresh\n\nPlain prose [s1].") == []


def test_split_frontmatter_and_word_count_ignore_code():
    title, body = split_frontmatter("---\ntitle: Hello there\n---\n\nOne two.\n")
    assert title == "Hello there" and body.split() == ["One", "two."]
    assert split_frontmatter("no fence here") == ("", "no fence here")
    assert count_words("a b\n```\nc d e\n```\nf") == 3


# ------------------------------------------------------------------ CLI


def _cli(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "pipeline.voice.rules", *args],
        capture_output=True,
        text=True,
        cwd=REPO_ROOT,
    )


def test_cli_ok_and_failure_exit_codes(tmp_path):
    draft = tmp_path / "draft.md"
    draft.write_text(
        "---\ntitle: A clean title\n---\n\n## Fresh\n\nPlain [s1].\n", encoding="utf-8"
    )
    ok = _cli(
        "check",
        str(draft),
        "--collection",
        "articles",
        "--lang",
        "en",
        "--repo-root",
        str(tmp_path),
    )
    assert ok.returncode == 0 and ok.stdout.strip() == "OK"

    draft.write_text("---\ntitle: Bad, but title\n---\n\n## Fresh\n\nPlain.\n", encoding="utf-8")
    bad = _cli(
        "check",
        str(draft),
        "--collection",
        "articles",
        "--lang",
        "en",
        "--repo-root",
        str(tmp_path),
    )
    assert bad.returncode == 1 and "voice: title-clauses" in bad.stdout


def test_cli_uses_worn_headings_of_the_collection(tmp_path):
    radar = tmp_path / "src" / "content" / "radar"
    radar.mkdir(parents=True)
    _publish(radar, "a", "01-06-2026", ["Worn one"])
    _publish(radar, "b", "02-06-2026", ["Worn one"])
    draft = tmp_path / "draft.md"
    draft.write_text("---\ntitle: Fine\n---\n\n## Worn one\n\nText.\n", encoding="utf-8")
    radar_run = _cli(
        "check", str(draft), "--collection", "radar", "--lang", "en", "--repo-root", str(tmp_path)
    )
    assert radar_run.returncode == 1 and "reused-heading" in radar_run.stdout
    articles_run = _cli(
        "check",
        str(draft),
        "--collection",
        "articles",
        "--lang",
        "en",
        "--repo-root",
        str(tmp_path),
    )
    assert articles_run.returncode == 0


def test_cli_default_repo_root_is_the_repository():
    assert rules.REPO_ROOT == REPO_ROOT

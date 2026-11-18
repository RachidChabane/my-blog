"""Deterministic voice rules: countable tics of machine-sounding prose, blocked by code.

Pure functions returning ``list[str]`` of problems (empty == clean). Every message starts
with ``voice:`` and names the rule and the offending text so a writer can fix it. The only
I/O is ``worn_headings`` (reads recently published files). Import-light on purpose: stdlib
plus PyYAML, so the gate CLIs can run it as ``python3 -m pipeline.voice.rules``
[MEM: pipeline-stages-import-light-runpy].

Rules: (1) title shape, (2) first-person opinion markers, (3) attribution constructions,
(4) a citation repeated inside one paragraph, (5) a ``## `` heading reused across recent
publications.
"""

from __future__ import annotations

import re
import sys
from datetime import date, datetime
from pathlib import Path

import yaml

VOICE_PREFIX = "voice:"

REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_REL = "src/content"
COLLECTIONS = ("articles", "radar")
LANGS = ("fr", "en")

PUBLISH_DATE_FORMAT = "%d-%m-%Y"
PUBLISHED_SUFFIX = ".md"

# --- thresholds -------------------------------------------------------------------
TITLE_MAX_CHARS = 70
OPINION_MARKER_FLOOR = 2
OPINION_MARKERS_PER_1000_WORDS = 2
ATTRIBUTION_FLOOR = 3
ATTRIBUTIONS_PER_1000_WORDS = 2
RECENT_WINDOW = 30
WORN_MIN_USES = 2
WORDS_PER_THOUSAND = 1000
QUOTE_PREVIEW_CHARS = 60

# --- word lists -------------------------------------------------------------------
TITLE_CLAUSE_JOINERS = (
    "et",
    "and",
    "mais",
    "but",
    "donc",
    "so",
    "alors que",
    "while",
    "où",
    "where",
    "quand",
    "when",
    "pas",
    "not",
    "non",
)
TITLE_CLAUSE_SEMICOLON = ";"

OPINION_MARKERS_EN = (
    "I think",
    "I believe",
    "I suspect",
    "in my experience",
    "in my reading",
    "as I read",
    "my reading",
    "to my mind",
    "in my view",
    "my recommendation",
)
OPINION_MARKERS_FR = (
    "je pense",
    "je crois",
    "à mon avis",
    "à mon sens",
    "selon moi",
    "à ma lecture",
    "ma lecture",
    "d'après mon expérience",
    "de mon point de vue",
    "ma recommandation",
)

ATTRIBUTION_LEADS = ("According to", "D'après", "Selon", "À en croire")
ATTRIBUTION_VERBS_EN = (
    "writes?",
    "wrote",
    "reports?",
    "reported",
    "says?",
    "said",
    "notes?",
    "noted",
    "states?",
    "describes?",
    "defines?",
    "warns?",
    "recommends?",
    "asks?",
    "adds?",
    "finds?",
    "found",
    "argues?",
    "shows?",
    "measures?",
    "computes",
    "computed",
    "claims?",
    "cites?",
)
ATTRIBUTION_VERBS_FR = (
    "écrit",
    "écrivent",
    "rapporte(?:nt)?",
    "indique(?:nt)?",
    "note(?:nt)?",
    "précise(?:nt)?",
    "affirme(?:nt)?",
    "décrit",
    "décrivent",
    "définit",
    "définissent",
    "recommande(?:nt)?",
    "ajoute(?:nt)?",
    "montre(?:nt)?",
    "mesure(?:nt)?",
    "annonce(?:nt)?",
    "constate(?:nt)?",
    "signale(?:nt)?",
    "rappelle(?:nt)?",
)
# Capitalized words that open a sentence without naming a source: pronouns ("It shows")
# and determiners or possessives ("The report", "La mesure", "My claim") that make the
# following reporting-verb lookalike a noun.
NON_SOURCE_CAPITALIZED = frozenset(
    {
        "i",
        "it",
        "this",
        "that",
        "these",
        "those",
        "he",
        "she",
        "they",
        "we",
        "you",
        "there",
        "here",
        "which",
        "who",
        "what",
        "one",
        "each",
        "everything",
        "nothing",
        "il",
        "elle",
        "ils",
        "elles",
        "ce",
        "cela",
        "ceci",
        "ça",
        "on",
        "nous",
        "je",
        "vous",
        "tu",
        "tout",
        "chacun",
        "rien",
        "ici",
        "qui",
        "que",
        "the",
        "a",
        "an",
        "my",
        "our",
        "your",
        "their",
        "his",
        "her",
        "its",
        "no",
        "some",
        "le",
        "la",
        "les",
        "un",
        "une",
        "des",
        "du",
        "de",
        "à",
        "mon",
        "ma",
        "mes",
        "notre",
        "nos",
        "votre",
        "vos",
        "son",
        "sa",
        "ses",
        "leur",
        "leurs",
        "cette",
        "ces",
        "aucun",
        "aucune",
        "quelques",
    }
)

EXEMPT_HEADINGS = frozenset({"quiz"})

# --- patterns ---------------------------------------------------------------------
_FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)
_FENCE_RE = re.compile(r"^[ \t]*(```|~~~)")
_H2_RE = re.compile(r"^##[ \t]+(.+?)[ \t]*#*[ \t]*$")
_CITATION_RE = re.compile(r"\[(s\d+)\]")
_WHITESPACE_RE = re.compile(r"\s+")
_TRAILING_PUNCT_RE = re.compile(r"[\W_]+$")
_CURLY_APOSTROPHES = str.maketrans({"\u2019": "'", "\u2018": "'", "\u02bc": "'"})

_TITLE_JOINER_RE = re.compile(
    r",[ \t]+(?:" + "|".join(re.escape(j) for j in TITLE_CLAUSE_JOINERS) + r")[ \t]",
    re.IGNORECASE,
)


def _marker_pattern(markers: tuple[str, ...]) -> re.Pattern[str]:
    ordered = sorted(markers, key=len, reverse=True)  # longest first: no partial overlap
    body = "|".join(re.escape(m).replace(r"\ ", r"\s+") for m in ordered)
    return re.compile(rf"(?<!\w)(?:{body})(?!\w)", re.IGNORECASE)


_OPINION_RE = _marker_pattern(
    tuple(m.translate(_CURLY_APOSTROPHES) for m in OPINION_MARKERS_EN + OPINION_MARKERS_FR)
)

_NAME = r"[A-ZÀ-ÖØ-Þ][\w\-]*"
_VERBS = "|".join(ATTRIBUTION_VERBS_EN + ATTRIBUTION_VERBS_FR)
_LEADS = "|".join(re.escape(lead.translate(_CURLY_APOSTROPHES)) for lead in ATTRIBUTION_LEADS)
_ATTRIBUTION_LEAD_RE = re.compile(rf"(?:^[ \t>*\-]*|(?<=[.!?]\s))(?:{_LEADS})(?!\w)", re.M)
_ATTRIBUTION_NAME_RE = re.compile(
    rf"(?<![\w'\-])({_NAME})(?:\s+(?:and|et)\s+{_NAME})?(?:\s+et\s+al\.?)?"
    rf"(?i:\s+(?:{_VERBS}))(?!\w)"
)


# --- shared helpers ---------------------------------------------------------------


def split_frontmatter(text: str) -> tuple[str, str]:
    """Return ``(title, body)`` of a markdown file; no or broken frontmatter gives
    an empty title and the whole text as body."""
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return "", text
    try:
        meta = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        meta = None
    title = meta.get("title", "") if isinstance(meta, dict) else ""
    return str(title or "").strip(), text[match.end() :]


def _prose_lines(text: str) -> list[str]:
    """Lines outside fenced code blocks (fence lines themselves dropped)."""
    kept: list[str] = []
    in_fence = False
    for line in text.splitlines():
        if _FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence:
            kept.append(line)
    return kept


def strip_fenced_code(text: str) -> str:
    return "\n".join(_prose_lines(text))


def count_words(text: str) -> int:
    return len(strip_fenced_code(text).split())


def _allowance(words: int, floor: int, per_thousand: int) -> float:
    return max(floor, words * per_thousand / WORDS_PER_THOUSAND)


def _preview(text: str) -> str:
    flat = _WHITESPACE_RE.sub(" ", text).strip()
    return flat[:QUOTE_PREVIEW_CHARS]


def normalize_heading(heading: str) -> str:
    collapsed = _WHITESPACE_RE.sub(" ", heading.casefold()).strip()
    return _TRAILING_PUNCT_RE.sub("", collapsed).strip()


def _h2_headings(body: str) -> list[str]:
    found = (_H2_RE.match(line) for line in _prose_lines(body))
    return [normalize_heading(m.group(1)) for m in found if m]


# --- rules ------------------------------------------------------------------------


def title_violations(title: str) -> list[str]:
    """A title states one idea in one clause, within ``TITLE_MAX_CHARS``."""
    problems: list[str] = []
    if len(title) > TITLE_MAX_CHARS:
        problems.append(
            f"{VOICE_PREFIX} title-length: {len(title)} chars > {TITLE_MAX_CHARS}: {title!r}"
        )
    joiner = _TITLE_JOINER_RE.search(title)
    if joiner:
        problems.append(
            f"{VOICE_PREFIX} title-clauses: clause joiner {joiner.group(0).strip()!r} "
            f"in {title!r}; state one idea in one clause"
        )
    elif TITLE_CLAUSE_SEMICOLON in title:
        problems.append(
            f"{VOICE_PREFIX} title-clauses: semicolon in {title!r}; state one idea in one clause"
        )
    return problems


def opinion_marker_violations(body: str) -> list[str]:
    """First-person opinion markers above the per-length allowance."""
    prose = strip_fenced_code(body).translate(_CURLY_APOSTROPHES)
    found = [m.group(0).casefold() for m in _OPINION_RE.finditer(prose)]
    allowed = _allowance(count_words(body), OPINION_MARKER_FLOOR, OPINION_MARKERS_PER_1000_WORDS)
    if len(found) <= allowed:
        return []
    distinct = ", ".join(sorted({_WHITESPACE_RE.sub(" ", f) for f in found}))
    return [
        f"{VOICE_PREFIX} opinion-markers: {len(found)} first-person opinion markers, "
        f"allowed {allowed:g}: {distinct}"
    ]


def _attribution_hits(prose: str) -> list[str]:
    hits = [m.group(0).strip() for m in _ATTRIBUTION_LEAD_RE.finditer(prose)]
    for m in _ATTRIBUTION_NAME_RE.finditer(prose):
        if m.group(1).casefold() not in NON_SOURCE_CAPITALIZED:
            hits.append(m.group(0))
    return hits


def attribution_violations(body: str) -> list[str]:
    """Attribution constructions ("According to X", "X writes") above the allowance."""
    prose = strip_fenced_code(body).translate(_CURLY_APOSTROPHES)
    hits = _attribution_hits(prose)
    allowed = _allowance(count_words(body), ATTRIBUTION_FLOOR, ATTRIBUTIONS_PER_1000_WORDS)
    if len(hits) <= allowed:
        return []
    shown = "; ".join(repr(_preview(h)) for h in hits)
    return [
        f"{VOICE_PREFIX} attributions: {len(hits)} attribution constructions, "
        f"allowed {allowed:g}: {shown}"
    ]


def _paragraphs(body: str) -> list[str]:
    blocks: list[list[str]] = [[]]
    for line in _prose_lines(body):
        if not line.strip():
            blocks.append([])
        elif not line.lstrip().startswith("|"):
            blocks[-1].append(line)
    return ["\n".join(b) for b in blocks if b]


def repeated_citation_violations(body: str) -> list[str]:
    """The same ``[sN]`` more than once inside one prose paragraph."""
    problems: list[str] = []
    for paragraph in _paragraphs(body):
        ids = _CITATION_RE.findall(paragraph)
        repeated = sorted({i for i in ids if ids.count(i) > 1})
        if repeated:
            problems.append(
                f"{VOICE_PREFIX} repeated-citation: "
                f"{', '.join(f'[{i}]' for i in repeated)} cited more than once in "
                f"paragraph {_preview(paragraph)!r}"
            )
    return problems


def reused_heading_violations(body: str, worn_headings: frozenset[str]) -> list[str]:
    """``## `` headings already worn out by recent publications."""
    problems: list[str] = []
    for heading in _h2_headings(body):
        if heading in worn_headings and heading not in EXEMPT_HEADINGS:
            problems.append(
                f"{VOICE_PREFIX} reused-heading: '## {heading}' appears in recent "
                "publications; pick a heading specific to this piece"
            )
    return problems


def voice_violations(*, title: str, body: str, worn: frozenset[str] = frozenset()) -> list[str]:
    return [
        *title_violations(title),
        *opinion_marker_violations(body),
        *attribution_violations(body),
        *repeated_citation_violations(body),
        *reused_heading_violations(body, worn),
    ]


# --- the only I/O -----------------------------------------------------------------


def _publish_date(text: str) -> date:
    match = _FRONTMATTER_RE.match(text)
    try:
        meta = yaml.safe_load(match.group(1)) if match else None
        raw = meta.get("publishDate") if isinstance(meta, dict) else None
        return datetime.strptime(str(raw), PUBLISH_DATE_FORMAT).date()
    except (yaml.YAMLError, ValueError):
        return date.min


def worn_headings(
    content_dir: Path,
    lang: str,
    *,
    window: int = RECENT_WINDOW,
    min_uses: int = WORN_MIN_USES,
) -> frozenset[str]:
    """Normalized ``## `` headings used by at least ``min_uses`` of the ``window`` most
    recently published ``lang`` files in ``content_dir``."""
    content_dir = Path(content_dir)
    if not content_dir.is_dir():
        return frozenset()
    published: list[tuple[date, str, str]] = []
    for path in content_dir.glob(f"*.{lang}{PUBLISHED_SUFFIX}"):
        text = path.read_text(encoding="utf-8")
        published.append((_publish_date(text), path.name, text))
    published.sort(key=lambda item: (item[0], item[1]), reverse=True)
    uses: dict[str, int] = {}
    for _, _, text in published[:window]:
        for heading in set(_h2_headings(split_frontmatter(text)[1])):
            uses[heading] = uses.get(heading, 0) + 1
    return frozenset(h for h, n in uses.items() if n >= min_uses)


def content_dir(repo_root: Path, collection: str) -> Path:
    return Path(repo_root) / CONTENT_REL / collection


# --- CLI --------------------------------------------------------------------------


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.voice.rules", description="Deterministic voice rules."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    check = sub.add_parser("check", help="check one draft markdown file")
    check.add_argument("path")
    check.add_argument("--collection", required=True, choices=COLLECTIONS)
    check.add_argument("--lang", required=True, choices=LANGS)
    check.add_argument("--repo-root", default=str(REPO_ROOT))
    args = parser.parse_args(argv)

    title, body = split_frontmatter(Path(args.path).read_text(encoding="utf-8"))
    worn = worn_headings(content_dir(Path(args.repo_root), args.collection), args.lang)
    problems = voice_violations(title=title, body=body, worn=worn)
    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(_main())

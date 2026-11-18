"""Journal checks: pure functions from draft texts and repo facts to problem lines."""

from __future__ import annotations

from dataclasses import dataclass, field

from ..stages.humanize import fr_diacritic_violations, house_style_violations
from ..voice.rules import (
    repeated_citation_violations,
    reused_heading_violations,
    strip_fenced_code,
    title_violations,
)
from .constants import H2_LINE_RE, KEBAB_RE, LANGS, SOURCE_URL_KEY
from .draft import Draft, parse_draft
from .store import PublishedPiece

FR = "fr"


@dataclass(frozen=True)
class CheckContext:
    """Repo facts the checks need, loaded once by the edge."""

    tag_ids: frozenset[str]
    published: tuple[PublishedPiece, ...] = ()
    worn: dict[str, frozenset[str]] = field(default_factory=dict)


def _prefixed(lang: str, problems: list[str]) -> list[str]:
    return [f"{lang}: {p}" for p in problems]


def _prose(draft: Draft) -> str:
    return "\n".join((draft.title, draft.summary, draft.body))


def _slug_problems(draft: Draft, lang: str, translation_key: str, ctx: CheckContext) -> list[str]:
    problems: list[str] = []
    if not KEBAB_RE.match(draft.slug):
        problems.append(
            f"slug must be lowercase ASCII words joined by hyphens (got {draft.slug!r})"
        )
    clash = any(
        p.slug == draft.slug and p.lang == lang and p.translation_key != translation_key
        for p in ctx.published
    )
    if clash:
        problems.append(f"slug {draft.slug!r} is already used by another published journal piece")
    return problems


def _tag_problems(draft: Draft, ctx: CheckContext) -> list[str]:
    unknown = sorted(set(draft.tags) - ctx.tag_ids)
    return [f"unknown tag id {t!r} (not in the tags index)" for t in unknown]


def _style_problems(draft: Draft, lang: str, ctx: CheckContext) -> list[str]:
    prose = _prose(draft)
    problems = house_style_violations(prose)
    if lang == FR:
        problems += fr_diacritic_violations(prose)
    problems += title_violations(draft.title)
    problems += repeated_citation_violations(draft.body)
    problems += reused_heading_violations(draft.body, ctx.worn.get(lang, frozenset()))
    return problems


def _language_problems(
    draft: Draft, lang: str, translation_key: str, ctx: CheckContext
) -> list[str]:
    return _prefixed(
        lang,
        [
            *_slug_problems(draft, lang, translation_key, ctx),
            *_tag_problems(draft, ctx),
            *_style_problems(draft, lang, ctx),
        ],
    )


def _h2_count(draft: Draft) -> int:
    return len(H2_LINE_RE.findall(strip_fenced_code(draft.body)))


def _source_urls(draft: Draft) -> set[str]:
    return {s[SOURCE_URL_KEY] for s in draft.sources}


def _parity_problems(fr: Draft, en: Draft) -> list[str]:
    problems: list[str] = []
    if fr.slug == en.slug:
        problems.append("slug must differ between fr and en (distinct localized filenames)")
    if set(fr.tags) != set(en.tags):
        problems.append(f"tags differ between fr {sorted(fr.tags)} and en {sorted(en.tags)}")
    if _source_urls(fr) != _source_urls(en):
        problems.append("source urls differ between fr and en")
    if _h2_count(fr) != _h2_count(en):
        problems.append(
            f"structural parity: fr has {_h2_count(fr)} '## ' headings, en has {_h2_count(en)}"
        )
    return problems


def collect_problems(
    translation_key: str, texts: dict[str, str | None], ctx: CheckContext
) -> tuple[dict[str, Draft], list[str]]:
    """The parsed drafts (languages that parsed) and every problem of the pair."""
    drafts: dict[str, Draft] = {}
    problems: list[str] = []
    for lang in LANGS:
        text = texts.get(lang)
        if text is None:
            problems.append(f"{lang}: draft file is missing")
            continue
        draft, parse_problems = parse_draft(text)
        problems += _prefixed(lang, parse_problems)
        if draft is not None:
            drafts[lang] = draft
            problems += _language_problems(draft, lang, translation_key, ctx)
    if len(drafts) == len(LANGS):
        problems += _parity_problems(drafts["fr"], drafts["en"])
    return drafts, problems

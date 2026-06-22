"""Radar publish stage -- project verified briefs into ``src/content/radar`` files.

The radar analog of ``pipeline/stages/publish.py``: it takes one or more verified radar
ENTRIES (each a bilingual brief: FR+EN bodies + shared metadata + sources), projects each
into the two ``<slug>.<lang>.md`` files matching ``src/content/schemas.ts``
``radarFrontmatterSchema``, validates BOTH, then writes BOTH or NEITHER, and appends the
radar-private topic memory. Unlike the essay publish it carries no claim->source map and
no judge gates -- a radar brief's integrity rests on the research+adversarial-verify pass
upstream and this deterministic STRUCTURAL validation (the four mandated sections, kind in
the enum, >= 1 source, no em-dash, FR/EN parity).

Two entry sources converge here:
  * the seed BATCH (``from-json``): the content workflow's verified ``entries`` JSON.
  * a scheduled cpe run: the radar draft stage writes ``plans/task-draft/entry.json`` and
    the publish stage reads it (one projection path for both).

This module NEVER shells out to git/pnpm/wrangler (same contract as the essay publish):
the push that fires the Cloudflare Pages deploy is the scheduled runner's / owner's job.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import yaml

from ..memory.topic_memory import TopicMemory, TopicRecord
from ..stages.publish import content_hash
from .config import radar_memory_path

RADAR_REL = "src/content/radar"
RADAR_KINDS = ("spec-change", "release", "tool", "benchmark", "security", "research")
_DDMMYYYY_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")
_HTTP_RE = re.compile(r"^https?://", re.IGNORECASE)
_FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)

# The mandated H2 section headers per language. Only the two LOAD-BEARING ones are
# required ("what changed" + "impact"); everything between them is editorial discretion:
# a flow diagram (inline SVG) and/or a code example appear ONLY when they genuinely clarify
# that brief, never systematically. Validated structurally so a malformed brief is caught
# in Python before the Astro/zod build.
REQUIRED_SECTIONS = {
    "fr": ("## Ce qui change", "## Impact pour une équipe"),
    "en": ("## What changed", "## Impact on your team"),
}


# ---------------------------------------------------------------------------
# Sanitizers (owner style: zero em-dashes; clean source labels)
# ---------------------------------------------------------------------------


def sanitize_text(s: str) -> str:
    """Strip em/en dashes (standing owner directive: zero U+2014/U+2013 site-wide).

    Replaces ``A — B`` / ``A–B`` with ``A - B``. Applied to prose + frontmatter strings;
    NOT inside fenced code (handled by ``_sanitize_body`` which skips code fences).
    """
    return s.replace(" — ", " - ").replace("—", " - ").replace("–", "-")


def _sanitize_body(body: str) -> str:
    """Strip em/en dashes everywhere (owner directive is absolute, code included).

    ``sanitize_text`` only rewrites dash characters, so applying it inside fenced code
    is safe: an em-dash is never syntactically meaningful in code (it only appears in
    comments / prose-like strings), and the no-em-dash rule is enforced site-wide.
    """
    return sanitize_text(body).strip()


def clean_source_label(label: str) -> str:
    """A display-clean citation label: drop trailing parenthetical annotations + dashes.

    Research agents append notes like ``(PRIMARY, verbatim field names)`` to labels; those
    are working metadata, not display copy. Trim one trailing ``(...)`` group, sanitize
    dashes, and cap length.
    """
    label = re.sub(r"\s*\([^)]*\)\s*$", "", label).strip()
    label = sanitize_text(label)
    return label[:160].strip() or "source"


# ---------------------------------------------------------------------------
# Projection
# ---------------------------------------------------------------------------


def project_sources(sources: list[dict]) -> list[dict]:
    """Project entry sources to schema ``sources[]`` (``{label,url,date}``), deduped by url."""
    out: list[dict] = []
    seen: set[str] = set()
    for s in sources:
        url = str(s.get("url", "")).strip()
        if not url or url in seen:
            continue
        seen.add(url)
        out.append(
            {
                "label": clean_source_label(str(s.get("label", "source"))),
                "url": url,
                "date": str(s.get("date", "")).strip(),
            }
        )
    return out


@dataclass(frozen=True)
class RadarEntry:
    """One verified bilingual radar brief, source-of-truth for the projection."""

    translation_key: str
    kind: str
    tags: list[str]
    slug_fr: str
    slug_en: str
    title_fr: str
    title_en: str
    summary_fr: str
    summary_en: str
    body_fr: str
    body_en: str
    sources: list[dict]

    @classmethod
    def from_dict(cls, d: dict) -> RadarEntry:
        return cls(
            translation_key=str(d.get("translationKey", "")).strip(),
            kind=str(d.get("kind", "")).strip(),
            tags=[str(t).strip() for t in d.get("tags", []) if str(t).strip()],
            slug_fr=str(d.get("slug_fr", "")).strip(),
            slug_en=str(d.get("slug_en", "")).strip(),
            title_fr=sanitize_text(str(d.get("title_fr", "")).strip()),
            title_en=sanitize_text(str(d.get("title_en", "")).strip()),
            summary_fr=sanitize_text(str(d.get("summary_fr", "")).strip()),
            summary_en=sanitize_text(str(d.get("summary_en", "")).strip()),
            body_fr=_sanitize_body(str(d.get("body_fr", ""))),
            body_en=_sanitize_body(str(d.get("body_en", ""))),
            sources=project_sources(list(d.get("sources", []))),
        )

    def fields(self, lang: str) -> dict:
        if lang == "fr":
            return {
                "slug": self.slug_fr,
                "title": self.title_fr,
                "summary": self.summary_fr,
                "body": self.body_fr,
            }
        return {
            "slug": self.slug_en,
            "title": self.title_en,
            "summary": self.summary_en,
            "body": self.body_en,
        }


def build_radar_article(entry: RadarEntry, lang: str, *, publish_date: str) -> str:
    """Compose the full published radar brief text (frontmatter fence + body).

    Frontmatter keys in ``radarFrontmatterSchema`` order: translationKey, lang, slug,
    title, publishDate, kind, tags, summary, sources, contentHash, publishState.
    """
    f = entry.fields(lang)
    frontmatter = {
        "translationKey": entry.translation_key,
        "lang": lang,
        "slug": f["slug"],
        "title": f["title"],
        "publishDate": publish_date,
        "kind": entry.kind,
        "tags": list(entry.tags),
        "summary": f["summary"],
        "sources": [dict(s) for s in entry.sources],
        "contentHash": content_hash(entry.translation_key, lang, f["body"]),
        "publishState": "published",
    }
    fence = yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=True)
    return f"---\n{fence}---\n\n{f['body']}\n"


def validate_radar_published(article_text: str) -> list[str]:
    """Structural problems against ``radarFrontmatterSchema`` + the section contract."""
    match = _FRONTMATTER_RE.match(article_text)
    if not match:
        return ["frontmatter: missing or unparseable leading --- fence"]
    try:
        fm = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        return [f"frontmatter: unparseable YAML ({exc})"]
    if not isinstance(fm, dict):
        return ["frontmatter: leading fence is not a mapping"]
    body = article_text[match.end() :]
    problems: list[str] = []

    lang = fm.get("lang")
    if lang not in ("fr", "en"):
        problems.append(f"lang must be 'fr' or 'en' (got {lang!r})")
    for key in ("translationKey", "slug", "title", "summary", "contentHash"):
        val = fm.get(key)
        if not (isinstance(val, str) and val.strip()):
            problems.append(f"{key} must be a non-empty string")
    if fm.get("kind") not in RADAR_KINDS:
        problems.append(f"kind must be one of {list(RADAR_KINDS)} (got {fm.get('kind')!r})")
    pub = fm.get("publishDate")
    if not (isinstance(pub, str) and _DDMMYYYY_RE.match(pub)):
        problems.append(f"publishDate must match DD-MM-YYYY (got {pub!r})")
    tags = fm.get("tags")
    if (
        not isinstance(tags, list)
        or not tags
        or not all(isinstance(t, str) and t.strip() for t in tags)
    ):
        problems.append("tags must be a non-empty list of non-empty strings")
    sources = fm.get("sources")
    if not isinstance(sources, list) or len(sources) < 1:
        problems.append("sources must be a list of length >= 1")
    else:
        for i, s in enumerate(sources):
            if not isinstance(s, dict):
                problems.append(f"sources[{i}] must be a mapping")
                continue
            if not (isinstance(s.get("label"), str) and s["label"].strip()):
                problems.append(f"sources[{i}].label must be a non-empty string")
            if not (isinstance(s.get("url"), str) and _HTTP_RE.match(s["url"])):
                problems.append(f"sources[{i}].url must be http(s) (got {s.get('url')!r})")
            if not (isinstance(s.get("date"), str) and _DDMMYYYY_RE.match(s["date"])):
                problems.append(f"sources[{i}].date must match DD-MM-YYYY (got {s.get('date')!r})")
    if fm.get("publishState") != "published":
        problems.append(f"publishState must be 'published' (got {fm.get('publishState')!r})")
    # The four mandated H2 sections for this language (the schema/code/impact promise).
    if lang in REQUIRED_SECTIONS:
        for header in REQUIRED_SECTIONS[lang]:
            if not re.search(rf"(?m)^{re.escape(header)}\s*$", body):
                problems.append(f"body: missing required section {header!r}")
    # Owner directive: zero em-dashes anywhere.
    if "—" in article_text:
        problems.append("body/frontmatter must contain no em-dash (U+2014)")
    return problems


# ---------------------------------------------------------------------------
# Write (bilingual-or-nothing per entry) + radar memory
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class RadarPublishResult:
    ok: bool
    written: list[str]
    problems: list[str]


def _append_radar_memory(entry: RadarEntry, memory_path: Path, *, publish_date: str) -> bool:
    """Best-effort radar-memory append (never blocks an otherwise-valid publish)."""
    try:
        try:
            published_at = datetime.strptime(publish_date, "%d-%m-%Y").date().isoformat()
        except ValueError:
            published_at = publish_date
        record = TopicRecord(
            translation_key=entry.translation_key,
            topic_id=entry.translation_key,
            dedup_key=entry.translation_key.replace("-", " "),
            title=entry.title_en,
            slugs={"fr": entry.slug_fr, "en": entry.slug_en},
            sources=[dict(s) for s in entry.sources],
            published_at=published_at,
            embedding=None,
        )
        store = TopicMemory.load(memory_path)
        if store.append_publication(record):
            store.save()
        return True
    except Exception:  # noqa: BLE001 -- a bookkeeping miss must never unpublish
        return False


def write_entry(
    entry: RadarEntry, repo_root: Path, *, publish_date: str, memory_path: Path
) -> RadarPublishResult:
    """Project + validate BOTH languages + write BOTH or NEITHER + append radar memory."""
    problems: list[str] = []
    if not entry.translation_key:
        problems.append("translationKey is empty")
    fr_article = build_radar_article(entry, "fr", publish_date=publish_date)
    en_article = build_radar_article(entry, "en", publish_date=publish_date)
    problems.extend(f"fr: {p}" for p in validate_radar_published(fr_article))
    problems.extend(f"en: {p}" for p in validate_radar_published(en_article))
    if entry.slug_fr == entry.slug_en and entry.slug_fr:
        problems.append("slug_fr and slug_en must differ (distinct localized filenames)")
    if problems:
        return RadarPublishResult(ok=False, written=[], problems=problems)

    out_dir = repo_root / RADAR_REL
    out_dir.mkdir(parents=True, exist_ok=True)
    fr_path = out_dir / f"{entry.slug_fr}.fr.md"
    en_path = out_dir / f"{entry.slug_en}.en.md"
    fr_path.write_text(fr_article, encoding="utf-8")
    en_path.write_text(en_article, encoding="utf-8")
    _append_radar_memory(entry, memory_path, publish_date=publish_date)
    return RadarPublishResult(
        ok=True,
        written=[str(fr_path.relative_to(repo_root)), str(en_path.relative_to(repo_root))],
        problems=[],
    )


def write_entries(
    entries: list[dict], repo_root: Path, *, publish_date: str, memory_path: Path | None = None
) -> list[RadarPublishResult]:
    """Write a batch of entry dicts. Each entry is bilingual-or-nothing, independent."""
    repo_root = Path(repo_root)
    memory_path = memory_path or radar_memory_path(repo_root)
    results: list[RadarPublishResult] = []
    for d in entries:
        results.append(
            write_entry(
                RadarEntry.from_dict(d),
                repo_root,
                publish_date=publish_date,
                memory_path=memory_path,
            )
        )
    return results


# ---------------------------------------------------------------------------
# CLI: python -m pipeline.radar.stages {from-json, publish, validate}
# ---------------------------------------------------------------------------


def _today_ddmmyyyy() -> str:
    return date.today().strftime("%d-%m-%Y")


def _cmd_from_json(args) -> int:
    publish_date = args.publish_date or _today_ddmmyyyy()
    if not _DDMMYYYY_RE.match(publish_date):
        print(f"--publish-date must be DD-MM-YYYY (got {publish_date!r})", file=sys.stderr)
        return 1
    entries = json.loads(Path(args.entries).read_text(encoding="utf-8"))
    if not isinstance(entries, list):
        entries = entries.get("entries", [])
    memory_path = Path(args.memory) if args.memory else None
    results = write_entries(
        entries, Path(args.repo_root), publish_date=publish_date, memory_path=memory_path
    )
    ok = sum(1 for r in results if r.ok)
    for r in results:
        if r.ok:
            print(f"published {r.written[0]} + {r.written[1]}")
        else:
            for p in r.problems:
                print(f"SKIP: {p}", file=sys.stderr)
    print(f"radar publish: {ok}/{len(results)} entries written (publishDate {publish_date})")
    return 0 if ok == len(results) and results else (0 if ok else 1)


def _cmd_publish(args) -> int:
    """Scheduled cpe path: read ``plans/task-draft/entry.json`` and publish it."""
    publish_date = args.publish_date or _today_ddmmyyyy()
    entry_path = Path(args.run_dir) / "plans" / "task-draft" / "entry.json"
    try:
        entry = json.loads(entry_path.read_text(encoding="utf-8"))
    except OSError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    memory_path = Path(args.memory) if args.memory else None
    results = write_entries(
        [entry], Path(args.repo_root), publish_date=publish_date, memory_path=memory_path
    )
    r = results[0]
    if not r.ok:
        for p in r.problems:
            print(p)
        return 1
    print(f"published {r.written[0]} + {r.written[1]} (publishDate {publish_date})")
    return 0


def stamp_file(path: Path) -> bool:
    """Recompute a radar brief's frontmatter ``contentHash`` from its body, in place.

    Used after a brief's body is hand-edited (e.g. adding a diagram). The hash is
    ``content_hash(translationKey, lang, stripped_body)`` -- the same formula
    ``build_radar_article`` uses -- so re-stamping an unchanged body is a no-op (returns
    False). The body text is preserved byte-for-byte; only the frontmatter hash changes.
    """
    text = Path(path).read_text(encoding="utf-8")
    match = _FRONTMATTER_RE.match(text)
    if not match:
        raise ValueError(f"{path}: no frontmatter fence")
    fm = yaml.safe_load(match.group(1))
    body = text[match.end():]  # the raw body after the fence (leading blank line preserved)
    new_hash = content_hash(fm["translationKey"], fm["lang"], body.strip())
    if fm.get("contentHash") == new_hash:
        return False
    fm["contentHash"] = new_hash
    fence = yaml.safe_dump(fm, sort_keys=False, allow_unicode=True)
    Path(path).write_text(f"---\n{fence}---\n{body}", encoding="utf-8")
    return True


def _cmd_validate(args) -> int:
    problems = validate_radar_published(Path(args.path).read_text(encoding="utf-8"))
    if problems:
        for p in problems:
            print(p)
        return 1
    print("OK")
    return 0


def _cmd_stamp(args) -> int:
    paths = sorted(Path(args.dir).glob("*.md")) if args.dir else [Path(p) for p in args.paths]
    changed = 0
    for p in paths:
        try:
            if stamp_file(p):
                changed += 1
                print(f"restamped {p}")
        except (ValueError, OSError, KeyError) as exc:
            print(f"SKIP {p}: {exc}", file=sys.stderr)
    print(f"stamp: {changed}/{len(paths)} files updated")
    return 0


def _main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="pipeline.radar.stages", description="Radar publish stage."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_fj = sub.add_parser("from-json", help="write a batch of verified entries (the seed batch)")
    p_fj.add_argument(
        "--entries", required=True, help="path to entries JSON (list or {entries:[...]})"
    )
    p_fj.add_argument("--repo-root", required=True)
    p_fj.add_argument("--publish-date", default=None, help="DD-MM-YYYY (default: today)")
    p_fj.add_argument("--memory", default=None)

    p_pub = sub.add_parser("publish", help="scheduled path: publish plans/task-draft/entry.json")
    p_pub.add_argument("--run-dir", required=True)
    p_pub.add_argument("--repo-root", required=True)
    p_pub.add_argument("--publish-date", default=None)
    p_pub.add_argument("--memory", default=None)

    p_val = sub.add_parser("validate", help="validate one radar .md file")
    p_val.add_argument("path")

    p_stamp = sub.add_parser("stamp", help="recompute contentHash for hand-edited briefs")
    p_stamp.add_argument("--dir", default=None, help="stamp every *.md in this dir")
    p_stamp.add_argument("paths", nargs="*", help="explicit .md paths (if no --dir)")

    args = parser.parse_args(argv)
    if args.cmd == "from-json":
        return _cmd_from_json(args)
    if args.cmd == "publish":
        return _cmd_publish(args)
    if args.cmd == "stamp":
        return _cmd_stamp(args)
    return _cmd_validate(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "RADAR_REL",
    "RADAR_KINDS",
    "REQUIRED_SECTIONS",
    "RadarEntry",
    "RadarPublishResult",
    "sanitize_text",
    "clean_source_label",
    "project_sources",
    "build_radar_article",
    "validate_radar_published",
    "write_entry",
    "write_entries",
    "stamp_file",
]

"""Publish stage -- the deterministic, bilingual-or-nothing publish the agent shells out to.

Stage 6 (writing-flow.md section 6, FR-B5/FR-G*). Projects the approved + gated FR and
EN drafts into full published-article files matching ``src/content/schemas.ts``
``articleFrontmatterSchema``, validates BOTH, then writes BOTH or NEITHER, appends the
evergreen topic memory, and emits a run-local manifest.

PUSH IS NOT THIS MODULE'S JOB (plan section 0.4 / R-push). cpe drives the commit
(``git add -A && git commit`` on ``main``; ``branch_per_task: false``) -- that RECORDS the
durable FR + EN publish locally, no manual step (D-002). But cpe does NOT ``git push`` in
this slate, and CF Pages auto-deploy (D-005) + the reindex workflow
(``.github/workflows/reindex.yml`` ``on.push``) fire only when the remote RECEIVES a push.
So the push that actually fires the build + avatar reindex is the scheduled runner's job
(task 28) or an explicit owner handoff. This module NEVER shells out to git / pnpm /
wrangler; ``reindex.changed_slugs`` in the manifest is an informational event record only
(the reindex derives changes from content hashes, not from this file)
[MEM: reindex-contract]. The publish push triggers BOTH CF Pages and the reindex
wrangler deploy; the single index-deploy owner is picked at deploy-wiring time (R-doubledeploy).

Run-dir contract (pipeline/README.md): the agent runs with cwd = run_dir (gitignored)
INSIDE the repo; repo files are addressed via the absolute ``repo_root``. The articles +
the topic-memory store are durable repo files OUTSIDE the run-dir, so ``git add -A`` stages
them under the publish commit; the manifest stays in the gitignored run-dir.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import yaml

from ..contracts.claim_source_map import ClaimSourceMap, ContractError
from ..memory.topic_memory import TopicMemory, TopicRecord
from .draft import DraftDoc, validate_draft_pair
from .research import CandidatesDoc
from .select import parse_brief

ARTICLES_REL = "src/content/articles"  # publish target dir (under repo_root)
_DDMMYYYY_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")
_HTTP_RE = re.compile(r"^https?://", re.IGNORECASE)

# Leading frontmatter fence only: anchored at start, non-greedy body so the FIRST closing
# `---` line ends it (markdown bodies contain `---` rules). A deliberate small duplication
# of select/draft._FRONTMATTER_RE (same anchored, non-greedy shape) -- kept local so the
# task-24/25-tested modules are untouched.
_FRONTMATTER_RE = re.compile(r"\A---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n?", re.DOTALL)


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------


def iso_to_ddmmyyyy(value: str) -> str:
    """Convert an ISO-8601 date (``YYYY-MM-DD``) or RFC3339 datetime to ``DD-MM-YYYY``.

    Reuses the contract's parse approach (``date.fromisoformat`` then
    ``datetime.fromisoformat``). Raises ``ContractError`` on an unparseable value.
    """
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"date must be a non-empty string (got {value!r})")
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        try:
            parsed = datetime.fromisoformat(value).date()
        except ValueError as exc:
            raise ContractError(
                f"date must be an ISO-8601 date or datetime (got {value!r})"
            ) from exc
    return parsed.strftime("%d-%m-%Y")


def content_hash(translation_key: str, lang: str, body: str) -> str:
    """Deterministic, non-empty article ``contentHash`` (schemas.ts).

    DISTINCT from the avatar index's per-slug hash (``index-build.ts`` ``contentHashOf``):
    the avatar builder deliberately computes its own; do not try to reconcile them.
    """
    digest = hashlib.sha256(f"{translation_key}\n{lang}\n{body}".encode()).hexdigest()
    return f"sha256:{digest[:16]}"


def project_sources(csm: ClaimSourceMap) -> list[dict]:
    """Project ALL ``csm.sources`` to ``[{label, url, date}]`` (schemas.ts ``sources[]``).

    ``date = iso_to_ddmmyyyy(source_date or retrieved_at)``; order preserved; de-duped by
    ``url`` (keep first). Using ALL map sources -- not per-language-cited -- guarantees the
    schema's ``>= 2`` even on a 1-source-per-language draft (plan R3).
    """
    out: list[dict] = []
    seen_urls: set[str] = set()
    for source in csm.sources:
        if source.url in seen_urls:
            continue
        seen_urls.add(source.url)
        out.append(
            {
                "label": source.label,
                "url": source.url,
                "date": iso_to_ddmmyyyy(source.source_date or source.retrieved_at),
            }
        )
    return out


def build_article(draft: DraftDoc, sources: list[dict], *, publish_date: str) -> str:
    """Compose the full published-article text (frontmatter fence + body).

    Frontmatter keys in schemas.ts order: ``translationKey, lang, slug, title, publishDate,
    tags, sources, contentHash, publishState``. ``publishState`` is always ``published``;
    ``contentHash`` via ``content_hash(translation_key, lang, body)``. ``draft.body`` already
    has the leading fence stripped.
    """
    frontmatter = {
        "translationKey": draft.translation_key,
        "lang": draft.lang,
        "slug": draft.slug,
        "title": draft.title,
        "publishDate": publish_date,
        "tags": list(draft.tags),
        "sources": [dict(source) for source in sources],
        "contentHash": content_hash(draft.translation_key, draft.lang, draft.body),
        "publishState": "published",
    }
    fence = yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=True)
    return f"---\n{fence}---\n\n{draft.body}"


def validate_published(article_text: str) -> list[str]:
    """Re-check the PUBLISH-TIME additions against schemas.ts (problems list; empty == ok).

    Parses the leading frontmatter fence DIRECTLY (``DraftDoc.parse`` discards
    publishDate/sources/contentHash/publishState), then asserts: ``publishDate`` matches
    ``DD-MM-YYYY``; ``sources`` is a list of length >= 2, each ``{label: non-empty str, url:
    http(s), date: DD-MM-YYYY}``; ``contentHash`` a non-empty str; ``publishState ==
    'published'``. The author-time keys are already covered upstream by
    ``validate_draft_pair``; this only guards the publish-time projection so a bad one is
    caught in Python before Astro/zod fails the build.
    """
    match = _FRONTMATTER_RE.match(article_text)
    if not match:
        return ["frontmatter: missing or unparseable leading --- fence"]
    try:
        fm = yaml.safe_load(match.group(1))
    except yaml.YAMLError as exc:
        return [f"frontmatter: unparseable YAML ({exc})"]
    if not isinstance(fm, dict):
        return ["frontmatter: leading fence is not a mapping"]

    problems: list[str] = []
    publish_date = fm.get("publishDate")
    if not (isinstance(publish_date, str) and _DDMMYYYY_RE.match(publish_date)):
        problems.append(f"publishDate must match DD-MM-YYYY (got {publish_date!r})")

    sources = fm.get("sources")
    if not isinstance(sources, list) or len(sources) < 2:
        problems.append("sources must be a list of length >= 2")
    else:
        for i, source in enumerate(sources):
            if not isinstance(source, dict):
                problems.append(f"sources[{i}] must be a mapping")
                continue
            label = source.get("label")
            if not (isinstance(label, str) and label.strip()):
                problems.append(f"sources[{i}].label must be a non-empty string")
            url = source.get("url")
            if not (isinstance(url, str) and _HTTP_RE.match(url)):
                problems.append(f"sources[{i}].url must be http(s) (got {url!r})")
            src_date = source.get("date")
            if not (isinstance(src_date, str) and _DDMMYYYY_RE.match(src_date)):
                problems.append(f"sources[{i}].date must match DD-MM-YYYY (got {src_date!r})")

    content_hash_value = fm.get("contentHash")
    if not (isinstance(content_hash_value, str) and content_hash_value.strip()):
        problems.append("contentHash must be a non-empty string")

    publish_state = fm.get("publishState")
    if publish_state != "published":
        problems.append(f"publishState must be 'published' (got {publish_state!r})")
    return problems


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class PublishResult:
    """The publish outcome. ``manifest`` is the run-local event record on success."""

    ok: bool
    problems: list[str]
    manifest: dict | None


@dataclass
class _PublishContext:
    """Projected + validated FR/EN articles ready to write (internal to ``publish_run``)."""

    fr_doc: DraftDoc
    en_doc: DraftDoc
    csm: ClaimSourceMap
    sources: list[dict]
    fr_article: str
    en_article: str


def _draft_dir(run_dir: Path) -> Path:
    return run_dir / "plans" / "task-draft"


def _build_context(
    run_dir: Path, *, publish_date: str
) -> tuple[list[str], _PublishContext | None]:
    """Steps 1-4: read inputs, cross-pair validate, project + validate BOTH, gate.

    Returns ``(problems, ctx)``: a non-empty ``problems`` means write NOTHING (``ctx`` is
    ``None``). Shared by the publish run and the ``validate`` dry-run self-gate.
    """
    draft_dir = _draft_dir(run_dir)
    problems: list[str] = []

    texts: dict[str, str | None] = {}
    for slot in ("fr", "en"):
        try:
            texts[slot] = (draft_dir / f"draft-{slot}.md").read_text(encoding="utf-8")
        except OSError as exc:
            problems.append(f"draft-{slot}.md: {exc}")
            texts[slot] = None
    try:
        csm = ClaimSourceMap.load_path(draft_dir / "claim_source_map.json")
        csm.validate()
    except (ContractError, OSError) as exc:
        problems.append(f"claim_source_map.json: {exc}")
        csm = None

    if texts["fr"] is None or texts["en"] is None or csm is None:
        return problems, None

    problems.extend(validate_draft_pair(texts["fr"], texts["en"]))
    try:
        sources = project_sources(csm)
    except ContractError as exc:
        problems.append(f"sources: {exc}")
        sources = []
    if problems:
        return problems, None

    fr_doc = DraftDoc.parse(texts["fr"])
    en_doc = DraftDoc.parse(texts["en"])
    fr_article = build_article(fr_doc, sources, publish_date=publish_date)
    en_article = build_article(en_doc, sources, publish_date=publish_date)
    problems.extend(f"draft-fr: {p}" for p in validate_published(fr_article))
    problems.extend(f"draft-en: {p}" for p in validate_published(en_article))
    if problems:
        return problems, None

    return [], _PublishContext(fr_doc, en_doc, csm, sources, fr_article, en_article)


def _append_topic_memory(
    run_dir: Path, memory_path: Path, ctx: _PublishContext, *, publish_date: str
) -> dict:
    """Best-effort evergreen topic-memory append (never blocks an otherwise-valid publish).

    Resolves the topic from ``brief.md`` (``chosen_topic_id``) -> ``candidates.json`` (for
    ``dedup_key`` + canonical sources). Identity is the EN draft ``translationKey``. Any
    failure (missing/garbled brief or candidates) -> ``{"recorded": False, "reason": ...}``;
    an ``append_publication`` no-op (already present) -> ``"reason": "already recorded"``.
    The articles are the primary deliverable -- a bookkeeping miss must not unpublish them.
    """
    try:
        try:
            brief_text = (
                run_dir / "plans" / "task-select" / "brief.md"
            ).read_text(encoding="utf-8")
        except OSError as exc:
            return {"recorded": False, "reason": f"brief.md unreadable: {exc}"}
        chosen = parse_brief(brief_text).chosen_topic_id
        if not chosen:
            return {"recorded": False, "reason": "brief has no chosen_topic_id"}
        try:
            doc = CandidatesDoc.load_path(
                run_dir / "plans" / "task-research" / "candidates.json"
            )
        except (ContractError, OSError) as exc:
            return {"recorded": False, "reason": f"candidates.json unreadable: {exc}"}
        candidate = next((c for c in doc.candidates if c.topic_id == chosen), None)
        if candidate is None:
            return {"recorded": False, "reason": f"chosen_topic_id {chosen!r} not in candidates"}

        sources = [source.to_dict() for source in candidate.sources] or list(ctx.sources)
        try:
            published_at = datetime.strptime(publish_date, "%d-%m-%Y").date().isoformat()
        except ValueError:
            published_at = publish_date
        record = TopicRecord(
            translation_key=ctx.en_doc.translation_key,
            topic_id=candidate.topic_id,
            dedup_key=candidate.dedup_key,
            title=ctx.en_doc.title,
            slugs={"fr": ctx.fr_doc.slug, "en": ctx.en_doc.slug},
            sources=sources,
            published_at=published_at,
            embedding=None,
        )
        store = TopicMemory.load(memory_path)
        if not store.append_publication(record):
            return {"recorded": False, "reason": "already recorded"}
        store.save()
        return {
            "recorded": True,
            "topic_id": candidate.topic_id,
            "dedup_key": candidate.dedup_key,
        }
    except Exception as exc:  # noqa: BLE001 -- bookkeeping miss must never unpublish (§5.2)
        return {"recorded": False, "reason": f"unexpected: {exc}"}


def _build_manifest(
    ctx: _PublishContext, publish_date: str, topic_memory_info: dict
) -> dict:
    fr_slug, en_slug = ctx.fr_doc.slug, ctx.en_doc.slug
    return {
        "translationKey": ctx.en_doc.translation_key,
        "publishDate": publish_date,
        "articles": [
            {
                "lang": "fr",
                "slug": fr_slug,
                "path": f"{ARTICLES_REL}/{fr_slug}.fr.md",
                "url": f"/fr/blog/{fr_slug}/",
                "contentHash": content_hash(ctx.fr_doc.translation_key, "fr", ctx.fr_doc.body),
            },
            {
                "lang": "en",
                "slug": en_slug,
                "path": f"{ARTICLES_REL}/{en_slug}.en.md",
                "url": f"/en/blog/{en_slug}/",
                "contentHash": content_hash(ctx.en_doc.translation_key, "en", ctx.en_doc.body),
            },
        ],
        "topic_memory": topic_memory_info,
        "reindex": {"event": "publish", "changed_slugs": [fr_slug, en_slug]},
    }


def publish_run(
    run_dir: Path,
    repo_root: Path,
    *,
    publish_date: str,
    memory_path: Path | None = None,
) -> PublishResult:
    """Project -> validate BOTH -> write BOTH (or NEITHER) + topic memory + manifest.

    On any problem from steps 1-4: returns ``ok=False`` and writes NOTHING (no article, no
    memory, no manifest). On success: writes both localized-base article files
    (``<localized-slug>.<lang>.md``), appends topic memory, emits the run-local manifest,
    and returns ``ok=True`` with the manifest.
    """
    run_dir = Path(run_dir)
    repo_root = Path(repo_root)
    if memory_path is None:
        memory_path = repo_root / "pipeline" / "memory" / "topic_memory.json"

    problems, ctx = _build_context(run_dir, publish_date=publish_date)
    if problems or ctx is None:
        return PublishResult(ok=False, problems=problems, manifest=None)

    articles_dir = repo_root / ARTICLES_REL
    articles_dir.mkdir(parents=True, exist_ok=True)
    # Localized slugs are distinct -> distinct filenames -> no avatar slug-collision; the
    # collection loader globs **/*.md and keys on frontmatter (plan section 5.2 step 5 / C4).
    (articles_dir / f"{ctx.fr_doc.slug}.fr.md").write_text(ctx.fr_article, encoding="utf-8")
    (articles_dir / f"{ctx.en_doc.slug}.en.md").write_text(ctx.en_article, encoding="utf-8")

    topic_memory_info = _append_topic_memory(
        run_dir, Path(memory_path), ctx, publish_date=publish_date
    )
    manifest = _build_manifest(ctx, publish_date, topic_memory_info)
    manifest_path = run_dir / "plans" / "task-publish" / "published.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return PublishResult(ok=True, problems=[], manifest=manifest)


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.publish {validate,publish}
# ---------------------------------------------------------------------------


def _today_ddmmyyyy() -> str:
    return date.today().strftime("%d-%m-%Y")


def _cmd_validate(args) -> int:
    # Dry-run (steps 1-4, no writes, no --repo-root). A placeholder publishDate purely
    # exercises the projection + format check (publishDate is regex-only) -- plan C2.
    problems, _ctx = _build_context(Path(args.run_dir), publish_date="01-01-2025")
    if problems:
        for problem in problems:
            print(problem)
        return 1
    print("OK")
    return 0


def _cmd_publish(args) -> int:
    publish_date = args.publish_date or _today_ddmmyyyy()
    if not _DDMMYYYY_RE.match(publish_date):
        print(f"--publish-date must be DD-MM-YYYY (got {publish_date!r})", file=sys.stderr)
        return 1
    memory_path = Path(args.memory) if args.memory else None
    result = publish_run(
        Path(args.run_dir),
        Path(args.repo_root),
        publish_date=publish_date,
        memory_path=memory_path,
    )
    if not result.ok:
        for problem in result.problems:
            print(problem)
        return 1
    assert result.manifest is not None
    fr, en = result.manifest["articles"]
    recorded = result.manifest["topic_memory"]["recorded"]
    print(
        f"published {fr['path']} + {en['path']} (publishDate {publish_date}); "
        f"topic_memory.recorded={recorded}"
    )
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.publish",
        description="Publish stage: project + bilingual-or-nothing write + topic memory.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_validate = sub.add_parser(
        "validate", help="dry-run: project + validate both drafts; write nothing"
    )
    p_validate.add_argument("--run-dir", required=True, help="absolute run dir")

    p_publish = sub.add_parser(
        "publish", help="project + write FR+EN + topic memory + manifest"
    )
    p_publish.add_argument("--run-dir", required=True, help="absolute run dir")
    p_publish.add_argument("--repo-root", required=True, help="absolute repo root")
    p_publish.add_argument(
        "--publish-date", default=None, help="DD-MM-YYYY (default: today)"
    )
    p_publish.add_argument(
        "--memory",
        default=None,
        help="topic_memory.json path (default: {repo_root}/pipeline/memory/topic_memory.json)",
    )

    args = parser.parse_args(argv)
    if args.cmd == "validate":
        return _cmd_validate(args)
    return _cmd_publish(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "ARTICLES_REL",
    "PublishResult",
    "iso_to_ddmmyyyy",
    "content_hash",
    "project_sources",
    "build_article",
    "validate_published",
    "publish_run",
]

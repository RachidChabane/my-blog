"""Voice references: human-written blog posts the reader judge tunes its ear on.

``references.yaml`` (tracked) lists the posts: language, author, title, url. The post
texts are third-party writing and are never committed: ``fetch`` downloads each one into
the gitignored cache ``pipeline/voice/cache/<lang>/<slug>.txt`` as plain text.

CLI:
    python3 -m pipeline.voice.references fetch [--repo-root <dir>] [--force]
    python3 -m pipeline.voice.references status [--repo-root <dir>]
``status`` exits 1 when a language has fewer cached posts than the judge must read.
"""

from __future__ import annotations

import argparse
import html
import http.client
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
REGISTRY_REL = Path("pipeline") / "voice" / "references.yaml"
CACHE_REL = Path("pipeline") / "voice" / "cache"
LANGS = ("fr", "en")
REFERENCES_MIN_READ = 3
CACHE_SUFFIX = ".txt"

_FETCH_TIMEOUT_SECONDS = 20.0
_USER_AGENT = "Mozilla/5.0 (compatible; voice-reference-fetch/1.0)"
_MIN_TEXT_CHARS = 1500
_DROPPED_BLOCKS_RE = re.compile(
    r"<(script|style|nav|header|footer|aside|form|noscript|svg)\b.*?</\1>",
    re.DOTALL | re.IGNORECASE,
)
_ARTICLE_RE = re.compile(r"<(article|main)\b.*?</\1>", re.DOTALL | re.IGNORECASE)
_BLOCK_END_RE = re.compile(r"</(p|div|h[1-6]|li|pre|blockquote|tr)>|<br\s*/?>", re.IGNORECASE)
_TAG_RE = re.compile(r"<[^>]+>")
_BLANK_RUN_RE = re.compile(r"\n\s*\n\s*")
_SPACE_RUN_RE = re.compile(r"[ \t]+")
_SLUG_UNSAFE_RE = re.compile(r"[^a-z0-9]+")


@dataclass(frozen=True)
class Reference:
    lang: str
    author: str
    title: str
    url: str

    @property
    def slug(self) -> str:
        return _SLUG_UNSAFE_RE.sub("-", f"{self.author} {self.title}".lower()).strip("-")


def references_dir(repo_root: Path) -> Path:
    """The cache directory holding ``<lang>/<slug>.txt`` reference posts."""
    return Path(repo_root) / CACHE_REL


def load_registry(repo_root: Path) -> list[Reference]:
    """Parse ``references.yaml``; raises ``ValueError`` on a malformed entry."""
    registry = Path(repo_root) / REGISTRY_REL
    try:
        raw = yaml.safe_load(registry.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ValueError(f"cannot read {registry}: {exc}") from exc
    entries = (raw or {}).get("references") or []
    refs: list[Reference] = []
    for i, item in enumerate(entries):
        try:
            ref = Reference(
                lang=str(item["lang"]),
                author=str(item["author"]),
                title=str(item["title"]),
                url=str(item["url"]),
            )
        except (KeyError, TypeError) as exc:
            raise ValueError(f"references[{i}]: missing field {exc}") from exc
        if ref.lang not in LANGS:
            raise ValueError(f"references[{i}]: lang must be one of {LANGS} (got {ref.lang!r})")
        if not ref.url.startswith(("http://", "https://")):
            raise ValueError(f"references[{i}]: url must be http(s) (got {ref.url!r})")
        refs.append(ref)
    return refs


def cache_path(repo_root: Path, ref: Reference) -> Path:
    return references_dir(repo_root) / ref.lang / f"{ref.slug}{CACHE_SUFFIX}"


def html_to_text(page: str) -> str:
    """The readable text of an HTML page: the article/main block when there is one,
    without scripts, navigation or markup; paragraphs separated by blank lines."""
    page = _DROPPED_BLOCKS_RE.sub(" ", page)
    article = _ARTICLE_RE.search(page)
    if article:
        page = article.group(0)
    page = _BLOCK_END_RE.sub("\n\n", page)
    text = html.unescape(_TAG_RE.sub("", page))
    text = _SPACE_RUN_RE.sub(" ", text)
    return _BLANK_RUN_RE.sub("\n\n", text).strip()


def _download(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": _USER_AGENT})
    with urllib.request.urlopen(request, timeout=_FETCH_TIMEOUT_SECONDS) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def fetch_reference(repo_root: Path, ref: Reference, *, force: bool = False) -> str | None:
    """Cache one reference post; returns a problem string, or ``None`` on success."""
    path = cache_path(repo_root, ref)
    if path.exists() and not force:
        return None
    try:
        text = html_to_text(_download(ref.url))
    except (urllib.error.URLError, http.client.HTTPException, OSError, ValueError) as exc:
        return f"{ref.url}: {exc}"
    if len(text) < _MIN_TEXT_CHARS:
        return f"{ref.url}: only {len(text)} characters of text extracted"
    path.parent.mkdir(parents=True, exist_ok=True)
    header = f"{ref.title}\n{ref.author}\n{ref.url}\n\n"
    path.write_text(header + text + "\n", encoding="utf-8")
    return None


def cached_counts(repo_root: Path) -> dict[str, int]:
    """Number of cached reference posts per language."""
    base = references_dir(repo_root)
    return {lang: len(list((base / lang).glob(f"*{CACHE_SUFFIX}"))) for lang in LANGS}


def status_problems(repo_root: Path) -> list[str]:
    """One problem per language with fewer cached posts than the judge must read."""
    return [
        f"{lang}: {count} cached reference posts, the reader judge needs "
        f"{REFERENCES_MIN_READ} (run: python3 -m pipeline.voice.references fetch)"
        for lang, count in cached_counts(repo_root).items()
        if count < REFERENCES_MIN_READ
    ]


def _cmd_fetch(repo_root: Path, force: bool) -> int:
    try:
        registry = load_registry(repo_root)
    except ValueError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    problems = [
        problem
        for ref in registry
        if (problem := fetch_reference(repo_root, ref, force=force))
    ]
    for problem in problems:
        print(f"SKIP: {problem}", file=sys.stderr)
    return _cmd_status(repo_root)


def _cmd_status(repo_root: Path) -> int:
    for lang, count in cached_counts(repo_root).items():
        print(f"{lang}: {count} cached")
    problems = status_problems(repo_root)
    for problem in problems:
        print(problem, file=sys.stderr)
    return 1 if problems else 0


def _main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="pipeline.voice.references",
        description="Fetch and check the reader judge's voice reference posts.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    for name in ("fetch", "status"):
        p = sub.add_parser(name)
        p.add_argument("--repo-root", default=str(REPO_ROOT))
        if name == "fetch":
            p.add_argument("--force", action="store_true", help="re-download cached posts")
    args = parser.parse_args(argv)
    repo_root = Path(args.repo_root)
    if args.cmd == "fetch":
        return _cmd_fetch(repo_root, args.force)
    return _cmd_status(repo_root)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "REFERENCES_MIN_READ",
    "Reference",
    "cache_path",
    "cached_counts",
    "fetch_reference",
    "html_to_text",
    "load_registry",
    "references_dir",
    "status_problems",
]

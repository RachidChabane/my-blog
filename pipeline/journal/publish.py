"""Journal CLI: ``python -m pipeline.journal.publish {new, check, publish, status}``.

Validates and publishes the owner's hand-written journal pieces from
``drafts/journal/<translationKey>/{fr,en}.md`` to ``src/content/journal``. Writes both
languages or neither. The publish date records the day the idea was held, so a piece
that is already published keeps its date on every later publish.

Import-light (see ``pipeline/__init__.py``): nothing imports this module except ``-m``.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

from ..voice.rules import worn_headings
from .checks import CheckContext, collect_problems
from .constants import (
    DATE_FORMAT,
    DRAFT_FILENAME,
    EXIT_OK,
    EXIT_PROBLEMS,
    JOURNAL_REL,
    KEBAB_RE,
    LANGS,
    OK_LINE,
    VERB_CHECK,
    VERB_NEW,
    VERB_PUBLISH,
    VERB_STATUS,
)
from .draft import DRAFT_TEMPLATE, Draft
from .store import (
    PublishedPiece,
    draft_dir,
    ensure_drafts_ignored,
    existing_publish_date,
    is_real_date,
    list_draft_keys,
    load_published,
    load_tag_ids,
    pieces_of,
    published_path,
    read_draft_texts,
    render_published,
    write_all_or_nothing,
)

DEFAULT_REPO_ROOT = Path(__file__).resolve().parents[2]


def resolve_publish_date(
    existing: str | None, requested: str | None, today: str
) -> tuple[str | None, list[str]]:
    """The date to publish under, or the problems that forbid it (pure)."""
    if requested is not None and not is_real_date(requested):
        return None, [f"--publish-date must be a real DD-MM-YYYY date (got {requested!r})"]
    if existing is None:
        return requested or today, []
    if requested is not None and requested != existing:
        return None, [
            f"already published on {existing}: the date is kept, "
            f"--publish-date {requested} is refused"
        ]
    return existing, []


def _context(repo_root: Path) -> CheckContext:
    journal_dir = repo_root / JOURNAL_REL
    return CheckContext(
        tag_ids=load_tag_ids(repo_root),
        published=tuple(load_published(repo_root)),
        worn={lang: worn_headings(journal_dir, lang) for lang in LANGS},
    )


def check_key(repo_root: Path, translation_key: str) -> tuple[dict[str, Draft], list[str]]:
    texts = read_draft_texts(repo_root, translation_key)
    return collect_problems(translation_key, texts, _context(repo_root))


def _key_problem(translation_key: str) -> str | None:
    if KEBAB_RE.match(translation_key):
        return None
    return (
        "translationKey must be lowercase ASCII words joined by hyphens "
        f"(got {translation_key!r})"
    )


def _print_problems(problems: list[str]) -> int:
    for problem in problems:
        print(problem)
    return EXIT_PROBLEMS


def _cmd_new(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root)
    bad_key = _key_problem(args.translation_key)
    if bad_key:
        return _print_problems([bad_key])
    directory = draft_dir(repo_root, args.translation_key)
    paths = [directory / DRAFT_FILENAME.format(lang=lang) for lang in LANGS]
    existing = [p for p in paths if p.exists()]
    if existing:
        return _print_problems(
            [f"draft already exists, not overwriting: {p.relative_to(repo_root)}" for p in existing]
        )
    directory.mkdir(parents=True, exist_ok=True)
    for path in paths:
        path.write_text(DRAFT_TEMPLATE, encoding="utf-8")
        print(path.relative_to(repo_root))
    ensure_drafts_ignored(repo_root)
    return EXIT_OK


def _cmd_check(args: argparse.Namespace) -> int:
    _, problems = check_key(Path(args.repo_root), args.translation_key)
    if problems:
        return _print_problems(problems)
    print(OK_LINE)
    return EXIT_OK


def _stale_files(published: list[PublishedPiece], translation_key: str, keep: set[Path]):
    return [p.path for p in pieces_of(published, translation_key) if p.path not in keep]


def _cmd_publish(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root)
    drafts, problems = check_key(repo_root, args.translation_key)
    published = load_published(repo_root)
    publish_date, date_problems = resolve_publish_date(
        existing_publish_date(published, args.translation_key),
        args.publish_date,
        date.today().strftime(DATE_FORMAT),
    )
    problems += date_problems
    if problems or publish_date is None:
        return _print_problems(problems)
    texts = {
        published_path(repo_root, drafts[lang].slug, lang): render_published(
            args.translation_key, lang, drafts[lang], publish_date
        )
        for lang in LANGS
    }
    write_all_or_nothing(texts, _stale_files(published, args.translation_key, set(texts)))
    for path in texts:
        print(path.relative_to(repo_root))
    return EXIT_OK


def _cmd_status(args: argparse.Namespace) -> int:
    repo_root = Path(args.repo_root)
    published = load_published(repo_root)
    for key in list_draft_keys(repo_root):
        _, problems = check_key(repo_root, key)
        verdict = "clean" if not problems else f"{len(problems)} problems"
        pub_date = existing_publish_date(published, key)
        state = f"published {pub_date}" if pub_date else "not published"
        print(f"{key}  {verdict}  {state}")
    return EXIT_OK


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pipeline.journal.publish", description="Validate and publish journal pieces."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)
    for verb, helptext in (
        (VERB_NEW, "scaffold drafts/journal/<translationKey>/{fr,en}.md"),
        (VERB_CHECK, "print every problem of a draft pair, or OK"),
        (VERB_PUBLISH, "check, then write both published files or neither"),
        (VERB_STATUS, "one line per draft directory"),
    ):
        p = sub.add_parser(verb, help=helptext)
        if verb != VERB_STATUS:
            p.add_argument("translation_key")
        p.add_argument("--repo-root", default=str(DEFAULT_REPO_ROOT))
        if verb == VERB_PUBLISH:
            p.add_argument("--publish-date", default=None, help="DD-MM-YYYY (default: today)")
    return parser


_HANDLERS = {
    VERB_NEW: _cmd_new,
    VERB_CHECK: _cmd_check,
    VERB_PUBLISH: _cmd_publish,
    VERB_STATUS: _cmd_status,
}


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    return _HANDLERS[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())

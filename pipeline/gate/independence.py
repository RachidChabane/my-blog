"""G4 SOURCE-INDEPENDENCE gate (writing-rigor task 6; closes G4) -- single gate, ARGUE-scoped.

'>= 2 sources' (research.py ResearchCandidate.validate) is a COUNT, not independence: two echoes
of one press release qualify. This gate adds independence ON THE CHOSEN candidate, scoped to the
ARGUE task (NOT select): a fallback re-drive (gate/fallback.py) resets argue+draft but NOT select,
so a select-scoped gate would never re-fire on a fallback topic -- a syndicated-source fallback
topic would auto-publish ungated. argue is the per-chosen-topic pre-draft stage that DOES re-run.

TWO layers, both BLOCK (mirrors gate/factcheck.py's structural-backstop + semantic-verdict):

1. DETERMINISTIC distinct-ORIGIN backstop -- resolve the chosen candidate from the AUTHORITATIVE
   choice in plans/task-select/brief.md (parse_brief(...).chosen_topic_id) -> plans/task-research/
   candidates.json (NOT dedup.json, which is only the dedup RECOMMENDATION the select agent may
   override, prompts/select.py:56-57; precedent: gate/fallback.py resolves the live chosen topic via
   parse_brief). Its cited sources must span >= 2 DISTINCT origins (catches the lazy
   two-URLs-same-host echo). The origin is the registrable domain EXCEPT on distribution hosts
   (preprint servers: arxiv.org, openreview.net, biorxiv.org, medrxiv.org, ssrn.com), which host
   unaffiliated teams' work and so are keyed by PAPER id instead -- three distinct preprints are
   three origins, two links to the SAME paper still collapse to one. The judge (layer 2) remains
   the real cross-origin check.

2. JUDGE verdict (on the shared judge != author substrate, pipeline/gate/judge.py) -- a FRESH
   independence judge (dispatched by pipeline/prompts/argue.py via build_judge_dispatch) is handed
   ONLY the chosen candidate's cited sources and writes plans/task-argue/independence.json shaped
   {"verdict": "independent"|"single_origin", "origins": [...], "reason"}. This gate re-reads that
   verdict and BLOCKS on 'single_origin' -- catching CROSS-OUTLET SYNDICATION (distinct hosts, one
   origin: the same wire/press-release re-run) the domain backstop cannot see. VERDICT-ONLY
   (item_key=None); 'origins' is an informational list read tolerantly from report.data (mirrors
   editorial.py's 'issues').

SINGLE gate, NO --lang: independence is a property of the chosen topic's SOURCE SET, not the citing
language.

Fail-closed (mirrors factcheck.py): BLOCKS on a 'single_origin' verdict, on < 2 distinct domains,
on a MISSING/unreadable brief.md or candidates.json, on a chosen topic absent from candidates.json,
on a MISSING independence.json (the judge pass must have run), and on an unparseable/malformed
verdict (parse_judge_findings RAISES).

Top-level import of ..gate.judge is safe: this module is loaded only via
`python3 -m pipeline.gate.independence` (a fresh process) or directly by tests, NEVER through
`import pipeline` (test_gate.py:test_import_pipeline_does_not_import_gate_modules covers it). The
..stages imports (parse_brief / CandidatesDoc) are LAZY inside the CLI so the pure combiners stay
stages-free (mirrors gate/fallback.py's role split + the lazy draft._humanize import)
[MEM: pipeline-stages-import-light-runpy].
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlsplit

from ..contracts.claim_source_map import ContractError
from .judge import judge_passes, parse_judge_findings

# The independence judge's verdict vocabulary -- distinct from factcheck's supported/unsupported,
# editorial's publishable/thin, source-quality's sound/unsound, argument's defensible/weak, and
# review.py's APPROVED/NEEDS_REVISION (never conflate the vocabularies).
INDEPENDENCE_VERDICTS = ("independent", "single_origin")

# Common second-level public-suffix labels (co.uk, com.au, or.jp, ne.jp, gouv.fr, ac.uk ...). NOT
# the full Public Suffix List -- this is a proportionate stdlib BACKSTOP; the independence JUDGE is
# the real cross-origin check, so a rare exotic-suffix miss can only UNDER-count distinct domains
# (fail in the conservative direction). A full PSL (tldextract) is a deferred upgrade if ever
# needed, mirroring grounding.py's deferred real link-checker.
_SECOND_LEVEL_SUFFIXES = frozenset(
    {"co", "com", "org", "net", "edu", "gov", "ac", "gouv", "or", "ne"}
)

# Distribution hosts, not origins: a preprint server hosts unaffiliated teams' work, so the
# registrable domain is the wrong identity (three independent preprints would score as maximally
# dependent). Map each to the PAPER, keyed by its path, so three distinct preprints count as three
# origins while two links to the SAME paper still collapse to one (the anti-echo intent is
# preserved). Deliberately SMALL: do not add general news or aggregator hosts.
_DISTRIBUTION_HOSTS = frozenset(
    {"arxiv.org", "openreview.net", "biorxiv.org", "medrxiv.org", "ssrn.com"}
)


def _paper_path(path: str) -> str:
    """Normalize a distribution host's path to a stable paper key: strip surrounding slashes, an
    'abs/'/'pdf/' prefix, and a trailing version suffix (v1, v2 ...). Never raises."""
    path = path.strip("/").lower()
    for prefix in ("abs/", "pdf/"):
        if path.startswith(prefix):
            path = path[len(prefix):]
            break
    if path.endswith(".pdf"):
        path = path[:-4]
    head, sep, tail = path.rpartition("v")
    if sep and head and tail.isdigit():
        path = head
    return path


def _registrable_domain(url: str) -> str:
    """Best-effort ORIGIN key (registrable domain, eTLD+1) from a URL, lowercased.

    urlsplit drops scheme/port/userinfo; we strip a leading 'www.' and collapse to the last two
    labels -- or the last three when the second-to-last label is a known second-level public suffix
    (so bbc.co.uk -> bbc.co.uk, not co.uk). A hostname that does not parse falls back to the raw
    lowercased url (never silently collapses two distinct strings).

    On a _DISTRIBUTION_HOSTS preprint server the host is NOT the origin, so the key becomes
    '<host>/<paper id>' (arxiv.org/abs/2606.26479 and arxiv.org/pdf/2606.26479v2 both key to
    'arxiv.org/2606.26479'). An empty path keys to the bare host."""
    parts = urlsplit(url)
    host = parts.hostname
    if not host:
        return url.strip().lower()
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    labels = host.split(".")
    if len(labels) <= 2:
        domain = host
    elif labels[-2] in _SECOND_LEVEL_SUFFIXES:
        domain = ".".join(labels[-3:])
    else:
        domain = ".".join(labels[-2:])
    if domain in _DISTRIBUTION_HOSTS:
        paper = _paper_path(parts.path or "")
        return f"{domain}/{paper}" if paper else domain
    return domain


def check_domain_independence(urls: list[str]) -> list[str]:
    """Pure backstop: the chosen candidate's cited source URLs must span >= 2 distinct ORIGINS
    (empty == pass). Catches the lazy two-URLs-same-host echo. On a preprint distribution host the
    origin is the paper, not the host (see _registrable_domain), so three unaffiliated teams'
    preprints pass while two links to one paper still block. The message keeps the 'registrable
    domain' wording: the >= 2 semantics are unchanged, only the identity key is origin-aware."""
    domains = sorted({_registrable_domain(u) for u in urls})
    if len(domains) < 2:
        return [
            "chosen topic's cited sources span only "
            f"{len(domains)} distinct registrable domain(s) (need >= 2): {domains}"
        ]
    return []


def check_independence_findings(findings_text: str) -> list[str]:
    """Pure combiner: parse independence.json -> problems (empty == independent/pass).

    Fail-closed: an unparseable/malformed verdict yields a problem (so the gate BLOCKs); a
    'single_origin' verdict yields a problem naming the verdict + reason, then enumerates each
    informational origin (read tolerantly from report.data like editorial.py's issues)."""
    try:
        report = parse_judge_findings(
            findings_text, verdicts=INDEPENDENCE_VERDICTS, item_key=None
        )
    except ContractError as exc:
        return [f"invalid source-independence findings: {exc}"]
    if not judge_passes(report, pass_verdict="independent"):
        problems = [
            f"source-independence verdict is {report.verdict!r} (not 'independent'): "
            f"{report.reason}"
        ]
        for origin in report.data.get("origins") or []:
            problems.append(f"  origin: {origin}")
        return problems
    return []


def _check_chosen_domains(run_dir: Path) -> list[str]:
    """Layer (a): resolve the chosen candidate from brief.md -> candidates.json, then run the
    distinct-domain backstop. Fail-closed at every resolution step. Lazily imports the stages so the
    pure combiners above stay stages-free."""
    from ..stages.research import CandidatesDoc  # lazy: keep combiners stages-free
    from ..stages.select import parse_brief

    brief_path = run_dir / "plans" / "task-select" / "brief.md"
    candidates_path = run_dir / "plans" / "task-research" / "candidates.json"
    try:
        brief_text = brief_path.read_text(encoding="utf-8")
    except OSError:
        return ["cannot read brief.md (task-select) -- cannot resolve the chosen topic"]
    chosen_id = parse_brief(brief_text).chosen_topic_id
    if not chosen_id:
        return ["brief.md has no chosen_topic_id -- cannot resolve the chosen topic"]
    try:
        doc = CandidatesDoc.load_path(candidates_path)
        doc.validate()
    except (ContractError, OSError) as exc:
        return [f"cannot load candidates.json (task-research): {exc}"]
    candidate = next((c for c in doc.candidates if c.topic_id == chosen_id), None)
    if candidate is None:
        return [f"chosen topic {chosen_id!r} not in candidates.json"]
    return check_domain_independence([s.url for s in candidate.sources])


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.gate.independence --run-dir <dir>      (NO --lang)
# ---------------------------------------------------------------------------


def _cmd(run_dir: Path) -> int:
    problems = _check_chosen_domains(run_dir)  # layer (a): deterministic backstop

    findings_path = run_dir / "plans" / "task-argue" / "independence.json"
    try:
        findings_text = findings_path.read_text(encoding="utf-8")
    except OSError:
        problems.append(
            "missing independence.json (task-argue) -- the source-independence pass did not run"
        )
    else:
        problems += check_independence_findings(findings_text)  # layer (b): judge

    for problem in problems:
        print(problem)
    if problems:
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.gate.independence",
        description=(
            "G4 source-independence gate: distinct-domain backstop + 'single_origin' judge."
        ),
    )
    parser.add_argument("--run-dir", required=True, help="run dir (gate cwd; pass '.')")
    args = parser.parse_args(argv)
    return _cmd(Path(args.run_dir))


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "INDEPENDENCE_VERDICTS",
    "check_domain_independence",
    "check_independence_findings",
]

"""Humanize stage — style-findings parser + the deterministic no-emoji gate.

The humanize step (writing-flow.md section 5, role 4b) is an AGENT loop, not a Python
orchestrator: the global ``style-auditor`` sub-agent FLAGS AI-tells and off-voice prose
(it does not rewrite), a SEPARATE revise agent applies the suggested fixes, and the
auditor re-checks -- up to ``MAX_HUMANIZE_ROUNDS``. That loop lives in the draft prompt
(``pipeline/prompts/draft.py``); see the plan section 2.1 for why it is prompt-encoded
rather than backed by a fake seam.

This module owns the DETERMINISTIC, testable parts the agent shells out to (and that
task 26's blocking style gate reuses):

- ``parse_style_findings`` / ``style_passes`` consume the REAL ``style-auditor`` JSON
  shape (``~/.claude/agents/style-auditor.md`` output block); only ``clean`` passes.
- ``find_emoji`` / ``house_style_violations`` are the no-emoji hard rule (D-007).

Emoji scope (plan section 2.5, [MEM: emoji-detection-regex]): stdlib ``re`` has no
``\\p{Emoji_Presentation}`` and the ``regex``/``emoji`` libs are not installed, so this
uses a single astral-plane range. It guarantees ZERO false positives on text symbols
like (c) (r) (tm) -- the memory's hard requirement -- at the cost of recall: BMP emoji
(default- or VS16-presentation, e.g. U+2705 or U+26A0) are out of deterministic scope
and are caught by the fuzzy ``style-auditor``, which writing-flow section 5 designates
as the primary no-emoji enforcement. This scan is the fast backstop.
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from ..contracts.claim_source_map import ContractError

# OQ-14b PLACEHOLDER — the number of humanize flag->revise->recheck rounds before the
# draft stops trying. Independent of cpe's caps.max_review_rounds (which bounds the
# plan-review loop). Embedded in the draft prompt (pipeline/prompts/draft.py).
MAX_HUMANIZE_ROUNDS = 2

# Astral-plane emoji range (plan section 2.5). Covers emoticons, pictographs,
# transport, supplemental, extended-A and regional indicators. Single-char class so
# findall yields one entry per emoji. Deliberately excludes BMP symbols (zero-FP).
_EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF]")

# The style-auditor's verdict vocabulary (distinct from the editorial APPROVED /
# NEEDS_REVISION in review.py — never conflate them; plan section 2.3).
_STYLE_VERDICTS = ("clean", "suspicious", "revision_needed")


@dataclass(frozen=True)
class StyleIssue:
    """One flagged AI-tell from the style-auditor (its ``issues[]`` entry shape)."""

    phrase: str
    pattern: str  # the style-auditor enum: stock_phrase | em_dash | hedging | ...
    why_ai: str
    suggested_fix: str

    def to_dict(self) -> dict[str, str]:
        return {
            "phrase": self.phrase,
            "pattern": self.pattern,
            "why_ai": self.why_ai,
            "suggested_fix": self.suggested_fix,
        }


@dataclass(frozen=True)
class StyleReport:
    """A parsed ``style-auditor`` finding set. Only ``verdict == 'clean'`` passes."""

    verdict: str  # clean | suspicious | revision_needed
    issues: list[StyleIssue] = field(default_factory=list)
    context: str = ""
    confidence: str = ""
    summary: str = ""

    def to_dict(self) -> dict:
        return {
            "verdict": self.verdict,
            "issues": [issue.to_dict() for issue in self.issues],
            "context": self.context,
            "confidence": self.confidence,
            "summary": self.summary,
        }


def _issue_from_dict(data: object) -> StyleIssue:
    """Map one ``issues[]`` entry; tolerate missing optional fields (plan section 3.4)."""
    if not isinstance(data, dict):
        raise ContractError(f"style issue must be a mapping (got {type(data).__name__})")
    return StyleIssue(
        phrase=str(data.get("phrase", "")),
        pattern=str(data.get("pattern", "")),
        why_ai=str(data.get("why_ai", "")),
        suggested_fix=str(data.get("suggested_fix", "")),
    )


def parse_style_findings(data: dict | str) -> StyleReport:
    """Parse the raw style-auditor JSON (str -> ``json.loads``) into a ``StyleReport``.

    Raises ``ContractError`` on invalid JSON, a non-object payload, or an unknown
    ``verdict``. Optional fields (``context`` / ``confidence`` / ``summary`` and each
    issue's fields) default to empty when absent.
    """
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid style findings JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ContractError("style findings must be a JSON object")
    verdict = data.get("verdict")
    if verdict not in _STYLE_VERDICTS:
        raise ContractError(
            f"style verdict must be one of {_STYLE_VERDICTS} (got {verdict!r})"
        )
    raw_issues = data.get("issues") or []
    if not isinstance(raw_issues, list):
        raise ContractError("style findings 'issues' must be a list")
    return StyleReport(
        verdict=verdict,
        issues=[_issue_from_dict(item) for item in raw_issues],
        context=str(data.get("context", "")),
        confidence=str(data.get("confidence", "")),
        summary=str(data.get("summary", "")),
    )


def style_passes(report: StyleReport) -> bool:
    """Only a ``clean`` verdict passes; ``suspicious`` / ``revision_needed`` fail."""
    return report.verdict == "clean"


def find_emoji(text: str) -> list[str]:
    """All astral-plane emoji characters in ``text`` (in order; see module docstring)."""
    return _EMOJI_RE.findall(text)


def house_style_violations(text: str) -> list[str]:
    """Deterministic house-style problems (empty == clean).

    v1 is the no-emoji hard rule (D-007): one problem per DISTINCT emoji found. Fuzzy
    voice / AI-tell judgments are the style-auditor's job, not this scan's.
    """
    problems: list[str] = []
    seen: set[str] = set()
    for char in find_emoji(text):
        if char in seen:
            continue
        seen.add(char)
        problems.append(f"no-emoji (D-007): found emoji {char!r} (U+{ord(char):04X})")
    return problems


# ---------------------------------------------------------------------------
# CLI: python3 -m pipeline.stages.humanize {verdict,scan}
# ---------------------------------------------------------------------------


def _cmd_verdict(args) -> int:
    try:
        text = Path(args.path).read_text(encoding="utf-8")
    except OSError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    try:
        report = parse_style_findings(text)
    except ContractError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    print(f"verdict: {report.verdict}")
    if style_passes(report):
        return 0
    for issue in report.issues:
        print(f"  [{issue.pattern}] {issue.phrase}")
    return 1


def _cmd_scan(args) -> int:
    try:
        text = Path(args.path).read_text(encoding="utf-8")
    except OSError as exc:
        print(f"INVALID: {exc}", file=sys.stderr)
        return 1
    problems = house_style_violations(text)
    if problems:
        for problem in problems:
            print(problem)
        return 1
    print("OK")
    return 0


def _main(argv: list[str] | None = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(
        prog="pipeline.stages.humanize",
        description="Humanize helpers: style-findings verdict + no-emoji scan.",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_verdict = sub.add_parser(
        "verdict", help="parse a style-auditor findings JSON; exit 0 iff 'clean'"
    )
    p_verdict.add_argument("path", help="path to a style findings JSON")

    p_scan = sub.add_parser(
        "scan", help="no-emoji house-style scan of a draft; exit 0 iff no violations"
    )
    p_scan.add_argument("path", help="path to a draft .md")

    args = parser.parse_args(argv)
    if args.cmd == "verdict":
        return _cmd_verdict(args)
    return _cmd_scan(args)


if __name__ == "__main__":
    raise SystemExit(_main())


__all__ = [
    "MAX_HUMANIZE_ROUNDS",
    "StyleIssue",
    "StyleReport",
    "parse_style_findings",
    "style_passes",
    "find_emoji",
    "house_style_violations",
]

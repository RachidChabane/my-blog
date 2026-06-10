"""Terminal-failure / cadence policy (OQ-14a, writing-flow.md section 7) -- harness-owned.

When the ``draft`` task BLOCKS after cpe's gate-repair rounds are spent, cpe cannot jump
back to ``draft`` via a ``depends_on`` edge, so the harness (``runner.run``) drives the
fallback-to-next-topic re-drive itself. This module is the logic it calls.

The stale-skeleton dead-end (plan D5): merely swapping ``chosen_topic_id`` would leave
the brief's ``claim_skeleton`` built for the ORIGINAL topic, so the re-driven draft's own
review self-gate would emit NEEDS_REVISION forever (old skeleton source_ids never
covered). ``rewrite_brief_for_fallback`` instead rebuilds the brief to be internally
consistent for the fallback candidate -- its skeleton comes from that candidate's real
``sources`` + ``summary`` read from ``candidates.json``. [MEM: m4-gate-contract]

Imported ONLY lazily by ``runner.run`` (and directly by the tests) -- never via
``import pipeline`` -- so its ``stages.select`` / ``stages.research`` imports stay out of
the ``import pipeline`` graph (the import-light invariant; plan section 0.7 / R1).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import yaml

from ..config import PipelineConfig, ensure_cpe_importable
from ..contracts.claim_source_map import ContractError
from ..stages.research import CandidatesDoc, ResearchCandidate
from ..stages.select import REQUIRED_BODY_HEADERS, parse_brief

# Stale draft artifacts removed on a retry so a re-draft that skips a producer fails the
# gate LOUDLY (missing findings) rather than passing on last run's stale output.
_STALE_DRAFT_ARTIFACTS = (
    "draft-fr.md",
    "draft-en.md",
    "claim_source_map.json",
    "factcheck-fr.json",
    "factcheck-en.json",
    "style-fr.json",
    "style-en.json",
    "editorial.json",  # task 4: G3 editorial findings -- a re-draft must re-dispatch the judge
    "source_quality.json",  # task 5: G2 source-quality findings -- re-draft must re-dispatch
    "review.json",
)

# Stale argue artifacts removed on a retry so a re-argued fallback topic cannot pass on the
# KILLED topic's verdict (the task-draft loop below only unlinks from task-draft/). A fallback
# re-drive picks a NEW topic, so a surviving independence.json from the killed topic would let
# the re-argued fallback pass G4 on the wrong topic's stale verdict.
_STALE_ARGUE_ARTIFACTS = ("argument.json", "independence.json")  # task 6 adds independence.json


@dataclass(frozen=True)
class FallbackDecision:
    """The fallback policy's verdict for one blocked-draft event."""

    action: Literal["retry", "skip"]
    topic_id: str | None
    remaining: list[str]
    reason: str


def decide_fallback(
    brief_text: str, *, attempts_used: int, max_attempts: int
) -> FallbackDecision:
    """PURE: decide whether to retry the next fallback topic or skip+alert.

    Order matters: the attempt budget is checked BEFORE the shortlist, so an exhausted
    budget skips even when the brief still lists fallbacks.
    """
    fallbacks = parse_brief(brief_text).fallback_topic_ids
    if attempts_used >= max_attempts:
        return FallbackDecision(
            "skip", None, [], f"fallback attempts exhausted (max {max_attempts})"
        )
    if not fallbacks:
        return FallbackDecision(
            "skip", None, [], "fallback shortlist is dry -- skip+alert (FR-F2)"
        )
    return FallbackDecision(
        "retry",
        topic_id=fallbacks[0],
        remaining=list(fallbacks[1:]),
        reason=f"retry with fallback topic {fallbacks[0]!r}",
    )


def rewrite_brief_for_fallback(
    brief_text: str, candidate: ResearchCandidate, remaining: list[str]
) -> str:
    """PURE: produce a brief INTERNALLY CONSISTENT for ``candidate`` (avoids the D5
    dead-end). ``brief_text`` is accepted for call-site symmetry; the rewrite is fully
    determined by ``candidate`` + ``remaining`` (a re-draft must not inherit stale
    skeleton state)."""
    source_ids = [source.source_id for source in candidate.sources]
    frontmatter = {
        "chosen_topic_id": candidate.topic_id,
        "fallback_topic_ids": list(remaining),
        "angle": candidate.why_relevant,
        "claim_skeleton": [
            {
                "id": "c1",
                "statement": candidate.summary,
                "source_ids": source_ids,
            }
        ],
    }
    fm_block = yaml.safe_dump(frontmatter, sort_keys=False, allow_unicode=True)

    sections = {
        "## Angle": candidate.why_relevant,
        "## Outline": f"- {candidate.title}",
        "## Claim skeleton": f"- c1 ({', '.join(source_ids)}): {candidate.summary}",
        "## Fallback shortlist": "\n".join(f"- {tid}" for tid in remaining),
    }
    body_parts: list[str] = []
    for header in REQUIRED_BODY_HEADERS:  # all four, canonical order (validate_brief)
        body_parts.extend([header, "", sections.get(header, ""), ""])
    body = "\n".join(body_parts)
    return f"---\n{fm_block}---\n\n{body}"


def write_alert(
    run_dir: Path | str,
    *,
    reason: str,
    blocked_task: str,
    topic_id: str | None = None,
) -> Path:
    """Write ``plans/ALERT.json`` (FR-C3 retains artifacts + alerts / FR-F2). Returns
    the path.

    ``blocked_task`` is REQUIRED (FR-F2): the alert names the REAL blocker (``argue`` or
    ``draft``) as a type-level guarantee, not a defaulted convention -- a blocked ``argue``
    must not be mis-reported as ``draft``."""
    path = Path(run_dir) / "plans" / "ALERT.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "kind": "terminal_failure",
        "blocked_task": blocked_task,
        "reason": reason,
        "topic_id": topic_id,
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def apply_fallback(
    run_dir: Path | str,
    config: PipelineConfig,
    *,
    attempts_used: int,
    blocked_task: str,
) -> FallbackDecision:
    """STATEFUL: the ``run()`` step. Decide; on retry rewrite the brief for the fallback
    candidate, reset BOTH ``argue`` and ``draft`` to pending, and clear their stale
    artifacts; on skip write the alert. Defensive: any unreadable/unusable input degrades
    to skip+alert (never raises). [MEM: m4-gate-contract]

    ``blocked_task`` (``argue`` or ``draft``) names the REAL blocker on every alert path
    (FR-F2). BOTH stages reset on a fallback regardless of which one blocked: the fallback
    picks a NEW topic, so the new thesis must be re-argued by a fresh judge -- a surviving
    ``argument.json`` for the killed topic would feed the re-driven draft a
    ``strengthened_argument`` for the wrong thesis."""
    run_dir = Path(run_dir)
    brief_path = run_dir / "plans" / "task-select" / "brief.md"
    try:
        brief_text = brief_path.read_text(encoding="utf-8")
    except OSError:
        reason = "cannot read brief.md for fallback"
        write_alert(run_dir, reason=reason, blocked_task=blocked_task)
        return FallbackDecision("skip", None, [], reason)

    decision = decide_fallback(
        brief_text,
        attempts_used=attempts_used,
        max_attempts=config.fallback_topic_attempts,
    )
    if decision.action == "skip":
        write_alert(run_dir, reason=decision.reason, blocked_task=blocked_task)
        return decision

    # retry: locate the fallback candidate in candidates.json (R9: an unparseable
    # candidates.json -- e.g. the fake's bare-array stub -- degrades to skip+alert).
    candidates_path = run_dir / "plans" / "task-research" / "candidates.json"
    try:
        doc = CandidatesDoc.load_path(candidates_path)
        doc.validate()
    except (ContractError, OSError) as exc:
        reason = f"candidates.json unusable for fallback: {exc}"
        write_alert(run_dir, reason=reason, blocked_task=blocked_task)
        return FallbackDecision("skip", None, [], reason)
    candidate = next(
        (c for c in doc.candidates if c.topic_id == decision.topic_id), None
    )
    if candidate is None:
        reason = f"fallback topic {decision.topic_id!r} not in candidates.json"
        write_alert(run_dir, reason=reason, blocked_task=blocked_task)
        return FallbackDecision("skip", None, [], reason)

    brief_path.write_text(
        rewrite_brief_for_fallback(brief_text, candidate, decision.remaining),
        encoding="utf-8",
    )

    # Reset cpe state so the re-drive re-runs argue THEN draft (publish is already pending).
    # Both reset: the new fallback thesis must be re-argued by a fresh judge before re-draft.
    ensure_cpe_importable()
    from claude_plan_execute.state import State

    state = State(run_dir / "plans" / "state.json")
    for task_id in ("argue", "draft"):
        entry = state.get(task_id)        # auto-creates pending if absent (safe)
        entry["status"] = "pending"
        entry.pop("block_reason", None)   # set_status merges; pop a stale reason (R6)
    state.save()

    for subdir, names in (
        ("task-argue", _STALE_ARGUE_ARTIFACTS),
        ("task-draft", _STALE_DRAFT_ARTIFACTS),
    ):
        stage_dir = run_dir / "plans" / subdir
        for name in names:
            try:
                (stage_dir / name).unlink()
            except OSError:
                pass  # ignore missing
    return decision


__all__ = [
    "FallbackDecision",
    "decide_fallback",
    "rewrite_brief_for_fallback",
    "write_alert",
    "apply_fallback",
]

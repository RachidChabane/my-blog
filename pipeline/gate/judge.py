"""Shared judge != author verdict substrate for the writing-rigor judge gates.

G1 (argument-rigor, task 3), G3 (editorial-quality, task 4), and G2 (source-quality,
task 5) are three LLM-judge gates that must share ONE judge != author substrate, not
three bespoke implementations. This module is that substrate: a generic FAIL-CLOSED
verdict parser, a frozen ``JudgeReport`` + a VERDICT-ONLY ``judge_passes`` predicate,
and a shared dispatch-prompt helper. Tasks 3-6 build their gate CLIs + prompt builders
on top of it; this module ships NO CLI of its own (it is substrate).

Factored from the proven, frozen patterns in:
  - ``pipeline/gate/factcheck.py`` (``parse_factcheck_findings`` / ``_claim_from_dict``)
    -- the fail-closed parser + frozen-report shape;
  - ``pipeline/prompts/draft.py:_factcheck_section`` -- the judge != author dispatch block.

It deliberately does NOT lift factcheck's ``all(c.supported)`` "every per-item boolean
must be true" rule: that "must be true" semantic is factcheck-specific, and factcheck
stays OFF this substrate. Here the per-item ``required_item_fields`` are a fail-closed
PRESENCE backstop ONLY -- a MISSING required field RAISES in the parser, but a
present-and-FALSE descriptive boolean (e.g. source-quality's ``primary=false`` on a
legitimately sound SECONDARY source) does NOT auto-fail: ``judge_passes`` is
VERDICT-ONLY. Each gate supplies its own verdict vocabulary + ``pass_verdict`` so the
four vocabularies (supported|unsupported vs APPROVED|NEEDS_REVISION vs
clean|suspicious|revision_needed vs each judge's own) are NEVER conflated.

Consumer note: ``item_key`` + ``required_item_fields`` exist for exactly one current
consumer -- source-quality's ``claims`` list. Argument/editorial/independence are all
``item_key=None`` and read any informational list (``issues``/``origins``/``steelman``)
from ``report.data``; do NOT attach the presence backstop to an OPTIONAL list, because
this parser RAISES on an absent list (fail-closed), unlike style.py's tolerant ``or []``.

Import-light [MEM: pipeline-stages-import-light-runpy]: no top-level ``..stages`` import,
no CLI -- so ``import pipeline`` never pulls this in (the wildcard guard
``test_gate.py:test_import_pipeline_does_not_import_gate_modules`` already covers it).
Reuses ``pipeline.contracts.claim_source_map.ContractError`` (one error type).
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ..contracts.claim_source_map import ContractError


@dataclass(frozen=True)
class JudgeReport:
    """A parsed judge-findings JSON, generic across the three judge gates.

    ``verdict`` is guaranteed to be one of the caller's ``verdicts``. ``items`` is the
    validated per-item list under ``item_key`` (``[]`` when ``item_key is None``); each
    entry is a raw mapping the consuming gate interprets. ``data`` is the full raw
    payload -- the escape hatch for the verdict-adjacent fields each schema carries
    (``reason``, ``strengthened_argument``, ``origins``, per-item ``note`` ...).
    """

    verdict: str
    items: list[dict]
    data: dict

    @property
    def reason(self) -> str:
        """The universal ``reason`` field (every judge schema carries one); '' if absent."""
        return str(self.data.get("reason", ""))


def _validate_item(
    entry: object, item_key: str, required_item_fields: tuple[str, ...]
) -> dict:
    """One per-item entry. FAIL-CLOSED PRESENCE backstop: the entry must be a mapping and
    must CONTAIN every name in ``required_item_fields`` (a dropped field would otherwise
    be read downstream as a falsy default). Field TYPES are NOT checked -- the substrate
    is field-type-agnostic and the per-item booleans are descriptive (the verdict, not
    the booleans, decides ``judge_passes``)."""
    if not isinstance(entry, dict):
        raise ContractError(
            f"judge {item_key} entry must be a mapping (got {type(entry).__name__})"
        )
    for field_name in required_item_fields:
        if field_name not in entry:
            raise ContractError(
                f"judge {item_key} entry missing required field {field_name!r}"
            )
    return entry


def parse_judge_findings(
    data: dict | str,
    *,
    verdicts: tuple[str, ...],
    item_key: str | None,
    required_item_fields: tuple[str, ...] = (),
) -> JudgeReport:
    """Parse a judge-findings payload (str -> ``json.loads``) into a ``JudgeReport``.

    FAIL-CLOSED -- raises ``ContractError`` on:
      - invalid JSON (a string that does not parse);
      - a non-object payload (not a JSON object / ``dict``);
      - a ``verdict`` not in ``verdicts`` (a MISSING ``verdict`` is ``None`` -> raises);
      - when ``item_key`` is set: the field is absent or not a list (fail-closed -- the
        producer MUST emit it, ``[]`` when empty);
      - when ``item_key`` is set: an entry that is not a mapping, or that is missing any
        name in ``required_item_fields``.

    When ``item_key is None`` no per-item validation runs (``items == []``); a verdict-only
    gate, or one whose informational list is scalars (e.g. ``origins``), reads that list
    from ``report.data`` itself.
    """
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError as exc:
            raise ContractError(f"invalid judge findings JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ContractError("judge findings must be a JSON object")

    verdict = data.get("verdict")
    if verdict not in verdicts:
        raise ContractError(
            f"judge verdict must be one of {verdicts} (got {verdict!r})"
        )

    items: list[dict] = []
    if item_key is not None:
        raw_items = data.get(item_key)
        if not isinstance(raw_items, list):
            raise ContractError(f"judge findings {item_key!r} must be a list")
        items = [
            _validate_item(entry, item_key, required_item_fields) for entry in raw_items
        ]

    return JudgeReport(verdict=verdict, items=items, data=data)


def judge_passes(report: JudgeReport, *, pass_verdict: str) -> bool:
    """VERDICT-ONLY: pass iff ``report.verdict == pass_verdict``.

    Deliberately NOT factcheck's ``all(...)`` over per-item booleans -- the per-item
    ``required_item_fields`` are a presence backstop in the parser, not a pass rule. A
    present-and-FALSE descriptive boolean (a sound SECONDARY source's ``primary=false``)
    still passes; only the judge's verdict blocks the gate. (If ``pass_verdict`` is not a
    member of the parser's ``verdicts``, every report fails -- a benign fail-closed.)
    """
    return report.verdict == pass_verdict


def build_judge_dispatch(
    *,
    role: str,
    inputs_desc: str,
    out_path: str | Path,
    verdict_schema: str,
) -> str:
    """The canonical judge != author dispatch instruction block (pure, ASCII-only).

    Factored from ``pipeline/prompts/draft.py:_factcheck_section`` so the tasks-3-5 prompt
    builders vary only ``role`` + ``inputs_desc`` + ``out_path`` + ``verdict_schema``. The
    returned block instructs the stage to dispatch a FRESH general-purpose sub-agent with
    clean context that does NOT see the draft prose / the brief / who authored the work,
    is handed ONLY ``inputs_desc``, WRITES ``out_path`` (shaped ``verdict_schema``), and
    whose verdict the author does NOT override. Callers pass an ABSOLUTE ``out_path``
    (D-007: ASCII-only; paths absolute). Indented as 3-space bullets so it nests under a
    numbered step in the calling prompt (mirrors ``_factcheck_section``'s sub-bullets).
    """
    out_path = Path(out_path)
    return (
        "   - This is a JUDGE != AUTHOR check: do NOT grade your own work. A self-graded\n"
        "     check rubber-stamps itself and the gate would verify nothing.\n"
        "   - Dispatch a FRESH general-purpose sub-agent (a new Task with clean context)\n"
        f"     as the {role}. It does NOT see the draft prose, the brief, or the fact that\n"
        f"     you authored this; hand it ONLY {inputs_desc}.\n"
        "   - The sub-agent WRITES this file (you do NOT write it yourself, and you do NOT\n"
        "     override its verdict):\n"
        f"       {out_path}\n"
        f"     shaped {verdict_schema}\n"
    )


__all__ = [
    "JudgeReport",
    "parse_judge_findings",
    "judge_passes",
    "build_judge_dispatch",
]

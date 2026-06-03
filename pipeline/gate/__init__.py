"""The M-4 editorial quality gate (writing-flow.md section 4 / FR-C1/C2/C3, NFR-3).

The blocking checks attached to the ``draft`` cpe task via ``draft.gates_extra`` +
``defaults.invariants_file: pipeline/invariants.yaml``: fact-check provenance
(``factcheck``), source-grounding (``grounding``), and style (``style``), each run per
language. ``fallback`` is the harness-owned terminal-failure / cadence policy (OQ-14a)
the runner drives when ``draft`` blocks after gate-repair.

Kept import-light (NO eager re-exports of ``factcheck`` / ``grounding`` / ``style`` /
``fallback``) so ``python3 -m pipeline.gate.<name>`` runs without a runpy
double-import RuntimeWarning -- exactly as ``pipeline/stages/__init__.py`` is kept light
[MEM: pipeline-stages-import-light-runpy]. Import the check functions directly from the
submodules (``from pipeline.gate.factcheck import ...``), as the tests do; never via
``import pipeline``.
"""

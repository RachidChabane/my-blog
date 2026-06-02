"""Editorial stage helpers (deterministic Python the agents shell out to).

Each stage module pairs a data model + validator + a thin CLI:

- ``research``: the ``candidates.json`` envelope (research -> select handoff).
- ``select``: semantic dedup vs topic memory, topic choice, brief parse/validate.

Kept import-light at the package level (no eager re-exports) so
``python3 -m pipeline.stages.<name>`` runs the module CLI without a runpy
double-import warning. Import the models directly from the submodules.
"""

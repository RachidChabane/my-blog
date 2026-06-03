"""Scheduling / monitoring / alerting / pause-resume for the editorial run (M-5).

The LOCAL cron/launchd entrypoint (``python -m pipeline.schedule.cron``) that
drives one editorial slate on the **tmux/subscription** backend, plus a daily
dead-man's-switch monitor, a file/log alert layer (FR-F2), and a
``schedule.json`` pause flag (FR-F4). See ``pipeline/README.md`` -> "Scheduling
(M-5)" for the honest limitations (a local monitor shares the runner's failure
domain; live email/webhook + an external uptime-ping dead-man's-switch are
POST-SECRET seams behind ``AlertSink``; the git push that fires deploy/reindex is
owner/deploy-wiring, not done here).

Kept import-light at the package level (NO eager re-exports) so
``python -m pipeline.schedule.cron`` runs the module CLI without a runpy
double-import RuntimeWarning -- exactly as ``pipeline/stages/__init__.py`` and
``pipeline/gate/__init__.py`` are kept light [MEM: pipeline-stages-import-light-runpy].
Import submodules directly (``from pipeline.schedule.cadence import ...``), as the
tests do; never via ``import pipeline``.
"""

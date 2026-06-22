"""Radar pipeline -- a lighter, parallel content engine for short dated AI-engineering
release/spec/tool briefs (the "what shipped this week" surface the essay pipeline
deliberately skips, W-5).

It REUSES the essay engine's substrate verbatim: ``runner.assemble_slate`` /
``CpeLoopDriver`` (cpe drive + auto-resume), ``config.PipelineConfig`` (cpe discovery),
``schedule.deploy`` / ``schedule.heartbeat`` / ``schedule.pause`` / ``schedule.alert``,
and the ``memory.TopicMemory`` store. The ONLY mandatory difference is NAMESPACING: a
radar run gets its own ``runs_root`` (``pipeline/runs-radar``), ``template_path``
(``pipeline/radar/tasks-template.yaml``), ``schedule_state_dir``
(``pipeline/schedule/state-radar``) and topic-memory store
(``pipeline/memory/radar_memory.json``), so a same-calendar-day radar run never collides
with / resumes the essay slate (``cadence.run_id_for`` is a bare ``%Y-%m-%d``).

Stages are research -> draft -> publish (no select/argue: radar dedups inside research
and validates structure deterministically at publish, instead of the essay pipeline's
judge gates).
"""

---
translationKey: 'claude-plan-execute'
lang: 'en'
slug: 'claude-plan-execute'
name: 'Claude Plan Execute — Autonomous Task Orchestrator'
summary: 'A plan→review→implement orchestrator that drives the Claude Code CLI through a multi-phase, multi-agent workflow over a declarative task slate, with quality gates, branch-per-task, cross-task memory, and a subscription-pool-preserving tmux backend.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'tmux'
  - 'YAML'
  - 'pytest'
  - 'FastAPI'
status: 'active'
links:[]
publishState: 'draft'
---

Claude Plan Execute runs a fixed lifecycle for every task: Plan agent writes a structured plan; a Review loop checks it (APPROVED / NEEDS_REVISION) and iterates a revise agent up to the configured round cap; only an approved plan reaches the Implement agent, which works in committed chunks with a resumable progress checklist. Role specialization is prompt-swapping, not separate binaries. A dual-backend driver lets the same code run either the `claude -p` print backend or a real interactive Claude TUI inside tmux — the latter keeps usage on the Claude subscription pool rather than the metered API. The project dogfoods itself: its own roadmap is the tasks.yaml it executes.

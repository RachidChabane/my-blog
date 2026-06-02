---
translationKey: 'ijtihad-engine'
lang: 'en'
slug: 'ijtihad-engine'
name: 'Ijtihad Engine — Autonomous Research System'
summary: 'A self-improving, multi-agent LLM orchestration system that autonomously attacks open problems in mathematics and science, verifying claims formally and producing publication-ready research papers.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'LaTeX'
  - 'aiosqlite'
  - 'SymPy'
  - 'Z3'
  - 'FastAPI'
status: 'active (paused)'
links: []
publishState: 'draft'
---

The Ijtihad Engine runs ~16 specialized Claude Code subagents across an 8-phase cycle: divergence, claim extraction, friction, evidence-quality audit, evidence-sufficiency gate, synthesis, meta-evolution, and formal construction. At its core is a SQLite-backed epistemic claim graph that tracks atomic claims through a confidence lifecycle (conjectured → supported → replicated → contested → refuted) with typed victory conditions — Lean proof, SymPy verification, or simulation fragility threshold. The engine has produced compiled, submission-ready research papers as real outputs.

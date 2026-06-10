---
translationKey: 'ijtihad-engine'
lang: 'en'
slug: 'autonomous-research-engine'
name: 'Autonomous Research Engine'
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
publishState: 'published'
year: '2026'
highlights:
  - 'Runs roughly 16 specialized Claude Code subagents across a single 8-phase research cycle'
  - 'A SQLite-backed epistemic claim graph tracks atomic claims through a confidence lifecycle (conjectured, supported, replicated, contested, refuted)'
  - 'Claims resolve via typed victory conditions: a Lean proof, a SymPy verification, or a simulation fragility threshold'
  - 'Has produced compiled, submission-ready research papers as real outputs'
metrics:
  - value: '~16'
    label: 'specialized subagents'
  - value: '8'
    label: 'cycle phases'
  - value: '5'
    label: 'confidence states'
architecture:
  caption: 'Claim flow from subagent divergence to submission-ready papers'
  layers:
    - label: 'Agent orchestration'
      nodes:
        - '~16 Claude Code subagents'
    - label: '8-phase cycle'
      nodes:
        - 'Divergence'
        - 'Claim extraction'
        - 'Friction'
        - 'Evidence-quality audit'
        - 'Synthesis'
    - label: 'Epistemic claim graph (SQLite)'
      nodes:
        - 'Atomic claims'
        - 'Confidence lifecycle'
        - 'Evidence-sufficiency gate'
    - label: 'Typed victory conditions'
      nodes:
        - 'Lean proof'
        - 'SymPy verification'
        - 'Simulation fragility threshold'
    - label: 'Output'
      nodes:
        - 'Compiled submission-ready papers'
---

The engine runs ~16 specialized Claude Code subagents across an 8-phase cycle: divergence, claim extraction, friction, evidence-quality audit, evidence-sufficiency gate, synthesis, meta-evolution, and formal construction. At its core is a SQLite-backed epistemic claim graph that tracks atomic claims through a confidence lifecycle (conjectured, supported, replicated, contested, refuted) with typed victory conditions: Lean proof, SymPy verification, or simulation fragility threshold. The engine has produced compiled, submission-ready research papers as real outputs.

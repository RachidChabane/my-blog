---
translationKey: 'musthold'
lang: 'en'
slug: 'musthold'
name: 'musthold: Per-Requirement Proofs That an Agent''s Tests Check the Spec'
summary: 'Proof modules behind the shallnot gate that check, requirement by requirement, that a coding agent''s tests would fail on code that breaks the spec, and send the agent a counterexample when they would not.'
stack:
  - 'Go'
  - 'Mutation testing'
  - 'Claude Code'
  - 'Codex'
  - 'Copilot CLI'
  - 'Sigstore'
status: 'active'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/musthold'
  - label: 'shallnot'
    url: 'https://github.com/RachidChabane/shallnot'
publishState: 'published'
year: '2026'
highlights:
  - 'Four proofs per requirement: traceability (shallnot), discriminating power, alignment and completeness; a requirement passes only when traceability and every required proof pass'
  - 'A mutant counts only if it builds, passes the tests of the other requirements and fails an example of its requirement, or a witness test written from the spec before any mutant existed'
  - 'When the tests miss a violation, the gate names the requirement and an input they do not tell apart but never the broken code, so no test can be fitted to that code'
  - 'No binary calls a model. A module writes a request, and the harness already in use answers it in a subagent that sees nothing else'
  - 'A recorded Claude Code session shows the loop in 9 min 17 s. Blocked on three surviving mutants of one criterion, the agent adds a test at ages 65 and 120, and the gate allows the stop'
  - 'The scan needs no spec. On this site''s own suite, 3 of 40 sampled tests passed every proven change in the lines they ran'
  - 'musthold gates itself, with 907 requirements across 12 Go modules traced to tagged tests in CI'
metrics:
  - value: '4'
    label: 'proofs per requirement'
  - value: '907'
    label: 'own requirements gated in CI'
  - value: '5'
    label: 'test runners supported'
architecture:
  caption: 'From a spec to a verdict the agent can act on'
  layers:
    - label: 'Spec'
      nodes:
        - 'requirements ID~REVISION'
        - 'inline examples'
    - label: 'Proofs'
      nodes:
        - 'musthold-dp'
        - 'musthold-alignment'
        - 'musthold-completeness'
    - label: 'Harness'
      nodes:
        - 'blind subagents'
        - 'Claude Code'
        - 'Codex'
        - 'Copilot CLI'
    - label: 'Publication'
      nodes:
        - 'musthold-verify'
        - 'local proofs'
        - 'signed CI proofs'
    - label: 'Gate'
      nodes:
        - 'shallnot gate'
        - 'end-of-turn hook'
        - 'counterexample'
---

musthold extends shallnot from "a test cites this requirement and passed" to "the tests of this requirement would fail on code that breaks it". It reads a spec written in plain language and, for each requirement, draws mutants of the code the requirement governs. A mutant counts only if it builds, passes the tests of every other requirement and fails an example of its own requirement, or a witness test written from the spec before any mutant existed. If every test of the requirement still passes on such a mutant, the requirement is blocked. The gate then names the requirement and an input the tests do not tell apart, but never the mutant's code, and the agent strengthens its tests. Alignment escalates a test that checks something other than what its requirement states, and completeness reports what the spec leaves unstated about a change. No binary calls a model. When a proof needs judgment, the module writes a request, and the harness already in use (Claude Code, Codex or Copilot CLI) answers it in a blind subagent. A model's judgment alone never blocks and never clears a survivor. The scan runs the same machinery on any pytest, Go, Jest or Vitest suite without a spec. It lists the tests that still pass when the code they run is broken, along with a script that replays each change. A green run proves that the tests catch the mutants drawn, not that they catch every possible bug, and that bound is stated.

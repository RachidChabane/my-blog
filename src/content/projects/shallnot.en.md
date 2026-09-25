---
translationKey: 'shallnot'
lang: 'en'
slug: 'shallnot'
name: 'shallnot: Spec-to-Test Traceability Gate for Coding Agents'
summary: 'A deterministic gate that stops a coding agent from reporting work as done while a requirement still has no passing test, joining specs, test sources and JUnit XML results in a single static Go binary that never calls a model.'
stack:
  - 'Go'
  - 'YAML'
  - 'JUnit XML'
  - 'GitHub Actions'
  - 'Claude Code'
status: 'active'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/shallnot'
publishState: 'published'
year: '2026'
highlights:
  - 'Requirements carry a revision, so bumping it invalidates every test still citing the previous meaning and a reworded requirement cannot ride on a stale green'
  - 'A tag only counts once it reaches the results file: a tag in a comment, or on a test that never ran, binds nothing'
  - 'shallnot init equips a repository in one command: runner config, agent instructions, skills, and an end-of-turn hook for 9 agent harnesses'
  - 'Determinism is enforced rather than promised: an architecture test fails the build if the binary links a networking package, or if the domain and analysis layers reach for a file'
  - 'The tool gates itself, binding its own 57 requirements to tagged tests in CI, including the two that pin its own architecture'
  - 'The limit of a green run is documented rather than hidden: it proves a passing test cites the requirement, not that the test asserts anything worthwhile'
metrics:
  - value: '57'
    label: 'own requirements gated in CI'
  - value: '9'
    label: 'agent harnesses hooked'
architecture:
  caption: 'Three inputs joined into one verdict'
  layers:
    - label: 'Specs'
      nodes:
        - 'Markdown spec'
        - 'YAML spec'
        - 'ID~REVISION'
    - label: 'Tests'
      nodes:
        - 'pytest'
        - 'Jest / Vitest'
        - 'JUnit 5'
        - 'Go'
        - '[verifies ID~REVISION]'
    - label: 'Results'
      nodes:
        - 'JUnit XML'
    - label: 'Gate'
      nodes:
        - 'shallnot gate'
        - 'shallnot check'
        - 'requirement states'
        - 'findings'
    - label: 'Delivery'
      nodes:
        - 'exit code'
        - 'JSON report'
        - 'end-of-turn hook'
        - 'GitHub Action'
---

shallnot closes the loop on an agent's self-report. Every requirement in a Markdown or YAML spec carries an ID and a revision, written `PWD-2~1`; every test cites one through a `[verifies PWD-2~1]` tag, placed wherever its runner will echo it into JUnit XML. The gate joins those three inputs and fails unless each requirement is cited by a test that actually ran and passed, so a tag sitting in a comment, or on a test that never executed, binds nothing. Bumping a revision invalidates every test still citing the previous meaning, which stops a reworded requirement from riding on a stale green. `shallnot init` equips a repository in one command: config for the detected runner, agent instructions, skills, and an end-of-turn hook that hands the findings back so the agent keeps working instead of stopping. Determinism is enforced rather than promised: an architecture test fails the build if the binary ever links a networking package, or if the domain and analysis layers reach for a file. The tool gates itself, binding its own 57 requirements to tagged tests in its CI. What a pass does not prove is that the tests are any good, and the project says so plainly: judging that is a review job, left to a skill rather than claimed by the gate.

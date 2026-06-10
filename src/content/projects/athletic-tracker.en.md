---
translationKey: 'athletic-tracker'
lang: 'en'
slug: 'athletic-tracker'
name: 'Athletic Tracker: Autonomous Strength Program Manager'
summary: 'An autonomous, Claude Code-operated manager for a multi-year strength program, bridging an Excel prescription engine and the Hevy training app with a constrained LLM-override layer, shadow mode, and idempotent collision detection.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'Pydantic'
  - 'openpyxl'
  - 'Hevy API'
  - 'uv'
  - 'pytest'
status: 'active'
links: []
publishState: 'published'
year: '2026'
highlights:
  - 'Three gated cron tasks: weekly Hevy sync into an Excel log, plus a mid-block routine rewrite'
  - 'The mid-block task applies % progression and auto-regulation bumps, then layers a constrained LLM judgment on top'
  - 'A cloud Claude agent returns typed, schema-validated JSON overrides; it reacts to injury or fatigue but cannot touch the program outside that surface'
  - 'Two safety properties: shadow mode (proposals to files for the first two blocks before any API write) and collision detection (diffs every write against the last snapshot)'
metrics:
  - value: '3'
    label: 'gated cron tasks'
  - value: '2'
    label: 'safety properties'
  - value: '2'
    label: 'shadow-mode blocks first'
architecture:
  caption: 'From cron triggers down to safety-gated writes'
  layers:
    - label: 'Gated cron tasks'
      nodes:
        - 'Weekly sync'
        - 'Mid-block task'
    - label: 'Sync and rewrite'
      nodes:
        - 'Hevy API'
        - 'Excel log'
        - '% progression'
        - 'auto-regulation bumps'
    - label: 'Constrained LLM judgment'
      nodes:
        - 'cloud Claude agent'
        - 'observations brief'
        - 'schema-validated JSON overrides'
    - label: 'Safety gates'
      nodes:
        - 'shadow mode'
        - 'collision detection'
        - 'last committed snapshot'
---

Athletic Tracker runs three gated cron tasks. Weekly sync pulls workouts from Hevy and appends them to an Excel log. The mid-block task rewrites next-week routines (applying % progression and auto-regulation bumps), then layers a constrained LLM judgment on top: a cloud Claude agent receives an observations brief and must return typed, schema-validated JSON overrides; it can react to injury or fatigue signals but cannot touch the program outside that surface. Two safety properties define the design: a shadow mode that emits proposals to files for the first two blocks before ever writing to the API (autonomy is earned, not assumed), and collision detection that diffs every planned write against the last committed snapshot and aborts on unexpected changes: no blind overwrite.

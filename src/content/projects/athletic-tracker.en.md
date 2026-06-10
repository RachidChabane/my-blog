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
---

Athletic Tracker runs three gated cron tasks. Weekly sync pulls workouts from Hevy and appends them to an Excel log. The mid-block task rewrites next-week routines (applying % progression and auto-regulation bumps), then layers a constrained LLM judgment on top: a cloud Claude agent receives an observations brief and must return typed, schema-validated JSON overrides; it can react to injury or fatigue signals but cannot touch the program outside that surface. Two safety properties define the design: a shadow mode that emits proposals to files for the first two blocks before ever writing to the API (autonomy is earned, not assumed), and collision detection that diffs every planned write against the last committed snapshot and aborts on unexpected changes: no blind overwrite.

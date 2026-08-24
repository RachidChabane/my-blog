---
translationKey: 'athletic-tracker'
lang: 'en'
slug: 'athletic-tracker'
name: 'Hevy Periodizer'
summary: 'An open-source training-periodization engine you configure instead of code. Goals, equipment and constraints go in; a prescribed week comes out, every load resolved to plates the athlete actually owns. Claude runs the coaching conversation, the engine does the arithmetic.'
stack:
  - 'Python'
  - 'Pydantic'
  - 'Hypothesis'
  - 'pytest'
  - 'Claude Code'
  - 'Hevy API'
status: 'active'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/hevy-periodizer'
  - label: 'Coaching plugin (atelier)'
    url: 'https://github.com/RachidChabane/atelier'
publishState: 'published'
year: '2026'
highlights:
  - 'The load layer turns 85% of a 140 kg max into 117.5 kg, because 119 is a number no barbell with 1.25 kg plates can make'
  - 'Property-based tests generate equipment inventories and assert every prescription is physically loadable, resolution is idempotent, and rounding down never overshoots'
  - 'Two shipped example athletes share almost nothing, and an integration test builds both and fails if the engine drifts back toward one of them'
  - 'The hevy-coach Claude plugin turns onboarding into a conversation and writes the YAML for you; the engine runs fine without it'
metrics:
  - value: '103'
    label: 'test functions, plus generated property cases'
  - value: '2'
    label: 'example athletes kept deliberately divergent'
  - value: 'MIT'
    label: 'license'
architecture:
  caption: 'Dependencies point inward only'
  layers:
    - label: 'Coaching conversation'
      nodes:
        - 'hevy-coach plugin'
        - 'Claude Code'
        - './start'
    - label: 'Config as code'
      nodes:
        - 'athlete.yaml'
        - 'program.yaml'
        - 'pydantic schema'
    - label: 'Engine'
      nodes:
        - 'build_week'
        - 'review_week'
        - 'load resolution'
    - label: 'Adapters'
      nodes:
        - 'Hevy API'
        - 'manual tracker'
        - 'storage'
---

Hevy Periodizer is the open-source successor to a private tracker I ran on my own program for a year. The rewrite keeps the idea and removes the person. Everything opinionated moved into `athlete.yaml` and `program.yaml`, so the same engine serves a powerlifter with four tested maxes and a rehab athlete who owns one pair of adjustable dumbbells and will never test a max. Two shipped examples encode exactly those athletes. An integration test builds both and fails if they stop diverging, which keeps the generality honest.

The part with the most tests is the load layer, because it is the computation most likely to hurt someone. A program says 85% of 140 kg. That is 119, and nobody can load 119 on a barbell with 1.25 kg plates. The engine knows a barbell steps by twice the smallest plate, a dip belt steps by one, fixed dumbbells have gaps in their run, and bodyweight percentages apply to the athlete plus the belt. Property-based suites generate inventories and check the invariants: every answer is loadable, resolving twice changes nothing, and rounding down never overshoots, which is the guarantee rehab work relies on. Claude sits on top through the hevy-coach plugin. Running `./start` opens a coaching conversation that writes the config, reviews the week against what Hevy logged, and explains why a number changed. The engine computes. The coach decides.

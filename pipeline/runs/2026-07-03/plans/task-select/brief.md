---
chosen_topic_id: agentic-pr-outcomes-hide-reviewer-workflow
fallback_topic_ids:
  - multi-agent-context-pollution-ceiling
  - overthinking-test-time-compute-hurts
  - agent-meltdowns-benign-errors
angle: >-
  Stop reading agentic-PR merge rate as an agent-quality score. The insight lives in
  the gap between two independent studies: one shows the merge/reject decision encodes
  reviewer workflow and deployment context (only 35.7% of rejections are clear agentic
  failures), while the other shows the merge rate itself is a blend (83.8% eventually
  merged, but only 54.9% integrated untouched). Put together, the merge rate that
  leaderboards report is a compound of code quality, reviewer labor, and where the
  agent was deployed. The discriminating signal is the reviewer-interaction trace
  (rework rate, feedback rounds, decision rationale) that outcome-only evaluations
  throw away, so cross-agent merge-rate leaderboards partly rank the repos, not the
  agents.
claim_skeleton:
  - statement: >-
      The merge/reject decision on agentic PRs encodes reviewer workflow and deployment
      context, not just code quality: of rejected agentic PRs, only 35.7% reflect clear
      agentic failures, 31.2% are driven by workflow constraints, and 33.1% lack any
      observable decision rationale.
    source_ids: [s1]
  - statement: >-
      The merge rate is not a clean-pass signal: 83.8% of Claude Code PRs are
      eventually merged, but only 54.9% of merged PRs are integrated without further
      modification, so roughly a third of merged outcomes still required rework.
    source_ids: [s2]
  - statement: >-
      Even among merged PRs, reviewer labor is measurable and routinely discarded:
      15.4% required explicit reviewer involvement through feedback or direct commits
      and 5.5% showed no visible interaction trace; that interaction trace is the
      signal an outcome-only metric ignores.
    source_ids: [s1]
  - statement: >-
      Because the two studies measure different repo populations and the outcome
      depends on reviewer workflow (s1) while the raw merge rate hides rework (s2), a
      cross-agent leaderboard built on merge/reject outcomes conflates agent quality
      with deployment context; the discriminating quality signal lives in the
      reviewer-interaction trace, not the merge label.
    source_ids: [s1, s2]
---

## Angle

Stop reading agentic-PR merge rate as an agent-quality score. The insight lives in the
gap between two independent studies: one shows the merge/reject decision encodes
reviewer workflow and deployment context (only 35.7% of rejections are clear agentic
failures), while the other shows the merge rate itself is a blend (83.8% eventually
merged, but only 54.9% integrated untouched). Put together, the agentic-PR merge rate
that leaderboards report is a compound of code quality, reviewer labor, and where the
agent was deployed.

The contestable stance: the discriminating signal is the reviewer-interaction trace
(rework rate, feedback rounds, decision rationale) that outcome-only evaluations throw
away. A second-order consequence neither source spells out: a cross-agent leaderboard
built on merge/reject outcomes partly ranks the repos and their review processes, not
the agents.

## Outline

- The reflex: teams read agentic-PR merge rate as an agent-quality score.
- What the decision actually encodes (s1): a third of rejections are workflow
  constraints, a third leave no observable rationale.
- What the rate hides (s2): merged is not clean; 83.8% merged, only 54.9% integrated
  untouched, so roughly a third of merged PRs still needed rework.
- The discarded signal (s1): 15.4% of merged PRs needed explicit reviewer involvement,
  5.5% left no visible interaction trace at all.
- Steelman: merge rate is still the outcome that matters to a team, so it is the right
  metric. The answer: it matters as an operational number, but it cannot rank agents
  because it blends the agent with the reviewer and the repo.
- The so-what: report rework rate, feedback rounds, and rationale from the interaction
  trace; treat cross-agent merge-rate leaderboards as deployment-context confounded.

## Claim skeleton

- c1 [s1]: The merge/reject decision on agentic PRs encodes reviewer workflow and
  deployment context, not just code quality: of rejected agentic PRs, only 35.7%
  reflect clear agentic failures, 31.2% are driven by workflow constraints, and 33.1%
  lack any observable decision rationale.
- c2 [s2]: The merge rate is not a clean-pass signal: 83.8% of Claude Code PRs are
  eventually merged, but only 54.9% of merged PRs are integrated without further
  modification, so roughly a third of merged outcomes still required rework.
- c3 [s1]: Even among merged PRs, reviewer labor is measurable and routinely discarded:
  15.4% required explicit reviewer involvement through feedback or direct commits and
  5.5% showed no visible interaction trace; that interaction trace is the signal an
  outcome-only metric ignores.
- c4 [s1, s2]: Because the two studies measure different repo populations and the
  outcome depends on reviewer workflow (s1) while the raw merge rate hides rework (s2),
  a cross-agent leaderboard built on merge/reject outcomes conflates agent quality with
  deployment context; the discriminating quality signal lives in the reviewer-
  interaction trace, not the merge label.

## Fallback shortlist

- multi-agent-context-pollution-ceiling
- overthinking-test-time-compute-hurts
- agent-meltdowns-benign-errors

No candidate was dropped this run: all three fallbacks each carry two distinct,
independently sourced origins, so none fails the argue G4 source-independence bar.

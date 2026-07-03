---
chosen_topic_id: overthinking-test-time-compute-hurts
fallback_topic_ids:
- agent-meltdowns-benign-errors
angle: 'The default this challenges: ''set reasoning effort to high'' is treated as
  free insurance, but extended thinking can actively lower accuracy by talking the
  model out of a correct answer, and it always costs tokens and latency. The second-order
  consequence is that optimal thinking length depends on problem difficulty, so a
  fixed high-effort setting overpays on easy inputs and can underperform a concise
  variant. The so-what: reasoning budget is a per-task knob to tune, not a dial to
  pin at maximum, and roughly 18x more tokens for lower accuracy is a measurable failure
  mode, not a hypothetical.'
claim_skeleton:
- id: c1
  statement: Longer chains of thought are sold as strictly better, but two independent
    2026 studies measure the opposite past a point. Reasoning models abandon previously
    correct answers as the compute budget grows, with marginal returns diminishing
    substantially and turning negative on easy problems [s1]; on basic math, Phi-4-reasoning
    scores 72.23% at about 6066 tokens where plain Phi-4 scores 78.92% at about 379
    [s2].
  source_ids:
  - s1
  - s2
---

## Angle

The default this challenges: 'set reasoning effort to high' is treated as free insurance, but extended thinking can actively lower accuracy by talking the model out of a correct answer, and it always costs tokens and latency. The second-order consequence is that optimal thinking length depends on problem difficulty, so a fixed high-effort setting overpays on easy inputs and can underperform a concise variant. The so-what: reasoning budget is a per-task knob to tune, not a dial to pin at maximum, and roughly 18x more tokens for lower accuracy is a measurable failure mode, not a hypothetical.

## Outline

- When more thinking hurts: cranking the reasoning budget can lower accuracy

## Claim skeleton

- c1 (s1, s2): Longer chains of thought are sold as strictly better, but two independent 2026 studies measure the opposite past a point. Reasoning models abandon previously correct answers as the compute budget grows, with marginal returns diminishing substantially and turning negative on easy problems [s1]; on basic math, Phi-4-reasoning scores 72.23% at about 6066 tokens where plain Phi-4 scores 78.92% at about 379 [s2].

## Fallback shortlist

- agent-meltdowns-benign-errors

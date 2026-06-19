---
chosen_topic_id: agent-reliability-pass-at-1-mirage
fallback_topic_ids:
  - lethal-trifecta-agent-security
  - mcp-protocol-rce
  - llm-as-judge-contamination
  - complexity-aware-finetuning
angle: >-
  The single-attempt scores teams pick agents on (pass@1 on short tasks) do not
  predict production reliability, because capability and reliability rank
  differently and diverge as horizons grow, so a model that tops a short-task
  leaderboard can be among the least reliable on a long, multi-step job. The
  contestable take: report a reliability-over-horizon curve, not a single pass@1.
claim_skeleton:
  - id: c1
    statement: >-
      Capability and reliability diverge systematically as task duration grows,
      so pass@1 on short tasks is structurally blind to long-horizon failure;
      the achievable task length is itself a function of the reliability bar you
      demand, which an independent longitudinal measurement makes concrete.
    source_ids: [s1, s4]
  - id: c2
    statement: >-
      Across 23 LLMs and four agent frameworks in an enterprise simulation, only
      15.4% of trials survive the full horizon, and larger models do not reliably
      outperform smaller ones.
    source_ids: [s2]
  - id: c3
    statement: >-
      A diagnostic collecting 3100+ trajectories across four agentic domains
      characterizes horizon-dependent degradation, so the failure is structural
      and diagnosable, not a tail of bad luck.
    source_ids: [s3]
---

## Angle

The default way teams choose an agent is to read a pass@1 score off a short-task
leaderboard and treat it as a property of the model. I think that number does not
predict production reliability, because capability and reliability are distinct
properties that rank differently and diverge as task duration grows [s1]; a model
that tops a short-task leaderboard can be among the least reliable on a long,
multi-step job [s2]. The steelman I have to answer is that pass@1 is cheap and
correlates well enough for short bounded tasks, so the divergence only bites teams
shipping genuinely long-horizon autonomy. My answer: the horizon at which it bites
is shorter than teams assume, and the degradation is structural and diagnosable [s3],
not a rare tail, so report a reliability-over-horizon curve rather than a single
pass@1.

## Outline

- Hook on the divergence, not a definition: pass@1 on short tasks is structurally blind to long-horizon failure because capability and reliability diverge as duration grows [s1].
- The measured cost: 23 LLMs across four agent frameworks, only 15.4% of trials survive the full horizon, and bigger is not reliably better [s2].
- Why it is structural, not luck: a 3100+-trajectory diagnostic across four domains maps where and why agents break with horizon length [s3].
- Steelman and answer: pass@1 is fine for short bounded tasks; rebut by showing the horizon where it breaks is short and the failure is diagnosable, so single-number evaluation under-determines reliability.
- What to do: evaluate reliability across horizon length (a curve, named failure modes), not a single pass@1, and treat a bare pass@1 as silent about long-horizon behavior.

## Claim skeleton

- c1 (s1, s4): Capability and reliability diverge systematically as task duration
  grows, so pass@1 on short tasks is structurally blind to long-horizon failure;
  the achievable task length tracks the reliability bar demanded, per an
  independent longitudinal measurement.
- c2 (s2): Across 23 LLMs and four agent frameworks in an enterprise simulation,
  only 15.4% of trials survive the full horizon, and larger models do not reliably
  outperform smaller ones.
- c3 (s3): A diagnostic collecting 3100+ trajectories across four agentic domains
  characterizes horizon-dependent degradation, so the failure is structural and
  diagnosable, not a tail of bad luck.

## Fallback shortlist

- lethal-trifecta-agent-security
- mcp-protocol-rce
- llm-as-judge-contamination
- complexity-aware-finetuning

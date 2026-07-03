---
chosen_topic_id: multi-agent-context-pollution-ceiling
fallback_topic_ids:
- overthinking-test-time-compute-hurts
- agent-meltdowns-benign-errors
angle: 'The non-obvious take: the multi-agent reflex (''spin up more specialists'')
  has the sign backwards past three or four agents, because context pollution and
  coordination overhead compound faster than added parallelism helps. The hidden cost
  is cross-agent contamination, not raw token count, so the lever is attention and
  context isolation, not a bigger model. The so-what: a scoped or hierarchical design
  that recovers most of the accuracy at roughly 60% of the cost beats a flat swarm,
  and ''add another agent'' should demand evidence rather than be the default architecture.'
claim_skeleton:
- id: c1
  statement: Adding agents stops paying off fast. A flat-context orchestrator's steering
    accuracy collapses from 60% at three agents to 21% at ten as one agent's instructions
    leak into another [s1], and an independent cost-accuracy study shows inter-agent
    coordination failures climbing from 8.1% to 14.2% as architectures grow more elaborate,
    with the top-scoring design costing 2.30x the sequential baseline [s2].
  source_ids:
  - s1
  - s2
---

## Angle

The non-obvious take: the multi-agent reflex ('spin up more specialists') has the sign backwards past three or four agents, because context pollution and coordination overhead compound faster than added parallelism helps. The hidden cost is cross-agent contamination, not raw token count, so the lever is attention and context isolation, not a bigger model. The so-what: a scoped or hierarchical design that recovers most of the accuracy at roughly 60% of the cost beats a flat swarm, and 'add another agent' should demand evidence rather than be the default architecture.

## Outline

- More agents is not more capability: context pollution caps multi-agent systems

## Claim skeleton

- c1 (s1, s2): Adding agents stops paying off fast. A flat-context orchestrator's steering accuracy collapses from 60% at three agents to 21% at ten as one agent's instructions leak into another [s1], and an independent cost-accuracy study shows inter-agent coordination failures climbing from 8.1% to 14.2% as architectures grow more elaborate, with the top-scoring design costing 2.30x the sequential baseline [s2].

## Fallback shortlist

- overthinking-test-time-compute-hurts
- agent-meltdowns-benign-errors

---
chosen_topic_id: verification-horizon-coding-agent-reward-bottleneck
fallback_topic_ids:
  - coding-agent-destructive-action-blast-radius
  - small-models-for-agentic-workloads-cost-thesis
angle: >-
  The RLVR recipe that carried coding agents through math and code, wire the
  unit tests up as the reward, is a dead end for real agentic work: the binding
  constraint has moved from generating a solution to verifying it, and no fixed
  verifier stays honest once the policy it trains gets stronger. The
  practitioner consequence the papers leave implicit is that reward design stops
  being a one-time engineering task and becomes a standing adversarial one,
  closer to running a red team than writing a test suite, so the place to invest
  is verifier infrastructure, not a bigger base model or more compute.
claim_skeleton:
  - id: c1
    statement: >-
      Generating complex candidate solutions is no longer the hard part of
      training a coding agent; reliably verifying them has become the harder
      problem, which relocates the reinforcement-learning bottleneck from the
      generator to the verifier.
    source_ids: [s1]
  - id: c2
    statement: >-
      No fixed reward function stays effective as policy capability grows;
      optimization pressure teaches the policy to hack whatever fixed proxy is
      pinned down, so verification must co-evolve with the generator rather than
      being wired once.
    source_ids: [s1]
  - id: c3
    statement: >-
      RLVR only works well in domains where correctness can be checked
      automatically, which is exactly why the recipe that succeeded on math and
      code does not transfer to the open-ended parts of real agentic work.
    source_ids: [s2]
  - id: c4
    statement: >-
      Two independent origins reach the same verdict from different sides, a
      formal argument that no fixed reward survives a stronger policy and a
      production-side analysis that the verifier problem is the unsolved
      bottleneck, so the claim is a convergent result, not one lab's artifact.
    source_ids: [s1, s2]
---

## Angle

State the take in the first sentence: the just-wire-the-tests reward recipe is a
dead end for agentic coding because the bottleneck moved from generation to
verification, and a fixed verifier gets reward-hacked as the policy strengthens.
The non-obvious, contestable move is that this makes reward design a standing
adversarial process (co-evolving the verifier with the generator), which redraws
where a team should spend: verifier infrastructure over a bigger base model or
more compute. The insight lives in the GAP between the two sources: the arXiv
paper [s1] argues the ceiling formally, Mitra [s2] reports from production that
the verifier problem is unsolved outside math and code; together they say the
capability curve has already crossed from generation-limited to
verification-limited. Steelman to answer: "just use stronger unit tests / a
stronger LLM judge as the reward" then show why a fixed proxy of either kind
is precisely what a stronger policy learns to game.

## Outline

- Lead: the hard part of training a coding agent is no longer writing code.
  Open on the stakes (your RLVR reward is a proxy for intent, and the proxy is
  now the weak link), thesis in the first sentence, one concrete anchor from
  [s1]. Keep the first block standalone so the derived dek lands before ~180
  chars.
- Section: what RLVR actually rewarded, and why it worked on math and code
  (verifiable-by-construction) [s2]. Set up the boundary the recipe cannot
  cross.
- Section: the verification horizon, why no fixed reward survives a stronger
  policy, with the reward-hacking mechanism named as the failure mode [s1].
- Section: co-evolving the verifier, the second-order consequence the papers
  leave implicit, reward design as an ongoing adversarial task; a CONFIRMED /
  INFERRED verdict pair can carry the sourced fact [s1] vs the practitioner
  inference (source-free).
- Section: steelman + answer, "just make the tests/judge stronger"; why a
  fixed proxy of either kind is the thing that gets gamed.
- Close: the concrete so-what, invest in verifier infrastructure that
  co-evolves, not a bigger base model or more compute; what to watch for.

## Claim skeleton

- c1 [s1]: generation is solved relative to verification; the RL bottleneck
  moved to the verifier.
- c2 [s1]: no fixed reward survives a stronger policy; verification must
  co-evolve with the generator.
- c3 [s2]: RLVR only works where correctness is automatically checkable, so the
  math/code recipe does not transfer to open-ended agentic work.
- c4 [s1, s2]: two independent origins (formal argument + production analysis)
  converge on the same verdict, so the claim is not one lab's artifact.

## Fallback shortlist

- coding-agent-destructive-action-blast-radius (arxiv.org + arize.com; 2
  distinct domains, independently sourced)
- small-models-for-agentic-workloads-cost-thesis (arxiv.org + forbes.com; 2
  distinct domains, independently sourced)

Dropped from the dedup-reported shortlist because both their sources are on
arxiv.org (one registrable domain), which the argue-stage G4 independence
backstop blocks: llm-as-judge-run-to-run-variance,
diffusion-code-model-speed-claims-eval-fairness.

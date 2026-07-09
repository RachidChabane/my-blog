# Progress: task-argue

- [x] 1. Read plan + inputs (brief, candidates.json)
- [x] 2. Dispatch argument-rigor judge -> argument.json (verdict: defensible)
- [x] 3. Dispatch source-independence judge -> independence.json (verdict: independent)
- [x] 4. Run both gates
      - pipeline.gate.argument  -> OK (exit 0)
      - pipeline.gate.independence -> BLOCK (exit 1): layer (a) domain backstop,
        chosen topic's sources span only 1 registrable domain ['arxiv.org']
- [x] 5. Un-repairable G4 block LEFT STANDING (not tampered); both artifacts on the
      record; upstream cause + fallback dead-end captured for owner handoff (below)
- [x] 6. Final commit

## Outcome / owner handoff (section 5)

G1 (argument-rigor) PASSES: the thesis is defensible. The independence judge (layer b)
also returned `independent` (IBM vs Meta are two genuinely distinct research origins).
The run is nonetheless BLOCKED by G4's deterministic layer (a): the chosen topic
`agent-tool-shortlist-length` cites two arxiv.org URLs, and the domain backstop requires
>= 2 distinct registrable domains. This is the backstop working as designed and is NOT
repairable from inside the argue task (editing candidates.json / the brief / the verdict
would game the gate). The block is left standing; the harness owns the fallback re-drive.

Upstream facts for the owner:
1. `select` chose an arxiv-only topic. G4's deterministic layer needs >= 2 registrable
   domains, which arxiv-only sourcing can never meet. The front-loaded independence bar
   filtered for ">= 2 origins", not ">= 2 domains".
2. Fallbacks #1 (llm-as-combinatorial-solver-trap) and #2 (rag-reranker-relevance-utility-gap)
   are ALSO arxiv-only, and fallback_topic_attempts=2 exhausts before reaching #3
   (ai-generated-pr-security-review-gap: arxiv + veracode.com, the only two-domain
   candidate). So the run skips+alerts with no article unless upstream changes.

Recommended remedies (owner / follow-up task, NOT this task):
(a) re-run select to pick a topic spanning >= 2 domains (e.g. promote
    ai-generated-pr-security-review-gap), or
(b) reorder the fallback shortlist so a two-domain candidate is reachable within 2 attempts,
    or
(c) if independent arxiv preprints should count as independent, change the G4 domain
    backstop as its own reviewed, tested code task, not an in-run patch.

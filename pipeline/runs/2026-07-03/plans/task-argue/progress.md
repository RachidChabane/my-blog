# Progress -- task-argue

- [x] Step 1: Dispatch argument-rigor judge (fresh sub-agent) -> writes argument.json
- [x] Step 2: Dispatch source-independence judge (fresh sub-agent) -> writes independence.json
- [x] Step 3: Run both gates (argument + independence), report true exit status honestly
- [x] Final commit: content(argue): argument.json (steelman/attack/reconcile)

## Gate outcome (honest report)

- `argument` gate: **OK, exit 0**. The independent argument-rigor judge ruled the
  thesis `defensible`: non-trivial, falsifiable, backed by two independent quantified
  legs; the strongest attack (workflow noise may be uncorrelated with agent identity,
  leaving merge rate a noisy-but-unbiased ranking) is defeated because real cross-agent
  leaderboards score agents over non-identical repo populations, turning that noise into
  ordering bias. Strengthened form: state the confound condition explicitly and claim
  only that the merge label's cross-agent ordering is unreliable whenever populations
  differ.

- `independence` gate: **BLOCK, exit 1**. Layer (b) the origin judge ruled the two
  sources `independent` on the merits (two distinct arXiv papers, different authors,
  non-overlapping datasets: 11,048 mixed-agent PRs vs 567 Claude Code PRs, different
  methods, neither re-reports the other). But layer (a) the deterministic domain
  backstop blocks regardless:
  `chosen topic's cited sources span only 1 distinct registrable domain(s) (need >= 2): ['arxiv.org']`.
  Both cited sources live on `arxiv.org`, so they collapse to one registrable domain.

## Terminal state for this run

The independence domain backstop is the dominant, EXPECTED, designed behavior for an
all-arXiv candidate set. This is NOT fixed inside this content task (fixing it means
editing frozen gate code, `candidates.json`, or weakening the domain check, all out of
scope). Every fallback topic in this run's candidate set also cites two arXiv papers, so
each falls back into the same deterministic block. The harness falls back per
writing-flow section 7; the run ships no article today (bilingual-or-nothing).

Remediation (a SEPARATE pipeline change, not this task): either front-load a hard
cross-registrable-domain sourcing bar in research/select so an all-arXiv slate never
reaches argue, or teach the domain backstop to treat distinct arXiv paper IDs / DOIs as
distinct origins while preserving the same-host-echo catch for non-arXiv hosts.

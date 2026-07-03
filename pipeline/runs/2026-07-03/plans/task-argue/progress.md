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

## Gate-repair round 1 of 1 (2026-07-03)

Re-ran `source-independence`; it still BLOCKs on the same finding
(`only 1 distinct registrable domain(s) (need >= 2): ['arxiv.org']`). No honest,
in-scope repair exists:

- Every candidate in this run (chosen + all three fallbacks:
  `multi-agent-context-pollution-ceiling`, `overthinking-test-time-compute-hurts`,
  `agent-meltdowns-benign-errors`) cites only `arxiv.org` sources, so switching topic
  cannot clear the backstop.
- Adding a second-domain / mirror source to `candidates.json` would fabricate provenance
  to satisfy a crude proxy (gaming the gate) and is explicitly out of scope.
- Editing `pipeline/gate/independence.py` to treat distinct arXiv IDs as distinct origins
  is the genuine systemic fix, but it is a semantic change to a frozen, tested invariant
  gate that belongs in its own reviewed pipeline slate, not a content gate-repair round.

Terminal state: **BLOCKED, by design.** The `argument` gate passes (thesis `defensible`);
`independence` blocks on the deterministic single-domain backstop. The judges' verdicts
are honest and unaltered. This ships no article today (bilingual-or-nothing); the fix is
the research/select front-loading change noted above, tracked for a later slate.

## Gate-repair round (fallback re-drive to `multi-agent-context-pollution-ceiling`)

The harness fell back per writing-flow section 7: `brief.md` `chosen_topic_id` is now the
first fallback `multi-agent-context-pollution-ceiling`, and the fallback reset cleared
argue's prior outputs (`argument.json`, `independence.json`), so both gates re-failed on
`missing ... the pass did not run`. I re-ran the two fresh judges on the FALLBACK topic's
thesis and its two cited sources and rewrote both artifacts:

- `argument.json` -> verdict **defensible**. The judge steelmanned the "flat multi-agent
  swarm has the sign backwards past three or four agents" thesis, mounted the strongest
  attack (s1's 60%->21% is a steering metric on a FLAT orchestrator not a count-causal
  claim; s2 varies architecture TYPE not N; s2's hierarchical-at-60.7% result arguably
  supports structured multi-agent), and reconciled: the thesis survives because it is
  hedged to flat/unscoped scaling and already prefers scoped/hierarchical designs, so the
  hierarchical result reinforces it. Strengthened to drop any raw agent-count causality.
  Sources: s1 arXiv 2604.07911, s2 arXiv 2603.22651.
- `independence.json` -> verdict **independent** (two distinct arXiv papers, different
  ids/authors/datasets/measured-quantities/dates; neither re-reports the other).

Re-ran both gates: `argument` -> **OK** (exit 0). `independence` -> layer (b) judge now
passes, but layer (a) deterministic distinct-domain backstop still BLOCKs
(`only 1 distinct registrable domain(s) (need >= 2): ['arxiv.org']`) because the fallback
topic's two sources are both arXiv. This is the SAME terminal single-domain block: every
candidate in this run is all-arXiv, so no fallback clears it. No honest, in-scope repair
exists (adding a mirror source fabricates provenance; relaxing the frozen gate is a
separate reviewed pipeline slate). Terminal state unchanged: **BLOCKED, by design**;
ships no article today. Remediation remains the research/select cross-domain front-loading
change tracked above.

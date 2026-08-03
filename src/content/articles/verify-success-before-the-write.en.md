---
translationKey: verification-frontiere-action-2026-08
lang: en
slug: verify-success-before-the-write
title: The judge model grades the story the failure wrote
publishDate: 03-08-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: False success prevalence across two agent benchmarks
  url: https://arxiv.org/abs/2606.09863
  date: 03-08-2026
- label: Deterministic pre-execution gates, silent wrong-state failures
  url: https://arxiv.org/abs/2607.07405
  date: 03-08-2026
- label: Procedure-aware evaluation, corrupt successes
  url: https://arxiv.org/abs/2603.03116
  date: 03-08-2026
- label: Production agent runtime, silent failures reach humans last
  url: https://arxiv.org/abs/2606.14589
  date: 03-08-2026
contentHash: sha256:46e8870b19e53792
publishState: published
---


The check that authorizes a write should read environment state, the one evidence the agent's own account cannot manufacture; a detector arrives after the write.

Most agent-quality stacks I have worked on put a judge model at the end of the loop and call that verification. The measurement on that instrument is unkind. Across 5 judges, 5 prompt strategies and full task specifications, no configuration exceeds AUROC 0.65 on tau2-bench, and the same judges reach only 0.54 AUROC on AppWorld API-call traces; they rely on surface completion proxies, confident closing language in tau2-bench and coarse action-sequence volume in AppWorld, rather than verified state changes [s2]. I read that ceiling as a statement about what the instrument keys on, and the instrument keys on prose the failure already wrote.

## Failure arrives as a finished report

What gets past a judge reaches you looking like a completed task, with a short paragraph explaining what was done. Class D is unique to LLM systems and the most dangerous: the system does not merely fail to report an error, the LLM transforms it into fluent, plausible narrative delivered to the user [s9]. That is the shape to hold in your head for the rest of this piece: by the time you see it, the error has been rewritten into something a human will accept.

The same production study gives the shape a scale. Over eight weeks it documented 22 incidents with full root-cause postmortems, in which one meta-pattern, a failure whose error signal never reaches a human in actionable form, manifested at least 28 times [s10]. One pattern, many faces, each face arriving dressed as a finished job.

On benchmarks the prevalence is measurable, and it refuses to collapse into a single number. False success was studied across 9,876 tau2-bench trajectories from 8 model families and 1,879 AppWorld trajectories from 4 model families with text-independent ground truth, and it varies by setting: 45 to 48% of failures in single-control tau2-bench domains, 3% in dual-control telecom, and 75.8% among AppWorld self-assessing coding-agent trajectories with explicit status claims [s1]. The dual-control figure is the one I would pin above my desk. Where a second party in the environment can contradict the agent, the problem nearly disappears; where the agent is the only witness, it dominates. That reading of the spread is mine rather than a finding either benchmark reports, and it is already the whole argument in miniature: what matters is who else can see the state.

## The judge is reading the agent's own account

The tempting way to state my position is categorical, that any instrument reading the agent's own output inherits the agent's failure mode. I think that version is wrong, and the paper that hands me my best numbers is the one that breaks it. Lightweight TF-IDF detectors achieve task-disjoint AUROC 0.83 on tau2-bench and 0.95 on AppWorld, recovering 4 to 8 times more false successes than the best judge at the same flag rate with 3,300 times lower latency [s3]. A bag of words reading the same corrupted transcript reaches 0.95, so the medium is clearly not the problem.

The premise has to be scoped to a mechanism instead. What fails is treating the agent's assertion of completion as evidence of completion, which is exactly the behaviour measured in the judge ceiling: confident closing language, action-sequence volume [s2]. A TF-IDF detector never weighs the self-assessment; it exploits lexical regularities that correlate with failure, which is why it can beat the model that reads the same text with comprehension. Scoped that way, the cheap detector stops being a counterexample and turns into evidence about the signal itself. The discriminative residue in a failed transcript is shallow, and shallow signal does not need a frontier model. In my experience the practitioner move follows immediately: buy the cheap detector, and stop paying a frontier judge to do the same job slower.

The distinction I keep returning to is that an AUROC is a ranking over trajectories that already finished. It orders produced artifacts by suspicion, and it does so once the write has landed. Here is the failure mode you can check in your own stack this afternoon. A judge grades the closing paragraph of a trajectory whose tool calls never touched the record the agent claims to have updated. The report is well formed, the ranking is excellent, and the row in your database is still wrong.

## Preconditions at the action boundary

Move the check to a place where it can read state and the measurement changes shape. A four-gate suite raises full-benchmark success from 29.6% to 42.0% on gpt-4o-mini, a gain of 12.4 points with a paired task-level bootstrap P=0.0012, and the lift reproduces on a disjoint 15-seed set at 12.3 points with P=0.0008 [s5]. Separately, on a budget agent, 78% of observed failures are silent wrong-state failures with no tool error, and the aggregate failure rate is reproducible across disjoint seeds rather than sampling noise [s4].

Those are two different systems and no source joins them. Joining them is my inference, so I will state it as one. A failure that writes wrong state while returning no tool error emits nothing downstream except the agent's narration, and a precondition evaluated against environment state before the call does not depend on that narration. To me that is the most economical explanation of why a handful of gates buys double-digit points at all.

> [!CONFIRMED]
> Two negative controls, a self-enforcing retail domain and BFCL, bound the mechanism: gates help when tools are policy-permissive and add little where tools already self-enforce [s6].

> [!INFERRED]
> I read that bound as the most useful thing in the result. The size of a gate's lift measures how many invariants your tool surface failed to encode, so a gate that keeps paying is a standing report that some tool accepts calls it should refuse. Push the invariant into that tool and the gate goes quiet by construction. In my experience that makes a gate suite scaffolding with a demolition date on it.

## The case for keeping a general judge

The strongest objection here is one I have real sympathy for. A deterministic gate covers only the violation classes somebody enumerated in advance, while a judge model generalizes to tasks nobody anticipated, including the ones your enumeration will miss next quarter. My own evidence bounds me on exactly this point: the negative controls say gates help when tools are policy-permissive and add little where tools already self-enforce [s6], and a maturing tool surface is travelling toward self-enforcement. The objection has a second half too, that a suite landing at 42.0% full-benchmark success [s5] is a long way from a solved benchmark.

I contest the axis on which the instrument is measured: its generality. Generality measured at AUROC 0.65 [s2] is general and very nearly uninformative, so the objection's strong instrument is broad in coverage and weak in signal, which is a bad trade when the thing you are buying is a decision. The middle ground the objection wants is already occupied and it is cheap: a task-disjoint lexical detector at 0.83 and 0.95 [s3] runs on every trajectory instead of on a sample, which is where triage belongs. On the remainder, the inference above supplies the answer. A gate suite is a diagnostic that names the next tool to harden, and the fraction it fails to reach is the queue of invariants nobody has written down yet. A gate whose lift shrinks as your tools harden is behaving exactly as I claimed it would.

## What this changes in your stack

There is a more uncomfortable version of this problem and it sits underneath your evaluation suite. At the procedural compliance level, 27 to 78% of benchmark reported successes are corrupt successes concealing violations across interaction and integrity [s7]. I think that is the number an eval owner should lose sleep over, because a suite that reads reported success is scoring the same contaminated label the judge was scoring, one layer up and behind a nicer dashboard.

The production data then puts the whole retrospective class in its place. About 70% of silent failures were caught by human user-view observation rather than by tests or audits, and a retrospective audit of 15 incidents found 0% ex-ante prevention but 87% regression blocking [s8]. Judges, evaluation suites and audits are one class in my head: retrospective instruments reading an artifact that has already been produced. That 87% is real and worth owning, and I would keep paying for it. What I would stop doing is booking that line as prevention, because the prevention column in the same audit reads zero.

> [!TIP]
> List which of your tools enforce their own invariants and which accept whatever the model sends. Write preconditions at the call boundary for the second group. Keep a cheap lexical detector for transcript triage, and stop paying a judge model to grade completion claims.

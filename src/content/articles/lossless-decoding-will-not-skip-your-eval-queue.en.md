---
translationKey: lossless-decoding-precision-property
lang: en
slug: lossless-decoding-will-not-skip-your-eval-queue
title: A lossless decoder will not get you past the eval queue
publishDate: 17-09-2026
tags:
- llm-oss
- evaluation
category: essays
difficulty: 3
sources:
- label: Orthrus dual-view diffusion paper, the losslessness guarantee
  url: https://arxiv.org/abs/2605.12825
  date: 12-05-2026
- label: Independent Orthrus reproduction, the claim under test
  url: https://arxiv.org/abs/2609.15504
  date: 14-09-2026
- label: Relaxed speculative decoding practitioner study, the lossless baseline
  url: https://arxiv.org/abs/2607.08690
  date: 09-07-2026
contentHash: sha256:3e9ff2666ef57a91
publishState: published
---


The lossless label on a decoding accelerator stops meaning what adopters think it means the moment you serve at BF16, so it should never let the swap skip evaluation. The Orthrus paper promises lossless inference with up to a 7.8x speedup [s1]. An independent reproduction finds that, under BF16, the output trajectory matches the reference in only 45% of cases for the authors' checkpoint [s3], while downstream benchmarks show no systematic degradation [s5]. Read together, those two results describe a change that passes an aggregate benchmark and still alters what your users see.

## What the word lossless was paying for

I think most teams misread what they are buying when they pick a lossless accelerator. The speedup is the headline. The real purchase is an accounting category: a change that produces identical outputs is an infrastructure change, and infrastructure changes do not go through capability evaluation.

Speculative decoding earned that category honestly. Its rejection and resampling steps exactly preserve the model's sampling distribution [s8], which is a mathematical property of the algorithm. The practitioner study that measured what happens when you relax that guarantee spells out the price of leaving the category: relaxation can require considerable capability evaluation, unlike lossless speculative decoding [s9]. That sentence is about relaxed decoders, and I am not charging it to Orthrus. I use it because it names, from the other side, the exemption the lossless label is supposed to grant.

In my experience that exemption is the whole adoption story. Nobody queues capability evals for a kernel upgrade. A decoder described as producing the same output sequence as the autoregressive model gets filed next to the kernel upgrade, and the eval queue never sees it.

## What the reproduction actually measured

The reproduction takes the claim at its word. It independently reproduces Orthrus and tests the central claim, same output sequence as the autoregressive model, under different numerical precisions [s2]. That design is what makes it useful. Accuracy is a separate question; this one is whether the promise holds at the precision people run.

> [!CONFIRMED]
> Under BF16, exact trajectory matching holds in 45% of cases for the authors' checkpoint and 43% for an independently trained model, across 1,190 prompts from 12 domains [s3]. Repeating the trajectory evaluation with FP32 yields exact matching on all evaluated prompts [s5].

> [!INFERRED]
> I read the guarantee as a property of the algorithm plus the arithmetic it runs on. The label certifies the algorithm. Whoever picks the serving precision owns the arithmetic, and the label says nothing about that half.

The authors of the reproduction frame it the same way. An algorithm may preserve the intended autoregressive computation in principle and still produce different discrete outputs once implemented with finite-precision arithmetic [s6]. Discrete outputs turn that into a hard edge. A token either flips or it does not, and after one flip the rest of the trajectory belongs to a different conversation.

The two checkpoints landing close together is the detail I would not skip. A single number from the authors' own weights could be blamed on that checkpoint. A second model, trained separately, landing in the same place tells me the behaviour comes with the method at that precision.

## Why the flat benchmark is the wrong reassurance

The benchmark result is what makes this dangerous. Despite the divergence, Orthrus shows no systematic degradation on downstream lm-eval-harness benchmarks [s5]. A team that re-runs its usual suite after the swap gets a green dashboard and concludes the label held.

It did hold, for accuracy. It failed for identity. Those are different contracts, and I think most production systems depend on identity in places nobody wrote down.

The reproduction adds the detail that turns this from a curiosity into an operational problem: the probability of exact matching is strongly associated with the response-conditional perplexity of the reference model [s4]. My reading is that the divergence is input-dependent. It concentrates on the responses the reference model was least sure about. An aggregate benchmark averages over the whole distribution by construction, so it cannot tell you whether the changed outputs sit in the part of your traffic you care about.

| Check | What it compares | What it can see after a BF16 swap |
| :--- | :--- | :--- |
| Aggregate benchmark | Task score over a suite | Whether average capability moved |
| Per-prompt exact match | Token trajectory against the reference | Whether any given output changed |
| Match rate by perplexity stratum | Exact match within buckets of reference perplexity | Where the changed outputs concentrate |

> [!WARNING]
> The failure mode I would plan for is quiet. Golden-output regression tests go red on a slice of prompts right after the rollout, the team marks them flaky because the benchmark is flat and the decoder is lossless, and the snapshots get regenerated. The regression suite has now absorbed the change it existed to catch.

Reproducibility breaks the same way. A user report that cites an exact response can no longer be replayed against the path that produced it, because the old path and the new one may disagree on that very prompt.

## The strongest objection

Here is the case against me, at full strength. BF16 serving is never bit-exact in the first place. Change the batch size, the attention kernel or the GPU and a plain autoregressive model at half precision will also drift on low-margin tokens, and those tokens cluster in exactly the high-perplexity responses the reproduction points at. Nothing in these results gives a same-precision baseline for how often the reference model disagrees with itself under a comparable change. So the 45% [s3] cannot be charged to Orthrus, and "a guarantee proved in exact arithmetic does not survive half precision" is close to a truism.

I accept most of that. I cannot claim Orthrus diverges more than ordinary BF16 serving, and I do not. The relaxed-decoding evaluation cost is also not an Orthrus cost; it belongs to decoders that change the distribution on purpose.

What the objection concedes is my point. If a BF16 Orthrus deployment behaves like any other numerical change to the serving stack, it needs the checks a numerical change gets: a diff of outputs against the old path, with divergence expected and inspected. The label removes exactly that expectation. A kernel upgrade that shifts outputs surprises nobody. A decoder described as producing the same sequence makes every shifted output look like a broken test, which is how the regression failure above happens.

> [!NOTE]
> None of this says Orthrus is a bad method. The FP32 result shows the consensus mechanism holding on every evaluated prompt once the arithmetic is exact.

## What I would require before the swap

The reproduction's own recommendation is the right floor: evaluations of lossless acceleration should state both the operational criterion for equivalence and the numerical precision under which it was measured [s7]. I would turn that into a record attached to the change request, filled in at the precision you actually serve:

```text
change: decoding accelerator swap
serving_precision: bf16
equivalence_criterion: exact token trajectory, greedy, against the current path
exact_match_rate: <measured on our own prompt set>
exact_match_by_reference_perplexity: <per stratum, lowest to highest>
aggregate_benchmark_delta: <our usual suite>
decision: <ship / ship with snapshot rebaseline / hold>
```

Every field has a job. The precision line stops anyone quoting an FP32 result for a BF16 deployment. The perplexity strata show whether the changed outputs land on the uncertain tail of your traffic. The benchmark delta stays, but it is one input among several and no longer the gate.

The perplexity line costs less than it looks. You already run the reference path to get the trajectories you compare against, so keep the per-token log-probabilities from that same run and bucket prompts by them. No extra model call, no new harness. The expensive part is deciding in advance which strata you refuse to see change, and I would make that call before the numbers come back.

I think the decision line is the one that changes behaviour. "Ship with snapshot rebaseline" is a legitimate outcome, and writing it down turns the regenerated golden files into a recorded choice. Nobody gets to call it flaky-test cleanup afterwards. If you serve in FP32, most of this record collapses to a single measured line, which is the cheapest way I know to find out whether the label applies to you.

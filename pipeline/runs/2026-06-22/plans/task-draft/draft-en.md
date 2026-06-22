---
lang: en
translationKey: llm-temp0-nondeterminism-batch-invariant
slug: temperature-zero-is-not-deterministic
tags: [qualite, evaluation]
category: essays
difficulty: 4
title: "Temperature zero is not deterministic, and the GPU is not to blame"
---

Set an LLM to temperature 0 and run the same prompt a thousand times, and you will not get a thousand identical answers; the standard excuse is that GPU floating-point math is inherently unreproducible, and that excuse is wrong. The nondeterminism is an engineering choice in how serving kernels reduce over a batch whose size drifts with load, not a law of the silicon. The proof is a single-variable intervention: at temperature 0 a production-scale model produced 80 unique completions over 1000 runs, and with batch-invariant kernels all 1000 collapsed to one identical output [s1]. I think that result should retire the phrase "nondeterminism is just how GPUs work."

The reason this matters beyond trivia is that reproducibility is usually treated as something you either have or you do not, a property of the hardware you were handed. It is not. It is a knob on the serving stack with a price tag you can read off, and most of the time you do not even have to turn it all the way.

## The temperature-zero lie

Greedy decoding at temperature 0 is supposed to be the deterministic case: take the argmax at every step, no sampling, same input means same output. In practice the APIs still drift. The Thinking Machines measurement makes the gap concrete: even with sampling made theoretically deterministic, the same prompt over 1000 runs yielded 80 distinct completions [s1]. That is not a rounding wobble in the last decimal of a logit; it is 80 different texts a user could read.

The folk explanation reaches for floating-point and concurrency: GPUs run thousands of threads, addition is non-associative, so the story goes that the order of operations is unknowable and the output is therefore unfixable. That story names a real fact and draws the wrong conclusion from it. Non-associativity is necessary for the drift, but it is not what makes any given run differ from the next.

## It is not the floating point, it is the batch

The actual variable is the batch. Inference servers do dynamic batching: your request is reduced together with whatever other requests happen to be in flight, and the primary reason endpoints are nondeterministic is that the load, and therefore the batch size, varies from run to run [s1]. Matmul, RMSNorm, and attention all reduce across that batch dimension, and a different batch shape means a different reduction order. Feed non-associative floating-point addition a different order and you get a different sum, which propagates into a different argmax a few layers down.

So the cause is not that the math is random. The cause is that the same prompt lands in a different batch shape depending on who else is calling the endpoint at that millisecond. That is a named, locatable failure mode, and it is controllable. Batch-invariant kernels pin the reduction order so it no longer depends on batch size, and the 80-to-1 collapse is what happens when you change that one thing and watch the variation vanish.

## The price of bit-identical output

Determinism is not free, but its cost is bounded and you can quote it. With batch-invariant kernels the same workload ran roughly 2x slower, 55 seconds against 26, narrowing to 1.6x once the attention kernels improved, 42 seconds [s1]. Read those numbers as an existence proof, not a universal constant: they come from one model on one hardware and kernel snapshot, so I would not promise you 1.6x on your stack. What they establish is that the cost is finite and engineerable, a throughput tradeoff rather than an open-ended tax.

> [!CONFIRMED]
> With batch-invariant kernels, all 1000 completions at temperature 0 are identical, versus 80 unique completions unoptimized, at roughly 2x slowdown narrowing to 1.6x with improved attention kernels [s1].

> [!INFERRED]
> I read that single-variable collapse as proof the cause is the reduction schedule, not the silicon: determinism is a serving-stack decision you price, not a hardware limit you accept.

This is the move the whole argument turns on. Once the cost has a number, "we cannot make it deterministic" stops being a true statement about the hardware and becomes a budget decision about throughput.

## You do not have to pay it everywhere

Even granting the cost, the dealbreaker framing assumes you pay it on every token, and you do not. The January 2026 LLM-42 work keeps a non-deterministic fast path and enforces determinism through a lightweight verify-rollback loop, reusing existing kernels and incurring overhead only in proportion to the traffic that actually requires determinism [s2]. The fast path runs at full speed; verification reruns only what needs to be certified and rolls back on a mismatch. You buy determinism for the requests that need it and keep throughput for the ones that do not.

That escape hatch is conditional, and the condition is load-bearing.

> [!WARNING]
> Selective verify-rollback only wins when determinism-requiring traffic is a minority and verification is cheaper than always-on batch-invariant recompute. If most of your traffic must be reproducible, the fast path plus verification can cost more than just running invariant kernels everywhere.

So the prescription is not "always go selective." It is: measure the fraction of your traffic that genuinely needs bit-identical output, and choose the cheaper of two priced options.

## The steelman

The strongest objection is that this is trivially true dressed up as a finding. If you already know floating-point addition is non-associative and that kernels reduce in a load-dependent order, then "fix the reduction order and the output stops varying" is a tautology, and the 80/1000 result merely confirms it.

I do not think it lands, for two reasons. First, the prior belief was the opposite of trivial. Practitioners were not saying "of course a fixed reduction order gives a fixed output"; they were saying the reduction order is fundamentally uncontrollable because the GPU is, so the output is unfixable. Locating the controllable cause and killing it with a single-variable intervention disconfirms that belief; it is a real result, not a restatement of a lemma. Second, the prescriptive half is falsifiable and was not obvious before the measurement: that the cost is bounded near 2x on a production-scale model, and that you can avoid paying it globally. The triviality charge only works if you grant the conclusion the field was actively denying.

## What to do

Stop treating temperature-0 nondeterminism as weather. It is a serving-stack property you control. If you need reproducibility everywhere, batch-invariant kernels buy it at a cost you can measure before you commit. If only some of your traffic needs it, a verify-rollback path pays the tax only where it is due. The decision is not "can we" but "for what fraction," and that fraction is a number you can go measure today.

| Approach | Overhead scope | When it wins | Kernel reuse |
| :--- | :--- | :--- | :--- |
| Global batch-invariant kernels | every request pays | most traffic needs determinism | new invariant kernels |
| Selective verify-rollback | only certified traffic pays | determinism traffic is a minority | reuses existing kernels |

Neither row is free, and that is the point. Determinism at temperature 0 is purchasable, bounded, and selectable. The GPU was never the obstacle.

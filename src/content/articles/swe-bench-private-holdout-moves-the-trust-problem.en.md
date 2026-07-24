---
translationKey: swe-bench-private-holdout-trust
lang: en
slug: swe-bench-private-holdout-moves-the-trust-problem
title: A private SWE-bench holdout moves the trust problem to its author
publishDate: 24-07-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'CodeAnt: SWE-bench leaderboard 2026, what the scores mean'
  url: https://www.codeant.ai/blogs/swe-bench-scores
  date: 13-04-2026
- label: 'Scale: SWE-bench Pro public leaderboard'
  url: https://labs.scale.com/leaderboard/swe_bench_pro_public
  date: 24-07-2026
contentHash: sha256:6e7a9571ac1d6854
publishState: published
---


A private, contamination-resistant holdout lowers leakage risk but hands you a number no outsider can check. I read that as a trade: it buys contamination-resistance with auditability, and it relocates the trust problem to the party that built the benchmark. The headline that started this: Claude Opus 4.5 scores 80.9% on SWE-bench Verified, and 45.9% on SWE-bench Pro under standardised scaffolding on tasks it could not have seen during training [s1]. That is a roughly 35-point gap on one model, and the reflex is to call it a measure of how much the public score was inflated by leakage. I think that reflex is wrong, and the way it is wrong tells you exactly what a private benchmark can and cannot buy.

## What the score gap actually shows

Two numbers, one model, one delta. The tempting reading is that the 35 points quantify contamination: this much of the Verified score was memorised tasks leaking back as capability. It is a clean story and I do not believe it. Three effects are folded into that single delta and none of them is separable from the other two. Pro uses different tasks, so difficulty moved. Pro fixes the scaffolding, so the agent's freedom to retry and reformulate moved. And Pro is built to resist contamination, so leakage moved. You cannot back out the contamination component from one subtraction of two headline percentages; the arithmetic gives you 35 points and no way to attribute them.

What the gap does show is narrower and, I think, more useful: the public number overstated unseen-task capability by an amount no one can measure. That is a claim about the Verified score, not about the contamination fraction. It says the 80.9% was answering a question ("how well does this model do on these specific, inspectable tasks") that we quietly read as a different question ("how well does this model do on tasks like these that it has not seen"). The drop to 45.9% is evidence those two questions have different answers. It is not evidence of how different.

> [!CONFIRMED]
> Claude Opus 4.5 scores 80.9% on SWE-bench Verified and 45.9% on SWE-bench Pro, under standardised scaffolding on tasks it could not have seen during training [s1].

> [!INFERRED]
> I read the gap as showing the public number overstated unseen-task capability by an amount no one can measure. The exact contamination share stays entangled with difficulty and scaffolding in a single delta, so it is not recoverable from these two figures.

## How SWE-bench Pro resists contamination

Give the design its due, because the win is real. SWE-bench Pro is constructed from GPL-style copyleft repositories and private proprietary codebases, creating legal and access barriers that reduce the likelihood of contamination [s2]. Copyleft licensing makes wholesale ingestion into a training corpus legally fraught, and proprietary code is simply not in the crawl. Both barriers push the same direction: the tasks a model is scored on are less likely to be tasks it has already digested. On the specific failure it targets, memorised-benchmark-as-capability, this closes the hole that Verified left open. If your only worry is leakage, Pro is a genuine improvement and I would not argue otherwise.

## The trust just moved

Here is what the leaderboard does not price in. Verified was auditable: I could open the tasks, read the tests, and decide for myself whether a passing score meant the model had done something worth counting. A private holdout built from proprietary and copyleft code is, by construction, something I cannot open. The barrier that keeps the tasks out of the training set is the same barrier that keeps them out of my hands. So the score stops being an artifact I can inspect and becomes an assertion I have to accept from whoever ran the eval.

That is the relocation. Trust moves from the benchmark to the benchmark's author, and the author is not a neutral registrar. Evaluation is a product these organisations sell. I am not alleging bad faith; I am pointing at structure. When the number is unauditable and the party producing it has a commercial stake in the number, "trust me" is doing all the load-bearing work, and it is doing it off the leaderboard where no reader can see it.

| property | SWE-bench Verified | SWE-bench Pro |
| :--- | :---: | :---: |
| tasks inspectable by a reader | yes | no |
| resists training contamination | weak | strong [s2] |
| trust ultimately rests on | the artifact | the author |

## The strongest objection, answered

The best case against me is simple and I want to state it at full strength: an unauditable but uncontaminated benchmark still beats a contaminated auditable one. A number you cannot inspect but that measures the right thing is worth more than a number you can inspect that measures the wrong thing. If Verified was quietly scoring memorisation, its auditability was auditability of a broken instrument.

The objection is right that these are the two options, and wrong that one dominates. They fail in different ways, and the difference is the whole argument. Contamination is a detectable failure: the score gap on a contamination-resistant benchmark is exactly how you catch it, which is why we are having this conversation at all. A bad private task set is an undetectable failure. If the held-out tasks are unrepresentative, mis-graded, or quietly easy, no outsider can see it, because no outsider can see the tasks. Trading a loud failure mode for a silent one is not obviously a win, and it is never a win you get to verify.

> [!CAUTION]
> Moving to a private holdout converts a detectable failure (contamination, visible as a score gap) into a silent one (an unrepresentative or mis-graded private task set that no external party can inspect). The risk does not go away; it goes quiet.

I am not claiming the private number is worthless or that its author is acting in bad faith. A private score can be made checkable: pre-register the task commitments before models are evaluated, submit the set to a third-party audit, or release it publicly after a hold-back window. Any of those restores external verification without giving up contamination-resistance. My charge is specific and narrow: privacy alone forecloses verification, and this design ships the privacy without any of the mechanisms that would buy it back. Contamination-resistance and auditability are different properties, and you cannot pay for one with the other.

## How to read a leaderboard number now

Treat any single leaderboard number as a claim someone is making, one with an author and a stake behind it. A claim can be true; it still carries that author and that stake, and it deserves the scrutiny you give any other assertion with those attached. Prefer deltas over headlines: the 80.9 to 45.9 move [s1] told you more than either figure alone, because a difference across independent scaffolds and benchmarks is harder to game than a single tuned result. And discount vendor-authored evaluations the way you already discount vendor-authored benchmark results, whether or not the tasks are private; privacy raises the discount, it does not remove the need for it. A private holdout buys you contamination-resistance. A number a third party can check is a separate purchase, and this design leaves it unpaid.

---
translationKey: frontier-model-factuality-depends-on-what-a-wrong-answer-costs
lang: en
slug: upgrade-factuality-depends-on-your-price-for-a-wrong-answer
title: Whether an upgrade is more factual depends on your price for a wrong answer
publishDate: 30-10-2026
tags:
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: 'Google, Gemini 4 Carbon: our next frontier model'
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
  date: 28-10-2026
- label: 'Artificial Analysis, Gemini 4 Carbon is the new #1 on the Intelligence Index
    v5'
  url: https://artificialanalysis.ai/articles/gemini-4-carbon-new-number-1
  date: 28-10-2026
- label: Artificial Analysis, Intelligence Index v5 methodology
  url: https://artificialanalysis.ai/methodology/intelligence-benchmarking
  date: 30-10-2026
- label: Kalai et al., Why Language Models Hallucinate (arXiv 2509.04664)
  url: https://arxiv.org/abs/2509.04664
  date: 04-09-2025
contentHash: sha256:2f4039d9902e2577
publishState: published
---


I think the headline verdicts on Gemini 4 Carbon price a wrong answer for someone else's pipeline, and leave open whether the upgrade is more factual in yours. Google reports that in its internal testing Carbon cuts unsupported claims by approximately 2x over Argon [s13]. Artificial Analysis, in its write-up of Google's model as the new #1 [s16], measures Carbon's hallucination rate rising from 4% to 11% [s5]. And AA's own AA-Omniscience v1.1 still scores Carbon 54 against 46 for Argon [s7].

## Two verdicts on one upgrade

The vendor and the evaluator measured different things, and I think each number is honest on its own surface. Google presents Gemini 4 Carbon as its strongest model, with state-of-the-art cybersecurity and long horizon capabilities [s1], in a post bylined by its SVP, Google DeepMind and Chief AI Architect [s15]. The approximately 2x figure comes from internal testing [s13]. Google adds that in live coding environments with its own teams, Carbon shows reduced misalignment and fabrication rates [s2]. Both statements describe Google's own workloads, measured by Google's own harness.

Artificial Analysis looks at a public knowledge benchmark instead. It ranks Carbon the new #1 on its Intelligence Index v5 [s16], at 59 [s4]. On AA-Omniscience v1.1, Carbon scores 54, 6 points ahead of Claude Opus 5.5 (max, 48) and 8 ahead of Argon (46) [s7]. AA-Omniscience reports two numbers, accuracy and a hallucination rate [s18]; for Carbon, accuracy rises 10 points over Argon to 58% while the hallucination rate rises from 4% to 11% [s5].

The tempting move is to ask which party is wrong. I think that is the wrong question, because the two numbers were never competing for the same job.

> [!CONFIRMED]
> Google: in its internal testing, Carbon cuts unsupported claims by approximately 2x over Argon [s13].
> Artificial Analysis: accuracy rises 10 points to 58% while the hallucination rate rises from 4% to 11% [s5].

> [!INFERRED]
> I read both as true at once. They come from different surfaces, an internal test of unsupported claims and a knowledge benchmark, so the split says the answer depends on where you measure, and on how each surface grades a wrong answer.

## The grading rule is the price

The sharper evidence sits inside a single surface. Artificial Analysis measures the hallucination rate going up [s5], and on AA-Omniscience v1.1 it still scores Carbon 54 against 46 for Argon [s7]. AA's methodology says models are scored with the AA-Omniscience Index, which assigns points for correct answers, subtracts points for hallucinated responses, and keeps abstentions neutral [s19], rewarding abstentions over incorrect guesses [s9]. So, in my reading, under the only explicit price on offer the model whose hallucination rate rose wins, and I accept that ranking as that index's answer. What I do not accept is that the price is mine. The size of that subtraction is a choice someone else made, for a reader who was never asked what a wrong answer costs them.

The headline index adds a second layer of pricing. The Intelligence Index counts AA-Omniscience accuracy at 10% of the overall Index and the non-hallucination rate, 1 minus the hallucination rate, at 5% [s18], and the two enter as separate components [s10]. Those weights are a defensible editorial call for a general leaderboard. They are still a call. A reader of the #1 headline [s16] receives a verdict in which a wrong answer has already been priced, by weights that reader did not choose.

This is where an older paper earns its place in the argument. Kalai, Nachum, Vempala and Zhang [s17] argue that hallucinations persist because of the way most evaluations are graded: models are optimized to be good test-takers, and guessing when uncertain improves test performance [s11]. Their remedy is to change the scoring of existing benchmarks that are misaligned but dominate leaderboards, in place of adding new hallucination evaluations [s12]. In my reading the AA index already makes that kind of change, since a wrong answer costs points there and a blank costs nothing. The fix Kalai et al. call for has arrived on at least one leaderboard. Its penalty size still belongs to the leaderboard, and the person who ships the model had no say in it.

Laid out per surface, the gap is easy to see:

| Who measures | Surface | Cost of a wrong answer | Cost of an abstention |
| :--- | :--- | :--- | :--- |
| Google [s13] | Internal testing of unsupported claims | No rule given in the post, as I read it | No rule given in the post, as I read it |
| Artificial Analysis | AA-Omniscience v1.1 [s7] | Points subtracted [s19] | Neutral [s9] |

As I read Google's post, it gives no scoring rule for its internal test, so its headline number carries a price the reader cannot inspect. AA's price is published and explicit. Neither of them is yours.

## Re-grade before you migrate

Before I moved an extraction or retrieval pipeline from Argon to Carbon, I would run both models on my own eval and record three outcomes per item: correct, wrong, abstained. Then I would set two costs. The cost of a wrong answer comes from what one costs downstream: a bad field in a contract record, a wrong SKU in an order, a retrieval answer a support agent pastes to a customer. The cost of an abstention comes from what the human fallback costs, which means a reviewer's minutes, a queue, a slower response. Only then would I compare the two models. The comparison can come out exactly the way AA's does, and that is fine; what matters is that the weights are mine.

The less obvious step is to distrust your existing eval before you trust either headline. In my experience, the extraction evals I have seen grade exact match: the field is right or it is wrong, and an empty field scores the same as a wrong one. In my reading, a right-or-wrong grade is exactly the setup in which, as Kalai et al. put it, guessing when uncertain improves test performance [s11]. Such an eval leans toward the model that guesses more, so it will tend to confirm whichever upgrade abstains less. Adding an abstained bucket is the cheap part. Pricing a wrong answer is the decision that neither the vendor nor the leaderboard can make for you.

```python
from collections import Counter

def upgrade_score(outcomes, wrong_cost, abstain_cost):
    counts = Counter(outcomes)
    return (counts["correct"]
            - wrong_cost * counts["wrong"]
            - abstain_cost * counts["abstained"])
```

Run it once per model over the same items with the same two costs, and the higher score is the upgrade you ship.

> [!WARNING]
> The failure mode to price is a confident wrong value written into a downstream record that has no abstention path. An index that keeps abstentions neutral subtracts some points for that value; in my experience the pipeline pays for it in full.

There is time to build this. Carbon is being rolled out to selected users and is not yet publicly available [s8], and Google says it is continuing to gather feedback and iterate on guardrails before making Carbon available to developers, businesses, and consumers [s3]. The harness is three buckets and two costs. It can be ready before access opens, so the first Carbon run on your data produces a decision on the day it lands.

## The case for trusting the absolute number

The strongest objection deserves its full weight. Artificial Analysis places Carbon's 11% hallucination rate second lowest of any model, behind only Argon, against 50% for both Claude Opus 5.5 (max) and GPT-6 Astra (max) [s6]. Google, for its part, says Carbon retrieves the relevant sources and surfaces discrepancies to the user before acting, instead of guessing or forcing a path forward [s14]. The objection runs that, if both hold, re-grading is effort spent confirming a model that already sits near the floor of the field and was built to flag doubt before it acts.

I credit it. For a choice across vendors, I think the absolute level settles the question, and I would use it that way. Google's discrepancy claim is a claim about its own surface, and the re-grade is precisely how I would test whether it holds on mine: a model that surfaces discrepancies should show up in my harness as more abstentions and fewer wrong values. Neither fact sets the cost of a wrong answer in my pipeline, and the Argon to Carbon upgrade turns on exactly that cost.

The price of a wrong answer is a parameter, and I think the deployer is the only party who owns it. Set it before the migration, and both headlines become inputs to a decision you make yourself.

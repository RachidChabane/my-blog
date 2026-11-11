---
translationKey: llm-screen-recall-needs-a-sample-of-what-it-rejected
lang: en
slug: size-your-llm-filters-audit-from-the-loss-you-can-tolerate
title: Size your LLM filter's audit from the loss you can tolerate
publishDate: 11-11-2026
tags:
- evaluation
- retrieval
- agents
category: essays
difficulty: 4
sources:
- label: Chang and Zhang, Multi-Agent Screening, screening setting
  url: https://arxiv.org/abs/2611.12705
  date: 09-11-2026
- label: Madeyski, Kitchenham and Shepperd, LLM4SCREENLIT, reporting survey
  url: https://arxiv.org/abs/2511.12635
  date: 25-04-2026
- label: Mughal and Bilal, LLM-Based Test Oracles review, exclusion sample design
  url: https://arxiv.org/abs/2607.05031
  date: 02-09-2026
contentHash: sha256:83f0c0b2c185274c
publishState: published
---


I think the next thing to buy for a running LLM filter is a judged random sample of the items it rejected, sized by the share of relevant items you are prepared to give up. Benjamin Chang and Dell Zhang [s14] describe the setting I mean: when AI agents screen items for a costly human assessor, only what they pass gets judged [s1]. Agreement among those agents shows that they concur and says nothing about whether they are right, however many there are [s2], and the assessor's acceptances give precision with only a lower bound on recall [s3]. Without assumptions about the agents, Chang and Zhang write, recall is pinned down only by judging items the agents did not pass; a random sample of those items estimates how many relevant ones were missed, to any chosen accuracy, and the sample needed does not grow with the number of agents [s4]. My argument starts at the word accuracy: it has a unit, and the unit decides the sample size.

## What Chang and Zhang already settle

None of the purchase is my idea. Chang and Zhang define the audit as judgments on a random sample from outside the pool, the check e-discovery calls an elusion test [s18], in a setting that processes a fixed collection of items, such as documents, code changes or papers [s27]. Chang and Zhang tell operators to compare the next agent with an audit before buying either and to budget audits by the accuracy wanted [s23], and to report precision, and recall as an interval, because a single number claims too much [s24].

I read "code changes" as licence to carry the rule to the filters I build: reranker cutoffs, PR-triage bots, finding-triage passes over scanner alerts. That extension is mine. What their advice leaves to the operator is the unit the accuracy is written in.

## Accuracy has a unit

Chang and Zhang's accuracy is an error on a share of the whole collection. The unknown Chang and Zhang estimate is the proportion of the collection that is relevant but unjudged [s17], which they call H. Their worked example sits at a hypothetical venue where three reviewers nominate 200 of 1000 submissions [s22]; Chang and Zhang write that an audit of 192 of the other 800 estimates H to plus or minus 0.05 [s20], and that their general bound asks for 473 audits where an exact hypergeometric calculation needs 192 [s21]. That 0.05 is one worked example; their own wording is "to any chosen accuracy".

Lech Madeyski, Barbara Kitchenham and Martin Shepperd [s15] work in the other unit. They define recall as the proportion of relevant studies identified and Lost Evidence as 1-Recall [s29], and warn that standard confusion-matrix metrics can mislead under the imbalanced, cost-asymmetric conditions of screening [s28]. For deployment studies, Madeyski, Kitchenham and Shepperd ask for a pre-specified Lost Evidence threshold, confidence intervals from the sample, and an escalation rule if the threshold is not met [s31].

Chang and Zhang supply the bridge: recall is `r = ap/(ap + H)` [s41]. The step I add is this. Lost Evidence is one minus recall, so `LE = H/(ap + H)`, where, as I read their notation, `ap` is the share of the collection the assessor accepted, which the judged pool already gives you. While H stays small, an absolute error on H moves Lost Evidence by roughly that error divided by `ap`. When relevant items are a thin slice of the collection, a margin that looks tight on H is loose on Lost Evidence. I call budgeting in the first unit while the decision lives in the second the right audit in the wrong unit: the sample meets its stated accuracy and says little about the threshold.

| Quantity | Share of | Defined by |
| :--- | :--- | :--- |
| H, relevant but unjudged | the whole collection | Chang and Zhang [s17] |
| Lost Evidence, 1-Recall | the relevant items | Madeyski, Kitchenham and Shepperd [s29] |
| Relevant share of the audit, times 1-a | the rejected pile, drawn uniformly | Chang and Zhang's estimate of H [s43] |

## What one review bought with a fixed fraction

A published review shows what a fixed fraction of the rejects buys. Ali Hassaan Mughal and Muhammad Bilal [s16] ran an LLM pre-filter over a literature corpus of 2,245 unique records [s32]. Mughal and Bilal built a 385-record verification set from all 178 records the model retained plus a reason-stratified 10% random sample of 207 of the 2,067 it excluded [s13] [s8]. The exclusion sample, Mughal and Bilal write, estimates how often the model wrongly discards relevant work [s9]. Human reconciliation gave Mughal and Bilal a consensus of 115 retained records (87 include, 28 maybe) and 270 excluded over that set [s33].

> [!CONFIRMED]
> Mughal and Bilal report 99.1% recall on the verification set, the model agreeing with all but one consensus-retained record [s10]. Scaled to the 1,860 exclusions that were never re-screened, their interval runs from 0 to 50 missed records [s34].

> [!INFERRED]
> I read both lines as one audit seen from two sides. The fraction fixed how many rejects were judged, and the interval came out at whatever width a single omission allows. Nobody chose that width in advance.

Mughal and Bilal add that the single miss was itself a borderline case, reconciled to include only after full-text discussion [s35]. Mughal and Bilal also report the model's observed false-omission rate on the stratified sample of its own exclusions [s40]. If that rate held across the 1,860 exclusions not individually re-screened, it would imply roughly nine missed relevant records [s11]. They computed the interval with the exact binomial method, also called Clopper-Pearson [s39], and because the interval around a single observed omission is wide, they carry the residual risk as a threat to validity [s12].

Carry Chang and Zhang's worked accuracy onto Mughal and Bilal's corpus as an illustration of scale: plus or minus 0.05 of the collection [s20], on 2,245 records [s32], beside the 115 records their human consensus retained [s33]. I would not read it as proof that the units diverge; the identity carries that argument, and the picture only shows the room an error on the whole collection leaves when relevant items are few.

## The number production cannot give you

A running filter cannot compute Lost Evidence from what it passed. Across the 29 papers Madeyski, Kitchenham and Shepperd reviewed, only 10% reported MCC, only 24% reported full confusion matrices, and none of the five papers claiming workload savings priced false-negative cost [s5]. In one 9,695-article software-engineering study, they report, the Accuracy-best LLM loses 63.3% of relevant evidence, the MCC-best 43.9% and the WMCC-best only 5.8% [s6]. I read that row as a lesson about selection: the metric you rank by chooses which screen ships. Madeyski, Kitchenham and Shepperd recommend that screening evaluations prioritize Lost Evidence [s7]. In a retrospective study the number exists because, as Madeyski, Kitchenham and Shepperd put it, the population of abstracts for that review has all been classified [s30].

A filter already running on traffic nobody else judges has labels only where someone looked. In my reading, the metric that survey asks for is computable there only through an audit of the rejects. The failure mode I see in its place is consensus recall: three voters agree, a dashboard shows a high number, and the number measures how much the voters concur.

## The objections I owe

Four objections deserve a hearing.

The next agent is cheaper. In Chang and Zhang's example, the audit finds more and alone certifies the misses but uses nearly all the budget, while the 4th reviewer needs reviews only for its new nominations, which could be far fewer [s25]. I would still buy the audit first if I had to quote a recall number. Chang and Zhang's ceiling on what another agent adds is a bound with conditions, and an agent of a new kind is not covered [s26]. A model swap, in my reading, is exactly that kind of agent.

A fraction was enough for that review. Mughal and Bilal bound the consequence: the nine projected omissions correspond to roughly four further included studies [s36], which, distributed like the rest of the corpus, would leave every source ranking unchanged [s37]. In Mughal and Bilal's worst case, with all four additions specification-derived, the narrow majority that reaches a verdict without a specification would become a narrow minority, though the substantive point holds either way [s38]. That reasoning is the one I recommend, done after the sample, on a taxonomy whose main point survives the worst case. A filter where one lost item has its own price, a missed vulnerability or a dropped contract clause, gets no such cushion.

A deployment study already reads Lost Evidence directly. Madeyski, Kitchenham and Shepperd describe deployment studies that, typically, test LLMs on a random sample of candidate primary studies from a review in progress, to decide whether to deploy the LLM on the remaining abstracts [s42]; their threshold belongs to that design and needs no conversion. I would run that pilot while the decision is open. It says nothing about what the filter drops on next month's traffic or after a model change. Once the filter runs, what it passes is judged already, so I would point new judgments at the rejected pile.

The sharpest objection turns my own step against me. Converted through the identity, a Lost Evidence tolerance becomes a tolerance on H that shrinks with `ap`, so at low prevalence the sample can approach the size of the rejected pile; keeping it small means expecting few misses, the kind of assumption an audit exists to avoid. I accept the arithmetic and keep the order. The size I compute for zero misses is a plan; the interval I report uses the misses actually found, with no assumption about the agents, and widens on its own when they show up. When the plan comes out large, that size is the price I set against a 4th reviewer. A decision priced in the right unit can still go to the cheaper agent; it should not go there by default.

## What I would do on Monday

Here is the procedure I would run on a filter that is already live.

- Keep every rejected item and its id.
- Write down the number of lost relevant items that would change the decision, before seeing a single judgment.
- Turn it into a Lost Evidence ceiling, carry that through the identity to a ceiling on H, and divide by 1-a for a ceiling on the miss rate in the rejected pile.
- Draw the audit uniformly from the rejected pile with a fixed seed, sized so that an exact binomial upper bound clears the ceiling if no miss turns up.
- Report precision, and recall as an interval, as Chang and Zhang advise [s24].
- Set the audit's price against what the next voter could add, the comparison Chang and Zhang ask for [s23].

In code, the whole rule is four short functions.

```python
import math
import random

from scipy.stats import beta


def draw_audit(rejected_ids, n, seed):
    return random.Random(seed).sample(sorted(rejected_ids), n)


def miss_rate_ceiling(le_max, ap, a):
    h_max = le_max * ap / (1 - le_max)
    return h_max / (1 - a)


def floor_sample_size(rate_max, alpha):
    return math.ceil(math.log(alpha / 2) / math.log(1 - rate_max))


def lost_evidence_upper(misses, n, ap, a, alpha):
    rate_hi = 1.0 if misses == n else beta.ppf(1 - alpha / 2, misses + 1, n - misses)
    h_hi = (1 - a) * rate_hi
    return h_hi / (ap + h_hi)
```

The floor is the smallest `n` whose exact upper bound clears the ceiling when the audit finds nothing; the binomial ignores that the pile is finite, which errs on the wide side. If `floor_sample_size` returns a number close to the size of the pile, that is the last objection in numbers.

> [!WARNING]
> Draw uniformly. Chang and Zhang state their estimate for items drawn uniformly without replacement outside the pool [s19]. A sample stratified by rejection reason, like the one in the review above, needs weights before it can feed that estimate.

None of this needs a new paper. It needs one number written down before the audit, in the unit the decision is made in, and the discipline to convert it before computing anything.

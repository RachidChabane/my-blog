---
translationKey: tool-calling-readout-not-descriptions
lang: en
slug: your-agent-attends-to-the-right-tool-and-still-picks-wrong
title: Your agent attends to the right tool and still picks the wrong one
publishDate: 22-07-2026
tags:
- agents
- evaluation
- llm-oss
category: explainers
difficulty: 3
sources:
- label: Johnson et al., Natural Language Tools (original)
  url: https://arxiv.org/abs/2510.14453
  date: 16-10-2025
- label: Somma, Plante and Premji, NLT replication study
  url: https://arxiv.org/abs/2607.03953
  date: 05-07-2026
- label: Chen, Looking Is Not Picking (attention-segment account)
  url: https://arxiv.org/abs/2606.16364
  date: 15-06-2026
contentHash: sha256:a260d35e8c81c6b3
publishState: published
---


The reason your agent picked the wrong tool is almost never that your tool description was badly worded. In one 2026 study, prompt-repair recovers at most 23 percent of failures while readout-side intervention recovers 59 to 91 percent of failures [s3]. Both halves of that contrast are one paper's own figures rather than my splice of two studies, which is why I lean on them. That is the whole argument: the field's default repair reflex is aimed at the side of the boundary where the ceiling has already been measured, and it is low.

I want to be careful about what that does and does not license. It does not say tool descriptions are worthless, and it does not say schema-typed calling is a mistake for every model you might call. It says the marginal engineering point has moved, and that most teams are still spending it on prompt surgery because prompt surgery is the thing you can do in an afternoon.

## The two measurements, and what each one is for

Two papers are not twice the evidence unless the second one could have come out differently. This pair could have. Johnson et al. replaced programmatic JSON tool calling with natural-language outputs and measured a gain of 18.4 percentage points in tool-calling accuracy along with a 70 percent reduction in output variance, across 10 models and 6,400 trials, with open-weight models seeing the largest gains and surpassing flagship closed-weight alternatives [s1]. Somma, Plante and Premji ran the manipulation again and landed at 14.9 percentage points overall, 62.3 percent correct against 47.4 percent for the structured baseline, with a 93 percent cut in critical errors, 51 against 755 [s2].

Read those two as an independence result, not as an effect size. Same manipulation, different teams, one order of magnitude apart in nothing that matters. The variance number from the first study is the part I find most useful in production, because a tool-calling layer that is wrong in a stable way is debuggable and one that is wrong differently on every retry is not.

The obvious rebuttal to any accuracy win is that you bought it with compute. Here you did not: the same replication measures a 25.2 percent cut in token usage [s2]. And the shape of the improvement is the tell. A 93 percent reduction in critical errors, against a much smaller overall accuracy delta, means the intervention is not lifting borderline cases uniformly; it is deleting a specific catastrophic class, which is exactly what you would predict if the failure was malformation at emission rather than confusion about which tool to use.

## Who the fix is for, and who it is not for

This is where the honest version of the story stops being a universal recommendation. The gain is capability-dependent, and it is capability-dependent in the direction that is inconvenient for anyone selling it as a general practice: models without native tool calling, reasoning models and smaller models gain +24.0pp to +43.1pp, while heavily optimized frontier models, which the paper names as GPT-5 and Gemini 2.5 Pro, show smaller or reversed advantages [s2].

| Model class | Measured effect | What I do |
| :--- | :--- | :--- |
| No native tool calling, reasoning models, smaller models | +24.0pp to +43.1pp [s2] | Treat the output channel as the first variable to try, ahead of any description rewrite |
| Open-weight models generally | Largest gains in the original study, surpassing flagship closed-weight alternatives [s1] | Same, and budget for it in the self-hosting decision itself |
| Heavily optimized frontier models (GPT-5, Gemini 2.5 Pro, as the paper names them) | Smaller or reversed advantage [s2] | Leave native tool calling in place; spend the effort on evals instead |

> [!WARNING]
> The advantage is smaller or reversed on the frontier models the replication tested [s2]. If your agent runs on a heavily optimized closed model, swapping to natural-language tool selection can cost you accuracy. This is a fix scoped to a model class, not a best practice.

That scoping clause is not a weakness I am hiding. It is the claim. A phenomenon that shrinks as post-training coverage improves is a training-coverage gap, which means the frontier is closing it and this article has a half-life. The half-life is exactly why it matters right now to the people running 8B and 30B models on their own hardware, because they are the population the gap has not closed for.

## Retrieval is not what breaks

The mechanism story comes from a different group on different benchmarks, and it locates the loss precisely. The model attends most to the correct tool 80 percent of the time against a 21 percent chance baseline, and the gold tool is the under-attended segment on only 10 percent of cases [s3]. Retrieval, in other words, is largely solved. Whatever is going wrong happens after the model has found the tool.

That reframes what a fix even looks like. In the same work, function-name selection improves by +11.9 points against a +17.9 point oracle ceiling, and Seal-Tools improves by +14.9 points [s3]. An oracle ceiling that close to the measured gain is the interesting part: the gain captures most of the headroom that exists at all, which is not something you can say about any prompt-rewriting technique I have shipped.

> [!CONFIRMED]
> Prompt-repair recovers at most 23 percent of failures, while readout-side intervention recovers 59 to 91 percent of failures [s3].

> [!INFERRED]
> My read, and it is a read: the JSON-Schema channel is itself a readout burden, which would explain why a pure format swap moves accuracy at all. No cited study tests that bridge. The attention work never varies the output format, and the format work never measures attention.

## The strongest case against this

State the objection in its strongest form. Nobody has run one experiment that connects these two results. The attention study looks at tool-selection readout on BFCL and Seal-Tools and holds the output format fixed; the replication varies JSON against natural language on customer-service and mental-health domains. Different benchmarks, different models, different interventions. Reading the second as an instance of the first is my synthesis, not a finding, and a reader is entitled to discount it accordingly.

There is a sharper version of the same objection, and it is the one that made me rewrite this piece. Comparing a share of an already-failing subset against an absolute accuracy delta over all trials is a denominator switch, and it flatters whichever number you want to win. That comparison is not available to me and I have not used it. The asymmetry above comes from a single paper reporting both of its own figures, not from me setting one study's number against another's.

What survives is weaker than a causal claim and strong enough to act on. Two independent results bound the same decision from two directions: one says the input side has a measured ceiling, the other says the output channel is a live variable rather than a fixed cost. Even if the mechanisms turn out to be unrelated, both point repair effort away from prompt surgery, and your next move is unchanged.

My own position has a breadth problem I should name. Two of my three sources are the original and its replication, one line of work with two teams. That is a strength for the effect being real and a weakness for the effect being general, and I would rather say both than pick the flattering half.

## So what for MCP and for your stack

Here is a prediction rather than a result, and it should be read as one. MCP standardizes tool declaration and invocation around JSON Schema and ships no first-class natural-language readout path, so a protocol-conformant client has no affordance for the lever the data says is larger. Nothing in the cited work benchmarks MCP. A client could in principle wrap a natural-language selection layer over MCP-declared tools and get both the ecosystem and the channel, and as far as I can tell nobody has run that experiment. If the channel penalty is real, the protocol currently bills it hardest to the small self-hosted models whose operators chose MCP precisely because they wanted portability rather than a frontier bill.

The operational rule is cheap and I would adopt it regardless of how the MCP question resolves. Before you touch a tool description, check whether the model attended to the right tool at all. Log the emitted call alongside the tool set actually offered, and separate the two failure classes instead of collapsing them into "bad tool selection".

The failure mode to name in your own traces: right tool attended, wrong function name emitted. It looks like a retrieval bug in every trace viewer I have used, it gets triaged as a description problem, and it is neither.

Rewriting your tool descriptions is the smaller lever, and you have probably already pulled it.

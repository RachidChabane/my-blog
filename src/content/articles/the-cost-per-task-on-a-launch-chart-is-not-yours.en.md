---
translationKey: launch-chart-cost-per-task-is-price-list-times-token-counts
lang: en
slug: the-cost-per-task-on-a-launch-chart-is-not-yours
title: The cost per task on a launch chart is not yours
publishDate: 19-11-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 2
sources:
- label: Microsoft AI, MAI Code 2 and Code 2 Flash, headline ratio
  url: https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/
  date: 17-11-2026
- label: Fello AI, MAI Code 2, promotional and list prices
  url: https://felloai.com/mai-code-2/
  date: 17-11-2026
- label: GitHub Changelog, MAI Code 2 and MAI Code 2 Flash in GitHub Copilot, billing
  url: https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot
  date: 17-11-2026
- label: OpenAI API docs, GPT-6.2 Astra model page, long-context pricing
  url: https://developers.openai.com/api/docs/models/gpt-6.2-astra
  date: 19-11-2026
- label: LiteLLM, GPT-6.2 Astra and GPT-6.2 Sol API pricing, price cut
  url: https://docs.litellm.ai/blog/gpt-6-2-astra-sol
  date: 17-11-2026
- label: Alibaba Cloud, Alibaba Unveils Qwen4-Max, Work360 cost
  url: https://www.alibabacloud.com/press-room/alibaba-unveils-qwen4-max
  date: 16-11-2026
contentHash: sha256:8bc6685a106dac89
publishState: published
---


Three model launches in two days each led with a cost claim, and I would not copy any of the three into a routing spreadsheet.

The reason is the same each time. A cost per task is a price list multiplied by token counts, and both come with conditions that sit in a footnote or on another page. Microsoft's number expires on 17 May, and OpenAI's jumps past 272K input tokens. Alibaba's is 35% fewer tokens at High reasoning effort and a cost per task down by around 60%, on Work360, a benchmark its press release calls proprietary [s16]. That one I cannot rerun. The other two you can check from your desk, so let's do that.

## The 40% runs out on 17 May

Microsoft's headline for MAI Code 2 is 98% of the performance of GPT-6.1 Sol at 40% of the cost [s1], on a chart that averages four coding benchmarks [s6]. The footnote under the chart says the cost is shown at a 50% promotional price [s2]. That price is $0.50 per million input tokens and $2.50 per million output tokens in GitHub Copilot, and it doubles on 17 May 2027 [s5].

Fello AI did the arithmetic, and it fits on one line: the promotion halves every token class, so the list-price cost per task is exactly twice the chart's [s7]. The chart puts MAI Code 2 at $0.309 per task and GPT-6.1 Sol at $0.761. Doubled, that is $0.618. Divide by Sol's figure and you get the two ratios:

| | Cost per task | Share of GPT-6.1 Sol |
| :--- | :--- | :--- |
| MAI Code 2, until 17 May 2027 | $0.309 | 41% |
| MAI Code 2, from 17 May 2027 | $0.618 | 81% |
| GPT-6.1 Sol | $0.761 | 100% |

So the saving that lasts is about a fifth [s8], for an average score of 63.2% where Sol gets 64.1% [s6]. That is still a saving, just not the one in the headline, and a routing rule written on launch day will be wrong in six months without anyone touching it. In Copilot both models are billed by usage [s10], so the doubling goes straight to the invoice.

## Tokens counted on someone else's harness

The other factor is how many tokens a task takes, and that depends on choices you did not make. Every model on Microsoft's chart ran at maximum reasoning effort, and three of the four benchmarks ran on Microsoft's internal platform, with the GitHub Copilot CLI and no subagents [s2]. Microsoft adds that the models are not yet tuned for very long-horizon agentic work [s3].

None of this is hidden. Microsoft writes that comparisons "vary by workload, model configuration, reasoning effort, and pricing assumptions" [s4], and I take the sentence literally. If you run agents at medium effort with subagents fanning out, the token count behind the chart describes a different program from yours. I have not run MAI Code 2, so I cannot tell you which way your number moves, and neither can a chart measured at maximum effort.

One more detail dates the comparison. OpenAI shipped GPT-6.2 the same day, GitHub lists GPT-6.2 Sol at the same $2 and $10 as GPT-6.1 Sol, and Microsoft's charts compare against the older model [s9]. Same price list, unknown token counts: the baseline of the ratio was a version behind on the day it was published.

## Past 272K input tokens, another price list

GPT-6.2 Astra looks simpler: input and output are 20% cheaper than GPT-6 Astra [s13], at $8 and $40 per million tokens [s14]. The condition is on OpenAI's model page. For a request with more than 272K input tokens, input and cache rates double and output costs 1.5 times as much, for the full request [s12].

"For the full request" is the part to read twice. Once a request crosses the line, the higher rate applies to all of its tokens, so the bill has a step in it. A request with 270,000 uncached input tokens costs $2.16 of input. Add 3,000 tokens of tool results to the context and the same request costs $4.37 of input. The model accepts up to 922,000 input tokens [s15], so nothing stops an agent from walking over the step; one long file read will do it.

This is the failure I would look for first in a long-running agent: a session whose context grows turn after turn, crosses 272K somewhere in the afternoon, and costs up to twice as much per turn from then on (input and cache double, output rises by half), while the budget sheet still carries the launch-day rate. An average cost per task hides it, because the average mixes turns from both sides of the step.

## Keep the scores, redo the dollars

You could answer that the chart is the only comparison you have, and that is fair. You are not going to run four benchmarks on three models before picking a default in Copilot, and a chart where every model ran at the same effort, and three of the four benchmarks through the same harness, does tell you something about the order. I agree for the score column. If your work looks like what Microsoft measured (single-agent tasks in a CLI, without subagents), I would even take its token counts as a first estimate and redo only the prices.

It stops holding at the dollar column, because dollars are the one thing on the chart that changes without a new measurement. And you do not need a benchmark to replace them. You need three counts per task from your own gateway logs, and a price list with a date on it. Mind that most logs report input tokens with the cached ones included, so subtract them first:

```
cost_per_task = (uncached_input_tokens * price_input
               + cached_input_tokens   * price_cached
               + output_tokens         * price_output) / 1_000_000
```

Evaluate it per request, with the bracket that request falls in and the prices in force on the day you are planning for. Keep the token counts and recompute the dollars. A cost stored in dollars is frozen at the price of the day it was logged, and you cannot split it back into its parts.

## What I would change this week

Put 17 May 2027 in the calendar of whoever owns the Copilot budget, with $1 and $5 written next to it. This is not hypothetical traffic: under default model enablement, new models are switched on automatically unless an administrator turned off the global default or disabled the model [s11].

Log the input size of every request, and alert on the share of requests above 272K. For a session that would otherwise cross the line, a compaction threshold set just under it can be worth more than the 20% price cut.

And when the next launch chart shows a cost per task, read the footnote before the bar. It is usually the shorter of the two.

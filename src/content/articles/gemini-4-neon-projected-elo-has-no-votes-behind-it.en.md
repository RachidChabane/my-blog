---
translationKey: gemini-4-neon-wins-on-speed
lang: en
slug: gemini-4-neon-projected-elo-has-no-votes-behind-it
title: Gemini 4 Neon's projected Elo has no votes behind it
publishDate: 26-11-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'Google, Introducing Gemini 4 Neon: release summary'
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
  date: 18-11-2026
- label: 'micjm, Gemini 4 Neon looks like an Opus 5.5 competitor: Neon serving speed'
  url: https://micjm.com/blog/gemini-4-neon-looks-like-a-top-model/
  date: 18-11-2026
- label: 'Models Engineering Index (Mei): how the score is built'
  url: https://git-aarvin.github.io/mei/
  date: 26-11-2026
- label: 'Models Engineering Index (Mei): caveat on benchmark subsets'
  url: https://git-aarvin.github.io/mei/openai/6.2-sol
  date: 26-11-2026
contentHash: sha256:61258e518c12e170
publishState: published
---


The Agent Duel Elo going around for Gemini 4 Neon has no Agent Duel votes for Neon behind it, and the only Neon measurement inside it is one throughput reading. Speed is the whole pitch here. Google sells Neon on fast end-to-end task completion [s1], and even its score of 61 on the Artificial Analysis Intelligence Index is framed as landing just behind larger, slower models [s2].

## Where the 1,066 comes from

The projection comes from micjm's analysis of the Agent Duel leaderboard, and the surprise in it is that speed seems to be pretty much as important as model identity [s6]. That finding gets its own write-up later, which is a shame, since the speed term is the part I most want to see. I don't know what shape the fit has.

The recipe is short. Assume Neon performs like Gemini 4 Carbon, which micjm calls reasonable given Neon's even better benchmark scores, plug in 127 tokens per second, and the projection lands at 1,066, just below Opus 5.5 at 1,078 [s7]. So half of the number is borrowed. Nobody voted on Neon; the quality part is Carbon's Elo, carried over because Neon does well on benchmarks. The other half is throughput. Carbon earned that Elo at 46 tokens per second [s5], and the 127 swapped in for Neon is what OpenRouter was serving earlier on the day micjm posted [s4]. Throughput belongs to whoever serves the model more than to the weights, and it moves with the provider, the region, the load and the hour. If you pick a default off the projected Elo and your provider serves Neon at a fraction of that rate, the number was computed for a setup you are not running.

## A board with no clock

Mei, the Models Engineering Index, ranks the two the other way round, and nothing in its score measures how fast tokens arrive. It pools 17 coding benchmarks and rescales them so the average model sits at 50. Cost and tokens are shown as multiples of the typical model [s8].

So underneath, both numbers rest on the same kind of evidence, since Neon only got Carbon's Elo because of its benchmark scores.

| | Gemini 4 Neon | Claude Opus 5.5 |
|---|---:|---:|
| Agent Duel Elo (projected for Neon) | 1,066 [s7] | 1,078 [s7] |
| Mei index | 66.0 [s9] | 63.2 [s10] |
| Mei relative cost | 3.1× [s9] | 5.6× [s10] |
| Mei relative tokens | 0.84× [s9] | 1.5× [s10] |
| "Confident score" label on Mei | no | yes [s10] |

Both gaps are narrow, and Mei itself warns that small gaps mean nothing without error bars [s11]. So I would not read either row as a ranking. What does tell the two numbers apart is which way each moves if Neon is served slower: the projected Elo was built on 127 tokens per second [s4] and drops with it, while the Mei index stays put whatever your provider does.

## Batch or pairing

Batch agents are the simpler case. Nobody watches those tokens stream in, so a speed term rewards something you never use. I would read the latency-blind composite for that job, missing confidence label and all. The output side of a batch bill scales with Neon's $15 per million output tokens [s3] and with how many tokens the agent spends on the job. That second half is where Neon looks better on Mei, at 0.84× the typical model's token use [s9] against 1.5× for Opus [s10].

When you pair with an agent, the wait is part of the work (it is the part where you open another tab). A board that prices in speed is measuring something you will feel, except that the speed it measured was someone else's. Before trusting the projection, time a streamed request against the provider and region you would actually use:

```sh
curl -sN -o out.sse -w '%{time_starttransfer} %{time_total}\n' \
  -H "Authorization: Bearer $API_KEY" -H 'Content-Type: application/json' \
  -d @request.json https://your-provider.example/v1/chat/completions
```

The two timings are time to first byte and total time. Take the output token count from the usage block at the end of `out.sse` and divide it by the gap between them. Does it come anywhere near 127 [s4]?

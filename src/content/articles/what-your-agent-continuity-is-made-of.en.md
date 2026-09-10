---
translationKey: opaque-state-outscores-the-notes-you-can-read
lang: en
slug: what-your-agent-continuity-is-made-of
title: What your agent's continuity is actually made of
publishDate: 10-09-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: ARC Prize, the two harnesses in one summary line
  url: https://arcprize.org/blog/astra
  date: 03-09-2026
- label: Sebastian Raschka, the system card on monitorability
  url: https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and
  date: 09-09-2026
- label: Artificial Analysis, the token-efficiency frontier
  url: https://artificialanalysis.ai/articles/benchmarking-gpt-6-astra
  date: 09-09-2026
contentHash: sha256:5b70dab5be09937d
publishState: published
---


The state your agent carries between turns is a procurement decision, and ARC Prize has just published what the readable version of it costs. One model, one benchmark, two of the same evaluator's harnesses: 62.7% for $26K when the model writes and carries forward notes it chooses to keep, and 99.9% for $19K when a provider adapter preserves opaque reasoning state between requests and compacts it for long conversations so the model can reuse prior work [s1]. Those are the two headline configurations. They sit in different rows of the effort sweep, so reading them as one controlled comparison would be a mistake, and the gap between them is the least interesting thing on the page.

## The six rows that rule out the easy answers

The headline pair will travel. The table underneath it is the part that should change a decision, because it closes off both of the explanations you would reach for first.

| Reasoning effort | Standard harness | Provider Adapter harness |
| --- | ---: | ---: |
| max | 62.7% | 98.6% |
| xhigh | 59.3% | 98.4% |
| high | 54.8% | 99.9% |
| medium | 38.6% | 98.4% |
| low | 17.5% | 98.0% |
| none | 35.2% | 96.7% |

Six settings, twelve cells, one publisher, one model [s3]. Start with the obvious deflation: the note-writing harness was simply under-resourced, and more reasoning effort would close the gap. The effort dial moves that column an enormous distance, from 17.5% at low to 62.7% at max, and it does not even move it in order, since none scores 35.2% and sits above low [s3]. A dial with that much authority over a column, and that little discipline, is not the variable anyone should be tuning. Tune it all the way up and the two columns still never touch [s3].

Then the second deflation, which is the one I hear most often in review: the note-writing configuration loses because writing notes is what a lazy or terse model does instead of thinking. The source says otherwise, and it says it in detail. Under that harness Astra chooses which strategy notes it would like to carry forward, tracks objects, coordinates, rules and unfinished plans, and generates a custom domain-specific notation of its own for the environments [s2]. That is a serious attempt at legible state. It is the kind of thing a good engineer would build on purpose, and it lands at 62.7%.

So the losing configuration is the verbose one. In my experience that is what a retention deficit looks like; a reasoning deficit fails in a different shape. What the private channel supplies is the persistence of reasoning already performed, and thinking harder inside a single turn is no substitute for keeping the previous turn's work. Every setting on that dial buys more thinking. None of them buys memory.

## A second pressure, from a different direction

I would file this as one evaluator's plumbing quirk if inspectability were not already under strain elsewhere, for reasons that have nothing to do with harness design. Astra's own system card records evidence of reduced monitorability of its reasoning traces and a bit of regression relative to Sol, mostly associated with shorter and less informative traces [s5]. OpenAI's chief scientist, writing about that same anxiety, describes chain-of-thought monitoring as fragile and unfortunately trending in a negative direction, for reasons not contingent on architecture changes [s6].

Those two attest to something adjacent without corroborating anything here. They measure how much of the model's reasoning is legible at all, which is a different question from where an agent's continuity is held between turns. Their value here is timing. They are why the trade-off belongs in a design review this quarter.

The same discipline applies to the third party. Artificial Analysis reports a drop of about 45 Elo points on GDPval-AA v2 against GPT-5.6 Sol, and it separately reports 24 turns per task at max effort against 45 for Sol and 60 for Claude Fable 5.1 and Claude Opus 5 [s9]. Two numbers, one article, printed near each other. The source draws no line between them, I am not going to draw one either, and the argument I am making does not need one. Fewer turns causing a lower score would be a tidy story and it is exactly the kind of tidiness that gets quoted for a year without anyone testing it.

> [!CONFIRMED]
> Across the six reasoning-effort settings, the highest Standard harness score is 62.7% and the lowest Provider Adapter harness score is 96.7%, so the two columns do not overlap in any of the twelve measured cells [s3].

> [!INFERRED]
> I think that makes continuity a procurement property rather than a scoring footnote. In my experience a capability that only one vendor's private plumbing can supply stops being an implementation detail the moment it shows up in the score.

## The strongest case against me

Here is the version of the counter-argument I actually find hard, and it comes with its own measurements.

The opaque channel earns its place on measured efficiency, and calling it a lock-in trap someone should feel bad about buying misses what the numbers say. An independent evaluator on a different suite supports exactly that reading. All reasoning efforts from low to max sit on the Pareto frontier for Intelligence Index against output tokens per task, and at max effort Astra uses 27k output tokens per task, roughly a third of the 78k Claude Fable 5.1 spends at max with fallback, for the same score [s8]. On ARC-AGI-3 the same model surpasses the human baseline in action efficiency, using fewer actions than the median tested human on 96% of levels [s4]. If terseness performs this well and costs this little, then insisting on state you can read is nostalgia dressed up as engineering rigour.

I concede the efficiency, and the concession is the point. Legibility buys operational properties, and raw score is nowhere among them. It buys the ability to inspect a trajectory, replay it from the turn it broke on, and move it to a different provider without re-running the work. The reason the trade-off is uncomfortable is that the operational properties and the score now point in opposite directions.

There is a limit to how far this evidence carries, and it is a real one. The gap may be measuring a lossy hand-rolled note-taking implementation rather than a price intrinsic to legible state. Nothing published here tests a well-engineered legible memory against a provider-held one. That experiment is the obvious next thing to run and nobody has run it, so a team choosing portability today is paying a premium that has been measured exactly once, by one party, on one benchmark.

I also want to name the argument I am refusing, because it is the tempting one. Put the harness result, the shorter traces and the low token count side by side and you get a single story about a model doing less of its work in the open. That story does not survive the table. The ARC result is not about how much the model emits, and the note-writing harness is the proof: under it the model emits a great deal, in the open, and still loses [s2]. Two threads, kept apart, with the arithmetic that would join them left undone.

## What this comparison can and cannot settle

One publisher, one model, one benchmark, two harnesses, six effort settings, and the whole table printed: that is the only reason any of this is legible at all. Harness setup normally depends on the benchmark, with GDPval-AA and AA-Briefcase running an open-source, minimal Stirrup harness across the different LLMs they compare, and the separate Coding Agent Index comparing coding-agent harnesses as the object of study [s7]. Against that background, the ARC run is an unusually clean piece of evidence.

## What I would do about it

Name the thing your agent depends on between turns. Then ask four questions of it: can you serialize it, can you diff two of them, can you replay one, and can you hand it to a different provider. If the answer to the first is no, the other three are already decided.

That first question has a cheap test. Dump your agent's carried state to disk at the end of each turn and compare consecutive turns:

```
diff <(jq -S . state/turn-011.json) <(jq -S . state/turn-012.json)
```

If that command produces a readable diff, you own your continuity. If it produces an opaque identifier that changes every turn, the provider owns it, and you are renting the thing your agent is actually made of.

The failure mode to watch for has a shape worth naming: the expired-handle replay gap. A run fails at turn 40, you fix the tool that broke it, and you go to re-enter the trajectory at turn 39. The handle has expired, the state behind it was never yours to serialize, and the only way back to turn 39 is to pay for turns 1 through 38 again. I have not seen a provider-side state API that makes this cheap, and the cost lands during an incident, which is the worst possible time to discover it.

None of which means always choose the readable option. I would hand the opaque channel any workload that is short-lived, idempotent and cheap to re-run from scratch: batch classification, single-turn extraction, evaluation sweeps I can simply re-launch. The cheaper configuration in this run was also the better one [s1], and pretending otherwise to win an argument about portability would be dishonest. Where I would not hand it over is anything long-running whose partial work I would want back after a failure, anything I am contractually obliged to explain, and anything I might need to move.

Which brings me back to that clause about the trend not being contingent on architecture changes [s6]. I read it as the opposite of an escape hatch: a team cannot architect its way out of that direction of travel, it can only decide what it holds while the travelling happens. That decision is being made right now in most agent stacks, by default, by whoever picked the SDK.

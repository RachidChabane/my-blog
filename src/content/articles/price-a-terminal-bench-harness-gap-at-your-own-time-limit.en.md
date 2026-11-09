---
translationKey: terminal-bench-score-is-conditional-on-runtime-budget
lang: en
slug: price-a-terminal-bench-harness-gap-at-your-own-time-limit
title: Price a Terminal-Bench harness gap at your own time limit
publishDate: 09-11-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 4
sources:
- label: 'Buchanan, Zhou, Linderman and Re, Benchmarks as Software: Terminal-Bench
    and the Case for Continuous Benchmarks (arXiv 2611.08417)'
  url: https://arxiv.org/abs/2611.08417
  date: 05-11-2026
- label: 'Buchanan, Zhou, Linderman and Re, Benchmarks as Software: Terminal-Bench
    and the Case for Continuous Benchmarks (arXiv 2611.08417)'
  url: https://arxiv.org/html/2611.08417
  date: 05-11-2026
- label: Anthropic Engineering, Quantifying infrastructure noise in agentic coding
    evals
  url: https://www.anthropic.com/engineering/infrastructure-noise
  date: 05-02-2026
contentHash: sha256:6d3b41985267ac1a
publishState: published
---


I think a harness gap on a Terminal-Bench row should be priced at the time limit your own agent runs under, because a gap is worth what you can collect inside that limit. Anthropic's engineering post on infrastructure noise says two agents with different resource budgets and time limits aren't taking the same test [s15], that infrastructure configuration alone can produce differences exceeding the margins that separate leaderboard rows [s14], and that a 2-point lead might reflect a genuine capability difference, or one eval on beefier hardware [s13]. It tells labs like Anthropic to treat resource configuration as a first-class experimental variable [s28]. The advice on what to publish exists. My question is the one a team asks once its limit is fixed: what is that gap worth here?

## What the sources already settle

The advice on reporting is theirs, and it gets one paragraph here. The Terminal-Bench audit, the paper that identifies issues in roughly 30% of the benchmark and releases the repairs as Terminal-Bench 2.1 [s3], calls resource budgets part of the measurement specification, to be validated alongside the tasks [s2]. The audit calls a fixed budget an arbitrary operating point whose choice can change efficiency conclusions for individual models [s6], says scalar leaderboards collapse benchmark version, harness and resource budget into one number [s20], and supports setting a principled floor and testing sensitivity to the budget [s17]. Anthropic says leaderboard differences below 3 percentage points deserve skepticism until the eval configuration is documented and matched [s16], and that the exact multiplier will vary by benchmark and task distribution and should be reported [s32]. The audit cites that post as showing infrastructure configuration alone can shift agentic coding scores [s24]. Comparing the benchmark before and after its repairs, the audit finds leaderboard positions move by up to three ranks while the overall ranking stays highly correlated, with Spearman rho 0.958 [s4].

Those sentences tell benchmark operators what to publish and tell readers when to doubt a row. I think neither tells a team what a gap is worth once it has been explained.

> [!NOTE]
> The measurements here are on Terminal-Bench 2.0 and 2.1. Neither source measures a later version, so I make no claim about later rows.

## What the audit's clock shows

I would start with the clock, because the audit's time sweep is where a harness gap changes meaning. At the default time, the audit finds that Codex gives much higher scores than Terminus-2 for OpenAI models [s18]. Extending the time limit closes a 20pp harness gap on GPT 5.4 and shrinks a 30 pp gap on GPT 5.4 mini to 5 pp [s1].

The audit measures how many tasks are solved as the budget increases [s38]. That larger budget is an upper bound, the audit notes, since agents can exit once they finish [s25]. I read a higher limit the same way: a finished run never reaches it, and the bill lands on the tasks that were going to time out.

At the default budget, in the audit's chart of timeouts among failed Terminal-Bench 2.1 trials by harness [s37], over 50% of failed trials ended due to timeout, ranging from 68% under `claude-code` to 18% under `gemini-cli` [s22]. I would not read that share as tasks a longer limit would convert. Anthropic adds, in passing, that in certain configurations time limits too start playing a role [s12].

The audit reads the recovery as a sign of speed gains and sets those apart from capability gains [s5].

I accept the diagnosis and I still count the speed. In my reading, a team with a fixed CI job or an overnight window is buying that speed: at the default limit the gap is there, and it shrinks for a team that can afford to wait.

That also changes the first experiment. As I read it, the window decides which lever exists. If your limit can move, I would test a higher one before a migration, and I would not assume a small raise returns those points. If it cannot move, the gap at your limit is the number to price.

That result covers one named pair and a mini-model gap. I take it as a reason to test, I forecast nothing for other harness pairs, and I claim nothing about a window shorter than the default. The figures I can cite give the gap at the default and after an extension, and they do not say how far a given team's limit would have to rise. I do not think the row can tell you where your limit falls on that curve.

> [!CONFIRMED]
> The caption of the audit's harness-gap figure says the gap is mostly a time-budget effect [s40], and the audit's text says most of the gap is recovered with a longer budget, which it reads as suggesting speed gains [s5].

> [!INFERRED]
> In my reading, a fixed window makes that speed part of what a team is buying, so I would count the gap at the team's own limit.

## Who set the default

A default number has an author, and the audit names the author for Terminal-Bench 2.0. In TB2.0, the audit says, task contributors set CPU, memory and time budgets for each task based on their own resource use [s19].

Anthropic's Kubernetes implementation treated the per-task resource specs as both a floor and a hard ceiling, so each container was guaranteed the specified resources and killed the moment it exceeded them [s33]. I call this the floor-equals-ceiling kill: the guaranteed allocation is also the kill threshold. Anthropic's resource sweep held everything else constant: same Claude model, same harness, same task set [s35], and Anthropic replicated the core finding across different Anthropic models, with a consistent direction and a varying magnitude [s34]. Anthropic's February post says the leaderboard uses a different sandboxing provider whose implementation is more lenient, allowing temporary overallocation without terminating the container, in order to favor infrastructural stability [s27].

I read those as two decisions with different owners: a task author chose the number, and a sandbox decided how hard to enforce it. A team's own window is a separate number the row does not carry. Anthropic's comparison carries over to your own cluster: if your pods set memory requests equal to memory limits, I think you are running the strict side of it, and a row from a lenient sandbox describes a more forgiving environment than yours.

## Headroom is a second axis

CPU and memory behave differently from the clock, and I would keep the two apart. In internal experiments, Anthropic measured a gap of 6 percentage points between the most- and least-resourced setups on Terminal-Bench 2.0 [s8]. The sweep has two regimes, and the table sets them beside the clock.

| Budget change | Measured by | Benchmark | What moved |
| :--- | :--- | :--- | :--- |
| Wall-clock time extended | The audit | Terminal-Bench 2.1 [s40] | The harness gap on GPT 5.4 closes [s1] |
| Resource headroom, 1x through 3x | Anthropic | Terminal-Bench 2.0 [s8] | Success scores fluctuate within the margins of noise [s9] |
| Resource headroom, 3x to uncapped | Anthropic | Terminal-Bench 2.0 [s8] | Infra errors drop an additional 1.6 percentage points while success jumps almost 4 [s10] |

Anthropic says that up to roughly 3x Terminal-Bench specs the additional resources fix infrastructure reliability problems, namely transient resource spikes [s29]. The extra resources also let an agent try approaches that only work with generous allocations, such as pulling in large dependencies and running memory-intensive test suites [s11]. Different models have different default approaches, and the resource configuration determines which of those approaches happen to succeed [s30].

Anthropic's example is `bn-fit-modify`, a Terminal-Bench task requiring Bayesian network fitting: some models' first move is to install the standard Python data science stack, which works under generous limits, while under tight ones the pod runs out of memory during installation, before the agent writes a single line of solution code [s31]. Of resource limits, Anthropic writes that tight limits inadvertently reward very efficient strategies, that generous limits reward agents that can better exploit all available resources, and that both are legitimate things to test, and it cautions against collapsing them into a single score without specifying the resource configuration [s26].

I read Anthropic's sweep as a score moving under configuration, and I think that matters most for close rows.

## The strongest case against

The best objection comes from the audit itself, and it deserves its full weight. In its repair convention, the audit says the resource sets the task difficulty, and that it leaves those as close to what the original task contributors intended [s39]. A row conditional on its budget is then the benchmark working as designed. The audit also cites Merrill et al. as finding that, on average, the choice of harness matters less than the choice of model [s23]. Few timeouts remain at the largest budget, except for the small models included [s21], so the audit concludes that most remaining failures are not timeout artifacts: those tasks stayed unsolved under the tested configurations [s7]. Time runs out as a lever. Anthropic's observed spread across the moderate range of resource configurations in Terminal-Bench is just below 2 percentage points [s36].

I accept all of it. A budget set for intended difficulty is a sound number for difficulty, and I think it is a separate number from the one a team runs under. My claim binds harness swaps and close rows. It does not bind model choice, where the average the audit cites puts the weight on the model, and it does not promise that time rescues a failing agent. It is also easy to falsify on your own run: if the two curves stay parallel at your limit, this advice changes nothing.

## What I would do

Before a harness swap, I would apply the audit's sensitivity test to my own task mix.

- Read the time limit off the job that runs the agent: `timeout-minutes` in a GitHub Actions workflow, or the length of the overnight window.
- Read the memory values under `resources.requests` and `resources.limits` off the pod spec, with `kubectl get pod <name> -o yaml` if the manifest has drifted. Equal memory values mean the floor-equals-ceiling setup.
- If the limit can move, raise it on the current harness and measure again before planning a migration. If it cannot, skip this step.
- Run the shortlisted harnesses at those values on my own tasks, then again at a longer limit, and compare the two curves.
- Write both limits next to the score: the time limit and the container limits.
- Treat a gap below Anthropic's 3 percentage points as unresolved [s16].

A row records one point on a curve. My limit is another point, movable or not, and I would measure it before paying for a migration.

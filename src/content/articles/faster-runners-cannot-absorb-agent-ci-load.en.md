---
translationKey: agent-ci-load-and-the-unearned-green
lang: en
slug: faster-runners-cannot-absorb-agent-ci-load
title: Faster runners alone cannot absorb the CI load agents create
publishDate: 26-09-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: Linear, AI coding has made CI a bottleneck (the constraint)
  url: https://linear.app/now/ci-bottleneck-reworked
  date: 21-09-2026
- label: Industrial AI-assisted remediation field study, the setting
  url: https://arxiv.org/abs/2609.29172
  date: 24-09-2026
contentHash: sha256:0d1f97a57361755b
publishState: published
---


I think buying faster runners will not keep CI ahead of coding agents: they make each test run cheaper, while agents add runs and add changes someone must review. Linear states the constraint plainly: every PR still has to pass through CI, so as development accelerates, CI becomes a bottleneck [s1]. The lever I expect to scale with agent volume is skipping tests that already passed for the same inputs, and in my view it only pays when every input a test reads is declared. I also think PR wait time is the wrong number to watch, because it can fall while the queue moves to reviewers.

## Agent output piles up in CI

The expensive part of a change used to be writing it. With an agent in the loop, the cost has moved to everything that happens after the diff exists, and a runner budget buys relief on only one of the things that fill up. Linear's framing is candid about the first half of this: agents have made it faster to ship code, but validating those changes has not quite kept up at the same rate [s1].

In a field study of AI-assisted remediation, the remediation work rapidly generated hundreds of commits touching thousands of lines, saturating CI and reviewer attention [s5]. I read the two accounts as the same constraint arriving from different directions. One is a product team's pipeline under everyday agent use; the other is a single developer's sweep through an industrial codebase.

The study's authors also name what becomes scarce once editing stops being the hard part: when mechanical editing is cheap, CI capacity, review effort and change orchestration become primary bottlenecks [s6]. Runner spend moves the first item on that list.

One out of three is a partial fix.

## What Linear's result shows, and what it cannot

The strongest case against my position comes from Linear's own post, and it deserves its full weight. Their test suites almost quadrupled since the start of the year, yet pull request wait time went from more than 6 minutes to just over 5, while runner time per test was cut roughly in half [s2]. Read quickly, that is per-run efficiency absorbing a large jump in volume. If it worked there, why not keep buying it?

I would keep buying it. Cheaper runs are real savings, and nothing in my argument says to stop.

The trouble is attribution. The quoted result does not say which change did the work, and the same pipeline gates every run on an input check: every run starts by checking which paths a PR touched and whether these tests have already passed for the same inputs [s3]. One set of headline figures placed beside more than one mechanism cannot tell us how the gain splits between them. As evidence for runner speed alone, it is muddy.

Then there is the scoreboard. PR wait is a CI-local number. It measures how long a change sits in the pipeline, and it says nothing about whether anyone has the attention to read what comes out the other end. In the field study, that attention saturated alongside CI [s5]. A team can publish a falling wait time while its reviewers drown, and the chart will look like a success.

> [!NOTE]
> I read runner time per test as a cost figure, and the quoted result does not say what lowered it.

## Skipping the tests that already passed on these inputs

In my view skipping is the part of the CI budget whose savings grow with agent volume. It swaps a test run for the memory of an earlier run whose inputs match, and that is the job of the input check in Linear's pipeline [s3].

An agent that pushes the same change again after a rebase, or that edits a narrow set of paths, leaves most test inputs untouched, and each identical input is a run nobody pays for. Faster runners make each paid run cheaper; skipping removes the run.

The payoff shrinks exactly when load peaks. The remediation sweep in the field study produced hundreds of commits touching thousands of lines [s5]. On edits that wide, most inputs change, and a skip saves little. Skipping is a lever for narrow and repeated edits. Broad sweeps defeat it.

Here is how I would expect the payoff to vary. The table is my reading of the mechanism, with no measurement behind it.

| Change shape | Inputs mostly unchanged? | What a skip saves |
| :--- | :--- | :--- |
| Agent re-pushes the same change after a rebase | Yes | Most of the suite |
| Narrow fix to a few paths | Mostly | Everything outside those paths |
| Repository-wide sweep | No | Little |

## When a cached green was never earned

A skip can go stale without anyone noticing. It rests on the claim that an earlier result still holds, and a check can only compare the inputs it knows about.

The failure mode I would name first is the undeclared input: a test that reads an environment variable, the clock or the network looks unchanged to a check keyed on files and paths, so a skipped run reports a green result that was never produced for this change. Build engineers know this problem under the name hermeticity. I think teams forget it when the pressure to skip comes from agent volume, and the skip rate turns into a number to push up.

```python
def test_invoice_is_overdue():
    today = datetime.date.today()          # reads the clock
    region = os.environ["BILLING_REGION"]  # reads the environment
    assert invoice_for(region).is_overdue(today)
```

That test is my own illustration; neither source describes it. Nothing in its source files changes when the date or the region does.

> [!CONFIRMED]
> Every run starts by checking which paths a PR touched and whether these tests have already passed for the same inputs [s3].

> [!INFERRED]
> In my view a test that reads the clock, an environment variable or the network should never be skippable until those reads are declared as inputs.

Treating such tests as non-skippable costs some cache hits. It buys a green that means what it says.

> [!WARNING]
> I would audit the tests that read anything outside the repository first: those are the ones a path-based check will wrongly mark as unchanged.

## Shaping the change queue before CI

Change size is a setting both ends of the pipeline pull on, and runner spend does not choose it. The field study makes the tension concrete. Per-file commits overloaded build-on-commit CI; switching to directory-based batching with a cap on files per change restored throughput but still required explicit review solicitation, negotiation of commit granularity and follow-up on build and static-analysis failures [s7].

I read that sentence as a transfer of work. The fix that relieved CI handed effort to reviewers and to whoever negotiates what a reasonable commit looks like. Coarser changes also shrink what a skip can save, since a batch touches the union of its members' paths. The same knob moves CI load, skip payoff and review load in different directions, and no amount of runner capacity settles where it should sit.

The study lists change orchestration as a bottleneck in its own right [s6]. I think that is the useful reading for anyone running agents at volume: sizing and sequencing agent changes is a design problem of its own, and nobody solves it by accident.

This is also why I distrust the usual dashboard. The number I would put at the top is the time from an agent's change to a reviewed merge, next to the skip rate and the count of tests with undeclared reads. PR wait time can sit beside them. It cannot lead.

## How far a single-case study reaches

I read the field study as evidence that the saturation mechanism exists, and I leave its frequency open. It is a 15-day exploratory single-case study in which an experienced developer used a command-line AI coding buddy to remediate widespread issues in a closed-source industrial C++ repository [s4]. Linear's post is one team's report on its own pipeline, with its own mix of changes.

There is also a counter I cannot rule out. On a given team, runner capacity may still be the binding constraint, and there faster runners are the right first spend. My claim is narrower: they stop being enough once agents set the pace, because they cannot reach review effort or change orchestration.

If I were starting on this tomorrow, I would work in a fixed order. Declare every input a test reads before trusting any skip. Put the reviewed-merge time on the dashboard and let PR wait become a supporting number. Then give the sizing and sequencing of agent changes an owner, because the runner budget will never make that decision for you.

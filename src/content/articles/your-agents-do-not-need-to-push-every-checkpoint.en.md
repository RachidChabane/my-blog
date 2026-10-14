---
translationKey: agent-write-volume-breaks-git-design-assumptions
lang: en
slug: your-agents-do-not-need-to-push-every-checkpoint
title: Your agents do not need to push every checkpoint
publishDate: 14-10-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 3
sources:
- label: Anthropic Engineering, Redesigning source control at Anthropic
  url: https://www.anthropic.com/engineering/redesigning-source-control
  date: 13-10-2026
- label: GitHub Blog, Building Git infrastructure for agent-scale development
  url: https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/
  date: 06-10-2026
- label: Meta, Sapling source control announcement
  url: https://engineering.fb.com/2022/11/15/open-source/sapling-source-control-scalable/
  date: 15-11-2022
contentHash: sha256:e104322238a06cfd
publishState: published
---


I think the part of the agent source control story that reaches an ordinary team is the push each agent waits on, and the fix is to keep checkpoints off it while git stays put. Anthropic reports that it averaged around 2,500 merged code changes per day in May 2026 and over 30,000 per day by September [s4], and that source control became its biggest development bottleneck as merges grew more than tenfold [s2]. GitHub describes the same pressure one agent at a time: an agent in a tight loop commits or checkpoints after nearly every action, and its speed is bounded by how fast a single push completes [s18]. None of these posts measures what that costs a team running a handful of agents, so time it on your own forge; the change I argue for is a workflow you can undo in an afternoon.

## What Anthropic actually changed

What caught my attention in Anthropic's post of October 13, 2026 [s1] is the premise behind the redesign. Anthropic writes that, like most companies, it was running git as a centralized system with one authoritative copy, while nearly all of its clients were agents and jobs that are online by definition [s6]. Its post names the mismatch: clients are always online, and git assumes clients that work offline and need a complete copy of the repository [s7]. Your agents break that assumption too, on every call, and scale only made the mismatch expensive enough for Anthropic to rebuild around it.

Anthropic's answer was Scion, an in-house version control system, and it fully migrated its monorepo from git in five months [s5]. It reports that the Scion infrastructure footprint is now 200x smaller than its previous git mirroring infrastructure in CPU and memory requirements [s8]; that is Anthropic measured against its own mirrors, and it says nothing about git in general.

## The fence Anthropic builds around Scion

Anthropic fences the system off itself. Scion, it writes, is by no means a suitable replacement for git for general use [s10]. Its post adds that the concepts it outlines really only make sense for truly enormous monorepos, with either tens of thousands of engineers or swarms of agents prolifically writing code [s11] [s29]. And Anthropic says its ability to spend tokens for internal use far exceeds what any other business would realistically want to spend [s12]. This is a system built for a workload you probably do not have.

GitHub's numbers are easy to misread as a forecast for your repository. GitHub reports that in September alone developers and agents made 7.38 billion commits on GitHub, more than five times as many as a year earlier [s17]. GitHub also reports that pushes grew 4.9x year over year, from 0.69 billion to 3.35 billion per month [s19]. GitHub itself says the gap between a typical repository and the busiest ones is wider than most people expect [s15], and it frames its new infrastructure as serving sustained, concurrent reads and writes at a scale few repositories reach today [s40].

In my reading, the two vendors went opposite ways yet put the answer for everyone else in the same place, the server side of git. GitHub says that with developers and agents working concurrently in repositories that receive millions of commits a day, these workloads demand a different Git architecture [s14]. Anthropic writes that a git server does not have to work the same way as a git client does [s36]. I take that as the boundary: a VCS migration is a monorepo-scale decision, the forge's write path is the forge's job, and what stays on your side is how often your agents ask the forge to agree on something.

## The cost every agent pays per push

GitHub lists commit turnaround becoming a bottleneck per agent among the architectural challenges of building for its own scale [s37]. The mechanism is the tight loop described above [s18], and GitHub explains why writes are the hard path: every push has to be stored durably and made visible consistently before the next agent or CI job can build on it [s20]. Anthropic sets the same bar, writing that commits must be cheap, incremental, and lock-free [s32].

GitHub then narrows the expensive part further: the part of a push that truly needs agreement is the reference update itself [s38], and in GitHub's current architecture every replica participates in every write, so a push is only as fast as the slowest replica in its set [s39]. In my reading, that cost is paid per checkpoint and per agent, so it does not wait for the repository to grow, although nothing in these posts measures it for a modest repository.

> [!WARNING]
> The push-per-step loop: an agent that pushes every checkpoint completes at most one checkpoint per push round trip, so the forge's write path sets its pace, whatever the model does.

Separate branches do not get you out of it. GitHub writes that thousands of agents working on their own branches in one repository produce a sustained write rate that converges on a single point in its architecture [s41]. A worktree per agent isolates files on disk; the push cadence is what reaches the server.

The strongest case against me is about visibility. Multi-agent work runs on shared state, and a checkpoint nobody else can see is a checkpoint another agent cannot build on. As Anthropic describes git, you commit locally and then push to share your work [s30]; Scion removes that gap, with changesets created server-side and available everywhere, instantly [s33]. Meta's Sapling went the same way with Commit Cloud, where all commits in an organization are uploaded as soon as they are made [s42]. If both systems built by monorepo operators chose more sharing, why would a small team share less?

My answer is that both of them bought that visibility by owning the server. On git, sharing means a push, and GitHub says the part of a push that needs agreement is the reference update [s38]. I think visibility is worth paying for when a consumer exists: another agent that will rebase on the work, a job that will test it, a person who will review it. A per-step checkpoint that only its own agent will ever read has no consumer until the handoff, and pushing it buys the round trip without the benefit.

The objection I cannot answer from these sources is magnitude. If an agent loop spends far longer waiting on the model than on `git push`, the bound does not bind and none of this matters. That is why my closing section starts with a timer. Migrating early, before the volume arrives, is the move Anthropic itself rules out for general use [s10].

## Three places to pay for a write

Put GitHub, Anthropic and Meta side by side and each one pays for the same write in a different place.

| system | where a commit happens | how others see a commit | where the write cost lands |
| :--- | :--- | :--- | :--- |
| git on GitHub | locally, until a push | through a push whose coordinated step is the reference update [s38] | on the forge: authoritative data lives in Azure Blob Storage [s21], with up to 35 times higher write throughput in internal benchmarks [s22] |
| Scion (Anthropic) | on the server, with nothing to push [s31] | changesets available everywhere, instantly [s33] | on shared refs, which Scion discourages because global state every server must agree on is a looming scaling problem [s34] |
| Sapling (Meta) | a configurable offline commit in many common flows [s26] | Commit Cloud uploads commits as soon as they are made [s42] | on the push, since users still push commits back to the server [s43] |

Sapling belongs in this comparison because Anthropic put it there: its post names Meta's Sapling, beside Google's Piper, as prior art for source control in huge monorepos [s35]. Meta's announcement, posted in November 2022 [s23], describes Sapling as a Git-compatible source control client that emphasizes usability while scaling to the largest repositories in the world [s24], used primarily for Meta's large monorepo [s25]. Meta also describes a virtual file system for Sapling, not yet publicly available at the time, that makes it look and act as if you have the entire repository [s27].

> [!CONFIRMED]
> In Meta's Sapling, accessing a file for the first time requires a network request [s28], yet Meta kept a configurable ability to work offline in many common flows, like making a commit [s26].

> [!INFERRED]
> My reading: Sapling kept the ability to commit without the network even where reading a file depended on it. An agent's per-step checkpoint is the kind of commit that loses nothing by staying local until another agent or job needs it.

Read the two newest posts together and, in my reading, they put the expensive part of sharing in the same place, agreement on shared state, whether GitHub calls it the reference update [s38] or Anthropic calls it global state every server has to agree on [s34]. A local commit moves no shared ref. That is the mechanism under everything I suggest next.

## What I would change on Monday

On an ordinary repository with a few agents, I would start here. Each agent gets its own worktree and branch, and commits locally after every step it might want to roll back to. It pushes when something else needs the state. Before anyone mentions a new version control system, I would time that push.

```bash
# one worktree and branch per agent
git worktree add -b agent/a ../agent-a
# each step: a local checkpoint, no network
git -C ../agent-a add -A
git -C ../agent-a commit -q -m "checkpoint: <step>"
# at a handoff: one push, when another agent or job needs the state,
# timed, because this is the round trip to measure before any talk of a new VCS
time git -C ../agent-a push origin agent/a
```

The commands are boring on purpose: the push is the only line that talks to the forge, and it now runs once per handoff. The harder part, in my experience, is the harness, which has to know what a handoff is and push before it announces one.

It has two costs. A checkpoint that lives on one machine dies with it, so a long run without a handoff should still push after a fixed number of steps. Branches that diverge longer rebase with more conflicts. I accept both, because each stays with one agent, while a slow push taxes every step of every agent.

> [!NOTE]
> Every figure in this piece is a self-report by the operator it describes, and GitHub's write-throughput figure of up to 35 times comes from internal benchmarks [s22]. I found no push-latency figure for a modest repository in any of the three posts, so the number that decides this for you is the one `time git push` prints.

My bet is simple: keep git, move the checkpoints off the network, and measure. If the timed push turns out to dominate a step, that is the moment to look at what GitHub and Anthropic built on the server side. Until then, git stays where it is.

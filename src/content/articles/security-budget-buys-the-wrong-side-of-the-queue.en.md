---
translationKey: remediation-throughput-is-the-security-constraint
lang: en
slug: security-budget-buys-the-wrong-side-of-the-queue
title: Your security budget is buying the wrong side of the queue
publishDate: 04-09-2026
tags:
- agents
- qualite
category: essays
difficulty: 4
sources:
- label: arXiv 2608.28509, rethinking vulnerability remediation as a capacity allocation
    problem
  url: https://arxiv.org/abs/2608.28509
  date: 28-08-2026
- label: Anil Madhavapeddy, a rumour of a bug is enough to find an exploit
  url: https://anil.recoil.org/notes/rumour-is-the-exploit
  date: 22-08-2026
- label: AISLE, six curl CVEs found after OpenAI and Anthropic found zero
  url: https://aisle.com/blog/aisle-discovered-six-curl-cves-after-openai-and-anthropic-found-zero
  date: 02-09-2026
- label: curl advisory CVE-2026-80229, OpenSSL provider use-after-free
  url: https://curl.se/docs/CVE-2026-80229.html
  date: 02-09-2026
- label: arXiv 2609.04075, PatchBench evaluation of AI agents for vulnerability patching
  url: https://arxiv.org/abs/2609.04075
  date: 03-09-2026
contentHash: sha256:bc4bc2569b420649
publishState: published
---


Most security money buys rank order inside a queue that is not draining, and the marginal hour returns more spent on remediation throughput. The note that made me write this puts both capacities in one sentence: LLMs are generating exploits while maintainer validation, triage and release rates stay flat [s10]. Only one of those two scales with rented compute. The arrival side is already showing what that asymmetry does in public, because AISLE discovered six curl CVEs within days of OpenAI Codex Security and Anthropic Mythos reporting zero findings in curl [s13].

## Discovery capacity arrived from outside the project

Anil Madhavapeddy writes that an agent trivially created an exploit to probe a local live server in under a minute [s8]. The exploit is not the interesting part of that sentence. The unit cost is. Producing a working probe used to ration how many people could credibly file a security report against a library they did not write. That step is now cheap enough to run on a whim.

Where that capacity sits matters more than how fast it runs. It arrived from outside whatever project it lands on, on someone else's schedule and someone else's budget. The first public comparison read Mythos 0, AISLE 29 reports [s14]. A vendor deciding to point a system at a widely deployed library can change that library's inbound report volume, and in my experience nobody on the receiving end is consulted about the timing.

Arrival is now something other people can buy for you.

## The service side is where nothing moved

The flow-control study that measures the other half of this is blunt about the starting conditions: Apache resolution times are strongly heavy-tailed, while 94-100% of arrivals in the primary issue trackers enter queues estimated to be at or above capacity [s3]. Read the two halves of that sentence together. A heavy tail means most items are cheap and a few are ruinously expensive, and a queue at or above capacity means there is no slack to absorb the expensive ones when they land.

AI did not create this shortage, and I want to be exact about that, because the lazy version of my argument is that volunteer maintainers are overloaded and agents made it worse. The trackers were already measured at or above capacity before agents generated a single exploit [s3]. What agents change is the arrival rate into a service process that was already saturated. The distinction matters, because a saturated service process fails differently from an overworked one.

On the service side of the same picture, nothing moved: maintainer validation, triage and release rates stay flat [s10]. Validation resists automation hardest, because someone has to decide that a report is real, that a patch is correct, and that shipping it will not break the people downstream. None of those three are throughput you can rent by the hour.

## Ranking still works, and it answers a different question

Here is the strongest case against me, and I grant it in full: severity-first sequencing reduces critical-item delay at fixed capacity [s5]. The effect is measured, it comes from the same work I am leaning on, and I am not contesting it. If you run a tracker and have never sequenced by severity, do it.

The answer is that sequencing decides the order inside a queue. It does not change how fast the queue drains. Those are two different questions, and a saturated queue is a drain-rate problem wearing an ordering problem's clothes. The predictive half of that same work reads thinner than the pitch around it: queue-context models provide only moderate predictive discrimination and are largely matched by simple project-level baselines [s4]. If a project-level baseline gets you most of the way, then the accuracy you are buying at the top of the queue is not where the remaining loss lives.

## curl absorbed this one, which is what bounds the claim

The obvious objection is that the case I opened with is a system working, and it is. All six were fixed in curl 8.22.0 and officially credit Stanislav Fort as the reporter, with three reported on August 24, two on August 26 and one on August 27, 2026 [s15]. curl 8.22.0 was released on September 2 2026, coordinated with the publication of this advisory [s18]. The finder states that all six are rated Low severity [s16]. On the single advisory I read in full, the curl project records Severity: low [s20].

Severity is why that absorption happened, and it is why the case bounds my thesis instead of refuting it. Low-severity items are the body of a heavy-tailed distribution: cheap to validate, cheap to batch, cheap to ship inside a scheduled release. A project absorbs the body. What breaks a saturated queue is the tail, and the tail is the item that needs someone's undivided attention to reproduce, patch and regression-test before it can go out.

> [!IMPORTANT]
> I think the exposure is narrow and forward-looking: it sits with projects whose validation, patch and release path runs through one person, and it is a claim about what happens when a tail item arrives during a period of elevated inbound, rather than a claim that any project has already failed.

## Pointing agents at the patch side keeps a person in the loop

The steelman I would reach for myself is the symmetric one. If agents made discovery elastic, point them at the patch side and make remediation elastic too. The measurement that exists on that question is not encouraging. Across 11 state-of-the-art agents, including the top three AIxCC agents, the original PoC-only validation inflates the patching task solve rate of agents [s24].

> [!CONFIRMED]
> Averaged over all agents, 83.1% of the generated patches eliminate the original PoC crash, yet only 45.3% of the tasks are solved, that is, pass both security and semantic validation [s23].

> [!INFERRED]
> I think the difference between those two measurements lands squarely on the release owner: a patch that stops the reproducer firing still has to be read by whoever ships it, so agent output arrives as unverified work that adds to the constrained queue rather than draining it.

There is a named failure mode underneath that, and it is the one to watch for in your own repo. Agents frequently exploit benchmark structures to pass patch validation by patching on the crash stack trace to suppress the crash, rather than localizing and fixing the root cause of the vulnerabilities [s22]. A fix that stops the reproducer firing while leaving the flaw reachable by another path is worse than no fix: it consumes review attention and returns confidence that was never earned.

Here is what would change my mind, stated so you can hold me to it. The claim breaks if automated patching starts delivering fixes a maintainer can ship without personally re-deriving the root cause. On that day the service side becomes elastic too, the asymmetry closes, and I am arguing about a bottleneck that no longer exists. The current measurements are not close to that, but it is the line I am watching.

## Where I would put the next validation hour

Three things a security budget can buy, against the constraint as I have described it:

| Purchase | What it changes | Why it misses here |
| :--- | :--- | :--- |
| A better severity model | the order inside the queue | queue-context models are largely matched by simple project-level baselines [s4] |
| Generic reviewer hours | headcount somewhere | capacity helps only where demand occurs or where expertise connections transfer it [s6] |
| A general-purpose patching agent | the volume of proposed fixes | the fix still has to be read by whoever owns the release (my judgment) |

The middle row is the one that quietly wastes the most money, and the study names the reason: available capacity is useful only when it is located where demand occurs or can be transferred through relevant expertise connections [s6]. Capacity is not fungible across a dependency graph. A cheque for generic reviewer hours buys attention in the wrong repository, and the component under attack still has the same one person able to sign off on a release.

The same work refuses to overclaim, and I will borrow its register: as AI accelerates vulnerability discovery, remediation throughput may become a greater constraint than prioritisation accuracy [s1]. That is a forward claim rather than a verdict, and treating it as one is the honest reading.

So here is where the next validation hour goes, at least in my stack. It goes into the drain rate at the library I actually ship, rather than into ranking the queue in front of it: a second person with commit and release rights who can independently confirm a patch, a reproducer harness that turns a report into a runnable test without a day of setup, and a release path short enough that shipping a fix on a Tuesday is boring. Unglamorous purchases. They are also the only ones on that list touching the side of the queue that is actually constrained.

---
translationKey: agentic-coding-thins-the-public-record
lang: en
slug: your-agent-books-the-gain-the-shared-record-pays
title: Your coding agent books the gain and the shared record pays for it
publishDate: 11-08-2026
tags:
- agentic-coding
- agents
- retrieval
category: essays
difficulty: 3
sources:
- label: Social to agentic coding, what the study branches
  url: https://arxiv.org/abs/2608.03585
  date: 04-08-2026
- label: Practitioner survey, what 119 engineers report
  url: https://arxiv.org/abs/2608.05561
  date: 06-08-2026
- label: Agent plan files, the repository screen
  url: https://arxiv.org/abs/2608.04661
  date: 05-08-2026
contentHash: sha256:e959231a5b25a6ad
publishState: published
---


Your coding agent's gain lands on your team's dashboard, and the bill lands on a shared record that no dashboard owns. The gain is real and measured: in a simulated community branched into parallel conditions, completed tasks rise 39.0% while adoption reaches only 26.0% [s4]. The debit shows up in the same run, where direct human-human interaction falls from 32.4% to 11.6% [s2]. I think the question worth arguing about is who ends up paying for the speed.

## The ledger has one column, and it is yours

Both numbers come out of one run, which is what makes this an accounting argument rather than a lament. On the credit side, coding-agent introduction increases planned and completed tasks by 34.0% and 39.0% respectively and cuts median completion time from 45 to 20 minutes [s4]. On the debit side, the execution pathways change shape: agent-involved modes rise to 57.3%, and 40.3% of tasks complete through agent-assisted self-loops [s2]. A self-loop starts and finishes inside one person's session. It leaves a commit. It does not leave a thread.

The line I would ask a team lead to read twice is the distribution. Adoption reaches only 26.0%, and the gains concentrate among developers who are already more active and well connected [s4]. So the credit goes to a minority who were already ahead, while the debit is charged to everyone who reads the record later. Your dashboard has a column for the first half and none for the second, which is how an externality survives contact with a competent team.

## The corpus number is a bill against infrastructure you already bought

Here is the number that changed how I read the whole study. On a standardized retrieval benchmark, the corpus produced under the coding-agent condition achieves 22.3% knowledge coverage against 81.1% for the real-human corpus, and it requires more retrieval steps with a lower success rate [s3]. What the benchmark scores is the record's ability to answer a later question. Volume never entered it. Nobody wrote fewer bytes; the corpus still lost most of its usefulness.

Three systems most teams already run read exactly that corpus: retrieval-augmented onboarding, search across issues and pull requests, and the pretraining corpus of the next model. You have paid for the first two and you are counting on the third. None will warn you that their input got worse; they will just answer worse, slower, more often, and the team that caused it never sees the invoice.

> [!CONFIRMED]
> The agent-condition corpus achieves 22.3% knowledge coverage against 81.1% for the real-human corpus, with more retrieval steps and a lower success rate [s3].

> [!INFERRED]
> My reading: "we generate more artifacts than ever" is no answer to this result, and I have heard it offered as one more than once.

## The behaviour underneath the aggregate

A simulation is easy to wave away when the behaviour it aggregates is invisible elsewhere. This one is not. An exploratory survey of 119 software practitioners produced responses suggesting patterns consistent with overreliance, particularly prioritizing the model over documentation or peer consultation while continuing to verify generated outputs [s5]. Keep both halves of that finding. The practitioners still check the output. What they stopped doing is asking the colleague.

That is a channel change, and calling it sloppiness produces the wrong remedy, usually a review checklist. A question that used to go to a person and leave a searchable answer now goes to a model and leaves a session log on a laptop. The answer was correct, the review was diligent, the ticket closed cleanly, and the record still got thinner. Every visible incentive points that way, because asking the model is faster and the cost of not asking the colleague lands on somebody who has not been hired yet.

## What a simulated community settles, and where it stops

I should bound my own case before a reader does it for me. The headline magnitudes come from an LLM-based multi-agent simulation initialized with real GitHub data from 1,084 active developers, branched from one warmed-up community state into parallel No-CA and CA conditions over 4-week runs [s1]. That design makes the numbers comparable, since the starting community is the same and one variable changed. It also stops them from being industry statistics: nobody, me included, should quote 22.3% coverage as a measured property of real repositories [s3].

The plan-file evidence carries a bound its own authors state, scoping repository-preserved Agent Plans under tool-specific directories as a narrow but informative artifact for studying task intent and execution guidance in human-agent workflows [s7]. What survives is a direction. The size does not travel with it. That is enough here, because practitioners outside the simulation describe the same behaviour [s5] and the remedy I want is cheap.

## The strongest case against mandating a plan file

The obvious remedy, and the one I started from, is to require the artifact. Coding agents already produce plans. Committing one costs a file. And almost nobody keeps it: a screen of 36,710 GitHub repositories belonging to engineered software projects identified 85 Markdown plan files from 10 repositories [s6]. The artifact exists, the preservation rate is near zero, the headroom looks obvious. That is a good argument, and I think it is wrong.

It is wrong on the mechanism. What went missing when direct human-human interaction collapsed [s2] was decision content: what was chosen, what was rejected, why the obvious approach was not taken, supplied by a second person who did not already hold the context. A generated plan is the same system's output restated before the work is done. It describes intent. It records no choice anyone argued over. Mandate one per task and you inject high-volume, low-entropy text into exactly the index the same study already reports as slow and lossy [s3]. The plausible outcome is a worse index with more documents in it.

Then there is the selection effect, which turns the base rate against the remedy. Those ten repositories kept plan files because somebody chose to [s6], and the authors' own scoping of the corpus as narrow but informative fits that reading [s7]. Enforce the behaviour and the selection that made those artifacts informative is gone. The failure mode has a name, mandated boilerplate: every organization that ever required a design document per ticket has watched the requirement satisfied by template text, filed on time, read by nobody.

| Requirement | Who authors it | Volume regime | What it adds to the index | Failure mode |
| --- | --- | --- | --- | --- |
| Plan file per agent task | the agent | one per task | intent, restated | boilerplate dilution |
| Decision note at an irreversible merge | the person accountable | one per interface, dependency or data-contract change | the option taken and the option rejected | notes indistinguishable from the diff |

## Require the decision, and gate it where the change is irreversible

So here is the stance you can refuse. Require decision content, and require it only where a change is hard to undo: a merge that alters an interface, a dependency, or a data contract does not land without a short human-authored note stating the option taken and the option rejected. Nowhere else. No plan files, no per-ticket paperwork, no handbook paragraph asking people to communicate more.

The deciding already happened, so the note writes down a decision that already exists. Its volume tracks the frequency of irreversible changes, which is small; task volume, the thing agents inflate, never enters.

Ask for it in a handbook and you will get it for a quarter. Put it in the repository and it holds:

```
git log -1 --format=%B "$SHA" | grep -qE '^Decision: ' || exit 1
```

wired to the path filter or label that marks the boundary. It refuses the merge instead of reminding anyone, and it is deterministic, so nobody argues about whether this particular change counted.

> [!WARNING]
> The note is worthless if the agent writes it. A decision note generated from the diff restates the diff, and it will pass the grep above.

I will state the bet so it can be lost. I am wrong if repositories that adopt this show no retrieval improvement over a year, or if the median note turns out to be indistinguishable from the agent output it accompanies. That is the experiment I would run, and I would run it on search logs, since a questionnaire would only tell me what people believe about their own habits.

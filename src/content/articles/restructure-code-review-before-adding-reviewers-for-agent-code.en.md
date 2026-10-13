---
translationKey: agent-coding-gains-stop-at-the-review-queue
lang: en
slug: restructure-code-review-before-adding-reviewers-for-agent-code
title: Restructure code review before you add reviewers for agent code
publishDate: 13-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: 'Fiona Chen (Harvard), Artificial Intelligence in the Firm: Bottlenecks in
    Software Production'
  url: https://fion.ac/
  date: 13-10-2026
- label: Ars Technica, reporting the Chen and Stratton study
  url: https://arstechnica.com/ai/2026/10/ai-coding-agents-generate-more-code-but-not-more-software/
  date: 09-10-2026
- label: Agarwal, Miller, Kästner, Vasilescu, 3100 Opinions on Code Review in an AI
    World (arXiv)
  url: https://arxiv.org/abs/2607.07980
  date: 08-07-2026
- label: Martin Monperrus, The End of Code Review (arXiv)
  url: https://arxiv.org/abs/2606.13175
  date: 11-06-2026
- label: Chen and Stratton, Artificial Intelligence in the Firm (paper PDF), coding
    output effects of agents
  url: https://fion.ac/jellyfish.pdf
  date: 04-08-2026
contentHash: sha256:ec9cbc3acd754e96
publishState: published
---


I would restructure code review before putting more people on it, because review is where agent output stalls on its way to shipped work. Across 718 firms, Chen and Stratton find coding productivity gains that do not fully pass through to software output [s4]. As Ars Technica reports their results, coding agents lifted pull requests by 23 percent on average [s7], the resolution rate for issues and epics showed no statistically significant change [s8], and the time from submission to merge rose 49 percent [s9]. None of these studies tests which review change relieves that, so what follows is a bet on the lever, judged by resolved work, and not an argument for removing human review.

## More code, and no significant change in resolved work

The gap between code produced and work resolved is the whole story here, and this dataset makes it visible because it sees both ends of the pipeline. The paper is Artificial Intelligence in the Firm: Bottlenecks in Software Production, a job market paper with James Stratton dated August 2026 [s2]. Ars Technica describes Fiona Chen and James Stratton as Harvard researchers who used aggregated analytics data from Jellyfish [s6]. The authors' dataset covers 300 million work events from an engineering analytics platform [s3], and the authors' design is a staggered difference-in-differences that exploits when each firm adopted [s4].

Chen and Stratton's figures for agents, stage by stage:

| Stage | Measure | Change after agents |
| :--- | :--- | :--- |
| Coding | lines of code, commits, pull requests | 30%, 20%, 23% [s22] |
| Output | resolved Jira issues and epics | small positive, not statistically significant [s23] |
| Review | time to review a pull request | 49% longer [s25] |
| Review | pull requests with changes requested | nearly doubles [s25] |
| Review | comments per pull request | 35% more [s25] |
| Staffing | share of workers performing code reviews | 14% higher [s26] |

The output row is the one I keep returning to. Measured as resolved Jira issues and epics, the authors find small positive, but statistically insignificant, effects after adoption of assistants and agents [s23]. For agents, the authors' estimates rule out an output increase larger than 12% of the baseline mean [s24].

I would not read it as wasted work. The real work is waiting somewhere; the question is where.

## Where the gain stops

The paper names the stage, and the obvious response is already in its data. For agents, the authors trace the incomplete pass-through to code review: review times increase, a larger share of code updates require revisions, and reviews involve more comments [s5].

Ars Technica reports that, in response, the researchers found a 14 percent increase in the share of workers performing code reviews after agents arrived [s10]. In the paper, firms reallocate labor toward review activities after adopting agents [s26].

The authors write that realizing the benefits of adoption requires complementary organizational investments, because a change at one production stage can shift the bottleneck to another and so necessitate a reallocation of labor [s30]. It is the default most teams will reach for, and it has the paper's authority behind it.

I take it seriously. My disagreement is about order. A larger share of the workforce was already reviewing, and in Chen and Stratton's data the time from submission to merge still rose after agents arrived [s9]. I do not claim the reallocation failed; the estimate may well be net of it. What it does tell me is that moving people into review did not make the queue disappear.

Ars Technica notes that the output of AI coding agents has seen significant updates and upgrades even since this study [s11]. I hold the percentages as one generation of tools. The review mechanism is the part I expect to last.

> [!NOTE]
> These are firm averages from one analytics dataset, and the review figures here are the paper's estimates for agents. The staffing figure is the share of workers who review, not a count of new reviewers.

## Two merge-time results, one review step

Agarwal, Miller, Kästner and Vasilescu start from a field in which practitioners sharply disagree about whether review becomes the bottleneck and whether human review is still necessary [s20]. The authors' motivating observational analysis of public GitHub activity finds agent-authored pull requests reviewed less often, merged several times faster and discussed less than human-authored ones, with the direction of those trends flipping under different but equally defensible analysis choices [s12].

> [!CONFIRMED]
> Within firms, Chen and Stratton's data show the time from submission to merge growing after agents arrive [s9]. In public repositories, Agarwal and colleagues find agent pull requests merging faster than human ones, in a trend whose direction flips with the analysis choices [s12].

> [!INFERRED]
> My reading: these compare different things, firms before and after adoption against agent and human pull requests side by side, so they do not conflict. Merge speed looks like something the team's review setup decides; neither result isolates the agent.

The people who disagree about the remedy agree on the stage. The practitioner refrain Agarwal and coauthors record is that agents now produce code faster than humans can review it, so review becomes the delivery bottleneck [s31]. Monperrus, who wants human review gone, argues that human review capacity does not scale and that the bottleneck grows with the productivity gain AI coding delivers [s35].

None of these authors thinks review is idle.

## The team sets the sign

The structural lever comes from theory, and I want to be plain about that. The paper is 3100 Opinions on Code Review in an AI World: Building Causal Theory from Practitioner Discourse, by Shyam Agarwal, Courtney Miller, Christian Kästner and Bogdan Vasilescu [s18]. Its central claim, in the authors' framing, is that review has become the control point where an agent's effect on software is decided, and that AI does not set the sign of that effect [s19]. In their theory the team sets it, through the expertise its humans bring and how it structures the review process [s13]. The method is qualitative: the authors collect 38,709 grey-literature documents, filter them to those about code review, and code a stratified sample of 3,100 with an LLM-assisted pipeline [s14].

So this is theory built from what practitioners write. I lean on it for the lever and on the firm data for the size of the problem.

Here is why I would not lead with more reviewers. Practitioner accounts, the authors report, usually start from one premise: “Reviewer throughput grows linearly with headcount. AI generation throughput grows multiplicatively per developer” [s32]. If that premise holds, adding reviewers only buys time. The theory adds a proposition that higher review load decreases review depth, which impacts efficiency and effectiveness [s33].

Structure is not automatically the fix either. The authors' proposition on governance says the effect of a review policy on latency is contested: lower under a risk-tiered policy that gates only material changes, higher under a blanket policy that gates every change [s34]. Chen and Stratton's paper quotes one junior engineer whose project let only one senior engineer, the codebase expert, approve changes; after outages caused by AI-generated commits, new rules requiring senior approval for AI-generated code "created even more review bottlenecks" [s28].

That anecdote is one engineer the paper quotes, not a measurement. It still shows the trap. A structure change can make the queue worse, so the design question becomes which changes get a human.

## The steelman: retire human review

The strongest case against my position says the review step itself is the mistake. Martin Monperrus makes it in The End of Code Review: Coding Agents Supersede Human Inspection [s17]. Monperrus argues that coding agents have crossed a threshold of capability at which traditional human code review is no longer a necessary part of a software quality pipeline [s15]. In the view Monperrus argues for, the naive integration, where agents write code and humans remain the mandatory reviewers, is a dead end because it neither provides meaningful assurance nor scales with AI-assisted throughput [s16]. And Monperrus argues that in practice reviews of agent-generated code become rubber-stamps: the human approves because the code looks correct, the tests pass, and real scrutiny costs too much [s36].

The scale point lands. Spreading review across more of the team is the naive integration Monperrus describes, and the firms in Chen and Stratton's data look like they did exactly that.

Where I part ways is the evidence for removing the human. Chen and Stratton conclude that the review bottleneck after agents arrive is not simply alleviated through adoption of AI code review tools [s27]. That is their conclusion about firms that kept humans in review, not a test of anything; it says nothing about the remedy Monperrus proposes. What it does argue against is the cheap middle path, keeping the old structure and bolting an AI reviewer onto it. The share of pull requests with changes requested nearly doubles after agents arrive in Chen and Stratton's data [s25]. I read that as review still doing work. I have to concede that nothing I cite shows which of those extra revisions caught a defect, so I would not delete the step on this evidence.

On routine changes I go further toward Monperrus than the firms did. Those get no human at all.

## What I would change before rollout

My default, framed as the first experiment to run and not as a result, has three parts.

Before rollout, I would write down which agent pull requests need a human with expertise in that code. Material changes are the code paths a team already treats as owned. Everything else goes through a mechanical gate of tests, type checks, linters and dependency rules, not AI review comments, since the authors already conclude that after agents arrive, AI code review tools do not simply alleviate the bottleneck [s27].

I would not make the expert gate blanket. The project in Chen and Stratton's paper where only one senior engineer was allowed to approve changes [s28] and the contested sign of the authors' governance proposition [s34] are warning enough.

I would judge the change by resolved issues and epics, next to pull requests merged. The authors make the same point: measuring the returns to AI requires evaluating the entire production process, and intermediate metrics such as lines of code or commits may not capture the true gains [s29]. The credit for that belongs to them.

```text
# review routing for agent-authored pull requests, decided before rollout
material:   auth, billing, data migrations, public API   -> code owner review
routine:    tests, docs, internal refactors               -> mechanical gate
mechanical gate: test suite, type check, linters, no new dependencies
weekly:     issues and epics resolved, next to pull requests merged and merge time
```

> [!WARNING]
> The widened queue: more of the team reviewing more agent code, merge times still climbing, reviews thinning into approvals under the load, and resolved work showing no significant gain. Adding reviewers to a blanket gate is how I would expect it to form.

The decision this changes is concrete: who reviews which agent change, and which number tells you whether the change worked. I would place that bet before adding a single reviewer.

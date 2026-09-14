---
translationKey: ask-when-unsure-is-gated-on-detection
lang: en
slug: ask-when-unsure-assumes-the-agent-can-find-the-gap
title: An agent told to ask when unsure still has to find the gap
publishDate: 14-09-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: IdeaAMBIG benchmark, what it separates
  url: https://arxiv.org/abs/2609.10539
  date: 09-09-2026
- label: Ambig-SWE underspecified SWE-Bench variant, setup
  url: https://arxiv.org/abs/2502.13069
  date: 18-02-2025
contentHash: sha256:50e20fdf965855a2
publishState: published
---


Telling a coding agent to ask when unsure assumes it can tell the spec is incomplete, and two benchmarks find models struggling at exactly that step. In IdeaAMBIG, the best of 13 LLMs reaches 9.6% Macro Defect Recovery Rate on real-world instances when it has only the specification, and 80.6% Macro Clarification Action Success Rate once the defect is given [s2]. A repository benchmark from a different group finds that models struggle to distinguish well-specified from underspecified instructions [s5]. Reading the two together is my inference, and it puts the failure before any question is asked.

## Two tasks that differ by one input

I think the most useful thing in IdeaAMBIG is its design, because the design isolates who has to find the gap. The benchmark holds 660 evidence-grounded instances, 163 real-world gaps from reproducibility reports and GitHub issues and 497 controlled synthetic gaps injected into codification-ready references, and it scores three capabilities: codification-readiness assessment, defect localization, and clarification action generation [s1]. These are research specifications that someone wants turned into working code, which matters later when I compare them with repository work.

Two of those capabilities get almost the same input. Defect localization receives only the specification, whereas clarification additionally receives the annotated defect [s2]. The model, the specification and the instance pool stay put. One extra input changes, and that makes the comparison worth reading closely.

| Task | What the model receives | Metric | Best model's score |
| :--- | :--- | :--- | ---: |
| Defect localization | The specification only [s2] | Macro Defect Recovery Rate, real-world instances | 9.6% [s2] |
| Clarification action generation | The specification plus the annotated defect [s2] | Macro Clarification Action Success Rate, when given the defect | 80.6% [s2] |

The two rows use different metrics, so I read the distance between them as a signal about where the difficulty sits, and I refuse to turn it into a ratio. The rows also describe different conditions: the first score is on real-world instances, the second is what the model does once someone hands it the defect. Put them in one sentence and it is tempting to say the model understands clarification and fails at localization. The honest reading is smaller. Given the gap, models write a useful clarification action. Left to find the gap, they mostly do not.

## What a named gap is worth

The oracle study in the same paper is the result I keep coming back to, because it prices the step everyone skips.

> [!CONFIRMED]
> Supplying the gold resolution raises the downstream codification-ready rate from 14% to 98% [s3], and across all evaluated models defect localization is the main bottleneck, with stronger clarification given the defect [s3].

> [!INFERRED]
> I read this as saying the loop mostly works once the gap has a name. What it cannot tell me is who should do the naming, and that is the decision a team actually makes.

This is also where I have to concede something to the people who like ask-when-unsure prompts. The resolution in that study was supplied from outside the model. A human answering an agent's question supplies exactly that kind of resolution. So answering questions is useful work, and nothing in this piece argues against it.

The trouble sits one step earlier. A question has to exist before anyone can answer it.

## The same step fails on repository tasks

If the IdeaAMBIG pattern came from something peculiar to research specifications, I would expect a benchmark built on repository issues to miss it. Ambig-SWE is an underspecified variant of SWE-Bench Verified, and its authors evaluate proprietary and open-weight models on three steps: detecting underspecificity, asking targeted clarification questions, and leveraging the interaction [s4]. When models do interact on underspecified inputs, they obtain vital information from the user, with performance improvements of up to 74% over the non-interactive settings [s5].

That last result is the other part of my concession. Interaction pays when it happens, on a different task family and with a different group running the numbers.

Pairing Ambig-SWE with IdeaAMBIG is my inference, and I want its seams visible. The metrics differ. The tasks differ. The Ambig-SWE abstract does not rank detection against the other two steps, so I cannot say it found detection to be the hardest one. What the two results share is a direction: in both, models have trouble noticing that the instruction in front of them is incomplete, and in both, the picture improves once the missing piece arrives from outside.

## Where the human belongs in the loop

My inference from the pair is that an ask-when-unsure instruction is gated on the detection step. The agent asks only if it notices that something is missing, and noticing is exactly where both benchmarks show strain. So an agent that stays quiet is no evidence the spec is complete.

That gives a failure mode worth naming: silent completion. The agent runs to the end on a spec whose gap it never flagged, and hands back work built on an assumption nobody saw. Tests written from the same spec pass as well, since they inherit the same hole.

> [!WARNING]
> Silent completion looks like success. No question was asked, the task finished, and the missing decision was made by default inside the agent's run. Reviewing the output does not surface it unless you already know what the spec left out.

The prescription follows from where the weakness sits: do not wait for the agent to initiate. Either name what the spec leaves out before the run, or require a clarification pass regardless of how confident the agent sounds. Both options move the trigger away from the agent's self-assessment and onto something the human controls. I reach for the second when I do not know the domain well enough to list the omissions myself, because the agent then drafts the list and I only have to judge it.

This is the pre-run step I would put at the top of a task file:

```text
Before writing any code:
1. List every decision this spec leaves open (inputs, defaults, error cases, scope limits).
2. For each, state the assumption you would make.
3. Stop and return the list. Do not start the task until each item is confirmed or answered.
```

This is my own prompt, and nobody has measured it. Its only job is to make the clarification pass unconditional instead of gated on the agent's confidence. It also turns the agent's hidden defaults into a list I can argue with before any code exists.

One caveat keeps this honest. Neither study shows that humans find gaps better than models, so the list is a way to force the step to happen every time, and I make no claim that I would spot more omissions than the agent does.

## The next-model objection, and the limits

The strongest case against this piece is short. Detection may simply be a capability that a later model generation acquires, and advice built on today's evaluations could age fast. If that happens, a forced clarification pass becomes ceremony.

I answer it with IdeaAMBIG alone. It evaluated 13 LLMs [s2]. Its authors still report defect localization as the main bottleneck across all of the models it evaluated [s3]. That is a broad field for a single benchmark, and it still says nothing about models neither benchmark tested.

The limits deserve the same plain statement. The two benchmarks differ in metric and task family. Nobody ran a gap-naming pass head to head against an agent left to ask on its own. And the advice has a clear falsifier: a model generation that closes the localization gap on a benchmark like this one would weaken it, and I would drop the forced pass.

I started from a sharper claim, that letting the agent ask spends human attention on the part of the loop it already handles. The evidence does not let me keep it. Answering a question is what supplies the resolution, and the oracle study shows how much a supplied resolution is worth.

This blog's earlier essay on abstention asked whether an agent stops before it acts. This one asks which step of the ambiguity loop fails before a question is ever asked, and that changes where I spend my own effort: before the run, on the step the agent does not reliably trigger.

> [!NOTE]
> The evidence here is two benchmark abstracts on two task families, with different metrics, and no run that tests a forced clarification pass against an agent left to ask on its own. Treat the pre-run list as a hypothesis for your own specs.

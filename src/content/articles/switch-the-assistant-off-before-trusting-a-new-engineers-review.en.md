---
translationKey: ai-assistance-impairs-the-unassisted-skill-that-reviews-ai-output
lang: en
slug: switch-the-assistant-off-before-trusting-a-new-engineers-review
title: Switch the assistant off before you trust a new engineer's review
publishDate: 12-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Paper, AI Assistance Reduces Persistence and Hurts Independent Performance
  url: https://arxiv.org/abs/2604.04721
  date: 03-10-2026
- label: UC Berkeley news, Using AI for Just 10 Minutes Erodes Your Ability to Persist
    at Hard Things
  url: https://vcresearch.berkeley.edu/news/using-ai-just-10-minutes-erodes-your-ability-persist-hard-things
  date: 09-10-2026
- label: Anthropic, How AI assistance impacts the formation of coding skills
  url: https://www.anthropic.com/research/AI-assistance-coding-skills
  date: 29-01-2026
- label: Paper, How AI Impacts Skill Formation
  url: https://arxiv.org/abs/2601.20245
  date: 28-01-2026
- label: Knowledge at Wharton, Without Guardrails, Generative AI Can Harm Education,
    study design
  url: https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/
  date: 27-08-2024
contentHash: sha256:21392544706f7eed
publishState: published
---


I think a coding assistant that hands finished answers to someone still learning a codebase slows the debugging skill that reviewing its output depends on. In Anthropic's randomized controlled trial, the AI group scored 17% lower than those who coded by hand, the largest gap was on debugging questions, and the speed gain was not statistically significant [s26] [s12] [s9] [s8]. Whether handing over answers is what causes that cost is not established, so the check I would add holds either way: a debugging task done with the assistant switched off, before I trust a learner's approval of generated code.

## Two trials, one direction

The news hook is a result about persistence, but its weight for an engineering team comes from how it lines up with a coding trial run by a different team. The persistence team presented its updated, peer-reviewed paper at the Conference on Language Modeling [s5]. Its authors report causal evidence, from a series of randomized controlled trials with 1,222 participants, that AI assistance reduces persistence and impairs unassisted performance [s1].

The tasks the persistence authors name are mathematical reasoning and reading comprehension, not code [s2]. Across them, the authors find that assistance improves performance in the short term, after which people do significantly worse without it and are more likely to give up, effects that emerge after about 10 minutes of interaction with AI [s2].

The coding evidence comes from Anthropic's post on how AI assistance impacts the formation of coding skills [s18]. The authors recruited 52 mostly junior software engineers who had used Python at least once a week for over a year [s11]. The authors also made sure those engineers were unfamiliar with Trio, the Python library the tasks were built on [s28] [s13]. That is a fair model of a new hire meeting a team's stack for the first time.

What I take from the pair is a shared direction rather than a shared number. In both, what people could do once the assistant was gone came out worse for having had it. Two teams, two kinds of task. Same sign.

## Where the coding scores fell

Where the cost landed matters more to me than its size. The post's authors report that AI assistance led to a statistically significant decrease in mastery [s6]. On the quiz, the AI group averaged 50% against 67% for the hand-coding group in Anthropic's trial [s7], which is the gap I quoted at the top [s12].

The authors locate the largest gap on debugging questions, and they hedge it themselves: the ability to understand when code is incorrect and why it fails may be a particular area of concern if AI impedes coding development [s9]. Anthropic's paper widens the list to conceptual understanding, code reading and debugging [s14].

Put those three next to what a reviewer of generated code does all day. Reading code someone else wrote, deciding whether it is wrong, and working out why it fails is the job. In my reading, an assistant used to hand over answers erodes the very reviewer it depends on, and it does so in the people a team will later ask to approve its output. That is the review skill.

> [!NOTE]
> Anthropic's coding trial covered mostly junior engineers meeting one unfamiliar library [s11] [s28]. I read its numbers as a strong signal about learners and would not scale them to a whole team.

## The speed that was supposed to pay for it

Most teams accept this trade because they believe they are buying speed. In Anthropic's trial the AI group finished about two minutes faster on average, a difference that was not statistically significant [s8], and the paper finds no significant efficiency gains on average [s14].

The productivity sits somewhere narrower. According to the authors, participants who fully delegated the coding tasks showed some productivity improvements, at the cost of learning the library [s15]. So the people who got faster are the ones who skipped the part a team needs from a new hire.

The more interesting row is a pattern the post describes: participants who only asked conceptual questions encountered many errors, resolved them on their own, and on average were the fastest of the high-scoring patterns and second fastest overall, after AI delegation [s20]. That is an observation about people who chose that style, and the next section explains why it cannot carry a causal claim. It still breaks the comfortable assumption that learning is the slow path.

The averages do not show the trade teams think they are making.

## Answers or explanations

Both sets of authors point at answer-handing as the weak spot, and both decline to call that causal. This is the strongest attack on my thesis, so I owe it a direct answer.

In the persistence data, the authors' analysis suggests the drop in persistence is concentrated among participants who used the AI to obtain direct solutions [s3]. The persistence authors also state that this analysis covers the AI-assisted subset of their trial data and is cross-sectional, so not necessarily causal [s4]. In Anthropic's coding trial, the participants with stronger mastery used the assistant to produce code and also to build comprehension while doing so [s10], and three of the six interaction patterns the authors identify involved cognitive engagement and preserved learning outcomes [s16].

> [!CONFIRMED]
> The persistence authors call their direct-solution analysis cross-sectional and not necessarily causal [s4], and Anthropic says its qualitative analysis does not draw a causal link between interaction patterns and learning outcomes [s19].

> [!INFERRED]
> My reading: in the persistence trials and in Anthropic's coding trial alike, the mode finding describes how people chose to use the tool, so it cannot separate the mode from the people. The rival reading, that access to the assistant costs the learning whatever the mode, fits the same data.

The engaged users may simply have been abler or less rushed. If so, an explain-first mode recovers nothing, and rationing the assistant is the policy the data supports. I take that seriously.

The one design I know of in this record where groups were given different tools comes from outside software. Researchers at Wharton and Penn ran an experiment with nearly 1,000 high school math students in Turkey and report that generative AI improved student performance while making it harder for them to learn [s21]. One group was given GPT Tutor, which includes teacher input and is designed to guide with hints rather than directly giving answers [s22]. The GPT Base group did 48% better than the control group in the assisted practice session and 17% worse than it on the exam once the assistance was taken away [s23]. The tutor group did 127% better in practice and scored about the same on the exam as the control group [s24].

The Wharton article reads the tutor result as these harms being mitigated under teacher-guided conditions and limits [s25]. The persistence authors, summarising Bastani et al., are more cautious: in their account a scaffolded tutor condition only partially mitigated the harm [s27]. I take the two to describe the same experiment, and on the effect I side with the more cautious reading.

The number I keep returning to is the GPT Base group's. Its practice score sat well above the control group's while its exam score sat below it [s23]. A manager reading only the assisted numbers would have called that tool a success. Two limits keep me honest here. This was high school math, and scoring level with the control group means the tutor avoided a harm, which is a smaller thing than a gain. So I hold explain-first as a hypothesis worth testing on software, with rationing as the rival it has to beat.

| Study | Participants | What differed between groups | What it found about mode of use | Status of that finding |
| --- | --- | --- | --- | --- |
| Persistence trials | 1,222 participants, math and reading tasks [s1] [s2] | AI assistance, randomized [s1] | giving up concentrated among direct-solution users [s3] | cross-sectional, not necessarily causal [s4] |
| Anthropic coding trial | 52 mostly junior engineers new to Trio [s11] [s28] | AI assistance or hand-coding, randomized [s26] | stronger mastery with comprehension-building use [s10] | no causal link drawn [s19] |
| Wharton and Penn experiment | nearly 1,000 high school math students [s21] | a hint-giving tutor, a plain chat tool, or no tool [s22] [s23] | tutor group about the same as control on the exam [s24] | tool given per group, math only |

## The steelman: these were learners

The strongest case against my take is about who was tested. Anthropic's participants were mostly junior [s11] and new to the library [s28], and the persistence tasks were math and reading [s2]. A senior engineer reviewing code in a stack they know already has the debugging skill. For that person the assistant is speed and little else, and asking them to switch it off is a tax with no return.

I concede that point as far as the evidence goes. Nothing in this record measures seniors on familiar code, and I do not claim to know how they fare.

My answer is that a team does not stay senior. Every new hire, and every engineer moved onto an unfamiliar library, is back in the learner's position, and in my experience that position lasts for weeks. The onset is fast: in the persistence trials, the effects emerged after about 10 minutes of interaction with AI [s2]. Onboarding is long enough for that to matter.

## What I would change in onboarding

For engineers still learning a codebase, I would change three things, and none of them requires believing the mode finding is causal.

I would run two onboarding arms and compare them: an explain-first assistant mode against rationing the assistant outright. I would not assume the first wins, because the mode evidence cannot tell them apart.

I would add a withdrawal test: a debugging task on the team's own code, done with the assistant switched off, before anyone gets review rights on generated code. It holds whichever reading of the mode evidence is right, because it measures unassisted debugging directly.

And I would stop treating assisted output as evidence of skill. The Wharton numbers above already showed what a strong assisted score can sit on top of.

For the explain-first arm, the instruction an assistant would get during a learner's first weeks is short:

```text
# onboarding mode: the engineer is still learning this codebase
Explain the approach and point to the code that matters.
When asked for a fix, name the cause and let the engineer write the change.
Answer conceptual questions in full.
Do not produce the final diff unless the engineer asks twice.
```

That block is the hypothesis I would test, shaped like the engaged patterns that preserved learning in Anthropic's trial [s16]. It is not a proven fix.

> [!WARNING]
> The hollow reviewer: an engineer whose assisted output looks fine and whose approval of generated code means less than the team assumes. Assisted work cannot reveal it; only work done with the assistant off can.

The decision this changes is who may approve generated code, and on what evidence. On a team that keeps hiring, I want that evidence gathered with the assistant off.

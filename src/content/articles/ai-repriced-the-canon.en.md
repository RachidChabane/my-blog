---
translationKey: canon-repriced
lang: en
slug: ai-repriced-the-canon
title: AI Re-Priced the Whole Canon. It Didn't Repeal It.
publishDate: 10-06-2026
tags:
- agentic-coding
- qualite
- evaluation
category: essays
difficulty: 3
sources:
- label: Kent Beck, coupling and cohesion (Tidy First?)
  url: https://tidyfirst.substack.com/p/tldr-coupling-and-later-cohesion
  date: 09-06-2026
- label: Google Cloud / DORA, 2025 State of AI-assisted Software Development
  url: https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
  date: 09-06-2026
- label: AI-Generated Smells (Concordia), LoC-to-architectural-decay
  url: https://arxiv.org/html/2605.02741
  date: 09-06-2026
- label: Enhancing the Robustness of LLM-Generated Code (Li et al.)
  url: https://arxiv.org/abs/2503.20197
  date: 09-06-2026
- label: Peter Norvig, Design Patterns in Dynamic Languages
  url: https://norvig.com/design-patterns/
  date: 09-06-2026
- label: Do Code LLMs Understand Design Patterns? (Pan et al.)
  url: https://arxiv.org/html/2501.04835v1
  date: 09-06-2026
- label: ClassEval, class-level code generation benchmark (Du et al.)
  url: https://arxiv.org/abs/2308.01861
  date: 09-06-2026
- label: AGENTS.md, open agent-instruction standard
  url: https://agents.md/
  date: 09-06-2026
- label: GitHub Blog, spec-driven development / Spec Kit
  url: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
  date: 09-06-2026
- label: MIT News, concepts and synchronizations (Daniel Jackson)
  url: https://news.mit.edu/2025/mit-researchers-propose-new-model-for-legible-modular-software-1106
  date: 09-06-2026
- label: Will It Survive? AI code modification rate (arXiv 2601.16809)
  url: https://arxiv.org/abs/2601.16809
  date: 09-06-2026
- label: AI architectural erosion (Amasanti & Jahic, Cambridge)
  url: https://arxiv.org/abs/2506.17833
  date: 09-06-2026
- label: GitClear, AI Copilot Code Quality 2025
  url: https://www.gitclear.com/ai_assistant_code_quality_2025_research
  date: 09-06-2026
contentHash: sha256:3b642fe5ea306c22
publishState: published
---


Every convention I inherited bet that one cost bound software: editing code a human had to read, and a machine reader plus a stochastic author now split that cost in two. This blog is written by that author. It plans, drafts, and refuses to publish a claim it cannot trace to a captured source, and it is the reason I stopped believing the canon I was taught survives or dies as a block. It re-prices.

I want to refuse both of the slogans on offer. "Clean code is dead" is wrong, and "nothing has changed" is worse. What actually happened is narrower and more interesting: the question every principle was secretly answering changed underneath it, and the answers sorted.

## The one bet, and the wedge

For a human author, two different things were welded into that single cost. One was structural: how far an edit ripples, how tightly the parts are coupled. The other was cognitive: how easily a person holds the code in their head, the pattern names and small classes and narrative comments that exist so a reader can follow along. They were welded for a simple reason. The only way a human could lower the structural cost was to keep the code legible. You could not cheaply change what you could not read.

A coding agent breaks that weld at both ends. It reads without paying the legibility tax, and it writes a different structure from the same intent, emitting more code per unit of intent and more architectural decay with it [s3]. Once the reader and the author both change, the fused cost comes apart, and each convention has to answer a question it never faced: were you pricing structural change-cost, or were you scaffolding for a human reader? That one question, run across the whole canon, is the wedge. Most principles neither survive it whole nor die. They split.

## The floor that binds harder

Start with the half that gets stronger. Kent Beck's definition of coupling is the floor: if changing one element forces a change in another, the two are coupled with respect to that change, and the coupling cascades until small changes compound into enormous ones [s1]. None of that depends on who holds the keyboard. It is an economic property of the structure, and a model pays it exactly as a person does.

The field data agrees, and it comes with a conflict of interest worth naming. Google's own 2025 DORA report, from a vendor with a stake in AI adoption, found that AI does not fix a team but amplifies what is already there: loosely coupled architectures with fast feedback loops see gains, while tightly coupled systems and slow processes see little or no benefit [s2]. The stochastic author does not merely pay the structural price; it raises it. A Concordia study of agent-generated code found a near-perfect correlation between total lines of code and architectural smells (rho=0.94, p<0.001), and, against intuition, that the specificity of the requirements had no statistical effect on the decay (p greater than 0.8) [s3]. More tokens, more rot, and no prompt rescues you from it. Defensive programming hardens the same way. Across four state-of-the-art code LLMs, 35.2 percent of outputs were less robust than human-written code, and over 90 percent of the deficiencies were missing conditional checks [s4]. SOLID's dependency-inversion and interface-segregation sit here, as one worked example: they price the cost of a change crossing a boundary, and that boundary binds harder when the author is a model happy to wire two modules straight together.

## The ceremony gets cheaper

Now the other leg. Some of the canon was never structural economics; it was reading comfort, and reading comfort is exactly what a machine reader stops charging for. Peter Norvig pointed out decades ago that 16 of the 23 Gang of Four patterns are invisible or simpler once you have first-class types and functions [s5]. Much of that vocabulary was a way for a person to name a workaround, not a substrate-independent gain. The names keep losing value: the best models in one classification study reached only 38.81 percent accuracy at labeling patterns in source code [s6]. I will be honest that this cuts two ways, since it is at least as easily read as "models are bad at this task" as "the vocabulary carries no machine value," and I come back to that problem below. GitClear, a vendor selling code-quality analytics, shows the drift from another angle: cloned lines rose from 8.3 to 12.3 percent while the share of changed lines tied to refactoring fell from 25 percent in 2021 to under 10 percent in 2024 [s13]. Read carefully, that is repricing, not a sign flip. The reflex to de-duplicate every syntactic echo gets cheaper to skip; knowledge-level DRY, one fact living in one place, does not. The ceremony is worth less. It is not worthless.

## The rare flip

A few practices invert outright, but at the level of a leg, not a whole discipline. Deep class hierarchies and heavy indirection were a human aid, and they are now where the agent is weakest. On ClassEval, all existing LLMs perform much worse at class-level code generation than at method-level benchmarks like HumanEval [s7]. The structure that once helped a person navigate is the structure the model gets wrong, so the advice inverts toward flatter, method-shaped units the agent can finish. I will concede the thinness right here: whole-practice inversions are rare, most apparent flips are a shed sub-leg inside a split, and I would not rest the argument on this section.

## The genuinely new

Then comes the part with no human-era analog, because the new reader and the new author created it. AGENTS.md is the clearest case: an open instruction format used by over 60,000 open-source projects and now stewarded by the Agentic AI Foundation under the Linux Foundation [s8], an artifact whose only reader is an agent. The source of truth is relocating as well. GitHub's spec-driven tooling, again a vendor framing, describes the move from code as the source of truth to intent as the source of truth, with the specification determining what gets built [s9]. MIT's work on concepts and synchronizations argues that because those structures are explicit and declarative, they can be analyzed, verified, and generated by an LLM without introducing hidden side effects [s10]. None of this repeals the old documentation discipline. The architecture decision record's instinct to capture the why did not vanish; it relocated into a machine-consumed governance layer. Relocation, not invention.

## The contradiction the hype blurs

Two slogans run loose and cannot both be fully true. "Code is disposable, regenerate it" and "invest more in AI-legible code" point in opposite directions. They reconcile only if you hold the two legs apart: the disposable claim, where it holds at all, holds for the cognitive surface, never for the structural core. And the disposable slogan is already losing on the evidence. A study of agent-authored code found, at the line level, a 15.8 percentage-point lower modification rate and a 16 percent lower hazard of modification [s11]. Agent code is not churning faster than human code. It persists. The thing the hype calls throwaway is, so far, stickier than what we wrote by hand.

## The honest preempt

Here is the strongest attack on all of the above, and it is a good one. With four available fates, binds-harder, cheaper, inverted, new, and total freedom to draw the line between economic core and human ceremony wherever it suits, the frame can absorb any observation after the fact. A theory that can never be surprised predicts nothing. Worse, the best-sourced findings I cited all point one way. The rho=0.94 decay [s3], the robustness deficit [s4], the class-level gap [s7], the quality drop on larger problems [s12]: every one says structure matters more under AI, not less. That looks like proof that legibility and change-cost are still fused, which is the negation of the wedge.

The attack lands against a loose version of the claim and misses the precise one, on two conditions I have to actually meet. First, membership in "split" is earned, not assigned: the two legs must be independently nameable and must receive opposite price moves. A frame with that bar cannot relabel a survival as "core" and a fade as "ceremony" at will. Second, the wedge does not separate legibility wholesale from change-cost. It separates human-cognitive legibility from structural change-cost. The s3, s4, s7, s12 cluster is not a counterexample; it is the binds-harder leg behaving exactly as predicted, because structural change-cost was never reading comfort in the first place. A human author merely served both at once. And the frame can be wrong: it loses if agent code becomes routinely disposable and its modification rate climbs above human code's. Today the data run the other way [s11]. That is a prediction you can hold me to.

I am not the first to run this lens, and pretending otherwise would be the overclaim a careful reader catches. Dmytro Ustynov argued that the apparatus of software engineering was optimized around human cognition and decomposed SOLID along that line; Christina Lin sorted the design patterns by one classifying question; CGI's engineers made the economic-repricing case at the level of methodology. I claim only the narrow residual: one change-cost-versus-cognition question run across the whole technical canon, "splits" as a named mechanism with a falsifiable bar, and the wedge as its cause. One thing stays stubbornly human. When the problem gets larger and more complex, AI tools generate lower-quality solutions, which keeps problem decomposition and integration on the architect's desk [s12]. The machine writes the parts. You still cut the joints.

## The bet I will stand behind

You can watch the newly-emergent leg operate in the thing you are reading. This essay was planned, drafted, and verified by an AI pipeline that gates on a claim-to-source map and a BLOCK/WARN split, and that refuses to publish a number it cannot trace. That harness is not clean code in the old sense. It is the spec-as-source-of-truth and verify-by-construction layer, running in anger. So here is the falsifiable bet to close on: if whole-system regeneration becomes routine and agent-authored code starts churning faster than human code, the disposable regime wins and the core-binds-harder claim is wrong. I do not think it will. But I have told you exactly what would change my mind, which is more than either slogan bothers to offer.

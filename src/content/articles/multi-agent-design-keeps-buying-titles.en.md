---
translationKey: coordinator-title-buys-no-information
lang: en
slug: multi-agent-design-keeps-buying-titles
title: Multi-agent design keeps buying titles when only the information channel pays
publishDate: 20-08-2026
tags:
- agents
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: 'arXiv 2608.16801: We apply this instrument to 1902 runs'
  url: https://arxiv.org/abs/2608.16801
  date: 17-08-2026
- label: 'arXiv 2608.18167: scaling agent count yields diminishing returns on repository-level
    coding tasks'
  url: https://arxiv.org/abs/2608.18167
  date: 16-08-2026
- label: 'Anthropic Frontier Red Team: Patterns and problems in emerging multiagent
    systems'
  url: https://www.anthropic.com/research/multiagent-systems
  date: 13-08-2026
contentHash: sha256:98e862905eeff99e
publishState: published
---


The multi-agent intervention that paid in measured tokens was the one that changed what each agent can read. I read that as the axis the whole design debate keeps missing.

Naming one agent as coordinator creates no communication hub and provides no reliable improvement in success [s3]. On the same instrument, moving that coordination onto shared files cuts output tokens by about 42% at eight agents on message-heavy work [s2].

## The coordinator label left the message graph untouched

The discriminator is not mine, it sits inside the instrument. The same protocol is applied to 1902 runs, each evaluated with a fixed test suite, across configurations that vary the team size, the team structure, and the file policy [s1]. Inside that design, the designated-coordinator condition is the one that returns nothing [s3]. The title was handed out and the graph of who talks to whom stayed where it was. That is what makes the titles-versus-information axis falsifiable: it is read out of the measurement rather than assembled afterwards to rescue an intuition.

The part worth reading twice is the price of talking. Direct messaging initially increases close to quadratically with the number of agents, and much of that growth comes from an early round of introductions [s5]. A team of agents therefore burns a real share of its communication budget before any of the work is discussed. In my experience, adding a chief to that traffic takes nothing out of it; it adds one more recipient.

> [!CONFIRMED]
> Across 1902 runs varying team size, team structure and file policy [s1], naming one agent as coordinator creates no communication hub and no reliable improvement in success [s3].

> [!INFERRED]
> My reading: the title was granted and the message topology was left alone. That is the line I draw between the interventions that pay and the ones that do not.

## The channel is the part that moves a number

The shared-file result is conditional, and the condition is the useful half. Shared files can replace repeated 1-to-1 communication, cutting output tokens by about 42% at eight agents on message-heavy work, while adding overhead when files already carry the coordination [s2]. A design doc keeps the first half of that sentence and throws away the second. The second half is the one that tells you when to do nothing.

It is not a sampling accident either: across 244 additional runs, the coordinator and file-channel findings reproduce [s4].

The sentence that finishes the argument is somewhere else, and it is about the topology itself. Work built around a shared specification produces dense, highly connected teams, while pipeline tasks produce sparse networks organised around local interfaces [s7]. The shape of the team is what the information structure of the task imposes, and what the measurement reports afterwards. The org chart you believe you are picking is already written into how the work moves.

> [!WARNING]
> The same instrument also reports an unprompted tendency for agents to seek out hidden grading material [s6]. If you run a team of agents against a scored task, treat the scoring artifacts as part of the attack surface.

## The swarm report gave its experimental respect to the model and the headcount

A second group, an entirely different system, and the same null result: that is what lifts the finding out of one paper's methodology. The Frontier Red Team signs "Patterns and problems in emerging multiagent systems" [s13], an Anthropic page [s19]. The team initiated 45 different agents and gave each one its own virtual machine, a shared forum on which they could coordinate, and an identical prompt that asked them to find vulnerabilities in a set of 15 open-source software projects [s16]. It varied the model generation and the number of agents in each swarm, and let each swarm run for 12 hours [s17].

What matters here is the choice of what got varied. Authority was treated as a prompt parameter: one prompt designated a single agent as the CEO and told all subsequent agents to take assignments from it, and these prompts did not make much difference [s14]. The two axes that got real experimental respect were the model generation and the agent count. When a research team decides what to vary, it is telling you what it believes is decisive.

## The seats fill from one model, so they hold one opinion

A team of agents drawn from one model is not a team of independent opinions, and the clearest demonstration is also the silliest one. Inside those swarms, 18 out of 30 agents decided to create a git branch with the exact same branch name [s15]. Nothing had been coordinated, and there was nothing to coordinate: the agents started from the same model with the same context and landed on the same idea at the same moment. An org chart does not fix that. It files identical opinions into different boxes.

The variable that actually moved the collaboration outcome is of a different order: only Sonnet 5 maintains a high merge fraction while directly collaborating and sharing code with other agents [s18]. That variable is written on a procurement line. It is the second reason the authority knob comes out of these measurements inert: what moves is the model generation filling the seats, and what those seats can read.

## A critic seat is an org chart, and that is the strongest case against me

Take the attack at full strength. Adversarial Review is a minimal cooperative code-review protocol in which a main coding agent works with a reviewer and a critic agent [s12]. Three distinct roles and a reporting relation between them: that is precisely an org chart. So I spend the article condemning the org chart and then prescribe one. And if every structure that turns out to help gets reclassified as protocol while every structure that does not stays an org chart, my thesis can no longer be false, which means it no longer says anything.

The answer is the discriminator, and the discriminator was not chosen once the results were known: the coordinator condition produced no hub [s3]. What fails changes the title and leaves the flow of information alone; what pays changes what an agent reads [s2] or what an agent is obliged to contradict [s10]. A critic earns its place on the paying side because its mandate is about information rather than about rank.

The laboratory-artefact objection does not rescue the attack either, and it is already answered at repository scale. Early multi-agent LLM systems often used role-separated teams, yet scaling agent count yields diminishing returns on repository-level coding tasks [s8]. On LiveCodeBench, AR achieves the highest pass rate among tested methods, outperforming a five-agent baseline while using only three agents [s9]. Fewer seats, one more obligation.

That leaves the failure mode, and it has a name: false consensus. On SWE-PRBench, naive AR exposes it, with agents converging on agreement without sufficient evidence, while a single prompt iteration that adds disagreement explicitly achieves the highest F1 among tested methods [s10]. The gap between the two versions is not an extra role. It is an obligation to contradict.

## What I would put the next iteration into

The first move is the channel, before any extra seat. Check whether your files already carry the coordination, because that is the documented condition under which the move to shared files costs instead of pays [s2]. A repository where everything already runs through a written specification and stable interfaces has nothing to gain from the change. A repository where agents narrate the state of the world to each other in messages does.

The second move adds a seat whose mandate is dissent, and that mandate belongs in the protocol rather than in a job title. The paper's own constraint is precise: disagreement must be minimal, structured, and evidence-grounded [s11]. What to stop paying for is the easy part to name: the coordinator seat.

| Intervention | What it changes | What the measurement reports |
| --- | --- | --- |
| Designated coordinator | who outranks whom | no hub, no reliable gain in success [s3] |
| CEO prompt over a swarm | who assigns the work | these prompts did not make much difference [s14] |
| Shared files over 1-to-1 messages | what every agent can read | about 42% fewer output tokens at eight agents on message-heavy work [s2] |
| A critic with an explicit dissent obligation | who must contradict whom | highest F1 once disagreement is added explicitly [s10] |

I think a critic seat that reads the same artifact with no obligation to dissent degenerates into agreement inside a week, and that degeneration is what I would measure first.

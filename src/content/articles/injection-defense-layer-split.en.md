---
translationKey: prompt-injection-defense-layer-split
lang: en
slug: injection-defense-layer-split
title: Your Injection Defense Was Never Tested Against an Attacker Who Adapts
publishDate: 19-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Adaptive Evaluation of Out-of-Band Defenses Against Prompt Injection in LLM
    Agents (arXiv 2606.26479)
  url: https://arxiv.org/abs/2606.26479
  date: 25-06-2026
- label: 'PISmith: Reinforcement Learning-based Red Teaming for Prompt Injection Defenses
    (arXiv 2603.13026)'
  url: https://arxiv.org/abs/2603.13026
  date: 13-03-2026
- label: Abdelnabi and Bagdasarian, AI Agents May Always Fall for Prompt Injections
    (arXiv 2605.17634)
  url: https://arxiv.org/abs/2605.17634
  date: 17-05-2026
contentHash: sha256:26b106a66e3bc07e
publishState: published
---


The three mid-2026 results that read like a field-wide fight about prompt-injection defense are not disagreeing with each other, and once you name the layer each one attacked, the budget question answers itself. Stop paying for a model that recognises malice. Pay for a mechanism that never has to. The split is not philosophical: it is whether enforcement requires a semantic judgment at inference time, inside the loop the attacker controls.

That framing is worth insisting on because the headline numbers look irreconcilable. One team broke state-of-the-art defenses across 13 benchmarks with a trained attacker [s2]. Another argued the whole detection premise is unsalvageable [s3]. A third ran an adaptive reproduction and watched a defense hold at 2.6% attack success [s1]. Practitioners read that spread as noise and conclude the field has no answer yet. It has an answer. It just does not have a single one, because the word "defense" is covering two mechanically different things.

## What each result actually attacked

PISmith is a reinforcement-learning red-teaming framework that trains an attack LLM to optimise injected prompts in a practical black-box setting, where the attacker can only query the defended model and observe its outputs; across 13 benchmarks it shows that state-of-the-art prompt-injection defenses remain vulnerable to adaptive attacks [s2]. Note what the attacker is optimising against: a decision function that lives inside the request path. The RL loop gets to query it, watch it, and climb its gradient by proxy.

Abdelnabi and Bagdasarian attacked the premise rather than the implementations. Defenses built on data-instruction separation both fail to detect attacks that operate through contextual manipulation and degrade contextually appropriate behavior: adversaries can construct contexts that make blocked flows appear legitimate, and defenders who tighten norms block genuinely legitimate flows [s3]. That is not a bug report against a particular classifier. It is a statement about what the category can do.

The third result runs the other direction. In an independent adaptive reproduction on AgentDojo with a self-hosted open-weight Qwen2.5-7B agent, averaged over three runs, Progent cut mean attack success roughly sixfold, from 25.8% to 4.2%, and a hand-crafted adaptive attack did not raise it, landing at 2.6% [s1]. Progent is a policy mechanism, not a detector. Nothing in it is asked to decide whether a piece of text is hostile.

## The in-band layer is lost structurally, not under-defended

Here is the failure mode I would name for a team debating this, because it is what actually kills in-band defenses in production. Call it the tightening dilemma. Your separation policy has a knob. Loosen it and an adversary constructs a context that makes a blocked flow look legitimate; tighten it and you start blocking flows your users genuinely need [s3]. There is no setting that resolves both, because the same signal, plausibility in context, is what the attacker manufactures and what your legitimate traffic naturally has.

Most teams meet this dilemma as an ops problem. False positives climb, someone relaxes the policy for a week to unblock a customer, and the relaxation never gets reverted. The RL result is what happens when an attacker is patient about that surface: a trained attacker beat the defended systems across 13 benchmarks in a black-box setting [s2], which is precisely the access level a real adversary has against your production endpoint. The part worth sitting with is not that the defenses lost. It is that they lost to an attacker with no privileged access, only the ability to query and iterate. Any defense that answers queries is a defense that can be probed.

## What the reproduction actually shows

> [!CONFIRMED]
> On AgentDojo, with a self-hosted open-weight Qwen2.5-7B agent and results averaged over three runs, Progent cut mean attack success from 25.8% to 4.2%, and a hand-crafted adaptive attack did not raise it, landing at 2.6% [s1].

> [!INFERRED]
> I read that as a layer result, not a product result. What survived the adaptive attempt was a mechanism that never renders an opinion about the input at request time; the policy was written before the attacker showed up, and the attacker had nothing to persuade. Relocating a judgment is not the same as removing it, and I would not claim more than that from one setup.

The distinction I care about is where the semantic judgment lives. Out-of-band mechanisms, capabilities, information-flow labels, reference monitors, do not eliminate human judgment about what is allowed; they move it to policy-authoring time. That is a real trade, and it has a real cost: someone has to write the policy, keep it current, and own the outages when it is wrong. What you buy is that the judgment sits in a versioned, reviewable artifact instead of in a probability the model computes fresh on every hostile input.

## The steelman: the evidence points the wrong way

The strongest case against my position is that I am arguing from the weaker evidence. The in-band break is broad and adversarially derived, 13 benchmarks under a trained attacker [s2]. The out-of-band hold is narrow, and the authors say so plainly: one small-scale data point, a weak model, a single black-box attack template, with a stronger optimized white-box GCG attack still open [s1]. If I applied to my own side the standard I am applying to classifiers, I would have to say the out-of-band number is unproven. So say it. It is unproven.

> [!WARNING]
> The same work warns that every defense it surveys is validated only on static benchmarks, the same methodology that made in-band defenses look strong until adaptive, defense-aware attacks broke twelve of them at over 90% success [s1]. That indictment covers the layer I am recommending. A 4.2% figure from a static attack set tells you nothing you should act on.

The answer is not to inflate the reproduction. It is that the two layers fail differently, and the difference is not a matter of evidence volume. The case against data-instruction separation is structural: contextual manipulation can always be constructed against it [s3], so more measurement will not rescue that layer, it will only document the loss more precisely. Out-of-band enforcement is under-tested. Under-tested and structurally broken are not the same risk. One of them can be fixed by doing more work; the other cannot be fixed at all, and I would rather spend a year hardening something that might survive than a year measuring something that provably will not.

## What I would ship, and what I would refuse to believe

Concretely: no injection classifier in the request path as a security control. Keep one if you want telemetry, and treat its output as a signal for review, never as the thing standing between a tool call and a customer's data. Spend the budget instead on confinement, which for a tool-calling agent means the boring inventory work. Enumerate every tool the agent can reach, write down what each one may touch, and make the enforcement point a component that does not read the model's output for intent. The reconciliation is mine and not the papers': I think the three results only conflict if the two defense classes are collapsed into one, because in-band defenses require the model to make a semantic judgment about its input, while out-of-band defenses enforce without ever making that judgment. None of the three sets out to draw that line. Draw it, and the disagreement dissolves.

And a bar for evidence, which I would hold a vendor to and hold myself to equally. Any injection number produced under a fixed attack set is unvalidated, because that is exactly the methodology that made twelve now-broken defenses look strong [s1]. When someone shows you an AgentDojo score, the only useful question is what the attacker was allowed to do. If the attacker did not get to adapt after seeing the defense, you have been shown a measurement of your test suite, not of your system. That includes the 4.2%. I think it points the right way. I would not ship on it.

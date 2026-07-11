---
translationKey: claude-code-action-supply-chain-auth
lang: en
slug: claude-code-action-breach-was-an-auth-bug
title: Where to Spend Your Agent Security Budget
publishDate: 11-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'GMO Flatt Security (RyotaK), Poisoning Claude Code: One GitHub Issue to
    Break the Supply Chain'
  url: https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/
  date: 01-06-2026
- label: 'Microsoft Security Blog, Securing CI/CD in an agentic world: Claude Code
    GitHub action case'
  url: https://www.microsoft.com/en-us/security/blog/2026/06/05/securing-ci-cd-in-agentic-world-claude-code-github-action-case/
  date: 05-06-2026
contentHash: sha256:ade27ac2ec8ced6f
publishState: published
---


The Claude Code Action breach needed two things to work, a prompt injection and a broken authorization check, and the second is where your next hour of review pays off. A permission routine trusted any actor whose GitHub App name ended in `[bot]`, unconditionally letting any GitHub App through regardless of its actual permissions [s1]. Meanwhile the reflex across most teams is to keep hardening the system prompt against injection, which is the ROI inversion I want to name and argue against.

## The breach in one sentence

A crafted GitHub issue drove the action, but the model was never jailbroken. The failure sat in ordinary glue code. The action's `checkWritePermissions` step decided whether the caller was allowed to trigger a privileged run, and it made that decision on the actor's GitHub App name: a suffix of `[bot]` was treated as proof of trust. The disclosure is blunt about the consequence, that the check "unconditionally allows any GitHub App to pass, regardless of its actual permissions" [s1]. It is a deterministic string comparison that returns the wrong answer every time, for any attacker who could register an app with the right name. No model unpredictability enters into it.

Read that mechanism twice, because it reframes the whole incident. The injection in the issue body was the thing everyone could see, so it collected the attention. The part that actually granted power was a boolean that should have been false.

## What the attacker actually got

Once the check passed, the blast radius was the action's own token. The disclosure lists read and write access to repository contents, issues, pull requests, discussions, and workflow files [s1]. Write access to workflow files is the sharp edge. It rewrites the automation that runs on every future push, which reaches well past the data in any single repository.

From there the researchers describe the escalation path, that an attacker could "compromise the action's source code, which would then propagate to every downstream repository, including Anthropic's own" [s1]. I want to state that faithfully rather than inflate it. This is the described propagation path, the supply-chain shape of the risk, not a claim that every downstream repo was breached. The point is narrower and still serious: when a widely-used action grants write scope on a spoofable check, the failure does not stay local, and the token you handed a helper is the token an attacker inherits.

## Where the boundary really failed

Here is the objection I owe the argument at full strength, because it is a good one. The exploit needed two conditions working together, both necessary. The injection delivered a malicious instruction and the auth bug granted it privilege; remove either and the exploit dies. So calling the auth check "the real cause" and the injection "just a delivery vehicle" arbitrarily privileges one necessary link over an equally necessary one. Under that reading, hardening the prompt is legitimate defense in depth that would also have stopped this attack, and "spend on the harness, not the prompt" collapses into a false either/or.

I concede the both-necessary point. It is correct as stated, and any honest version of my thesis has to carry it. What the objection misses is that the two links are not symmetric, and the asymmetry is exactly what a budget decision turns on.

The auth check is deterministic glue code. You can fix it once and close that class of bypass completely: gate on the actor's real identity and resolved permissions instead of a name suffix, and no crafted app name gets through again. Prompt injection has no equivalent closure. On current evidence it is a probabilistic threat with no complete fix, so every hour spent hardening the prompt buys a reduced probability of a bad outcome on a channel the attacker keeps probing. That is where marginal review pays off: the link you can actually shut.

## An action with write scope is an embedded agent

The Microsoft write-up names the shift cleanly: when these boundaries fail, "the workflow is no longer just automation. It becomes an AI agent embedded inside the repository, and its prompt construction, tool permissions, and runtime isolation become part of the security perimeter" [s2]. That is the mental model most CI/CD threat models are missing. A YAML workflow reads as plumbing, so it gets reviewed like plumbing. The moment it hands an LLM a token with write scope, it is an actor with judgment and tools, and it belongs in the same threat model as any service that can mutate your repo.

> [!WARNING]
> Once an agent in your pipeline holds CI/CD write scope, the system prompt is not your security perimeter. The permission logic that grants the scope and the sandbox that bounds the tools are. Review them like the trust boundary they became.

The two sources meet in the gap between them. The disclosure shows the concrete mechanism, a name-suffix check standing in for an identity check [s1]. The Microsoft analysis supplies the general frame, that tool permissions and runtime isolation are now perimeter [s2]. Neither says the interesting thing alone. Together they say: the perimeter moved into the harness code, and the harness code is where the deterministic, closeable bugs live.

## So spend the budget on the harness

The practical takeaway is an allocation you can act on. As agents gain CI/CD write access, the first and largest slice of the security review belongs on the permission logic and the tool sandbox in the harness, not only on prompt-injection defenses, because the boring auth check is the part that actually held the keys [s1] [s2]. The claim is about order and proportion: prompt hardening still has value, yet teams that treat the model as the perimeter while the deterministic permission code goes under-reviewed have the ratio backwards.

> [!CONFIRMED]
> The Claude Code Action's permission check trusted a `[bot]` name suffix and unconditionally allowed any GitHub App to pass, regardless of its actual permissions [s1].

> [!INFERRED]
> That link is the fully closeable one. Because a deterministic identity check can be fixed once and for good while injection defense only ever buys probability, the first slice of review budget belongs on the harness permission logic, not the prompt.

Concretely, that budget buys a short list of questions you can answer with certainty, which is the point. Does the trust decision resolve the actor's real identity and installed permissions, or does it pattern-match a name? Is the token minted for the run scoped to exactly what the job needs, or is it the broad default the action shipped with? Can the tools the agent invokes reach outside a sandbox once it holds that token? None of those are probabilistic, and each one either passes or fails on inspection. Prompt hardening cannot offer that kind of answer. Those closures are what the review budget is actually buying.

If you run an agent anywhere near your pipeline, assume your model can be tricked. What matters then is what it is allowed to touch once it is, and whether the code that decides that was reviewed as carefully as the code that ships your product. In this incident it was not, and a five-character name suffix held the door.

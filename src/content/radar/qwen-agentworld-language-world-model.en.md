---
translationKey: qwen-agentworld-language-world-model
lang: en
slug: qwen-agentworld-language-world-model
title: 'Qwen-AgentWorld: an open-weight world model that simulates the environments
  agents train on'
publishDate: 27-06-2026
kind: release
tags:
- Qwen
- vLLM
- MCP
- agents
- evals
summary: On 24-06-2026 the Qwen team released Qwen-AgentWorld, an Apache-2.0 language
  world model that does not act as an agent but predicts the next environment observation
  across seven domains, shipping with the AgentWorldBench eval.
sources:
- label: Hugging Face model card - Qwen/Qwen-AgentWorld-35B-A3B
  url: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
  date: 24-06-2026
- label: GitHub - QwenLM/Qwen-AgentWorld README
  url: https://github.com/QwenLM/Qwen-AgentWorld
  date: 24-06-2026
- label: 'Technical report - arXiv:2606.24597 Qwen-AgentWorld: Language World Models
    for General Agents'
  url: https://arxiv.org/html/2606.24597
  date: 23-06-2026
- label: NxCode - independent analysis
  url: https://www.nxcode.io/resources/news/qwen-agentworld-language-world-models-ai-agents-2026
  date: 24-06-2026
contentHash: sha256:febbc0794623f126
publishState: published
---

## What changed

On 24 June 2026 the Qwen team released Qwen-AgentWorld, an Apache-2.0 "language world model" [s1]. It is not an agent: given an action and the interaction history, it predicts the next observation an environment would return, across seven domains: MCP, Search, Terminal, SWE, Android, Web, and OS [s1][s2]. Two checkpoints ship: Qwen-AgentWorld-35B-A3B (35B total, 3B active, a 262,144-token context) and a larger 397B-A17B [s1]. It comes with AgentWorldBench, which scores each predicted observation on five dimensions: Format, Factuality, Consistency, Realism, and Quality [s2][s3].

## Why this one is different

Everyone shipped better agents this month; Qwen shipped the thing agents train against. Standing up thousands of real terminals, MCP servers, and repos to RL or stress-test a coding agent is the expensive, flaky part nobody puts on a slide. A model that emits the next terminal output or MCP tool response on demand collapses that sandbox fleet into a single vLLM box [s4].

<figure class="rc-diagram"><svg viewBox="0 0 540 150" role="img" aria-label="The agent emits an action; Qwen-AgentWorld predicts the next observation and returns it, closing the training loop with no real sandbox"><rect x="24" y="48" width="150" height="54" rx="6" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="99" y="80" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="13">agent</text><rect x="366" y="48" width="150" height="54" rx="6" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="441" y="73" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">world model</text><text x="441" y="91" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="10">Qwen-AgentWorld</text><line x1="174" y1="64" x2="366" y2="64" style="stroke: var(--accent)" stroke-width="1.5"/><polygon points="366,64 356,59 356,69" style="fill: var(--accent)"/><text x="270" y="56" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">action</text><line x1="366" y1="88" x2="174" y2="88" style="stroke: var(--accent)" stroke-width="1.5"/><polygon points="174,88 184,83 184,93" style="fill: var(--accent)"/><text x="270" y="104" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">next observation</text></svg><figcaption>The training loop: the agent acts, the world model predicts the environment's next observation, no real sandbox in the loop.</figcaption></figure>

## The catch

The benchmark framing buries the real question. The 35B-A3B scores 56.39 on AgentWorldBench, edging Claude Sonnet 4.6 at 56.04; the 397B-A17B reaches 58.71 over GPT-5.4's 58.25 [s1][s3]. Those margins are rounding error. What matters is whether a simulated observation is faithful enough to train on without teaching your agent fiction. That is exactly why AgentWorldBench scores Factuality and Consistency as their own dimensions [s2]: a world model that hallucinates a plausible-but-wrong exit code is worse than no sandbox at all.

> [!IMPORTANT]
> A simulated environment is a training aid, not ground truth. Gate any agent you RL against Qwen-AgentWorld on real environments before you trust the wins; the sim-to-real gap is the failure mode the leaderboard does not measure.

## Impact on your team

If you build agents, and especially MCP tooling, this is worth a pilot now: the 35B-A3B serves on a 4-GPU box and is Apache-2.0, so there is no usage-limit review to clear.

```
vllm serve Qwen/Qwen-AgentWorld-35B-A3B --port 8000 --tensor-parallel-size 4 --max-model-len 262144
```

Use it to expand eval and training coverage cheaply where real sandboxes are slow to stand up, then validate the agents it produced against the real thing. Do not point it at your IDE expecting a coding assistant: it predicts environments, it does not write your code.

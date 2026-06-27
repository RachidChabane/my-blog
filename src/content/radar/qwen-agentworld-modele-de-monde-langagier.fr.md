---
translationKey: qwen-agentworld-language-world-model
lang: fr
slug: qwen-agentworld-modele-de-monde-langagier
title: 'Qwen-AgentWorld : un modèle de monde ouvert qui simule les environnements
  où s''entraînent les agents'
publishDate: 27-06-2026
kind: release
tags:
- Qwen
- vLLM
- MCP
- agents
- evals
summary: Le 24-06-2026, l'équipe Qwen a publié Qwen-AgentWorld, un modèle de monde
  langagier sous Apache-2.0 qui ne joue pas l'agent mais prédit la prochaine observation
  de l'environnement sur sept domaines, livré avec l'évaluation AgentWorldBench.
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
contentHash: sha256:fcb35d99493bd2a3
publishState: published
---

## Ce qui change

Le 24 juin 2026, l'équipe Qwen a publié Qwen-AgentWorld, un "modèle de monde langagier" sous licence Apache-2.0 [s1]. Ce n'est pas un agent : à partir d'une action et de l'historique d'interaction, il prédit l'observation que renverrait l'environnement, sur sept domaines : MCP, Search, Terminal, SWE, Android, Web et OS [s1][s2]. Deux points de contrôle sortent : Qwen-AgentWorld-35B-A3B (35B au total, 3B actifs, un contexte de 262 144 tokens) et un 397B-A17B plus grand [s1]. Il s'accompagne d'AgentWorldBench, qui note chaque observation prédite sur cinq dimensions : Format, Factuality, Consistency, Realism et Quality [s2][s3].

## Pourquoi celui-ci sort du lot

Ce mois-ci, tout le monde a livré de meilleurs agents ; Qwen a livré ce contre quoi les agents s'entraînent. Monter des milliers de terminaux, de serveurs MCP et de dépôts réels pour entraîner par RL ou éprouver un agent de code, c'est la partie coûteuse et instable qu'on ne met jamais sur une diapositive. Un modèle qui produit à la demande la prochaine sortie d'un terminal ou la réponse d'un outil MCP ramène cette flotte de bacs à sable à une seule machine vLLM [s4].

<figure class="rc-diagram"><svg viewBox="0 0 540 150" role="img" aria-label="L'agent émet une action ; Qwen-AgentWorld prédit l'observation suivante et la renvoie, bouclant l'entraînement sans bac à sable réel"><rect x="24" y="48" width="150" height="54" rx="6" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="99" y="80" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="13">agent</text><rect x="366" y="48" width="150" height="54" rx="6" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="441" y="73" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">world model</text><text x="441" y="91" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="10">Qwen-AgentWorld</text><line x1="174" y1="64" x2="366" y2="64" style="stroke: var(--accent)" stroke-width="1.5"/><polygon points="366,64 356,59 356,69" style="fill: var(--accent)"/><text x="270" y="56" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">action</text><line x1="366" y1="88" x2="174" y2="88" style="stroke: var(--accent)" stroke-width="1.5"/><polygon points="174,88 184,83 184,93" style="fill: var(--accent)"/><text x="270" y="104" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">observation suivante</text></svg><figcaption>La boucle d'entraînement : l'agent agit, le modèle de monde prédit l'observation suivante de l'environnement, sans bac à sable réel dans la boucle.</figcaption></figure>

## Le piège

Le cadrage par les benchmarks masque la vraie question. Le 35B-A3B obtient 56,39 sur AgentWorldBench et devance Claude Sonnet 4.6 à 56,04 ; le 397B-A17B atteint 58,71, devant les 58,25 de GPT-5.4 [s1][s3]. Ces écarts relèvent de l'erreur d'arrondi. Ce qui compte, c'est de savoir si une observation simulée est assez fidèle pour servir d'entraînement sans apprendre la fiction à votre agent. C'est précisément pour cela qu'AgentWorldBench note la factualité et la cohérence comme des dimensions à part [s2] : un modèle de monde qui hallucine un code de sortie plausible mais faux est pire que pas de bac à sable du tout.

> [!IMPORTANT]
> Un environnement simulé est une aide à l'entraînement, pas une vérité terrain. Validez sur des environnements réels tout agent entraîné par RL contre Qwen-AgentWorld avant de vous fier aux gains ; l'écart simulation-réel est le mode d'échec que le classement ne mesure pas.

## Impact pour une équipe

Si vous construisez des agents, et surtout de l'outillage MCP, cela mérite un pilote dès maintenant : le 35B-A3B tient sur une machine à 4 GPU et reste sous Apache-2.0, donc sans examen juridique des limites d'usage.

```
vllm serve Qwen/Qwen-AgentWorld-35B-A3B --port 8000 --tensor-parallel-size 4 --max-model-len 262144
```

Servez-vous-en pour élargir à moindre coût la couverture d'évaluation et d'entraînement là où les bacs à sable réels sont lents à mettre en place, puis validez les agents obtenus sur le vrai environnement. Ne le pointez pas vers votre IDE en attendant un assistant de code : il prédit des environnements, il n'écrit pas votre code.

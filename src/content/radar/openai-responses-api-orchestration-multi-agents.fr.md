---
translationKey: openai-responses-multi-agent
lang: fr
slug: openai-responses-api-orchestration-multi-agents
title: OpenAI déplace l'orchestration multi-agents côté serveur, avec un fan-out par
  défaut de 3
publishDate: 18-07-2026
kind: release
tags:
- OpenAI
- GPT-5.6
- Responses API
- agents
- orchestration
summary: 'Le 9 juillet 2026, OpenAI a livré l''orchestration multi-agents en beta
  dans son API Responses, hébergeant l''arbre de sous-agents côté serveur derrière
  un seul champ. Le signal, c''est le frein : max_concurrent_subagents vaut 3 par
  défaut, un fan-out étroit là où la lignée Claude Code en pousse des centaines.'
sources:
- label: OpenAI developer changelog - GPT-5.6 adds Programmatic Tool Calling and Multi-agent
    orchestration
  url: https://developers.openai.com/api/docs/changelog
  date: 09-07-2026
- label: OpenAI Responses API multi-agent guide
  url: https://developers.openai.com/api/docs/guides/responses-multi-agent
  date: 09-07-2026
- label: OpenAI Programmatic Tool Calling guide
  url: https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling
  date: 09-07-2026
- label: aiagentstore.ai - Agent Collaboration news, week ending 2026-07-14
  url: https://aiagentstore.ai/ai-agent-news/topic/agent-collaboration/2026-07-14
  date: 14-07-2026
contentHash: sha256:54b22354b5c3b971
publishState: published
---

## Ce qui change

Le 9 juillet 2026, OpenAI a livré l'orchestration multi-agents en beta dans son API Responses, en même temps que la famille GPT-5.6 [s1][s2]. Un seul champ l'active, `multi_agent.enabled`, derrière le drapeau beta `OpenAI-Beta: responses_multi_agent=v1` (côté SDK, `client.beta.responses` avec `betas=["responses_multi_agent=v1"]`) [s2]. Le même jour, OpenAI a publié son pendant côté tokens, le Programmatic Tool Calling [s1][s3], et un observateur indépendant a confirmé les deux livraisons [s4]. C'est une beta en cours, disponible sur tous les modèles GPT-5.6, et non une version générale.

## L'arbre, côté serveur

Ce qui compte, c'est l'endroit où vit désormais l'orchestration. Coordonner un arbre de sous-agents chez OpenAI supposait jusqu'ici l'Agents SDK, LangGraph ou une boucle maison, que vous possédiez et déboguiez. Désormais l'arbre est hébergé : un agent racine nommé `/root` engendre des sous-agents sur des chemins hiérarchiques comme `/root/researcher` ou `/root/reviewer/tester`, et six actions hébergées apparaissent comme des éléments `multi_agent_call` dans le flux : `spawn_agent`, `send_message`, `followup_task`, `wait_agent`, `interrupt_agent` et `list_agents` [s2]. Vos propres outils fonctionnent toujours de la manière habituelle : n'importe quel agent peut émettre un `function_call`, et votre application renvoie le `function_call_output` correspondant [s2].

```python
from openai import OpenAI

client = OpenAI()
resp = client.beta.responses.create(
    model="gpt-5.6",
    betas=["responses_multi_agent=v1"],
    multi_agent={"enabled": True, "max_concurrent_subagents": 3},
    input="Research and review the migration plan.",
)
# L'agent /root emet des actions spawn_agent comme elements multi_agent_call.
```

## Le défaut est 3, pas des centaines

`max_concurrent_subagents` vaut 3 par défaut, un réglage qu'OpenAI qualifie de "recommandé pour la plupart des charges" [s2]. Voyez-y une position de conception, pas une note de bas de page. La lignée Claude Code pousse au contraire les essaims larges et fixe un plafond de 200 sous-agents par session, justement parce que la délégation qui s'emballe est son mode de défaillance ; le fan-out intégré d'OpenAI est étroit et vous invite à y rester. Si votre idée du multi-agent est l'essaim large, cette primitive a une tout autre forme, volontairement bridée, et y transposer une conception à large fan-out vous surprendra. Relevez le nombre en connaissance de cause, ou concevez pour trois.

> [!IMPORTANT]
> C'est une beta (`responses_multi_agent=v1`) et un compromis d'enfermement. Vous échangez un graphe client portable et inspectable contre un orchestrateur hébergé que vous ne pouvez pas déplacer vers un autre fournisseur, et la surface peut changer sous le drapeau. Gardez la couche d'orchestration mince si l'indépendance vis-à-vis du fournisseur compte.

## Impact pour une équipe

Si vous exploitez déjà un graphe d'agents côté client, la vraie question n'est pas de savoir si la fonctionnalité marche, mais qui détient la boucle de contrôle. Trois gestes concrets. Si vous êtes une boutique OpenAI avec un fan-out étroit, cette nouveauté supprime aujourd'hui une vraie glu d'orchestration : un pic d'essai le mérite, mais épinglez le drapeau beta et attendez-vous à des remous. Si votre conception suppose des essaims larges à la Claude Code, ne faites pas de reprise telle quelle : le défaut de 3 est la forme, donc réarchitecturez ou relevez `max_concurrent_subagents` délibérément. Associez l'arbre au Programmatic Tool Calling [s3] : le modèle écrit du JavaScript dans un runtime hébergé, appelle les outils en parallèle et garde les résultats intermédiaires côté serveur, afin que l'arbre ne renvoie pas chaque sortie d'outil au modèle. Ce sur quoi patienter : la portabilité. Rien ne permet de déplacer un arbre hébergé hors d'OpenAI ; gardez cette couche mince si cela compte.

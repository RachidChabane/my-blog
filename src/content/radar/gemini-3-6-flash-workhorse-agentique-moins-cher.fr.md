---
translationKey: gemini-3-6-flash-cheaper-workhorse
lang: fr
slug: gemini-3-6-flash-workhorse-agentique-moins-cher
title: Gemini 3.6 Flash baisse le prix de sortie et consomme 17 % de tokens en moins
  par tâche agentique
publishDate: 24-07-2026
kind: release
tags:
- Gemini
- Google
- agents
- inference
summary: 'Google a livré Gemini 3.6 Flash le 21 juillet 2026 à 7,50 $ par million
  de tokens de sortie, avec 17 % de tokens de sortie en moins par tâche que 3.5 Flash.
  Les deux leviers se cumulent : le coût réel par tâche baisse plus que le seul prix
  affiché.'
sources:
- label: Google, Introducing Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/
  date: 21-07-2026
- label: 'Fello AI, Gemini 3.6 Flash: Pricing, Benchmarks & What''s New'
  url: https://felloai.com/gemini-3-6-flash/
  date: 21-07-2026
contentHash: sha256:67f601beece65bff
publishState: published
---

## Ce qui change

Google a livré Gemini 3.6 Flash le 21 juillet 2026 à 1,50 $ par million de tokens d'entrée et 7,50 $ par million de tokens de sortie, disponible le jour même dans Google AI Studio, Android Studio, Google Antigravity et l'application Gemini [s1]. La métrique de Google : 17 % de tokens de sortie en moins que Gemini 3.5 Flash, mesurés sur l'Artificial Analysis Index [s1]. Fello AI indique que le prix de sortie de 7,50 $ recule depuis 9,00 $ sur 3.5 Flash, l'entrée restant à 1,50 $, et que la date de connaissance passe de janvier 2025 à mars 2026 [s2].

## Où l'économie tombe vraiment

L'intérêt n'est pas la baisse affichée ; c'est que deux leviers se cumulent. Un prix de sortie plus bas et 17 % de tokens de sortie en moins par tâche se multiplient au lieu de se substituer. Faites le calcul sur les deux chiffres cités : 7,50/9,00, multiplié par la réduction de 17 % des tokens, donne 0,833 x 0,83, soit environ 0,69. Sur une charge riche en sortie, le coût réel par tâche baisse d'environ un tiers, pas des ~17 % que la ligne de prix laisse croire.

| Par 1M de tokens | 3.5 Flash | 3.6 Flash |
| :--- | ---: | ---: |
| entrée | 1,50 $ [s2] | 1,50 $ [s1] |
| sortie | 9,00 $ [s2] | 7,50 $ [s1] |

Ce chiffre ne tient que lorsque la sortie domine la facture.

> [!IMPORTANT]
> L'entrée coûte toujours 1,50 $ par million [s1] : une charge dominée par de longs contextes récupérés, un gros pipeline RAG, ne voit presque rien de cette baisse. Le cumul mord dans les boucles agentiques riches en sortie, pas dans la récupération riche en entrée. Chiffrez votre propre répartition de tokens avant de tabler sur un tiers d'économie.

## Impact pour une équipe

Si vous routez un fort trafic d'agents par le palier Flash, cela vaut un rechiffrage cette semaine : le gain se concentre là où les boucles d'agents dépensent, la sortie. C'est une option, pas une dépréciation : aucune échéance ni migration forcée, et 3.6 Flash est disponible aujourd'hui sans liste d'attente [s1]. Aucun score de qualité pour 3.6 Flash n'est capté ici, et Google met en avant le coût et la latence plutôt qu'un écart de justesse : validez sur vos propres évaluations avant de présumer la parité avec 3.5 Flash. Et la date de connaissance repoussée à mars 2026 [s2] change ce que le modèle sait sans toucher au prompt et peut décaler son comportement sur les tâches sensibles à l'actualité. Rechiffrez maintenant, réévaluez avant de vous engager.

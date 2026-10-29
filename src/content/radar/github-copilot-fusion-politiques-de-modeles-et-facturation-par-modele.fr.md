---
translationKey: github-copilot-fusion-model-policy-pool-and-per-model-billing
lang: fr
slug: github-copilot-fusion-politiques-de-modeles-et-facturation-par-modele
title: GitHub Copilot Fusion passe en disponibilité générale et choisit les modèles
  de chaque prompt parmi ceux qu'activent vos politiques de modèles, et selon Artificial
  Analysis les coûts en jetons suivent les modèles sous-jacents
publishDate: 29-10-2026
kind: release
tags:
- GitHub Copilot
- Artificial Analysis
- Claude
- GPT-6
- agents
summary: 'GitHub annonce la disponibilité générale de GitHub Copilot Fusion, et Artificial
  Analysis date la sortie du 28 octobre 2026. Selon GitHub, Copilot Fusion détermine
  pour chaque prompt quels modèles utiliser, et n''utilise que les modèles activés
  dans les politiques de modèles de votre entreprise et de votre organisation. Selon
  Artificial Analysis, les coûts en jetons sont facturés selon les modèles sous-jacents
  utilisés, et Copilot Fusion coûte 5,59 $ par tâche à son réglage max dans GitHub
  Copilot CLI, contre 11,42 $ pour Claude Code avec Opus 5.5 (max). Ma recommandation
  : choisissez les modèles que Copilot Fusion a le droit d''utiliser avant d''en faire
  le modèle par défaut, puis comparez une semaine de consommation facturée en Fusion
  Standard en réintégrant la remise temporaire de 30 % accordée par GitHub.'
sources:
- label: GitHub Changelog, Route and orchestrate models with GitHub Copilot Fusion
  url: https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion/
  date: 28-10-2026
- label: Artificial Analysis, GitHub Copilot Fusion orchestrates Anthropic and OpenAI
    models to balance performance and cost
  url: https://artificialanalysis.ai/articles/github-copilot-fusion-orchestrates-anthropic-and-openai-models-to-balance-performance-and-cost
  date: 28-10-2026
contentHash: sha256:fe66bfc2072c3d19
publishState: published
---

## Ce qui change

GitHub annonce la disponibilité générale de GitHub Copilot Fusion [s1]. Artificial Analysis date la sortie du 28 octobre 2026 [s2]. On sélectionne Copilot Fusion et un niveau d'effort (Fusion Standard, Fusion High ou Fusion Max), et GitHub précise que Copilot Fusion détermine pour chaque prompt quels modèles utiliser et comment ils travaillent ensemble [s1].

## Qui choisit le modèle, désormais

À mon avis, ce qui change pour une équipe, c'est qui choisit le modèle. Selon GitHub, Copilot Fusion n'utilise que les modèles activés dans les politiques de modèles de votre entreprise et de votre organisation, et les administrateurs décident des modèles qu'il peut utiliser et de son statut par défaut [s1]. Selon Artificial Analysis, les coûts en jetons sont facturés selon les modèles sous-jacents utilisés pour traiter une requête, et Copilot Fusion choisit notamment entre Claude Opus 5.5, Claude Sonnet 5.5, GPT-6 Astra et GPT-6 Sol [s2].

> [!CONFIRMED]
> GitHub décrit un enchaînement où un modèle efficace rédige une réponse qu'un contrôle qualité accepte ou transmet à un modèle plus puissant, et un autre où un modèle rédige, un second relit et le premier révise [s1].

> [!INFERRED]
> Ma lecture : un même prompt peut passer par deux modèles, si bien que son coût dépend des modèles que votre politique laisse dans le pool.

## Ce que couvre le chiffre de coût

L'objection la plus solide tient au résultat mesuré. Artificial Analysis a mesuré Copilot Fusion à son réglage max dans GitHub Copilot CLI et relève 5,59 $ par tâche, contre 11,42 $ pour Claude Code avec Opus 5.5 (max) [s2]. Je suis d'accord : l'orchestration peut coûter moins cher, et cet écart est réel. Il porte toutefois sur un seul réglage dans un seul client, et aucune des deux sources ne chiffre le coût de Fusion Standard ou de Fusion High, les niveaux que GitHub destine au code du quotidien et aux tâches difficiles [s1][s2].

## Impact pour une équipe

Ma recommandation, si vous administrez Copilot : avant de faire de Copilot Fusion le modèle par défaut, ouvrez vos politiques de modèles et choisissez les modèles qu'il a le droit d'utiliser, car cette liste borne désormais le coût d'un prompt. Faites alors tourner Fusion Standard une semaine sur une équipe et comparez sa consommation facturée à celle de son modèle actuel. GitHub accorde pour une durée limitée une remise de 30 % sur les coûts de modèles aux abonnés payants qui passent par Copilot Fusion [s1] : réintégrez cette remise avant de comparer, sinon la semaine d'essai flattera Copilot Fusion. Je n'en ferais pas le modèle par défaut sur la foi du seul benchmark de son réglage max.

---
translationKey: grok-4-5
lang: fr
slug: grok-4-5-cursor-coding-agentique
title: 'Grok 4.5 : un pari prix-performance pour le code agentique, pas un nouveau
  champion de la frontière'
publishDate: 11-07-2026
kind: release
tags:
- Grok
- xAI
- Cursor
- coding
- agents
summary: xAI a livré Grok 4.5 le 2026-07-08 pour le code et l'agentique, à 2 et 6
  dollars par million de tokens. Sur ses quatre benchmarks auto-déclarés, le partage
  avec Opus 4.8 est de 2 à 2 et Fable 5 devance partout, donc c'est un pari prix-performance,
  pas une victoire de frontière, et il n'est pas encore disponible dans l'UE.
sources:
- label: Origin-adjacent - Tech.Yahoo / SiliconANGLE wire, 'xAI launches Grok 4.5,
    its most intelligent model built for coding and agentic tasks'
  url: https://tech.yahoo.com/ai/articles/xai-launches-grok-4-5-coding-agentic
  date: 08-07-2026
- label: Corroboration - roo.beehiiv, independent benchmark analysis of the Grok 4.5
    launch
  url: https://roo.beehiiv.com/p/grok-4-5-coding-benchmarks
  date: 08-07-2026
- label: 'Corroboration - apidog, ''Grok 4.5 API: pricing, benchmarks and the OpenAI-compatible
    surface'''
  url: https://apidog.com/blog/grok-4-5-api/
  date: 09-07-2026
contentHash: sha256:f36fde1896fd59ea
publishState: published
---

## Ce qui change

xAI a livré Grok 4.5 le mercredi 2026-07-08, son premier modèle conçu spécifiquement pour le code et les tâches agentiques [s1]. Il expose une surface d'API compatible OpenAI sous la référence `grok-4.5`, documentée sur docs.x.ai/developers/grok-4-5 [s3], au tarif de 2 dollars par million de tokens en entrée et 6 dollars par million en sortie [s1], à environ 80 tokens par seconde [s3]. Il est disponible dès maintenant via Grok Build, Cursor sur tous les forfaits, la console SpaceXAI et OpenRouter [s1][s2]. Musk l'a qualifié de "modèle de classe Opus, mais plus rapide, plus économe en tokens et moins cher" [s1]. C'est sa formule. Ce sont les mesures qui rendent l'histoire intéressante.

## Le vrai partage des benchmarks

Tous les benchmarks publiés par xAI sont auto-déclarés, et il y en a exactement quatre. Face à Opus 4.8, le partage est de 2 à 2, et Claude Fable 5 devance sur les quatre [s2].

| Benchmark (auto-déclaré par xAI [s2]) | Grok 4.5 | Opus 4.8 |
| :--- | :--: | :--: |
| DeepSWE 1.0 | 62.0 | 55.75 |
| DeepSWE 1.1 | 53 | 59 |
| Terminal-Bench 2.1 | 83.3 | 78.9 |
| SWE-Bench Pro | 64.7 | 69.2 |

Grok 4.5 l'emporte sur DeepSWE 1.0 et Terminal-Bench 2.1, et perd sur DeepSWE 1.1 et SWE-Bench Pro [s2]. Il se classe 4e sur l'Artificial Analysis Intelligence Index, au-dessus de tous les modèles à poids ouverts et de tous les Gemini [s3]. "Classe Opus" décrit correctement le palier ; "bat Opus", non.

## Le volant de données

Ce qui comptera encore dans un an, ce sont les données d'entraînement, plus que n'importe quel score de benchmark. xAI affirme avoir intégré de vraies données de sessions de développeurs Cursor, traces de débogage, diffs multi-fichiers et corrections d'utilisateurs, dans un entraînement supplémentaire [s2]. Ce sont des traces de sessions de développement issues d'un produit de code agentique en production : le modèle est ajusté sur la forme réelle du travail plutôt que sur des corpus de code génériques. C'est la formulation de xAI, que je ne peux pas vérifier de façon indépendante, mais si elle tient, c'est l'avantage qu'un concurrent ne peut pas copier à bas coût : il faut un produit comme Cursor qui génère ces données avant de pouvoir en tirer un entraînement.

> [!IMPORTANT]
> Deux réserves conditionnent toute adoption. Chaque benchmark ci-dessus est un chiffre maison de xAI, donc traitez-les comme des affirmations de l'éditeur et relancez vos propres évaluations d'agents avant de vous y fier. Et le modèle n'est pas encore disponible dans l'UE ; xAI vise la mi-juillet 2026, donc une équipe européenne ne peut pas l'adopter aujourd'hui [s1][s2].

## Impact pour une équipe

Si vous êtes une équipe hors UE déjà sous Cursor, `grok-4.5` mérite un essai comme valeur par défaut agentique moins chère, à 2 et 6 dollars par million de tokens [s1], mais traitez-le comme un pari prix-performance, pas comme un saut de frontière : réétalonnez-le sur votre propre suite d'évaluation d'agents, car les quatre chiffres qui le vendent sont auto-déclarés et partagés 2 à 2 [s2]. Si vous êtes dans l'UE, il n'y a rien à faire pour l'instant, sinon attendre la fenêtre de mi-juillet [s1]. La seule chose à ignorer, c'est l'adjectif "classe Opus" pris comme verdict ; le partage, et vos propres traces, sont les chiffres qui comptent.

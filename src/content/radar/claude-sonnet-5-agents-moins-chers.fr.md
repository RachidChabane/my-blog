---
translationKey: claude-sonnet-5
lang: fr
slug: claude-sonnet-5-agents-moins-chers
title: 'Claude Sonnet 5 : codage agentique proche d''Opus à moindre prix, disponible
  dès le premier jour'
publishDate: 01-07-2026
kind: release
tags:
- Claude
- Anthropic
- agents
- inference
summary: Anthropic a livré Claude Sonnet 5 le 2026-06-30, disponible dès le premier
  jour à un tarif d'introduction de 2 $/10 $ par million de tokens jusqu'au 2026-08-31,
  à six points d'Opus 4.8 sur le codage agentique et à un prix inférieur à Opus 4.8,
  GPT-5.5 et Gemini 3.1 Pro.
sources:
- label: Anthropic - Introducing Claude Sonnet 5
  url: https://www.anthropic.com/news/claude-sonnet-5
  date: 30-06-2026
- label: TechCrunch - Anthropic launches Claude Sonnet 5 as a cheaper way to run agents
  url: https://techcrunch.com/2026/06/30/anthropic-launches-claude-sonnet-5-as-a-cheaper-way-to-run-agents/
  date: 30-06-2026
contentHash: sha256:564ab4264040f589
publishState: published
---

## Ce qui change

Anthropic a livré Claude Sonnet 5 le 2026-06-30 et, contrairement aux sorties frontière sous accès restreint de la semaine, le modèle est disponible pour tous le jour même : modèle par défaut des offres Free et Pro, accessible sur Max, Team et Enterprise, et appelable dans l'API sous `claude-sonnet-5` [s1][s2]. Les faits porteurs, à double source, sont la disponibilité et le prix : un tarif d'introduction de 2 $ par million de tokens en entrée et 10 $ par million en sortie jusqu'au 2026-08-31, puis un tarif standard de 3 $ en entrée et 15 $ en sortie [s1][s2]. TechCrunch souligne que cela passe sous Opus 4.8, mais aussi sous GPT-5.5 et Gemini 3.1 Pro [s2]. Anthropic le présente comme son Sonnet le plus agentique à ce jour et affirme qu'il « réduit l'écart » avec Opus 4.8 sans l'égaler [s1].

## Le calcul prix/qualité

Voici le chiffre qui fait pencher la décision : sur le codage agentique, Anthropic rapporte Sonnet 5 à 63,2 %, contre 69,2 % pour Opus 4.8 et 58,1 % pour Sonnet 4.6 [s2]. Six points derrière le modèle phare, et TechCrunch situe Sonnet 5 sous Opus 4.8, GPT-5.5 et Gemini 3.1 Pro côté prix [s2]. Lisez ces deux faits ensemble et le coût de référence pour faire tourner des agents en production baisse : recourir à Opus devient une escalade réservée aux jugements les plus difficiles, plutôt que le pilote de tous les jours.

| Mesure (rapportée par Anthropic [s2]) | Sonnet 5 | Opus 4.8 | Sonnet 4.6 |
| :--- | :--: | :--: | :--: |
| Codage agentique | 63,2 % | 69,2 % | 58,1 % |

> [!IMPORTANT]
> Les scores de codage agentique ci-dessus proviennent des mesures d'Anthropic, rapportées via TechCrunch, d'une seule source et non corroborées de façon indépendante ici [s2]. Prenez-les comme une affirmation du fournisseur à vérifier sur vos propres traces d'agents, pas comme un résultat établi. La même prudence vaut pour la revendication de sûreté d'Anthropic, meilleur refus des requêtes malveillantes et meilleure résistance aux injections de prompt [s1] : affirmée, non mesurée de façon indépendante.

## Impact pour une équipe

Si vos boucles d'agents utilisent Opus 4.8 par défaut aujourd'hui, la décision concrète est de savoir s'il faut les rebasculer sur Sonnet 5 avant le 2026-08-31. C'est la vraie échéance : le tarif d'introduction à 2 $/10 $ est une remise sur l'entrée et la sortie qui expire à cette date et revient à 3 $/15 $ [s1][s2] ; toute projection de coût bâtie maintenant doit donc retenir le tarif standard, pas la promotion. Ce que je ferais concrètement : passer votre suite d'évaluation d'agents existante sur `claude-sonnet-5`, et si l'écart de qualité sur vos tâches est plus faible que l'écart de prix, basculer le défaut et garder Opus en repli ciblé pour les cas où six points de précision en codage se justifient. Ne mêlez pas GPT-5.5 ni Gemini 3.1 Pro à cet arbitrage : ils ne sont ici que les points de comparaison de prix d'Anthropic, pas le choix qui se pose à vous.

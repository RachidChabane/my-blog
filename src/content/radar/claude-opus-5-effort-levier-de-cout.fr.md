---
translationKey: claude-opus-5-effort-cost-lever
lang: fr
slug: claude-opus-5-effort-levier-de-cout
title: Claude Opus 5 arrive au tarif Opus inchangé, avec le réglage d'effort comme
  levier de coût
publishDate: 25-07-2026
kind: release
tags:
- Claude
- Claude Opus 5
- Anthropic
- agentic coding
- effort
summary: Anthropic a publié Claude Opus 5 le 24 juillet 2026 à 5 $ par million de
  tokens en entrée et 25 $ par million en sortie, soit le tarif d'Opus 4.8. La décision
  de coût se joue désormais sur le réglage d'effort défini requête par requête, et
  le banc de revue de CodeRabbit montre que l'augmenter se paie en rappel et en tokens.
sources:
- label: Anthropic news, Claude Opus 5
  url: https://www.anthropic.com/news/claude-opus-5
  date: 24-07-2026
- label: Fortune, Anthropic debuts Claude Opus 5 with a feature that lets users toggle
    between cost and capability
  url: https://fortune.com/2026/07/24/anthropic-debuts-claude-opus-5-with-feature-that-lets-users-toggle-between-cost-and-capability/
  date: 24-07-2026
- label: CodeRabbit, Claude Opus 5 benchmarks for AI code review
  url: https://www.coderabbit.ai/blog/opus-5-model-review
  date: 24-07-2026
- label: 'MarkTechPost, Meet the new Claude Opus 5: frontier-class agentic coding
    and computer use at unchanged Opus pricing'
  url: https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/
  date: 24-07-2026
contentHash: sha256:e1d5bb874e5fb508
publishState: published
---

## Ce qui change

Anthropic a publié Claude Opus 5 le 24 juillet 2026 à 5 $ par million de tokens en entrée et 25 $ en sortie, tarif inchangé depuis Opus 4.8 [s1][s4], sous l'identifiant `claude-opus-5` sur l'API Claude [s1]. Selon Anthropic, il approche l'intelligence de Claude Fable 5 pour la moitié de son prix [s1][s2]. Ce qui bouge, c'est un réglage d'effort défini requête par requête, qui arbitre entre capacité et tokens consommés [s1][s2][s3][s4]. Fortune y voit une réponse aux inquiétudes des grands comptes sur leurs factures d'IA [s2].

## Ce que le réglage d'effort coûte vraiment

L'enjeu de coût a quitté l'identifiant du modèle pour une valeur posée à chaque appel; le dimensionnement devient une décision par requête et non une entrée de table de routage. CodeRabbit a passé Opus 5 sur son propre banc de revue de code, face au relecteur qu'il exploite en production, et ce réglage n'a rien d'un bouton de qualité gratuit [s3].

| Banc de revue CodeRabbit | relecteur en production | Opus 5 |
| :--- | ---: | ---: |
| précision, sous-ensemble exploitable, x-high | 35,2 % [s3] | 39,3 % [s3] |
| tokens en entrée par revue | ~40 500 [s3] | ~60 500 [s3] |
| tokens en sortie par revue | ~5 800 [s3] | ~9 500 [s3] |

Ces lignes se lisent ensemble. En x-high, CodeRabbit obtient un sous-ensemble exploitable plus propre, mais détecte moins de problèmes connus et produit quatre fois plus de remarques mineures [s3]. Or Opus 5 revient aussi plus cher sur cette charge: environ 60 500 tokens en entrée par revue contre environ 40 500 pour la référence [s3], un rapport voisin de 1,49, soit près de 50 % de plus. La précision monte, le rappel baisse, la facture grimpe.

> [!IMPORTANT]
> Les sources divergent sur le nombre de niveaux d'effort. Fortune parle de faible, moyen ou élevé [s2], Anthropic [s1] et MarkTechPost [s4] évoquent un niveau `max`, et CodeRabbit a mesuré une configuration qu'il appelle `x-high` [s3]. Toute échelle donnée pour complète est donc non vérifiée. MarkTechPost signale aussi que le raisonnement est activé par défaut et que le désactiver au-delà de l'effort `high` renvoie une erreur 400 [s4], le piège où tombe une configuration reprise depuis Opus 4.8.

## Impact pour une équipe

Si `claude-opus-4-8` traîne dans une configuration de routage, passer à `claude-opus-5` [s1] ne change qu'une ligne, sans toucher au tarif [s1][s4]: c'est là le piège, cela paraît gratuit. Balayez les niveaux d'effort sur vos propres évaluations avant la bascule, car la seule mesure indépendante capturée ici porte sur un seul harnais de revue et une seule charge [s3]. Budgétez un écart de tokens en entrée plutôt que la parité, comme CodeRabbit l'a mesuré chez lui [s3], et tenez pour nul tout réglage hérité d'Opus 4.8. Le mode Fast relève d'un autre levier, la latence: Anthropic annonce environ 2,5 fois la vitesse par défaut pour le double du tarif de base d'Opus 5 [s1]. Rien n'est déprécié, aucune échéance ne vous presse: le geste utile cette semaine, c'est ce balayage.

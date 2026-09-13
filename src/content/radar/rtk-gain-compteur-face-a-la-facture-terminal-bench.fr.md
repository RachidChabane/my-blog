---
translationKey: rtk-gain-counter-versus-terminal-bench-bill
lang: fr
slug: rtk-gain-compteur-face-a-la-facture-terminal-bench
title: rtk gain compte la sortie bash, et deux benchmarks de coût d'agents n'ont trouvé
  aucune économie à la hauteur
publishDate: 13-09-2026
kind: benchmark
tags:
- RTK
- Claude Code
- Terminal-Bench
- DeepSeek
- evals
summary: 'Quesma a publié le 11 septembre 2026 une étude de RTK sur Terminal-Bench
  2.1 : rtk gain y annonce 349.2 millions de tokens économisés sur DeepSeek, dont
  le coût par tâche augmente pourtant de 17% en moyenne. JetBrains avait mesuré le
  même sens sur SkillsBench. Je pense que rtk gain n''a sa place dans aucun reporting
  de coût ; les essais portaient sur RTK 0.45.0, la version actuelle est la 0.49.0.'
sources:
- label: Quesma, RTK reports huge token savings, but our cost benchmarks disagree
  url: https://quesma.com/blog/does-rtk-make-ai-coding-cheaper/
  date: 11-09-2026
- label: JetBrains AI blog, Does rtk skill really cut agent tokens? We tested it
  url: https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
  date: 20-07-2026
- label: RTK README, Commands section
  url: https://raw.githubusercontent.com/rtk-ai/rtk/master/README.md
  date: 22-07-2026
- label: rtk-ai/rtk v0.49.0 release
  url: https://github.com/rtk-ai/rtk/releases/tag/v0.49.0
  date: 11-09-2026
contentHash: sha256:18f1c2f239260602
publishState: published
---

## Ce qui change

Quesma a publié le 11 septembre 2026 une étude de coût de RTK sur Terminal-Bench 2.1 : Claude Code avec Fable 5.0 et OpenCode avec DeepSeek V4 Pro 0813, 1,740 tentatives avec et sans l'outil [s1]. Sur les 445 tentatives DeepSeek avec RTK, rtk gain a annoncé 349.2 millions de tokens économisés, soit 89% de réduction [s1]. La facture n'a pas suivi [s1].

| Avec RTK | Fable 5.0, Claude Code | DeepSeek V4 Pro 0813, OpenCode |
| :--- | ---: | ---: |
| Coût total | -5% | +5% |
| Coût moyen par tâche | +1% (écart non significatif) | +17% |

## Un compteur dans la mauvaise unité

L'écart tient à ce que mesure le compteur. RTK documente rtk gain comme la sortie brute des commandes moins la sortie filtrée, en octets, divisée par 4 [s1], et son propre README rapporte ces pourcentages à la sortie bash plutôt qu'à votre facture [s3]. Cette formule ignore le reste de la boucle. Côté DeepSeek, chaque tour consommait 7% d'entrée en moins, mais les tours étaient 18% plus nombreux [s1] : chaque observation raccourcie a coûté des allers-retours. Le hook voit d'ailleurs moins qu'on ne le croit. Read, Grep et Glob sont des outils distincts qui contournent RTK, et la sortie du terminal ne pesait qu'environ 7% du contexte de Fable [s1]. Tailler fort dans une part aussi mince ne pouvait guère se lire sur la facture.

JetBrains y était arrivé avant, sur un autre terrain. En juillet, sur SkillsBench avec Claude Code et claude-sonnet-5, RTK coûtait 7.6% de plus à faible effort de raisonnement et restait neutre à effort élevé [s2]. Autre harnais, autre modèle, autre benchmark : même sens.

> [!IMPORTANT]
> Quesma a testé RTK 0.45.0. La version actuelle est la 0.49.0, publiée le 11 septembre 2026 avec un nouveau recall store [s4], et je n'ai trouvé aucune mesure de coût sur cette version. Ces résultats valent pour la 0.45.0.

## Impact pour une équipe

Si vous avez placé RTK derrière un hook Claude Code après la brève radar de juin, qui relayait son tableau d'économies, retirez rtk gain de tout reporting de coût. Il compte des octets de sortie bash, et je pense qu'un chiffre dans la mauvaise unité nuit plus qu'une absence de chiffre. Mesurez à la place le coût par tâche réussie, avec et sans le hook, sur vos tâches : l'écart par tâche mesuré par Quesma sur DeepSeek (+17% [s1]) dépasse nettement ce que montrait le coût total (+5% [s1]). Si vous faites tourner OpenCode sur DeepSeek V4 Pro, cette comparaison décide à elle seule du maintien du hook. N'attendez pas de nouvelle campagne sur la 0.49.0 [s4] : le recall store change ce que fait RTK, et seule compte votre mesure sur la version que vous déployez.

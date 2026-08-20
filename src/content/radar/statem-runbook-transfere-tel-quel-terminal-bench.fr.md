---
translationKey: statem-runbook-portability-terminal-bench
lang: fr
slug: statem-runbook-transfere-tel-quel-terminal-bench
title: 'StateM est d''abord un résultat de portabilité : le runbook se transfère tel
  quel à GPT-5.6'
publishDate: 20-08-2026
kind: research
tags:
- Terminal-Bench
- GPT-5.6
- agents
- evals
summary: Une prépublication du 15 août 2026 présente StateM, un runtime pour agents
  bâti sur des états durables, un contexte propre à chaque phase, des transitions
  vérifiées et des runbooks versionnés, avec des résultats Terminal-Bench 2.1 pour
  GPT-5.5 et GPT-5.6. À mon sens, ce qui dure dans ce résultat, c'est le runbook,
  que l'article dit se transférer tel quel à GPT-5.6.
sources:
- label: arXiv 2608.15089, StateM harness scaling preprint
  url: https://arxiv.org/abs/2608.15089
  date: 15-08-2026
- label: Terminal-Bench 2.1 leaderboard, tbench.ai
  url: https://www.tbench.ai/leaderboard/terminal-bench/2.1
  date: 12-08-2026
contentHash: sha256:cd434a35d1c16505
publishState: published
---

## Ce qui change

Une prépublication du 15 août 2026 parie sur le passage à l'échelle du harnais : améliorer le système d'exécution autour d'un agent sans toucher aux poids du modèle [s1]. Elle présente StateM, un runtime pour agents organisé autour d'états durables, d'un contexte propre à chaque phase, de transitions vérifiées, de runbooks récupérables et de pratiques procédurales versionnées [s1]. Elle rapporte des exécutions Terminal-Bench 2.1 pour GPT-5.5 xhigh, GPT-5.6 Sol xhigh et GPT-5.6 Luna [s1], les trois exécutions sur lesquelles ce billet s'appuie.

## Ce qui survit au changement de modèle

Un runbook qui continue de fonctionner après un changement du modèle sous-jacent, voilà ce que je mettrais sous contrôle de version cette semaine. Le runbook se transfère tel quel à GPT-5.6 [s1], et le profil figé fait passer GPT-5.6 Luna de 76.7 à 85.4 pour cent [s1]. La réutilisation publiée couvre une génération de modèles et ses paliers de capacité.

| Exécution | Précision annoncée |
| --- | --- |
| StateM avec GPT-5.6 Sol xhigh [s1] | 95.3 pour cent sur 445 essais |
| GPT-5.6 Luna sous le profil figé [s1] | 76.7 à 85.4 pour cent |

L'objection tient en une phrase : c'est l'arithmétique d'un seul laboratoire sur ses propres exécutions. Le classement Terminal-Bench 2.1 rapporte la précision avec un intervalle de confiance, 83.8 pour cent plus ou moins 1.2 pour l'exécution classée première, Claude Code avec Fable 5 [s2] ; StateM rapporte des estimations ponctuelles issues de ses propres exécutions [s1]. À mon sens la conception reste rétro-adaptable, que ces estimations tiennent ou non, d'où la consigne d'Impact : réutiliser la structure et re-mesurer sur ses propres tâches.

> [!IMPORTANT]
> Je mettrais le runbook sous contrôle de version avant de citer la précision annoncée par l'article. Que le runbook soit passé au modèle suivant sans modification [s1] est aussi la partie bon marché à tester dans son propre dépôt.

## Impact pour une équipe

Ne reconstruisez pas votre runtime sur une prépublication vieille de cinq jours. Ce qui est rétro-adaptable dès cette semaine, c'est la conception : états durables, contexte propre à chaque phase, transitions vérifiées, et un runbook versionné comme du code [s1].

Mesurez la part de votre harnais qui survit à votre prochaine montée de version : rejouez le runbook tel quel et consignez ce que vous avez dû réécrire.

Passez-le d'abord sur votre propre jeu de tâches. Les preuves de transfert couvrent une génération de modèles ; en faire une garantie au-delà relève, à mon sens, d'un pari personnel.

---
translationKey: grok-4-6-long-horizon-agent-turn-efficiency
lang: fr
slug: grok-4-6-agents-longue-haleine-nombre-de-tours
title: Grok 4.6 vise les agents de longue haleine, et un évaluateur indépendant le
  mesure à moitié moins de tours que Claude Opus 5
publishDate: 13-08-2026
kind: release
tags:
- Grok
- xAI
- agents
- evals
summary: xAI a publié Grok 4.6 le 12 août 2026, avec une orientation affichée vers
  les agents de longue haleine. Artificial Analysis le situe à un Elo de 1577 sur
  AA-Briefcase, son banc d'essai privé, derrière la famille Claude Opus 5. Elle relève
  par ailleurs un profil d'exécution moyen de ~53 tours et ~0.5B jetons en entrée,
  contre ~103 tours et ~2.0B pour Claude Opus 5 (max), sans nommer de banc d'essai
  sur ces chiffres. À mon sens, c'est le nombre de tours qui décide de la place d'un
  modèle dans une boucle d'agent longue.
sources:
- label: SpaceXAI release announcement, Introducing Grok 4.6
  url: https://x.ai/news/grok-4-6
  date: 12-08-2026
- label: Artificial Analysis, independent benchmark article on Grok 4.6
  url: https://artificialanalysis.ai/articles/grok-4-6-benchmarks-and-analysis
  date: 12-08-2026
contentHash: sha256:93775c09af0c081e
publishState: published
---

## Ce qui change

xAI a publié Grok 4.6 le 12 août 2026. Le modèle prolonge Grok 4.5 avec une orientation affichée
vers les agents de longue haleine, capables de tenir sur des tâches complexes pendant de nombreuses
étapes, de la recherche documentaire au travail sur une base de code [s1]. Artificial Analysis a
publié ses mesures le même jour : Grok 4.6 entre sur AA-Briefcase, son banc d'essai privé de tâches
agentiques de longue haleine, avec un Elo de 1577, ce qui le situe au niveau de Fable 5, derrière
la famille Claude Opus 5 [s2].

## Le vrai coût, c'est le nombre de tours

Lisez la seconde moitié de cette mesure avant la première. Artificial Analysis rapporte le profil
d'exécution moyen suivant [s2] :

| Profil d'exécution moyen | Grok 4.6 | Claude Opus 5 (max) |
| :--- | ---: | ---: |
| Tours pour résoudre une tâche | ~53 | ~103 |
| Jetons en entrée | ~0.5B | ~2.0B |

Artificial Analysis en tire elle-même la conclusion économique : le travail de longue haleine
accumule du contexte très vite, si bien qu'une réponse comparable obtenue en moitié moins de tours
et avec quatre fois moins de jetons procure un avantage qui dépasse le prix au jeton [s2]. J'irais plus loin. Un tour, ce n'est pas seulement des jetons. C'est un aller-retour
qui peut expirer, buter sur une limite de débit ou renvoyer un appel d'outil malformé, si bien
qu'une boucle qui en réclame deux fois plus échoue plus souvent, pour des raisons étrangères à la
qualité du raisonnement. Voilà l'axe qu'un score unique masque.

> [!IMPORTANT]
> Artificial Analysis rattache l'Elo de 1577 à AA-Briefcase ; elle ne nomme aucun banc d'essai pour
> le profil d'exécution [s2]. Et le comparateur porte l'étiquette `Claude Opus 5 (max)`, que je lis
> comme une configuration précise plutôt que comme la famille entière. Deux affirmations, une seule
> page, une seule rattachée à un banc d'essai.

## Impact pour une équipe

Traitez ce résultat comme une décision de placement. Grok 4.6 reste derrière la famille Claude
Opus 5 sur la qualité et résout les tâches en environ moitié moins de tours [s2] ; je le mettrais
donc à l'intérieur de la boucle longue, là où chaque aller-retour se paie en contexte et en temps
réel, et je garderais le niveau supérieur à la frontière, pour cadrer l'exécution et relire ce qui
en sort. Je ne déplacerais pas une boucle de production sur ces chiffres aujourd'hui : la mesure
qui justifierait ce déplacement est celle qu'Artificial Analysis étaie le moins, sans banc d'essai
nommé sur le profil d'exécution et avec un comparateur dont la configuration n'est peut-être pas la
vôtre. Guettez un profil d'exécution publié face à un banc d'essai nommé, avec un comparateur qui
corresponde à ce que vous exploitez. C'est cette phrase-là qui transformerait le constat en
migration.

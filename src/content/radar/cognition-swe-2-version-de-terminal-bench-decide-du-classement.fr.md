---
translationKey: cognition-swe-2-terminal-bench-version-decides-the-row
lang: fr
slug: cognition-swe-2-version-de-terminal-bench-decide-du-classement
title: SWE-2 de Cognition mène sur Terminal-Bench 2.1 et perd sur Terminal-Bench 4,
  dans le même tableau
publishDate: 12-09-2026
kind: release
tags:
- Cognition
- SWE-2
- Terminal-Bench
- Kimi K3
- evals
summary: Cognition a publié SWE-2 le 10 septembre 2026, post-entraîné depuis Kimi
  K3 et accessible seulement dans Devin Desktop et Devin CLI [s2][s3]. Son propre
  tableau place SWE-2 à 92.8% sur Terminal-Bench 2.1, devant Fable 5.1 à 91.4%, et
  à 27.3% sur Terminal-Bench 4, où Fable 5.1 obtient 55.8% [s1][s3]. Je trouve que
  la version citée travaille plus que le modèle.
sources:
- label: 'Cognition, Introducing SWE-2: Pushing the Pareto Frontier'
  url: https://cognition.com/blog/swe-2
  date: 10-09-2026
- label: Tech Times, Cognition SWE-2 beats frontier coding AI
  url: https://www.techtimes.com/articles/327315/20260911/cognition-swe-2-beats-frontier-coding-ai-64-lower-cost-using-single-run-rl-training.htm
  date: 11-09-2026
- label: 'CellCog blog, Cognition SWE-2: benchmarks and the row it loses'
  url: https://cellcog.ai/blog/cognition-swe-2/
  date: 10-09-2026
contentHash: sha256:07dab7194be888cb
publishState: published
---

## Ce qui change

Cognition a publié SWE-2 le 10 septembre 2026, successeur de SWE-1.7, post-entraîné depuis Kimi K3 et accessible dans Devin Desktop et Devin CLI, le déploiement vers Devin Web et Fusion étant en cours [s2][s3]. L'annonce tient à une ligne de son propre tableau de benchmarks : 92.8% sur Terminal-Bench 2.1, devant Fable 5.1 à 91.4% et GPT-6 Astra à 89.9% [s1][s3]. La ligne juste en dessous s'inverse. Sur Terminal-Bench 4, SWE-2 affiche 27.3% contre 55.8% pour Fable 5.1 et 57.9% pour GPT-6 Astra [s1][s3].

| Benchmark | SWE-2 | Fable 5.1 | GPT-6 Astra |
| :--- | ---: | ---: | ---: |
| Terminal-Bench 2.1 | 92.8% | 91.4% | 89.9% |
| Terminal-Bench 4 | 27.3% | 55.8% | 57.9% |

## Les lignes que vous ne pouvez pas reproduire

Repérer l'inversion est facile. Ce qu'elle coûte, personne ne le chiffre. Même famille de benchmarks, même tableau, verdict opposé : « en tête sur Terminal-Bench » n'informe sur rien tant que la version reste implicite. Face à un tableau douteux, le réflexe est d'en reproduire les lignes soi-même, ce qui exige un accès programmatique. Ce réflexe est hors de portée ici : SWE-2 n'a pas d'API autonome ni de poids ouverts [s2], et chaque chiffre ci-dessus sort des runs de Cognition, sans réplication indépendante [s3]. Les lignes publiées restent donc vérifiables par leur seul auteur. Le seul taux de réussite qui vous appartienne est celui que vous mesurez à la main dans Devin, et je retiens cette contrainte plutôt que le 27.3% lui-même.

> [!IMPORTANT]
> Tous les chiffres de ce tableau sont de première main. Aucune réplication indépendante n'existe à ce jour [s3], et il n'y a ni API ni poids pour en produire une [s2]. Lisez la ligne Terminal-Bench 2.1 comme une affirmation de fournisseur non auditable, pas comme un classement.

## Impact pour une équipe

Si vous choisissez ce trimestre un modèle de codage agentique sur la base d'un tableau publié, figez le numéro de version du benchmark dans votre configuration d'évaluation avant toute comparaison : une comparaison qui ne nomme ni 2.1 ni 4 n'en est pas une [s1]. Si vous utilisez déjà Devin, l'action concrète a une échéance. Cognition offre un mois gratuit aux abonnés Pro, Max et Teams [s2] : profitez-en pour rejouer vos tâches réelles les plus dures dans Devin Desktop ou le Devin CLI au lieu de relire le tableau, et notez le taux de réussite obtenu. Ce chiffre pèse plus lourd que les deux lignes ci-dessus, car il est le seul que vous ayez produit. Et s'il vous faut un modèle appelable depuis votre propre orchestration, SWE-2 n'est pas candidat aujourd'hui [s2]. Fusion est la surface à surveiller, et son déploiement est encore en cours.

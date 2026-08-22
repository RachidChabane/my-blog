---
translationKey: arc-agi-3-public-set-scope-travels-with-the-figure
lang: fr
slug: arc-agi-3-le-perimetre-voyage-avec-le-chiffre
title: ARC Prize situe Claude Opus 5 à 30.2 pour cent sur l'ensemble public d'ARC-AGI-3,
  et NVIDIA dit que son exécution AVO ne mesure pas AVO
publishDate: 22-08-2026
kind: benchmark
tags:
- NVIDIA
- ARC-AGI-3
- Claude
- agents
- benchmark
summary: À mon sens, le périmètre d'un chiffre fait partie de ce qu'il affirme. Le
  billet de NVIDIA consacré à l'exécution d'AVO sur l'ensemble public d'ARC-AGI-3,
  mis en ligne le 21 août 2026, le dit de ses propres chiffres, quand l'analyse de
  juillet d'ARC Prize situe Claude Opus 5 à 30.2 pour cent sur ce même ensemble public,
  à effort de raisonnement élevé.
sources:
- label: NVIDIA Technical Blog, AVO on the ARC-AGI-3 public set
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  date: 21-08-2026
- label: The New Stack, on ARC Prize's July ARC-AGI analysis
  url: https://thenewstack.io/nvidia-avo-arcagi3-benchmark/
  date: 21-08-2026
contentHash: sha256:755b74e6cbba426a
publishState: published
---

## Ce qui change

NVIDIA a mis en ligne le 21 août 2026 l'exécution d'AVO sur l'ensemble public d'ARC-AGI-3 [s1]. Avec Claude Opus 5, AVO a bouclé les 25 environnements de cet ensemble public au score RHAE de 100.00, les 183 niveaux en 6,624 actions, contre 7,542 pour VISTA [s1]. L'analyse de juillet d'ARC Prize situe Claude Opus 5 à 30.2 pour cent sur ce même ensemble public, à effort de raisonnement élevé [s2].

## La limite est publiée avec le chiffre

À mon sens, le jeu de tâches, la métrique et l'effort de raisonnement font partie de la revendication ; une citation qui les omet énonce autre chose. NVIDIA le dit dans le passage où il cite ARC Prize : l'exécution repose sur la même famille de modèles avec un réglage de raisonnement différent, un système d'agent et un protocole d'évaluation substantiellement différents, si bien que ces chiffres ne doivent pas se lire comme une mesure directe de l'apport d'AVO [s1]. Le billet refuse aussi de qualifier la comparaison AVO/VISTA d'ablation contrôlée ; parmi les différences citées, le moteur d'agent, la représentation des observations, la mémoire et la gestion du contexte [s1]. The New Stack restitue la même exécution en un seul mouvement : AVO faisant passer Claude Opus 5 d'un score de référence de 30.2 pour cent au niveau du modèle à 100 pour cent dans le système complet [s2]. Le 30.2 précis vient d'ailleurs de cet article [s2].

| Chiffre | Périmètre | Origine |
| --- | --- | --- |
| 100.00 RHAE, 183 niveaux, 6,624 actions | AVO sur l'ensemble public d'ARC-AGI-3, 25 environnements | billet NVIDIA [s1] |
| 7,542 actions | VISTA, même modèle, mêmes 183 niveaux publics | billet NVIDIA [s1] |
| 30.2 pour cent à effort de raisonnement élevé | Claude Opus 5 sur l'ensemble public d'ARC-AGI-3 | analyse ARC Prize de juillet [s2] |

> [!IMPORTANT]
> La limite de lecture de ces chiffres vient du fournisseur, publiée avec le relevé de l'exécution [s1].
> Gardez le jeu de tâches, la métrique et l'effort de raisonnement dans la phrase du score.

## Impact pour une équipe

Qui cite un chiffre ARC-AGI-3 cette semaine est exposé, comme qui compare des harnais d'agents. Fixez le modèle et le jeu de niveaux, notez les actions par niveau résolu à côté du score, et consignez l'effort de raisonnement [s1]. Le risque : citer un chiffre d'ensemble public comme un chiffre ARC-AGI-3 tout court, alors que le billet primaire tient la distinction [s1]. Attendez une ablation contrôlée ; le billet dit clairement que ce n'en est pas une [s1]. Personne n'a mesuré le système de mémoire seul.

---
translationKey: cognition-swe-1-7-rl-harness
lang: fr
slug: cognition-swe-1-7-harnais-rl-devin
title: 'SWE-1.7 de Cognition : le fossé s''est déplacé des poids de base vers le harnais
  RL, et il ne vit que dans Devin'
publishDate: 14-07-2026
kind: release
tags:
- Cognition
- Devin
- SWE-1.7
- agents
- coding
summary: 'Le 08-07-2026, Cognition publie SWE-1.7 : code agentique proche de la frontière,
  gains venus d''une seconde passe de RL sur une base Kimi K2.7, et qui ne tourne
  que dans Devin.'
sources:
- label: 'Cognition blog - SWE-1.7: Frontier Intelligence at a Fraction of the Cost'
  url: https://cognition.com/blog/swe-1-7
  date: 08-07-2026
- label: VKTR - Cognition Ships SWE-1.7 Coding Model Into Devin Via Cerebras
  url: https://www.vktr.com/ai-news/cognition-debuts-swe17-coding-model-in-devin/
  date: 09-07-2026
- label: WinBuzzer - Cognition Launches SWE-1.7 in Devin, Near-Frontier Coding at
    a Discount
  url: https://winbuzzer.com/2026/07/09/cognition-swe-17-adds-near-frontier-coding-scores-to-devin-xcxwbn/
  date: 09-07-2026
contentHash: sha256:378636a739cba062
publishState: published
---

## Ce qui change

Le 08-07-2026, Cognition a publié SWE-1.7, un modèle de code agentique qui se place à quelques points de la frontière fermée sur les bancs d'ingénierie logicielle [s1]. Le plus intéressant tient à sa filiation : il a été entraîné à partir d'une base Kimi K2.7 déjà largement post-entraînée par apprentissage par renforcement (RL), sur laquelle Cognition a ensuite appliqué son propre RL supplémentaire [s1][s2]. Il n'est disponible aujourd'hui que dans Devin (Web, Desktop et CLI), servi via Cerebras à 1000 jetons par seconde [s1][s2].

## Le fossé s'est déplacé vers le harnais RL

La valeur ne vient pas ici d'une nouvelle base. Cognition a entraîné SWE-1.7 depuis une base Kimi K2.7 déjà saturée de RL, et sa seconde passe de RL a tout de même rapporté des gains importants, ce que l'équipe lit comme un argument contre un « plafond du post-entraînement » [s1]. Pour toute équipe qui n'a pas les moyens de pré-entraîner, c'est le signal porteur : les rendements vivent encore dans le harnais et le post-entraînement, pas seulement dans les poids.

Gardons les scores honnêtes [s1] :

| Banc d'essai            | SWE-1.7 | GPT-5.5 | Opus 4.8 |
| :---                    |    ---: |    ---: |     ---: |
| FrontierCode 1.1 Main   |   42.3% |   43.0% |    46.5% |
| Terminal-Bench 2.1      |   81.5% |   84.2% |    86.9% |
| SWE-Bench Multilingual  |   77.8% |   76.8% |    84.4% |

C'est du near-frontier, pas de la frontière. SWE-1.7 est devancé par GPT-5.5 et Opus 4.8 sur FrontierCode Main et sur Terminal-Bench, et ne dépasse GPT-5.5 que sur SWE-Bench Multilingual (77.8% contre 76.8%). L'argument, c'est le coût et le débit de 1000 jetons par seconde sur la courbe de Pareto, pas une nouvelle couronne de capacité.

> [!IMPORTANT]
> SWE-1.7 ne tourne que dans le harnais Devin ; aucune API SWE-1.7 autonome n'est apparue au lancement [s1][s2]. La formule « à une fraction du coût » n'a de sens que si votre flux passe déjà par Devin. Si vous cherchez un modèle de code bon marché appelable dans votre propre orchestration, il n'y a rien à câbler ici pour l'instant.

## Impact pour une équipe

Si vous cherchez un modèle de code économique à intégrer dans votre propre pile d'agents, SWE-1.7 ne vous apporte rien aujourd'hui : il est réservé à Devin, sans API à appeler [s1][s2]. Si vous utilisez déjà Devin, la décision devient un arbitrage coût par tâche et débit sur la courbe de Pareto, pas une montée en capacité : il reste derrière Opus 4.8 et GPT-5.5 sur deux bancs sur trois [s1].

Le résultat à surveiller, c'est la méthode, pas le modèle. Le chemin le moins cher vers un code agentique proche de la frontière ce cycle-ci fut une seconde passe de RL sur une base ouverte tierce plus un harnais propriétaire, pas un nouveau pré-entraînement [s1]. Tant qu'aucune API appelable n'apparaît, traitez l'argument du coût comme une économie interne à Devin, pas comme votre facture.

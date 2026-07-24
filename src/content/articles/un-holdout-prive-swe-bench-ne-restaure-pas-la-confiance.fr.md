---
translationKey: swe-bench-private-holdout-trust
lang: fr
slug: un-holdout-prive-swe-bench-ne-restaure-pas-la-confiance
title: Un holdout privé SWE-bench déplace le problème de confiance vers son auteur
publishDate: 24-07-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'CodeAnt: SWE-bench leaderboard 2026, what the scores mean'
  url: https://www.codeant.ai/blogs/swe-bench-scores
  date: 13-04-2026
- label: 'Scale: SWE-bench Pro public leaderboard'
  url: https://labs.scale.com/leaderboard/swe_bench_pro_public
  date: 24-07-2026
contentHash: sha256:dc55665a114a67ab
publishState: published
---


Un holdout privé et résistant à la contamination réduit le risque de fuite tout en livrant un score qu'aucun tiers ne peut vérifier. J'y vois un échange : on achète la résistance à la contamination avec l'auditabilité, et le problème de confiance se déplace vers la partie qui a construit le benchmark. Le chiffre qui a lancé le débat : Claude Opus 4.5 obtient 80,9 % sur SWE-bench Verified, et 45,9 % sur SWE-bench Pro avec un échafaudage standardisé, sur des tâches qu'il n'a pas pu voir pendant l'entraînement [s1]. Cela fait un écart d'environ 35 points sur un seul modèle, et le réflexe est d'y lire la mesure de ce que le score public devait à la fuite de données. Ce réflexe est faux, et sa manière d'être faux montre précisément les limites de ce qu'un benchmark privé peut acheter.

## Ce que l'écart de score montre vraiment

Deux nombres, un modèle, un delta. La lecture tentante veut que ces 35 points quantifient la contamination : voilà la part du score Verified qui n'était que des tâches mémorisées revenues sous forme de capacité. L'histoire est nette, et je n'y crois pas. Trois effets sont repliés dans ce seul delta, et aucun ne se sépare des deux autres. Pro change les tâches, donc la difficulté a bougé. L'échafaudage y est figé, ce qui restreint la latitude de l'agent à réessayer et à reformuler. Et la conception même de Pro vise à résister à la contamination, donc la fuite a bougé elle aussi. Impossible d'extraire la composante de contamination d'une simple soustraction entre deux pourcentages affichés ; l'arithmétique donne 35 points et aucun moyen de les attribuer.

Ce que l'écart montre, en revanche, est plus étroit et, je crois, plus utile : le chiffre public surévaluait la capacité sur tâches inédites, d'une ampleur que personne ne peut mesurer. C'est un constat qui porte sur le seul score Verified ; il ne dit rien de la fraction de contamination. Il dit que les 80,9 % répondaient à une question (« quelle est la performance sur ces tâches précises et inspectables ») que nous lisions en douce comme une autre (« quelle est la performance sur des tâches de ce genre qu'il n'a jamais vues »). La chute à 45,9 % prouve que ces deux questions n'ont pas la même réponse. Elle ne dit pas de combien elles diffèrent.

> [!CONFIRMED]
> Claude Opus 4.5 obtient 80,9 % sur SWE-bench Verified et 45,9 % sur SWE-bench Pro, avec un échafaudage standardisé et sur des tâches qu'il n'a pas pu voir pendant l'entraînement [s1].

> [!INFERRED]
> J'y lis la preuve que le chiffre public surévaluait la capacité sur tâches inédites, d'une ampleur que personne ne peut mesurer. La part exacte de contamination reste emmêlée avec la difficulté et l'échafaudage dans un seul delta ; elle n'est donc pas récupérable à partir de ces deux valeurs.

## Comment SWE-bench Pro résiste à la contamination

Rendons justice au procédé, car le gain est réel. SWE-bench Pro est construit à partir de dépôts copyleft de type GPL et de bases de code propriétaires privées, ce qui crée des barrières légales et d'accès qui réduisent la probabilité de contamination [s2]. La licence copyleft rend l'ingestion massive dans un corpus d'entraînement juridiquement risquée, et le code propriétaire n'est tout simplement pas dans le crawl. Les deux barrières poussent dans le même sens : les tâches sur lesquelles un modèle est noté ont moins de chances d'être des tâches qu'il a déjà digérées. Sur l'échec précis qu'il vise, le benchmark mémorisé pris pour de la capacité, ce dispositif ferme la brèche laissée ouverte par Verified. Si votre seule inquiétude est la fuite, Pro est une vraie amélioration, et je ne dirai pas le contraire.

## La confiance vient de se déplacer

Voici ce que le classement ne facture pas. Verified était auditable : je pouvais ouvrir les tâches, lire les tests, et décider par moi-même si un score réussi voulait dire que le modèle avait fait quelque chose qui compte. Un holdout privé bâti sur du code propriétaire et copyleft est, par construction, quelque chose que je ne peux pas ouvrir. La barrière qui garde les tâches hors du jeu d'entraînement est la même qui les garde hors de ma portée. Le score devient alors une assertion que je dois accepter de quiconque a fait passer l'évaluation, là où je pouvais auparavant l'inspecter moi-même.

Voilà le déplacement. La confiance passe du benchmark à l'auteur du benchmark, et cet auteur n'est pas un greffier neutre. L'évaluation est un produit que ces organisations vendent. Mon propos porte sur la structure du dispositif, au-delà de toute question de bonne ou de mauvaise foi. Quand le chiffre est inauditable et que la partie qui le produit a un intérêt commercial dans ce chiffre, c'est le « faites-moi confiance » qui porte toute la charge, et il la porte hors du classement, là où aucun lecteur ne peut le voir.

| propriété | SWE-bench Verified | SWE-bench Pro |
| :--- | :---: | :---: |
| tâches inspectables par un lecteur | oui | non |
| résiste à la contamination | faible | fort [s2] |
| la confiance repose finalement sur | l'artefact | l'auteur |

## La plus forte objection, réfutée

Le meilleur argument contre moi est simple, et je veux l'énoncer dans toute sa force : un benchmark inauditable mais non contaminé vaut quand même mieux qu'un benchmark contaminé mais auditable. Un chiffre que vous ne pouvez pas inspecter, mais qui mesure la bonne chose, vaut plus qu'un chiffre inspectable qui mesure la mauvaise. Si Verified notait en douce de la mémorisation, son auditabilité n'était que l'auditabilité d'un instrument cassé.

L'objection a raison sur le fait que ce sont là les deux options, et tort sur le fait que l'une dominerait. Elles échouent de façons différentes, et cette différence est tout l'argument. La contamination est un échec détectable : l'écart de score sur un benchmark résistant à la contamination est précisément la manière de la repérer, ce qui explique que nous ayons cette discussion. Un mauvais jeu de tâches privé est un échec indétectable. Si les tâches réservées sont non représentatives, mal notées ou discrètement faciles, aucun tiers ne peut le voir, parce qu'aucun tiers ne peut voir les tâches. Échanger un mode de défaillance bruyant contre un mode silencieux n'est pas un gain évident, et jamais un gain que vous pourrez vérifier.

> [!CAUTION]
> Passer à un holdout privé transforme un échec détectable (la contamination, visible comme un écart de score) en un échec silencieux (un jeu de tâches privé non représentatif ou mal noté qu'aucune partie externe ne peut inspecter). Le risque devient seulement silencieux, invisible pour tout tiers.

Je ne prétends pas que le chiffre privé est sans valeur, ni que son auteur agit de mauvaise foi. Un score privé peut être rendu vérifiable : pré-enregistrer les engagements de tâches avant que les modèles ne soient évalués, soumettre le jeu à un audit tiers, ou le publier après une fenêtre de rétention. Chacune de ces voies restaure la vérification externe sans renoncer à la résistance à la contamination. Ma charge est précise et étroite : la confidentialité à elle seule ferme la vérification, et ce dispositif livre la confidentialité sans aucun des mécanismes qui la rachèteraient. Résistance à la contamination et auditabilité sont deux propriétés distinctes, et vous ne pouvez pas payer l'une avec l'autre.

## Comment lire un chiffre de classement désormais

Traitez tout chiffre de classement isolé comme une revendication portée par quelqu'un, avec un auteur et un intérêt derrière elle. Une telle revendication peut être vraie ; elle conserve quand même cet auteur et cet intérêt, et elle mérite l'examen que vous réservez à toute autre assertion assortie de ces attributs. Préférez les écarts aux gros titres : le passage de 80,9 à 45,9 [s1] vous en a dit plus que l'un ou l'autre chiffre seul, car une différence entre échafaudages et benchmarks indépendants est plus difficile à truquer qu'un résultat unique et ajusté. Et accueillez les évaluations produites par les fournisseurs avec la même réserve que leurs résultats de benchmark maison, que les tâches soient privées ou non ; la confidentialité alourdit cette réserve et ne dispense jamais de l'appliquer. Un holdout privé achète de la résistance à la contamination ; la vérification par un tiers est un bien distinct, que ce dispositif ne fournit pas.

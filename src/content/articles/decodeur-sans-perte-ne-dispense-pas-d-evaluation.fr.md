---
translationKey: lossless-decoding-precision-property
lang: fr
slug: decodeur-sans-perte-ne-dispense-pas-d-evaluation
title: Un décodeur sans perte ne vous dispense pas d'évaluation
publishDate: 17-09-2026
tags:
- llm-oss
- evaluation
category: essays
difficulty: 3
sources:
- label: Orthrus dual-view diffusion paper, the losslessness guarantee
  url: https://arxiv.org/abs/2605.12825
  date: 12-05-2026
- label: Independent Orthrus reproduction, the claim under test
  url: https://arxiv.org/abs/2609.15504
  date: 14-09-2026
- label: Relaxed speculative decoding practitioner study, the lossless baseline
  url: https://arxiv.org/abs/2607.08690
  date: 09-07-2026
contentHash: sha256:cae94ed6212bc139
publishState: published
---


Servi en BF16, un accélérateur de décodage dit sans perte ne tient plus la promesse qu'on y lit, et cette étiquette ne devrait jamais court-circuiter l'évaluation. L'article Orthrus promet une inférence sans perte avec une accélération allant jusqu'à 7.8x [s1]. Une reproduction indépendante constate qu'en BF16 la trajectoire de sortie ne correspond à la référence que dans 45% des cas pour le checkpoint des auteurs [s3], alors que les benchmarks en aval ne montrent aucune dégradation systématique [s5]. Mis côte à côte, ces deux résultats décrivent un changement qui passe un benchmark agrégé tout en modifiant ce que voient vos utilisateurs.

## Ce que le mot « sans perte » achetait vraiment

La plupart des équipes se trompent, je pense, sur ce qu'elles achètent en choisissant un accélérateur sans perte. Le gain de vitesse fait le titre. L'achat réel est une catégorie comptable : un changement qui produit des sorties identiques relève de l'infrastructure, et un changement d'infrastructure ne passe pas par l'évaluation des capacités.

Le décodage spéculatif a mérité cette catégorie honnêtement. Ses étapes de rejet et de rééchantillonnage préservent exactement la distribution d'échantillonnage du modèle [s8], ce qui est une propriété mathématique de l'algorithme. L'étude de praticiens qui a mesuré ce qui se passe quand on relâche cette garantie énonce le prix de la sortie de catégorie : le relâchement peut exiger une évaluation considérable des capacités, contrairement au décodage spéculatif sans perte [s9]. Cette phrase porte sur les décodeurs relâchés, et je ne l'impute pas à Orthrus. Je la cite parce qu'elle nomme, depuis l'autre rive, l'exemption que l'étiquette « sans perte » est censée accorder.

D'expérience, cette exemption résume toute l'histoire de l'adoption. Personne ne lance d'évaluation des capacités pour une mise à jour de noyau. Un décodeur présenté comme produisant la même séquence de sortie que le modèle autorégressif se range à côté de cette mise à jour, et la file d'évaluation ne le voit jamais passer.

## Ce que la reproduction a réellement mesuré

La reproduction prend l'affirmation au pied de la lettre. Elle reproduit Orthrus de manière indépendante et teste son affirmation centrale, la même séquence de sortie que le modèle autorégressif, sous différentes précisions numériques [s2]. C'est ce protocole qui la rend utile. La justesse des réponses est une autre affaire ; la question posée ici est de savoir si la promesse tient à la précision réellement utilisée en production.

> [!CONFIRMED]
> En BF16, la trajectoire correspond exactement dans 45% des cas pour le checkpoint des auteurs et 43% pour un modèle entraîné indépendamment, sur 1,190 prompts issus de 12 domaines [s3]. La même évaluation de trajectoire en FP32 donne une correspondance exacte sur tous les prompts évalués [s5].

> [!INFERRED]
> Je lis la garantie comme une propriété de l'algorithme et de l'arithmétique sur laquelle il tourne. L'étiquette certifie l'algorithme. Celui qui choisit la précision de service possède l'arithmétique, et l'étiquette ne dit rien de cette moitié-là.

Les auteurs de la reproduction posent le problème dans les mêmes termes. Un algorithme peut préserver en principe le calcul autorégressif voulu et produire malgré tout des sorties discrètes différentes une fois implémenté en arithmétique à précision finie [s6]. Le caractère discret des sorties en fait une arête franche. Un token bascule ou ne bascule pas, et après une seule bascule le reste de la trajectoire appartient à une autre conversation.

Le fait que les deux checkpoints tombent si près l'un de l'autre mérite qu'on s'y arrête. Un chiffre isolé, obtenu sur les poids des auteurs, pourrait être mis sur le compte de ce checkpoint. Un second modèle, entraîné séparément, qui atterrit au même endroit me dit que le comportement tient à la méthode elle-même à cette précision.

## Pourquoi un benchmark plat rassure à tort

C'est le résultat des benchmarks qui rend la situation dangereuse. Malgré la divergence, Orthrus ne montre aucune dégradation systématique sur les benchmarks lm-eval-harness en aval [s5]. Une équipe qui relance sa suite habituelle après le changement obtient un tableau de bord au vert et en conclut que l'étiquette a tenu.

Elle a tenu pour la justesse. Elle a cédé pour l'identité. Ce sont deux contrats distincts, et à mon avis la plupart des systèmes en production dépendent de l'identité à des endroits que personne n'a documentés.

La reproduction ajoute le détail qui fait passer la question de la curiosité au problème d'exploitation : la probabilité de correspondance exacte est fortement associée à la perplexité du modèle de référence conditionnée à la réponse [s4]. J'en retiens que la divergence dépend de l'entrée. Elle se concentre sur les réponses dont le modèle de référence était le moins sûr. Or un benchmark agrégé fait par construction la moyenne sur toute la distribution, et il ne peut donc pas vous dire si les sorties modifiées tombent dans la partie de votre trafic qui compte pour vous.

| Contrôle | Ce qu'il compare | Ce qu'il voit après un passage en BF16 |
| :--- | :--- | :--- |
| Benchmark agrégé | Score de tâche sur une suite | Si la capacité moyenne a bougé |
| Correspondance exacte par prompt | Trajectoire de tokens face à la référence | Si une sortie donnée a changé |
| Taux de correspondance par strate de perplexité | Correspondance exacte par tranche de perplexité de référence | Où se concentrent les sorties modifiées |

> [!WARNING]
> Le mode de défaillance que je prévoirais est silencieux. Les tests de régression sur sorties de référence virent au rouge sur une partie des prompts juste après le déploiement, l'équipe les classe comme instables puisque le benchmark est plat et le décodeur sans perte, et les instantanés sont régénérés. La suite de régression vient d'absorber le changement qu'elle devait attraper.

La reproductibilité casse de la même façon. Un signalement d'utilisateur qui cite une réponse exacte ne peut plus être rejoué sur le chemin qui l'a produite, puisque l'ancien et le nouveau chemin peuvent justement diverger sur ce prompt-là.

## L'objection la plus solide

Voici l'argument contre moi, dans sa version la plus forte. Servir en BF16 n'a jamais été exact au bit près. Changez la taille de batch, le noyau d'attention ou le GPU, et un modèle autorégressif ordinaire en demi-précision dérivera lui aussi sur les tokens à faible marge, lesquels se regroupent précisément dans les réponses à forte perplexité que pointe la reproduction. Rien dans ces résultats ne fournit de référence à précision égale mesurant combien de fois le modèle de référence se contredit lui-même après un changement comparable. On ne peut donc pas imputer les 45% [s3] à Orthrus, et dire qu'une garantie démontrée en arithmétique exacte ne survit pas à la demi-précision frôle la lapalissade.

J'en accepte l'essentiel. Je ne peux pas affirmer qu'Orthrus diverge davantage qu'un service BF16 ordinaire, et je ne l'affirme pas. Le coût d'évaluation du décodage relâché n'est pas non plus un coût d'Orthrus ; il revient aux décodeurs qui modifient la distribution à dessein.

Ce que l'objection concède, c'est justement ma thèse. Si un déploiement d'Orthrus en BF16 se comporte comme n'importe quel autre changement numérique de la pile de service, il lui faut les contrôles d'un changement numérique : une comparaison des sorties avec l'ancien chemin, où l'on s'attend à des écarts et où on les examine. L'étiquette supprime précisément cette attente. Qu'une mise à jour de noyau décale des sorties ne surprend personne. Un décodeur présenté comme produisant la même séquence fait passer chaque sortie décalée pour un test cassé, et c'est ainsi que survient l'échec de régression décrit plus haut.

> [!NOTE]
> Rien de tout cela ne fait d'Orthrus une mauvaise méthode. Le résultat en FP32 montre que le mécanisme de consensus tient sur chaque prompt évalué dès que l'arithmétique est exacte.

## Ce que j'exigerais avant le changement

La recommandation de la reproduction elle-même fixe le bon plancher : les évaluations d'accélération sans perte devraient préciser à la fois le critère opérationnel d'équivalence et la précision numérique sous laquelle il a été mesuré [s7]. J'en ferais une fiche jointe à la demande de changement, remplie à la précision réellement servie :

```text
changement : remplacement de l'accélérateur de décodage
précision_de_service : bf16
critère_d_équivalence : trajectoire de tokens exacte, glouton, face au chemin actuel
taux_de_correspondance_exacte : <mesuré sur notre propre jeu de prompts>
correspondance_par_perplexité_de_référence : <par strate, de la plus basse à la plus haute>
écart_benchmark_agrégé : <notre suite habituelle>
décision : <livrer / livrer en régénérant les instantanés / suspendre>
```

Chaque champ a une fonction. La ligne de précision empêche quiconque de citer un résultat FP32 pour un déploiement BF16. Les strates de perplexité montrent si les sorties modifiées tombent sur la traîne incertaine de votre trafic. L'écart de benchmark reste, mais comme une donnée parmi d'autres, et il cesse d'être le verrou.

La ligne de perplexité coûte moins cher qu'il n'y paraît. Vous faites déjà tourner le chemin de référence pour obtenir les trajectoires de comparaison ; conservez les log-probabilités par token de ce même passage et répartissez les prompts en tranches à partir d'elles. Aucun appel de modèle supplémentaire, aucun nouveau harnais. Le vrai coût est de décider à l'avance quelles strates vous refusez de voir changer, et je trancherais cette question avant que les chiffres ne reviennent.

C'est à mon avis la ligne de décision qui change les comportements. « Livrer en régénérant les instantanés » est une issue légitime, et l'écrire fait des fichiers de référence régénérés un choix consigné. Personne ne pourra plus parler après coup de simple ménage de tests instables. Si vous servez en FP32, l'essentiel de cette fiche se réduit à une seule ligne mesurée, et c'est le moyen le moins coûteux que je connaisse de savoir si l'étiquette vous concerne.

---
translationKey: coding-agent-scaffold-confound
lang: fr
slug: scaffold-pas-modele-score-swe-bench
title: Le scaffold, pas le modèle, décide de votre score SWE-bench
publishDate: 18-06-2026
tags:
- evaluation
- agentic-coding
- agents
category: essays
difficulty: 3
sources:
- label: 'Inside the Scaffold: A Source-Code Taxonomy of Coding Agent Architectures
    (arXiv:2604.03515)'
  url: https://arxiv.org/abs/2604.03515
  date: 03-04-2026
- label: 'SWE-bench in 2026: Benchmarks vs Scaffolding Reality (Digital Applied)'
  url: https://www.digitalapplied.com/blog/swe-bench-verified-june-2026-benchmark-vs-scaffolding-analysis
  date: 16-06-2026
contentHash: sha256:535ced19f149f0f9
publishState: published
---


On lit un score SWE-bench sur un classement et on le prend pour une propriété du modèle. Or, pour la comparaison qui guide vraiment un achat, choisir entre des modèles de codage proches de la frontière, ce score ne suffit pas à les départager. La raison est concrète : trois systèmes d'agents différents ont fait tourner le même Claude Opus 4.5 sur SWE-bench Pro et ont produit des résultats allant de 50,2 % à 55,4 % [s2]. Le modèle n'a jamais changé ; seul le scaffold autour de lui a changé. À mon sens, cet écart d'un peu plus de cinq points, à modèle figé, est le fait le plus sous-rapporté de l'évaluation d'agents, car sur un classement de modèles voisins il est aussi large que la distance que vous cherchez à lire entre deux lignes.

L'argument est volontairement étroit. Pour un tri grossier des capacités, un modèle de frontière contre un modèle vieux de deux ans, le signal du modèle domine et un score brut les ordonne correctement. Ce n'est pas la décision que prend une équipe qui a déjà retenu trois modèles actuels dont les scores auto-déclarés tiennent dans quelques points. C'est cette décision-là qui nous occupe, et dans ce régime un score réduit au seul nom du modèle est du bruit.

## Le même modèle, cinq points d'écart

Quelqu'un a déjà mené la version la plus propre de cette expérience, trois systèmes sur un seul Claude Opus 4.5 figé [s2], et la seule question ouverte est ce qui a produit l'écart. Rien dans les poids du modèle n'a bougé. Ce qui a bougé, c'est la boucle de contrôle, l'ensemble d'outils que le modèle pouvait appeler, et la façon dont chaque système compactait le contexte quand la tâche dépassait la fenêtre.

Un écart de cette taille n'est pas un artefact d'arrondi. Sur un classement où les modèles de codage actuels se regroupent, deux lignes voisines sont souvent séparées par moins de cinq points. La variance du scaffold, mesurée ici à modèle figé, est donc comparable ou supérieure à la distance entre modèles que l'acheteur essaie de trancher. Quand le bruit sur une mesure est aussi large que le signal attendu de la comparaison de deux mesures, le classement que ces deux lignes suggèrent n'est pas identifiable. Vous ne pouvez pas dire si la ligne A bat la ligne B parce que son modèle est meilleur ou parce qu'on lui a écrit un meilleur scaffold.

## Le scaffold est un vaste espace de conception caché

L'objection naturelle est que le scaffold serait une enveloppe mince et quasi fixe, donc la variance devrait rester faible et prévisible. Le code source dit le contraire. Une taxonomie bâtie directement à partir du source de vrais systèmes d'agents de codage a relevé des stratégies de contrôle allant du pipeline fixe au Monte Carlo Tree Search, des nombres d'outils allant de 0 à 37, et une compaction de contexte couvrant sept stratégies distinctes [s1]. Ce n'est pas une enveloppe ; c'est un espace de conception doté d'assez de degrés de liberté pour déplacer un benchmark des cinq points que l'on vient de voir.

> [!CONFIRMED]
> Une taxonomie du code source de systèmes d'agents de codage a relevé des nombres d'outils allant de 0 à 37 et une compaction de contexte couvrant sept stratégies distinctes [s1].
>
> [!INFERRED]
> D'après mon expérience, cette amplitude signifie qu'un seul nom de modèle correspond à une distribution de scores, pas à un point, si bien que deux lignes voisines d'un classement ne sont pas départageables à partir du seul nom du modèle.

La conséquence pratique est que « Claude Opus 4.5 obtient X sur SWE-bench » est une phrase incomplète. Le même nom de modèle, placé dans un pipeline fixe sans outil ou dans une boucle à 37 outils pilotée par recherche avec compaction agressive, produit des nombres différents, et le classement n'en enregistre qu'un seul, sans aucun champ vous disant de quel scaffold il provient.

## Le nombre auquel vous vous fiez n'est presque jamais audité

Sur les 100 modèles listés par llm-stats au 16 juin 2026, un seul porte un badge de vérification indépendante ; les 99 autres scores ont été soumis par les éditeurs des modèles eux-mêmes [s3]. C'est un second défaut, indépendant du premier : le confondant du scaffold porte sur la variance, celui-ci sur le fait que personne n'a vérifié le nombre. La comparaison à laquelle les équipes se fient est donc presque entièrement non auditée, et un éditeur qui rapporte son propre score choisit aussi le scaffold sous lequel il le rapporte.

Ces deux défauts s'additionnent au lieu de se confondre. L'auto-déclaration ne prouve pas à elle seule qu'un nombre est faux ; un éditeur peut suivre un protocole propre et reproductible. Mais ajoutez-la à un scaffold non divulgué et vous obtenez le pire cas : un nombre dont la plus grande source de variance est précisément ce que le rapport omet, produit par la partie la plus incitée à choisir une configuration flatteuse, et vérifié par personne. L'acheteur ne peut ni reconstituer le scaffold à partir du rapport, ni s'appuyer sur un audit, si bien que le confondant est à la fois grand et inobservable.

## Le steelman : le modèle ne domine-t-il pas malgré tout ?

Le contre-argument le plus fort mérite d'être posé pleinement. Un écart de cinq points dû au scaffold ne réduit pas le signal du modèle à du bruit si les effets du modèle dominent ceux du scaffold sur toute la gamme des modèles. Un modèle faible dans un excellent scaffold perd encore face à un modèle fort dans un scaffold médiocre. L'écart mesuré plus haut l'est à modèle figé : il montre la variance interne au modèle et ne dit rien, à elle seule, de la variance entre modèles, qui sur SWE-bench couvre des dizaines de points du modèle ancien au modèle de frontière. Si les écarts entre modèles écrasent celui du scaffold, un score brut ordonne encore correctement les modèles pour la décision que la plupart croient prendre, et le qualifier de bruit est excessif.

Ce contre-argument est juste, et il resserre la portée au lieu de la briser. Sur un large écart de capacités, le signal du modèle domine : un score brut placera un modèle de frontière au-dessus d'un modèle vieux de deux ans presque à chaque fois. Mais la décision de classement qui pique vraiment est celle des modèles voisins : une équipe a retenu des modèles actuels dont les scores tiennent dans quelques points, et elle lit l'ordre sur ces quelques points. C'est exactement le régime où l'écart interne dû au scaffold est de la taille de l'écart entre modèles, où la taxonomie montre que le confondant est grand et non divulgué, et où l'auto-déclaration empêche toute vérification. Le modèle domine le tri grossier et perd l'identifiabilité sur le tri fin, et c'est sur le tri fin que vit l'achat.

## Que faire

Le remède est une convention de rapport, pas un nouveau benchmark. Tenez tout chiffre SWE-bench pour incomplet tant qu'il ne nomme pas son scaffold : la boucle de contrôle, le nombre d'outils et la stratégie de compaction. Un score assorti de cette divulgation est une mesure comparable ; un score réduit au nom du modèle est un point de données dont on ne vous a jamais montré la barre d'erreur.

> [!WARNING]
> Le mode de défaillance nommé est de retenir le plus élevé de deux scores SWE-bench auto-déclarés voisins dont la distance est plus petite que la variance du scaffold. Vous ne choisissez pas un meilleur modèle ; vous choisissez un scaffold mieux rapporté, et vous ne reproduirez pas le nombre dans le vôtre.

Voici donc la règle que je suis : pour une sélection entre modèles voisins, rapportez le scaffold à côté de tout score et préférez les nombres qui portent un badge de vérification indépendante. À défaut, traitez le score réduit au nom du modèle comme du bruit et décidez sur ce que vous pouvez réellement observer, votre propre scaffold exécutant vos propres tâches. Le classement situe à peu près un modèle dans le club de frontière, mais il ne dit pas qui l'emporte à l'intérieur, et fixer la troisième décimale n'y changera rien.

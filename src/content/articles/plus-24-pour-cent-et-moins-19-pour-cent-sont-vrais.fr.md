---
translationKey: cli-agent-productivity-proxy-choice
lang: fr
slug: plus-24-pour-cent-et-moins-19-pour-cent-sont-vrais
title: Plus 24 pour cent et moins 19 pour cent sont vrais tous les deux
publishDate: 18-07-2026
tags:
- agentic-coding
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: arXiv 2607.01418v1, Microsoft CLI coding agent rollout study
  url: https://arxiv.org/abs/2607.01418
  date: 01-07-2026
- label: METR randomized controlled trial, experienced open-source developers
  url: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
  date: 10-07-2025
contentHash: sha256:65f0c475cf1c03f3
publishState: published
---


Il n'existe aucun chiffre de productivité transposable pour les agents de code : dans cet état des preuves, l'instrument pèse plus lourd que l'outil, et le choix du proxy décide du signe du titre. Une étude portant sur des dizaines de milliers d'ingénieurs de Microsoft rapporte que les adoptants d'un agent de code en ligne de commande ont fusionné environ 24 % de pull requests de plus qu'ils ne l'auraient fait autrement [s1]. Un essai contrôlé randomisé de METR rapporte que des développeurs expérimentés ont mis 19 % de temps en plus à résoudre des tickets lorsqu'ils étaient autorisés à utiliser des outils d'IA [s2]. Les deux résultats sont vrais. Aucun des deux n'est le chiffre que vous pouvez transporter dans votre propre déploiement.

## Ce que chaque étude a réellement mesuré

Mettez les deux protocoles côte à côte et la contradiction apparente cesse de parler d'IA. Trois décisions déterminent le résultat, et chacune a été prise avant que la moindre donnée soit collectée : qui se retrouve dans l'échantillon, sur quel code ces personnes travaillent, et ce qui compte comme production.

| Dimension | Déploiement Microsoft | Essai METR |
| --- | --- | --- |
| Population | des dizaines de milliers d'ingénieurs ayant adopté l'agent d'eux-mêmes [s1] | des développeurs open source expérimentés affectés à des conditions [s2] |
| Substrat | le travail à l'échelle de l'organisation | des tickets dans le dépôt du développeur lui-même [s2] |
| Unité mesurée | les pull requests fusionnées [s4] | le temps réel pour résoudre un ticket [s2] |
| Fenêtre | quatre mois [s4] | un ticket à la fois [s2] |

Ce tableau ne décrit pas deux tentatives de mesure d'une même grandeur, mais la spécification de deux grandeurs distinctes. Le chiffre du déploiement répond à une question d'offre : quand des ingénieurs qui voulaient cet outil l'obtiennent, combien de travail supplémentaire, comptabilisé en pull requests fusionnées, apparaît dans l'organisation ? Le chiffre de l'essai répond à une question de coût : quand un développeur qui garde déjà tout un dépôt en tête reçoit des outils d'IA sur ses propres tickets, combien de temps le travail prend-il ? Ce ne sont pas deux réponses à une même question. Ce sont deux questions, et chaque protocole ne répond qu'à la sienne.

Or l'outil est à peu près la seule variable que la paire laisse inchangée. Tout ce qui varie relève de l'instrumentation.

## Le proxy est le résultat

Une pull request fusionnée et une minute de temps réel ne se moyennent pas. Ce ne sont pas deux lectures bruitées d'une même grandeur latente, mais deux unités de mesure différentes, et l'équipe qui en choisit une a déjà choisi l'essentiel de sa conclusion. Ce qui rend l'étude de déploiement sérieuse, c'est qu'elle le dit elle-même, énonçant son proxy et sa limite dans la même phrase [s4].

> [!CONFIRMED]
> L'étude de déploiement utilise les pull requests fusionnées comme proxy de la production et reconnaît qu'une pull request fusionnée n'équivaut pas à la valeur qu'elle apporte, le gain se maintenant sur une fenêtre de quatre mois [s4].

> [!INFERRED]
> Je lis cette concession comme l'argument entier en réduction. Un déploiement chiffré sur l'un ou l'autre des titres seuls est chiffré sur l'instrumentation et non sur un effet, puisque l'unité de mesure avait déjà fixé le signe du résultat avant que quiconque installe l'outil.

Il existe une version triviale de ce constat, et je préfère la désavouer avant qu'on me la retourne. La version triviale dit que les protocoles diffèrent : personne ne le conteste et cela ne change aucune décision. Ma thèse est comparative et empirique : pour les agents de code, à l'état actuel des preuves, la variance imputable au choix de l'instrument dépasse la variance imputable à l'outil. C'est un pari sur des ordres de grandeur. Il peut être perdu, et la dernière section dit précisément comment.

## L'objection sérieuse : l'échelle est réelle

La meilleure objection ne consiste pas à dire que METR se trompe, mais que METR est petit. Des dizaines de milliers d'ingénieurs observés sur une fenêtre de quatre mois [s1] [s4], ce n'est pas le même ordre de preuve que quelques dizaines de développeurs sur quelques centaines de tickets, et le déploiement mesure en outre une génération d'outils plus récente. Dans cette lecture, le gain de 24 % est le signal, et le ralentissement de 19 % un artefact de petit échantillon, produit par une population peu représentative parce qu'anormalement à l'aise sur sa propre base de code.

Concédons l'échelle. Elle est réelle et je ne l'échangerais pas contre une histoire plus commode. Reste à voir ce que l'échelle ne répare pas.

Les résultats de l'étude de déploiement décrivent eux-mêmes comment les gens sont entrés dans l'échantillon. Le premier usage s'est propagé principalement par les réseaux sociaux internes, et la rétention était davantage associée à l'activité de codage des ingénieurs qu'à leurs caractéristiques démographiques [s1]. C'est la description d'un processus de sélection, non d'une affectation aléatoire. Les adoptants étaient les mieux connectés et les déjà actifs, c'est-à-dire exactement la population dont on attendrait plus de pull requests fusionnées en quatre mois, avec ou sans agent. Un échantillon plus grand ne corrige pas une sélection ; il rend une estimation sélectionnée plus précise.

L'unité de mesure, elle non plus, n'a pas bougé. Davantage de pull requests fusionnées est un fait sur des événements de fusion, et l'article refuse d'assimiler cela à de la valeur [s4]. L'échelle vous achète une estimation plus serrée d'une grandeur que ses propres auteurs vous déconseillent de lire comme ce qui vous intéresse.

## Le piège de l'auto-évaluation

Voici le mode de défaillance nommé, et la raison pour laquelle je hiérarchise les trois signaux disponibles au lieu de les traiter symétriquement. Les participants de METR anticipaient une accélération de 24 %, et même après avoir subi le ralentissement ils croyaient encore que l'IA les avait accélérés de 20 % [s3], face à une mesure de 19 % de temps en plus [s2]. Ce n'est pas du bruit autour d'une vraie valeur. C'est un signal qui s'est déplacé en sens inverse de son référent, dans des conditions à peu près aussi favorables à une perception juste qu'on puisse les organiser : des praticiens experts, leur propre code, une tâche tout juste terminée.

Vient maintenant le rétrécissement, parce que la version large de cette thèse est fausse et que je ne tiens pas à la défendre. Les développeurs rapportent honnêtement leurs préférences. Ils rapportent honnêtement les frictions, les endroits où l'outil gêne, leur envie de le garder. Ce que l'écart discrédite, c'est le temps gagné auto-déclaré en tant qu'estimation du temps gagné.

La distinction n'a rien d'académique, car la substitution qu'elle interdit est exactement celle que fait tout dossier de déploiement. Une enquête de satisfaction finit lue comme une estimation de débit. Des ingénieurs qui se disent plus rapides, c'est un fait réel sur la sensation que procure l'outil ; au vu de ces preuves, ce n'est pas un fait sur des heures.

## Ce que j'instrumenterais à la place

Choisissez l'unité de mesure avant de choisir l'outil, et gardez-la inchangée pendant que la population évolue. C'est la décision que je défendrais en revue de déploiement, et elle ne coûte rien si elle est prise tôt. Si vous ne pouvez financer qu'une seule mesure, mesurez le temps réel de résolution sur un type de tâche que votre équipe livre vraiment, sur les mêmes personnes, avant et après. C'est ingrat, cela ne produira aucun pourcentage citable pour une diapositive, et c'est précisément la qualité recherchée.

> [!WARNING]
> N'étalonnez pas votre déploiement sur un pourcentage publié par une autre organisation. Vous compareriez d'un coup votre population, votre substrat et votre unité de mesure à trois de ceux de quelqu'un d'autre, donc tout écart constaté est par construction inattribuable.

Les refus comptent autant que la mesure. Refusez le temps gagné auto-déclaré comme preuve du temps gagné [s3]. Refusez un proxy choisi après l'arrivée des données. Refusez une comparaison de volumes de fusion entre un groupe volontaire et tous les autres, forme contre laquelle le résultat de sélection de l'étude elle-même met en garde [s1].

Reste ce qui me ferait changer d'avis, énoncé à l'avance pour que la position demeure perdable. Gardez le proxy inchangé et faites varier la population : mesurez le temps réel de résolution chez des adoptants volontaires et chez des développeurs affectés. Ou bien gardez la population et le substrat inchangés et faites varier le proxy : notez un même groupe d'ingénieurs sur les pull requests fusionnées et sur le temps de résolution, sur la même fenêtre. Si le signe tient dans l'une ou l'autre expérience, le titre suit l'outil et non l'instrument, et j'ai tort. Tant que personne n'a mené l'une des deux, la question « de combien les agents de code nous accélèrent-ils » n'a pas de réponse transposable, et la seule réponse utile est une mesure qui vous appartient.

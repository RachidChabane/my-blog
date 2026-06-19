---
lang: fr
translationKey: agent-pass-at-1-long-horizon-reliability
slug: pass-at-1-ignore-la-fiabilite-long-horizon
title: "Le score pass@1 de votre agent est aveugle à la fiabilité long-horizon"
tags: [agents, evaluation]
category: essays
difficulty: 3
---

Sélectionner un agent autonome multi-étapes sur son score pass@1, c'est optimiser le mauvais chiffre : capacité et fiabilité coïncident à l'horizon un mais divergent dès que l'horizon s'allonge, si bien qu'un leader sur tâches courtes peut figurer parmi les moins fiables sur un travail long. Le coût se mesure, il n'a rien de rhétorique. Dans une simulation d'entreprise couvrant 23 LLM et quatre frameworks d'agents, seuls 15,4 % des essais survivent à l'horizon complet [s2], et les modèles plus gros ne battent pas de façon fiable les plus petits. Un classement pass@1 ne peut pas vous le montrer, car il n'échantillonne jamais la variable qui décide du résultat.

La défense du pass@1 tient en deux mots : bon marché et honnête. Il demande si un modèle sait produire une sortie correcte une fois sur une tâche bornée, et pour une seule complétion, un appel d'outil ou une réponse RAG, il prédit ce que ressent l'utilisateur. Je ne le conteste pas. Je soutiens qu'à l'instant où votre agent enchaîne de nombreuses étapes sans supervision, le chiffre auquel vous faisiez confiance cesse de classer les modèles qui vous importent, et le classement ne vous prévient pas.

## Pourquoi pass@1 et la fiabilité divergent

Le mécanisme relève de la multiplication. La compétence par étape se compose le long d'une trajectoire : un faible écart de taux d'erreur par étape, invisible à la longueur un, domine à la longueur cinquante. Cette composition explique pourquoi capacité et fiabilité, une seule et même grandeur à l'horizon un, se séparent quand la durée croît, et pourquoi le pass@1 sur tâches courtes est structurellement aveugle à la divergence [s1]. Et les modes de défaillance qui mettent fin aux travaux longs, l'accumulation d'erreurs et la dérive du contexte, sont ceux qu'une tâche s'arrêtant après une étape n'échantillonne jamais.

La longueur de tâche atteignable est elle-même fonction du niveau de fiabilité exigé, et une mesure longitudinale indépendante le rend concret : la longueur de tâche que les agents de modèles de pointe accomplissent en autonomie avec 50 % de fiabilité double environ tous les 7 mois [s4]. Exigez une fiabilité supérieure à 50 % et la longueur sur laquelle vous pouvez compter se réduit ; l'horizon n'est pas une propriété fixe du modèle, c'est une fonction du degré de fiabilité requis, et un pass@1 unique fige la barre de fiabilité sur « une fois » sans vous le dire.

## Le coût mesuré

Dans une simulation d'allocation de ressources en entreprise menée sur 23 LLM et quatre frameworks d'agents, seuls 15,4 % des essais survivent à l'horizon complet, les modèles plus gros ne surpassent pas de façon fiable les plus petits, et les défaillances se propagent en cascade sur l'observation, le moment de l'action et le dimensionnement du capital [s2]. La seconde proposition est l'essentielle : la taille, l'axe selon lequel la plupart des classements sont triés, n'achète pas la fiabilité ici.

> [!CONFIRMED]
> Sur 23 LLM et quatre frameworks d'agents, seuls 15,4 % des essais survivent à l'horizon complet, et les modèles plus gros ne surpassent pas de façon fiable les plus petits [s2].
>
> [!INFERRED]
> Je lis l'effondrement de la survie, joint à l'absence de tout bénéfice de la taille, comme la preuve qu'un classement pass@1 peut placer un modèle fragile en tête : la propriété qui décide d'un travail long est celle qu'un score sur tâche courte ne mesure jamais.

Si la fiabilité suivait la capacité, les modèles plus gros survivraient plus longtemps ; ce n'est pas le cas, donc le proxy casse là même où vous en avez besoin. C'est l'inversion de rang que les données confirment : non pas « les travaux longs sont plus durs » (chacun le sait), mais que l'ordre des modèles peut changer quand on bascule la métrique de la capacité en un coup vers la survie sur un horizon.

## Structurel, pas de la malchance

Un repli naturel consiste à qualifier ce taux de survie de queue de malchance, artefact d'un benchmark difficile. Le dossier de diagnostic dit l'inverse. Une étude rassemblant plus de 3100 trajectoires sur quatre domaines agentiques représentatifs caractérise des schémas de dégradation dépendants de l'horizon [s3], ce qui signifie que la casse a une forme : elle se répète d'un domaine à l'autre, elle suit la longueur d'horizon, et elle peut être localisée plutôt qu'écartée d'un haussement d'épaules. Si la dégradation était du bruit, le remède serait la réduction de variance. Parce qu'elle est structurelle et dépendante de l'horizon, le remède est de mesurer le long de l'axe où elle vit : la longueur d'horizon.

## Le steelman, et la réponse

L'objection la plus forte ne dit pas que la thèse est fausse, mais que sa portée est étroite. Le pass@1 est bon marché, et pour la charge de travail modale, une tâche bornée où l'horizon un est tout le travail, capacité et fiabilité sont le même chiffre ; un score sur tâche courte corrèle alors avec le vécu de l'utilisateur. Sous cette lecture, la prescription « rapportez une courbe, pas un chiffre » ne touche que les équipes d'autonomie long-horizon, qui font déjà des évaluations de bout en bout et se méfient déjà d'un score unique. Pour tous les autres, la courbe coûte cher à produire et apporte peu, si bien que l'affirmation paraît soit triviale (les travaux longs sont plus durs), soit excessive (les classements de tâches courtes vont très bien pour ce qu'ils mesurent).

Cette objection concède l'argument central : elle accorde que capacité et fiabilité coïncident à l'horizon un et divergent quand la longueur croît, donc le différend restant porte sur l'ampleur du public concerné, non sur la réalité de l'effet. L'objection de trivialité tombe, car l'affirmation est falsifiable au-delà de « les travaux longs sont plus durs » : elle prédit que l'ordre des modèles change avec l'horizon, qu'un leader pass@1 peut perdre sur la survie, et une difficulté monotone seule ne le prédit pas. L'effondrement de la survie sans bénéfice de la taille [s2] et le dossier de dégradation multi-domaines [s3] sont précisément la preuve que l'inversion est réelle. La frontière de portée est réelle et l'article doit l'énoncer clairement, plutôt que de laisser entendre que les scores sur tâches courtes seraient largement invalides : ils restent valides pour ce qu'ils mesurent.

## Ce qu'il faut faire

Si vous livrez des tâches courtes et bornées, un score sur tâche courte suffit et une courbe est un effort gâché. Dès que votre horizon est assez long pour que les erreurs par étape se composent, sélectionnez sur une courbe de fiabilité selon l'horizon, avec des modes de défaillance nommés. Traitez un pass@1 isolé comme muet sur le comportement long-horizon, non comme une garantie.

| Dimension | pass@1 sur tâches courtes | Courbe de fiabilité selon l'horizon |
| :--- | :--- | :--- |
| Ce qu'elle mesure | succès en un coup à l'horizon un | survie à mesure que l'horizon grandit |
| Horizon échantillonné | une seule longueur courte | une plage de longueurs |
| Prédit la survie sur travail long | non | oui |

La courbe n'a rien d'exotique : faites tourner l'agent à plusieurs longueurs d'horizon, fixez une barre de fiabilité, et rapportez la longueur qu'il tient à cette barre, accompagnée des modes de défaillance qui mettent fin aux exécutions. Elle révèle aussi le croisement qu'un classement masque, l'horizon au-delà duquel un modèle moins cher mais qui tient sa fiabilité dépasse un modèle plus onéreux qui se dégrade, soit la comparaison dont une décision d'achat a vraiment besoin. C'est plus de travail que de recopier un chiffre depuis un classement, et c'est le seul artefact qui classe les modèles comme le fera votre usage réel en production.

> [!WARNING]
> Un pass@1 unique est muet sur le comportement long-horizon, il n'en est pas la preuve. Choisir le plus élevé de deux scores pass@1 pour un travail autonome long, c'est choisir sur une métrique qui n'échantillonne pas l'horizon que vous achetez.

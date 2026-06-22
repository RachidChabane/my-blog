---
lang: fr
translationKey: llm-temp0-nondeterminism-batch-invariant
slug: la-temperature-zero-n-est-pas-deterministe
tags: [qualite, evaluation]
category: essays
difficulty: 4
title: "La température zéro n'est pas déterministe, et le GPU n'est pas en cause"
---

Réglez un LLM sur la température 0, relancez mille fois la même requête, et vous n'obtiendrez pas mille réponses identiques ; l'excuse habituelle veut que l'arithmétique flottante du GPU soit intrinsèquement non reproductible, et cette excuse est fausse. Le non-déterminisme est un choix d'ingénierie dans la façon dont les noyaux de service réduisent sur un batch dont la taille dérive avec la charge, pas une loi du silicium. La preuve tient en une intervention à variable unique : à température 0, un modèle à l'échelle de la production a produit 80 complétions uniques sur 1000 exécutions, et avec des noyaux invariants au batch les 1000 se sont effondrées sur une sortie identique [s1]. Cette mesure devrait, selon moi, mettre à la retraite la formule « le non-déterminisme, c'est juste le GPU ».

Si cela compte au-delà de l'anecdote, c'est que la reproductibilité est d'ordinaire tenue pour une propriété qu'on a ou qu'on n'a pas, une caractéristique du matériel reçu. Elle n'en est pas une. C'est un réglage de la pile de service, doté d'un prix que vous pouvez lire, et la plupart du temps vous n'avez même pas à pousser le curseur à fond.

## Le mensonge de la température zéro

Le décodage glouton à température 0 est censé être le cas déterministe : on prend l'argmax à chaque étape, sans échantillonnage, même entrée donc même sortie. En pratique, les API dérivent quand même. La mesure de Thinking Machines rend l'écart concret : même avec un échantillonnage rendu théoriquement déterministe, ces sorties distinctes ne sont pas un frémissement d'arrondi sur la dernière décimale d'un logit [s1]. Ce sont des textes entiers qu'un utilisateur pourrait lire, différents d'une exécution à l'autre.

L'explication populaire invoque le flottant et la concurrence : un GPU lance des milliers de threads, l'addition n'est pas associative, donc, à les en croire, l'ordre des opérations est insondable et la sortie de ce fait incorrigible. Ce récit nomme un fait réel et en tire la mauvaise conclusion. La non-associativité est nécessaire à la dérive, mais ce n'est pas elle qui fait qu'une exécution donnée diffère de la suivante.

## Ce n'est pas le flottant, c'est le batch

La vraie variable, c'est le batch. Les serveurs d'inférence pratiquent le batching dynamique : votre requête est réduite avec les autres requêtes qui se trouvent en vol, or la raison première du non-déterminisme des endpoints est que la charge, et donc la taille de batch, varie d'une exécution à l'autre [s1]. Le matmul, le RMSNorm et l'attention réduisent tous le long de cette dimension de batch, et une forme de batch différente signifie un ordre de réduction différent. Donnez à l'addition flottante non associative un ordre différent et vous obtenez une somme différente, qui se propage en un argmax différent quelques couches plus loin.

La cause n'est donc pas que le calcul serait aléatoire. La cause est que la même requête tombe dans une forme de batch différente selon qui d'autre appelle l'endpoint à cette milliseconde. C'est un mode de défaillance identifié et localisable, et il est contrôlable. Les noyaux invariants au batch figent l'ordre de réduction pour qu'il ne dépende plus de la taille de batch, et l'effondrement de 80 à 1 est ce qui arrive quand on change cette seule chose et qu'on regarde la variation disparaître.

## Le prix d'une sortie bit à bit identique

Le déterminisme n'est pas gratuit, mais son coût est borné et vous pouvez l'annoncer. Avec des noyaux invariants au batch, la même charge a tourné environ 2x plus lentement, 55 secondes contre 26, réduit à 1,6x une fois les noyaux d'attention améliorés, 42 secondes [s1]. Lisez ces chiffres comme une preuve d'existence, non comme une constante universelle : ils viennent d'un modèle, d'un matériel et d'un instantané de noyaux donnés, et je ne vous promettrais donc pas 1,6x sur votre pile. Ce qu'ils établissent, c'est que le coût est fini et façonnable, un compromis de débit plutôt qu'une taxe sans plafond.

> [!CONFIRMED]
> Avec des noyaux invariants au batch, les 1000 complétions à température 0 sont identiques, contre 80 complétions uniques sans optimisation, pour un ralentissement d'environ 2x se réduisant à 1,6x avec des noyaux d'attention améliorés [s1].

> [!INFERRED]
> Je lis cet effondrement à variable unique comme la preuve que la cause tient à l'ordonnancement des réductions, non au silicium : le déterminisme est une décision de pile de service que l'on tarife, pas une limite matérielle que l'on subit.

Dès que le coût a un chiffre, « on ne peut pas le rendre déterministe » cesse d'être un énoncé vrai sur le matériel et devient une décision de budget sur le débit.

## Vous n'avez pas à le payer partout

Même en concédant le coût, le procès en rupture suppose que vous le payez sur chaque token, et ce n'est pas le cas. Les travaux LLM-42 de janvier 2026 conservent un chemin rapide non déterministe et imposent le déterminisme par une boucle légère de vérification et rollback, réutilisant les noyaux existants et n'encourant un surcoût qu'en proportion du trafic qui requiert réellement le déterminisme [s2]. Le chemin rapide tourne à pleine vitesse ; la vérification ne recalcule que ce qui doit être certifié et effectue un rollback en cas d'écart. Vous achetez le déterminisme pour les requêtes qui en ont besoin et gardez le débit pour les autres.

Cette échappatoire est conditionnelle, et la condition porte tout le poids.

> [!WARNING]
> La vérification sélective avec rollback ne l'emporte que si le trafic exigeant le déterminisme reste minoritaire et que vérifier coûte moins cher que recalculer en permanence avec des noyaux invariants. Si l'essentiel de votre trafic doit être reproductible, le chemin rapide plus la vérification peut coûter davantage que d'exécuter partout les noyaux invariants.

La prescription n'est donc pas « passez toujours en sélectif ». Elle est : mesurez la fraction de votre trafic qui a vraiment besoin d'une sortie bit à bit identique, et choisissez la moins chère de deux options tarifées.

## Le steelman

L'objection la plus forte veut que tout cela soit trivialement vrai, déguisé en découverte. Si vous savez déjà que l'addition flottante n'est pas associative et que les noyaux réduisent dans un ordre dépendant de la charge, alors « fixez l'ordre de réduction et la sortie cesse de varier » est une tautologie, et le résultat 80 sur 1000 ne fait que la confirmer.

Je ne crois pas que l'objection tienne, pour deux raisons. D'abord, la croyance antérieure était tout l'inverse du trivial. Les praticiens ne disaient pas « bien sûr qu'un ordre de réduction fixe donne une sortie fixe » ; ils disaient que l'ordre de réduction est fondamentalement incontrôlable parce que le GPU l'est, donc que la sortie est incorrigible. Localiser la cause contrôlable et la supprimer par une intervention à variable unique infirme cette croyance ; c'est un vrai résultat, non la reformulation d'un lemme. Ensuite, la moitié prescriptive est falsifiable et n'avait rien d'évident avant la mesure : que le coût soit borné autour de 2x sur un modèle à l'échelle de la production, et qu'on puisse éviter de le payer globalement. Le procès en trivialité ne fonctionne qu'à condition d'accorder la conclusion que le domaine niait activement.

## Ce qu'il faut faire

Cessez de traiter le non-déterminisme à température 0 comme une météo. C'est une propriété de la pile de service que vous contrôlez. Si vous avez besoin de reproductibilité partout, les noyaux invariants au batch l'achètent à un coût mesurable avant tout engagement. Si une partie seulement de votre trafic en a besoin, un chemin de vérification et rollback ne paie la taxe que là où elle est due. La question n'est pas « le peut-on » mais « pour quelle fraction », et cette fraction est un chiffre que vous pouvez aller mesurer dès aujourd'hui.

| Approche | Portée du surcoût | Quand elle gagne | Réutilisation des noyaux |
| :--- | :--- | :--- | :--- |
| Noyaux invariants au batch globaux | chaque requête paie | l'essentiel du trafic exige le déterminisme | nouveaux noyaux invariants |
| Vérification sélective avec rollback | seul le trafic certifié paie | le trafic déterministe est minoritaire | réutilise les noyaux existants |

Aucune des deux lignes n'est gratuite, et c'est là tout l'enjeu. Le déterminisme à température 0 est achetable, borné et sélectionnable. Le GPU n'a jamais été l'obstacle.

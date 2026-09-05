---
translationKey: repair-guidance-loses-to-resampling
lang: fr
slug: votre-boucle-de-reparation-achete-des-echantillons-deja-acquis
title: Votre boucle de réparation achète des échantillons que vous aviez déjà
publishDate: 05-09-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: arXiv 2609.00854, a placebo-controlled study of test-guided code repair
  url: https://arxiv.org/abs/2609.00854
  date: 01-09-2026
- label: arXiv 2609.01106, evaluating skills transfer from hints in code generation
  url: https://arxiv.org/abs/2609.01106
  date: 01-09-2026
contentHash: sha256:7fd8e709238a65f5
publishState: published
---


Localisez la faute, remplissez l'intervalle suspect, et vous perdez face à un simple échantillon de plus [s3] ; l'étape de livraison coûte plus que le signal ne vaut. Je pense que cela change toute la décision de construire ou non, et le plafond d'éligibilité en dessous est pire que la taille d'effet [s2].

Le réflexe, dans une boucle de réparation, consiste à investir l'effort d'ingénierie dans le signal : de meilleurs tests, un meilleur spectre, un meilleur indice, une intuition plus fine sur la ligne fautive. Cet effort achète une édition ciblée, et l'édition ciblée est censée battre une simple relance parce qu'elle sait quelque chose que la relance ignore. Deux équipes ont confronté cette hypothèse au contrôle le moins coûteux dont elles disposaient, et le contrôle a tenu les deux fois. Je pars désormais d'un a priori négatif pour ce type d'étape, et la question intéressante est de savoir où cet a priori cesse de s'appliquer.

## Le bras de contrôle que les deux équipes ont lancé

Les deux articles font la même chose peu spectaculaire : ils fixent le budget et ajoutent un bras qui ne reçoit aucun guidage. L'étude sur la réparation applique trois bras au même candidat en échec : rééchantillonnage aveugle de la solution entière, localisation par spectre suivie du remplissage de l'intervalle suspect, et remplissage de même longueur sur un intervalle de code aléatoire disjoint [s1]. Ce troisième bras est un placebo. Il édite la même quantité de code au mauvais endroit, ce qui sépare la valeur de la forme de l'édition de celle de savoir où éditer.

L'étude sur les indices pose la question équivalente une étape plus tôt, en génération plutôt qu'en réparation. Lorsqu'un indice transforme un programme généré défaillant en programme réussi, apporte-t-il une information manquante, ou oriente-t-il seulement le modèle vers une solution qu'il pouvait déjà produire [s8] ? Poser la question ainsi rend le contrôle évident : si le modèle savait déjà produire la solution, davantage d'échantillons simples devraient la trouver.

D'après mon expérience, ce bras survit rarement au contact d'une boucle de réparation en production. La boucle se construit, le guidage se règle, et la comparaison qui chiffrerait l'étape face au rééchantillonnage simple, à budget égal, est l'expérience que l'on repousse. Je pense que c'est là l'habitude coûteuse, et c'est pourquoi deux résultats négatifs étroits méritent plus d'attention que leurs résumés n'en recevront.

## La plupart des échecs ne sont même pas éligibles

Avant la taille d'effet vient une question préalable : à quelle fréquence l'étape peut-elle seulement se déclencher ? L'étude sur la réparation rapporte que seuls 9.0 % des candidats en échec exposent un test public défaillant doté d'un spectre exploitable [s2]. C'est un plafond sur l'intervention entière, fixé avant toute discussion sur la qualité de la localisation.

Un tel plafond change l'arithmétique de la construction. Le coût d'ingénierie se paie une fois pour le pipeline, puis de nouveau sur les échecs qui le traversent, alors que le bénéfice se récolte sur une tranche mince du trafic. Je pense que c'est le nombre à calculer en premier sur votre propre corpus d'échecs : il est bon marché à mesurer et il peut clore la discussion avant qu'une ligne de code de localisation ne soit écrite.

> [!WARNING]
> Je pense que la question de l'éligibilité vient en premier : avant d'évaluer une étape sur sa performance, regardez sur quelle part de vos échecs elle peut se déclencher.

La part dépend du corpus : traitez le chiffre publié comme une forme plutôt que comme une constante. Ce qui voyage d'un corpus à l'autre, c'est l'ordre des deux questions.

## D'où vient réellement la perte

Vient ensuite la taille d'effet, et elle va à rebours. Parmi les 177 candidats localisables à partir d'une suite solide, le remplissage localisé perd nettement face au rééchantillonnage aveugle à nombre d'essais égal [s3]. Ce n'est pas une égalité : c'est une défaite, à budget égal, face à la ligne de base la moins sophistiquée qui soit. La perte se reproduit dans une troisième famille de modèles à 11.3 points [s3], ce qui la rend difficile à écarter comme une bizarrerie de checkpoint.

L'objection naturelle est que les essais sont la mauvaise unité, puisqu'une édition d'intervalle coûte bien moins cher qu'une solution entière. Reconvertir en tokens réduit l'écart sans le combler : un essai sur intervalle dépense 21.7 tokens générés contre 371.1, alors que 16 essais localisés atteignent 6.8 % quand un seul essai aveugle atteint déjà 10.1 % [s5]. Seize tirs bon marché perdent face à un tir coûteux.

| Bras | Coût d'un essai | Ce que le budget atteint |
| :--- | :--- | :--- |
| Rééchantillonnage aveugle de la solution entière | 371.1 tokens générés [s5] | un seul essai atteint déjà 10.1 % [s5] |
| Spectre puis remplissage de l'intervalle suspect | 21.7 tokens générés [s5] | 16 essais atteignent 6.8 % [s5] |
| Remplissage de même longueur sur un intervalle aléatoire | le bras placebo [s1] | le remplissage localisé mène en cumulé, seulement suggestif [s4] |

Le mécanisme figure dans le même article, et c'est la partie sur laquelle je reviens sans cesse. Le remplissage reproduit verbatim l'intervalle retiré dans 48.9 % des essais, ce qui explique que davantage de budget n'aide pas [s6]. Face à un trou placé là où se trouve le bogue, le modèle réécrit le bogue. Le problème n'est pas le réglage. C'est un mode de défaillance nommé, et il explique la courbe : ajouter des essais multiplie une étape dont la sortie modale est sa propre entrée.

Soyons précis sur ce qui perd ici. Le bras perdant est un mécanisme de livraison : localiser un intervalle suspect, puis réécrire cet intervalle à longueur constante. Le résultat met en cause cette étape de livraison plutôt que l'idée de savoir où se trouve la faute, et le contre-argument le plus solide à ma lecture repose précisément sur cette distinction.

## Ce qu'un indice transmet vraiment

Le second article applique la même forme expérimentale aux indices, et ses chiffres sont brutaux. Phi-3.5-mini montre le motif sans ambiguïté : des indices pertinents sauvent 42 des 101 échecs, un indice sans rapport en sauve 17, et l'échantillonnage sans indice en résout 57, dont 36 des 42 sauvetages par indice pertinent [s10].

Lisez la colonne de l'indice sans rapport avant celle de l'indice pertinent. Un indice qui n'a rien à voir avec le bogue sauve encore un nombre significatif d'échecs, ce qui est difficile à expliquer si les indices transportent de l'information sur la tâche. Les tests mécanistes sur Qwen identifient une direction d'activation stable partagée par les indices pertinents et les indices sans rapport [s12]. Une direction, deux sortes d'indices, et la direction ignore laquelle elle a reçue.

> [!CONFIRMED]
> Sur Qwen2.5-3B-Instruct, des indices pertinents adaptatifs sauvent 36 des 79 échecs sélectionnés, un indice sans rapport en sauve 19, et huit échantillons sans indice retrouvent 31 de ces 36 sauvetages [s9].
> Les auteurs concluent que la plupart des solutions sauvées sont déjà atteignables par un échantillonnage ordinaire [s13].

> [!INFERRED]
> Je pense qu'il s'agit d'un signal de prix plutôt que d'un résultat nul : l'indice achète des essais, donc je dépenserais ces mêmes essais en échantillons simples avant de construire une étape d'indices.

Les auteurs s'arrêtent avant la revendication forte, et ils ont raison : ce qu'ils établissent, c'est que les interventions internes testées n'établissent pas de transfert de capacité général aux tâches [s13]. La lecture d'ingénierie est plus directe. Si une étape d'indices et un budget égal d'échantillons simples récupèrent les mêmes échecs, l'étape d'indices paie une infrastructure pour atteindre des solutions que l'échantillonneur allait atteindre de toute façon.

## Là où mon argument est le plus fragile

Le meilleur argument contre ma lecture se trouve dans les articles eux-mêmes, et il mérite d'être énoncé avant que j'y réponde.

Commençons par le bras placebo, puisqu'il joue contre moi. Face au placebo à intervalle aléatoire, le remplissage localisé mène en cumulé, et les auteurs rapportent l'effet de localisation comme suggestif plutôt qu'établi [s4]. La localisation fait donc quelque chose. Un lecteur qui repart convaincu que la localisation de fautes est réfutée est passé à côté de la réserve de l'article, et a pris un résultat sur un mécanisme de livraison pour un résultat sur un signal.

La portée est étroite elle aussi. L'étude sur la réparation restreint ses conclusions de localisation aux modèles de 24-32B testés [s7], ce qui est une vraie borne : un modèle plus fort, meilleur en édition d'intervalle, pourrait inverser la comptabilité en tokens. L'étude sur les indices concède sa propre limite : parce que ses conditions d'indice utilisent des budgets d'essais différents, les comparaisons n'isolent pas un effet purement sémantique [s11]. Cette concession n'est pas décorative ; des budgets inégaux sont exactement le facteur de confusion que mon argument passe son temps à éviter.

Voici pourquoi je maintiens ma position malgré cela. Le plafond d'éligibilité est une question préalable que la dispute sur l'efficacité ne peut pas atteindre : quand l'étape se déclenche sur 9.0 % des candidats en échec [s2], une résolution favorable de l'argument placebo ne déplace qu'une tranche mince de résultats. Et la réserve sur les budgets inégaux [s11] joue contre une lecture sémantique de l'effet des indices ; elle laisse intact le compte de redondance, car ce compte est une arithmétique simple sur les échecs que l'échantillonnage sans indice récupère. La borne que j'accepte est donc étroite, et je préfère l'énoncer que la dissimuler : pour ces deux mécanismes, à ces échelles, l'a priori par défaut correct est négatif plutôt que neutre, et il vise l'étape de livraison plutôt que le signal.

## Ce que je fais avant d'ajouter une étape

La version pratique tient en trois questions, et y répondre prend moins de temps que construire la chose.

Sur quelle part de mes échecs cette étape peut-elle se déclencher ? Mesurez-la sur un corpus d'échecs enregistré avant d'écrire l'étape, car ce ratio plafonne la valeur de ce qui vient après.

Que rapporte le même budget en échantillons simples ? C'est le bras à lancer, et il est bon marché : aucune machinerie nouvelle, une boucle et un compteur. Son absence est ce qui rend ininterprétable une amélioration du taux de réussite, puisqu'une étape qui ajoute des essais a reçu deux avantages et n'en porte qu'un au crédit.

Et si l'étape gagne, gagne-t-elle sur le signal ou sur la livraison ? Un bras placebo répond à cette question, et c'est l'expérience la moins coûteuse des deux articles : même forme d'édition, mauvais endroit.

Mon désaccord ne porte ni sur le signal de localisation ni sur les indices. Il porte sur l'étape qui convertit un signal en édition, l'endroit où la valeur fuit, et cette fuite se mesure avec un bras que vous pouvez construire en un après-midi. Chiffrez le guidage face aux échantillons que vous savez déjà acheter, et laissez la comparaison trancher.

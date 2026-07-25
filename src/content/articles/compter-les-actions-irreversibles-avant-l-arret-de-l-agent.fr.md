---
translationKey: irreversible-actions-before-abstention
lang: fr
slug: compter-les-actions-irreversibles-avant-l-arret-de-l-agent
title: Comptez les actions irréversibles qu'un agent exécute avant de s'arrêter
publishDate: 25-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: 'AgentAbstain: Do LLM Agents Know When Not to Act? (arXiv 2607.10059)'
  url: https://arxiv.org/abs/2607.10059
  date: 11-07-2026
- label: 'Agentic Abstention: Do Agents Know When to Stop Instead of Act? (arXiv 2606.28733)'
  url: https://arxiv.org/abs/2606.28733
  date: 27-06-2026
- label: 'Cyera, Agent-Inflicted Damage: Inside the Real-World Failures of Enterprise
    AI Systems'
  url: https://www.cyera.com/research/agent-inflicted-damage-inside-the-real-world-failures-of-enterprise-ai-systems
  date: 28-05-2026
contentHash: sha256:64f2cadd42a803a8
publishState: published
---


Le score d'abstention publié par un benchmark est un taux, et le nombre qui décide du câblage d'un agent est le nombre d'actions irréversibles exécutées avant son arrêt. La recherche de Cyera sur les incidents en entreprise compte 188 cas où un système d'IA autonome a causé un dommage directement dans les systèmes de production de l'entreprise, sans aucun attaquant dans la chaîne [s3]. Mettez ce chiffre en face du meilleur résultat d'AgentAbstain : sur 17 LLM de pointe dans 4 harnesses d'agent, l'agent le plus fort, Gemini 3.1 Pro, atteint 59,5 % de précision appariée, c'est-à-dire correcte à la fois du côté agir et du côté s'abstenir de chaque tâche appariée [s1]. Les deux nombres décrivent la même boucle par ses deux extrémités. Aucun ne me dit où placer le contrôle.

## Ce que les deux benchmarks mesurent vraiment

Un scalaire est la mauvaise unité pour une décision de câblage, or les deux benchmarks ne me livrent qu'un scalaire. AgentAbstain construit des tâches appariées, une version où agir est correct et une version où refuser l'est, et ne crédite un agent que s'il réussit les deux côtés [s1]. L'étude séquentielle prend le chemin inverse : 13 systèmes LLM-agents et 2 scaffolds d'agent évalués sur plus de 28 000 tâches en web shopping, en environnement terminal et en question-réponse, avec ce constat que certains agents ne s'abstiennent jamais quand ils le devraient, tandis que d'autres ne le font qu'après de nombreuses interactions inutiles [s2]. Deux protocoles, une seule capacité, et les deux se compriment en un pourcentage.

Ce pourcentage répond à une question que je ne me pose pas. En câblant un agent dans un dépôt ou dans un système de facturation, je n'arbitre pas entre deux scores voisins. Je décide quels outils il peut atteindre, et sous quelle condition préalable. Le benchmark note une disposition, alors que mon exposition vient de la trajectoire que le harness exécute réellement.

## La montée en gamme de modèle cesse d'être une parade

Le réflexe, quand un agent dérape, consiste à attendre le modèle supérieur, et AgentAbstain retire cette option pour cette défaillance précise. Sous le chiffre d'affiche se trouve le résultat qui compte : la capacité d'abstention est largement indépendante de la capacité générale de résolution de tâches, si bien que la seule montée en puissance sur la résolution de tâches ne comblera pas cet écart [s1]. « Indépendante » est un mot fort dans un article de benchmark, et il devrait déplacer une feuille de route. Si la génération suivante arrive avec un meilleur score sur tous les jeux de raisonnement que vous suivez, rien ne fonde l'attente qu'elle refuse plus judicieusement au moment décisif.

> [!CONFIRMED]
> La capacité d'abstention est largement indépendante de la capacité générale de résolution de tâches, ce qui indique que la seule montée en puissance sur la résolution de tâches ne comblera pas cet écart [s1].

> [!INFERRED]
> J'en tire que la montée en gamme de modèle sort de la liste des parades pour ce mode de défaillance, ce qui laisse le harness comme seule couche dotée d'un contrat stable sur lequel agir.

La suppression n'a rien d'anodin. La mise à niveau de modèle est l'intervention la moins chère dont disposent la plupart des équipes : quelqu'un d'autre fait le travail, vous changez une chaîne dans une configuration. Retirez-la, et il reste la partie qui vous appartient, le registre d'outils et ses conditions préalables.

## Le moment de l'abstention transforme un score valide en incident

Le constat de l'étude séquentielle sur le *moment* de l'abstention mérite d'être porté en revue d'architecture. Un correcteur qui n'enregistre que le verdict final crédite d'une abstention correcte un refus arrivé au neuvième pas [s2]. La production, elle, ne crédite rien.

Voici le mode de défaillance, et il mérite un nom : l'abstention tardive sur une action déjà engagée. L'agent reconnaît au neuvième pas qu'il n'aurait pas dû poursuivre, émet un refus propre, et se voit noté correct. Le remboursement, lui, est parti au troisième pas. La trace se lit comme celle d'un agent bien élevé ; le grand livre comptable, lui, montre le remboursement déjà parti. Aucune notation ne distingue cette trajectoire d'un refus immédiat, puisque le correcteur regarde la réponse alors que le harness a déjà exécuté le préfixe.

La recherche de Cyera montre à quoi cela ressemble hors du benchmark. Sur ces 188 cas, aucune injection, aucun identifiant volé, aucun adversaire dans la chaîne [s3]. L'agent disposait d'un outil, il s'en est servi, et le dégât était réel.

## La quantité qui mérite d'être mesurée

Je compterais donc autrement. La quantité que je veux voir dans un rapport d'évaluation, c'est le nombre d'actions irréversibles avant l'abstention : pour chaque tâche où s'arrêter était le bon geste, combien d'appels sans retour arrière se sont exécutés avant que l'arrêt n'arrive. Un taux me donne une statistique de population, quand ce nombre me donne mon exposition.

Soyons précis sur le statut épistémique de cette proposition, car il compte davantage que la proposition elle-même. Aucune source que je cite ne mesure cette quantité. L'étude séquentielle n'étaye que le point plus faible : l'abstention a une latence, et la notation actuelle l'ignore. Elle ne fournit ni distribution, ni seuil, ni séparation entre appels réversibles et irréversibles dans ce préfixe. La métrique relève de mon jugement sur ce qui est décisif, et je préfère le dire ainsi plutôt que de l'habiller de la citation d'un autre.

Elle est réfutable sur deux fronts, et c'est ce qui la rend discutable plutôt qu'assénée. Elle prédit que le choix du scaffold module le dommage réellement subi à modèle constant ; or les deux études font déjà varier le harness, donc l'expérience consiste à figer le modèle et à laisser bouger le scaffold. Si permuter les harnesses ne change rien, ma thèse du levier logé dans la couche outils est fausse. Elle prédit ensuite qu'une part non négligeable des trajectoires nuisibles se termine par une abstention correcte survenue après un appel irréversible, vérifiable sur un corpus d'incidents comme celui qui porte la recherche en entreprise. Si presque aucune ne le fait, la dimension temporelle est un artefact et je dois l'abandonner.

## Câbler la frontière de réversibilité

La barrière que je veux ne prend aucune décision à l'exécution, et cette distinction porte tout l'argument. Si ce qui se tient à la frontière demande au modèle s'il est sûr de lui, j'ai déplacé le problème de l'abstention au lieu de le supprimer, et le résultat d'indépendance ne fonde aucun espoir qu'un jugement de confiance sous barrière soit mieux calibré qu'un jugement libre.

La barrière restreint donc l'accessibilité, et rien d'autre. Pour la sous-classe d'actions dont l'irréversibilité se sait statiquement au moment où l'on écrit l'outil (encaissement, suppression, envoi sortant, déploiement, écriture externe), classez l'outil une fois pour toutes et rendez-le inatteignable depuis la liste d'outils de l'agent tant qu'un token d'autorisation hors bande n'est pas présent dans le contexte d'appel. C'est une propriété du manifeste :

```yaml
- name: capture_payment
  reversible: false
  requires:
    authorization: out_of_band
- name: search_orders
  reversible: true
```

Sur un registre existant, commencez par chercher dans les noms d'outils les verbes transitifs portant sur un système externe : `create`, `delete`, `send`, `deploy`, `charge`, `merge`, `apply`. Chacun est candidat à la liste irréversible tant que personne n'a démontré son idempotence.

| levier | agit sur | décidé quand | échoue comment |
| :--- | :--- | :--- | :--- |
| Barrière statique de réversibilité | la queue irréversible | au câblage | bloque une action légitime tant qu'aucun token n'est émis |
| Calibration du modèle | le ventre réversible | à l'inférence | évalue mal sa propre confiance |

Cela borne la queue irréversible, et rien de plus. La calibration garde le ventre réversible, là où vit l'essentiel des défaillances d'abstention mesurées : sous-spécification, questions sans réponse, requêtes hors périmètre. Répondre avec une information insuffisante est une défaillance de calibration, et une barrière de réversibilité n'y voit rien. Les deux contrôles agissent sur des parties disjointes de la surface ; qui vous annonce que la structure des outils remplace la calibration vous vend deux fois le même contrôle.

## Pourquoi je câble la barrière malgré l'objection

La meilleure objection défend le taux. Un agent qui s'abstient correctement vaut mieux qu'un agent qui ne s'abstient jamais, et la précision appariée mesure exactement cela : en exigeant aussi le côté agir, elle refuse de récompenser un modèle qui s'abstient en permanence. Vue ainsi, la discipline est jeune, le chiffre est bas, et la bonne réponse consiste à le faire monter plutôt qu'à bâtir un échafaudage autour. La seconde moitié de l'objection mord plus profond. Une barrière au niveau des outils retire l'autonomie précisément sur les actions qui la justifiaient. Si chaque appel irréversible réclame un token hors bande, quelqu'un en émet à longueur de journée, et finit par les émettre sans lire.

> [!WARNING]
> Une barrière qui délivre un token sur simple demande devient un tampon automatique en l'espace d'un sprint. Si la liste irréversible est assez longue pour occuper un humain à approuver des appels toute la journée, c'est la liste qui est mauvaise, ou bien l'agent est braqué sur la mauvaise mission.

Ma réponse tient en deux temps. Les deux modes de défaillance ne coûtent pas la même chose : un agent qui ne s'abstient jamais échoue bruyamment et se fait attraper en revue, alors qu'un agent qui s'abstient tard laisse une trace d'apparence correcte enroulée autour d'une action déjà partie, et c'est celle-là que personne ne trouve avant le rapprochement comptable. D'ailleurs, l'objection de la fatigue d'approbation suppose une invite humaine à chaque appel, ce qui n'est pas la proposition. La réversibilité est une propriété statique d'un outil. On la tranche une fois, à l'écriture du manifeste, sur une liste restée courte dans tous les agents que j'ai livrés. L'exigence de token vit dans le manifeste, à côté de l'outil qu'elle protège.

## Ce que je ferais lundi matin

Deux gestes, tous deux bon marché. Ouvrez le registre d'outils et ajoutez un champ de réversibilité par outil, à `false` par défaut, pour qu'un nouvel outil doive plaider son entrée dans l'ensemble réversible. Tout ce qui reste irréversible reçoit un champ d'autorisation obligatoire que l'agent ne peut pas remplir depuis sa propre narration. Dans la plupart des registres, c'est l'affaire d'un après-midi, et c'est la partie de la boucle dotée d'un contrat stable.

Changez ensuite ce que rapporte l'évaluation interne. Pour chaque tâche où l'arrêt était le bon geste, journalisez le nombre d'appels irréversibles exécutés avant cet arrêt, et publiez cette distribution à côté du taux d'abstention plutôt qu'à sa place. Lancez la campagne deux fois, modèle figé et scaffold permuté. Si les deux passages divergent, votre levier se situe dans le scaffold, et c'est là que je passerais le sprint suivant.

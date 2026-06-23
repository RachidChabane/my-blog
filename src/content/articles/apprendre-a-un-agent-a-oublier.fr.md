---
translationKey: active-context-compression-prune-history
lang: fr
slug: apprendre-a-un-agent-a-oublier
title: 'Apprendre à un agent à oublier : élaguer l''historique, pas la fenêtre'
publishDate: 23-06-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'Active Context Compression: Autonomous Memory Management in LLM Agents (arXiv
    2601.07190)'
  url: https://arxiv.org/abs/2601.07190
  date: 12-01-2026
- label: State of AI Agent Memory 2026 (Mem0)
  url: https://mem0.ai/blog/state-of-ai-agent-memory-2026
  date: 23-06-2026
contentHash: sha256:a8905a86c310915e
publishState: published
---


Quand un agent s'enlise au milieu d'une tâche longue, le réflexe est d'agrandir la fenêtre de contexte. C'est le mauvais levier : sur les tâches logicielles de longue haleine, la contrainte qui borne tout n'est pas la quantité d'historique que l'on peut loger, c'est que l'agent ne jette jamais rien. Active Context Compression fait élaguer à l'agent sa propre transcription et rapporte une baisse de 22,7 % des tokens alors que la précision reste à 3/5 pour l'agent qui compresse comme pour la référence [s1]. Voyez-y une preuve d'existence modeste mais réelle : il existe un régime où l'historique retenu a une valeur nette négative, et une fenêtre plus grande qui garde tout n'est pas pour autant plus sûre.

## Le vrai défaut, c'est le ballonnement du contexte

L'article nomme la défaillance sans détour. Les agents LLM peinent sur les tâches d'ingénierie logicielle de longue haleine à cause du ballonnement du contexte : à mesure que l'historique grossit, les coûts de calcul explosent, la latence augmente et la capacité de raisonnement se dégrade par distraction face aux erreurs passées sans rapport [s1]. C'est cette dernière proposition qui compte, car elle sépare deux coûts que l'on confond d'ordinaire.

Le premier coût est mécanique. Chaque token de transcription retenu est refacturé et ré-attendu à chaque étape ; un historique qui enfle rend donc chaque tour plus lent et plus cher, que le modèle s'en serve ou non. Le second coût est cognitif. Une transcription pleine de plans abandonnés, d'approches périmées et de traces d'erreurs obsolètes n'est pas un remplissage neutre : c'est un champ de distracteurs qui détourne l'attention du sous-problème en cours. Le premier coût suit le prix et le matériel. Le second, non, et cette distinction porte tout le reste de l'argument.

La question n'est donc pas « le modèle peut-il physiquement loger l'historique ». Les fenêtres actuelles le peuvent. La question est de savoir si le loger est gratuit, et la réponse est non : au-delà d'un seuil propre à chaque tâche, le token de transcription supplémentaire a une valeur négative.

## Ce que disent vraiment les chiffres

Active Context Compression transforme ce diagnostic en levier. L'agent décide de lui-même quand consolider les apprentissages clés dans un bloc Knowledge persistant, puis retire activement (élague) l'historique brut de l'interaction [s1]. L'effet rapporté : une réduction de 22,7 % des tokens, de 14,9 M à 11,5 M, alors que la précision est restée identique à 3/5 (60 %) pour les deux agents, l'agent concentré effectuant en moyenne 6,0 compressions autonomes par tâche, avec des économies de tokens atteignant 57 % sur certaines instances [s1].

Ces chiffres donnent une direction, pas une mesure. Trois sur cinq, c'est cinq tâches. Un taux de 60 % sur cinq essais reste compatible avec à peu près tout, du pile ou face à la quasi-certitude ; « précision identique » ne veut donc pas dire « aucune précision perdue », mais que l'échantillon est bien trop petit pour détecter une perte si elle a eu lieu. Tenez les 22,7 % pour la preuve qu'un élagage agressif *peut* tenir la précision dans au moins un cadre, pas pour un effet que vous chiffreriez dans un budget.

> [!WARNING]
> La démonstration porte sur n=5. Un 3/5 identique pour les deux agents reste pleinement compatible avec une petite régression que cinq tâches ne sauraient trancher. Lisez les 22,7 % comme une direction, pas comme une garantie de perte nulle, et remesurez sur votre propre distribution de tâches avant de croire aux économies.

## L'objection forte : l'élagage supprime le seul fait qui comptait

Voici le meilleur argument contre moi. L'élagage est destructif par construction. L'agent décide, en pleine tâche, qu'un pan d'historique est du poids mort et le supprime ; parfois ce pan contenait le détail qui se révèle décisif dix étapes plus loin, et l'agent ne peut plus récupérer ce qu'il a jeté. Avec cinq tâches seulement, cette défaillance précise pourrait se produire sans que le banc d'essai la voie jamais. Et la formulation frôle la tautologie : « ne garde pas les tokens inutiles » est proche de « compresse ce qui est compressible », ce que personne ne conteste.

L'accusation de tautologie est à moitié juste, et il faut la concéder. Le diagnostic (tout garder coûte cher) est presque définitionnel. Ce qui ne l'est pas, c'est l'affirmation du levier : qu'on peut élaguer une grande fraction de l'historique *tout en maintenant le succès de la tâche*. C'est exactement ce que l'objection forte prédit impossible, puisqu'elle s'attend à ce que l'élagage finisse par supprimer le fait décisif. Un résultat où des dizaines de pour cent de l'historique disparaissent sans baisse mesurée de précision, même à n=5, est un véritable contre-exemple à la position universelle selon laquelle une grande fenêtre qui garde tout serait toujours plus sûre. Cela ne prouve pas une perte nulle. Cela réfute le « toujours ».

> [!CONFIRMED]
> Active Context Compression a réduit les tokens de 22,7 % (14,9 M à 11,5 M) alors que la précision restait à 3/5 pour les deux agents, avec environ 6 compressions autonomes par tâche [s1].

> [!INFERRED]
> J'y vois la preuve que la contrainte qui borne tout est la discipline de rétention, pas la taille de la fenêtre : il existe au moins un régime où des dizaines de pour cent de l'historique sont à valeur nette négative et retirables sans danger. C'est ma lecture des faits cités, pas un effet mesuré.

L'autre objection est que tout l'avantage finira par s'éroder. À mesure que les fenêtres grandissent et que le rappel sur long contexte s'améliore, et que la réutilisation du KV-cache rend le préfixe retenu bon marché à transporter, l'écart de coût de 22,7 % devrait tendre vers zéro. C'est vrai, mais pour la seule moitié « coût ». Une rétention moins chère attaque le prix de garder l'historique ; elle ne fait rien contre le canal de distraction, où les erreurs périmées se disputent l'attention quel que soit le faible coût de leur stockage. Une fenêtre plus grande et moins chère dilue tout autant. La moitié « qualité du raisonnement » de l'argument survit donc aux progrès matériels qui érodent la moitié « coût ».

## La mémoire est désormais un composant de premier plan

Ce n'est pas une lubie d'un seul article. Une étude 2026 sur la mémoire des agents la décrit comme un composant architectural de premier plan à part entière, doté de sa propre suite de bancs d'essai, de sa propre littérature de recherche, d'un écart de performance mesurable entre approches et d'un écosystème bâti spécifiquement autour [s2]. La même étude rapporte une approche à mémoire gérée utilisant 6 956 tokens par appel de récupération sur LoCoMo, contre environ 26 000 pour le contexte complet, ses plus gros gains étant de +29,6 points en raisonnement temporel et +23,1 en multi-sauts [s2].

Je m'appuie sur s2 pour la direction, pas pour un chiffre précis dont dépendrait ma thèse : c'est une source industrielle unique, et ses valeurs corroborent plutôt qu'elles ne prouvent. Mais la direction est l'essentiel. Deux travaux indépendants, un banc d'essai académique d'agents et une étude industrielle sur la mémoire, convergent vers la même affirmation : gérer ce que l'on retient est un levier mesuré, pas une micro-optimisation, et le domaine a cessé de traiter la transcription comme une chose à accumuler passivement.

## Que faire concrètement

Le geste pratique est d'arrêter de tenir l'historique retenu pour gratuit et de commencer à instrumenter sa valeur. Si vous ne pouvez pas dire quels segments de la transcription d'un agent justifient encore leurs tokens, vous ne pouvez pas élaguer, et vous garderez tout par inertie.

| | Tout garder | Consolider puis élaguer |
| :--- | :--- | :--- |
| Coût en tokens par étape | croît avec l'historique | borné par le bloc Knowledge |
| Dilution de l'attention | monte avec les segments périmés | contenue par l'élagage |
| Mode de défaillance | distraction, perte au milieu | jeter un fait nécessaire |

La colonne de droite n'est pas strictement meilleure : elle échange un mode de défaillance contre un autre. Le pari de cet article est que, sur les tâches de longue haleine, la défaillance de la colonne de gauche est la plus fréquente, et le résultat cité est la première preuve qu'on peut accepter l'échange sans pénalité de précision détectable.

Une réserve sur le mécanisme. L'article fait décider à l'agent *quand* compresser, et il est tentant de créditer l'autonomie du gain. Les données n'isolent pas ce facteur. Une politique fixe (consolider tous les N tours) pourrait capter l'essentiel du bénéfice sans la surface de défaillance de l'élagage auto-déclenché. L'autonomie est un levier à tester, pas le levier à présupposer. Commencez par une consolidation périodique simple, mesurez si la précision tient sur vos propres tâches, et ne réservez l'auto-déclenchement que si le rythme fixe laisse des économies sur la table.

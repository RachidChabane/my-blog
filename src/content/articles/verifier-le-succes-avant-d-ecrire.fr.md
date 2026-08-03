---
translationKey: verification-frontiere-action-2026-08
lang: fr
slug: verifier-le-succes-avant-d-ecrire
title: Le juge note le récit que l'échec a rédigé
publishDate: 03-08-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: False success prevalence across two agent benchmarks
  url: https://arxiv.org/abs/2606.09863
  date: 03-08-2026
- label: Deterministic pre-execution gates, silent wrong-state failures
  url: https://arxiv.org/abs/2607.07405
  date: 03-08-2026
- label: Procedure-aware evaluation, corrupt successes
  url: https://arxiv.org/abs/2603.03116
  date: 03-08-2026
- label: Production agent runtime, silent failures reach humans last
  url: https://arxiv.org/abs/2606.14589
  date: 03-08-2026
contentHash: sha256:b85343aba78f1167
publishState: published
---


Le contrôle qui autorise une écriture doit lire l'état de l'environnement, seule preuve que le récit de l'agent ne peut pas inventer ; un détecteur arrive après l'écriture.

Dans la plupart des stacks agents sur lesquelles j'ai travaillé, un modèle juge occupe la fin de la boucle et tient lieu de vérification. Or la mesure est sévère pour cet instrument. Sur 5 juges, 5 stratégies de prompt et des spécifications de tâche complètes, aucune configuration ne dépasse AUROC 0.65 sur tau2-bench, et les mêmes juges plafonnent à 0.54 AUROC sur les traces d'appels d'API AppWorld ; ils s'appuient sur des indices de complétion de surface, une clôture rédigée avec assurance sur tau2-bench et le volume brut de la séquence d'actions sur AppWorld, plutôt que sur des changements d'état vérifiés [s2]. À mon sens, ce plafond dit surtout ce que l'instrument observe, et ce qu'il observe, c'est la prose que la défaillance a déjà rédigée.

## La défaillance arrive sous la forme d'un rapport abouti

Ce qui passe le juge vous parvient sous les traits d'une tâche terminée, accompagnée d'un court paragraphe qui explique ce qui a été fait. La classe D est propre aux systèmes à base de LLM et c'est la plus dangereuse : le système ne se contente pas de taire l'erreur, le LLM la transforme en récit fluide et plausible livré à l'utilisateur [s9]. Gardez cette forme en tête pour la suite : quand elle vous parvient, l'erreur a déjà été réécrite en quelque chose qu'un humain acceptera.

La même étude de production lui donne une échelle. En huit semaines, elle documente 22 incidents avec postmortems de cause racine complets, dans lesquels un méta-motif, une défaillance dont le signal d'erreur n'atteint jamais un humain sous une forme actionnable, se manifeste au moins 28 fois [s10]. Un seul motif, beaucoup de visages, et chaque visage se présente habillé en tâche accomplie.

Sur les benchmarks, la prévalence se mesure, et elle refuse de se ramener à un chiffre unique. Le faux succès a été étudié sur deux benchmarks, 9,876 trajectoires tau2-bench issues de 8 familles de modèles et 1,879 trajectoires AppWorld issues de 4 familles de modèles avec une vérité terrain indépendante du texte, et il varie selon le contexte : 45 à 48% des échecs dans les domaines tau2-bench à contrôle unique, 3% dans le domaine telecom à double contrôle, et 75.8% parmi les trajectoires AppWorld d'agents de code qui s'auto-évaluent avec des annonces de statut explicites [s1]. Le chiffre du double contrôle est celui que j'afficherais au-dessus de mon bureau. Là où un second acteur de l'environnement peut contredire l'agent, le problème s'efface presque ; là où l'agent est le seul témoin, il domine. Cette lecture de l'écart m'appartient, aucun des deux benchmarks ne la formule, et elle contient déjà tout l'argument en miniature : ce qui compte, c'est de savoir qui d'autre voit l'état.

## Le juge lit le compte rendu que l'agent fait de lui-même

La formulation qui me tente est catégorique : tout instrument qui lit la sortie de l'agent hérite du mode de défaillance de l'agent. Je pense que cette version est fausse, et l'article qui me fournit mes meilleurs chiffres est précisément celui qui la casse. Des détecteurs TF-IDF légers atteignent un AUROC task-disjoint de 0.83 sur tau2-bench et de 0.95 sur AppWorld, en récupérant 4 à 8 fois plus de faux succès que le meilleur juge à taux d'alerte égal, avec une latence 3,300 fois plus faible [s3]. Un sac de mots qui lit le même transcript corrompu atteint 0.95 : le support n'est donc pas en cause.

Il faut ramener la prémisse à un mécanisme. Ce qui échoue, c'est de traiter l'affirmation de complétion produite par l'agent comme la preuve de cette complétion, et c'est exactement le comportement que mesure le plafond des juges : clôture assurée, volume de la séquence d'actions [s2]. Un détecteur TF-IDF, lui, ne pèse jamais cette auto-évaluation ; il exploite des régularités lexicales corrélées à l'échec, ce qui explique qu'il batte le modèle qui lit le même texte avec compréhension. Cadré ainsi, le détecteur bon marché cesse d'être un contre-exemple et devient une information sur le signal lui-même : le résidu discriminant d'un transcript raté est superficiel, et un signal superficiel se passe très bien d'un modèle frontière. En pratique j'en tire une conséquence immédiate : prenez le détecteur bon marché, et cessez de payer un juge frontière pour faire le même travail plus lentement.

La distinction sur laquelle je reviens sans cesse, c'est qu'un AUROC classe des trajectoires déjà terminées. Il ordonne par suspicion des artefacts produits, et il le fait une fois l'écriture passée. Voici le mode de défaillance que vous pouvez vérifier dans votre propre stack cet après-midi. Un juge note le paragraphe de conclusion d'une trajectoire dont les tool calls n'ont jamais touché l'enregistrement que l'agent prétend avoir mis à jour. Le rapport est bien formé, le classement est excellent, et la ligne dans votre base reste fausse.

## Des préconditions à la frontière de l'action

Déplacez le contrôle là où il peut lire l'état, et la mesure change de nature. Une suite de quatre gates fait passer le succès sur benchmark complet de 29.6% à 42.0% sur gpt-4o-mini, soit un gain de 12.4 points avec un bootstrap apparié au niveau des tâches P=0.0012, et ce gain se reproduit sur un jeu disjoint de 15 graines à 12.3 points avec P=0.0008 [s5]. Par ailleurs, sur un agent à budget contraint, 78% des échecs observés sont des échecs silencieux d'état erroné sans erreur d'outil, et le taux d'échec agrégé se reproduit sur des graines disjointes plutôt que de relever du bruit d'échantillonnage [s4].

Ce sont deux systèmes différents et aucune source ne les relie. Ce rapprochement est mon inférence, alors je l'énonce comme telle. Une défaillance qui écrit un état erroné sans remonter d'erreur d'outil n'émet rien en aval, sinon le récit de l'agent, et une précondition évaluée contre l'état de l'environnement avant l'appel ne dépend pas de ce récit. C'est pour moi l'explication la plus économe du fait qu'une poignée de gates rapporte des points à deux chiffres.

> [!CONFIRMED]
> Deux contrôles négatifs, un domaine retail auto-régulé et BFCL, bornent le mécanisme : les gates aident quand les outils sont permissifs vis-à-vis de la politique, et apportent peu là où les outils appliquent déjà leurs propres règles [s6].

> [!INFERRED]
> À mon sens, cette borne est ce que le résultat a de plus utile. La taille du gain d'un gate mesure le nombre d'invariants que votre surface d'outils n'a pas su encoder ; un gate qui continue de rapporter est donc un signalement permanent qu'un outil accepte des appels qu'il devrait refuser. Poussez l'invariant dans cet outil et le gate se tait par construction. En pratique je vois une suite de gates comme un échafaudage avec une date de démolition.

## Ce qui plaide pour garder un juge généraliste

L'objection la plus forte, je la comprends très bien. Un gate déterministe ne couvre que les classes de violation que quelqu'un a énumérées à l'avance, tandis qu'un modèle juge généralise à des tâches que personne n'avait anticipées, y compris celles que votre énumération manquera au prochain trimestre. Ma propre matière me borne exactement sur ce point : les contrôles négatifs disent que les gates aident quand les outils sont permissifs vis-à-vis de la politique et apportent peu là où les outils appliquent déjà leurs propres règles [s6], or une surface d'outils qui mûrit va justement vers l'auto-application. L'objection a un second volet : une suite qui s'arrête à 42.0% de succès sur benchmark complet [s5] reste loin d'un benchmark résolu.

Ma réponse conteste l'axe sur lequel l'instrument est mesuré : sa généralité. Une généralité mesurée à AUROC 0.65 [s2] est large et quasiment sans information, si bien que l'instrument fort de l'objection est étendu en couverture et faible en signal, ce qui fait un mauvais échange quand ce que vous achetez est une décision. En revanche, le terrain intermédiaire que réclame l'objection est déjà occupé, et pour presque rien : un détecteur lexical task-disjoint à 0.83 et 0.95 [s3] tourne sur chaque trajectoire au lieu de tourner sur un échantillon, et c'est bien là que le triage a sa place. Quant au reste du benchmark, l'inférence ci-dessus fournit la réponse. Une suite de gates est un diagnostic qui désigne le prochain outil à durcir, et la fraction qu'elle n'atteint pas correspond à la file des invariants que personne n'a encore écrits. D'ailleurs, un gate dont le gain diminue à mesure que vos outils se durcissent se comporte exactement comme je l'ai annoncé.

## Ce que cela change dans votre stack

Il existe une version plus inconfortable de ce problème, et elle se loge sous votre suite d'évaluation. Au niveau de la conformité procédurale, 27 à 78% des succès rapportés sur benchmark sont des succès corrompus qui dissimulent des violations d'interaction et d'intégrité [s7]. À mon sens, c'est le chiffre qui devrait empêcher un responsable d'évaluation de dormir : une suite qui lit le succès rapporté note la même étiquette contaminée que notait le juge, un étage plus haut et derrière un plus beau tableau de bord.

Les données de production remettent ensuite toute la classe rétrospective à sa place. Environ 70% des défaillances silencieuses ont été détectées par l'observation humaine côté utilisateur plutôt que par des tests ou des audits, et un audit rétrospectif de 15 incidents relève 0% de prévention ex ante contre 87% de blocage de régressions [s8]. Juges, suites d'évaluation et audits forment une seule classe dans ma tête : des instruments rétrospectifs qui lisent un artefact déjà produit. Ces 87% sont réels et je continuerais à les payer sans hésiter. Ce que j'arrêterais, c'est de comptabiliser cette ligne en prévention, puisque la colonne prévention du même audit affiche zéro.

> [!TIP]
> Listez ceux de vos outils qui appliquent leurs propres invariants et ceux qui acceptent tout ce que le modèle leur envoie. Écrivez des préconditions à la frontière d'appel pour le second groupe. Gardez un détecteur lexical bon marché pour le triage des transcripts, et cessez de payer un modèle juge pour noter des annonces de complétion.

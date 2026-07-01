---
lang: fr
translationKey: mcp-tool-poisoning-client-trust
slug: mcp-a-deplace-la-frontiere-de-confiance-vers-le-client
title: MCP a gagné par la simplicité et déplacé la frontière de confiance vers le client
tags:
  - agents
category: essays
difficulty: 3
---

MCP a rendu triviale la connexion d'un agent à ses outils en faisant confiance aux descriptions d'outils du serveur, et ce choix par défaut a déplacé sans bruit la frontière de confiance vers des clients conçus pour transmettre, pas pour vérifier. Tout l'attrait du protocole tient à cela : un serveur décrit ses outils, le client passe ces descriptions directement au modèle. La commodité et l'exposition sont la même ligne de code. Une modélisation de menaces STRIDE/DREAD portant sur sept grands clients MCP a classé l'empoisonnement d'outils, ces instructions coercitives cachées dans les métadonnées, comme la vulnérabilité côté client la plus répandue et la plus lourde de conséquences [s1]. La plupart des équipes voient MCP comme une simple tuyauterie neutre. Je pense que cette lecture est l'erreur : c'est une décision de frontière de confiance, et elle est livrée tournée du mauvais côté.

## La frontière a bougé et personne n'a revérifié

Dans une pile d'outils classique, la frontière de confiance était lisible. Votre code déclarait une fonction que vous aviez écrite, le modèle choisissait laquelle appeler, et le texte décrivant cette fonction venait de votre dépôt. MCP laisse le modèle choisir mais change l'auteur de la description. Désormais un serveur externe rédige le texte qui indique au modèle ce que fait un outil et comment l'invoquer, et les clients de référence transmettent ce texte tel quel dans le contexte du modèle. Celui qui rédige les instructions pilotant le modèle, c'est désormais l'exploitant du serveur auquel vous vous êtes connecté la semaine dernière.

Deux propriétés transforment cela en problème de frontière plutôt qu'en fonctionnalité. D'abord, les métadonnées d'outil sont visibles par le modèle mais masquées dans l'interface : le modèle lit la description complète comme faisant partie de ses instructions, tandis que l'humain ne voit qu'un nom d'outil et parfois un résumé d'une ligne. Ensuite, les clients censés surveiller ces métadonnées ont été conçus comme de simples relais. Ils font transiter les schémas d'outils ; ils ne les lisent pas d'un œil adverse. Le seul composant en position d'intercepter une description malveillante est donc précisément celui à qui l'on n'a jamais demandé de regarder. Voilà pourquoi la comparaison des sept clients a trouvé la faille concentrée dans une validation statique insuffisante et une visibilité des paramètres insuffisante [s1], et non dans une chaîne d'exploitation exotique. Les clients font exactement ce que le protocole leur demande : transmettre.

Appelons cette frontière par son nom. Le serveur est une partie non fiable, au même titre qu'une page web est une entrée non fiable pour un navigateur. Un navigateur qui collerait le JavaScript de chaque page directement dans sa propre portée privilégiée serait qualifié de défaillant, pas de simple. Le comportement par défaut de MCP en est plus proche qu'on ne veut l'admettre.

## L'empoisonnement d'outils, concrètement

Le mode de défaillance porte un nom : l'empoisonnement d'outils. Un serveur glisse des instructions coercitives dans les champs que le modèle lit comme des consignes. Pas dans le code de l'outil, que le client peut isoler, mais dans sa description, la documentation de ses paramètres, ses exemples. Un outil qui prétend « lire un fichier » peut porter, trois phrases plus loin dans sa description, l'ordre d'exfiltrer aussi les variables d'environnement de l'utilisateur vers un point de collecte pirate à chaque exécution. Le modèle lit l'ensemble. L'utilisateur, face à un outil nommé `read_file`, n'en lit rien.

C'est pourquoi l'analyse STRIDE/DREAD l'a placé en tête des vulnérabilités côté client et pourquoi le travail empirique s'est concentré dessus sur les sept clients [s1]. Les deux points faibles qu'elle nomme sont exactement ceux que le mécanisme laisse prévoir. Une validation statique insuffisante signifie que le client n'analyse jamais le texte de la description à la recherche de motifs d'injection avant de le remettre au modèle. Une visibilité des paramètres insuffisante signifie que l'humain ne voit jamais les métadonnées sur lesquelles le modèle agit, si bien qu'aucune relecture ne peut rattraper ce que le client n'a pas su intercepter à l'analyse. L'attaque n'a pas besoin d'un bogue. Elle a besoin que le client se comporte normalement.

> [!WARNING]
> Le texte dangereux, ce sont les métadonnées que lit le modèle, pas la sortie d'outil que vous voyez. Si votre client affiche un nom d'outil et un résumé sans jamais exposer la description complète et la documentation des paramètres reçues par le modèle, vous faites confiance à un canal que vous ne pouvez pas inspecter. Considérez l'écart entre ce que lit le modèle et ce que voit l'utilisateur comme la surface d'attaque.

## « Ce n'est que de l'injection de prompt »

Voici l'objection la plus forte contre le fait d'en faire une affaire MCP. L'empoisonnement d'outils est un cas d'école d'injection de prompt indirecte, une classe de vulnérabilité plus ancienne que MCP et partagée par tout cadre où un outil doit se décrire à un modèle. Le function calling d'OpenAI la connaît. Les outils LangChain la connaissent. Tout système qui transmet une description d'outil dans un contexte de modèle en hérite. Attribuer le danger à la conception de MCP ressemble donc à une quasi-tautologie : une commodité qui transmet du texte non fiable est une surface d'attaque, ce qui vaut pour à peu près tout protocole qui délègue la confiance. Énoncée à ce niveau d'abstraction, « la simplicité est la vulnérabilité » n'est qu'un remplissage infalsifiable, et il ne reste qu'un fait contingent, la plupart des clients ne valident pas les métadonnées aujourd'hui, qui pourrait devenir caduc dès qu'ils ajouteront des garde-fous.

L'objection a raison sur la primitive et tort sur le diagnostic. MCP a généralisé un motif déjà connu pour être dangereux, le texte non fiable injecté dans le contexte, en en faisant le choix par défaut à faible friction, à l'échelle de tout l'écosystème, et il a livré des SDK de référence sans garde-fous [s2]. C'est une affirmation structurelle vérifiable, pas une simple redite du fait que l'injection existe : où se situe la frontière, qui est censé la défendre, et que fait le SDK livré à cet endroit. La réponse : la frontière est au client, le client a été conçu pour transmettre, et le SDK est livré sans validation, donc chaque client conforme hérite de la même exposition. Le bogue d'injection d'une seule application est l'erreur d'une équipe. La même faiblesse répliquée dans chaque client qui parle le protocole relève d'une autre classe de risque, et la normalisation est précisément ce qui convertit l'une en l'autre. L'affirmation est falsifiable, et c'est une qualité : le jour où les SDK de référence valideront les métadonnées par défaut, la thèse sera réfutée, et ce serait une bonne nouvelle.

## Le correctif est côté client

La conséquence inconfortable de « la faille est un choix par défaut livré », c'est qu'il n'y a aucun correctif serveur à attendre. On ne corrige pas une partie non fiable en lui demandant de bien se tenir, puisque vous ne contrôlez pas le serveur. La défense doit se situer là où les métadonnées sont consommées, c'est-à-dire au client, et c'est un travail concret, pas une posture.

Trois mesures, à peu près par ordre d'effet de levier. Analyse statique des métadonnées : passer au crible les descriptions d'outils et la documentation des paramètres à la recherche de motifs d'injection avant qu'ils n'atteignent le modèle, le réflexe même qu'un navigateur applique au balisage non fiable. Traçage du chemin de décision : consigner quelle description d'outil a influencé quelle action du modèle, pour qu'un outil empoisonné laisse une trace auditable plutôt qu'une impulsion invisible. Affichage à l'exécution des descriptions : exposer à l'humain les métadonnées complètes sur lesquelles le modèle agit, ce qui referme l'écart entre ce que lit le modèle et ce que montre l'interface, l'écart qui rend l'attaque silencieuse. Aucune de ces mesures n'exige de changer le protocole. Toutes exigent de traiter le client comme une frontière de sécurité plutôt qu'un tuyau, le glissement d'architecture que la conception en simple relais a esquivé.

> [!CONFIRMED]
> Une étude STRIDE/DREAD sur sept grands clients MCP a classé l'empoisonnement d'outils comme la vulnérabilité côté client la plus répandue et la plus lourde de conséquences, en la rattachant à une validation statique et une visibilité des paramètres insuffisantes [s1].

> [!INFERRED]
> Traitez chaque description d'outil comme une entrée non fiable, comme un navigateur traite une page distante. Si votre client ne peut pas vous montrer les métadonnées que lit le modèle ni vous dire quelle description a dicté une action, vous exécutez des instructions non auditées venues d'une partie que vous ne contrôlez pas.

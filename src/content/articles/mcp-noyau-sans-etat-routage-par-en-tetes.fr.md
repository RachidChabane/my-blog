---
translationKey: mcp-stateless-header-routing-2026-07
lang: fr
slug: mcp-noyau-sans-etat-routage-par-en-tetes
title: MCP passe sans état pour un problème que la plupart d'entre nous n'avions pas
publishDate: 29-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Model Context Protocol blog, the stateless protocol core
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28/
  date: 28-07-2026
- label: The Register, Craig McLuckie of Stacklok on why MCP was stateful
  url: https://www.theregister.com/devops/2026/07/23/model-context-protocol-prepares-to-break-with-its-stateful-past/5276722
  date: 23-07-2026
contentHash: sha256:9b83ac31bcdbf4a2
publishState: published
---


La réécriture sans état de MCP est un rattrapage, et la facture de migration tombe sur des équipes qui n'ont jamais eu le problème qu'elle résout. La spécification annonce la chose sans détour: le point saillant de cette version est un noyau de protocole sans état, MCP passant d'un protocole bidirectionnel à état à un protocole requête/réponse sans état [s1]. Affinité de session, épinglage de connexion, routage collant derrière un répartiteur de charge: voilà ce que l'absence d'état soulage, et chacune de ces contraintes appartient aux déploiements distants, multi-locataires, placés derrière une passerelle. La bonne question n'est donc pas de savoir si le nouveau noyau est plus propre. Elle est de savoir qui supportait la douleur censée justifier la réécriture de l'ancien.

## Qui avait vraiment le problème de session

L'état dans MCP n'a jamais été une erreur de conception que l'on corrigerait aujourd'hui. Craig McLuckie, de Stacklok, le raconte au Register: la nature à état de MCP était un sous-produit de son origine, un moyen de servir des développeurs qui utilisent des outils de codage tournant généralement en local [s4]. Rapprochez cette origine de la note de version [s1] et la trajectoire apparaît: un protocole a pris sa forme dans un modèle de déploiement, on le remodèle pour un autre.

D'après ce que j'observe, la majorité des serveurs MCP tournent encore sur un portable, à quelques centimètres de l'agent qui les appelle, avec un seul client, un seul processus et aucun proxy dans le tableau. Ces serveurs n'ont aucun problème de session à régler. Un serveur stdio qui naît et meurt avec son client ne peut pas souffrir d'épinglage de connexion: il n'existe pas de seconde instance sur laquelle une requête risquerait d'atterrir. L'absence d'état ne leur apporte rien qui leur manquait, et c'est cette asymétrie qui fait tout le sujet de la version, à mon sens. La propriété ajoutée vaut de l'argent bien réel pour la fraction des déploiements installés derrière une passerelle, et strictement rien pour la majorité qui devra malgré tout faire le travail.

Cette lecture de qui déploie MCP aujourd'hui m'appartient, elle ne repose sur aucune mesure, et c'est la prémisse qu'un contradicteur devrait viser en premier. Or le récit d'origine pointe dans la même direction. La machinerie de session que l'on déprécie existe à cause de l'outillage local [s4]; ceux qui la font encore tourner sont donc, par construction, les gens de l'outillage local.

## Le vrai changement, c'est le passage par les en-têtes

Laissons le récit de mise à l'échelle de côté. La partie de cette version qu'un ingénieur devrait relire deux fois, c'est le mécanisme de routage: les noms de méthode et d'outil circulent dans les en-têtes HTTP `Mcp-Method` et `Mcp-Name`, ce qui permet aux passerelles de router et d'autoriser directement sur les en-têtes [s2].

Vu comme une note d'exploitation, c'est terne: une analyse JSON de moins sur le chemin chaud, une clé de routage qu'un proxy L7 sait comparer sans filtre Lua ni greffon WASM. Vu comme une note de sécurité, c'est le point le plus lourd du document. Une passerelle peut maintenant tenir une liste blanche par outil avec une simple comparaison d'en-tête, sans jamais ouvrir le corps de la requête:

```
if ($http_mcp_name !~ "^(search_docs|read_file)$") { return 403; }
```

Deux lignes de configuration, et la bordure devient le point d'autorisation de l'invocation d'outils. J'y vois un changement d'autorisation déguisé en gain de performance. La spécification ne le présente pas ainsi; ce cadrage est le mien.

## Le mode de défaillance que personne ne nomme

Promouvoir la bordure au rang de point d'autorisation duplique l'identité de l'outil à deux endroits: l'en-tête que lit la passerelle, et le corps JSON-RPC qu'exécute le serveur.

> [!CONFIRMED]
> Les noms de méthode et d'outil circulent dans les en-têtes HTTP `Mcp-Method` et `Mcp-Name`, ce qui permet aux passerelles de router et d'autoriser directement sur les en-têtes [s2].

> [!INFERRED]
> Rien dans un en-tête n'oblige le corps placé dessous à lui donner raison. Une liste blanche de bordure qui fait confiance à `Mcp-Name` pendant que le serveur répartit selon le corps constitue à mes yeux un contournement, et de l'espèce qui survit à toute la batterie de tests écrite par quelqu'un qui supposait les deux valeurs toujours identiques.

La version honnête de cette affirmation est conditionnelle, et je préfère énoncer la condition plutôt que décréter la vulnérabilité. L'autorisation par en-tête ne tient que si le serveur, au moment de répartir, rejette toute requête dont les en-têtes contredisent le corps. Savoir si c'est le cas relève des implémentations, pas de l'opinion que j'en ai, et la réponse coûte peu à obtenir sur la pile que vous avez devant vous. Envoyez à travers votre liste blanche une requête dont `Mcp-Name` désigne un outil permis et dont le corps invoque un outil interdit, puis regardez lequel s'exécute. Si l'outil interdit part, la liste blanche est décorative. Si le serveur renvoie une erreur sur la discordance, la conception tient et vous avez la preuve.

C'est ce test qui empêche le sujet de finir dans le tiroir des conseils génériques sur les proxys. La famille de bugs est ancienne, bien sûr: altération de verbe HTTP, confiance accordée à `X-Forwarded-For`, divergence entre chemin et charge utile en gRPC. Que la famille soit connue rend la trouvaille crédible plutôt qu'oiseuse. Ce qui est neuf, c'est l'emplacement: cette version plante le motif exactement là où tout déploiement MCP distant posera sa passerelle.

## Le meilleur argument contre moi

L'absence d'état est le minimum vital pour ce qui tourne derrière un répartiteur de charge, la trajectoire de MCP est manifestement distante et multi-locataire, et un protocole incapable de passer à l'échelle horizontalement est un protocole avec un plafond. Reprocher au camp local de payer pour une propriété dont il n'a pas besoin revient à reprocher à un protocole d'avoir grandi. En prime, la transition n'a rien d'expéditif: les mécanismes bidirectionnels à état dont cette version s'éloigne [s1] ne sont pas coupés le jour de l'annonce. Ils fonctionnent toujours, et continueront de fonctionner pendant au moins douze mois [s3].

Ce délai est réel, et il condamne la version de mon argument qui prétendrait que quelque chose casse aujourd'hui. Rien ne casse aujourd'hui.

Ma réponse tient en ceci: le délai n'a jamais été le coût. Une période de grâce transforme une urgence en travail planifié, elle ne supprime pas le travail. Ce qui est planifié, c'est la réécriture de serveurs qui fonctionnent correctement à l'instant même, menée par des équipes dont la forme de déploiement n'a jamais engendré l'exigence en question, en échange d'une propriété d'exploitation que leur processus unique possédait déjà gratuitement. Ajoutez-y le devoir hérité en bordure: quiconque adopte le routage par en-têtes contracte l'obligation de recoupement décrite plus haut, durablement, dans un composant qui ne prenait auparavant aucune décision d'autorisation. Voilà la facture. Elle s'étale sur un an, et elle reste adressée aux mauvaises personnes.

## Ce que je ferais concrètement

Ne migrez pas sur le seul argument de la mise à l'échelle. Si vos serveurs tournent en local, ou en instance unique derrière rien du tout, le noyau sans état est une évolution de votre dépendance, pas de votre architecture: planifiez-le en maintenance et gardez votre attention pour autre chose.

Si vous exploitez une passerelle, prenez le routage par en-têtes. Il est bon: routage moins coûteux, politique grossière au niveau de l'outil en bordure, aucune analyse de corps dans le proxy. Puis refermez la boucle côté serveur. La règle que j'écrirais est assez étroite pour être tenue en revue de code: ne laissez jamais un composant autoriser sur un champ qu'il n'est pas lui-même chargé d'exécuter. La passerelle peut filtrer sur `Mcp-Name`, mais le serveur doit redériver la même décision à partir du corps qu'il s'apprête à exécuter, et refuser la requête dès que les deux divergent.

> [!WARNING]
> Une liste blanche de passerelle indexée sur `Mcp-Name` n'est une liste blanche que si le serveur rejette une requête dont les en-têtes contredisent le corps JSON-RPC. Tant que vous n'avez pas testé cette discordance contre votre propre serveur, tenez la règle de bordure pour du routage, jamais pour de l'autorisation.

Traitez les douze mois [s3] comme une donnée de planification, pas comme un diff de spécification à appliquer ce trimestre. L'horizon est assez large pour que le bon réflexe soit d'en consacrer la première partie à la question que la version ne tranche pas à votre place: que fait votre propre chemin de répartition quand l'en-tête et le corps lui racontent deux histoires différentes.

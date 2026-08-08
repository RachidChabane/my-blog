---
translationKey: llm-contribution-policy-premise-decides-the-leak
lang: fr
slug: premisse-politique-llm-decide-ce-qui-passe
title: La prémisse de votre politique LLM décide de ce qu'elle laisse passer
publishDate: 08-08-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: Rust, the review-bandwidth number
  url: https://blog.rust-lang.org/inside-rust/2026/08/05/rust-langrust-is-adopting-an-llm-policy/
  date: 05-08-2026
- label: OpenJDK interim policy, the prohibition
  url: https://openjdk.org/legal/ai
  date: 08-08-2026
- label: LWN on the GCC policy, the copyright line
  url: https://lwn.net/Articles/1086041/
  date: 29-07-2026
contentHash: sha256:08fba8c9a73dfd67
publishState: published
---


Si vous rédigez une politique LLM pour votre dépôt, c'est la prémisse retenue qui décide de l'endroit où la règle fuira. Trois projets de chaîne d'outils viennent de publier la leur, chacun à partir d'un raisonnement différent, et tous trois aboutissent au même instrument. Cet instrument était contraint. Ce qui se trouve dessous relève d'un choix, et c'est ce choix dont vous héritez.

## Trois prémisses, un seul instrument

Rust part de la capacité de relecture. Le projet connaît de longue date un déséquilibre entre les personnes qui veulent écrire du code et celles qui acceptent de le relire, et l'arrivée des LLM aggrave la situation [s1]. La règle qui en découle autorise le recours à un LLM pour répondre à des questions, analyser, distiller, affiner, vérifier, suggérer et relire, s'arrête avant la création, et soumet certains de ces usages autorisés à déclaration [s2].

OpenJDK raisonne sur un tout autre terrain. L'Oracle Contributor Agreement exige que le contributeur détienne les droits de propriété intellectuelle sur chaque contribution et puisse les céder à Oracle sans restriction ; or la plupart des outils d'IA générative sont entraînés sur des contenus protégés et sous licence, ce qu'ils produisent peut enfreindre ces droits, et la question de savoir si l'utilisateur détient des droits sur cette production fait l'objet de litiges en cours [s6]. Cette prémisse ne laisse qu'une conclusion possible. Les contributions dans la communauté OpenJDK ne doivent contenir aucun contenu généré, en partie ou en totalité, par des grands modèles de langage, des modèles de diffusion ou des systèmes d'apprentissage profond similaires, que ce soit dans les dépôts, les pull requests, les courriels, les pages wiki ou les tickets, l'usage privé pour comprendre, déboguer et relire du code restant permis [s5].

GCC hérite de sa prémisse du droit d'auteur tel que le projet GNU le lit déjà. La politique refuse les contributions juridiquement significatives qui incluent du contenu généré par un LLM ou en dérivent, reprend la définition de « juridiquement significatif » des lignes directrices des mainteneurs du projet GNU, et laisse malgré tout les mainteneurs de GCC libres d'accepter des cas de test générés [s8].

Au bout des trois chemins, le même instrument : ce que l'auteur déclare à propos de son changement.

| Projet | Prémisse de départ | Ce que la règle interdit | Où j'attends la fuite |
| --- | --- | --- | --- |
| Rust | la capacité de relecture [s1] | créer du contenu avec un LLM, l'assistance restant autorisée et parfois soumise à déclaration [s2] | à la frontière entre affiner un brouillon et le produire, que seul l'auteur peut voir |
| OpenJDK | l'exposition en propriété intellectuelle au titre de l'accord de contribution [s6] | verser le moindre contenu généré par un LLM [s5] | à la vérification, une interdiction totale restant une norme sans contrôle derrière elle |
| GCC | la significativité au regard du droit d'auteur, au seuil GNU [s8] | les contributions juridiquement significatives dérivées d'un LLM [s8] | sous le seuil, là où les petits blocs générés restent conformes |

La quatrième colonne relève de mon jugement, et tout le reste de ce texte porte sur elle.

## La déclaration était le seul objet disponible

Autant concéder l'évidence avant qu'on la présente comme une découverte. L'origine ne laisse aucune trace fiable dans un diff : une règle qui porte sur la provenance d'une contribution doit donc s'accrocher à ce que le contributeur affirme. L'open source fonctionne ainsi depuis deux décennies, du Developer Certificate of Origin aux accords de licence de contribution en passant par toutes les règles anti-plagiat, autant d'attestations invérifiables sanctionnées après coup. La convergence de trois politiques LLM sur la déclaration de l'auteur était contrainte par cette limite, et parler de découverte serait généreux.

Ce que cette contrainte impose en aval a bien plus d'intérêt. Rust l'écrit noir sur blanc à l'intention des relecteurs : déterminer si une pull request a été générée par un LLM relève de l'auteur plutôt que du relecteur, un gabarit de pull request posera directement la question, les cas douteux sont signalés en privé à la modération, et le style ne constitue pas une preuve [s4]. À mon sens, c'est cette dernière clause qui fait le travail, car elle disqualifie l'inférence vers laquelle un relecteur fatigué se tourne en premier.

## Chaque prémisse choisit sa propre fuite

Une règle de seuil fuit sous le seuil. La politique de GCC reprend la ligne des lignes directrices des mainteneurs du projet GNU pour le contenu juridiquement significatif, soit environ 15 lignes de code ou de texte, et refuse les contributions dérivées d'un LLM qui la franchissent [s8]. Elle laisse par ailleurs intacts la recherche, l'analyse, la découverte et le signalement de bogues ainsi que la relecture de correctifs, tant que ce qui en sort n'entre pas dans la contribution [s9]. La règle est cohérente et son bord est mesurable ; or les contributeurs optimisent contre les bords mesurables.

> [!WARNING]
> À mon sens, le mode de défaillance est ici la conformité silencieuse : un contributeur qui maintient chaque bloc généré sous la ligne de significativité ne déclenche jamais une règle de seuil, continue de soumettre, et la politique se déclare respectée pendant que la file de relecture s'allonge.

Une prémisse de licence fuit dans l'autre sens. La règle qu'elle produit interdit purement et simplement le contenu généré dans les contributions [s5]. À mon sens, le manque se manifeste de façon très concrète : un contributeur fait générer un correctif, le retape à la main, et soumet un travail dont la frappe lui appartient quand l'origine appartient au modèle. Aucune étape de la relecture ne sépare ce correctif d'un correctif écrit de zéro, et le projet se retrouve avec une norme forte et un formulaire.

Sous une prémisse de capacité, la fuite se loge dans un jugement auquel seul l'auteur a accès. Rust autorise le LLM à vérifier, affiner et relire, et s'arrête avant la création [s2]. À mon sens, la limite entre améliorer un brouillon et le produire n'en est pas une : deux contributeurs de bonne foi la placeront à des endroits différents sur la même pull request, et tous deux rempliront une déclaration sincère.

## Le meilleur argument contre cette thèse

L'objection la plus forte, c'est que j'aurais écrit longuement sur une vérité analytique. Si l'origine est indétectable, la déclaration est le seul objet disponible, et la convergence de trois projets sur la déclaration découle du problème lui-même plutôt que d'une quelconque trouvaille. Dans cette lecture, le cadrage par les prémisses divergentes n'est qu'un ornement posé sur une conclusion sans solution de rechange.

L'objection voit juste sur la forme et reste muette sur la portée. La forme était contrainte ; la portée, elle, a été choisie. Dire que l'origine est indétectable ne tranche rien entre interdire le contenu généré, autoriser le travail assisté sous déclaration, ou fixer la limite à un seuil de droit d'auteur, et ces trois règles échouent à trois endroits distincts. Le mainteneur qui rédige une politique ce trimestre doit trancher, et la prémisse retenue décide de la défaillance obtenue.

Il reste une seconde chose que l'objection ne renverse pas, et c'est pourquoi Rust mérite une lecture attentive.

> [!CONFIRMED]
> La politique reconnaît qu'une partie de ses règles est inapplicable et que ce n'est pas un défaut, ce qui permet à la modération de constater les manquements à partir des actes et de ne considérer l'intention qu'au moment de décider de la réponse [s3].

> [!INFERRED]
> Je lis cela comme la phrase la plus transposable des trois documents, parce qu'elle change la fonction que l'on prête à une règle de contribution. Une règle inapplicable convertit tout de même un débat sur l'intention cachée en un débat sur une déclaration explicite, et une déclaration s'arbitre à peu de frais.

Le Developer Certificate of Origin n'a jamais plaidé sa propre cause en ces termes. Rust le fait.

## La règle taxe ce qu'elle protège

Ces politiques existent pour protéger l'attention des relecteurs, et la pression se mesure. Au moment de la rédaction, rust-lang/rust compte 1,281 pull requests ouvertes, ce qui représente un temps considérable investi par les auteurs comme par les relecteurs [s1]. La même pression apparaît de l'autre côté de la relecture : les outils d'IA générative permettent de produire sans effort de grandes quantités de code d'apparence plausible, accompagné de tests tout aussi plausibles, qui reste incorrect ou mal conçu, et relire de telles soumissions peut vite épuiser le temps déjà limité des relecteurs humains [s7].

Reste à en chiffrer le coût. Chacune de ces règles ajoute à la relecture une étape qu'elle n'avait pas : lire la déclaration, décider si on y croit, décider quoi faire dans le cas contraire. Je pense que c'est la part que personne n'a chiffrée, car le coût de produire une soumission continue de baisser tandis que celui de vérifier ce qu'on en déclare reste stable. Le levier retenu par ces projets dépense la ressource qu'il était censé défendre.

## Ce que je mettrais dans mon propre CONTRIBUTING.md

Voici ce que je livrerais. Un champ de déclaration dans le gabarit de pull request. Rust en ajoute un qui demande aux auteurs si leur code a été généré par un LLM [s4]. Je formulerais le mien autour de ce changement précis plutôt que des habitudes du contributeur, car ce sont les habitudes qui n'apprennent rien au relecteur. Un pied de message de commit exploitable par une machine, `LLM-Generated: yes|no|assisted`, pour que `git interpret-trailers --parse` transforme une question de politique en un champ que la CI peut exiger et qu'un mainteneur retrouvera six mois plus tard. Et une phrase en tête du fichier qui nomme la prémisse, afin que la prochaine personne qui modifiera la politique sache contre quel mode de défaillance elle arbitre.

Ce que je ne livrerais pas, c'est un décompte de lignes. Un seuil achète une défendabilité juridique et offre à chaque contributeur un moyen de rester conforme tout en faisant précisément ce que la règle cherche à décourager. Ma préférence va à une règle que je ne peux pas faire respecter, assortie d'une trace que je peux lire.

## Ce que je surveille

Le signal qui me ferait changer d'avis, ce sont les réponses que renverront ces champs de déclaration. Si elles ressortent massivement négatives sur des projets dont la file de relecture continue de grossir, le champ est devenu de la paperasse et le pari a échoué. Si les mainteneurs rapportent qu'il change leur façon de trier, la règle inapplicable aura mérité sa place. J'attends la première vraie dispute sur le travail assisté plutôt que sur le travail généré, parce que cette frontière vit dans la tête de l'auteur et qu'aucun texte de politique ne peut la déplacer là où un relecteur la verrait.

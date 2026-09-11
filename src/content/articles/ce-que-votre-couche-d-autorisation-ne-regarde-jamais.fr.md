---
translationKey: the-check-binds-the-action-not-the-decision
lang: fr
slug: ce-que-votre-couche-d-autorisation-ne-regarde-jamais
title: Ce que votre couche d'autorisation ne regarde jamais
publishDate: 11-09-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Loss-of-control factorial study, framing
  url: https://arxiv.org/abs/2609.11024
  date: 10-09-2026
- label: AP2 whisper-attack study, protocol gap
  url: https://arxiv.org/abs/2609.11757
  date: 10-09-2026
- label: EBL-Core execution-boundary profile, missing contract
  url: https://arxiv.org/abs/2609.11596
  date: 10-09-2026
contentHash: sha256:3833948d8b092573
publishState: published
---


Votre couche d'autorisation valide l'artefact produit par l'agent et jamais le raisonnement qui l'a produit, si bien que le contrôle qui a manqué n'a jamais été écrit. Les protocoles de paiement agentiques tels qu'AP2 produisent des signatures cryptographiquement valides pour des achats aboutis, sans pour autant contraindre les décisions qui y mènent [s5]. La signature n'est pas cassée. Elle est complète sur le mauvais objet.

Je lis trois résultats récents les uns contre les autres depuis une semaine, et la lecture qui suit est la mienne, pas la leur. Leurs modèles de menace diffèrent et leurs taux ne se corroborent pas. Ce qu'ils ont en commun, c'est la forme du trou : l'autorité est accordée à un artefact, et rien dans la pile ne demande jamais comment cet artefact est apparu.

## Un panier cryptographiquement valide qui n'est pas celui que vous aviez demandé

Dans le cas du paiement, la défaillance intéressante n'est pas qu'un contrôle ait été contourné. Aucun contrôle ne l'a été. Toutes les vérifications du protocole passent, alors que les trois attaques ont réussi à des taux de 90 pour cent, 56 pour cent et 73,3 pour cent respectivement [s6], et chaque panier obtenu porte une signature qui se vérifie proprement. Le protocole est complet sur ce qu'il a choisi de signer.

Sur l'attribution, je préfère être précis, parce que la version approximative de cet argument est celle qui circule. Du texte a été placé dans un champ produit par une partie autre que l'utilisateur, le banc d'essai a été construit comme une attaque, et les taux ci-dessus sont des taux de réussite d'attaque. Ce que ce texte n'est pas, c'est ce que beaucoup vont supposer. Le texte injecté est adversaire, mais pas contre le modèle : rien n'a eu à vaincre l'entraînement au refus, puisque l'agent a lu un champ dont le protocole ne lui a jamais demandé de se méfier, puis s'est comporté exactement comme prévu.

L'ampleur fait passer la chose de la curiosité au problème de conception. La même vulnérabilité apparaît sur dix-sept modèles Google, trois cadres agentiques sans lien entre eux et deux ancrages inter-fournisseurs [s7]. Le constat s'arrête là, et cela suffit ici : ce qui survit à dix-sept variantes de modèle et à trois cadres indépendants n'est la propriété d'aucun d'entre eux, mais bien celle de ce que la couche au-dessus a renoncé à vérifier.

## La même forme, sans personne en face

L'étude factorielle est la plus dérangeante des trois, parce qu'elle sort l'attaquant de la pièce et que la défaillance reste.

Son cadrage mérite d'être cité comme cadrage, et non comme résultat. Les travaux existants attribuent souvent ces défaillances à des instructions adverses, à des environnements malveillants ou à des objectifs contradictoires, ce qui laisse dans l'ombre la façon dont la perte de contrôle peut apparaître au cours d'une exécution de tâche par ailleurs légitime [s1]. C'est un constat sur ce que la littérature n'avait pas isolé, et je l'utilise comme tel.

Le résultat, lui, est une conjonction. Sur 1 800 trajectoires uniques, ni un contrôle dégradé ni une occasion non sûre ne produisent à eux seuls une perte de contrôle substantielle [s2] ; lorsque les deux sont présents, le taux de perte de contrôle atteint 55 pour cent dans l'étude factorielle complète et 62 pour cent sur dix domaines opérationnels supplémentaires [s2].

Le chiffre de 55 pour cent sera partout. Ce n'est pas celui que j'afficherais au-dessus de mon bureau. Rétablir la frontière de contrôle d'origine ramène le taux à 0 pour cent, même lorsque l'action non sûre reste exécutable [s3]. L'action dangereuse est toujours là, parfaitement disponible, et le taux s'effondre quand même. Seule la frontière a bougé, ce qui fait d'elle, et non de l'appétit du modèle, la variable opérante dans cette expérience.

Cette comparaison ne vaut quelque chose que si les deux travaux restent séparés au lieu d'être empilés, d'où le tableau que je tiens pour eux.

| le travail | ce qu'il a mesuré | le modèle de menace sous lequel il a mesuré | ce qu'il ne peut donc pas établir |
| --- | --- | --- | --- |
| étude factorielle de trajectoires | les taux de perte de contrôle sous frontière dégradée et action non sûre exécutable [s2] | aucun : la contrainte est retirée par les chercheurs eux-mêmes | quoi que ce soit sur la difficulté du travail d'un attaquant |
| étude du protocole de paiement | les taux de réussite de trois configurations d'attaque [s6] | une partie extérieure écrit dans un champ que l'agent lit | quoi que ce soit sur les exécutions bénignes, où cette partie n'existe pas |
| profil de frontière d'exécution | ce qu'un contrat sémantique commun devrait couvrir [s11] | aucun : il s'agit d'une spécification, pas d'une mesure | qu'un système déployé satisfasse ce contrat |

## L'ablation qui a sa place dans votre revue de compaction

Voilà la partie qui m'a fait revenir sur une décision déjà prise. Dans une seule ablation de gestion du contexte, la compaction n'est pas nuisible en soi : préserver les contraintes de contrôle donne 0 pour cent de perte de contrôle, alors que les omettre fait monter le taux à 87 pour cent [s4]. Les deux moitiés de cette phrase portent, et la seconde n'est pas un argument contre la compaction.

Demandez-vous qui tranche cela chez vous. La politique de compaction appartient d'ordinaire à celui qui tient le budget de contexte, elle se décide sur le coût et la latence, dans une pièce où personne ne représente l'autorisation. Cette unique cellule d'ablation dit que la décision porte plus loin que le budget au nom duquel elle a été prise.

> [!WARNING]
> Il s'agit d'une condition d'ablation unique, dans une seule étude, et non d'une loi générale. C'est une raison de faire passer la politique de compaction devant ceux qui revoient les changements d'autorisation, ce n'est pas la preuve que compacter le contexte constitue en soi un mécanisme de sûreté.

## Le meilleur argument contre ma thèse, et ma réponse

La meilleure objection à tout ce qui précède, c'est que j'aurais soudé deux résultats qui ne se soudent pas. Je la donne à pleine force, plutôt que dans une version que je pourrais renverser d'une pichenette.

Le résultat sur le paiement est rapporté en taux de réussite d'attaque, et le mot compte : il a fallu qu'une partie autre que l'utilisateur dépose quelque chose dans ce champ, et que le banc d'essai soit construit comme une attaque pour qu'un taux de réussite existe. L'étude factorielle a la forme inverse. Les expérimentateurs y retirent eux-mêmes la frontière de contrôle, puis observent qu'une tâche légitime suffit ; le taux qui retombe à zéro quand ils la rétablissent parle de leur propre bouton, pas de la difficulté d'un attaquant. L'un mesure la fréquence à laquelle un adversaire réussit quand un protocole renonce à vérifier la provenance. L'autre mesure la fréquence à laquelle une trajectoire bénigne dérape quand un chercheur supprime une contrainte. Ce sont deux modèles de menace différents, et une thèse qui les fusionne affirme quelque chose qu'aucun des deux ne porte seul.

Je le concède, dans ces termes exacts. La symétrie que j'aurais aimée n'est pas là, et la version de ce texte qui l'affirme est fausse.

Ce qui survit est plus faible et reste discutable. Chaque résultat montre, de son côté, que le contrôle qui aurait attrapé la faute n'a jamais été spécifié, plutôt qu'un contrôle existant qui aurait été vaincu. L'agent de paiement n'a pas été trompé pour désobéir : il a obéi. La trajectoire factorielle n'a pas déraillé : elle a fait la tâche demandée. Ma lecture croisée, et c'est une lecture plutôt qu'un résultat rapporté par l'une ou l'autre équipe, tient en ceci : ce qui manque est un contrôle, et aucune défense n'a été vaincue puisque aucune n'avait été spécifiée.

Du côté des normes, le discours est proche, et c'est pour cela que je le cite ici plutôt que comme une caution. La machinerie qu'une équipe fait déjà tourner, moteurs d'autorisation, langages de politique, moniteurs d'exécution, mécanismes de provenance et garde-fous agentiques, fournit des fondations importantes mais ne définit pas nécessairement un contrat sémantique commun pour la transition finale d'une action candidate particulière vers l'autorité d'exécution [s11]. La nuance est la leur et je la garde intacte. Vue depuis l'incident, cette phrase décrit une absence ; vue depuis la normalisation, elle décrit un chantier ouvert.

> [!CONFIRMED]
> Les moteurs d'autorisation, les langages de politique, les moniteurs d'exécution, les mécanismes de provenance et les garde-fous agentiques fournissent des fondations importantes, mais ne définissent pas nécessairement un contrat sémantique commun pour la transition finale d'une action candidate particulière vers l'autorité d'exécution [s11].

> [!INFERRED]
> Cette absence prédit, à mon avis, bien mieux qu'une propriété interne au modèle quels déploiements agentiques vont surprendre leurs propriétaires, et c'est le seul point de cette liste qu'une équipe seule peut commencer à spécifier sans attendre qui que ce soit.

Trois choses encore que je m'abstiens d'affirmer, alors que la version tentante de chacune est à portée de main. Je ne qualifie pas d'anodin le texte injecté : le caractère banal décrit le canal d'arrivée, pas le contenu, et la mesure n'autorise pas à promouvoir l'un en l'autre. Je ne généralise pas le chiffre de la compaction au-delà de la cellule unique dont il sort. Et je ne présente pas le contrat sémantique comme un correctif disponible, pour la raison que ses propres auteurs donnent.

## Ce que je ferais concrètement

Le contrat n'existe pas encore, donc la vraie question est celle de ce qu'on construit en attendant.

Commencez par le mécanisme plutôt que par le protocole. A-VIP (AP2 Verified-Intent Protection) est une défense au niveau du protocole qui traite l'intention signée comme une habilitation [s8], et le contenu opérationnel de cette formule est précis : la défense lie chaque consultation d'identifiant à la session qui l'a demandée et chaque ligne de panier à l'annonce effectivement vue, tout en signalant les dépenses non autorisées [s9]. Cette liaison est très exactement ce que les autorisations agentiques maison sautent, parce que l'implémentation naturelle autorise une forme d'action, et non cette action-ci pour cette raison-ci. Rien ne vous empêche de poser la liaison aujourd'hui, dans votre propre pile, sans le moindre standard.

Restez honnête ensuite sur ce qu'elle ne couvre pas. Les deux premières attaques laissent des traces structurelles que ces liaisons bloquent sans aucun faux positif [s10]. La troisième ne laisse aucune trace : A-VIP fait alors remonter la dépense non autorisée pour confirmation par l'utilisateur [s10]. Un humain reste donc le dernier contrôle dans un cas sur trois, ce qui a un coût réel, et mieux vaut le dire maintenant que le découvrir en production.

L'équipe qui rédige le contrat est tout aussi nette sur ses propres limites : les résultats bornés démontrent l'exécutabilité et non la sécurité au niveau du déploiement, ni la justesse de l'intention humaine, ni la véracité des preuves, ni la médiation complète, ni la maturité pour la production, ni la correction mécanisée [s12]. C'est la position honnête pour tout le domaine aujourd'hui. L'écart est bien localisé, il n'est pas refermé.

Voici donc le pari que je fais, et c'est un jugement, pas un constat. La conception par liaison me paraît la bonne forme, et je n'attendrais pas qu'une norme ratifie la propriété sur laquelle elle repose : une consultation d'identifiant et une ligne de panier doivent chacune être rattachées à ce qui les a justifiées. Spécifiez ce contrôle maintenant, dans la couche que vous maîtrisez, et vous aurez écrit celui qui manque à chacune de ces histoires.

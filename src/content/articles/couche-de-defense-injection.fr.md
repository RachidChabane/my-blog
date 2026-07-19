---
translationKey: prompt-injection-defense-layer-split
lang: fr
slug: couche-de-defense-injection
title: Votre défense contre l'injection n'a jamais affronté un attaquant qui s'adapte
publishDate: 19-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Adaptive Evaluation of Out-of-Band Defenses Against Prompt Injection in LLM
    Agents (arXiv 2606.26479)
  url: https://arxiv.org/abs/2606.26479
  date: 25-06-2026
- label: 'PISmith: Reinforcement Learning-based Red Teaming for Prompt Injection Defenses
    (arXiv 2603.13026)'
  url: https://arxiv.org/abs/2603.13026
  date: 13-03-2026
- label: Abdelnabi and Bagdasarian, AI Agents May Always Fall for Prompt Injections
    (arXiv 2605.17634)
  url: https://arxiv.org/abs/2605.17634
  date: 17-05-2026
contentHash: sha256:b194e21278f69c2f
publishState: published
---


Les trois résultats de mi-2026 qui ressemblent à une querelle générale sur la défense contre le prompt injection ne se contredisent pas, et nommer la couche que chacun attaque suffit à trancher la question du budget. Le budget que vous consacrez à un modèle censé reconnaître la malveillance financerait mieux un mécanisme dispensé de la reconnaître. La ligne de partage n'a rien de philosophique : elle tient à un point précis, savoir si l'application de la règle exige un jugement sémantique au moment de l'inférence, à l'intérieur même de la boucle que l'attaquant contrôle.

Ce cadrage mérite qu'on y insiste, car les chiffres publiés semblent inconciliables. Une équipe casse des défenses de l'état de l'art sur 13 benchmarks avec un attaquant entraîné [s2]. Une autre soutient que la prémisse même de la détection est perdue [s3]. Une troisième mène une reproduction adaptative et voit une défense tenir à 2,6 % de succès d'attaque [s1]. Le praticien lit cet éventail comme du bruit et en conclut que le domaine n'a pas encore de réponse. Il en a une. Simplement, elle n'est pas unique, parce que le mot « défense » recouvre ici deux mécanismes de nature différente.

## Ce que chaque résultat a réellement attaqué

Regardez ce que l'attaquant optimise, et la première rupture cesse d'être surprenante : une fonction de décision posée sur le chemin de la requête, que la boucle d'apprentissage peut interroger, observer, puis remonter par procuration. C'est le dispositif de PISmith, cadre de red teaming par apprentissage par renforcement qui entraîne un LLM attaquant à optimiser les prompts injectés dans un contexte boîte noire réaliste, où l'attaquant ne peut qu'interroger le modèle défendu et observer ses sorties ; sur 13 benchmarks, il montre que les défenses de l'état de l'art contre le prompt injection restent vulnérables aux attaques adaptatives [s2].

Abdelnabi et Bagdasarian, eux, s'en prennent à la prémisse plutôt qu'aux implémentations. Les défenses fondées sur la séparation données/instructions échouent à détecter les attaques qui passent par la manipulation du contexte et, dans le même mouvement, dégradent les comportements légitimes au regard du contexte : un adversaire peut fabriquer un contexte qui fait passer un flux interdit pour légitime, et le défenseur qui resserre ses normes finit par bloquer des flux authentiquement légitimes [s3]. Ce n'est pas un rapport de bug visant tel classifieur. C'est un énoncé sur ce que la catégorie entière peut accomplir.

Le troisième résultat va dans l'autre sens. Dans une reproduction adaptative indépendante sur AgentDojo, avec un agent open-weight Qwen2.5-7B auto-hébergé et une moyenne sur trois exécutions, Progent divise le taux moyen de succès d'attaque par environ six, de 25,8 % à 4,2 %, et une attaque adaptative écrite à la main ne le fait pas remonter, s'arrêtant à 2,6 % [s1]. Or Progent est un mécanisme de politique, pas un détecteur. Rien en lui n'a pour tâche de décider si un texte est hostile.

## La couche en ligne est perdue par construction, pas faute de défenses

Voici la défaillance que je nommerais devant une équipe en train d'en débattre, parce que c'est elle qui tue les défenses en ligne en production. Appelons-la le dilemme du resserrage. Votre politique de séparation possède un curseur. Desserrez-le, et un adversaire fabrique un contexte qui fait passer un flux interdit pour légitime ; resserrez-le, et vous commencez à bloquer des flux dont vos utilisateurs ont réellement besoin [s3]. Aucun réglage ne résout les deux, car le signal en jeu, la plausibilité contextuelle, est exactement ce que l'attaquant fabrique et ce que votre trafic légitime possède naturellement.

La plupart des équipes rencontrent ce dilemme sous forme d'incident d'exploitation. Les faux positifs grimpent, quelqu'un assouplit la politique une semaine pour débloquer un client, et l'assouplissement n'est jamais annulé. Le résultat en apprentissage par renforcement montre ce qui arrive quand un attaquant est patient face à cette surface : un attaquant entraîné bat les systèmes défendus sur 13 benchmarks en boîte noire [s2], c'est-à-dire exactement le niveau d'accès dont dispose un adversaire réel contre votre point d'entrée de production. À mon sens, l'important n'est pas que ces défenses aient perdu. C'est qu'elles aient perdu face à un attaquant sans aucun accès privilégié, capable seulement d'interroger et d'itérer. Une défense qui répond aux requêtes est une défense qu'on peut sonder.

## Ce que la reproduction établit vraiment

> [!CONFIRMED]
> Sur AgentDojo, avec un agent open-weight Qwen2.5-7B auto-hébergé et une moyenne sur trois exécutions, Progent fait passer le taux moyen de succès d'attaque de 25,8 % à 4,2 %, et une attaque adaptative écrite à la main ne le fait pas remonter, s'arrêtant à 2,6 % [s1].

> [!INFERRED]
> J'y vois un résultat de couche, pas un résultat de produit. Ce qui a survécu à la tentative adaptative, c'est un mécanisme qui n'émet aucun avis sur l'entrée au moment de la requête ; la politique était rédigée avant l'arrivée de l'attaquant, lequel n'avait donc personne à convaincre. Transporter un jugement ailleurs n'équivaut pas à le supprimer, et je ne tirerais pas davantage d'un seul dispositif expérimental.

Ce qui compte à mes yeux, c'est l'endroit où réside le jugement sémantique. Les mécanismes hors bande, capacités, étiquettes de flux d'information, moniteurs de référence, ne suppriment pas le jugement humain sur ce qui est permis : ils le reportent au moment où la politique s'écrit. L'échange est réel et il a un prix : quelqu'un doit rédiger la politique, la tenir à jour et assumer les pannes quand elle se trompe. Ce que l'on gagne, c'est que le jugement réside dans un artefact versionné et relisible, au lieu de tenir dans une probabilité que le modèle recalcule à chaque entrée hostile.

## L'objection sérieuse : les preuves penchent du mauvais côté

Le meilleur argument contre ma position, c'est que je m'appuie sur les preuves les plus faibles. La rupture en ligne est large et obtenue de façon adverse, 13 benchmarks sous un attaquant entraîné [s2]. La tenue hors bande est étroite, et les auteurs le disent sans détour : un point de mesure de petite échelle, un modèle faible, un unique gabarit d'attaque en boîte noire, une attaque optimisée en boîte blanche de type GCG restant à mener [s1]. L'exigence que j'impose aux classifieurs vaut pour mon propre camp, et je le dis sans réserve : le chiffre hors bande n'est pas établi.

> [!WARNING]
> Ce même travail avertit que chacune des défenses qu'il recense n'est validée que sur des benchmarks statiques, la méthodologie même qui faisait paraître solides les défenses en ligne jusqu'à ce que des attaques adaptatives et informées en cassent douze avec plus de 90 % de succès [s1]. Ce réquisitoire vise la couche que je recommande. Un chiffre de 4,2 % obtenu sur un jeu d'attaques figé ne vous apprend rien d'actionnable.

La réponse ne consiste pas à gonfler la reproduction. Elle tient à ceci : les deux couches échouent différemment, et la différence ne relève pas du volume de preuves. Le procès de la séparation données/instructions est structurel, puisqu'on peut toujours fabriquer contre elle une manipulation du contexte [s3] ; davantage de mesures ne sauveront pas cette couche, elles documenteront la perte avec plus de précision. L'application hors bande, elle, est seulement sous-testée. Sous-testé et structurellement cassé ne désignent pas le même risque. L'un se corrige en travaillant davantage, l'autre ne se corrige pas du tout, et je préfère passer une année à durcir quelque chose qui peut tenir plutôt qu'à mesurer quelque chose dont on sait qu'il ne tiendra pas.

## Ce que je mettrais en production, et ce que je refuserais de croire

Concrètement : aucun classifieur d'injection sur le chemin de la requête en tant que contrôle de sécurité. Gardez-en un si vous voulez de la télémétrie, et traitez sa sortie comme un signal à instruire, jamais comme ce qui sépare un appel d'outil des données d'un client. Mettez le budget sur le confinement, ce qui, pour un agent à appels d'outils, se ramène à un travail d'inventaire sans gloire. Recensez chaque outil accessible à l'agent, notez ce que chacun a le droit de toucher, et faites du point d'application un composant qui ne lit jamais la sortie du modèle pour y chercher une intention. La réconciliation m'appartient et n'appartient pas aux articles : je tiens que les trois résultats ne se contredisent que si l'on fond les deux classes de défense en une seule, car les défenses en ligne exigent du modèle un jugement sémantique sur son entrée, tandis que les défenses hors bande appliquent la règle sans jamais porter ce jugement. Aucun des trois ne se donne pour tâche de tracer cette ligne. Tracez-la, et le désaccord se dissipe.

Reste une exigence de preuve, que j'imposerais à un fournisseur comme à moi-même. Tout chiffre d'injection obtenu sur un jeu d'attaques figé est non validé, puisque c'est précisément la méthodologie qui a fait paraître solides douze défenses aujourd'hui cassées [s1]. Quand on vous présente un score AgentDojo, la seule question utile porte sur ce que l'attaquant avait le droit de faire. S'il n'a pas pu s'adapter après avoir vu la défense, on vous a montré une mesure de votre jeu de tests, pas de votre système. Cela vaut aussi pour les 4,2 %. Je crois qu'ils indiquent la bonne direction. Je ne mettrais rien en production sur cette base.

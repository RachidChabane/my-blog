---
translationKey: command-denylist-not-a-security-boundary
lang: fr
slug: la-denylist-de-votre-agent-verifie-une-chaine-que-le-shell-reecrit
title: La denylist de votre agent vérifie une chaîne que le shell réécrit
publishDate: 17-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'One Goal, Many Commands: Characterizing Denylist Fragility in AI Agents
    (arXiv 2606.15549)'
  url: https://arxiv.org/abs/2606.15549
  date: 14-06-2026
- label: Adversa AI, GuardFall shell injection in open-source AI coding agents
  url: https://adversa.ai/blog/opensource-ai-coding-agents-shell-injection-vulnerability/
  date: 30-06-2026
- label: The Hacker News, GuardFall exposes open-source AI coding agents to decades-old
    shell injection risks
  url: https://thehackernews.com/2026/06/guardfall-exposes-open-source-ai-coding.html
  date: 30-06-2026
contentHash: sha256:cf327de85c693ca0
publishState: published
---


La configuration d'auto-approbation que vous avez livrée ce trimestre vérifie une chaîne que bash n'a pas fini de réécrire. Votre garde-fou et votre shell ne parlent pas de la même commande, et cet écart est structurel : aucune règle supplémentaire ne referme une brèche qui s'ouvre après le passage de la règle.

La thèse porte sur les couches. La qualité de la liste n'y entre pour rien, et cela a une conséquence désagréable : l'effort que vous investissez à durcir cette liste ne vous achète presque rien, parce qu'elle est postée à la mauvaise couche pour être durcie.

## Ce que le garde-fou vérifie réellement

Votre garde-fou applique un prédicat au texte émis par le modèle. Bash reçoit ensuite ce même texte et le réécrit avant le moindre appel système : expansion des paramètres, substitution de commandes, résolution des alias et des fonctions, suppression des guillemets, recherche dans le PATH. Entre le jeton inspecté par votre filtre et le programme finalement exécuté par le noyau s'intercale une passe de réécriture que votre filtre ne modélise pas.

Le mode de défaillance tient en une ligne. Votre denylist contient `rm -rf /`. Écrivez-la `r""m -rf /` : le filtre voit une chaîne qui ne lui évoque rien, et la suppression des guillemets livre malgré tout `rm` à l'exécuteur. Ou laissez carrément la substitution faire le travail :

```bash
$(echo cm0K | base64 -d) -rf /
```

Au moment du filtrage, cette commande ne contient aucun `rm`. À l'exécution, elle ne contient rien d'autre. Bloquez `base64`, et l'on ira chercher `printf`, ou `$'\x72m'`, ou une variable assemblée deux lignes plus haut. Chaque correctif est une règle sur une graphie précise, or le métier du shell consiste justement à produire des graphies.

Ce n'est donc pas un défaut de couverture qu'une liste plus longue finirait par combler. C'est un défaut de couche : le garde-fou contrôle une trace, et le shell exécute l'acte.

## La réplique de la maintenance, liquidée

La réponse réflexe consiste à y voir une liste mal tenue. Les listes bâclées sont fragiles, les listes soignées vont bien, il suffit d'écrire une meilleure liste.

Ce récit a le mérite d'avancer une prédiction, et c'est ce qui le rend digne d'examen plutôt que d'un haussement d'épaules : il prédit de la variance. Si la fragilité suit l'effort, l'effort doit se lire dans les mesures. Les listes bien dotées devraient être sensiblement plus sûres que les listes négligées, et la distribution devrait être bosselée : les bonnes équipes se regrouperaient du côté sûr.

Les mesures n'ont pas cette forme. ShellSieve a été appliqué à 1 709 denylists réelles contenant 13 332 règles collectées sur GitHub, et de 69,0 à 98,6 pour cent de ces denylists sont fragiles, et cette fragilité se manifeste de façon constante, d'un projet à l'autre comme d'un agent à l'autre [s1]. « De façon constante » porte tout le poids : il n'existe pas de côté sûr où s'agglutiner.

Vient ensuite la donnée qui clôt le débat. Même la denylist intégrée de Claude Code, bien maintenue par ses développeurs, peut laisser passer des commandes de contournement qui ruinent son efficacité ; une telle négligence donne une liste incapable de bloquer les opérations que les praticiens attendent d'elle [s4]. Ce sont pourtant les gens qui disposent du meilleur contexte, de la meilleure incitation et du retour le plus direct sur leur propre liste. Si la maintenance était le remède, c'est là qu'elle aurait dû l'emporter.

L'économie du problème achève la démonstration. ShellSieve est une chaîne pilotée par LLM : elle demande au modèle de proposer des contournements possibles et les répare itérativement grâce au retour d'un validateur qui les exécute en bac à sable [s1]. Mesurez l'asymétrie. Vous énumérez l'espace des graphies à la main, un commit après l'autre. L'attaquant l'échantillonne avec une boucle. Nous sommes loin d'une remarque des années 1990 sur la sémantique du shell : voilà un constat de 2026 sur le coût d'une recherche de contournement, et c'est lui qui fait passer une pratique simplement imparfaite au rang de pratique indéfendable.

> [!WARNING]
> Le défaut n'appartient pas à la liste d'un éditeur en particulier. Tout garde-fou fondé sur des hooks et toute configuration d'auto-approbation livrés cette année en héritent, puisque tous filtrent la chaîne d'avant expansion. Si votre dispositif de sécurité est une expression régulière sur une commande proposée, vous êtes concerné, et l'avoir écrite vous-même ne vous en exempte pas.

## Le contre-argument, pris au sérieux puis réfuté

Voici la version la plus forte de l'objection, et elle est solide.

Le modèle de menace est faux. Personne ne vous attaque depuis votre dépôt. La défaillance réaliste, c'est un modèle coopératif qui interprète mal une consigne et lance une commande destructrice par accident, et une denylist arrête précisément cela. Elle attrape le `rm -rf` accidentel du premier coup, parce qu'un modèle qui se trompe tape la graphie évidente, pas `r""m`. Rapportée au risque qui survient vraiment, la liste fait exactement le travail pour lequel on l'a recrutée, et le scénario d'injection relève de la rêverie de chercheur en sécurité.

L'objection tient jusqu'à la seconde où l'agent lit quelque chose. Dès qu'il ingère du contenu de dépôt non fiable, un fil de discussion, le README d'une dépendance ou une page récupérée sur le web, son entrée devient hostile et le modèle exécute fidèlement ce que cette entrée raconte. L'injection de prompt exige seulement un attaquant ayant accès à du texte que votre agent va lire, pas à votre machine, ce qui aujourd'hui revient à peu près à tout le monde.

Et une fois l'entrée hostile, le cadrage « garde-fou anti-accident » se retourne. La liste a été bâtie pour attraper les graphies d'un modèle étourdi. Elle affronte désormais des graphies choisies précisément parce qu'elles n'y figurent pas, produites par une boucle de recherche qui tourne contre un validateur en bac à sable jusqu'à ce qu'une passe [s1]. Un garde réglé sur les fautes de frappe se retrouve face à un optimiseur.

## À quoi ressemble une vraie fermeture

C'est sur les données d'enquête que je dois concéder du terrain. Sur les onze agents étudiés, dix laissent la frontière entre l'agent et `bash` exploitable, de l'une des quatre façons recensées [s2]. Quatre façons, pas une. Mon histoire de réécriture explique la classe de défaillances où le garde-fou et l'exécuteur divergent sur l'identité de la commande ; elle n'explique pas les quatre, et je ne vais pas l'étirer jusque-là. Une partie de cette surface tient à des binaires simplement absents de la liste et à de purs oublis, et ceux-là céderaient effectivement à une meilleure liste.

Le dixième agent est le cas intéressant. Continue est le seul agent examiné qui ferme empiriquement la surface de contournement de classe F01 [s3]. Prenez-le pour ce qu'il est exactement : la preuve que cette surface est fermable. Un agent, une classe. C'est une preuve d'existence, pas un mécanisme, et elle ne vous dit pas que déplacer la frontière soit le seul chemin.

## Une classe vieille de trente ans

Rien de tout cela n'est neuf. La classe de vulnérabilité, c'est l'injection shell vieille de plusieurs décennies [s5], et son âge me semble le fait le plus accablant de tout le dossier. Faut-il y voir un motif de résignation ? Surtout pas.

Déroulez trente ans du récit de la maintenance. Un défaut à ce point documenté, avec cette littérature, ce nombre de post-mortems et cette quantité de gens capables de l'expliquer au tableau, aurait dû être maintenu jusqu'à disparition. Il ne l'a pas été. Il a été ramassé et re-livré, à grande échelle, par les équipes d'ingénierie les plus aguerries du secteur, au cœur de leurs produits les plus récents. Une défaillance qui survit à sa compréhension universelle n'est pas une défaillance de compréhension. C'est un fait structurel sur l'endroit où l'on s'obstine à poser le contrôle.

## Le verdict

Changez donc la ligne budgétaire, car c'est bien la décision qui se joue ici.

Cessez de financer la couverture de denylist comme s'il s'agissait de travail de sécurité. Chaque heure consacrée aux vingt règles suivantes achète de la couverture d'accident au tarif de la couverture d'adversaire, et c'est dans cet écart que loge votre incident. Gardez la liste : elle excelle vraiment à rattraper les bévues évidentes d'un modèle coopératif, et cela vaut d'être conservé. Classez-la sous « expérience utilisateur ».

Posez ensuite la vraie frontière sous la couche de réécriture, là où le shell ne peut plus modifier la chaîne après que vous l'avez regardée. Analysez la commande en une structure et décidez sur la structure, ou renoncez à décider sur les commandes et cloisonnez le rayon d'explosion : aucun identifiant dans l'environnement, un système de fichiers dont l'agent ne sort pas, une sortie réseau que vous contrôlez. Le test de n'importe quel contrôle envisagé tient en une question. Bash a-t-il l'occasion de réécrire ceci après le passage de ma vérification ? Si oui, vous avez acheté un garde-fou anti-accident, quel que soit le nom que lui donne le fichier de configuration.

> [!CONFIRMED]
> Continue est le seul agent examiné qui ferme empiriquement la surface de contournement de classe F01 [s3].

> [!INFERRED]
> Ce que j'y vois, en revanche, c'est la fin du discours fataliste. Dix sur onze n'est pas une loi de la nature, et quelqu'un qui livre aujourd'hui a déjà franchi la barre.

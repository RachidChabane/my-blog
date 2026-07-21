---
translationKey: instruction-file-structure-compliance
lang: fr
slug: arretez-de-retoucher-claude-md
title: Ce n'est pas la structure de votre CLAUDE.md qui explique l'oubli de l'agent
publishDate: 21-07-2026
tags:
- agentic-coding
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Instruction Adherence in Coding Agent Configuration Files (arXiv 2605.10039)
  url: https://arxiv.org/abs/2605.10039
  date: 11-05-2026
- label: Claude Code memory documentation
  url: https://code.claude.com/docs/en/memory
  date: 21-07-2026
- label: Tian Pan, writing effective agent instruction files
  url: https://tianpan.co/blog/2026-02-14-writing-effective-agent-instruction-files
  date: 14-02-2026
contentHash: sha256:5201e7aeaf6ea6e1
publishState: published
---


Ce n'est pas la structure de votre CLAUDE.md qui explique l'oubli de l'agent. Chaque fonction supplémentaire générée s'accompagne d'une baisse d'environ 5,6 % des chances que l'instruction soit suivie [s1] : la variable qui bouge, c'est la profondeur dans la session, pas la façon dont le fichier est écrit. J'ai réécrit mes fichiers d'instructions trois fois cette année, en réordonnant, en dédoublonnant, en coupant de moitié, et je considère aujourd'hui que l'essentiel de ce travail était perdu pour un fichier déjà correct. Les règles que l'agent laisse tomber ne sont pas mal formulées. Elles sont seulement très loin du moment où elles doivent tenir.

## Ce que l'étude a fait varier, et ce qui n'a pas bougé

Une étude factorielle a manipulé quatre variables de structure du fichier d'instructions et mesuré le respect d'une annotation cible triviale sur 1 650 sessions de la CLI Claude Code. Aucune des quatre variables structurelles, ni aucune des trois interactions d'ordre deux, ne produit de contraste détectable après correction pour tests multiples [s1].

Sept occasions distinctes de voir apparaître un effet de mise en forme. Aucune n'a abouti.

Voilà toute la matière que je tire de la moitié négative de l'argument, et je m'en tiens volontairement à un paragraphe. Le résumé de l'article scientifique n'est pas ce qui compte ici.

## Deux modèles de l'observance, dont un seul a été mesuré

Il existe deux théories de ce qui pousse un agent à cesser discrètement d'appliquer une consigne, et le débat ne porte jamais que sur la première.

La théorie de la capacité voit le fichier comme un contenant : l'observance serait une propriété de ce qu'on y met, d'où le remède unique, raccourcir, dédoublonner, restructurer, remonter les lignes importantes en tête. La documentation officielle de la mémoire de Claude Code en donne une version condensée, en indiquant que les fichiers d'instructions sont chargés intégralement quelle que soit leur longueur, tout en affirmant qu'un fichier plus court améliore l'observance [s2]. Relisez cet assemblage. Le mécanisme auquel on penserait pour expliquer la seconde moitié, une troncature ou une dilution au chargement, est écarté par la première moitié dans la même phrase. Les guides de praticiens reprennent la théorie et lui donnent un chiffre : les grands modèles suivraient de façon fiable entre 150 et 200 instructions avant que l'observance ne se dégrade [s3]. Or un budget ne comporte aucun terme temporel.

La théorie positionnelle est moins flatteuse pour l'auteur du fichier. Une instruction est émise une fois, en tête de session, puis doit survivre à tout ce qui suit : quarante appels d'outils, un gros diff, un changement de sujet, une pile de contexte accumulé. Dans cette lecture, le même fichier ne se comporte pas pareil à l'étape 2 et à l'étape 40, et aucune chirurgie de la prose ne change la forme de la décroissance.

| Modèle | Variable directrice | Le remède qu'il implique | Ce qu'on devrait observer |
| :--- | :--- | :--- | ---: |
| Documentation éditeur [s2] | Longueur du fichier | Garder le fichier court | Fichiers courts suivis, fichiers longs ignorés, à toute profondeur |
| Budget d'instructions [s3] | Nombre d'instructions | Rester sous le plafond | Une rupture nette au-delà de 150 à 200 éléments |
| Décroissance mesurée [s1] | Profondeur dans la session | Ne rien faire reposer sur la profondeur | Le même fichier suivi tôt, abandonné tard |

Seule la troisième ligne a été mesurée sur les deux axes par un même dispositif, et c'est la seule des trois qui décrit ce que j'observe réellement sur une longue session d'agent : la règle tient sur le premier tiers du travail, puis cesse de tenir, sans que le fichier ait été touché entre-temps.

## Ce que la mesure établit, et ce que j'y lis

Il faut savoir quelle moitié relève de la preuve et quelle moitié relève de moi.

> [!CONFIRMED]
> Chaque fonction supplémentaire générée par l'agent est associée à des chances d'observance inférieures d'environ 5,6 %, soit un odds ratio de 0,944, à l'intérieur de la plage de longueurs de session testée [s1].

> [!INFERRED]
> À mon sens, toute l'industrie du conseil optimise l'axe dont la seule mesure disponible dit qu'il ne bouge pas. Le genre littéraire du « restructurez votre fichier d'instructions » n'est pas faux, il vise la mauvaise variable, et sa longévité s'explique simplement : retoucher un fichier se fait un mardi après-midi, alors que changer sa manière de conduire une session est une habitude à prendre.

Le second bloc est un jugement porté sur des faits déjà cités. Aucune source ne l'énonce, et je ne voudrais pas qu'on le lise comme si l'une d'elles le faisait.

## L'objection la plus solide : la moitié des résultats nuls ne sont que des résultats nuls

La meilleure version de l'objection n'est pas « l'étude est petite ». Elle tient à ceci : les deux moitiés de mon argument reposent sur des preuves de qualité très inégale, et je parle des deux à l'impératif.

Prenons les résultats nuls. Ils ne se valent pas : ceux qui portent sur la taille et sur les conflits sont étayés par des facteurs de Bayes en faveur de l'hypothèse nulle, tandis que ceux qui portent sur la position et sur l'architecture sont de simples échecs à rejeter, sans appui bayésien [s1]. La moitié de ma preuve négative est donc une preuve d'absence, l'autre moitié une absence de preuve, et la moitié non étayée contient la position d'une instruction dans le fichier, c'est-à-dire précisément la variable sur laquelle un lecteur attend une réponse. Du côté positif, l'odds ratio est estimé de façon observationnelle à l'intérieur des sessions, borné aux longueurs testées [s1], et traîne un facteur de confusion tenace : les fonctions tardives ne sont pas des tirages aléatoires dans la même population que les précoces, car la profondeur arrive en paquet, avec le contexte accumulé et la dérive thématique. Ajoutons que personne n'a comparé un hook et une puce markdown en face à face. Et un fichier vraiment pathologique, 5 000 lignes de règles contradictoires, nuit à l'évidence : l'axe de la mise en forme ne peut donc pas être déclaré mort en général.

> [!WARNING]
> L'odds ratio est borné aux longueurs de session testées [s1]. Traitez « l'étape 40 » comme une manière de dire « loin dans une longue session », jamais comme une prévision calculée. Composer un rapport par étape jusqu'à une profondeur non testée donne un chiffre spectaculaire et aucune preuve ; la courbe peut très bien s'aplatir.

Voici pourquoi je maintiens ma position. Je n'ai jamais soutenu que la structure n'a aucune importance, mais qu'elle n'est pas le levier marginal d'un fichier déjà correct. Qui croit à la mise en forme avait besoin qu'un contraste sur sept sorte du lot, et aucun n'est sorti ; d'ailleurs la théorie de la mise en forme la plus répandue, celle du budget d'instructions, est exactement le résultat nul étayé par un facteur de Bayes qui lui est défavorable. Quant au facteur de confusion, qui est la partie la plus tranchante de l'objection, il joue en ma faveur sur la prescription : si le non-respect tardif vient du contexte accumulé et de la dérive plutôt que d'un compteur d'étapes, alors une session neuve vaut mieux encore que je ne le disais, puisqu'elle dissout le paquet entier. Une attaque qui rebaptise le mécanisme et laisse la recommandation debout n'a pas battu la recommandation.

Reste le reproche de la prescription non testée, auquel je réponds par le mécanisme et non par la donnée ; la nuance mérite d'être posée. Je n'affirme pas que les hooks ont été essayés et l'ont emporté. J'affirme qu'une puce markdown est énoncée une seule fois, à profondeur zéro, et doit ensuite survivre à toutes les étapes suivantes, qu'un hook se déclenche à l'étape où il est utile quelle que soit la profondeur déjà atteinte, et qu'une session neuve est à profondeur zéro par construction. Ce sont des propriétés de fonctionnement, pas des résultats de mesure, et elles n'exigent pas plus d'expérience que « une tâche cron se déclenche, que vous y pensiez ou non ».

## Ce que je fais à la place : la règle de tri de l'étape 40

Reprenez votre fichier d'instructions ligne à ligne et posez à chacune une seule question : si l'agent enfreint cette ligne à l'étape 40, le dégât est-il récupérable ?

Si oui, laissez-la en prose. Conventions de nommage, arborescence, gestionnaire de paquets du dépôt, ton de la maison : les perdre tard dans une session coûte une remarque en revue. Le fichier est le lieu du goût, et un goût qui se dégrade en douceur ne pose pas de problème.

Si non, ce n'est plus une puce, c'est une contrainte à faire appliquer. Ne pas committer de secrets. Ne pas toucher à la prod. Toujours lancer les tests avant d'annoncer que ça marche. Ne jamais forcer un push sur main. Ce sont les lignes qui doivent tenir encore à l'étape 40, donc exactement celles qu'un fichier markdown porte le plus mal. Un hook `PreToolUse` qui filtre la commande par motif et sort en code non nul tient en vingt lignes de configuration et se moque de la profondeur. Une frontière de session avant une tâche risquée coûte une frappe au clavier.

Le mode de défaillance visé a une forme précise, et savoir le nommer aide : une règle respectée sur les dix premières modifications, puis abandonnée sans bruit sur les trente suivantes. Cela ressemble à une régression du modèle, et c'est ainsi que le ticket est ouvert. À tort. Même fichier, même modèle, même règle, quarante étapes plus bas ; réécrivez la règle en gras et vous obtiendrez la même courbe avec une plus belle prose.

Donc : le fichier est le lieu du goût, le hook est le lieu des invariants. Si une règle doit encore être vraie à l'étape 40, cessez de l'écrire et commencez à la faire respecter.

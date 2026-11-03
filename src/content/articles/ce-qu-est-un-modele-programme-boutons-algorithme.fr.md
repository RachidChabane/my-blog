---
translationKey: what-is-a-model
lang: fr
slug: ce-qu-est-un-modele-programme-boutons-algorithme
title: 'Ce qu''est un modèle : un programme, ses boutons et l''algorithme qui les
  règle'
publishDate: 03-11-2026
tags:
- evaluation
category: lessons
difficulty: 2
sources:
- label: Dive into Deep Learning (d2l.ai), chapter 1 Introduction (parameters define
    the program)
  url: https://d2l.ai/chapter_introduction/index.html
  date: 03-11-2026
- label: Wikipedia, Machine learning (supervised model of inputs and outputs)
  url: https://en.wikipedia.org/wiki/Machine_learning
  date: 03-11-2026
- label: Google Machine Learning Crash Course, Linear regression module (what linear
    regression finds)
  url: https://developers.google.com/machine-learning/crash-course/linear-regression
  date: 03-11-2026
- label: Dive into Deep Learning (d2l.ai), section 3.1 Linear Regression (simplest
    standard tool)
  url: https://d2l.ai/chapter_linear-regression/linear-regression.html
  date: 03-11-2026
contentHash: sha256:19457171e3846eb5
publishState: published
---


À mon avis, « le modèle apprend à partir des données » est une première phrase trompeuse, parce qu'elle masque quel programme fait les choix. Dive into Deep Learning distingue deux programmes : une fois les paramètres fixés, le programme s'appelle un modèle [s3], et le « méta-programme » qui utilise le jeu de données pour choisir ces paramètres s'appelle un algorithme d'apprentissage [s4]. À la fin de cette leçon, vous saurez nommer les parties d'un modèle, dire laquelle l'entraînement règle, et décider si un modèle qui se trompe réclame une meilleure recherche ou un autre espace.

## Un programme à boutons

La bonne unité de pensée, selon moi, c'est un programme dont l'auteur a laissé quelques nombres en blanc. Dive into Deep Learning part de là : on définit un programme flexible dont le comportement est déterminé par un certain nombre de paramètres [s1]. Le livre propose de les voir comme des boutons que l'on tourne pour modifier le comportement du programme [s2]. Wikipédia prend l'objet par l'autre bout. Les algorithmes d'apprentissage supervisé y construisent un modèle mathématique d'un ensemble de données qui contient à la fois les entrées et les sorties attendues [s7]. Ils apprennent une fonction qui sert à prédire la sortie associée à de nouvelles entrées [s8].

Les deux sources décrivent à mon sens le même objet : le manuel regarde les boutons, l'encyclopédie regarde la fonction qui relie entrées et sorties. Le schéma que je dessinerais réunit les deux. Chaque réglage des boutons désigne une fonction, et la forme du programme décide quelles fonctions figurent au menu.

```
              +-----------------------------------+
  entrée x -->|  forme :  y = w * x + b           |--> prédiction y
              |                                   |
              |  boutons (paramètres) :  w , b    |
              +-----------------------------------+
                fixés par une personne : la forme,
                les entrées lues (variables)
```

Schéma 1 : la forme et les entrées sont choisies avant l'entraînement ; seuls les boutons w et b restent ouverts.

## Des boutons figés, et l'on tient un modèle

Dans la définition du manuel, le mot qui compte est « fixés », et je pense que c'est le mot le plus sous-estimé de l'enseignement de l'apprentissage automatique. Faire une prédiction revient à évaluer une fonction dont les boutons sont déjà réglés : rien dans le modèle ne bouge pendant qu'il prédit, et rien ne bouge parce que la prédiction était bonne ou mauvaise.

C'est là que le débutant commence à attribuer le mérite au mauvais programme. Si la fonction figée devient « celui qui apprend », le programme qui a réellement cherché ses valeurs disparaît du récit.

> [!CONFIRMED]
> Dive into Deep Learning appelle modèle le programme dont les paramètres sont fixés [s3], et algorithme d'apprentissage le méta-programme qui utilise le jeu de données pour choisir ces paramètres [s4].

> [!INFERRED]
> Je pense qu'il s'agit de deux programmes aux rôles distincts. Le modèle calcule ; l'algorithme d'apprentissage cherche. Faire du modèle le sujet du verbe « apprendre » efface celui qui cherche.

## Un second programme tourne les boutons

Il faut bien que quelque chose choisisse les valeurs. Pour le manuel, l'apprentissage est le processus par lequel on découvre le bon réglage des boutons pour obtenir du modèle le comportement voulu [s5]. À mesure qu'un algorithme d'apprentissage automatique accumule de l'expérience, ses performances s'améliorent [s6]. Le sujet de « s'améliorent », à mon sens, c'est l'algorithme : le manuel lui-même attribue le progrès à la recherche.

Comment la recherche sait-elle qu'elle progresse ? Il lui faut une note. Wikipédia formule de nombreux problèmes d'apprentissage comme la minimisation d'une fonction de perte sur un ensemble d'exemples d'entraînement [s9]. La perte exprime l'écart entre les prédictions du modèle en cours d'entraînement et les instances réelles du problème [s10]. Pour l'instant, retenez que la perte est la note que la recherche fait baisser ; une leçon ultérieure traite des fonctions de perte.

Toutes les sources ne séparent pas aussi nettement les deux programmes. Le Machine Learning Crash Course de Google écrit que, pendant l'entraînement, le modèle ajuste son biais et ses poids pour minimiser l'écart entre valeurs prédites et valeurs réelles [s12]. Un cours sérieux l'écrit ainsi, je pense, parce qu'un seul sujet tient en moins de mots que deux. Je lirais cette phrase comme « l'entraînement ajuste les paramètres du modèle », et je garderais la version longue pour quiconque découvre l'idée.

```
  données (x, y) --> algorithme d'apprentissage --> perte : quel écart ? --+
                           ^                                               |
                           |      nouvelles valeurs de w, b                |
                           +-----------------------------------------------+
                           |
                           v  (quand la recherche s'arrête)
                     w, b fixés  ==>  le modèle
```

Schéma 2 : la boucle appartient à l'algorithme d'apprentissage ; le modèle est ce qu'elle laisse derrière elle.

## La régression linéaire à la main

L'exemple que je déroulerais en premier, c'est la régression linéaire. Dive into Deep Learning la présente comme l'outil à la fois le plus simple et le plus populaire parmi les outils standard de régression [s13].

En ML, d'après le cours de Google, la régression linéaire trouve la relation entre des variables et une étiquette [s11]. Ici, la variable est x et l'étiquette est y. La forme est la droite du schéma 1, avec deux boutons : le poids w et le biais b. Les poids déterminent l'influence de chaque variable sur la prédiction [s14] ; w est donc le bouton qui décide du poids de x.

Pour noter un réglage, il faut une perte, et pour les problèmes de régression le manuel désigne l'erreur quadratique comme la plus courante [s15]. Dans la suite, la somme désigne les erreurs quadratiques additionnées sur tous les points.

Trois points inventés, choisis pour que le calcul tienne de tête. Appelons-les les données A :

- Les points sont (1, 3), (2, 5) et (3, 7).
- Essayons w = 1, b = 1. Les prédictions valent 2, 3 et 4.
- Les erreurs (prédiction moins cible) valent -1, -2 et -3. Au carré, cela donne 1, 4 et 9, soit une somme de 14.
- Tournons un seul bouton : w = 2, toujours avec b = 1. Les prédictions valent 3, 5 et 7, exactement les cibles, et la somme tombe à 0.

La technique clé pour optimiser presque tous les modèles d'apprentissage profond, d'après le manuel, consiste à réduire l'erreur de façon itérative, en mettant à jour les paramètres dans la direction qui fait baisser progressivement la fonction de perte [s16]. Une leçon ultérieure explique comment se calcule cette mise à jour. Ce qui compte ici, c'est ce qui n'a pas bougé : la forme, la variable et les trois points. Seul un bouton a tourné. Un réglage qui colle existait dès le départ, si bien qu'un mauvais résultat sur les données A relève d'un échec de la recherche.

Passons aux données B, avec la même convention de signe :

- Les points sont (-1, 1), (0, 0) et (1, 1).
- La meilleure droite est horizontale : w = 0, b = 2/3, qui prédit 2/3 en chaque point.
- Les erreurs valent -1/3, 2/3 et -1/3. Au carré, cela donne 1/9, 4/9 et 1/9, soit une somme de 2/3, environ 0,67.
- Aucune droite ne fait mieux.

Ici, j'arrêterais de régler. Davantage de points issus de la même courbe, ou un entraînement plus long, ne feront pas descendre une droite sous 2/3 : les points sont sur une courbe, et une droite ne se courbe pas.

Il faut donc changer l'espace. Ajoutons une seconde variable, x au carré : la forme devient y = w * x + v * x^2 + b, avec un nouveau bouton v. Le réglage w = 0, v = 1, b = 0 passe par les trois points, et la somme vaut 0. Mêmes données, même type de recherche : la nouvelle variable a élargi l'ensemble des fonctions que les boutons peuvent atteindre.

## Ce que l'entraînement ne touche jamais

Certaines valeurs de cet exemple n'ont jamais été du ressort de l'algorithme d'apprentissage. Dive into Deep Learning en cite deux : la taille de mini-lot et le taux d'apprentissage sont souvent fixés par l'utilisateur, et ces paramètres réglables, que la boucle d'entraînement ne met pas à jour, s'appellent des hyperparamètres [s17].

La forme du programme et les variables qu'il lit ont selon moi leur place sur la même liste. Dans les données B, rien dans la boucle d'entraînement n'a décidé d'utiliser une droite ni de lire seulement x. Une personne a fait ces deux choix avant la première mise à jour, et une recherche de réglages séparée aurait pu les faire aussi.

C'est là, je pense, que la plupart des introductions brouillent la ligne. Le mot « hyperparamètre » indique qui fixe une valeur ; la branche concernée, recherche ou espace, dépend de ce que fait sa modification. Le taux d'apprentissage et la taille de mini-lot changent la façon dont la recherche se déroule. Un hyperparamètre qui fixe la forme (mon exemple : le degré d'un polynôme, ou les colonnes de variables que l'on construit) change les comportements que les boutons peuvent atteindre. Je range donc chaque réglage selon ce que produit sa modification :

| Réglage | Qui le fixe | Modifie la recherche ou l'espace |
| :--- | :--- | :--- |
| Poids et biais | L'algorithme d'apprentissage | Ni l'un ni l'autre : c'est le résultat de la recherche |
| Taux d'apprentissage, taille de mini-lot | Une personne ou une recherche de réglages | La recherche |
| Données d'entraînement | Une personne | La recherche |
| Forme du programme | Une personne | L'espace |
| Variables lues | Une personne | L'espace |
| Un hyperparamètre qui fixe la forme | Une personne ou une recherche de réglages | L'espace |

## Les objections à cette séparation

L'objection la plus forte est pratique. Les deux branches finissent de la même façon : une personne change quelque chose hors de la boucle (les données, un taux d'apprentissage, la forme) et relance l'entraînement. Si les deux réparations se ressemblent, à quoi bon leur donner deux noms ? Le raccourci a lui aussi ses appuis, puisqu'un cours sérieux l'écrit noir sur blanc : pendant l'entraînement, le modèle ajuste son biais et ses poids [s12].

La deuxième objection va plus loin. On ne peut généralement pas répondre à « un réglage pourrait-il marcher ? » en contemplant un modèle, si bien que la question de tri peut sembler reformuler le problème. Et je pense que les systèmes qui continuent de se mettre à jour en service rendent le mot « fixés » fragile.

Sur le raccourci, le manuel du domaine attribue lui-même le progrès à l'algorithme, à mesure qu'il accumule de l'expérience [s6]. Je lis la phrase du cours comme une compression de la séparation, utile quand on la maîtrise déjà et trompeuse comme toute première phrase pour un débutant.

Les réparations se ressemblent, mais elles n'ont pas la même portée. Une correction de la recherche garde la forme et la liste des variables, puis relance l'entraînement. Une correction de l'espace modifie l'une des deux, puis relance l'entraînement. Les données B montrent pourquoi l'écart compte : aucun réglage façon données A ne fait passer une droite sous 2/3.

Les systèmes mis à jour en service ne cassent pas la séparation. Chaque mise à jour reste l'algorithme d'apprentissage qui produit un nouveau réglage fixé, ce que le manuel appellerait encore un modèle [s3] choisi par un algorithme d'apprentissage [s4]. La séparation tourne simplement plus souvent.

La deuxième objection tient : on ne tranche pas toujours la question en regardant le modèle. Je la poserais quand même en premier, parce qu'elle indique laquelle de deux réparations semblables s'applique. Un modèle qui colle de trop près à ses points d'entraînement (le surapprentissage) peut aussi, à mon sens, se corriger des deux côtés ; une leçon ultérieure porte sur la généralisation.

> [!WARNING]
> On ne peut pas toujours dire, en regardant le modèle, si le bon comportement est atteignable. Posez-vous cette question en premier, et attendez-vous à tester les deux corrections quand la réponse reste floue.

## La question de tri

Quand un modèle se trompe, je pose une question avant de toucher à quoi que ce soit : un réglage de ses boutons pourrait-il produire le bon comportement ?

Si oui, la recherche a mal atterri, comme sur les données A. Changez ce dont elle apprend ou la façon dont elle se déroule (les données, le taux d'apprentissage, la taille de mini-lot), puis relancez l'entraînement.

Si non, comme sur les données B, ni les données ni le réglage de la recherche n'y feront rien tant que ne change pas ce qui définit l'espace : la forme, les variables, ou un hyperparamètre qui les fixe.

Le raccourci masque cette bifurcation, et c'est pourquoi je n'ouvrirais pas un cours avec lui. Posez la question avant de collecter davantage de données.

## Quiz

<details><summary>Parmi les poids, les variables lues par le modèle et le taux d'apprentissage, lequel l'entraînement fixe-t-il ?</summary>Seulement les poids. Les variables sont choisies avant l'entraînement, et le taux d'apprentissage est un hyperparamètre : il oriente la recherche mais la boucle d'entraînement ne le met pas à jour.</details>

<details><summary>Dans les données A, qu'est-ce qui change entre le réglage dont la somme vaut 14 et celui dont la somme vaut 0, et qu'est-ce qui reste identique ?</summary>Seul w bouge, de 1 à 2. La forme, la variable et les trois points restent les mêmes : un mauvais résultat y relève donc d'un échec de la recherche.</details>

<details><summary>Pour les données B, un entraînement plus long ou davantage de points issus de la même courbe permettraient-ils à une droite de coller ?</summary>Non. La meilleure droite laisse toujours une somme d'au moins 2/3 : c'est l'espace qui doit changer, et ajouter x au carré comme variable permet au modèle de passer par les trois points.</details>

<details><summary>Vous augmentez le taux d'apprentissage et la perte cesse de baisser. Quelle branche du tri est-ce ?</summary>La recherche. Le taux d'apprentissage règle la façon dont on tourne les boutons ; l'ensemble des comportements qu'ils peuvent atteindre reste le même. On le baisse et on relance l'entraînement.</details>

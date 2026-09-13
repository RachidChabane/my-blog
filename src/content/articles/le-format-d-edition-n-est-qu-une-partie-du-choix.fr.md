---
translationKey: edit-unit-size-beside-edit-format
lang: fr
slug: le-format-d-edition-n-est-qu-une-partie-du-choix
title: Le format d'édition n'est qu'une partie du choix pour un modèle de code
publishDate: 13-09-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Diffs vs. Whole Files study, headline result
  url: https://arxiv.org/abs/2609.05779
  date: 05-09-2026
- label: Aider unified diffs benchmark, GPT-4 Turbo scores
  url: https://aider.chat/2023/12/21/unified-diffs.html
  date: 21-12-2023
- label: Aider edit formats documentation, per-model formats
  url: https://aider.chat/docs/more/edit-formats.html
  date: 13-09-2026
contentHash: sha256:7b415df1557148ae
publishState: published
---


Opposer diff et fichier entier ne suffit pas pour décider comment un modèle de code doit éditer : je pense que la taille de l'unité éditée compte dans ce choix, à côté du format. Deux résultats semblent pourtant se contredire. Une nouvelle étude constate que la génération directe surpasse nettement la génération par diff sur chacune des métriques mesurées [s1]. Le benchmark d'Aider, lui, voit un nouveau format en diff unifié faire passer GPT-4 Turbo de 20 % à 61 % [s4]. L'opposition n'est qu'apparente : Aider est passé d'un format d'édition à un autre, et aucun des deux ne renvoie le fichier entier.

## Deux résultats qui ne s'opposent qu'en apparence

La lecture tentante est celle d'un tableau des scores, avec une étude contrôlée d'un côté et l'éditeur d'un outil de l'autre. Je pense que l'erreur est là, car les deux sources n'ont jamais comparé la même chose. L'étude met face à face deux régimes de sortie, la génération directe et la génération par diff, et la génération directe l'emporte sur chacune des métriques mesurées [s1].

Aider a changé autre chose. Avec le même modèle, il a remplacé son format d'édition SEARCH/REPLACE block, qui n'obtenait que 20 % en référence, par un format d'édition en diff unifié qui a atteint 61 % [s4]. Personne, dans ce benchmark, n'est revenu au fichier entier.

L'un des résultats porte donc sur la question de savoir si le modèle écrit le fichier ou des modifications ; l'autre, sur la manière dont ces modifications sont transmises. Ce sont deux axes distincts. Posés sur une seule ligne, ils se heurtent. Posés sur deux, ils laissent apparaître une troisième question, à laquelle aucune des sources ne répond : quelle portion de code une modification doit couvrir.

Je soupçonne que cette collision tient à l'outillage. Quand un outil n'expose qu'un seul réglage pour cela et l'appelle le format, ce réglage absorbe tous les effets qui voyagent avec lui. Si changer de format change aussi la quantité de code que le modèle réécrit à chaque modification, c'est le format qui s'en voit attribuer le mérite.

## Ce que mesure l'étude sur les petits modèles

La portée de l'étude compte davantage que son titre, et je la rappelle à chaque phrase qui en parle. Elle entraîne un modèle de 100M de paramètres à partir de zéro et un Qwen2.5-Coder-0.5B affiné, chacun dans les deux régimes, sur un même jeu de données Flutter/Dart [s3]. Dans ce cadre, la génération directe surpasse nettement la génération par diff sur chacune des métriques, et l'écart persiste une fois la difficulté des tâches contrôlée [s1]. Le résultat est net à cette échelle, et je ne le discuterais pas.

Le détail qui m'intéresse arrive une phrase plus loin dans le résumé.

> [!CONFIRMED]
> La génération par diff reste compétitive sur les modifications courtes et localisées, et ses victoires par catégorie se situent dans le refactoring et la correction de gestion d'erreurs ou de cas limites, les deux catégories où le nombre moyen d'étapes d'édition est le plus faible [s2].

> [!INFERRED]
> J'y lis un constat sur la part du fichier que touche une modification, au moins autant que sur le format dans lequel elle arrive. L'étude ne fait pas varier cette taille délibérément : c'est ma lecture, et non sa conclusion.

Si le diff tient bon précisément là où les modifications sont courtes et locales, la taille du changement pèse dans cette comparaison d'une façon que l'étiquette du régime masque. Le constat principal de l'étude reste entier. Ce qui change, c'est la question que j'en retiens.

## Ce qu'Aider a changé, et ce qu'il n'a pas démontré

C'est le résultat d'Aider que l'on cite, et je pense que c'est aussi celui que l'on surinterprète le plus. Les faits sont minces. Avec le format d'édition SEARCH/REPLACE block d'Aider, GPT-4 Turbo n'obtenait que 20 % en référence et produisait des « lazy comments » sur 12 des tâches ; le nouveau format d'édition en diff unifié d'Aider a porté le score à 61 % [s4]. Le mode d'échec porte un nom, les lazy comments, et je n'y lirais rien de plus que ce que le billet rapporte.

Le même billet énonce un principe de conception. Sa consigne de haut niveau consiste à inciter GPT à structurer ses modifications comme de nouvelles versions de blocs de code substantiels, fonctions ou méthodes, plutôt que comme une série de changements chirurgicaux sur des lignes isolées [s5]. C'est le passage où l'une des deux sources s'approche le plus de la taille d'une modification.

Ce que le billet ne fait pas, c'est relier les deux. Il rapporte un score, il énonce un principe, et aucune mesure n'y rattache l'un à l'autre. Un lecteur pressé peut facilement en conclure que des modifications à l'échelle d'une fonction ont produit ce bond. Le billet ne le dit pas.

> [!WARNING]
> Le billet énonce le principe et rapporte le score ; il ne montre pas que l'un a produit l'autre. Traitez le principe comme une intention de conception, et ne citez pas ce bond comme la preuve que des modifications à l'échelle d'une fonction donnent de meilleurs résultats.

## La taille de l'unité éditée, second axe de routage

Voici ma lecture, et ce n'est qu'une lecture. Les deux résultats sont compatibles avec l'idée que la taille de l'unité éditée compte, une variable que l'opposition entre diff et fichier entier masque, et aucune des deux sources ne fait varier cette taille à dessein.

La concession doit venir en premier, car le poids du format est réel. Avec le même modèle, le nouveau format d'Aider a fait passer GPT-4 Turbo de 20 % à 61 % [s4], et Aider règle le format modèle par modèle, avec le format optimal pour la plupart des modèles les plus répandus [s6]. Le format compte par lui-même. Je ne crois donc pas que ce réglage soit le mauvais. Il est incomplet, et je pense que la taille de l'unité éditée mérite d'y figurer comme second axe de routage.

Mon pari non testé : pour les changements de taille moyenne, des modifications à l'échelle d'une fonction ou d'une méthode constituent un meilleur choix par défaut que des hunks au niveau des lignes ou que des fichiers entiers, quel que soit le format qui les transporte. Un hunk au niveau des lignes demande au modèle de situer précisément son changement dans du code qu'il n'a pas réécrit ; une nouvelle version de fonction lui permet de reformuler une unité cohérente et laisse à l'outil le soin de l'insérer.

La sortie en fichier entier garde sa place pour les modifications étendues, à un prix qu'Aider documente : renvoyer le fichier entier quand seules quelques lignes changent peut être lent et coûteux [s7]. Pour un changement qui réécrit l'essentiel d'un fichier, je paierais ce prix sans hésiter.

| Approche dans les sources | Ce que rapporte la source | Ma lecture et ce que je ferais |
| :--- | :--- | :--- |
| Génération par diff (régime de l'étude) | Compétitive sur les modifications courtes et localisées [s2] | J'y lis un argument pour les petites unités ; je les garde pour les corrections locales |
| Versions de fonctions ou de méthodes (principe d'Aider) | Énoncé comme principe de conception [s5] ; aucune des deux sources ne le mesure | Mon pari non testé comme valeur par défaut pour les changements de taille moyenne |
| Génération directe (régime de l'étude) | Gagne sur chacune des métriques mesurées par l'étude [s1], à 100M et 0.5B paramètres [s3] | J'y lis l'argument en faveur du fichier entier, qu'Aider décrit comme lent et coûteux quand peu de lignes changent [s7] ; je le réserve aux modifications étendues |

La colonne du milieu dit ce que rapportent les sources. Celle de droite est la mienne, et c'est elle qu'un lecteur exigeant devrait contester.

## Deux objections : le poids du format, et l'échelle

Je suis parti de l'idée que le format était le mauvais levier sur lequel raisonner en premier, et ce que j'ai lu ne me permet pas de garder cette position. Deux objections en sont responsables, et chacune mérite d'être posée sous sa forme la plus forte.

La première tient au poids du format. La variable sur laquelle je veux router est justement celle qu'aucune mesure des deux sources ne fait varier. Le bond d'Aider admet au moins deux autres lectures que je ne peux pas écarter : GPT-4 Turbo est peut-être plus à l'aise avec la syntaxe du diff unifié, ou ce format décourage peut-être à lui seul les lazy comments. Rien de cela n'est établi ; ce sont des hypothèses, comme la mienne. Plus gênant pour ma thèse, la seule donnée dont je dispose à l'échelle d'un modèle de pointe est un effet de format.

Je concède tout cela, et la thèse de ce texte en porte la marque : la taille de l'unité comme second axe à côté du format, jamais à sa place. Ce qui tient est plus étroit. Les deux résultats ne s'opposent pas, et la taille de l'unité est une variable sous-mesurée qui mérite sa propre colonne dans une table de routage.

La seconde objection tient à l'échelle. Les modèles de l'étude comptent 100M et 0.5B paramètres [s3]. L'objection suppose que des modèles aussi petits manquent peut-être de la capacité nécessaire pour suivre une modification en plusieurs étapes, et ces sources ne me permettent pas de l'exclure.

Ma réponse ne s'appuie que sur les chiffres d'Aider. À modèle constant, GPT-4 Turbo a produit des lazy comments sur 12 tâches et un score de 20 % avec un format, et atteint 61 % avec un autre [s4]. Les effets du format d'édition ne sont donc pas un pur artefact des petits modèles. Cette réponse a une limite nette, et je tiens à l'énoncer clairement : elle ne dit rien de ce que deviendrait le résultat de l'étude sur des modèles de pointe.

## Ce que je configurerais, et l'expérience qui me donnerait tort

Le levier existe déjà. Aider est configuré avec le format optimal pour la plupart des modèles les plus répandus, et l'option `--edit-format` permet toujours d'en imposer un [s6]. Je garderais les deux, et j'ajouterais la taille de l'unité comme second réglage : une indication, par modèle, de l'étendue de code que le modèle doit réécrire en une seule modification.

Concrètement, si je réglais un agent cette semaine, je fixerais le format avec `--edit-format`, puis je lancerais le même jeu de tâches sous deux consignes, à modèle et format constants : l'une demandant des réécritures à l'échelle d'une fonction ou d'une méthode, l'autre des changements minimaux ligne par ligne. Je comparerais ensuite les taux de réussite et le coût de sortie par tâche.

C'est aussi l'expérience qui me donnerait tort. Si faire varier la taille de l'unité, à modèle et format constants, ne change rien, mon pari est faux, et le réglage du format portait à lui seul tout l'effet.

> [!NOTE]
> Les éléments réunis ici tiennent en une étude sur de petits modèles Flutter/Dart et un benchmark d'éditeur sur un seul modèle ; aucune expérience ne confronte directement des modifications à l'échelle d'une fonction aux deux formats. Lisez la colonne de droite comme une hypothèse à tester sur vos propres tâches.

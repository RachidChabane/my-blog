---
translationKey: llm-output-homogeneity-across-models-defeats-model-swapping-for-diversity
lang: fr
slug: les-modeles-convergent-mesurez-la-diversite-vous-meme
title: Les modèles convergent, alors mesurez la diversité vous-même
publishDate: 15-10-2026
tags:
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: 'Rusia et al., Design Creativity Bench: Measuring creativity in LLM-Generated
    UI (arXiv 2610.11539)'
  url: https://arxiv.org/abs/2610.11539
  date: 08-10-2026
- label: 'Jiang et al., Artificial Hivemind: The Open-Ended Homogeneity of Language
    Models (arXiv 2510.22954)'
  url: https://arxiv.org/abs/2510.22954
  date: 27-10-2025
contentHash: sha256:3da09e18a0c27c6f
publishState: published
---


Un second modèle est, à mon sens, un bien faible levier de diversité : les modèles convergent, et l'évaluation par critères d'acceptation ne voit pas cette ressemblance. Sur des interfaces, le Design Creativity Bench de Kombai mesure une originalité de 0.592 entre designs issus de modèles différents sur le même prompt, contre 0.764 entre un design humain et un design de modèle [s3], alors que l'adéquation reste au-dessus de 90 % pour chaque modèle testé [s5]. Sur du texte ouvert, les auteurs d'Artificial Hivemind mesurent une similarité moyenne de 71 % à 82 % entre les réponses de modèles différents [s20]. Ces chiffres ne disent rien du gain qu'apporte un second modèle. Selon moi, ils montrent pourtant que le lot reste plus proche de lui-même qu'on ne le croirait.

## Deux études qui ne mesurent pas la même chose

Tout repose sur deux articles qui ne partagent aucun instrument, et c'est précisément ce qui me fait croire à leur direction plus qu'à l'un ou l'autre de leurs chiffres. L'un étudie des interfaces, l'autre de la prose, et un seul dispose d'une référence humaine. Quand deux dispositifs aussi éloignés penchent du même côté, la pente mérite d'être prise au sérieux.

On doit Design Creativity Bench à Aman Rusia et à trois co-auteurs [s1], et sa première version a été mise en ligne le 8 octobre 2026 [s11]. Les auteurs de Design Creativity Bench le présentent comme un benchmark qui évalue la diversité et l'adéquation des designs d'interface [s2]. Tous travaillent chez Kombai, une entreprise qui développe des produits d'IA pour le design d'interface et le développement front-end, et l'article déclare lui-même cette affiliation [s19]. C'est donc le benchmark d'un éditeur, joué sur son propre terrain.

Artificial Hivemind est signé par Liwei Jiang et neuf co-auteurs [s6]. Hivemind sépare la répétition au sein d'un seul modèle de l'homogénéité entre modèles, quand des modèles différents produisent des sorties étonnamment similaires [s7], et c'est la seconde, celle qu'un changement de modèle devrait corriger, qui compte ici.

| Dimension | Design Creativity Bench | Artificial Hivemind |
| :--- | :--- | :--- |
| Sortie | designs d'interface [s2] | réponses à des requêtes ouvertes [s7] |
| Mesure du changement de modèle | originalité, dissimilarité entre modèles sur un même prompt [s12] | similarité entre réponses de modèles différents [s20] |
| Mesure du changement de prompt | amplitude créative, même modèle, brief déplacé vers un autre domaine produit [s13] | similarité entre prompts paraphrasés [s23] |
| Échantillonnage | valeurs par défaut du fournisseur, non contrôlées [s16] | top-p 0.9, température 1.0 ; min-p testé [s25] [s22] |

Des instruments différents, une seule direction.

## Le second modèle reste dans le même voisinage

Le score d'originalité de Design Creativity Bench mesure exactement le levier qu'une équipe actionne quand elle change de modèle : les différences entre modèles sur un même prompt, exprimées comme la dissimilarité moyenne de ces paires de designs [s12]. Design Creativity Bench résume ses résultats d'une phrase : les designs générés par les modèles se ressemblent davantage entre eux qu'ils ne ressemblent à la référence humaine [s15]. Voilà le levier du changement de modèle, mesuré directement, et il pèse peu.

L'étude sur le texte arrive à la même forme par un autre chemin. Dans l'article Hivemind, 25 modèles ont chacun répondu au prompt "Write a metaphor about time", et leurs réponses se sont réparties en deux groupes seulement, un groupe dominant autour de "time is a river" et un plus petit autour de "time is a weaver" [s21]. La bande de similarité entre modèles citée plus haut [s20] provient d'une autre analyse d'Hivemind, et je la lis comme la version agrégée de cette image.

Des modèles issus de laboratoires différents sont entraînés sur des données différentes, avec des recettes différentes : les regrouper devrait élargir la distribution, et un seul modèle échantillonné de nombreuses fois devrait rester l'option la plus étroite. Aucune des deux études ne mesure ce qu'un second modèle ajoute à un seul. Je le concède, et j'y ajoute une seconde concession : une bande de similarité qui plafonne sous l'identité signifie qu'un second modèle fait bel et bien bouger la sortie, au moins un peu. C'est ma lecture de la bande, rien de plus.

Ce que les données disent, en revanche, c'est où va ce mouvement. Les auteurs d'Artificial Hivemind expliquent directement l'effet entre modèles : des modèles différents convergent d'eux-mêmes vers des idées similaires, avec de légères variations de formulation, si bien que des ensembles de modèles peuvent ne pas produire de vraie diversité quand leurs membres partagent des a priori d'alignement et d'entraînement [s8]. Les auteurs d'Hivemind en tirent un avertissement : faute de diagnostic rigoureux, les praticiens risquent de surestimer la diversité entre modèles [s24]. J'en retiens qu'un changement de fournisseur ne garantit pas un changement d'a priori.

> [!CONFIRMED]
> Le benchmark de Kombai constate que les designs générés par les modèles se ressemblent davantage entre eux qu'ils ne ressemblent à la référence humaine [s15], avec une originalité de 0.592 entre modèles contre 0.764 entre un modèle et un humain [s3].

> [!INFERRED]
> Ma lecture : sur les interfaces, un second modèle vous déplace à l'intérieur du même voisinage. Il ne vous emmène pas là où un designer humain aboutirait.

## Monter la température, ou reformuler le brief

Les deux autres leviers vers lesquels se tournent les équipes échouent au même test, mais les deux articles ne les abordent pas de la même façon : la température seulement sur du texte, la variation du prompt dans les deux cas, chacun avec son instrument.

Sur du texte, Hivemind a fait tourner ses modèles avec un top-p de 0.9 et une température de 1.0, un réglage déjà très stochastique, et les réponses d'un même modèle dépassaient encore 0.8 de similarité moyenne dans 79 % des cas [s25]. Les auteurs d'Hivemind soutiennent que des températures plus élevées tendent à produire un texte incohérent, si bien que même l'échantillonnage le plus agressif ne parvient pas à produire des réponses diverses aux requêtes ouvertes [s9]. C'est leur extrapolation à partir du réglage qu'ils ont utilisé, et je la trouve convaincante sans la tenir pour une mesure.

Le décodage min-p, conçu pour gagner en diversité, n'y échappe pas davantage. Dans les essais d'Hivemind, il réduit la répétition extrême, mais 81 % des paires de réponses dépassent encore 0.7 de similarité et 61.2 % dépassent 0.8 [s22]. L'échantillonneur rogne les pires doublons et laisse le mode en place.

Reformuler le prompt ne change presque rien non plus sur le texte. Sur 42 modèles, dans le test de paraphrase d'Hivemind, la similarité au sein d'un même prompt est en moyenne de 0.821 et celle entre paraphrases de 0.781, un écart que les auteurs chiffrent à seulement 0.04 [s23].

Sur les interfaces, le levier équivalent consiste à déplacer le brief vers un autre domaine produit, et Design Creativity Bench mesure précisément cela : pour l'amplitude créative, le modèle est fixe et le prompt ne change que par le domaine produit et le contenu d'exemple [s13]. Le benchmark de Kombai situe l'amplitude créative à 0.581 pour l'ensemble des modèles, contre 0.902 pour les designs humains [s4]. L'intertitre des résultats de Design Creativity Bench le dit sans détour : différencier le prompt ne différencie pas le design [s13].

Design Creativity Bench ne contrôle pas du tout la température, et appelle les API hébergées avec leur température et leur échantillonnage par défaut [s16]. Les données sur la température ne valent donc que pour le texte, et je ne les transposerais pas aux mises en page sans les avoir mesurées sur des mises en page.

## Pourquoi l'évaluation reste au vert

Si personne ne remarque la ressemblance, c'est à mon sens parce que la métrique sur laquelle les équipes conditionnent déjà leurs livraisons est justement celle qui passe.

Dans Design Creativity Bench, l'adéquation est la part des critères d'acceptation d'un brief qu'un design satisfait [s14]. Elle dépasse 90 % pour chaque modèle de son jeu de test, d'après le benchmark de Kombai, le meilleur atteignant 99.2 % contre 98.0 % pour les designs humains [s5]. D'expérience, une suite de tests faite de critères d'acceptation est ce même instrument sous un autre nom : la page a-t-elle un bandeau principal, une grille tarifaire, un appel à l'action, la bonne longueur de texte ?

> [!WARNING]
> Le clone qui passe : une sortie qui remplit chaque critère d'acceptation et répète ses voisines. Une évaluation fondée sur les seuls critères note un lot de ces clones comme un succès complet, car aucun critère ne compare une sortie à une autre.

Chaque critère d'acceptation est une propriété d'une sortie isolée. Le caractère distinct est une propriété de l'ensemble : un contrôle sortie par sortie ne peut pas le voir, quel que soit le nombre de critères ajoutés. La justesse n'a jamais été la question.

## Ce que je mesure à la place

Pour chaque lot que je compte regrouper (plusieurs modèles, plusieurs échantillons, un seul brief), je calcule les embeddings des sorties et leur similarité moyenne par paire, puis je la compare à celle d'un lot de référence pour le même brief : du travail humain quand j'en ai, ou un ensemble varié choisi à la main. Le contrôle échoue quand le lot généré est plus homogène que la référence augmentée d'une tolérance que je règle sur mes propres données. Ce n'est qu'à ce stade qu'un second modèle, un changement de température ou une consigne de diversité gagne sa place, parce que la métrique dit alors s'il a fait bouger quoi que ce soit.

```python
# un brief, toutes les sorties que vous comptez regrouper
vecs = embed(outputs)
batch_sim = mean_pairwise_cosine(vecs)
# un lot de référence pour le même brief : du travail humain, ou un ensemble varié choisi à la main
ref_sim = mean_pairwise_cosine(embed(reference_outputs))
# la tolérance vit dans la config et se règle sur vos propres données
if batch_sim > ref_sim + cfg.diversity_tolerance:
    fail("batch is more alike than the reference")
```

Le lot de référence est l'étape que les équipes sautent, et c'est elle qui donne un sens au chiffre. Sans elle, une similarité moyenne n'est qu'un nombre sans échelle ; avec elle, le contrôle pose une question qu'un relecteur reconnaîtrait.

> [!NOTE]
> Ce que le benchmark de Kombai n'a pas testé : Design Creativity Bench n'a tenté aucun prompt orienté vers la diversité [s17], et il a généré chaque design dans un contexte neuf, jamais un second design avec le premier encore visible [s18]. Ce sont les deux remèdes que j'essaierais en premier, et c'est précisément pour cela qu'ils passent par la mesure ci-dessus.

Le cas qui m'inquiète le plus, ce sont les données synthétiques. Un pipeline qui regroupe plusieurs modèles pour diversifier un jeu d'entraînement est le plus exposé quand ses filtres ne sont que des filtres d'adéquation, qui confrontent chaque échantillon à des critères et jamais à ses voisins. Jiang et ses co-auteurs notent que cette convergence sape les bénéfices supposés de la distillation multi-modèles, et citent la curation de données synthétiques parmi les implications pour la recherche de l'homogénéité qu'ils ont mesurée [s10] ; la transposition de ce risque en production est mon extrapolation.

Mon pari : l'axe de variation doit être écrit dans le brief, puis mesuré, car ce que l'on sait aujourd'hui montre que le modèle, l'échantillonnage et la formulation bougent chacun moins qu'on ne le suppose. Écrivez l'axe noir sur blanc. Puis laissez le chiffre trancher.

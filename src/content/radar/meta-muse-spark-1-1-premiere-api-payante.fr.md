---
translationKey: muse-spark-1-1-meta-paid-api
lang: fr
slug: meta-muse-spark-1-1-premiere-api-payante
title: Meta lance Muse Spark 1.1 derrière sa première API payante et abandonne le
  levier des poids ouverts
publishDate: 12-07-2026
kind: release
tags:
- Muse Spark
- Meta
- MCP
- agents
- coding
summary: 'Le 2026-07-09, Meta a lancé Muse Spark 1.1 et ouvert la Meta Model API en
  préversion publique, son premier modèle payant et fermé. Le vrai changement, c''est
  le revirement : le laboratoire dont les poids ouverts ont banalisé la couche des
  modèles de base facture désormais au token.'
sources:
- label: Primary - Meta AI blog, 'Introducing Muse Spark 1.1'
  url: https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/
  date: 09-07-2026
- label: Corroboration - TechCrunch, 'Meta enters the crowded AI coding battle with
    Muse Spark 1.1'
  url: https://techcrunch.com/2026/07/09/meta-enters-the-crowded-ai-coding-battle-with-muse-spark-1-1/
  date: 09-07-2026
- label: 'Corroboration - DataCamp, ''Muse Spark 1.1: Meta''s Agentic Model and API'''
  url: https://www.datacamp.com/blog/muse-spark-1-1
  date: 09-07-2026
- label: Corroboration - Fortune, 'Meta releases latest update of AI model Muse Spark'
  url: https://fortune.com/2026/07/09/meta-muse-spark-1-1-release-alexandr-wang-superintelligence-labs-mark-zuckerberg/
  date: 09-07-2026
contentHash: sha256:3593fce907a628f7
publishState: published
---

## Ce qui change

Le 2026-07-09, Meta a lancé Muse Spark 1.1 et ouvert la Meta Model API en préversion publique [s1][s4]. Le modèle accepte jusqu'à 1M de tokens en entrée multimodale (texte, images et autres médias) et ne renvoie que du texte [s1][s3] ; il est conçu pour le travail agentique : selon Meta, son usage d'outils se généralise en zero-shot aux outils natifs, aux serveurs MCP et aux compétences personnalisées, il enchaîne des workflows d'utilisation de l'ordinateur à travers plusieurs applications, orchestre des systèmes multi-agents et code sur de grandes bases complexes, correction de bugs et migrations lourdes comprises [s1]. L'API est compatible OpenAI ; les développeurs américains y accèdent immédiatement, les autres via une liste d'attente [s1][s3]. C'est une préversion publique, pas une disponibilité générale.

## Le prix, en contexte

À 1,25 $ par million de tokens en entrée et 4,25 $ en sortie, avec 20 $ de crédits offerts [s2][s3], Muse Spark 1.1 se place juste à côté de Claude Haiku 4.5 et de GPT-5.6 Luna ; TechCrunch le situe "au niveau de (quoique légèrement au-dessus)" de ce duo [s2]. Lisez le chiffre, pas le discours de lancement : c'est le quatrième modèle de codage agentique bon marché à s'installer sur ce même plancher tarifaire. Ce qui en fait une décision de routage plutôt qu'un chantier, c'est la surface. L'API est compatible OpenAI avec usage natif des outils MCP [s1][s3] : l'ajouter à un routeur soucieux des coûts, c'est un changement de base-url et une ligne dans la table de routage, pas une migration de client.

## Le revirement

Voici ce que la fiche technique passe sous silence. Meta a fait des poids ouverts de Llama la valeur par défaut gratuite et s'en est servi pour banaliser la couche des modèles de base ; le voilà qui facture désormais au token et, selon Fortune, "vient concurrencer Anthropic et OpenAI sur leur propre terrain" [s4]. Zuckerberg résume la priorité : "des modèles agentiques et multimodaux performants à très bas coût" [s4]. C'est le premier modèle payant et fermé de Meta, un signal plus fort qu'une simple ligne de plus sur la grille tarifaire : ce qui a changé, c'est l'ère des poids ouverts comme stratégie chez Meta.

> [!IMPORTANT]
> Les réserves que l'annonce minimise : préversion publique et réservée aux États-Unis, sortie en texte uniquement, et Meta a refusé de la comparer aux derniers modèles phares d'Anthropic ou d'OpenAI. Son seul face-à-face revendiqué, c'est de battre le dernier Gemini de Google en codage et en raisonnement, et Fortune rapporte qu'elle reste en retrait des tout derniers modèles phares sur certaines métriques de code [s4].

## Impact pour une équipe

Si vous exploitez un routeur de modèles soucieux des coûts, voici un candidat pour la tranche bon marché que vous pouvez tester dès aujourd'hui : réservé aux États-Unis, sur 20 $ de crédits offerts, joignable via vos outils MCP existants avec un simple changement de base-url [s1][s3]. Le geste concret : évaluez-le sur votre propre charge agentique, de correction de bugs et de migration avant de vous fier au discours de Meta, car Meta a esquivé la comparaison avec les modèles phares [s4]. Ce qu'il faut différer : ne prenez pas les chiffres tiers SWE-Bench ou Terminal-Bench pour des résultats officiels, et ne bâtissez rien sur l'hypothèse d'une disponibilité générale, puisqu'il s'agit d'une préversion, réservée aux États-Unis et limitée au texte. La lecture stratégique compte plus que la fiche technique : ce qui prend fin ici, c'est l'ère des poids ouverts gratuits signés Meta, pas seulement l'arrivée d'un modèle de plus sur la grille.

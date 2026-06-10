---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: code-indexing-ast-retrieval
lang: fr
slug: indexer-code-ast-recuperation
title: 'Indexer du code pour la récupération : AST plutôt que lignes'
publishDate: '08-05-2026'
tags:
  - rag
  - agentic-coding
sources:
  - label: 'Pinecone, Hybrid search intro'
    url: 'https://www.pinecone.io/learn/hybrid-search-intro/'
    date: '01-03-2024'
  - label: 'OpenAI, Embeddings guide'
    url: 'https://platform.openai.com/docs/guides/embeddings'
    date: '25-01-2024'
contentHash: 'seed-code-indexing-ast-retrieval-fr'
publishState: published
---

Découper sur la structure, pas sur les sauts de ligne, change tout au rappel.

Couper les fichiers tous les N lignes tranche les fonctions en deux et sépare une
signature de son corps : la récupération renvoie des fragments qui ne tiennent plus
debout dans la tête du lecteur. Découper sur l’arbre syntaxique abstrait garde chaque
fonction, classe ou bloc entier.

Les fragments conscients de la structure portent aussi de meilleures métadonnées : le
symbole englobant, le chemin du fichier, le langage. Ce contexte permet au
récupérateur de classer une unité nommée et complète au-dessus d’une tranche de texte
isolée, c’est l’essentiel de la différence entre un extrait utile et un extrait
déroutant.

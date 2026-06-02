---
# SEED — bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: hybrid-rag-rrf
lang: fr
slug: rag-hybride-fusion-rang-reciproque
title: 'RAG hybride : la fusion de rang réciproque en pratique'
publishDate: '27-05-2026'
tags:
  - rag
  - retrieval
sources:
  - label: 'Pinecone — Hybrid search intro'
    url: 'https://www.pinecone.io/learn/hybrid-search-intro/'
    date: '01-03-2024'
  - label: 'arXiv — ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-hybrid-rag-rrf-fr'
publishState: published
---

Combiner BM25 et vecteurs sans régler dix poids : le rang suffit.

La fusion de rang réciproque combine deux listes classées en additionnant l’inverse
du rang de chaque document : un résultat bien placé dans l’un ou l’autre récupérateur
remonte, sans normaliser les scores. L’unique constante `k` est bien plus simple à
raisonner qu’un mélange pondéré de scores lexicaux et cosinus incomparables.

> Fusionner deux classements imparfaits vaut mieux que sur-optimiser un seul.

```python
# fusion de rang réciproque — fusionne N classements par leur rang, pas leur score
from collections import defaultdict

def rrf(rankings, k=60):
    scores = defaultdict(float)
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] += 1 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)
```

En pratique, le bras lexical attrape les identifiants exacts et les termes rares que
le plongement survole, tandis que le bras vectoriel récupère les paraphrases.
Fusionnés, ils couvrent leurs angles morts respectifs — un défaut robuste avant de
sortir un reranker entraîné.

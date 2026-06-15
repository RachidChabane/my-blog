---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: hybrid-rag-rrf
lang: fr
slug: rag-hybride-fusion-rang-reciproque
title: 'RAG hybride : la fusion de rang réciproque en pratique'
publishDate: '27-05-2026'
tags:
  - rag
  - retrieval
difficulty: 3
sources:
  - label: 'Pinecone, Hybrid search intro'
    url: 'https://www.pinecone.io/learn/hybrid-search-intro/'
    date: '01-03-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-hybrid-rag-rrf-fr'
publishState: published
---

Combiner BM25 et vecteurs sans régler dix poids : le rang suffit.

La fusion de rang réciproque combine deux listes classées en additionnant l’inverse
du rang de chaque document : un résultat bien placé dans l’un ou l’autre récupérateur
remonte naturellement, sans qu’il faille normaliser les scores. L’unique constante `k`
est bien plus facile à appréhender qu’un mélange pondéré de scores lexicaux et cosinus,
par nature incomparables.

> [!TIP]
> Réglez une seule constante `k` plutôt qu’un mélange pondéré de scores lexicaux et
> cosinus incomparables.

> Mieux vaut fusionner deux classements imparfaits que sur-optimiser un seul.

```python
# fusion de rang réciproque: fusionne N classements par leur rang, pas leur score
from collections import defaultdict

def rrf(rankings, k=60):
    scores = defaultdict(float)
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] += 1 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)
```

En pratique, la voie lexicale repère les identifiants exacts et les termes rares que
le plongement laisse passer, tandis que la voie vectorielle rattrape les paraphrases.
Fusionnées, les deux voies compensent leurs angles morts respectifs : une solution
par défaut robuste avant de se tourner vers un reranker entraîné.

| Récupérateur | Repère | Manque |
| --- | --- | --- |
| Lexical (BM25) | Identifiants exacts et termes rares | Paraphrases |
| Vectoriel | Paraphrases | Identifiants exacts et termes rares que le plongement laisse passer |

> [!IMPORTANT]
> Fusionnées, les deux voies compensent leurs angles morts respectifs : une solution
> par défaut robuste avant de se tourner vers un reranker entraîné.

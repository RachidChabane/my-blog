---
# SEED — bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: hybrid-rag-rrf
lang: en
slug: hybrid-rag-reciprocal-rank-fusion
title: 'Hybrid RAG: reciprocal rank fusion in practice'
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
contentHash: 'seed-hybrid-rag-rrf-en'
publishState: published
---

Combine BM25 and vectors without tuning ten weights: rank is enough.

Reciprocal rank fusion merges two ranked lists by summing the reciprocals of each
document's rank, so a result that scores well in either retriever rises without any
score normalization. The single `k` constant is far easier to reason about than a
weighted blend of incomparable lexical and cosine scores.

In practice the lexical arm catches exact identifiers and rare terms the embedding
glosses over, while the vector arm recovers paraphrase. Fused, they cover each
other's blind spots — a robust default before reaching for a trained reranker.

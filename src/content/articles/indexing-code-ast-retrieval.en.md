---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: code-indexing-ast-retrieval
lang: en
slug: indexing-code-ast-retrieval
title: 'Indexing code for retrieval: AST over lines'
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
contentHash: 'seed-code-indexing-ast-retrieval-en'
publishState: published
---

Chunking on structure, not line breaks, changes everything for recall.

Splitting source files every N lines cuts functions in half and strands a signature
from its body, so retrieval returns fragments that no longer compile in the reader’s
head. Chunking on the abstract syntax tree keeps each function, class, or block
whole.

Structure-aware chunks also carry better metadata: the enclosing symbol, the file
path, the language. That context lets the retriever rank a whole, named unit over a
stray slice of text, which is most of the difference between a helpful snippet and a
confusing one.

---
translationKey: 'bayan-rag-platform'
lang: 'en'
slug: 'bayan-rag-platform'
name: 'Bayan — Arabic Scholarship RAG Platform'
summary: 'A multi-user platform for citation-exact answers over classical Arabic books, powered by a hybrid BM25 + pgvector retrieval pipeline with cross-encoder reranking, verifier-loop recursion, and a precision "I don''t know" threshold gate.'
stack:
  - 'Python'
  - 'FastAPI'
  - 'pgvector'
  - 'OpenRouter'
  - 'React'
  - 'PostgreSQL'
  - 'Docker'
status: 'MVP ready'
links: []
publishState: 'draft'
---

Bayan delivers citation-exact answers (page, line, hadith number, bayt number, folio) from private or shared classical Arabic knowledge bases. Its retrieval stack runs two parallel legs — lexical GIN tsvector and pgvector cosine HNSW — fused with Reciprocal Rank Fusion, then reranked by a cross-encoder. A threshold gate refuses synthesis when top cosine similarity falls below the knowledge-base threshold, returning near-misses rather than hallucinating. A verifier recursion loop (depth-capped, SSE-streamed) iterates sub-queries until the retrieval is judged sufficient. The stack was built autonomously and passes a seven-gate MVP scorecard including 100% citation recall.

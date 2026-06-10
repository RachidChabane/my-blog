---
translationKey: 'bayan-rag-platform'
lang: 'en'
slug: 'arabic-scholarship-rag'
name: 'Arabic Scholarship RAG Platform'
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
publishState: 'published'
highlights:
  - 'Returns citation-exact answers (page, line, hadith number, bayt number, folio) from classical Arabic knowledge bases'
  - 'Hybrid retrieval runs two parallel legs, lexical GIN tsvector and pgvector cosine HNSW, fused with Reciprocal Rank Fusion and reranked by a cross-encoder'
  - 'A threshold gate refuses synthesis below the knowledge-base threshold, returning near-misses instead of hallucinating'
  - 'A depth-capped, SSE-streamed verifier recursion loop iterates sub-queries until retrieval is judged sufficient'
metrics:
  - value: '2'
    label: 'parallel retrieval legs'
  - value: '7'
    label: 'MVP gates passed'
  - value: '100%'
    label: 'citation recall'
architecture:
  caption: 'Citation-exact retrieval flow, from query to grounded answer'
  layers:
    - label: 'Interface'
      nodes:
        - 'React'
        - 'SSE stream'
    - label: 'Parallel retrieval'
      nodes:
        - 'GIN tsvector (lexical)'
        - 'pgvector cosine HNSW'
    - label: 'Fusion and rerank'
      nodes:
        - 'Reciprocal Rank Fusion'
        - 'cross-encoder'
    - label: 'Gate and verify'
      nodes:
        - 'threshold gate'
        - 'verifier recursion loop'
    - label: 'Storage and infra'
      nodes:
        - 'PostgreSQL'
        - 'pgvector'
        - 'FastAPI'
        - 'Docker'
---

The platform delivers citation-exact answers (page, line, hadith number, bayt number, folio) from private or shared classical Arabic knowledge bases. Its retrieval stack runs two parallel legs, lexical GIN tsvector and pgvector cosine HNSW, fused with Reciprocal Rank Fusion, then reranked by a cross-encoder. A threshold gate refuses synthesis when top cosine similarity falls below the knowledge-base threshold, returning near-misses rather than hallucinating. A verifier recursion loop (depth-capped, SSE-streamed) iterates sub-queries until the retrieval is judged sufficient. The stack was built autonomously and passes a seven-gate MVP scorecard including 100% citation recall.

---
lang: en
slug: how-the-agent-works
title: How the Ask-the-agent assistant works
sourcePath: about
publishState: published
---

The "Ask the agent" panel in the corner of the page is a retrieval-augmented (RAG) assistant. It answers only from this site's own content, and it shows its sources. For each question it runs a hybrid search over the indexed pages: a dense semantic search (Cloudflare Vectorize, using the multilingual bge-m3 embedding model) combined with a lexical keyword search (Cloudflare D1 with SQLite FTS5), the two fused together with reciprocal rank fusion.

A similarity threshold then decides whether the site actually covers the question. When it does, a language model (through OpenRouter) synthesizes an answer grounded in the retrieved pages and links them as citations; when it does not, the agent says it does not know rather than guessing. The search index is rebuilt and refreshed automatically on every deploy, so the agent stays current with the latest articles and projects.

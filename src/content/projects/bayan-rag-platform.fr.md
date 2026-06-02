---
translationKey: 'bayan-rag-platform'
lang: 'fr'
slug: 'bayan-plateforme-rag'
name: 'Bayan — Plateforme RAG pour l''Érudition Arabe'
summary: 'Une plateforme multi-utilisateurs pour des réponses à citations exactes sur des livres arabes classiques, alimentée par un pipeline de récupération hybride BM25 + pgvector avec reclassement cross-encoder, récursion par boucle de vérification et une porte de seuil "je ne sais pas" de précision.'
stack:
  - 'Python'
  - 'FastAPI'
  - 'pgvector'
  - 'OpenRouter'
  - 'React'
  - 'PostgreSQL'
  - 'Docker'
status: 'MVP prêt'
links:[]
publishState: 'draft'
---

Bayan fournit des réponses à citations exactes (page, ligne, numéro de hadith, numéro de bayt, folio) depuis des bases de connaissances arabes classiques privées ou partagées. Son stack de récupération exécute deux branches en parallèle — tsvector GIN lexical et cosinus pgvector HNSW — fusionnées par Reciprocal Rank Fusion, puis reclassées par un cross-encoder. Une porte de seuil refuse la synthèse si la similarité cosinus maximale est inférieure au seuil de la base de connaissances, retournant des quasi-correspondances plutôt qu'halluciner. Une boucle de récursion vérificateur (profondeur plafonnée, diffusée en SSE) itère des sous-requêtes jusqu'à juger la récupération suffisante. Le stack a été construit de manière autonome et passe un scorecard MVP à sept portes, dont 100 % de rappel de citations.

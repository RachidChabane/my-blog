---
lang: fr
slug: comment-fonctionne-l-agent
title: Comment fonctionne l’assistant « Demander à l’agent »
sourcePath: about
publishState: published
---

Le panneau « Demander à l’agent », dans le coin de la page, est un assistant à génération augmentée par la récupération (RAG). Il répond uniquement à partir du contenu de ce site, et il affiche ses sources. Pour chaque question, il effectue une recherche hybride sur les pages indexées : une recherche sémantique dense (Cloudflare Vectorize, avec le modèle d’embeddings multilingue bge-m3) combinée à une recherche lexicale par mots-clés (Cloudflare D1 avec SQLite FTS5), les deux étant fusionnées par reciprocal rank fusion.

Un seuil de similarité détermine ensuite si le site couvre réellement la question. Si c’est le cas, un modèle de langage (via OpenRouter) synthétise une réponse fondée sur les pages récupérées et les cite ; sinon, l’agent indique qu’il ne sait pas plutôt que d’inventer. L’index de recherche est reconstruit et rafraîchi automatiquement à chaque déploiement, de sorte que l’agent reste à jour avec les derniers articles et projets.

---
translationKey: 'sterna-ai-platform'
lang: 'fr'
slug: 'plateforme-ia-sterna'
name: 'Sterna — Plateforme IA Multi-Modèles'
summary: 'Une plateforme de chat et d''agents IA multi-modèles de niveau production, avec exécution de code en sandbox, base de connaissances RAG, intégrations MCP et facturation Stripe — construite de manière autonome par un orchestrateur Claude Code maison.'
stack:
  - 'Python'
  - 'Django'
  - 'React'
  - 'OpenRouter'
  - 'pgvector'
  - 'Kubernetes'
  - 'Cloudflare'
status: 'pré-lancement'
links: []
publishState: 'draft'
---

Sterna est un produit IA full-stack : un backend Django/DRF hébergeant onze applications métier (multi-LLM via OpenRouter, assistant de codage, exécution de code en sandbox, RAG pgvector, connecteurs MCP, salles vocales IA, facturation Stripe, durcissement RGPD/limitation de débit) couplé à un frontend React 19 + TypeScript. L'ensemble du code a été piloté par un task-runner Claude Code autonome appliquant des portes de qualité par tâche, des boucles de réparation de portes et des enregistrements d'échecs structurés — faisant du processus de développement lui-même une étude de cas en ingénierie logicielle agentique.

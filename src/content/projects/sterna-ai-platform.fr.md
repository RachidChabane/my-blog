---
translationKey: 'sterna-ai-platform'
lang: 'fr'
slug: 'plateforme-ia-multi-modeles'
name: 'Plateforme IA Multi-Modèles'
summary: 'Une plateforme de chat et d''agents IA multi-modèles de niveau production, avec exécution de code en sandbox, base de connaissances RAG, intégrations MCP et facturation Stripe, construite de manière autonome par un orchestrateur Claude Code maison.'
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
publishState: 'published'
year: '2025'
highlights:
  - 'Backend Django/DRF hébergeant onze applications métier, du multi-LLM via OpenRouter à la facturation Stripe'
  - 'Frontend React 19 + TypeScript couplé au backend pour un produit IA full-stack'
  - 'RAG pgvector, exécution de code en sandbox, connecteurs MCP et salles vocales IA parmi les applications métier'
  - 'Ensemble du code piloté par un task-runner Claude Code autonome avec portes de qualité par tâche et boucles de réparation'
metrics:
  - value: '11'
    label: 'applications métier'
  - value: 'React 19'
    label: '+ frontend TypeScript'
architecture:
  caption: 'Produit IA full-stack piloté par un task-runner Claude Code autonome'
  layers:
    - label: 'Frontend'
      nodes:
        - 'React 19'
        - 'TypeScript'
    - label: 'Backend'
      nodes:
        - 'Django/DRF'
    - label: 'Applications métier'
      nodes:
        - 'multi-LLM OpenRouter'
        - 'assistant de codage'
        - 'exécution de code en sandbox'
        - 'connecteurs MCP'
        - 'salles vocales IA'
    - label: 'RAG et facturation'
      nodes:
        - 'RAG pgvector'
        - 'facturation Stripe'
        - 'durcissement RGPD / limitation de débit'
    - label: 'Processus de build agentique'
      nodes:
        - 'task-runner Claude Code'
        - 'portes de qualité par tâche'
        - 'boucles de réparation'
        - 'enregistrements d''échecs structurés'
---

La plateforme est un produit IA full-stack : un backend Django/DRF hébergeant onze applications métier (multi-LLM via OpenRouter, assistant de codage, exécution de code en sandbox, RAG pgvector, connecteurs MCP, salles vocales IA, facturation Stripe, durcissement RGPD/limitation de débit) couplé à un frontend React 19 + TypeScript. L'ensemble du code a été piloté par un task-runner Claude Code autonome appliquant des portes de qualité par tâche, des boucles de réparation de portes et des enregistrements d'échecs structurés, faisant du processus de développement lui-même une étude de cas en ingénierie logicielle agentique.

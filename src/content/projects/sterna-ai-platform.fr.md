---
translationKey: 'sterna-ai-platform'
lang: 'fr'
slug: 'plateforme-ia-multi-modeles'
name: 'Sterna'
summary: 'Un espace de travail IA multi-modèles, désormais open source sous Apache-2.0 : chat multi-modèles côte à côte, agent de codage en sandbox avec un flux GitHub issue vers PR, base de connaissances RAG, connecteurs MCP, salles vocales et comptabilité des coûts par message.'
stack:
  - 'Python'
  - 'Django'
  - 'React'
  - 'OpenRouter'
  - 'pgvector'
  - 'Kubernetes'
  - 'Cloudflare'
status: 'open source'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/sterna'
  - label: 'Vidéos de démo'
    url: 'https://github.com/RachidChabane/sterna/blob/main/docs/demos.md'
publishState: 'published'
year: '2025–2026'
highlights:
  - 'Open-sourcé sous Apache-2.0 : backend Django/DRF complet, frontend React 19 + TypeScript, microservices FastAPI et infrastructure Kubernetes/Terraform'
  - 'Agent de codage en sandbox qui transforme une issue GitHub en plan d''implémentation relu puis en pull request, avec un IDE Monaco dans le navigateur'
  - 'Chaque message porte ses tokens, son coût et sa latence mesurés — RAG pgvector, connecteurs MCP, salles vocales multi-agents en direct et clés BYOK complètent l''espace de travail'
  - 'Ensemble du code piloté par un task-runner Claude Code autonome avec portes de qualité par tâche et boucles de réparation'
metrics:
  - value: '1 264'
    label: 'tests automatisés'
  - value: 'Apache-2.0'
    label: 'open source'
architecture:
  caption: 'Espace de travail IA full-stack piloté par un task-runner Claude Code autonome'
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
        - 'agent de codage (issue → plan → PR)'
        - 'exécution de code en sandbox'
        - 'connecteurs MCP'
        - 'salles vocales IA'
    - label: 'RAG et facturation'
      nodes:
        - 'RAG pgvector'
        - 'comptabilité des coûts par message'
        - 'durcissement RGPD / limitation de débit'
    - label: 'Processus de build agentique'
      nodes:
        - 'task-runner Claude Code'
        - 'portes de qualité par tâche'
        - 'boucles de réparation'
        - 'enregistrements d''échecs structurés'
---

Sterna est un espace de travail IA full-stack : un backend Django/DRF associé à un frontend React 19 + TypeScript, des microservices FastAPI, une sandbox Docker pour l'exécution de code et une infrastructure Kubernetes/Terraform. On y fait tourner plusieurs modèles côte à côte dans une même conversation, on confie des issues GitHub à un agent de codage en sandbox qui rédige des plans d'implémentation relus puis des pull requests via un IDE dans le navigateur, on interroge ses propres documents grâce au RAG pgvector, on rejoint des salles vocales multi-agents en direct — et chaque message affiche ses tokens, son coût et sa latence mesurés.

Le cœur du produit était terminé environ huit mois avant la publication ; la suite n'a été que du polissage. Plutôt que de financer l'hébergement et l'astreinte qu'exige un SaaS public, j'ai choisi d'open-sourcer l'ensemble sous Apache-2.0 — le code est le produit, auto-hébergeable depuis un seul fichier compose, avec des démos enregistrées de chaque fonctionnalité dans le dépôt.

Le code lui-même a été piloté par un task-runner Claude Code autonome appliquant des portes de qualité par tâche, des boucles de réparation et des enregistrements d'échecs structurés, faisant du processus de développement une étude de cas en ingénierie logicielle agentique.

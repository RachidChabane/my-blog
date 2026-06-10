---
translationKey: 'sterna-ai-platform'
lang: 'en'
slug: 'multi-model-ai-platform'
name: 'Multi-Model AI Platform'
summary: 'A production-grade, multi-model AI chat and agent platform with sandboxed code execution, a RAG knowledge base, MCP integrations, and Stripe billing, built autonomously by a homegrown Claude Code orchestrator.'
stack:
  - 'Python'
  - 'Django'
  - 'React'
  - 'OpenRouter'
  - 'pgvector'
  - 'Kubernetes'
  - 'Cloudflare'
status: 'pre-launch'
links: []
publishState: 'published'
year: '2025'
highlights:
  - 'Django/DRF backend hosting eleven domain apps, from multi-LLM via OpenRouter to Stripe billing'
  - 'React 19 + TypeScript frontend paired with the backend for a full-stack AI product'
  - 'pgvector RAG, sandboxed code execution, MCP connectors, and AI voice rooms among the domain apps'
  - 'Entire codebase driven by an autonomous Claude Code task-runner with per-task quality gates and gate-repair loops'
metrics:
  - value: '11'
    label: 'domain apps'
  - value: 'React 19'
    label: '+ TypeScript frontend'
architecture:
  caption: 'Full-stack AI product driven by an autonomous Claude Code task-runner'
  layers:
    - label: 'Frontend'
      nodes:
        - 'React 19'
        - 'TypeScript'
    - label: 'Backend'
      nodes:
        - 'Django/DRF'
    - label: 'Domain apps'
      nodes:
        - 'OpenRouter multi-LLM'
        - 'coding assistant'
        - 'sandboxed code execution'
        - 'MCP connectors'
        - 'AI voice rooms'
    - label: 'RAG and billing'
      nodes:
        - 'pgvector RAG'
        - 'Stripe billing'
        - 'GDPR / rate-limiting hardening'
    - label: 'Agentic build process'
      nodes:
        - 'Claude Code task-runner'
        - 'per-task quality gates'
        - 'gate-repair loops'
        - 'structured failure records'
---

The platform is a full-stack AI product: a Django/DRF backend hosting eleven domain apps (multi-LLM via OpenRouter, coding assistant, sandboxed code execution, pgvector RAG, MCP connectors, AI voice rooms, Stripe billing, GDPR/rate-limiting hardening) paired with a React 19 + TypeScript frontend. The entire codebase was driven by an autonomous Claude Code task-runner that enforced per-task quality gates, gate-repair loops, and structured failure records, making the development process itself a case study in agentic software engineering.

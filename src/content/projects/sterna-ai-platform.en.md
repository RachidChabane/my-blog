---
translationKey: 'sterna-ai-platform'
lang: 'en'
slug: 'sterna-ai-platform'
name: 'Sterna — Multi-Model AI Platform'
summary: 'A production-grade, multi-model AI chat and agent platform with sandboxed code execution, a RAG knowledge base, MCP integrations, and Stripe billing — built autonomously by a homegrown Claude Code orchestrator.'
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
---

Sterna is a full-stack AI product: a Django/DRF backend hosting eleven domain apps (multi-LLM via OpenRouter, coding assistant, sandboxed code execution, pgvector RAG, MCP connectors, AI voice rooms, Stripe billing, GDPR/rate-limiting hardening) paired with a React 19 + TypeScript frontend. The entire codebase was driven by an autonomous Claude Code task-runner that enforced per-task quality gates, gate-repair loops, and structured failure records — making the development process itself a case study in agentic software engineering.

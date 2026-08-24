---
translationKey: 'sterna-ai-platform'
lang: 'en'
slug: 'multi-model-ai-platform'
name: 'Sterna'
summary: 'A multi-model AI workspace, now open source under Apache-2.0: side-by-side model chat, a sandboxed coding agent with a GitHub issue-to-PR flow, a RAG knowledge base, MCP connectors, voice rooms, and per-message cost accounting.'
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
  - label: 'Demo videos'
    url: 'https://github.com/RachidChabane/sterna/blob/main/docs/demos.md'
publishState: 'published'
year: '2025–2026'
highlights:
  - 'Open-sourced under Apache-2.0: the full Django/DRF backend, React 19 + TypeScript frontend, FastAPI microservices, and the Kubernetes/Terraform infrastructure'
  - 'Sandboxed coding agent that turns a GitHub issue into a reviewed implementation plan and a pull request, with an in-browser Monaco IDE over its workspace'
  - 'Every message carries measured tokens, cost, and latency — pgvector RAG, MCP connectors, live multi-agent voice rooms, and BYOK provider keys round out the workspace'
  - 'Entire codebase driven by an autonomous Claude Code task-runner with per-task quality gates and gate-repair loops'
metrics:
  - value: '1,264'
    label: 'automated tests'
  - value: 'Apache-2.0'
    label: 'open source'
architecture:
  caption: 'Full-stack AI workspace driven by an autonomous Claude Code task-runner'
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
        - 'coding agent (issue → plan → PR)'
        - 'sandboxed code execution'
        - 'MCP connectors'
        - 'AI voice rooms'
    - label: 'RAG and billing'
      nodes:
        - 'pgvector RAG'
        - 'per-message cost accounting'
        - 'GDPR / rate-limiting hardening'
    - label: 'Agentic build process'
      nodes:
        - 'Claude Code task-runner'
        - 'per-task quality gates'
        - 'gate-repair loops'
        - 'structured failure records'
gallery:
  - src: '/work/sterna-ai-platform/multi-model-chat.png'
    alt: 'Three model panels — Claude Sonnet 4.5, GPT-5, Gemini 2.5 Flash — answering the same rate-limiter prompt side by side'
    caption: 'Multi-model chat: one prompt, several models, one view'
  - src: '/work/sterna-ai-platform/coding-agent-ide.png'
    alt: 'A Monaco-based IDE panel over the coding agent sandbox, showing the file tree and an open TypeScript source file'
    caption: 'Coding agent IDE: file tree, diffs, and live agent steps'
  - src: '/work/sterna-ai-platform/issue-to-pr.png'
    alt: 'The project side panel with Issues, Plans, and PRs tabs, showing a generated implementation plan for a GitHub issue'
    caption: 'Issue to PR: plan, review, implement, ship'
  - src: '/work/sterna-ai-platform/mcp-connectors.png'
    alt: 'A browsable gallery of MCP connectors — GitHub, GitLab, Sentry, Playwright, and more — filterable by category'
    caption: 'MCP connectors: a one-click marketplace of preconfigured servers, OAuth included'
  - src: '/work/sterna-ai-platform/voice-rooms.png'
    alt: 'A live voice room with two AI agent personas debating a product roadmap, shown as a timestamped conversation transcript'
    caption: 'Voice rooms: multiple agents, live transcript'
  - src: '/work/sterna-ai-platform/sparks.png'
    alt: 'An AI-generated Pomodoro timer mini-app rendered live in the chat, with Start and Reset controls'
    caption: 'Sparks: generated mini-apps, rendered and deployable'
---

Sterna is a full-stack AI workspace: a Django/DRF backend pairing a React 19 + TypeScript frontend with FastAPI microservices, a Docker sandbox for code execution, and Kubernetes/Terraform infrastructure. Users run several models side by side in one conversation, hand GitHub issues to a sandboxed coding agent that writes reviewed implementation plans and pull requests through an in-browser IDE, query their own documents through pgvector RAG, join live multi-agent voice rooms, and see the measured tokens, cost, and latency on every single message.

The core was finished about eight months before release; what followed was polish. Rather than fund the hosting and on-call that a public SaaS demands, I chose to open-source the whole thing under Apache-2.0 — the code is the product, self-hostable from one compose file, with recorded demos of every feature in the repository.

The codebase itself was driven by an autonomous Claude Code task-runner enforcing per-task quality gates, gate-repair loops, and structured failure records, making the development process a case study in agentic software engineering.

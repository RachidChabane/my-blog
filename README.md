# my-blog

An **AI-maintained personal blog + portfolio**. Two jobs:

1. **Portfolio** — showcase Rachid Chabane's AI projects (the ones living across `~/dev-env/0-git/`).
2. **Blog** — publish ~2 articles/week on agentic AI: agentic coding, Anthropic, OpenAI, and open-source LLMs.

The intent is for the whole thing to run **autonomously, maintained by AI** — no hand-written or hand-edited content:

- A scheduled (≈twice-weekly) Claude Code routine triggers a multi-agent workflow (search news → pick topic → draft → review → publish), modelled on [`claude-plan-execute`](../claude-plan-execute).
- An always-present **avatar chatbot** answers visitor questions using RAG + a lightweight LLM, with the index refreshed whenever the blog updates — patterned on [`knowledge-master` (bayan)](../knowledge-master).

## Status: groundwork only — no code yet

This repo is at the **foundation stage**. Per the project brief, **no application code** (backend or frontend) is written yet. The blog will be built later via `claude-plan-execute`, after going through Claude Design. The current flow is:

```
project inventory + groundwork (this stage)
      → project-bootstrap (Stage 1 planning docs under docs/)
      → Claude Design (pitch deck / screens)
      → claude-plan-execute (build)
```

## What's here now

| File | Purpose |
|------|---------|
| [`PROJECT-INVENTORY.md`](./PROJECT-INVENTORY.md) | Master inventory of every project in `~/dev-env/0-git/` — what's AI-related, what's portfolio-worthy, and what feeds the blog system. **Start here.** |
| [`inventory/`](./inventory/) | Per-project deep-dive notes (one file per flagship; grouped files for the rest). |

> `docs/` is intentionally left empty — it's reserved for the `project-bootstrap` skill, which generates `vision.md`, `roadmap.md`, `user-requirements.md`, `decisions/`, etc. there. Inventory notes live outside `docs/` so they don't collide with that skill's resume detection.

## Repo

- Visibility: **private** (flip to public when the blog ships — the inventory notes describe other, partly-unreleased projects).
- Remote: `git@github.com:RachidChabane/my-blog.git`

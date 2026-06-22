---
translationKey: github-spec-kit-sdd
lang: en
slug: github-spec-kit-spec-driven-development
title: 'GitHub Spec Kit: driving an agent with Markdown specs'
publishDate: 22-06-2026
kind: tool
tags:
- agents
- oss
- tooling
summary: Spec Kit, GitHub's MIT-licensed toolkit for spec-driven development, has
  reached v0.11.3 with commands now namespaced under /speckit.* and support for 30+
  coding agents.
sources:
- label: github/spec-kit - official repository README
  url: https://github.com/github/spec-kit
  date: 19-06-2026
- label: Spec Kit Documentation - github.github.com/spec-kit
  url: https://github.github.com/spec-kit/
  date: 27-05-2026
- label: Microsoft for Developers - Diving Into Spec-Driven Development With GitHub
    Spec Kit
  url: https://developer.microsoft.com/blog/spec-driven-development-spec-kit
  date: 15-09-2025
contentHash: sha256:2db3898f61ff4cfd
publishState: published
---

## What changed

GitHub Spec Kit is an open-source (MIT) toolkit for spec-driven development (SDD): instead of ad-hoc prompting, you drive an AI coding agent through structured Markdown artifacts. It first shipped publicly in September 2025, when the slash commands were the un-namespaced `/specify`, `/plan`, and `/tasks`. The latest release is v0.11.3 (19-06-2026): commands are now namespaced under `/speckit.*`, and the toolkit works with 30+ agents including GitHub Copilot, Claude Code, Gemini CLI, Codex CLI, Cursor, Windsurf and Zed. It ships a Python CLI called Specify plus a set of agent slash commands.

## The schema

```bash
# Install the Specify CLI (Python tool, via uv) at a pinned release tag
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z

# One-shot alternative (no install)
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>

# Slash commands run inside the AI agent (current namespaced form):
#   /speckit.constitution  Create or update project governing principles and development guidelines
#   /speckit.specify       Define what you want to build (requirements and user stories)
#   /speckit.clarify       Clarify underspecified areas
#   /speckit.plan          Create technical implementation plans with your chosen tech stack
#   /speckit.tasks         Generate actionable task lists for implementation
#   /speckit.analyze       Cross-artifact consistency & coverage analysis
#   /speckit.implement     Execute all tasks to build the feature according to the plan
#   /speckit.checklist     Generate custom quality checklists
```

## In practice

```bash
# Scaffold a project bound to a specific agent integration
specify init my-project --integration copilot
specify init . --integration gemini

# Keep the CLI current and inspect available integrations
specify self check
specify self upgrade --dry-run
specify integration list

# Init creates:
#   .specify/memory/constitution.md, .specify/scripts/, .specify/templates/
#   specs/[feature-name]/  -> spec.md (the what/why), plan.md (the how), tasks.md
# Then, inside the agent, run the flow in order:
#   /speckit.constitution -> /speckit.specify -> /speckit.clarify
#   -> /speckit.plan -> /speckit.tasks -> /speckit.implement
```

## Impact on your team

If your team already leans on AI coding agents but the output is inconsistent, Spec Kit gives you a repeatable artifact chain: `spec.md` (functional requirements and user stories, no tech decisions) feeds `plan.md` (architecture, libraries, tech stack) which feeds `tasks.md` (ordered breakdown with file paths). The spec is the single source of truth: when requirements change, you re-run `/speckit.plan` and `/speckit.tasks` rather than hand-editing downstream files.

> [!IMPORTANT]
> If you adopted Spec Kit during its September 2025 release, the bare `/specify`, `/plan` and `/tasks` commands are now namespaced as `/speckit.*`. Update any internal docs, onboarding guides and prompt files (one file per command, e.g. under `.github/prompts/` for Copilot). Pin the release tag in your install command (`@vX.Y.Z`) so contributors get the same CLI, and use `specify self upgrade --dry-run` to preview changes before bumping.

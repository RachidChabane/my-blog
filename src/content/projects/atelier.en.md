---
translationKey: 'atelier'
lang: 'en'
slug: 'atelier-plugin-marketplace'
name: 'Atelier — Claude Code Plugin Marketplace'
summary: 'A personal Claude Code plugin marketplace shipping opinionated, reusable workflow skills — from project bootstrapping to interactive-Claude migration — as installable plugins with a consistent structure and resume-aware execution.'
stack:
  - 'JSON'
  - 'Markdown'
  - 'Claude Code'
  - 'Python'
  - 'TypeScript'
status: 'active'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/atelier'
publishState: 'draft'
---

Atelier packages complex Claude Code workflows as installable plugins with a strict convention: kebab-case name, one skill per directory, a SKILL.md frontmatter definition, and a references/ folder for context-loaded material. Two plugins ship at v0.1.0: project-bootstrap (drives a repo through a 5-stage planning workflow producing a complete cross-referenced docs/ slate, resume-aware so it continues rather than restarts) and migrate-to-interactive-claude (migrates a project off the metered claude -p API onto the tmux interactive backend to preserve subscription-pool usage after the 2026 billing split). Install via Claude Code's native /plugin system.

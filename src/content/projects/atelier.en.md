---
translationKey: 'atelier'
lang: 'en'
slug: 'atelier-plugin-marketplace'
name: 'Atelier: Claude Code Plugin Marketplace'
summary: 'A personal Claude Code plugin marketplace shipping opinionated, reusable workflow skills (from project bootstrapping to interactive-Claude migration) as installable plugins with a consistent structure and resume-aware execution.'
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
publishState: 'published'
year: '2025'
highlights:
  - 'Packages complex Claude Code workflows as installable plugins under a strict convention: kebab-case name, one skill per directory, a SKILL.md frontmatter definition, and a references/ folder'
  - 'project-bootstrap drives a repo through a 5-stage planning workflow that produces a complete, cross-referenced docs/ slate, resume-aware so it continues rather than restarts'
  - 'migrate-to-interactive-claude moves a project off the metered claude -p API onto the tmux interactive backend to preserve subscription-pool usage after the 2026 billing split'
  - 'Two plugins ship at v0.1.0, installed via the Claude Code native /plugin system'
metrics:
  - value: '2'
    label: 'plugins shipping'
  - value: 'v0.1.0'
    label: 'release'
  - value: '5'
    label: 'planning stages'
architecture:
  caption: 'From install surface down to plugin convention'
  layers:
    - label: 'Install surface'
      nodes:
        - 'Claude Code /plugin system'
    - label: 'Plugins (v0.1.0)'
      nodes:
        - 'project-bootstrap'
        - 'migrate-to-interactive-claude'
    - label: 'Plugin convention'
      nodes:
        - 'kebab-case name'
        - 'one skill per directory'
        - 'SKILL.md frontmatter'
        - 'references/ folder'
---

Atelier packages complex Claude Code workflows as installable plugins with a strict convention: kebab-case name, one skill per directory, a SKILL.md frontmatter definition, and a references/ folder for context-loaded material. Two plugins ship at v0.1.0: project-bootstrap (drives a repo through a 5-stage planning workflow producing a complete cross-referenced docs/ slate, resume-aware so it continues rather than restarts) and migrate-to-interactive-claude (migrates a project off the metered claude -p API onto the tmux interactive backend to preserve subscription-pool usage after the 2026 billing split). Install via Claude Code's native /plugin system.

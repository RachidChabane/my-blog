---
translationKey: 'atelier'
lang: 'fr'
slug: 'atelier-marketplace-plugins'
name: 'Atelier — Marketplace de Plugins Claude Code'
summary: 'Un marketplace personnel de plugins Claude Code proposant des skills de workflow réutilisables et opinionés — du bootstrapping de projet à la migration vers Claude interactif — sous forme de plugins installables avec une structure cohérente et une exécution consciente de la reprise.'
stack:
  - 'JSON'
  - 'Markdown'
  - 'Claude Code'
  - 'Python'
  - 'TypeScript'
status: 'actif'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/atelier'
publishState: 'published'
---

Atelier conditionne des workflows Claude Code complexes en plugins installables avec une convention stricte : nom en kebab-case, un skill par répertoire, une définition frontmatter SKILL.md et un dossier references/ pour le matériel chargé en contexte. Deux plugins sont livrés en v0.1.0 : project-bootstrap (pilote un dépôt à travers un workflow de planification en 5 étapes produisant un slate docs/ complet et inter-référencé, conscient de la reprise pour continuer plutôt que redémarrer) et migrate-to-interactive-claude (migre un projet hors de l'API claude -p facturée vers le backend interactif tmux pour préserver l'usage du pool d'abonnement après la scission de facturation 2026). Installation via le système natif /plugin de Claude Code.

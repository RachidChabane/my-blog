---
translationKey: 'atelier'
lang: 'fr'
slug: 'atelier-marketplace-plugins'
name: 'Atelier: Marketplace de Plugins Claude Code'
summary: 'Un marketplace personnel de plugins Claude Code proposant des skills de workflow réutilisables et opinionés (du bootstrapping de projet à la migration vers Claude interactif) sous forme de plugins installables avec une structure cohérente et une exécution consciente de la reprise.'
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
year: '2025'
highlights:
  - 'Conditionne des workflows Claude Code complexes en plugins installables selon une convention stricte : nom en kebab-case, un skill par répertoire, une définition frontmatter SKILL.md et un dossier references/'
  - 'project-bootstrap pilote un dépôt à travers un workflow de planification en 5 étapes produisant un slate docs/ complet et inter-référencé, conscient de la reprise (il continue plutôt que de recommencer)'
  - 'migrate-to-interactive-claude migre un projet hors de l''API claude -p facturée vers le backend tmux interactif pour préserver le pool d''abonnement après la scission de facturation 2026'
  - 'Deux plugins en v0.1.0, installés via le système /plugin natif de Claude Code'
metrics:
  - value: '2'
    label: 'plugins livrés'
  - value: 'v0.1.0'
    label: 'version'
  - value: '5'
    label: 'étapes de planification'
architecture:
  caption: 'De la surface d''installation à la convention des plugins'
  layers:
    - label: 'Surface d''installation'
      nodes:
        - 'système /plugin de Claude Code'
    - label: 'Plugins (v0.1.0)'
      nodes:
        - 'project-bootstrap'
        - 'migrate-to-interactive-claude'
    - label: 'Convention des plugins'
      nodes:
        - 'nom en kebab-case'
        - 'un skill par répertoire'
        - 'frontmatter SKILL.md'
        - 'dossier references/'
---

Atelier conditionne des workflows Claude Code complexes en plugins installables avec une convention stricte : nom en kebab-case, un skill par répertoire, une définition frontmatter SKILL.md et un dossier references/ pour le matériel chargé en contexte. Deux plugins sont livrés en v0.1.0 : project-bootstrap (pilote un dépôt à travers un workflow de planification en 5 étapes produisant un slate docs/ complet et inter-référencé, conscient de la reprise pour continuer plutôt que redémarrer) et migrate-to-interactive-claude (migre un projet hors de l'API claude -p facturée vers le backend interactif tmux pour préserver l'usage du pool d'abonnement après la scission de facturation 2026). Installation via le système natif /plugin de Claude Code.

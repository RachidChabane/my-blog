---
translationKey: 'claude-plan-execute'
lang: 'fr'
slug: 'claude-plan-execute-fr'
name: 'Claude Plan Execute: Orchestrateur de Tâches Autonome'
summary: 'Un orchestrateur plan→révision→implémentation qui pilote le CLI Claude Code à travers un workflow multi-phases et multi-agents sur un slate de tâches déclaratif, avec des portes de qualité, une branche par tâche, une mémoire inter-tâches et un backend tmux préservant le pool d''abonnement.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'tmux'
  - 'YAML'
  - 'pytest'
  - 'FastAPI'
status: 'actif'
links: []
publishState: 'published'
year: '2025'
highlights:
  - 'Chaque tâche suit un cycle fixe : Plan écrit un plan structuré, une boucle de révision itère un agent de révision jusqu''à approbation, puis Implement le construit'
  - 'Seul un plan APPROVED atteint l''agent Implement, qui travaille par commits avec une checklist de progression reprise'
  - 'La spécialisation de rôle est du swap de prompt, pas des binaires séparés : le même code devient Plan, Review ou Implement'
  - 'Un pilote double backend utilise soit le backend print claude -p, soit un TUI Claude interactif dans tmux, maintenant l''usage sur le pool d''abonnement'
metrics:
  - value: '2'
    label: 'backends du pilote'
  - value: '3'
    label: 'rôles d''agent (plan, révision, implémentation)'
architecture:
  caption: 'Cycle fixe par tâche sur un pilote double backend'
  layers:
    - label: 'Roadmap (dogfoodée)'
      nodes:
        - 'tasks.yaml'
    - label: 'Plan'
      nodes:
        - 'Plan agent'
        - 'plan structuré'
    - label: 'Boucle de révision'
      nodes:
        - 'APPROVED / NEEDS_REVISION'
        - 'revise agent'
        - 'plafond de rounds'
    - label: 'Implement'
      nodes:
        - 'Implement agent'
        - 'commits'
        - 'checklist reprise'
    - label: 'Backend du pilote'
      nodes:
        - 'claude -p'
        - 'TUI Claude tmux'
        - 'pool d''abonnement'
---

Claude Plan Execute exécute un cycle fixe pour chaque tâche : l'agent Plan écrit un plan structuré ; une boucle de révision le contrôle (APPROVED / NEEDS_REVISION) et itère un agent de révision jusqu'au plafond configuré de rounds ; seul un plan approuvé atteint l'agent Implement, qui travaille par commits avec une checklist de progression reprise. La spécialisation de rôle est du swap de prompt, non des binaires séparés. Un pilote double backend permet au même code d'utiliser soit le backend print `claude -p`, soit un vrai TUI Claude interactif dans tmux ; ce dernier maintient l'usage sur le pool d'abonnement Claude plutôt que l'API facturée. Le projet se dogfoode lui-même : sa propre roadmap est le tasks.yaml qu'il exécute.

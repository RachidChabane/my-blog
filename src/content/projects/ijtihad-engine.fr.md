---
translationKey: 'ijtihad-engine'
lang: 'fr'
slug: 'moteur-recherche-autonome'
name: 'Moteur de Recherche Autonome'
summary: 'Un système d''orchestration multi-agents LLM auto-améliorant qui attaque de manière autonome des problèmes ouverts en mathématiques et en science, vérifiant les affirmations formellement et produisant des articles de recherche prêts à soumettre.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'LaTeX'
  - 'aiosqlite'
  - 'SymPy'
  - 'Z3'
  - 'FastAPI'
status: 'actif (en pause)'
links: []
publishState: 'published'
year: '2026'
highlights:
  - 'Fait tourner environ 16 sous-agents Claude Code spécialisés sur un seul cycle de recherche en 8 phases'
  - 'Un graphe de claims épistémiques sur SQLite suit des claims atomiques dans un cycle de confiance (conjecturé, soutenu, répliqué, contesté, réfuté)'
  - 'Les claims se résolvent via des conditions de victoire typées : une preuve Lean, une vérification SymPy ou un seuil de fragilité de simulation'
  - 'A produit des articles de recherche compilés et prêts à soumettre comme sorties réelles'
metrics:
  - value: '~16'
    label: 'sous-agents spécialisés'
  - value: '8'
    label: 'phases du cycle'
  - value: '5'
    label: 'états de confiance'
architecture:
  caption: 'Flux des claims, de la divergence des sous-agents aux articles prêts à soumettre'
  layers:
    - label: 'Orchestration des agents'
      nodes:
        - '~16 sous-agents Claude Code'
    - label: 'Cycle en 8 phases'
      nodes:
        - 'Divergence'
        - 'Extraction de claims'
        - 'Friction'
        - 'Audit de qualité des preuves'
        - 'Synthèse'
    - label: 'Graphe de claims épistémiques (SQLite)'
      nodes:
        - 'Claims atomiques'
        - 'Cycle de confiance'
        - 'Porte de suffisance des preuves'
    - label: 'Conditions de victoire typées'
      nodes:
        - 'Preuve Lean'
        - 'Vérification SymPy'
        - 'Seuil de fragilité de simulation'
    - label: 'Sortie'
      nodes:
        - 'Articles compilés prêts à soumettre'
---

Le moteur fait tourner ~16 sous-agents Claude Code spécialisés sur 8 phases cycliques : divergence, extraction de claims, friction, audit de qualité des preuves, porte de suffisance des preuves, synthèse, méta-évolution et construction formelle. Son cœur est un graphe de claims épistémiques sur SQLite qui suit des claims atomiques dans un cycle de confiance (conjectured, supported, replicated, contested, refuted) avec des conditions de victoire typées : preuve Lean, vérification SymPy ou seuil de fragilité de simulation. Le moteur a produit des articles de recherche compilés et prêts à soumettre comme résultats réels.

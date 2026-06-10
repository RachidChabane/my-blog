---
translationKey: 'ijtihad-engine'
lang: 'fr'
slug: 'moteur-ijtihad'
name: 'Ijtihad Engine: Système de Recherche Autonome'
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
---

L'Ijtihad Engine fait tourner ~16 sous-agents Claude Code spécialisés sur 8 phases cycliques : divergence, extraction de claims, friction, audit de qualité des preuves, porte de suffisance des preuves, synthèse, méta-évolution et construction formelle. Son cœur est un graphe de claims épistémiques sur SQLite qui suit des claims atomiques dans un cycle de confiance (conjectured → supported → replicated → contested → refuted) avec des conditions de victoire typées : preuve Lean, vérification SymPy ou seuil de fragilité de simulation. Le moteur a produit des articles de recherche compilés et prêts à soumettre comme résultats réels.

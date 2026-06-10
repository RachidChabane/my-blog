---
translationKey: 'athletic-tracker'
lang: 'fr'
slug: 'suivi-athletique'
name: 'Athletic Tracker: Gestionnaire Autonome de Programme de Force'
summary: 'Un gestionnaire autonome opéré par Claude Code pour un programme de force pluriannuel, connectant un moteur de prescriptions Excel et l''application Hevy avec une couche d''overrides LLM contrainte, un mode shadow et une détection de collision idempotente.'
stack:
  - 'Python'
  - 'Claude Code'
  - 'Pydantic'
  - 'openpyxl'
  - 'Hevy API'
  - 'uv'
  - 'pytest'
status: 'actif'
links: []
publishState: 'published'
year: '2026'
highlights:
  - 'Trois tâches cron à portes : sync Hevy hebdomadaire vers un journal Excel, plus une réécriture des routines mid-block'
  - 'La tâche mid-block applique progression en % et auto-régulation, puis superpose un jugement LLM contraint'
  - 'Un agent Claude cloud retourne des overrides JSON typés et validés par schéma ; il réagit à la blessure ou à la fatigue mais ne touche pas au programme au-delà de cette surface'
  - 'Deux propriétés de sécurité : mode shadow (propositions dans des fichiers pendant les deux premiers blocs avant toute écriture API) et détection de collision (compare chaque écriture au dernier snapshot)'
metrics:
  - value: '3'
    label: 'tâches cron à portes'
  - value: '2'
    label: 'propriétés de sécurité'
  - value: '2'
    label: 'blocs en mode shadow d''abord'
architecture:
  caption: 'Des déclencheurs cron aux écritures sous portes de sécurité'
  layers:
    - label: 'Tâches cron à portes'
      nodes:
        - 'Sync hebdomadaire'
        - 'Tâche mid-block'
    - label: 'Sync et réécriture'
      nodes:
        - 'Hevy API'
        - 'journal Excel'
        - 'progression en %'
        - 'auto-régulation'
    - label: 'Jugement LLM contraint'
      nodes:
        - 'agent Claude cloud'
        - 'brief d''observations'
        - 'overrides JSON validés par schéma'
    - label: 'Portes de sécurité'
      nodes:
        - 'mode shadow'
        - 'détection de collision'
        - 'dernier snapshot commité'
---

Athletic Tracker exécute trois tâches cron à portes. Le sync hebdomadaire récupère les entraînements depuis Hevy et les ajoute à un journal Excel. La tâche mid-block réécrit les routines de la semaine suivante (appliquant la progression en % et les ajustements d'auto-régulation), puis superpose un jugement LLM contraint : un agent Claude cloud reçoit un brief d'observations et doit retourner des overrides JSON typés et validés par schéma ; il peut réagir aux signaux de blessure ou de fatigue, mais ne peut pas toucher au programme en dehors de cette surface. Deux propriétés de sécurité définissent la conception : un mode shadow qui émet des propositions dans des fichiers pendant les deux premiers blocs avant d'écrire sur l'API (l'autonomie se mérite, elle n'est pas supposée), et une détection de collision qui compare chaque écriture planifiée au dernier snapshot commité et s'arrête en cas de modifications inattendues : aucun écrasement aveugle.

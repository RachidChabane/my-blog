---
translationKey: github-spec-kit-sdd
lang: fr
slug: github-spec-kit-developpement-pilote-par-specification
title: 'GitHub Spec Kit : piloter un agent par des specs Markdown'
publishDate: 22-06-2026
kind: tool
tags:
- agents
- oss
- tooling
summary: Spec Kit, la boîte à outils MIT de GitHub pour le développement piloté par
  spécification, est arrivée en v0.11.3 avec des commandes désormais préfixées /speckit.*
  et plus de 30 agents pris en charge.
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
contentHash: sha256:f803430e2ceef19b
publishState: published
---

## Ce qui change

GitHub Spec Kit est une boîte à outils open source (MIT) pour le développement piloté par spécification (SDD) : au lieu d'un prompting au coup par coup, vous pilotez un agent de code par des artefacts Markdown structurés. La première publication publique date de septembre 2025, quand les commandes étaient `/specify`, `/plan` et `/tasks` sans préfixe. La dernière version est la v0.11.3 (19-06-2026) : les commandes sont désormais préfixées sous `/speckit.*`, et l'outil fonctionne avec plus de 30 agents, dont GitHub Copilot, Claude Code, Gemini CLI, Codex CLI, Cursor, Windsurf et Zed. Il fournit une CLI Python nommée Specify ainsi qu'un jeu de commandes slash pour l'agent.

## Le schéma

```bash
# Installer la CLI Specify (outil Python, via uv) sur un tag de release figé
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z

# Alternative en une commande (sans installation)
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>

# Commandes slash exécutées dans l'agent IA (forme préfixée actuelle) :
#   /speckit.constitution  Crée ou met à jour les principes directeurs et règles de développement
#   /speckit.specify       Définit ce que vous voulez construire (exigences et user stories)
#   /speckit.clarify       Clarifie les zones sous-spécifiées
#   /speckit.plan          Crée le plan d'implémentation technique avec votre stack
#   /speckit.tasks         Génère des listes de tâches actionnables pour l'implémentation
#   /speckit.analyze       Analyse de cohérence et de couverture entre artefacts
#   /speckit.implement     Exécute toutes les tâches pour construire selon le plan
#   /speckit.checklist     Génère des checklists qualité sur mesure
```

## En pratique

```bash
# Initialiser un projet lié à une intégration d'agent précise
specify init my-project --integration copilot
specify init . --integration gemini

# Maintenir la CLI à jour et inspecter les intégrations disponibles
specify self check
specify self upgrade --dry-run
specify integration list

# init crée :
#   .specify/memory/constitution.md, .specify/scripts/, .specify/templates/
#   specs/[feature-name]/  -> spec.md (le quoi/pourquoi), plan.md (le comment), tasks.md
# Puis, dans l'agent, dérouler le flux dans l'ordre :
#   /speckit.constitution -> /speckit.specify -> /speckit.clarify
#   -> /speckit.plan -> /speckit.tasks -> /speckit.implement
```

## Impact pour une équipe

Si votre équipe s'appuie déjà sur des agents de code mais que le résultat reste inégal, Spec Kit offre une chaîne d'artefacts reproductible : `spec.md` (exigences fonctionnelles et user stories, sans décisions techniques) alimente `plan.md` (architecture, bibliothèques, stack technique) qui alimente `tasks.md` (découpage ordonné avec chemins de fichiers). La spec est l'unique source de vérité : quand les exigences changent, on relance `/speckit.plan` et `/speckit.tasks` plutôt que d'éditer à la main les artefacts en aval.

> [!IMPORTANT]
> Si vous avez adopté Spec Kit lors de sa sortie de septembre 2025, les commandes nues `/specify`, `/plan` et `/tasks` sont désormais préfixées en `/speckit.*`. Mettez à jour la documentation interne, les guides d'onboarding et les fichiers de prompts (un fichier par commande, par exemple sous `.github/prompts/` pour Copilot). Figez le tag de release dans la commande d'installation (`@vX.Y.Z`) pour que tous les contributeurs aient la même CLI, et utilisez `specify self upgrade --dry-run` pour prévisualiser avant de monter de version.

---
translationKey: rtk-caveman-token-stack
lang: fr
slug: rtk-caveman-deux-bouts-tokens-agents
title: 'RTK + Caveman : compresser les tokens des deux côtés de la boucle d''un agent'
publishDate: 22-06-2026
kind: tool
tags:
- agents
- agentic-coding
- oss
- inference
summary: Deux outils open source indépendants - RTK comprime les sorties de commandes
  qui entrent dans le contexte, Caveman comprime les réponses du modèle qui en sortent.
sources:
- label: RTK primary repo README
  url: https://raw.githubusercontent.com/rtk-ai/rtk/master/README.md
  date: 21-06-2026
- label: RTK GitHub API
  url: https://api.github.com/repos/rtk-ai/rtk
  date: 22-06-2026
- label: Caveman primary repo README
  url: https://raw.githubusercontent.com/JuliusBrussee/caveman/main/README.md
  date: 12-06-2026
- label: Caveman GitHub API
  url: https://api.github.com/repos/JuliusBrussee/caveman
  date: 22-06-2026
- label: azrod.me - independent corroboration of the combined RTK/Caveman stack
  url: https://azrod.me/en/articles/token-economy-rtk-dcp-caveman/
  date: 07-05-2026
contentHash: sha256:7494b21e4db0d0af
publishState: published
---

## Ce qui change

Depuis le 12-06-2026, deux projets open source non affiliés que la communauté assemble sous le nom "RTK + Caveman" ont publié des versions le même jour. RTK (Rust Token Killer, `rtk-ai/rtk`, v0.42.4, Apache 2.0) est un proxy CLI en Rust qui intercepte et comprime les sorties de commandes shell (tests, git, grep, ls) avant qu'elles n'entrent dans le contexte de l'agent - il annonce 60-90 % de réduction côté entrée. Caveman (`JuliusBrussee/caveman`, v1.9.0, MIT) est un skill/plugin Claude Code qui force le modèle à répondre en fragments télégraphiques côté sortie. Ce sont des outils locaux, pas des modèles ni des services hébergés ; ils se branchent sur Claude Code, Cursor, Gemini CLI et d'autres.

## Le schéma

```bash
# RTK - côté ENTRÉE : réécrit les sorties d'outils avant le contexte
# (le flag global est -g, ou sa forme longue --global ; la branche d'install est master)
brew install rtk
rtk init -g                  # Claude Code / Copilot (défaut)
rtk init -g --gemini         # Gemini CLI
rtk init -g --agent cursor   # Cursor
rtk gain                     # affiche les tokens économisés
# après init : "git status" est automatiquement réécrit en "rtk git status"

# Caveman - côté SORTIE : comprime le style des réponses générées
/caveman lite    # supprime le remplissage
/caveman full    # caveman par défaut (~75 % annoncés ; 65 % mesurés)
/caveman ultra   # télégraphique
/caveman-stats   # tokens réels de la session + économies cumulées
```

## En pratique

```bash
# Pile combinée sur une session Claude Code lourde en CLI
rtk init -g                              # entrée : -80 % sur le tableau RTK
# (ls/tree -80%, grep -80%, cargo test -90%, total ~118k -> ~23,9k tokens)

curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
/caveman full                            # sortie : 65 % en moyenne (plage 22-87 %)

# Vérifier les deux
rtk --version        # NB : le README imprime "rtk 0.28.2" en exemple ; l'API donne v0.42.4
/caveman-stats
```

## Impact pour une équipe

Si vos agents tournent sur des workflows CLI denses (suites de tests, git, grep répétés), le coût en tokens vient surtout des sorties d'outils, et RTK l'attaque à la source avec moins de 10 ms de surcoût. Caveman, lui, ne touche qu'aux tokens de sortie et revendique une « précision technique complète » sur le code et les chemins - utile quand un humain relit le diff.

> [!IMPORTANT]
> "RTK + Caveman" n'est pas un produit : ce sont deux projets d'auteurs différents, sous deux licences distinctes (Apache 2.0 et MIT). Les bundles communautaires (ex. `adityahimaone/hermes-agent-rtk-caveman`) annoncent "90-99 % d'économies", mais cette estimation cumule des mesures non issues d'un même banc d'essai. Mesurez sur votre propre projet : le README de RTK prévient que ses chiffres reposent sur des « projets TypeScript/Rust de taille moyenne » et que « les économies réelles varient selon la taille du projet », et l'écart Caveman "~75 % annoncé" contre "65 % mesuré" mérite votre propre vérification avant tout budget.

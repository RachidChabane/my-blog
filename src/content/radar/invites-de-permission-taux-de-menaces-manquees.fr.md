---
translationKey: human-in-the-loop-approval-miss-rate-study
lang: fr
slug: invites-de-permission-taux-de-menaces-manquees
title: Les joueurs qui approuvent les commandes d'un agent ont manqué 1 menace sur
  3, et ce 66,3 % est le chiffre optimiste
publishDate: 07-08-2026
kind: research
tags:
- Claude Code
- Claude
- Anthropic
- agents
- security
summary: 'Un jeu de permissions a enregistré plus de 40 000 exécutions et 409 000
  décisions d''approbation ou de refus : le joueur moyen laisse passer 1 menace sur
  3, pour une exactitude moyenne de 66,3 %, et 7 % approuvent chaque invite. La télémétrie
  Claude Code d''Anthropic situe l''approbation réelle autour de 93 %, donc traitez
  66,3 % comme le plafond de la vigilance humaine.'
sources:
- label: Scale X study
  url: https://scalex.dev/blog/ai-agent-permissions-stats/
  date: 05-08-2026
- label: The Register
  url: https://www.theregister.com/ai-and-ml/2026/08/06/humans-in-the-loop-miss-a-third-of-dangerous-ai-coding-agent-requests/5284236
  date: 06-08-2026
contentHash: sha256:d23589130b79fd7c
publishState: published
---

## Ce qui change

Scale X a publié le 5 août 2026 les données de son jeu de permissions : plus de 40 000 exécutions et 409 000 décisions d'approbation ou de refus, un test de l'humain dans la boucle, « notre dernière ligne de défense face aux agents devenus fous » [s1]. Le joueur moyen a laissé passer 1 menace sur 3, soit 66,3 % d'exactitude moyenne [s1]. Et 32,9 % des sessions s'achèvent sur un score négatif : les pénalités des menaces approuvées et des commandes sûres bloquées l'emportent sur tout le reste [s1].

## 66,3 %, un chiffre optimiste

Ces joueurs étaient prévenus : notés, avertis que des menaces étaient plantées, avec la surveillance pour seule tâche. En production, rien de tel. La télémétrie de Claude Code, citée par Anthropic dans un billet de mai, situe l'approbation autour de 93 % des invites de permission [s2], et Anthropic nomme le ressort : « Plus un utilisateur voit d'approbations, moins il prête attention à chacune » [s2]. Ensemble, elles ne mesurent plus la vigilance réelle : elles en fixent la borne haute. À mon sens, 66,3 % représente le mieux que vos relecteurs feront jamais.

| Résultat | Part |
| :--- | ---: |
| Exactitude moyenne des décisions | 66,3 % [s1] |
| Sessions au score négatif | 32,9 % [s1] |
| Ont intercepté toutes les menaces | 35,2 % [s1] |
| Idem en bloquant au plus 1 commande sûre sur 5 | 20,8 % [s1] |
| Ont approuvé chaque invite | 7 % [s1] |

> [!IMPORTANT]
> Sur les 35,2 % qui ont tout intercepté, 20,8 % seulement l'ont fait en bloquant au plus 1 commande sûre sur 5 ; les autres, en partie en bloquant tout, d'où le titre « Human Bottleneck » [s1]. Refuser par réflexe donne un tableau de bord irréprochable et ne livre rien, et aucune équipe de ma connaissance ne mesure ce coût.

## Impact pour une équipe

Dans votre modèle de menace, l'invite d'approbation quitte la colonne « contrôles » pour celle des ralentisseurs. Réduisez ensuite le volume, puisque c'est lui qui érode l'attention [s2] : mettez en liste d'autorisation les commandes anodines, pour que ce qui remonte à un humain soit assez rare pour être lu. Mesurez votre taux d'approbation cette semaine ; s'il frôle les 93 % [s2], votre équipe tourne déjà sous `--dangerously-skip-permissions` dans les faits, comme les 7 % de l'étude [s1]. Le budget prévu pour l'ergonomie des invites ira mieux à des contrôles qui ne s'émoussent pas : bac à sable, sortie réseau filtrée, portée réduite des identifiants. Ils restent aussi stricts à la quatre-centième invite qu'à la première ; aucun humain de ce jeu de données ne l'est resté.

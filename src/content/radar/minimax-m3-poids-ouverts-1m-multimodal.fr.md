---
translationKey: minimax-m3-open-weight-multimodal
lang: fr
slug: minimax-m3-poids-ouverts-1m-multimodal
title: 'MiniMax-M3 : un MoE multimodal en poids ouverts, contexte 1M sur attention
  creuse'
publishDate: 22-06-2026
kind: release
tags:
- open-weight
- llm-release
- long-context
- multimodal
- sparse-attention
summary: 'MiniMax a publié M3 le 1er juin 2026 : un MoE en poids ouverts (~428 Md
  / ~23 Md actifs) qui associe un contexte d''un million de tokens à une entrée native
  texte, image et vidéo et un nouvel opérateur d''attention creuse (MSA), avec 59,0
  % sur SWE-Bench Pro.'
sources:
- label: MiniMaxAI/MiniMax-M3 official Hugging Face model card
  url: https://huggingface.co/MiniMaxAI/MiniMax-M3
  date: 01-06-2026
- label: DataNorth news - MiniMax launches M3
  url: https://datanorth.ai/news/minimax-launches-m3
  date: 01-06-2026
contentHash: sha256:5efc5060dfabcbe2
publishState: published
---

## Ce qui change

Le laboratoire shanghaïen MiniMax a publié MiniMax-M3 le 1er juin 2026, en poids ouverts sous licence minimax-community. C'est un modèle Mixture-of-Experts d'environ 428 milliards de paramètres dont près de 23 milliards actifs par token, qui associe une fenêtre de contexte d'un million de tokens à une multimodalité native : le texte, l'image et la vidéo entrent, le texte sort. Pour un ingénieur, l'essentiel n'est pas la taille mais l'opérateur d'attention. M3 abandonne l'attention par requêtes groupées (GQA) au profit de MiniMax Sparse Attention (MSA), et annonce 59,0 % sur SWE-Bench Pro à environ 100 tokens par seconde.

## Comment MSA change le calcul

<figure class="rc-diagram"><svg viewBox="0 0 560 170" role="img" aria-label="La branche d'index de MSA choisit deux blocs de tokens passes sur cinq pour le chemin d'attention principal ; les blocs non retenus sont ignores"><text x="16" y="44" style="fill: var(--fg); font-family: var(--font-mono)" font-size="13">requête</text><line x1="74" y1="40" x2="108" y2="40" style="stroke: var(--accent)" stroke-width="1.5"/><rect x="108" y="22" width="96" height="36" rx="5" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="124" y="44" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">index</text><text x="250" y="16" style="fill: var(--fg); font-family: var(--font-mono)" font-size="11">blocs passés</text><rect x="250" y="26" width="44" height="26" rx="3" style="fill: var(--accent); stroke: var(--accent)"/><rect x="300" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><rect x="350" y="26" width="44" height="26" rx="3" style="fill: var(--accent); stroke: var(--accent)"/><rect x="400" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><rect x="450" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><line x1="204" y1="40" x2="250" y2="40" style="stroke: var(--accent)" stroke-width="1.5"/><line x1="272" y1="52" x2="272" y2="110" style="stroke: var(--accent)" stroke-width="1.5"/><line x1="372" y1="52" x2="372" y2="110" style="stroke: var(--accent)" stroke-width="1.5"/><rect x="250" y="110" width="194" height="34" rx="5" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="266" y="132" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">attention (blocs choisis)</text><line x1="444" y1="127" x2="486" y2="127" style="stroke: var(--accent)" stroke-width="1.5"/><text x="492" y="131" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">sortie</text></svg><figcaption>La branche d'index de MSA ne lit que les blocs qu'elle sélectionne ; les autres sont ignorés.</figcaption></figure>

MSA fait tourner une branche d'index légère à côté du chemin d'attention principal : pour chaque requête, elle choisit quels blocs de tokens passés méritent vraiment de l'attention, au lieu de parcourir toute la séquence. C'est tout le principe, et c'est pourquoi un contexte d'un million de tokens cesse d'être un mur de bande passante mémoire. MiniMax annonce que MSA ramène le calcul par token à environ un vingtième de la génération précédente, avec un préremplissage plus de 9 fois plus rapide et un décodage plus de 15 fois plus rapide que M2 à un contexte d'un million de tokens. La leçon que le métier réapprend sans cesse : un contexte long est d'abord un problème d'opérateur d'attention, avant d'être un problème de matériel.

## La fiche technique

| Champ | MiniMax-M3 |
| :--- | :--- |
| Paramètres | ~428 Md au total, ~23 Md actifs (MoE) |
| Fenêtre de contexte | 1 000 000 tokens |
| Attention | MiniMax Sparse Attention (MSA) |
| Modalités | texte + image + vidéo en entrée, texte en sortie |
| Licence | minimax-community |
| SWE-Bench Pro | 59,0 % |
| Débit | ~100 tokens/s |

## Impact pour une équipe

Si vous hébergez vous-même des agents à contexte long ou des pipelines multimodaux, M3 est le premier modèle en poids ouverts à réunir un bon niveau de code, une fenêtre d'un million de tokens et l'entrée native image et vidéo dans un seul jeu de poids ; un flux qui relie aujourd'hui un LLM de code à un modèle de vision distinct pourrait se réduire à un seul déploiement. Avant de planifier une migration, pesez deux points. La licence est minimax-community, pas MIT ni Apache : lisez ses conditions avant tout usage commercial. Et les chiffres spectaculaires, les accélérations 9x et 15x, le calcul divisé par vingt, le débit annoncé 3 fois supérieur à Claude Opus, viennent de l'éditeur : mesurez MSA sur votre propre trafic d'un million de tokens avant de dimensionner votre matériel.

> [!IMPORTANT]
> Les accélérations de MSA et le score SWE-Bench Pro sont les chiffres de MiniMax. La fiche du modèle ne confirme ni le nombre de couches ni le nombre d'experts : ne dimensionnez pas un budget de service à partir d'une architecture supposée. Mesurez la latence de préremplissage et de décodage à votre longueur de contexte réelle avant d'engager des GPU.

---
translationKey: lfm3-256k-window-versus-ruler-128k-recall
lang: fr
slug: lfm3-fenetre-256k-contre-rappel-ruler-128k
title: Dans son propre tableau, Liquid AI met LFM3-1.7B au niveau de Qwen3.5 4B sur
  AA-LCR (52.83 contre 52.67) et en retrait sur RULER 128K (65.56 contre 84.63) ;
  selon Local AI Zone, les modèles de Qwen à attention complète retrouvent mieux l'information
  à 128K
publishDate: 02-11-2026
kind: release
tags:
- Liquid AI
- LFM3
- Ollama
- long-context
summary: 'Liquid AI a publié LFM3 le 27 octobre 2026 et présente LFM3-1.7B comme un
  modèle texte pour les agents locaux et les applications spécialisées, avec une fenêtre
  de contexte de 256K tokens. Dans le propre tableau de Liquid AI, LFM3-1.7B fait
  jeu égal avec Qwen3.5 4B sur AA-LCR (52.83 contre 52.67) et reste derrière lui sur
  RULER 128K (65.56 contre 84.63). Selon Local AI Zone, les modèles de Qwen à attention
  complète retrouvent mieux l''information à 128K, et aucune réplication pleinement
  indépendante des benchmarks n''existe encore. Ma recommandation : faire tourner
  lfm3 via Ollama pour les agents en arrière-plan, garder les longues transcriptions
  derrière une étape de retrieval, et mesurer le rappel sur vos propres traces avant
  de vous fier au bout de la fenêtre.'
sources:
- label: Liquid AI on Hugging Face, Build specialized multimodal models with LFM3
  url: https://huggingface.co/blog/LiquidAI/lfm3
  date: 27-10-2026
- label: 'Liquid AI, Introducing LFM3: Every Modality for Specialized Intelligence'
  url: https://www.liquid.ai/blog/lfm3
  date: 27-10-2026
- label: Ollama, Release v0.40.12
  url: https://github.com/ollama/ollama/releases/tag/v0.40.12
  date: 27-10-2026
- label: Ollama, Release v0.40.13
  url: https://github.com/ollama/ollama/releases/tag/v0.40.13
  date: 28-10-2026
- label: 'Local AI Zone, LFM3: A Technical Deep Dive into Liquid AI''s Tri-Hybrid
    2B Multimodal Family'
  url: https://local-ai-zone.github.io/blog/lfm3-deep-dive.html
  date: 28-10-2026
contentHash: sha256:b1afb61c7b80fecf
publishState: published
---

## Ce qui change

Liquid AI a publié LFM3 le 27 octobre 2026, avec des modèles de base et post-entraînés à poids ouverts sur Hugging Face [s1][s2]. Selon Liquid AI, LFM3-1.7B est un modèle texte pour les agents locaux et les applications spécialisées, doté d'une fenêtre de contexte de 256K tokens, et tient dans environ 1 GB en précision 4-bit [s2]. Ollama a ajouté lfm3 en v0.40.12 sur matériel Apple, puis Linux et Windows en v0.40.13 [s3][s4].

## Deux lignes, une fenêtre

À mon avis, la fenêtre de 256K sert à loger l'état d'un agent, et le rappel à 128K doit se tester avant qu'on s'y fie. Le propre tableau de Liquid AI trace cette limite [s2] :

| Benchmark | LFM3-1.7B | Qwen3.5 4B | Qwen3.5 9B | Selon |
| :--- | ---: | ---: | ---: | :--- |
| AA-LCR | 52.83 | 52.67 | 62.00 | Liquid AI [s2] |
| RULER 128K | 65.56 | 84.63 | 87.11 | Liquid AI [s2] |

Local AI Zone lit les mêmes lignes : la fenêtre de 256K coûte peu à faire tourner, mais les modèles de Qwen à attention complète retrouvent mieux l'information à 128K, et AA-LCR (52.83) reste bien plus proche du peloton [s5]. À ma lecture, cette ligne RULER s'arrête à 128K, la moitié de la fenêtre, et le tableau n'offre aucun chiffre RULER pour la seconde moitié.

> [!IMPORTANT]
> Les deux lignes viennent du propre tableau de Liquid AI. Local AI Zone présente son explication mécanique de l'écart comme une hypothèse, et indique qu'aucune réplication pleinement indépendante des benchmarks n'existe encore [s5].

## Où porte l'objection

L'objection la plus solide : RULER n'est qu'un test, et sur AA-LCR le modèle fait jeu égal avec Qwen3.5 4B. Je suis d'accord, une ligne seule pèse peu. À mon sens, c'est pourtant la plus proche du travail d'un agent en arrière-plan : il remplit sa fenêtre de sorties d'outils, puis doit y retrouver une valeur enfouie loin. Liquid AI écrit que des dizaines d'agents peuvent tourner en continu en arrière-plan [s2], et je pense que c'est là que la ligne RULER compte.

## Impact pour une équipe

Pour des agents locaux sur de petits modèles ouverts, ma recommandation : faites tourner lfm3 via Ollama pour le travail de fond que vend Liquid AI, et gardez les longues transcriptions derrière une étape de retrieval. La commande Ollama est `ollama run lfm3`, et sous Linux ou Windows il faut la version v0.40.13 [s3][s4]. Avant qu'un agent s'appuie sur le contexte au-delà de 128K, je mesurerais le rappel sur vos propres traces, à la profondeur visée. La panne que je surveillerais : un agent qui finit une longue exécution après avoir agi sur le mauvais résultat d'outil, sans trace dans les logs.

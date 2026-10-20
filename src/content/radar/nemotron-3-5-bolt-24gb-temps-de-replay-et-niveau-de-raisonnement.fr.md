---
translationKey: nemotron-3-5-bolt-24gb-replay-time-and-reasoning-level
lang: fr
slug: nemotron-3-5-bolt-24gb-temps-de-replay-et-niveau-de-raisonnement
title: Nemotron 3.5 Bolt 24GB est derrière Qwen3.6 et Gemma 4 en temps de replay dans
  le tableau de NVIDIA, et le raisonnement medium a fait passer les 10 tâches en japonais
  de Classmethod de 356 à 91 secondes
publishDate: 20-10-2026
kind: release
tags:
- NVIDIA
- Nemotron
- llama.cpp
- local inference
- quantization
summary: 'NVIDIA a publié Nemotron 3.5 Bolt 74B-A9B 24GB le 15 octobre 2026 en revendiquant
  une précision supérieure à Qwen3.6 35B-A3B et Gemma 4 26B-A4B, mais son propre tableau
  donne à Bolt un replay AgentPerf Local de 600.80 s, contre 453.97 s et 480.68 s,
  sur l''outil de replay d''Artificial Analysis, qui fige les tokens de chaque tour.
  Le chat template ajoute un paramètre medium_effort, désactivé par défaut, et sur
  10 tâches en japonais Classmethod a gardé un score de 8/9 en passant de 356 à 91
  secondes. Ma recommandation : mesurez Bolt avec medium_effort face à Qwen3.6 sur
  vos propres tâches, et surveillez les exécutions qui épuisent le budget de sortie.'
sources:
- label: NVIDIA Research, "NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB" technical blog
  url: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/
  date: 15-10-2026
- label: Hugging Face model card, nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
  url: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
  date: 15-10-2026
- label: Artificial Analysis, "First AA-AgentPerf-Local results for an NVIDIA RTX
    Spark N1X laptop"
  url: https://artificialanalysis.ai/articles/nvidia-rtx-spark-agentperf-local
  date: 15-10-2026
- label: Artificial Analysis, "NVIDIA Releases Nemotron 3.5 Super and Nemotron 3.5
    Bolt"
  url: https://artificialanalysis.ai/articles/nemotron-3-5-super-and-bolt
  date: 15-10-2026
- label: Classmethod (Hiroshi Morishige), "I ran the 2-bit quantized MoE Nemotron
    3.5 Bolt 74B-A9B on DGX Spark"
  url: https://dev.classmethod.jp/en/articles/dgx-spark-nemotron-3-5-bolt-74b-a9b-first-touch/
  date: 16-10-2026
- label: Hugging Face, chat_template.jinja in nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
  url: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB/raw/main/chat_template.jinja
  date: 15-10-2026
contentHash: sha256:289ba06283d9a117
publishState: published
---

## Ce qui change

NVIDIA a publié Nemotron 3.5 Bolt 74B-A9B 24GB le 15 octobre 2026 [s1][s2], conçu pour tenir dans 24GB de mémoire avec une vitesse de décodage d'au moins 80 TPS [s1]. Ses experts sont compressés à 2.0625 bits par élément en IQ2_XXS, et NVIDIA revendique une précision supérieure à Qwen3.6 35B-A3B et Gemma 4 26B-A4B sur de nombreux benchmarks [s1].

## Ce que mesure le replay

Je pense que le chiffre à lire est dans le tableau de vitesse de NVIDIA, mesuré avec llama.cpp sur le même matériel RTX Spark [s1].

| Modèle et build, tels que NVIDIA les nomme | TPS SPEED-Bench-Coding | Replay AgentPerf Local (s) |
| :--- | ---: | ---: |
| Nemotron 3.5 Bolt 74B-A9B 24GB IQ2_XXS w. LiLiCorr | 83.99 [s1] | 600.80 [s1] |
| Qwen3.6 35B-A3B UD-Q4_K_M w. MTP | 96.63 [s1] | 453.97 [s1] |
| Gemma 4 26B-A4B UD-Q4_K_M w. MTP | 100.56 [s1] | 480.68 [s1] |
| Qwen3.8 27B UD-Q4_K_M w. DFlash | 28.26 [s1] | 1043.28 [s1] |

> [!CONFIRMED]
> Dans le propre tableau de NVIDIA, le replay de Bolt prend 600.80 s contre 453.97 s pour Qwen3.6 35B-A3B et 480.68 s pour Gemma 4 26B-A4B [s1], et Artificial Analysis indique que son replay génère exactement le nombre de tokens enregistré pour chaque tour [s3].

> [!INFERRED]
> Selon ma lecture, le replay facture le même travail à la vitesse de chaque modèle et ne dit rien des tokens que Bolt dépense, l'autre moitié de la facture dans une vraie boucle d'agent.

Sur ce point, les sources indépendantes divergent. Artificial Analysis, sans préciser quel build elle a évalué, mesure Bolt à 82k tokens de sortie par tâche de l'Intelligence Index, 1.8x Nemotron 3.5 Super VL [s4]. Classmethod écrit que Bolt réfléchit nettement moins longtemps que Lightning [s5]. Aucune ne le compare à Qwen3.6 ou Gemma 4.

## Le niveau de raisonnement, vrai levier

Le chat template du dépôt `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB` définit `medium_effort`, désactivé par défaut [s6] :

```jinja
{%- set enable_thinking = enable_thinking if enable_thinking is defined else True %}
{%- set medium_effort = medium_effort if medium_effort is defined else False %}
```

Activé, `medium_effort` ajoute `{reasoning effort: efficient}` au dernier tour utilisateur [s6]. Classmethod a testé le niveau medium sur un DGX Spark avec 10 tâches en japonais, en `--parallel 8` sans décodage spéculatif : il a gardé le score automatique à 8/9 tandis que les tokens passaient de 13,413 à 3,240 et le temps de 356 à 91 secondes [s5]. Le total en high inclut une tâche qui a épuisé le budget de 8,192 tokens sans produire de texte, et à laquelle medium a répondu [s5].

## L'objection la plus solide

Un replay à tokens égaux est le test équitable, et une avance en précision peut valoir l'attente. J'en conviens, et c'est justement pourquoi le replay ne chiffre pas votre boucle : dès que le modèle fixe la longueur de sa sortie, c'est le niveau de raisonnement qui fait bouger le chronomètre.

## Impact pour une équipe

Ma recommandation, si vous faites tourner Bolt en local derrière un harnais d'agent : mesurez-le avec `medium_effort` activé face à Qwen3.6 35B-A3B sur vos tâches avant de garder le high par défaut, et journalisez chaque exécution qui épuise le budget de sortie sans répondre. Le résultat de Classmethod, sur 10 tâches en japonais [s5], reste une hypothèse à vérifier. Dimensionnez la machine pour une seule séquence concurrente, ce que supposent les deux recettes de la fiche : la recette 32GB vise une RTX Spark 128GB ou un GPU discret de 48GB+, la 28GB une RTX Spark 64GB ou 32GB+ [s2].

---
translationKey: deepinfer-offline-engine-without-kv-cache-and-data-parallel-load-balancing
lang: fr
slug: deepinfer-moteur-hors-ligne-sans-cache-kv-ni-repartition-de-charge-data-parallel
title: DeepInfer de DeepSeek arrive comme moteur hors ligne pour SM100 et Ascend 950,
  sans le système de cache KV ni la répartition de charge data-parallel qui font tourner
  son service
publishDate: 21-10-2026
kind: tool
tags:
- DeepSeek
- DeepInfer
- vLLM
- inference
summary: 'DeepSeek a publié DeepInfer le 20 octobre 2026 sous Apache License 2.0,
  comme moteur d''inférence hors ligne pour DeepSeek-V4.1-Flash sur GPU NVIDIA SM100
  et NPU Huawei Ascend 950. Le README range un système de cache KV, la désagrégation
  VE/Prefill/Decode et la répartition de charge entre répliques data-parallel parmi
  ce qui n''est pas inclus, et la Q&A de déploiement de DeepSeek indique que ses composants
  de gestion du cache KV et de répartition de charge sont étroitement couplés à son
  infrastructure interne. Une pull request non fusionnée d''un seul contributeur rapporte
  un plancher de TTFT de ~1.4 s en contexte de serving, dû à la valeur par défaut
  de 100 du moteur. Ma recommandation : lisez-le comme du code de référence tant qu''aucun
  serveur n''est livré.'
sources:
- label: DeepSeek, DeepInfer README.md
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md
  date: 20-10-2026
- label: DeepSeek, DeepSeek V4.1 Flash Inference Deployment Q&A
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/doc/inference_deployment_qa.md
  date: 20-10-2026
- label: DeepSeek, deepinfer/environ.py in deepseek-ai/DeepInfer
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/environ.py
  date: 20-10-2026
- label: SiliconANGLE (Duncan Riley), DeepSeek open-sources DeepInfer, the inference
    framework behind its production services
  url: https://siliconangle.com/2026/10/20/deepseek-open-sources-deepinfer-the-inference-framework-behind-its-production-services/
  date: 20-10-2026
- label: The Next Web, DeepSeek open-sources DeepInfer, the engine that runs its AI
    models
  url: https://thenextweb.com/news/deepseek-deepinfer-open-source-inference-engine
  date: 20-10-2026
- label: GitHub pull request 147 on deepseek-ai/DeepInfer (open, unmerged), Add a
    minimal OpenAI-compatible chat server over the offline engine
  url: https://github.com/deepseek-ai/DeepInfer/pull/147
  date: 21-10-2026
contentHash: sha256:f6af29a2d3e3c536
publishState: published
---

## Ce qui change

DeepSeek a publié DeepInfer sous Apache License 2.0 le 20 octobre 2026 [s1][s5]. Le README le présente comme un moteur d'inférence hors ligne pour DeepSeek-V4.1-Flash, sur GPU NVIDIA SM100 ou NPU Huawei Ascend 950, et précise que DeepInfer a été construit à l'origine en grande partie sur vLLM [s1].

## Ce qui est livré, ce qui manque

Je pense que la ligne à lire est la liste du README de ce que cette version laisse de côté. Côté parallélisme : Attention DP / balanced CP et MoE EP + EPLB [s1]. La Q&A de DeepSeek prévoit de conserver le cache KV plus de 72 heures pour éviter de recalculer le prefill en cas de hit [s2].

> [!CONFIRMED]
> Le README range un système de cache KV, la désagrégation VE/Prefill/Decode et la répartition de charge entre répliques data-parallel parmi ce qui n'est pas inclus dans cette version [s1], et la Q&A de DeepSeek indique que ses composants de gestion du cache KV et de répartition de charge sont étroitement couplés à son infrastructure interne, si bien que ce code n'est pas encore entièrement open source [s2].

> [!INFERRED]
> Selon ma lecture, la réutilisation du cache que décrit DeepSeek repose sur le cache KV absent de cette version : on peut lire les kernels et le scheduler, sans pouvoir reconstruire le service de DeepSeek à partir de ce dépôt.

## Là où un serveur cale

Le moteur fixe cette valeur par défaut dans `deepinfer/environ.py` [s3] :

```python
DEEPINFER_PREFILL_ANY_ATTEMPT_INTERVAL = EnvVar.int(default=100)
```

Une pull request ouverte et non fusionnée d'un seul contributeur, qui ajoute un serveur de chat compatible OpenAI au moteur hors ligne, rapporte qu'avec la valeur par défaut de 100, un rang dont les pairs sont inactifs n'admet un prompt en attente que toutes les 100 étapes de décodage, soit un plancher de TTFT de ~1.4 s sur chaque requête en contexte de serving [s6]. J'y vois la mesure d'une seule personne, à vérifier chez vous.

## L'objection la plus solide

Les kernels et le scheduler sont la partie difficile, et les ouvrir a une vraie valeur pour qui construit un moteur. J'en conviens, et c'est pourquoi je parle de code de référence : les kernels méritent l'étude dès aujourd'hui, et la couche de serving reste à votre charge.

## Impact pour une équipe

Ma recommandation : traitez DeepInfer comme du code de référence tant qu'aucun serveur ni système de cache KV n'arrive dans le dépôt. SiliconANGLE note que Hopper et les autres architectures Nvidia plus anciennes ne figurent pas sur la liste [s4]. Sur SM100, il vous reste à construire le système de cache KV et la répartition de charge data-parallel, et à finir la désagrégation, dont la plupart des fonctions moteur requises existent déjà [s1]. Si vous l'intégrez dans un serveur, mesurez le TTFT sur votre trafic avant de garder la valeur par défaut de 100 [s3][s6]. The Next Web, citant Saritha Rai de Bloomberg, écrit qu'aucun benchmark indépendant des gains de DeepInfer n'existe encore [s5].

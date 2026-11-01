---
translationKey: nemotron-3-5-transcribe-headline-wer-versus-deepinfra-row
lang: fr
slug: nemotron-3-5-transcribe-wer-du-classement-contre-ligne-deepinfra
title: Artificial Analysis classe Nemotron 3.5 Transcribe à 2.8% d'AA-WER, et affiche
  son déploiement chez DeepInfra à 3.4%
publishDate: 01-11-2026
kind: benchmark
tags:
- NVIDIA
- Nemotron
- Artificial Analysis
- speech-to-text
summary: 'NVIDIA a publié Nemotron 3.5 Transcribe le 28 octobre 2026 sous licence
  OpenMDW-1.1, et se dit premier ex aequo parmi les modèles à poids ouverts avec 2.8%
  d''AA-WER. Artificial Analysis le classe à 2.8% d''AA-WER, et le tableau de la même
  page affiche son déploiement chez DeepInfra à 3.4%. Selon Cekura, Artificial Analysis
  n''explique pas pourquoi, et l''hébergement change les scores. Ma recommandation
  : l''utiliser pour transcrire des enregistrements par lots, mesurer votre propre
  audio sur l''endpoint que vous appellerez avant de budgéter sur 2.8%, et garder
  un modèle de streaming pour les appels en direct.'
sources:
- label: 'NVIDIA Research, NVIDIA Nemotron 3.5 Transcribe: Intelligent Transcription
    with a Speech LLM'
  url: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Transcribe/
  date: 28-10-2026
- label: 'NVIDIA on Hugging Face, NVIDIA Nemotron 3.5 Transcribe and Granary v2: Intelligent
    Multilingual Transcription You Can Prompt and Adapt'
  url: https://huggingface.co/blog/nvidia/nemotron-transcribe-granary
  date: 28-10-2026
- label: Artificial Analysis, Speech to Text leaderboard
  url: https://artificialanalysis.ai/speech-to-text
  date: 28-10-2026
- label: 'Cekura, Nemotron 3.5 Transcribe: Specs, Accuracy, Languages, Setup'
  url: https://www.cekura.ai/blogs/nemotron-3-5-transcribe
  date: 29-10-2026
contentHash: sha256:cfa52e525b7af6e9
publishState: published
---

## Ce qui change

NVIDIA Research a publié Nemotron 3.5 Transcribe le 28 octobre 2026, sous licence OpenMDW-1.1, avec des checkpoints BF16, FP8 et NVFP4 de NVIDIA-Nemotron-3.5-Transcribe-30B-A4B [s1]. Selon NVIDIA, le modèle est premier ex aequo parmi les modèles à poids ouverts avec 2.8% d'AA-WER, pour environ 4B paramètres actifs contre 24B pour le modèle qu'il égale [s2]. Artificial Analysis le classe à 2.8% d'AA-WER parmi les modèles à poids ouverts, et le tableau du classement, sur la même page, affiche son déploiement chez DeepInfra à 3.4% de taux d'erreur [s3].

## L'hébergeur fait partie du score

À mon avis, le chiffre sur lequel dimensionner un pipeline de transcription est celui mesuré sur l'endpoint que vous appellerez. Selon Cekura, la ligne du classement mesure le déploiement DeepInfra et affiche 3.4%, et Artificial Analysis n'explique pas pourquoi [s4]. Cekura ajoute que l'hébergement change les scores, en lisant le même tableau [s4] :

| Modèle | Quel chiffre | WER | Selon |
| :--- | :--- | ---: | :--- |
| Nemotron 3.5 Transcribe | classement AA-WER | 2.8% | Artificial Analysis [s3] |
| Nemotron 3.5 Transcribe | ligne DeepInfra | 3.4% | Artificial Analysis [s3] |
| Whisper Large v3 | ligne fal.ai | 4.1% | Cekura [s4] |
| Whisper Large v3 | ligne Replicate | 10.1% | Cekura [s4] |

À ma lecture, les lignes Whisper font office de précédent : un même modèle, deux hébergeurs, deux scores très éloignés, et le 2.8% ne dit rien de l'hébergeur sur lequel votre trafic atterrira.

## Le chiffre sur lequel bâtir un budget

L'objection la plus solide : le 2.8% est lui aussi une mesure d'Artificial Analysis, donc les poids peuvent l'atteindre. Je suis d'accord. C'est pourquoi je lis 2.8% comme ce dont le modèle est capable, et 3.4% comme ce qu'un déploiement hébergé a livré. NVIDIA conseille de servir le checkpoint disponible avec vLLM, ou de passer par un endpoint hébergé chez Baseten, DeepInfra ou Simplismart [s2]. À mon sens, chacun est un déploiement distinct à mesurer, et je ne tiendrais le 2.8% pour acquis sur aucun d'eux.

## Impact pour une équipe

Si vous transcrivez des enregistrements par lots, ma recommandation : retenez Nemotron 3.5 Transcribe, puis mesurez un échantillon de votre propre audio sur l'endpoint exact que vous achèterez, avant de bâtir un budget sur 2.8%. Artificial Analysis affiche le déploiement DeepInfra à 2.00 USD le millier de minutes [s3], et je pense donc que ce test coûte peu face à un contrat dimensionné sur un chiffre que votre endpoint n'atteint pas. Pour les appels en direct, je garderais votre modèle de streaming actuel : NVIDIA indique que Transcribe est conçu pour l'audio enregistré [s2], et le 1.8% qu'il annonce sur AA-AgentTalk, le jeu de parole d'agents vocaux, ne change rien à ce périmètre.

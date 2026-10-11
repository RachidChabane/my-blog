---
translationKey: embeddinggemma-2-128d-truncation-costs-multimodal-quality
lang: fr
slug: embeddinggemma-2-troncature-128d-qualite-multimodale
title: EmbeddingGemma 2 réunit texte, images, vidéo et audio dans un même espace,
  et son réglage à 128 dimensions fait chuter le score multimodal MMEB de 59.01 à
  45.65
publishDate: 11-10-2026
kind: release
tags:
- Google
- EmbeddingGemma
- rag
- retrieval
summary: 'Google a publié EmbeddingGemma 2 le 6 octobre 2026 : un modèle d''embeddings
  ouvert, sous Apache 2.0, qui place texte, images, vidéo et audio dans un même espace
  de 768 dimensions, tronquable à 512, 256 ou 128. Le tableau de sa propre fiche fait
  chuter MMEB (v2) Overall de 59.01 à 45.65 à 128d, et la fiche réserve surtout 128d
  aux charges de travail purement textuelles. Je partirais de 256d si des médias peuvent
  un jour entrer dans l''index, et je fixerais bfloat16 ou float32, car float16 échoue
  sans erreur.'
sources:
- label: 'Google, "EmbeddingGemma 2: an open, lightweight multimodal embedding model"'
  url: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/
  date: 06-10-2026
- label: Google AI for Developers, "EmbeddingGemma 2 model card"
  url: https://ai.google.dev/gemma/docs/embeddinggemma/model_card_2
  date: 06-10-2026
- label: BrainDetox, "What to Check When Choosing an On-Device Multimodal Embedder
    - EmbeddingGemma 2 Configurations, Truncation, and Input Limits"
  url: https://braindetox.kr/en/posts/embeddinggemma_2_multimodal_embedding_on_device_2026.html
  date: 07-10-2026
contentHash: sha256:f17a09d50a44dfe9
publishState: published
---

## Ce qui change

Le 6 octobre 2026, Google a publié EmbeddingGemma 2, un modèle d'embeddings ouvert (Apache 2.0, 740 millions de paramètres, architecture Gemma 4) [s1]. D'après sa fiche de modèle, il réunit texte, images, vidéo et audio dans un même espace d'embeddings de 768 dimensions [s2]. Le Matryoshka Representation Learning permet de tronquer les vecteurs de sortie de 768 à 512, 256 ou 128 dimensions [s1].

## Le facteur 6 vaut pour le texte

Je pense que la promesse de stockage de la fiche et son propre tableau tirent en sens inverse. La fiche de Google promet « up to a 6x reduction in vector storage costs with minimal impact on quality » [s2]. BrainDetox lit ce facteur 6 comme le rapport entre 768 et 128, soit la ligne 1:6 du tableau de troncature de la fiche [s2][s3]. Le tableau suivant reprend quatre des sept colonnes de benchmark de la fiche [s2] :

| Dimension | Compression | MTEB (eng, v2) | MTEB (code, v1) | MMEB (v2) Overall | MSEB (Retrieval) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 768d | 1:1 | 68.46 | 78.68 | 59.01 | 69.54 |
| 512d | 1:1.5 | 68.41 | 77.24 | 58.38 | 69.18 |
| 256d | 1:3 | 67.78 | 76.18 | 56.24 | 66.76 |
| 128d | 1:6 | 65.68 | 71.41 | 45.65 | 56.71 |

Or la fiche ne situe un impact minimal sur la qualité que jusqu'à 256d, et note que 128d dégrade nettement la qualité multimodale [s2].

La fiche impose aussi que requêtes et documents partagent la même dimension [s2]. J'en fais donc un choix qui engage tout l'index dès l'ingestion : tronquez à 128d pour une recherche textuelle bon marché, et chaque future requête image, vidéo ou audio sera comparée à 128d.

Le meilleur argument pour 128d : sur un corpus qui reste textuel, MTEB (eng, v2) conserve 65.68 sur 68.46 avec une compression de 1:6 [s2]. J'en conviens, et la fiche aussi, qui réserve surtout 128d aux charges de travail purement textuelles [s2]. Mon objection est plus étroite. On choisit ce modèle pour son espace partagé, et c'est sur un index aux modalités encore incertaines que 128d coûte le plus.

## Fixer le choix dans le code

Les extraits de code de la fiche fixent les deux choix [s2] :

```python
from sentence_transformers import SentenceTransformer

dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float32
model = SentenceTransformer("google/embeddinggemma-2", model_kwargs={"torch_dtype": dtype})

query_emb = model.encode(
    query,
    truncate_dim=256,
    normalize_embeddings=True,
)
```

Passer `truncate_dim` et `normalize_embeddings` à `model.encode()` tronque et normalise en L2 à votre place, normalisation que la fiche exige avant toute similarité cosinus [s2]. J'ai remplacé le 128 de l'exemple par 256 ; gardez la même valeur pour documents et requêtes.

> [!IMPORTANT]
> La fiche impose l'inférence en bfloat16 ou float32 : en float16, le modèle renvoie des NaN ou des embeddings silencieusement dégradés, sans lever d'erreur [s2].

## Impact pour une équipe

Je pense que, pour qui dimensionne un index sur EmbeddingGemma 2, tout se joue sur la dimension, avant d'écrire le moindre vecteur. Ma recommandation : si des images, de la vidéo ou de l'audio peuvent un jour entrer dans l'index, partez sur 256d, où la fiche juge l'impact sur la qualité minimal, et acceptez une compression de 1:3 au lieu de 1:6 [s2]. Réservez 128d à un index qui restera textuel, validé sur votre propre charge de travail comme le demande la fiche [s2]. Fixez le dtype avant l'ingestion : je ne compterais pas sur une assertion contre les NaN pour repérer des embeddings dégradés.

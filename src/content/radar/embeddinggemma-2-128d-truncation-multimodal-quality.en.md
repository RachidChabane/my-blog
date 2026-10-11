---
translationKey: embeddinggemma-2-128d-truncation-costs-multimodal-quality
lang: en
slug: embeddinggemma-2-128d-truncation-multimodal-quality
title: EmbeddingGemma 2 puts text, images, video and audio in one space, and its 128-dimension
  setting drops the MMEB multimodal score from 59.01 to 45.65
publishDate: 11-10-2026
kind: release
tags:
- Google
- EmbeddingGemma
- rag
- retrieval
summary: 'Google released EmbeddingGemma 2 on October 6, 2026: an open, Apache 2.0
  embedding model that puts text, images, video and audio in one 768-dimensional space,
  truncatable to 512, 256 or 128 dimensions. The model card''s own table drops MMEB
  (v2) Overall from 59.01 to 45.65 at 128d, and the card says 128d is best suited
  to text-only workloads. I would start at 256d if media may ever enter the index,
  and pin bfloat16 or float32, because float16 fails without an error.'
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
contentHash: sha256:cc501c09bc9c3502
publishState: published
---

## What changed

On October 6, 2026, Google released EmbeddingGemma 2, an open embedding model (Apache 2.0, 740 million parameters, Gemma 4 architecture) [s1]. Its model card says it unifies text, images, video and audio in a single shared 768-dimensional embedding space [s2]. Matryoshka Representation Learning lets developers truncate the output vectors from 768 dimensions down to 512, 256 or 128 [s1].

## The 6x figure belongs to text

I think the card's headline storage claim and its own table pull in opposite directions. Google's card promises "up to a 6x reduction in vector storage costs with minimal impact on quality" [s2]. BrainDetox reads that 6x as the 768-to-128 ratio, the 1:6 row of the card's truncation table [s2][s3]. The table below keeps four of the card's seven benchmark columns [s2]:

| Dimension | Compression | MTEB (eng, v2) | MTEB (code, v1) | MMEB (v2) Overall | MSEB (Retrieval) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 768d | 1:1 | 68.46 | 78.68 | 59.01 | 69.54 |
| 512d | 1:1.5 | 68.41 | 77.24 | 58.38 | 69.18 |
| 256d | 1:3 | 67.78 | 76.18 | 56.24 | 66.76 |
| 128d | 1:6 | 65.68 | 71.41 | 45.65 | 56.71 |

Yet the card puts minimal quality impact only down to 256d, and says 128d degrades multimodal quality substantially [s2].

The card also says queries and documents must share a dimension [s2]. So I treat the dimension as an index-wide choice made at ingestion: truncate to 128d for cheap text search, and every future image, video or audio query is scored at 128d too.

The strongest case for 128d: on a corpus that stays text, MTEB (eng, v2) keeps 65.68 of 68.46 at 1:6 compression [s2]. I agree, and so does the card, which calls 128d best suited to text-only workloads [s2]. My objection is narrower. The shared space is why you pick this model, and an index whose modality mix is still open is where 128d costs the most.

## Pinning it in code

The card's code snippets pin both choices [s2]:

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

Passing `truncate_dim` and `normalize_embeddings` to `model.encode()` truncates and L2-normalizes for you, and the card requires that normalization before cosine similarity [s2]. I changed the card's example from 128 to 256; use one value for documents and queries.

> [!IMPORTANT]
> The card says to run inference in bfloat16 or float32: in float16 the model returns NaN or silently degraded embeddings rather than raising an error [s2].

## Impact on your team

I think the decision for a team sizing an index on EmbeddingGemma 2 is the dimension, taken before any vector is written. My call: if images, video or audio may ever enter the index, start at 256d, where the card puts the quality impact as minimal, and accept 1:3 compression instead of 1:6 [s2]. Keep 128d for an index you know stays text, validated on your own workload as the card asks [s2]. Pin the dtype before ingestion: I would not count on a NaN assertion to catch degraded embeddings.

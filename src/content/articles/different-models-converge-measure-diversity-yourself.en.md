---
translationKey: llm-output-homogeneity-across-models-defeats-model-swapping-for-diversity
lang: en
slug: different-models-converge-measure-diversity-yourself
title: Different models converge, so measure diversity yourself
publishDate: 15-10-2026
tags:
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: 'Rusia et al., Design Creativity Bench: Measuring creativity in LLM-Generated
    UI (arXiv 2610.11539)'
  url: https://arxiv.org/abs/2610.11539
  date: 08-10-2026
- label: 'Jiang et al., Artificial Hivemind: The Open-Ended Homogeneity of Language
    Models (arXiv 2510.22954)'
  url: https://arxiv.org/abs/2510.22954
  date: 27-10-2025
contentHash: sha256:531ff662101d7fda
publishState: published
---


I think a second model is a weak diversity knob: different models converge on similar output, and the acceptance-criteria eval that passes it cannot see the sameness. On UI, Kombai's Design Creativity Bench scores originality at 0.592 for design pairs from different models on the same prompt, against 0.764 for human-model pairs [s3], while appropriateness stays above 90% for every model it tested [s5]. On open-ended text, the Artificial Hivemind authors measure a mean similarity of 71% to 82% between responses from different models [s20]. These figures leave the gain from a second model unmeasured, and I think both say the pool stays closer to itself than you would assume.

## Two studies that measure different things

The evidence is two papers that never share an instrument, and that is exactly why I trust the direction more than either number. One looks at interfaces, the other at prose, and only one of them has a human reference. When two setups that different lean the same way, the lean is worth taking seriously.

Design Creativity Bench comes from Aman Rusia and three co-authors [s1], and its first version went up on 8 October 2026 [s11]. The Design Creativity Bench authors built it as a benchmark for diversity and appropriateness in UI designs [s2]. All of them work at Kombai, a company that builds AI products for UI design and front-end development, and the paper states that affiliation itself [s19]. So this is a vendor's benchmark on the vendor's own ground, and I read its direction with more confidence than its decimals.

Artificial Hivemind comes from Liwei Jiang and nine co-authors [s6]. The Hivemind paper is a large-scale study of mode collapse in open-ended generation, and it names two effects: repetition inside a single model, and homogeneity across models, where different models produce strikingly similar outputs [s7].

| Dimension | Design Creativity Bench | Artificial Hivemind |
| :--- | :--- | :--- |
| Output | UI designs [s2] | answers to open-ended queries [s7] |
| Swap-the-model measure | originality, dissimilarity between models on one prompt [s12] | similarity between responses from different models [s20] |
| Change-the-prompt measure | creative range, same model, brief moved to another product domain [s13] | similarity across paraphrased prompts [s23] |
| Sampling | provider defaults, uncontrolled [s16] | top-p 0.9, temperature 1.0; min-p tested [s25] [s22] |

Different instruments, one direction.

## The second model lands in the same neighbourhood

Design Creativity Bench's originality score measures exactly the lever a team pulls when it swaps models: differences between models on the same prompt, reported as the mean dissimilarity of those design pairs [s12]. Design Creativity Bench's results section compresses the finding into one heading, which says that model-generated designs resemble one another more than they resemble the human reference [s15]. That is the swap-the-model knob, measured directly, and it reads low.

The text study draws the same shape with a different pen. In the Hivemind paper, 25 models each answered the prompt "Write a metaphor about time", and their answers fell into just two prominent clusters, a dominant one around "time is a river" and a smaller one around "time is a weaver" [s21]. Hivemind's cross-model similarity band from the opening [s20] is a separate analysis, and I read it as the aggregate version of that picture.

Models from different labs are trained on different data with different recipes, so pooling them should widen the distribution, and a single model sampled many times should be the narrower option. Neither study measures what a second model adds over one. I concede that, and a second point with it: a similarity band that tops out below identity means a second model does move the output somewhat. That much is my own reading of the band.

What the evidence does say is where the movement goes. The Hivemind authors explain the cross-model effect directly: different models converge on similar ideas with minor variations in phrasing, so model ensembles may not yield true diversity when their members share overlapping alignment and training priors [s8]. Jiang and colleagues add that models often converge toward highly similar answers, which undermines the assumed benefits of multi-model distillation and matters for research on synthetic data curation [s10]. The Hivemind authors also warn that practitioners risk overestimating cross-model diversity [s24].

> [!CONFIRMED]
> Kombai's benchmark finds that model-generated designs resemble one another more than they resemble the human reference [s15], with originality at 0.592 between models against 0.764 between a model and a human [s3].

> [!INFERRED]
> My reading: on UI, a second model moves you around inside the same neighbourhood. It does not move you to where a human designer would land.

## Turning up the temperature, or rewording the brief

The two other knobs teams reach for fail the same test, but the papers test them differently: temperature only on text, prompt changes on both, each with its own instrument.

On text, Hivemind ran its models at top-p 0.9 and temperature 1.0, already a high-stochasticity setting, and responses from the same model still exceeded 0.8 average similarity in 79% of cases [s25]. The Hivemind authors argue that higher temperatures tend to produce incoherent text, so even maximally aggressive sampling still fails to produce diverse responses to open-ended queries [s9]. That is their extrapolation from the setting they ran, and I find it persuasive without treating it as measured.

Min-p decoding, which exists to buy diversity, does not escape either. In Hivemind's runs it reduces extreme repetition, yet 81% of response pairs still exceed 0.7 similarity and 61.2% exceed 0.8 [s22]. The sampler trims the worst duplicates and leaves the mode in place.

Rewording the prompt barely registers on text either. Across 42 models in Hivemind's paraphrase test, similarity within one prompt averaged 0.821 and similarity across paraphrases 0.781, a gap the authors put at only 0.04 [s23].

On UI, the matching lever is moving the brief to another product domain, and Design Creativity Bench measures exactly that: for creative range, the model is fixed and the prompt changes only in product domain and sample content [s13]. Kombai's benchmark puts creative range at 0.581 across models, against 0.902 for human designs [s4]. Design Creativity Bench's own results heading puts it bluntly: differentiating the prompt does not differentiate the design [s13].

Design Creativity Bench does not control temperature at all, and it calls hosted APIs with their default temperature and sampling [s16]. So the temperature evidence is text-only, and I would not carry it over to layouts without measuring it on layouts.

## Why the eval stays green

I think nobody notices the sameness because the metric teams already gate on is the one that passes.

In Design Creativity Bench, appropriateness is the share of a brief's acceptance criteria that a design satisfies [s14]. It sits above 90% for every model in its test set, Kombai's benchmark reports, with the best model at 99.2% against 98.0% for human designs [s5]. In my experience, a test suite made of acceptance criteria is that same instrument under another name: does the page have a hero, a pricing table, a call to action, the right copy length.

> [!WARNING]
> The passing clone: an output that meets every acceptance criterion and repeats its siblings. A criteria-only eval scores a batch of them as a full pass, because no criterion compares one output with another.

Every acceptance criterion is a property of one output. Distinctness is a property of the set, so a per-output check cannot see it, however many criteria you add. Correctness was never the question.

## What I gate on instead

For every batch I would pool (several models, several samples, one brief), I embed the outputs, compute the mean pairwise similarity, and compare it with a reference batch for the same brief: human work when I have it, or a varied set I picked by hand. The gate fails when the generated batch is more alike than the reference plus a tolerance I set from my own data. Only after that does a second model, a temperature change or a diversity instruction earn its place, because the metric decides whether it moved anything.

```python
# one brief, every output you plan to pool
vecs = embed(outputs)
batch_sim = mean_pairwise_cosine(vecs)
# a reference batch for the same brief: human work, or a varied set you picked by hand
ref_sim = mean_pairwise_cosine(embed(reference_outputs))
# the tolerance lives in config and comes from your own data
if batch_sim > ref_sim + cfg.diversity_tolerance:
    fail("batch is more alike than the reference")
```

The reference batch is the part teams skip, and it is the part that makes the number mean something. Without it, a mean similarity is just a figure with no scale; with it, the gate asks a question a reviewer would recognise.

> [!NOTE]
> What Kombai's benchmark did not test: Design Creativity Bench attempted no diversity-seeking prompting [s17], and it generated every design in a fresh context, never a second design with the first still visible [s18]. Those are the two remedies I would try first, which is exactly why they go through the gate above.

The case that worries me most is synthetic data. A pipeline that pools several models to diversify a training set is the most exposed when its filters are only appropriateness filters, checking each sample against criteria and never against its neighbours. The Hivemind authors name synthetic data curation as a research implication of the homogeneity they measured [s10]; the production version of that risk is my extension.

My bet is that the axis of variation has to be written into the brief and then measured, because the evidence so far shows the model, the sampler and the wording each move less than teams assume. Write the axis down. Then let the number decide.

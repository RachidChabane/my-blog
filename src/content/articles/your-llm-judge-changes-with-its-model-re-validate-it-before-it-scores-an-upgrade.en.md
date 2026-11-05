---
translationKey: llm-findings-expire-across-model-generations
lang: en
slug: your-llm-judge-changes-with-its-model-re-validate-it-before-it-scores-an-upgrade
title: Your LLM judge changes with its model, so re-validate it before it scores an
  upgrade
publishDate: 05-11-2026
tags:
- evaluation
category: essays
difficulty: 3
sources:
- label: 'Queen and Zou (Stanford University), The shelf life of LLM findings (scope:
    50 claims)'
  url: https://zou-group.github.io/llm-claims-shelf-life/
  date: 02-11-2026
- label: Singh, Xu, Zhou, Zhou, Hakkani-Tur and Joty, On the Shelf Life of Fine-Tuned
    LLM-Judges (arXiv 2509.23542) (future-proofing is hard, backward compatibility
    is easy)
  url: https://arxiv.org/abs/2509.23542
  date: 28-09-2025
- label: Trisovic, The Shrinking Lifespan of LLMs in Science (arXiv 2604.07530) (lifespan
    shrinks with each release year)
  url: https://arxiv.org/abs/2604.07530
  date: 08-04-2026
- label: Stephen Turner, Paired Ends, The Shelf Life of LLM findings (commentary)
    (OpenScholar claims benchmarked against GPT-4o)
  url: https://blog.stephenturner.us/p/llm-claims-shelf-life
  date: 03-11-2026
contentHash: sha256:fd65a1ab12a3467b
publishState: published
---


I think a team upgrading the model it ships should re-validate its LLM judge before trusting any re-test that judge scores, because the judge is dated by its model too. LLM claims age fast: within 15 months of publication, most of the claims one re-test examined either no longer held or showed substantially diminished effects [s2], with 16% expired within a year and 39% within two [s3]. That re-test is by Queen and Zou of Stanford University [s16]; two papers, by Singh and co-authors [s31] and by Trisovic [s33], come in later. The Stanford page already draws the general lesson, calling a finding an observation about particular models at a particular time and asking papers to report the model, version and date with each result [s25]. What expired is mostly capability failures that newer models no longer make [s4], while structural limits are weaker but still exist [s5]. I think the same holds for the judge that scores those results.

## Which model judges sets the bias

I think the judge is the part of an eval stack that is easiest to leave unversioned. The Stanford page gives judges no special standing: only three of ten claims about models as judges, reviewers and raters persist or strengthen [s6]. Most of them did not. What did persist is mostly preferences and judgment, among them judges that favor their own answers [s17]. The page notes that claims about what models prefer have lasted longer [s34], and it offers a reason: these are tendencies with no single right answer on a test, so they may be harder for model developers to notice and to train away [s26]. That is the property that makes a judge useful and hard to audit.

Self-preference in LLM judges is one of the three strengthened findings, with praise that follows the user's stated preference and nonuniform random-number generation; their fitted effects are about 2.36, 1.85 and 1.70 times their reference magnitudes, respectively [s18]. The page's reference for self-preference is small, a 4.6-percentage-point difference between GPT-4's preference for its own summaries and GPT-3.5's preference for those same summaries [s35].

The per-model values split by judge:

| Judge effect (the page's per-model values) | Claude Sonnet 5.5 | GPT-6.1 Sol |
| :--- | ---: | ---: |
| Self-preference [s19] | e = 1.09 | e = 2.88 |
| Preference for longer answers [s20] | e = 1.12 | e = 0.09 |

The Stanford page reports Sonnet's self-preference close to the paper's magnitude and Sol's larger [s19]. The same page reports the length preference running the other way: Sonnet retains it, while Sol's point estimate sits near the expiration value [s20]. The page says each dot on its fitted-effect plot is a release-date trend fitted across 9 to 20 panel models per claim and evaluated at September 30, 2026, and no measurement on a single recent model [s36].

In my reading, swapping the judge model swaps which bias the scores carry. Pick Sol and you buy a stronger taste for its own answers; pick Sonnet and you keep a taste for length. Neither choice is neutral, and a report naming only the generator never records which was made. A re-test scored by a judge I have not validated measures the generator and the judge together, and the score alone cannot tell me which one moved.

## The fine-tuned judge ages too

Fine-tuning a judge looks like the way out, and I think it moves the problem to the next generator. The case for it is real: fine-tuning judges with judge-specific data has become an often preferred choice over prompting frontier models as judges, in part for being more robust to common biases [s27]. On paper, that fixes the problem of the previous section.

Singh and co-authors then ask how such judges perform on responses by future models or past models, and how well they generalize to questions they never saw [s28]. A generator upgrade is the future-model case. Their experiments suggest future-proofing is challenging for most models, while backward-compatibility is relatively easy [s11]. All models also lose some performance on unseen questions [s12]. The authors frame the work as practical considerations for deploying judges against ever-changing generators [s29].

> [!CONFIRMED]
> The Stanford page lists self-preference in LLM judges among its three strengthened findings [s18], and Singh and co-authors report that experiments suggest future-proofing is challenging for most fine-tuned judges, while backward-compatibility is relatively easy [s11].

> [!INFERRED]
> In my reading, both routes leave me with a changed instrument after a generator upgrade: a new judge model brings its own bias profile, and a judge fine-tuned on older outputs faces the very case the paper finds hard. Neither lets me skip re-validating the judge.

## A self-graded upgrade

Here is the failure I would plan for first. The page counts judges that favor their own answers among what persisted [s17], and the table shows that its size depends on the judge model.

> [!WARNING]
> If the new generator also serves as the new judge, a self-preference effect like the one the page reports for Sol would push up the score of the very upgrade it is meant to check. I would treat any re-test scored that way as unmeasured until a second judge or a human sample confirms it.

The direction of that bias is the problem. A noisy judge widens the error bars; a self-preferring judge moves the estimate toward shipping.

## The panel verdict and the model I ship

The same page also argues against trusting its own averages for one model. It says that a claim's panel-wide verdict can differ from what you see on one model [s21]. Its own example: the page classifies citation fabrication as expired overall, yet reports that Qwen3.7-Flash fabricated 69% of references in its test, against about 1% for Sonnet 5.5 and 0% for Sol [s22]. A guardrail retires on my model's measurement, and on no panel verdict.

Nor does the calendar settle it. The page says release date alone does not set the pattern; among models released from July to September 2026, it reports expired counts from 11 for DeepSeek V4 Pro to 30 for GPT-6.1 Sol [s23]. The panel also ran under each provider's default API configuration [s24]. If my production prompts and settings differ from those defaults, the panel never measured my configuration.

The judge also sits inside a faster cycle of model turnover. Trisovic associates each successive release year with a 27% shorter time-to-peak and a 23% shorter lifespan [s13], and finds that release year predicts both more strongly than architecture, openness or scale [s32]. The paper suggests that specialization on any single model may be a depreciating investment, with costs falling on reproducibility and migration [s14]. A commentary post on the Stanford page gives a concrete case: claims that OpenScholar beat a frontier model on citation hallucinations were benchmarked against the long-dead GPT-4o [s15]. An eval judge is that kind of specialization, and I think it depreciates with the generators it scores.

## The strongest case against re-validating

The case against all this is strong, and most of it comes from the sources themselves. The method checks out: of 48 claims in the reproduction check, 43 reproduce within tolerance and 5 show stronger effects [s7]. The aggregate estimates have wide confidence intervals because the study includes only 50 claims [s8], and the page's self-preference multiple sits on a small 4.6-percentage-point reference [s35]. Singh and co-authors find that continual learning gives a more balanced adaptation to shifts between older and newer response distributions [s30]. Re-testing also got cheap: coding agents let the Stanford authors test many more claims in much less time [s10].

I concede a scope point too: the page compares two judge models side by side, and it never follows one judge across an upgrade.

Each objection lands, and none of them removes the check. A judge that needs continual learning to keep up has its own release cycle, which is my point: it becomes one more component to version. I concede the size of the multiple. The checklist guards against its direction, and direction is what corrupts an upgrade decision. Wide intervals on a small panel argue for measuring my own pair of models. The scope point argues the same way, since only my own check covers my next generator. Cheap re-tests make that check affordable.

## What I would run

What I would run at the next upgrade fits in four steps. The Stanford page asks papers to ship their exact provenance, prompts and analysis code included, so the claims can be repeated on future LLMs [s9]. Its own re-test covered 50 claims, from sycophancy and jailbreaks to long-context capabilities and cultural biases [s1]. An eval suite owes its judge the same provenance.

1. Pin the judge model and version.
2. Store each eval result with both the generator and the judge that scored it.
3. Before the judge scores the upgrade, check it against a small human-labelled sample of the new generator's outputs.
4. Retire a capability-failure guardrail only after measuring that failure on the model I ship.

The record behind step two is short:

```yaml
result:
  generator: { model: "shipped-model-id", version: "pinned-version" }
  judge: { model: "judge-model-id", version: "pinned-version" }
  scored_on: "date of the run"
  judge_check: "agreement with the human-labelled sample of this generator"
```

Step three is the one that can prove me wrong. If the human-labelled sample agrees with the new judge as well as it agreed with the old one, I keep the judge, and the check cost me one labelling pass. If it agrees less, part of the upgrade's score belonged to the judge, and I would have shipped on it. What this changes: at upgrade time, the judge goes on the change list beside the generator.

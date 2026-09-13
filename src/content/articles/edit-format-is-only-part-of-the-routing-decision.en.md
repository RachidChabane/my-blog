---
translationKey: edit-unit-size-beside-edit-format
lang: en
slug: edit-format-is-only-part-of-the-routing-decision
title: Edit format is only part of the routing decision for a coding model
publishDate: 13-09-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Diffs vs. Whole Files study, headline result
  url: https://arxiv.org/abs/2609.05779
  date: 05-09-2026
- label: Aider unified diffs benchmark, GPT-4 Turbo scores
  url: https://aider.chat/2023/12/21/unified-diffs.html
  date: 21-12-2023
- label: Aider edit formats documentation, per-model formats
  url: https://aider.chat/docs/more/edit-formats.html
  date: 13-09-2026
contentHash: sha256:e1d0e4d4d66125a1
publishState: published
---


Diffs versus whole files is an incomplete way to decide how a coding model should edit: I think the size of the edit unit belongs in that decision beside the format. Two results seem to disagree. A new study finds that direct generation substantially outperforms diff-based generation on every metric it measures [s1]. Aider's benchmark shows a new unified diff edit format lifting GPT-4 Turbo from 20 to 61 percent [s4]. They only look opposed: Aider's move was from one edit format to another, neither of them whole-file.

## Two results that only look opposed

The tempting reading is a scoreboard, with a controlled study on one side and a tool vendor on the other. I think that reading is the mistake, since the two sources never compared the same thing. The study sets two output regimes against each other, direct generation and diff-based generation, and direct generation wins on every metric it measures [s1].

Aider changed something else. With the same model, it replaced its SEARCH/REPLACE block edit format, which scored 20 percent as a baseline, with a unified diff edit format that reached 61 percent [s4]. Nobody in that benchmark went back to whole files.

So one result is about whether the model writes the file or writes edits, and the other is about how those edits are spelled on the wire. Those are different axes. Put them on one line and they collide. Put them on two and a third question appears that neither source answers: how much code a single edit should cover.

I suspect the collision persists for a tooling reason. When a tool exposes one setting for this and calls it the format, that setting absorbs every effect that happens to travel with it. If a format change also changes how much code the model rewrites per edit, the format gets the credit.

## What the small-model study measured

The study's scope matters more than its headline, so I keep it attached to every sentence about it. It trains a 100M-parameter model from scratch and a fine-tuned Qwen2.5-Coder-0.5B, each in both regimes, on a shared Flutter/Dart dataset [s3]. Across that setup, direct generation substantially outperforms diff-based generation on every metric measured, and the gap persists after controlling for task difficulty [s1]. That is a clean result at that scale, and I would not argue with it.

The detail I care about sits one sentence further into the abstract.

> [!CONFIRMED]
> Diff-based generation stays competitive on short, spatially localized edits, and its category wins sit in refactoring and error-handling or edge-case fixes, the two categories with the lowest mean edit-step count [s2].

> [!INFERRED]
> I read that as a statement about how much of the file an edit touches at least as much as about the format it arrives in. The study does not vary that size on purpose, so this is my reading and not its finding.

If diffs hold up exactly where edits are short and local, then the size of the change is doing work in that comparison, work the regime label hides. The study's headline stays intact. What changes is the question I would take away from it.

## What Aider changed, and what it did not show

Aider's result is the one people quote, and I think it is also the one most often over-read. The facts are narrow. GPT-4 Turbo scored 20 percent as a baseline with Aider's SEARCH/REPLACE block edit format and output lazy comments on 12 of the tasks, and Aider's new unified diff edit format raised the score to 61 percent [s4]. The named failure mode is lazy comments, and I would not read more into it than the post reports.

The same post states a design principle. Its high-level guidance is to encourage GPT to structure edits as new versions of substantive code blocks such as functions and methods, not as a series of surgical changes to individual lines [s5]. That sentence is the closest either source comes to talking about the size of an edit.

What the post does not do is connect the two. It reports a score, it states a principle, and no measurement in it ties one to the other. A reader who skims the post can easily come away believing that function-sized edits produced the jump. The post does not say that.

> [!WARNING]
> The post states the principle and reports the score; it does not show that one produced the other. Treat the principle as a design intent, and do not cite the jump as proof that function-sized edits work.

## Edit size as a second routing dimension

Here is my reading, and it is only a reading. Both results are consistent with the size of the edit unit mattering, a variable that the diffs-versus-whole-files framing hides, and neither source varies it on purpose.

The concession has to come first, since the format evidence is real. With the same model, Aider's new format moved GPT-4 Turbo from 20 to 61 percent [s4], and Aider tunes the format per model, using the optimal one for most popular, common models [s6]. Format matters on its own. So I do not think the format knob is wrong. I think it is incomplete, and edit-unit size belongs next to it as a second routing dimension.

My untested bet is that function- or method-sized edits are a better default than line-level hunks or whole files for mid-sized changes, whatever format carries them. A line-level hunk asks the model to locate its change precisely inside code it did not rewrite; a function-sized version lets it restate a coherent unit and leaves the tool to splice it in. That intuition is mine, and no run in either source tests it.

Whole-file output keeps a place for sprawling edits, at a price Aider documents: returning the entire file when only a few lines change can be slow and costly [s7]. For a change that rewrites most of a file, I would pay that price without hesitation.

| Approach in the sources | What the source reports | My reading and what I would do |
| :--- | :--- | :--- |
| Diff-based generation (study regime) | Competitive on short, spatially localized edits [s2] | I read this as evidence for small units; keep them for small, local fixes |
| Function- or method-sized versions (Aider principle) | Stated as a design principle [s5]; neither source measures it | My untested bet as the default for mid-sized changes |
| Direct generation (study regime) | Wins on every metric the study measures [s1], at 100M and 0.5B parameters [s3] | I read it as the case for whole-file output, which Aider documents as slow and costly when few lines change [s7]; reserve it for sprawling edits |

The middle column is what the sources say. The right-hand column is mine, and it is the part a careful reader should push on.

## The two objections: the weight of format, and scale

I started from the claim that format was the wrong knob to reason about first, and the evidence does not let me keep it. Two objections did that work, and both deserve their strongest form.

The first is the weight of format. The variable I want to route on is exactly the one no measurement in either source varies. The Aider jump has at least two other explanations I cannot rule out: GPT-4 Turbo may be more at home with unified diff syntax, or the unified format may discourage lazy comments on its own. Neither is established; they are hypotheses, and so is mine. Worse for my case, the only frontier-scale evidence I have is a format effect.

I concede all of it, and the claim in this piece carries that concession: unit size as a second dimension next to format, never a replacement for it. What survives is narrower. The two results are not opposed, and unit size is an under-measured variable that deserves its own column in a routing table.

The second objection is scale. The study's models have 100M and 0.5B parameters [s3]. The objection holds that models that small may lack the capacity to track a multi-step edit, and I cannot rule that out from these sources.

My answer uses only Aider's numbers. With GPT-4 Turbo held fixed, one format produced lazy comments on 12 tasks and a 20 percent score, and another reached 61 percent [s4]. Edit-format effects are therefore not purely a small-model artifact. That answer has a hard limit, and I want it stated plainly: it says nothing about whether the study's result would survive on frontier models.

## What I would configure, and the run that would refute me

The lever already exists. Aider ships the optimal format for most popular, common models and lets users force a specific one with the `--edit-format` switch [s6]. I would keep both and add unit size as a second setting: a per-model hint for how large a region the model should rewrite in one edit.

Concretely, if I were tuning an agent this week, I would pin the format with `--edit-format`, then run the same task set under two prompts with the model and the format held fixed, one asking for function- or method-sized rewrites and one asking for minimal line changes, and compare pass rates and output cost per task.

That run is also the one that would refute me. If varying unit size, with the model and the format held fixed, shows no effect, my bet is wrong and the format knob was carrying the whole effect after all.

> [!NOTE]
> The evidence here is one study of small Flutter/Dart models, one vendor benchmark on one model, and no head-to-head run of function-sized edits against both formats. Read the right-hand column as a hypothesis to test on your own tasks.

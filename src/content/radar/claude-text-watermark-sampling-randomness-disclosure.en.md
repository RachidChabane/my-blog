---
translationKey: claude-text-watermark-synthid-mechanism
lang: en
slug: claude-text-watermark-sampling-randomness-disclosure
title: Claude's text watermark only changes the source of the randomness used to pick
  among words
publishDate: 17-08-2026
kind: release
tags:
- Claude
- Anthropic
- watermarking
summary: 'Anthropic named the method behind Claude''s text watermark on 14 August
  2026: a version of SynthID-Text, whose stated principle is that it only changes
  the source of the randomness used to pick among words. Search Engine Journal noted
  on 11 August 2026 that qualifying human review can exempt published text from the
  disclosure requirement. I think the mark cannot answer for the duty.'
sources:
- label: Anthropic news post
  url: https://www.anthropic.com/news/claude-text-watermark
  date: 14-08-2026
- label: Search Engine Journal
  url: https://www.searchenginejournal.com/anthropic-claude-watermarks-eu-ai-act-code/585355/
  date: 11-08-2026
contentHash: sha256:2413d11abe8e45a0
publishState: published
---

## What changed

Anthropic named the method behind Claude's text watermark in a post dated 14 August 2026 [s1]. It is
a version of the SynthID-Text approach Google DeepMind published in a Nature paper in 2024, in a
family going back to a proposal by Scott Aaronson in 2022, whose stated design principle is that the
watermark only changes the source of the randomness used to pick among words [s1]. Search Engine
Journal,
reading the obligations attached to Claude's text watermarking on 11 August 2026, notes that
published text under qualifying human review or editorial control can be exempt from the disclosure
requirement [s2].

## The mark and the duty are two different objects

Search Engine Journal states it outright: a Claude mark can appear on copy that its publisher has no
obligation to label [s2]. I think anyone running a content pipeline should sit with that sentence.
The exemption turns on who holds editorial responsibility, a fact about people and process [s2]. The
mark attaches to token choices, a fact about generation [s1]. Neither can answer for the other.

> [!CONFIRMED]
> The stated design principle is that the watermark only changes the source of the randomness used
> to pick among words [s1].

> [!INFERRED]
> I read that as a mark carried by the token choices rather than by a metadata field, so text can
> reach you with no trace of who read it or who holds editorial responsibility. That trace exists
> only if you write it down where you generate.

One consequence I would add: with no randomness there is no randomness source to change. Output your
stack produces with the sampler pinned leaves nothing to substitute, so marking looks different for
template-shaped copy than for free-form prose. That is my reading, and it is not a measurement.

## Impact on your team

The decision sits at generation time: what your pipeline records when it writes the text. If you
push Claude output into a CMS or a customer-facing template, store the editorial fact as you write:
who read the copy, under what process, and whether that reading is the qualifying kind Search Engine
Journal describes [s2]. It does not come back from the bytes later. Two moves I would refuse:
treating a mark as proof its publisher owed a label, when the exemptions run the other way [s2]; and
treating the sampler as an implementation detail, when it has just joined your provenance surface.

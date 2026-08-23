---
translationKey: watermark-entropy-budget
lang: en
slug: my-reliability-work-spends-the-watermark-budget
title: My Reliability Work Spends the Watermark's Budget
publishDate: 23-08-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: 'anthropic.com: Nothing is added to the text and there are no hidden characters'
  url: https://www.anthropic.com/news/claude-text-watermark
  date: 14-08-2026
- label: 'support.claude.com: Marks will apply to output from supported Claude models'
  url: https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content
  date: 23-08-2026
- label: 'daringfireball.net: apply a form of steganography'
  url: https://daringfireball.net/2026/08/anthropics_watermark_text_adulteration_in_claude_is_a_perversion_of_writing
  date: 16-08-2026
- label: 'blog.j11y.io: The result is a signal broad enough to implicate harmless
    and assistive use'
  url: https://blog.j11y.io/2026-08-12_Anthropics-weak-watermarks-appease-a-weak-law/
  date: 12-08-2026
- label: 'nature.com: very low entropy, meaning it almost always returns the exact
    same response'
  url: https://www.nature.com/articles/s41586-024-08025-4
  date: 23-10-2024
- label: 'arXiv 2301.10226: Low entropy text creates two problems for watermarking.'
  url: https://arxiv.org/abs/2301.10226
  date: 23-08-2026
contentHash: sha256:da24a38d0be016df
publishState: published
---


The watermark is made out of the sampler's freedom [s17], and every practice that
makes my coding agent dependable spends that same freedom. Anthropic states the
mechanism plainly: AI watermarking takes advantage of decisions where either choice
of a word would be equally good [s18]. Hold those two sentences together and the
consequence gets uncomfortable. The harder I work to make a pipeline return the same
answer twice, the fewer equally good choices are left for a mark to live in. The
thinning is not something the text happens to have. I manufacture it, on purpose, and
I am the party least able to see that I did.

## What the mark is actually made of

Anthropic's account of what it changes is narrower than most readers assume. The
watermark only changes the source of the randomness used to pick among words
[s17]. Nothing is added to the text and there are no hidden characters [s1]. No payload
to strip, no zero-width character to grep for. What moves is which of several
acceptable next words gets picked, steered by a key the vendor holds. Anthropic frames
the reader-visible result this way: the words that Claude picks are still random, but
now, one can check the sequence of words [s2].

An independent commentator describes the same construction from the outside and lands
on the same shape: apply a form of steganography, where the choice of words at
inference time will leave fingerprints that can later, maybe, be detected
probabilistically [s7]. I quote that for one word in it, probabilistically. A mark
built this way is not a flag a text either has or lacks. It is a statistical read
across many word choices, and those choices are the ones the vendor already named, the
equally good ones [s18]. Which leaves a question hanging over text with very few
equally good choices to make.

## Three origins on one limit

Three separate origins answer that question the same way, and they agree about that
and nothing else. None of them states the conjunction I am about to draw; each states
one leg of it.

The vendor holds the first leg, in the sentence about equally good choices already
quoted above [s18], to which Anthropic adds that one form of text has generally less
watermarking than some other forms of text [s3]. Read together, the vendor has said
that the mark's strength varies with the material, and said why.

A second origin, writing about a different deployed scheme, works the same territory
from the measurement side. It describes a near-deterministic model: if the LLM
distribution is very low entropy, meaning it almost always returns the exact same
response to the given prompt [s12]. It reports, about its own method, that tournament
sampling performs better when there is more entropy [s13]. None of that is about
Claude's mark, and I am not claiming it is.

A watermarking paper holds the third leg and drops the hedging. Low entropy text
creates two problems for watermarking [s14]. Determining this is fundamentally hard
because these sequences have low entropy [s15].

| Origin | What its own text states | Citation |
| --- | --- | --- |
| The vendor | decisions where either choice of a word would be equally good; generally less watermarking than some other forms of text | [s18] [s3] |
| A deployed scheme | very low entropy almost always returns the exact same response; tournament sampling performs better with more entropy | [s12] [s13] |
| A watermarking paper | low entropy text creates two problems for watermarking | [s14] [s15] |

The limit they converge on is where the mark fades, and that is the whole of their
agreement. The sentence that matters to an operator lives across those rows and inside
none of them. No one page states it.

## Entropy is what my reliability work removes

Every account above treats low entropy as a property that some text or some
distribution happens to have. Inside an engineered pipeline that framing breaks
down. The low entropy is a budget I spend down, one reliability practice at a time,
and the total only grows.

I think most of the work of making an agent dependable is entropy removal wearing
other names. I lower the temperature so repeated runs agree. I hand the decoder a
schema it has to satisfy, which deletes every continuation that would have violated
it. I run the same request repeatedly and keep only the answer the runs agree on. I
write prompts that admit one shape of output, because a free-form answer is one my
parser cannot rely on. In my experience that is the bulk of the engineering, and none
of it is optional once the thing runs unattended.

Every one of those dials points the same direction: fewer equally good choices at
every step of generation. There is no watermark setting in my stack. I am tuning
reliability, and the budget the mark draws on is the one my tuning empties.

## The failure mode nothing in my stack reports

That failure has a shape, and what makes it hard is how quiet it is. Picture a
pipeline hardened to near-determinism: constrained decoding, a low temperature,
consensus retries, a prompt with one legal answer shape. Its output is
precisely the text a detector has the least to work with, and nothing anywhere says
so. Nothing errors, nothing warns, and no field in any response reports that the mark
came out thin. My observability stack cannot surface it, and nobody who could compute a
confidence number hands me one. In my experience that is the worst class of defect to
carry: the degradation is a side effect of work I was right to do, invisible at the
moment it happens, to the only party who caused it.

## What Anthropic itself scopes

Anthropic does not leave this implicit, and I take the company at its word. Anthropic
says the watermark can be used on comments within code, and that by definition it will
have a negligible effect on the actual code produced [s4]. That is the vendor scoping
its own claim, on the artifact my reviewers argue about, with no entropy argument
needed to get there. Anthropic covers a wide surface, since marks will apply to output
from supported Claude models across Claude Platform (API), Claude, Claude Code, Claude
Cowork, and Claude Tag [s6].

Be exact about what that settles. Anthropic has settled the code artifact on its own
account, and said nothing about the rest of what my pipeline writes, which is most of
the words by volume: the review comment on a pull request, the commit message, the
incident note, the migration summary. All natural language, all of it through the same
constrained decoding and consensus retries and one-shape prompt, and none of it
touched by Anthropic's statement about code.

> [!WARNING]
> Anthropic's scoping of the watermark on generated code is a statement about the code
> artifact, and it reads easily as a statement about everything a pipeline writes. The
> natural language the same pipeline emits under the same constraints sits outside that
> sentence, and the constraints thinning the mark there are ones I chose for
> reliability.

## The strongest case against me

The best argument against my position does not come from the vendor. A critic writing
about the scheme puts it like this: the result is a signal broad enough to implicate
harmless and assistive use, yet fragile enough to be removed by a motivated person
through substantial recomposition [s10]. Read as an attack on me, that is a good one.
If the signal is already weak in both directions, my entropy budget is a rounding
error on top of something that was never load-bearing, and a weak signal still raises
the cost of passing work off. Friction is worth something.

I take that seriously, and I still think it fails, on the strength of one sentence.
Only Anthropic will be able to determine if text was seemingly generated by Claude,
and Anthropic will only be able to detect the watermarks that are applied by Claude
[s8]. I cannot run the detector over my own output, so I cannot separate the two
hypotheses that matter to me: a thin mark and no mark look identical from where I
stand, and my own engineering is what moves me between them. An argument from friction
assumes a signal somebody can check. The party who could check mine is Anthropic.

The one quality comparison in the material I cited does not close that gap either.
Google DeepMind tested this impact by serving a model that used watermarking to a
portion of their Gemini traffic and comparing thumbs-up and thumbs-down ratings [s5].
That is an experiment about whether readers notice a difference, run by a different
party on a different system, and it says nothing about how much mark survives a
pipeline built the way mine is.

## What I would actually do

So the practical answer is small and slightly deflating. I spend nothing on the mark
as a control: no detection step in a review pipeline, no detection result on my output
treated as evidence. The obligation the mark discharges is provider-side and technical
[s11]: it binds whoever ships the model, and leaves the separate question of what each
person using AI must disclose entirely alone [s11]. Someone else discharges it.

What I keep is the declaration that travels with the work. The patch records who wrote
it and what generated it, in the commit trailer and the pull request body. That object
is auditable by me, it survives every transformation my pipeline applies, and it does
not thin out when I turn the temperature down. In theory that makes it the weaker of
the two objects. Stronger in practice, because I can check it.

> [!CONFIRMED]
> The three origins that bound the mark are not describing the same system. Anthropic
> describes its own scheme and where it carries less [s18] [s3]; the other two describe
> a different sampler [s12] [s13] and the difficulty low entropy sequences create for
> watermarking [s14] [s15].

> [!INFERRED]
> I think the entropy all three describe is, inside an engineered pipeline, something I
> manufacture rather than something a text happens to have. My reliability work spends
> the budget the mark is drawn from, and the bill never reaches me.

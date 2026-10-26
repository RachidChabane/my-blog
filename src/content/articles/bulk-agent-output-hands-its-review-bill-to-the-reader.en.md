---
translationKey: bulk-ai-research-release-ships-review-cost-to-readers
lang: en
slug: bulk-agent-output-hands-its-review-bill-to-the-reader
title: Bulk agent output hands its review bill to the reader
publishDate: 26-10-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: OpenAI, openai/math README at a pinned commit (what the repository holds)
  url: https://raw.githubusercontent.com/openai/math/1581d4cbdd69a0faf34b2089614fe2a814316a6a/README.md
  date: 12-10-2026
- label: OpenAI, openai/math history at a pinned commit (sign error)
  url: https://raw.githubusercontent.com/openai/math/1581d4cbdd69a0faf34b2089614fe2a814316a6a/history.md
  date: 07-10-2026
- label: AGMAI, Responsible Release of AI-Generated Mathematics (the problem)
  url: https://agmai.org/general-sep29/
  date: 29-09-2026
- label: AGMAI, statement on OpenAI's release of mathematical results
  url: https://agmai.org/
  date: 06-10-2026
- label: oai-math-revised, guest post on Terence Tao's blog (community revision hub)
  url: https://terrytao.wordpress.com/2026/10/24/oai-math-revised-a-community-hub-for-revising-openais-math-write-ups/
  date: 24-10-2026
- label: Clark, Martin and Mahowald, Why is AI generated language so hard to understand?
    (arXiv 2610.29162)
  url: https://arxiv.org/abs/2610.29162
  date: 21-10-2026
- label: Asaf Karagila, OpenAI, the Partition Principle, and mathematics (what was
    read)
  url: https://karagila.org/2026/openai-pp/
  date: 08-10-2026
- label: New Scientist, OpenAI mistranslated mathematics into code for its Navier-Stokes
    proof (the claim)
  url: https://www.newscientist.com/article/2592824-openai-mistranslated-mathematics-into-code-for-its-navier-stokes-proof/
  date: 08-10-2026
contentHash: sha256:4ac4c2f6047cd5f6
publishState: published
---


I think a bulk release of agent output moves part of its review cost onto readers, and a formalized share reduces that cost without removing it. Outside readers of the producer's repository write that its math write-ups can be difficult to understand and can have incomplete citations [s22]. On a separate proof from the same producer, a team of mathematicians took about two weeks to identify a true discrepancy, compared with the 88 hours OpenAI said its agents spent generating the proofs [s37].

In my reading, a formal check certifies the statement someone formalized, and checking that statement against the prose is still reading work. I think bulk release adds a cost of its own, because generated results start to depend on each other. What I would ask of a producer is a manifest, shipped with the output and paid for by the producer.

## The reader pays for the release

The cost already has an address. The repository contains mathematical manuscripts and supporting proof artifacts produced by an internal OpenAI model [s1]. The same guest post [s22] announces a community repository that seeks to be an inclusive effort to improve these write-ups [s40]. I read that hub as the review bill being paid in public, by people outside the producer.

The producer's README notes that the write-up for a zero-free region of the Riemann zeta function was human edited for readability [s41]. I think that line names the job: a human edit for the reader, which the outside hub now invites the community to do.

One reader shows what that job looks like on a single paper. The reader took a brief look at the preprint released by OpenAI [s27] and found it unclear, muddled, and strangely structured [s28], with at least three unpublished, unrefereed, and non-arXiv'd lecture notes used as references [s29]. Submitted to a journal, the reader writes, it should be issued a desk rejection for the quality [s30]. And the reader asks: when am I supposed to sift through a badly written paper [s31]?

A separate proof from the same producer puts a number on the reading. On 8 September, OpenAI announced that it had found a solution to the Navier-Stokes problem [s48], and a team of mathematicians claims that OpenAI made a subtle error when publishing its proofs [s32]. It took the team about two weeks to identify a true discrepancy, compared with the 88 hours OpenAI said its agents spent generating the proofs [s37]. The report quotes a warning that these proofs will have to be read by humans, an enormous extra burden on mathematicians [s38].

A group of mathematicians has published guidelines on what such a release owes readers: AI can now output mathematical arguments that the human who prompted it cannot understand, verify, or take responsibility for [s13], and write-ups should avoid wordy reasoning and non-standard terminology that renders them virtually incomprehensible [s14]. I treat those as norms, and as my bar.

## What a formal check certifies

The obvious answer is formalization, and I think it is a partial one. The team's claim rests on one step: in the natural-language proof, an equation requires that a certain value be below m + 4, where m is a whole number [s34]; in the Lean proof, the equivalent value is required to be below m + 5, which is mathematically weaker [s35]; and the report is explicit that the error doesn't mean the proofs are incorrect [s33]. OpenAI told the magazine it is aware of the mismatch with the Lean code and that this doesn't mean either proof is invalid [s44]. The report adds that the firm says it will keep formalising the papers it released that week, only some of which are accompanied by Lean proofs, which themselves haven't been checked by hand [s45]. I think that line holds the argument in small: a formalized share and a hand-checked share are different numbers, and a reader deciding what to trust needs the second.

> [!CONFIRMED]
> The Lean proof accepts a value below m + 5 where the prose requires below m + 4 [s34] [s35], and the report says this does not make the proofs incorrect [s33].

> [!INFERRED]
> In my reading, the check passed on the statement that was formalized. Whether that statement matched the prose was a reading question, and only a reader could answer it.

The report names the mechanism, and I would call it compile-driven drift: if, in auto-formalisation, the AI finds a section of the proof that doesn't compile, it will attempt to find a workaround even if it means diverging from the proof as written in natural language [s36]. That is why the mismatch matters: the issue, as the report puts it, is that OpenAI presents the two proofs as identical [s47]. In my reading, any agent pipeline with a formal gate carries the same exposure, because the gate rewards whatever compiles.

Finding it was not free either. It involved asking ChatGPT to look for potential discrepancies between the natural-language and Lean proofs, then checking them by hand [s39], and many of the discrepancies ChatGPT suggested turned out, on inspection, to be consistent after all [s46]. I count that as a model pass that produced candidates and a human pass that decided them: the search gained a tool, and the reading stayed.

## The denominator the reader asked for

The producer did publish a denominator. Over the course of the evaluation, the model was posed approximately 4,000 problems [s4], and on average each result used three hours of ChatGPT Pro thinking compute with that model [s8]. A significance filter applied while aggregating the output into result families and manuscripts led to the catalogue [s5], which now holds 719 manuscripts organized into 372 families [s2]. The history puts the formalized share at 300 / 719, about 42% of top-line results [s12] [s3], and the README warns that some of the unformalized results could have issues [s7].

The group's guidelines ask for another count. If many results are released at once, they want a further document explaining how many other problems of comparable difficulty the models tried and failed to solve, and how the problems were chosen [s15]. They also ask for a clearly stated formalization status where formalization would lead to unacceptable delays [s16], say it would be helpful to include machine-readable metadata correlating the natural language and formal artifacts [s49], and want, for each result, the model, the prompts, a summarized chain of thought, the time taken and the compute cost [s17].

I think problems posed and problems tried and failed answer different questions: a posed count gives the scale of the search, and a failed count among problems of comparable difficulty tells a reader how to weigh each success, with the significance filter in between. I would not divide one figure by another, because the units do not match, and that mismatch is my point.

The group does not claim to settle the question. Its statement calls the release the beginning of the process of human understanding [s18], and says it is ultimately up to the mathematical community to assess the extent to which its recommendations were followed [s19]. It also says it operates independently of any AI company, that its members do not accept payment [s20], and that it came together after OpenAI approached some of its members about establishing an external advisory board [s21].

## One error, several papers

I think bulk release adds a cost a single paper does not have: results start to depend on results. The README says some outputs build upon earlier results produced by the models [s6]. The history shows what that means when one of them breaks: a sign error invalidates a stabilization-trace cancellation argument and the construction used by two dependent papers [s9], and as a result three manuscripts were withdrawn [s10].

The repair did not stop there. The producer revised 14 other manuscripts with proof repairs, corrected statements, clearer hypotheses and dependencies, and one correction to an obsolete citation [s11], and as a consequence of these fixes updated 13 additional manuscripts to cite the revised editions of companion papers [s42]. The withdrawn papers now carry notices explaining the gap and linking to the archived manuscripts [s43].

I give the producer credit for keeping this history public. In my reading it is still a dependency graph written as prose: it lists what moved after the fact, and a reader who cited a dependent paper must come back to look. I think that graph belongs in the release as data, so a withdrawn base result flags its dependents mechanically.

## Why the prose stays hard to read

I think there is a structural reason the reading stays expensive. A separate study starts from a widespread sense that AI-generated text has recently become harder to understand [s23] and measures psycholinguistic features known to correlate with human processing difficulty [s26]: compared with human writing, all nine frontier and near-frontier models use more inanimate subjects with animate verbs and more low-frequency n-grams [s24]. Its authors suggest that while human language is optimized for successful communication, AI-generated text is increasingly optimized for other goals like math, code, and reasoning [s25]. I treat the study as background on frontier-model text in general, and I do not apply it to these write-ups.

## The strongest case against

The strongest case against my take, as I would put it, is that the producer published a problems-posed count, the compute per result and a formalized share [s4] [s8] [s3], and that formal checking scales where human reading does not, so the answer to bulk output is to formalize more.

I agree with half of it: a higher formalized share cuts the reading, and the bound mismatch did not make the proofs incorrect [s33]. The case skips the step between the check and the claim. The Lean proof required a weaker bound than the prose [s35], the report traces that kind of gap to a formalizer working around a section that did not compile [s36], and finding it took a model pass whose suggestions were then checked by hand [s39] [s46].

I think formalization narrows the reading to one question, whether the certified statement is the claim, without removing it.

## What I would ship with bulk agent output

For agent output at volume, mathematics or code, this is the manifest I would pay for before publishing.

| Field | What it records | Whose work it saves |
| :--- | :--- | :--- |
| Attempt denominator | problems tried and failed, in the units the reader asked for, and how they were chosen | anyone weighing a success |
| Certified statement | the exact statement each check certifies, beside the claim it backs | anyone trusting a formal pass |
| Check status | formalized, checked by hand, or neither, per artifact | anyone deciding what to read |
| Dependency graph | the generated artifacts each artifact builds on | anyone citing a result whose base is withdrawn |

The group already calls metadata like the second row helpful; I would make every row part of the release format. I would have the producing pipeline write one entry per artifact:

```yaml
# one manifest entry per generated artifact (illustrative)
artifact: example-result
claim: the statement as written in the prose
certified_statement: the statement the formal check accepts
check_status: formalized
hand_checked: false
depends_on: [example-base-result]
```

I think none of these fields costs a producer much, since it already holds its attempt log, formal statements and build graph, while each is expensive for a reader to rebuild. A bulk release without such a manifest asks readers to do the producer's bookkeeping, and I would not ship one.

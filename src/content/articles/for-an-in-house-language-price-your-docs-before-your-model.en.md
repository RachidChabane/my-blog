---
translationKey: low-resource-language-scores-do-not-transfer-to-an-unseen-language
lang: en
slug: for-an-in-house-language-price-your-docs-before-your-model
title: For an in-house language, price your docs before your model
publishDate: 21-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: OpenAI, Advancing coding in low-resource programming languages (scope)
  url: https://openai.com/index/low-resource-programming-languages/
  date: 19-10-2026
- label: Dominik Picheta, I built a programming language that LLMs cannot use (question)
  url: https://blog.picheta.me/post/killswitch-lang/
  date: 17-10-2026
- label: Cassano et al., MultiPL-T, arXiv 2308.09895 (low-resource gap)
  url: https://arxiv.org/abs/2308.09895
  date: 19-08-2023
contentHash: sha256:013ad2510e42af5c
publishState: published
---


I think the published low-resource coding scores do not measure your in-house language, and the first thing to evaluate is the accuracy of the docs your agent reads. In my reading those scores track languages that are scarce in public code. A language that lives inside one company is absent from that code, and the variable its team controls there is what the agent is told about it.

## Two parties report the same struggle

The word "low-resource" carries a precise meaning in these sources, and that meaning is about data. OpenAI's post [s25] frames its work around low-resource programming languages such as COBOL, Fortran and Visual Basic [s1], languages with less code and documentation for models to learn from than Python and JavaScript that still support critical infrastructure and essential services [s2]. The post says the work is guided by developers and enterprise customers who told OpenAI that coding models often struggle with them [s3]. I read that as a report the vendor relays: one voice, secondhand, and a vendor has every reason to relay it.

The second voice measured the struggle. A paper on Code LLMs found that such models produce impressive results on languages well represented in their training data, such as Java, Python or JavaScript, and struggle on low-resource languages with limited training data [s20]. The same paper lists OCaml and Racket among those languages, with several others [s21]. OCaml sits on the paper's list and among the vendor's tested languages, which I read as one condition seen from two sides: a language the public code base underserves.

The paper's remedy is data. Its approach, MultiPL-T, translates training data from high-resource languages into training data for low-resource ones [s29], using a Code LLM to translate Python into the target language and tests to validate the translation [s22]. Scarcity is a data problem. It has a data fix, which is why I find the vendor gains plausible; a language that exists only in one company's repositories has no public code to add, and a team that rents its model through an API has no training run to feed. In my reading the one step a team could reuse, translation checked by tests, still runs through the spec: the translating model has to write your language before the tests can reject anything, and what it knows of your language is your docs.

## What the vendor's numbers measure

I take the gains at face value, and I think they answer a question an in-house team does not have. The post's MultiLangBench asks a model to build a SQLite-compatible database engine from scratch in each of 20 languages [s4], and OpenAI checks the resulting database against the reference SQLite implementation [s5]. In my reading the model works against a spec that cannot be wrong: when the prose of a spec is ambiguous, the reference implementation settles the question, and the grader holds the same answer.

The post reports improvements on every language tested, including COBOL from 10.9% to 72.1% and OCaml from 25.6% to 85.8% [s6]. Astra scores above 83% in 19 of the 20 languages, with COBOL still the hardest at 72% [s7]. I read that as real progress on languages that are scarce in public code.

The migration side follows the same pattern. The post's migration evaluation runs hidden tests that require byte-for-byte parity on observable outputs [s8]. OpenAI is releasing the MultiLangBench evaluation setup and test suite on GitHub [s10]. I would run it to check that a vendor number reproduces; it will not contain your language.

The post itself says what makes this software hard to maintain and modernize: documentation may be incomplete, original developers may have left the company, and important business rules may only exist in code [s24]. Read that list next to the two evaluations. Each hands the model an answer key, a reference implementation in one and hidden parity tests in the other, and in my reading neither evaluation, as the post describes it, varies the documentation the model receives. That is the gap. In my reading, the first item on the vendor's own list is the one its numbers hold fixed.

## KillSwitch measures three things at once

I think the closest public stand-in for an in-house language is a language built to be hostile. The KillSwitch author asks how much of models' ability to write code comes from understanding it and how much from recalling snippets present in their training dataset or context window [s11]. KillSwitch is an esoteric programming language designed to be adversarial to LLMs and coding agents [s12], and the author set out to test how well an LLM understands and writes code in a programming language it has never seen before [s26]. In my reading, novelty is the condition an in-house language shares with it.

KillSwitch adds two things an honest in-house language does not have. Its design includes constructs meant to trigger the model's safety guardrails [s23], and the author reports that some models such as Fable 5.1 and Gemini 4 Argon do poorly because of overly sensitive safety guardrails [s15]. The spec itself also works against its reader.

> [!CONFIRMED]
> The KillSwitch spec contains hidden lies that humans are unlikely to read or likely to recognize as lies [s13], and it expects the human reader to deduce certain things it never explains [s27].

> [!INFERRED]
> I read both traits as an internal wiki. The stale page that every engineer knows to skip is a lie a human recognizes, and the convention nobody wrote down is a deduction a human makes from context. In my reading, an agent that reads the same pages has neither filter.

The author benchmarked the major models and coding agent harnesses on a set of tasks [s14]; the best performing model scores 66.8 on tasks that, the author notes, are fairly simple so far [s16] [s17]. Three variables, one score. Novelty, lies and guardrail bait sit in one number, and in my reading none of these sources splits it; I would not use that score to predict anything about an honest in-house language.

Here is what each test gives the model, what it grades, and what it leaves out in my reading.

| Test | What the model gets | What is graded | What it leaves out, in my reading |
| :--- | :--- | :--- | :--- |
| MultiLangBench (OpenAI) | an engine to build in each of 20 languages [s4] | database contents against the reference SQLite [s5] | docs that are wrong or missing |
| OpenAI migration evaluation | programs whose behaviours must be preserved [s8] | hidden tests, byte-for-byte parity [s8] | docs that are wrong or missing |
| KillSwitch | a language whose spec contains hidden lies [s13] | a fairly simple task set [s17] | which of novelty, lies and guardrail bait costs what |

## The strongest case against

The best objection to my thesis comes from the KillSwitch author's own results. The author finds it encouraging that model performance on this simple set of tasks correlates with other model benchmarks that are out there [s18]. In its strongest form the objection runs like this: if rankings carry over to a language built to confuse models, they probably carry over to yours, and picking the strongest model is most of the job.

The author's leaderboard adds a detail that seems to support it. Claude's Opus performs best, with Opus 5 ahead of Opus 5.5, and the author judges the difference not to be pure chance: Opus 5 is better at interpreting the spec [s28].

I accept that some capability carries over, and the ranking is useful when choosing between models. A correlation orders models against each other; a go or no-go decision on one language needs an absolute level, plus a price for what a wrong spec costs. Rankings price nothing. The one result the author explains, they explain by spec reading, which makes the spec the material that skill works on. I suspect a model that reads specs better also follows a wrong one more faithfully, and the experiment below would show it.

## What I would do with an in-house language

Before comparing models, I would price the docs. Keep two copies of them: the pages as the agent finds them today, and the same pages after the engineers who know which ones are stale mark and fix them. Run the same small task set, with the same model and harness, against each copy. The gap between the two pass rates is what stale docs cost you.

```
docs-current/     the wiki and spec as the agent reads them today
docs-corrected/   the same pages after engineers fix what they know is stale
tasks/            a small task set with checks you already trust

run the same agent, model and harness on tasks/ with each docs tree
cost of stale docs = pass rate (docs-corrected) - pass rate (docs-current)
count refusals apart from wrong answers
```

The failure mode I would look for first is the stale spec the agent trusts. In my experience an engineer who hits a page that contradicts the code asks a colleague; I think an agent writes code that matches the page, and the checks catch it late or not at all. The corrected copy turns that habit into a measured cost.

The second failure mode needs its own column. On KillSwitch, models such as Fable 5.1 and Gemini 4 Argon do poorly because of overly sensitive safety guardrails, as the author reports [s15]. In my reading, legacy code can hold identifiers and comments that read like an attack phrase, and a refusal there is a different defect from a wrong answer, with a different fix: a model or harness setting, where a wrong answer calls for better docs.

> [!IMPORTANT]
> If the gap between the two docs trees is small, spend the budget on model choice. That result would refute my hypothesis, and it is cheap to find out.

I would compare models only then, and I would read the vendor's per-language results as evidence about languages that live in public code. The test is cheap.

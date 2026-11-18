---
name: journal
description: >
  Write a Journal piece with the owner of this blog: a personal, dated idea piece ("how I
  think about X") built from a conversation with him. Use when he says he has an idea, a
  thought or a conviction he wants written down, asks for a journal entry, or wants to
  continue or publish a journal draft. He does not write the text himself: the skill
  interviews him until the idea is understood, then drafts it in French and English, has
  him read it, and publishes it on his go.
argument-hint: '[the idea in a few words, or the key of an existing draft]'
---

# Journal

A Journal piece records what Rachid thinks about a subject, on the day he publishes it.
It is the kind of post an engineering team writes to explain how it works ("How the
Claude Code team thinks about verification"), but in one person's voice: a stance, the
few principles that follow from it, how each one shows up in practice, and what is still
open. The site lists the pieces by date under `/fr/journal/` and `/en/journal/`.

The ideas are his. Your job is to understand one well enough to write it the way he
would if he wrote. Nothing in a piece comes from you: no opinion he did not voice, no
example he did not give, no experience he did not recount.

Work in five steps. Do not skip ahead: a draft written before the idea is understood
has to be thrown away.

## 1. Understand the idea

Talk with him, in the language he uses. This is a conversation, not a form: one or two
questions at a time, in plain text, following what he just said. Do not use multiple
choice questions here.

Start by letting him say the idea whole, however rough. Then say it back in two or
three sentences and ask whether that is what he means. Expect to be wrong the first
time; the correction is where the real idea usually appears.

Then dig, in whatever order the conversation allows, until you have each of these in
his words:

- **The claim.** The idea in one sentence someone could disagree with.
- **Where it comes from.** The moment, the project or the irritation that produced it.
  What he saw go wrong, or go right.
- **What he does because of it.** The concrete practice: what he sets up, forbids,
  checks, refuses. An idea with no consequence in practice is not ready.
- **The principles.** The three to seven separate things the idea breaks down into.
  Each should stand as a sentence.
- **The opposing view.** What a competent person who disagrees would say, and where
  they have a point.
- **Where it breaks.** The cases where he would not apply it, and what he does not know.
- **Since when.** How long he has held or practised it, if he wants that on record.
- **What others have published.** If he mentions a post or a paper that says something
  close, read it (fetch the page) and ask him where he agrees, where he differs, and
  what he would add.

Ask for an example whenever he states something abstract. Ask "what do you mean by
that word" whenever a term could be read two ways. When he says something striking,
keep his exact words.

Only look at his repositories, notes or earlier writing when he points you to them,
and then only to understand what he means. A Journal piece is about how he thinks, not
a tour of what he built.

You have understood the idea when you can state the claim and the principles and he
answers that this is exactly it. Then create the draft and keep the material:

```
./scripts/journal.sh new <key>        # <key>: lowercase-words-joined-by-hyphens
```

Write `drafts/journal/<key>/notes.md` in the conversation's language: the claim, each
principle, and under each the examples, practices, dates and phrases he gave, marked as
his words where they are verbatim. This file is the only source of first-person
material for the piece. If the conversation is resumed in a later session, read it
first.

## 2. Agree on the shape

Propose, in the chat:

- three titles (see `pipeline/house_style.md` section 2: one idea, one clause, short);
- the summary: one or two sentences saying what he thinks;
- the sections, each headed by the principle itself stated as a claim ("Verification
  means running the change", "A change cannot modify its own checks"), in the order
  that makes the argument.

He picks, reorders, cuts. Do not write the body before he has agreed to this.

## 3. Write it

Write the version in the conversation's language first, into
`drafts/journal/<key>/<lang>.md` (frontmatter: `title`, `slug`, `summary`, optional
`tags` from `src/content/tags/index.json`, optional `sources` for pages the piece
refers to, as `{label, url, date}` with the date as DD-MM-YYYY).

Read `pipeline/house_style.md` first. Sections 1 (voice), 2 (titles), 6 (French) and 7
(hard bans) apply as written. What differs for a Journal piece:

- **It is first-hand.** He lived what the piece says, so the piece may say "I", recount
  what happened to him and give his own numbers, provided each of those is in
  `notes.md`. If a paragraph needs an example he did not give, ask him for one; never
  supply one.
- **It is opinion, and says so by how it is written.** State what he thinks plainly. No
  `[sN]` citations are needed. When the piece refers to someone else's work, link it
  inline, list it in `sources`, and say what it says fairly before agreeing or
  disagreeing.
- **Shape.** Open on the claim and why it matters to him, in the first two sentences.
  Then one section per principle: the principle as the heading, the reasoning in a
  paragraph or two, then what he actually does about it. Close on what is still open or
  where the idea stops working. No summary, no moral.
- **Tone.** More personal than the blog: what annoyed him, what he got wrong before,
  what he is unsure of. Not confessional, and not a pitch.
- **Priority is shown by the date, never argued.** The page carries its publish date;
  that is the record. Dates he gave ("I have worked this way since spring 2025") are
  stated as facts. Do not write that he was first, ahead, or right before anyone; when
  someone else has published the same idea, say so and say he agrees.
- **Privacy.** Employers, clients, colleagues and private projects are named only if he
  said in this conversation that they can be.
- **Length.** As long as the principles need, usually 600 to 1500 words.

Then write the other language as its own text: same claim, same sections, same
examples, sentences rebuilt for that language rather than translated.

## 4. Read it with him

Paste the full text of the first-language version into the chat and ask him to read
it. He reacts by talking. Apply what he says:

- a sentence he does not recognise as his thought is removed or rewritten from what he
  says instead, never defended;
- anything he adds goes into `notes.md` first, then into both languages;
- repeat until he says it is right. Then show him the other language.

## 5. Check and publish

Run the checks and fix what they report by rewriting the sentence, not by dodging the
rule:

```
./scripts/journal.sh check <key>
```

Then, for each language, start a fresh sub-agent with no knowledge of the conversation.
Tell it to read at least three of the human-written posts in
`pipeline/voice/cache/<lang>/` (run `pnpm voice:refs` if that directory is empty), then
the draft, and to answer one question: would a regular reader of those blogs take this
for a person writing down what they think, or for generated text? It quotes each
passage that tips toward generated and says why. Rewrite those passages from
`notes.md` and ask a new sub-agent again, until one reads it through without stopping.
If a rewrite changes the meaning of anything, go back to step 4 for that passage.

Publish only when he says to, in so many words:

```
./scripts/journal.sh publish <key>
git add src/content/journal && git commit -m "journal: <English title>" && git push
```

The publish date is the day of publication. Republishing a piece updates its text and
keeps its original date. Once the deploy has finished, ask the Wayback Machine for an
independent dated copy of both pages and give him the two archive links:

```
curl -sI "https://web.archive.org/save/https://rachid-chabane.com/fr/journal/<slug-fr>/" | grep -i '^location'
curl -sI "https://web.archive.org/save/https://rachid-chabane.com/en/journal/<slug-en>/" | grep -i '^location'
```

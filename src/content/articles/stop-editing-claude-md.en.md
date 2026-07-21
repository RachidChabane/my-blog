---
translationKey: instruction-file-structure-compliance
lang: en
slug: stop-editing-claude-md
title: Your CLAUDE.md structure is not why the agent stopped listening
publishDate: 21-07-2026
tags:
- agentic-coding
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Instruction Adherence in Coding Agent Configuration Files (arXiv 2605.10039)
  url: https://arxiv.org/abs/2605.10039
  date: 11-05-2026
- label: Claude Code memory documentation
  url: https://code.claude.com/docs/en/memory
  date: 21-07-2026
- label: Tian Pan, writing effective agent instruction files
  url: https://tianpan.co/blog/2026-02-14-writing-effective-agent-instruction-files
  date: 14-02-2026
contentHash: sha256:11acfdc8f3d0929d
publishState: published
---


Your CLAUDE.md structure is not why the agent stopped listening. Compliance falls about 5.6% in odds with every additional function the agent generates [s1], so the variable that moves is how deep you are in the session, not how the file is written. I have rewritten instruction files three times this year, reordering, deduplicating, cutting them in half, and I now think most of that was wasted motion for a file that was already in reasonable shape. The rules that keep getting dropped are not badly worded. They are simply far away from the moment they have to hold.

## What the study varied, and what refused to move

One factorial study manipulated four structural variables of the instruction file and measured compliance with a trivial target annotation across 1,650 Claude Code CLI sessions. None of the four structural variables, and none of the three two-way interactions, produced a detectable contrast after multiple-testing correction [s1].

Seven separate chances for a formatting effect to appear. None of them landed.

That is all the evidence I want from the negative half of this argument, and I am deliberately keeping it to a paragraph. A recap of the paper is not the interesting part.

## Two models of compliance, and only one of them was measured

There are two theories of why an agent quietly stops doing what you told it, and the field only ever argues about the first.

The capacity theory treats the file as a container. Adherence is a property of what you put in it, so the fix is always the same: shorten, deduplicate, restructure, promote the important lines to the top. The official Claude Code memory documentation carries a compressed version of it, stating that instruction files are loaded in full regardless of length while shorter files produce better adherence [s2]. Read that pairing twice. The mechanism you would reach for to explain the second half, truncation or dilution at load time, is disclaimed by the first half in the same sentence. Practitioner guidance takes the same theory and puts a number on it: frontier models are said to reliably follow somewhere between 150 and 200 instructions before compliance starts degrading [s3]. That is a budget, and a budget has no term for time.

The positional theory says something less flattering to the author of the file. An instruction is emitted once, at the top of the session, and then has to survive everything that happens afterwards: forty tool calls, a long diff, a subject change, a pile of accumulated context. On that theory the same file behaves differently at step 2 and at step 40, and no amount of prose surgery changes the shape of the decay.

| Model | Governing variable | The fix it implies | What you would observe |
| :--- | :--- | :--- | ---: |
| Vendor documentation [s2] | File length | Keep the file short | Short files obeyed, long files ignored, at any depth |
| Instruction budget [s3] | Instruction count | Stay under the ceiling | A cliff once the file crosses roughly 150 to 200 items |
| Measured decay [s1] | Session depth | Do not rely on depth | The same file obeyed early and dropped late |

Only the third row was measured on both axes by the same design, and it is the only one of the three that predicts what I actually see in a long agent run: the rule holds for the first stretch of work and then stops holding, with the file untouched the entire time.

## What the measurement establishes, and what I read into it

It matters which half of this is evidence and which half is me.

> [!CONFIRMED]
> Each additional function the agent generates is associated with approximately 5.6% lower odds of compliance, an odds ratio of 0.944, within the session-length range that was tested [s1].

> [!INFERRED]
> I think the guidance industry has been optimising the axis that the one available measurement says does not move. The restructure-your-instruction-file genre is not wrong so much as it is aimed at the wrong variable, and its persistence is explained by the fact that editing a file is something you can do on a Tuesday afternoon, while changing how you run a session is a habit.

The second block is a judgment over facts that are already cited. No single source states it, and I would not want it read as though one did.

## The steelman: half the nulls are only nulls

The strongest version of the objection is not "the study is small". It is that the two halves of my argument rest on evidence of very different quality, and I am speaking in the imperative mood about both.

Start with the nulls. They are not uniformly strong: the size and conflict nulls are supported by affirmative-null Bayes factors, while the position and architecture nulls are failures to reject without Bayes-factor support [s1]. Half of my negative evidence is evidence of absence and half is merely absence of evidence, and the unsupported half includes where an instruction sits inside the file, which is exactly the variable a reader most wants an answer about. Then the positive side: an odds ratio estimated observationally within sessions, bounded to the lengths tested [s1], carrying a confound that will not go away. Later functions are not random draws from the same population as early ones; depth arrives bundled with accumulated context and with drift away from the original topic. And nobody has run a hook against a bullet head to head. On top of all that, a genuinely pathological file, 5000 lines of mutually contradictory rules, obviously does hurt, so the formatting axis cannot be dead in general.

> [!WARNING]
> The odds ratio is bounded to the session lengths that were tested [s1]. Treat "step 40" as shorthand for "deep into a long run", never as a computed forecast. Compounding a per-step odds ratio out to an untested depth produces a striking number and no evidence, and the curve may well flatten.

Here is why I still hold the position. The claim was never that structure is irrelevant; it is that structure is not the marginal lever for a file that is already in reasonable shape. Someone who believes formatting is the lever needed one of seven contrasts to land, and got none, while the single most popular formatting theory in circulation, the instruction-count budget, is the specific null that carries affirmative Bayes-factor support against it. The confound argument, which is the sharpest part of the objection, cuts my way on the prescription: if late-session non-compliance comes from accumulated context and topical drift rather than from a step counter, then a fresh session is a better intervention than I claimed, because it clears the whole bundle at once. An attack that renames the mechanism and leaves the recommendation standing has not beaten the recommendation.

The untested-prescription point is answered by mechanism rather than by data, and I want to be precise about the difference. I am not claiming that hooks were trialled and won. I am claiming that a markdown bullet is stated once at depth zero and must then survive every subsequent step, that a hook fires at the step where it is needed regardless of how deep the session already is, and that a fresh session is depth zero by construction. Those are properties of how the three mechanisms work, not measured results, and they do not need a trial any more than "a cron job fires whether or not you remember it" needs one.

## What I do instead: the step-40 triage rule

Go down your instruction file line by line and ask one question of each line: if the agent violates this at step 40, is the damage recoverable?

If yes, leave it as prose. Naming conventions, directory layout, which package manager the repo uses, house voice: losing these late in a session costs a review comment. The file is where taste lives, and taste degrading gracefully is fine.

If no, it is not a bullet, it is enforcement. Do not commit secrets. Do not touch prod. Always run the tests before you claim it works. Never force-push main. These are the lines that must still hold at step 40, which makes them exactly the lines a markdown file is worst at carrying. A `PreToolUse` hook that pattern-matches the command and exits non-zero costs twenty lines of config and is indifferent to session depth. A session boundary before a risky task costs one keystroke.

The failure mode this is built to catch has a specific shape, and it is worth being able to name it: a rule that is obeyed for the first ten edits and then silently dropped over the next thirty. It reads like a model regression, so people file it as one. It is not. It is the same file, the same model, the same rule, forty steps further down, and if you go back and rewrite the rule in bolder language you will get the same curve with better prose.

So: the file is where taste lives, and the hook is where invariants live. If a rule has to be true at step 40, stop writing it and start enforcing it.

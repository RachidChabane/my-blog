---
translationKey: a-passing-test-does-not-say-done
lang: en
slug: a-passing-test-says-little
title: A passing test says little
publishDate: 19-11-2026
summary: When an agent writes the code and the tests, a passing test proves little.
  Here is what I require before I accept the word “done”.
tags:
- agentic-coding
- evaluation
- qualite
sources:
- label: Konstantinou, Degiovanni and Papadakis, 2024
  url: https://arxiv.org/abs/2410.21136
  date: 18-11-2026
- label: How the Claude Code team thinks about verification (Addy Osmani)
  url: https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/
  date: 18-11-2026
contentHash: sha256:36304d245a884961
publishState: published
---

An agent writes the code, then the tests, and the tests pass. I conclude almost nothing from that. A test can stay green while the code it runs is broken, and tests written by the model that wrote the code tend to assert what the code does rather than what was asked ([Konstantinou, Degiovanni and Papadakis, 2024](https://arxiv.org/abs/2410.21136)). The agent says it is done all the same, and all I have is its word.

I wrote two tools about this, shallnot and then musthold. What follows are the rules they apply.

## A test says which requirement it verifies

In my specs a requirement is written with an identifier and a revision, for instance `PWD-2~1` for “a password containing the username is rejected”. The test covering it says so in its name: `[verifies PWD-2~1]`. Until some test cites `PWD-2~1`, I treat the work as in progress, even if the agent has ended its turn. I then have a list of requirements to go down, each with or without a test next to it.

## A tag only counts if the test ran

You could settle for looking for the tags in the test sources. But a tag in a comment, or on a test that is never launched, turns up just fine in a text search. So I only read the results file, the JUnit XML the test runner writes: the test has to be in it, it has to have passed, and it has to be the one carrying `PWD-2~1`.

## When a requirement changes meaning, its old tests stop counting

Someone rewords `PWD-2`, keeps the name, and its tests keep passing although they were written for the old sentence. Nothing flags it. Hence the `~1`: when the meaning changes the requirement becomes `PWD-2~2`, and every test still citing `~1` fails until someone has read it again.

## The check does not go through a model

shallnot is a binary that touches neither the network nor a model. I want to rerun the check on the same files and get the same report. In musthold a model does take part, but only to propose: a way to break the code, for instance. Then the code is run, and a broken variant counts only if it builds, lets the other requirements' tests pass and fails an example of its own requirement.

## Tests must fail on wrong code, which the agent never sees

Knowing a test passes on correct code is not enough for me, I want to know whether it would fail on code that breaks the requirement. So for each requirement musthold breaks the code in that precise way and watches whether the tests notice. If they miss it, the agent is given the name of the requirement and an input its tests do not tell apart. It is never shown the broken code, otherwise it would write a test fitted to that case and we would have learned nothing.

## On the third block with no progress, I am the one who looks

The check runs at the end of a turn and hands its findings back to the agent, which carries on. After three blocks with no progress it stops blocking and tells me. The Claude Code team describes the same rule in [its post on verification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/): if a check still fails after three rounds, Claude stops and brings in a person.

Their post has two other rules I do not cover here: running the app end to end matters more than tests, and a change able to modify the check that judges it leaves that check broken.

## What none of this proves

A green check means every requirement is cited by a test that ran and passed. A tagged test that asserts nothing still passes. Judging whether a test is any good remains a review job, and I do not know how to make it fully mechanical.

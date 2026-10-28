---
translationKey: musthold-proof-in-the-loop
lang: en
slug: a-passing-test-is-not-evidence-the-requirement-holds
title: "A Passing Test Is Not Evidence That the Requirement Holds"
publishDate: 27-10-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: "Musthold, recorded agent loop transcript (BOX-4 session)"
  url: https://github.com/RachidChabane/musthold/blob/main/demo/loop/recording/transcript.md
  date: 27-10-2026
- label: "Musthold README"
  url: https://github.com/RachidChabane/musthold/blob/main/README.md
  date: 27-10-2026
- label: "musthold-demo scans README"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/README.md
  date: 27-10-2026
- label: "musthold scan report, my-blog @ d20d7a9"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/my-blog-d20d7a9-full.md
  date: 27-10-2026
- label: "musthold scan report, shallnot @ 397e092"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/shallnot-397e092-full.md
  date: 27-10-2026
- label: "musthold scan report, musthold module format @ ca1b54f"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/musthold-format-ca1b54f-full.md
  date: 27-10-2026
- label: "loop-1 pre-registration"
  url: https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/PREREG.md
  date: 27-10-2026
contentHash: sha256:a0a3b70e319564d2
publishState: published
---


An agent's passing test tells you the code survived the one input the agent chose, not that the requirement holds, so I built Musthold to turn each requirement into a proof that runs inside the agent's loop. The proof asks one question the green checkmark never asks: would these tests fail if the code broke the requirement?

> [!NOTE]
> Musthold does not prove that code is correct. A pass means that no violation it tried survived the tests, which makes it a floor rather than a certificate.

## The test that passes and checks nothing

Agents write code and tests in the same breath, and the tests tend to assert what the code does rather than what was asked. A suite can stay green while the lines it runs are broken, because nothing in the suite would notice.

Shallnot, my first tool, closes the first gap. It checks that each acceptance criterion of a spec has a test that cites it, and that the test passed. That catches a requirement nobody tested, but not a test that cites the requirement and checks almost nothing.

Musthold adds two proofs for each requirement [s2]:

- **Discriminating power.** Its tests must fail on a mutant, a small change to the code that violates the requirement.
- **Alignment.** Each test must check what the requirement says, not something nearby.

The verdict comes from execution. A mutant counts only if it builds, passes the tests of the other requirements, and fails an example of its own requirement or a witness test written from the spec before any mutant existed [s2]. No model's opinion blocks an agent on its own.

## One recorded session

The demonstration is a small box office that prices a cinema ticket from the buyer's age. I started Claude Code with Sonnet 5.5 on task BOX-4, which asks for free entry for children under 3. The runner starts the real CLI and the real modules in containers and records what they print, so I wrote none of the transcript [s1].

One existing test is weak on purpose. The test of BOX-2 (65 or older pays 8) cites the criterion and passes, but it only checks age 70.

The agent implements BOX-4, adds its test and runs the gate by hand. The gate reports four requirements covered and passing, plus eight blocking findings, because no proof exists for any of them. A missing proof never passes. The agent then runs the `prove-all` skill.

Next, `musthold-dp` blocks on BOX-2. Three mutants pass every test of the criterion. Two fail its example `ticket_price(age=65) => 8`; the third fails a witness test over ages 65 to 120 [s1]. The agent receives the requirement and an input the tests do not distinguish. It never receives the mutant's code, so it cannot fit a test to the mutant and can only reason about the requirement.

The agent adds a test:

```python
@pytest.mark.verifies("BOX-2~1")
def test_senior_prices_start_at_sixty_five():
    assert ticket_price(age=65) == 8
    assert ticket_price(age=120) == 8
```

The proof passes on the next run, the agent publishes its proofs, and Shallnot's end-of-turn gate allows the stop [s1]. In its own summary, the agent writes that the only existing test for BOX-2 used age 70, so mutants that shifted the 65 boundary survived.

In this recording the block came from the `musthold-dp` verdict in the agent's own output, after it ran the proofs the gate said were missing. The end-of-turn hook fired once, at the end, and allowed the stop [s1]. By design, the hook holds the agent while a proof is owed or failing [s2]. This session shows the counterexample and the correction, but not the hook holding the agent.

The session took 9 min 17 s and the CLI reported 2.38 USD [s1]. That figure is notional, since the run used a subscription token and nobody paid it per call.

## Scanning a repository without a spec

Most repositories have no spec in Shallnot's format, and `musthold-dp scan` needs none. It runs the suite, breaks the code that a sampled green test runs, and lists the tests that still pass on every proven change [s2].

I ran it on my own repositories. A full scan samples 40 green tests [s3], and the reports found:

| Repository | Sampled green tests that verify nothing |
| --- | ---: |
| my-blog | 3 of 40 [s4] |
| Shallnot | 1 of 40 [s5] |
| Musthold, module `format` | 1 of 40 [s6] |

"Verify nothing" has a narrow meaning: the test passes on every proven change in the lines it runs. Each report names the change and ships a script that replays it. The other sampled tests are caught or unproven, and the reports say which. These are 40-test samples of my own code, and they give no rate for software in general.

I think the numbers are small enough to be believable and large enough to matter. Even in a repository whose author cares about tests, a few green tests would not notice a broken line.

## What I have not shown

Musthold has not yet shown that agents ship fewer defects with it. The session above shows the loop working once, on a fixture I built, with a weakness I planted, which makes it an illustration rather than a measurement.

The measurement is a study called `loop-1`, pre-registered and frozen with its replication kit. A blind oracle that the agent never sees will count defective changes in two arms: a gate that requires traceability alone, and a gate that requires discriminating power and alignment as well [s7]. I will publish the result whatever it is, including a null one.

> [!NOTE]
> Update, 28 October 2026: `loop-1` ran, and its result is inconclusive. The agent shipped no defective change in either arm, 0 of 18 each, so the gate had nothing to stop. The study also found that the gate requiring the proofs rejected 4 of 18 correct changes whose proofs the session never published. The report is [`experiments/loop-1/results/REPORT.md`](https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/results/REPORT.md).

## Try it

The scan takes one command, from the repository's README [s2]:

```
go install github.com/RachidChabane/musthold/discpower/cmd/musthold-dp@latest
musthold-dp scan
```

It needs no spec, model or configuration, and the quick scan takes about a minute and a half.

For the loop, install the four binaries and the Claude Code plugin (`/plugin marketplace add RachidChabane/musthold`, then `/plugin install musthold@musthold`), then run `shallnot init` and `init` plus `enable` for each module. The [repository](https://github.com/RachidChabane/musthold) has the details.

If you want to replicate or refute the study, the protocol is [`experiments/loop-1/PREREG.md`](https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/PREREG.md).

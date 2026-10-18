---
translationKey: lean-kernel-cross-checks-only-help-when-kernels-fail-differently
lang: en
slug: a-second-proof-checker-only-helps-if-it-fails-differently
title: A second proof checker only helps if it fails differently
publishDate: 18-10-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Leonardo de Moura, Lean Now Ships with Verified Kernels (AI-found vulnerabilities)
  url: https://leodemoura.github.io/blog/2026-10-15-lean-now-ships-with-verified-kernels/
  date: 15-10-2026
- label: 'Leonardo de Moura, Postmortem for Kernel Soundness Bug #14576 (Collatz disproof)'
  url: https://leodemoura.github.io/blog/2026-8-1-postmortem-for-kernel-soundness-bug-14576/
  date: 01-08-2026
- label: Leonardo de Moura, Postmortem for the Kernel Soundness Bug Hunt (threat model)
  url: https://leodemoura.github.io/blog/2026-8-24-postmortem-for-the-kernel-soundness-bug-hunt/
  date: 24-08-2026
- label: Thomas Hales (guest post), What mathematicians should know about the Lean
    Theorem Prover (cross-checking)
  url: https://terrytao.wordpress.com/2026/10/09/what-mathematicians-should-know-about-the-lean-theorem-proverquestions-of-reliability-and-ai/
  date: 09-10-2026
- label: Ramana Kumar, CollatzLean README at the disproof commit (verification pipeline)
  url: https://raw.githubusercontent.com/xrchz/CollatzLean/a79357462a33d2a6babd4cf6c8d8bcd25425d653/README.md
  date: 25-07-2026
contentHash: sha256:95bf8e29f717880b
publishState: published
---


I think a second proof checker protects against AI-generated proofs only when it fails differently from the first: separately written, and on a current release. The Lean FRO's bug-hunt postmortem says the authors consider AI-generated proofs a potential source of malicious proofs [s12]. The same postmortem sets out the actions the Lean FRO is taking to increase trust [s24]. Its release post opens on the threat: AI agents are very effective at finding vulnerabilities in the FRO's software, the kernel of the Lean proof assistant included [s1]. I read the record as showing two ways a second checker can fail the same way as the first, and both apply to any team that gates model output on a checker.

## What a recheck adds to a build

I think the build that compiled a proof is the wrong place to trust it, and Lean's tooling now says as much. The bug-hunt postmortem says `lake build` does not protect users from adversarial proofs that try, for example, to corrupt memory using Lean extensions [s13]. A build runs whatever the development asks it to run, so a hostile proof gets a say in its own checking.

Lean's answer is a separate pass. The release post says Lean v4.35.0 comes with the `lake check` command, which exports a development and rechecks it with leanchecker, "the official Lean kernel without all the baggage around it" [s2]. It goes further: Lean now ships with four additional kernels, nanoda, lean4lean, con-leche and con-ron, and the release post says `lake check --paranoid` rechecks a development with all of them [s3]. In that mode, the release post adds, Lean also runs a variant of the official kernel built with a hardened memory allocator, which turns memory corruption into a checked abort [s30].

That is a lot of machinery pointed at one question: is this proof term well-typed? I count it the way I would count reviewers on a risky pull request: reviewers trained on one codebase by one person share a blind spot.

The question is how many of those passes are independent.

## How a cross-check passed a false proof

I think the incident is instructive because the pipeline that let it through looks like one I would have written. Per the Collatz postmortem, on July 25 Ramana Kumar published a repository containing a sorry-free "disproof" of the Collatz conjecture, produced with AI assistance, which exploits a bug in the kernel's handling of nested inductive types [s8].

The repository's README did the careful things. The README says the project pins Lean and Mathlib to v4.32.1 [s20]. The README presents the argument as witness-free: it claims to establish the existence of an exceptional orbit without selecting a concrete natural number [s22]. Its verification pipeline, per the README, includes warnings as errors, an ordinary and a full fresh leanchecker replay, safety, closure, direct kernel and axiom-dependency checks, a targeted lean4export of the public result, and independent checking by pinned Nanoda with no permitted axioms [s25]. The README's own word for the Nanoda check is "pinned" [s21].

Read that list by lineage and it shrinks. By my count, the leanchecker replay re-runs the official kernel, the lineage that carried the bug, so of the checks the README lists, one is an external kernel.

> [!CONFIRMED]
> The Collatz postmortem reports that the repository also passed a week-old version of nanoda, the main external checker [s9]. The postmortem adds that the nanoda bug had been fixed a week before the Lean bug was reported, and that the proof was built so that the expression the kernel never inspects is one the old nanoda accepted [s26]. The postmortem's conclusion: checking with an independent kernel still works, since it required two distinct bugs in two implementations, but users who rely on it need current versions of both [s10].

> [!INFERRED]
> My reading: the README's pinned Nanoda is the week-old nanoda the postmortem describes. Nothing in the record states it. If it is, the pin did its job for reproducibility and kept a bug that had already been fixed upstream inside the acceptance path.

The FRO draws the currency lesson for its own tools. The Collatz postmortem says comparator.live now runs nanoda by default, and nanoda is tracked daily so that lean-eval and comparator stay current after upstream fixes [s28]. So the FRO keeps its copy of the checker moving while the user-side pipeline held it still, and I think that gap is the practitioner lesson. Pinning is what a careful engineer does for a build. Tracking upstream is what a careful engineer does for a gate. The README applied the build habit to the gate.

## Count the kernels by lineage

I think the extra kernels give fewer independent votes than their number suggests, and the release post itself shows why. The Collatz postmortem describes nanoda as an independent kernel for Lean implemented in Rust [s27]. The same postmortem says lean4lean is affected by the kernel bug, since its handling of inductives is a port of the reference implementation [s11]. The release post says con-leche is the first kernel for Lean written in Lean and proven consistent, implemented and proven consistent by Claude (Fable and Opus) under heavy supervision at the Lean FRO [s4]. It then describes con-ron: the release post says AI was used to translate con-leche to Rust, and Aeneas was used to prove that the Rust version refines con-leche's checking algorithm [s29].

Here is how I sort the checkers that `lake check --paranoid` runs, by what each one is independent against.

| Checker | Code lineage, per the Lean FRO | What I count it as |
| :--- | :--- | :--- |
| leanchecker | the official kernel, stripped down [s2] | the reference vote |
| hardened variant | the official kernel, hardened allocator [s30] | the reference vote, with memory corruption made loud |
| lean4lean | inductives ported from the reference [s11] | not independent on inductives |
| nanoda | independent, written in Rust [s27] | a separate vote, if current |
| con-leche | written in Lean, proven consistent [s4] | a separate vote on the algorithm |
| con-ron | con-leche translated to Rust, proven to refine it [s29] | con-leche's vote, on another compiler |

The con-ron row is a design choice: sharing con-leche's algorithm is the point of a proven refinement. The lean4lean row is different, because porting brought the bug along.

A guest post by Thomas Hales comes at the same worry from the mathematician's side [s23]. Hales writes that cross-checking the proof by different kernels does not remove all doubt [s16]. Hales adds that different kernels might have the same defects, and that some of these errors can be mitigated by running kernels implemented in different programming languages on different hardware and operating systems [s17]. Hales points to a kernel implementation that does not look at the official kernel's source code, to avoid copying bugs from one kernel to another [s18]. Hales learned of a Lean bug this summer, when it produced a short illicit proof of the Kepler conjecture in Lean [s19].

I read his remedies as the two axes of my table: separate writing for the algorithm, different languages and hardware for the toolchain. I count checkers by lineage, and I count a verified kernel and its proven translation as one vote on the algorithm and two on the toolchain. Binaries are not votes.

## The stale pin, and what I run at acceptance

I call the failure mode **the stale pin**: a checker frozen in the lockfile for reproducibility that keeps accepting a bug its upstream has already fixed. It is quiet by construction. The pin exists so that nothing changes, and a bug fix is a change.

A current release protects only against bugs someone has already found and fixed. As I read the postmortem, the nanoda side of the Collatz exploit was exactly that kind of bug.

My rule keeps both habits and gives each its own job. I keep the pinned toolchain for reproducing the build. At acceptance I run the same development on the current toolchain with `lake check --paranoid`, then the current release of each separately written checker, and I reject the proof on any disagreement. As I read the release post, the extra kernels ship with Lean, so a pinned toolchain plausibly pins every kernel at once.

```bash
# reproduce: the toolchain the project pins, unchanged
lake build
lake check
# accept: the same development on the current toolchain, every shipped kernel
lake check --paranoid
# then run the current release of each separately written checker you trust
```

I think the two jobs answer different questions, and the second one decides what gets merged.

In my judgment the same stale pin waits in any team that gates model output on a checker. Tests the agent wrote for its own patch share a lineage with the patch. A judge built on the same model as the generator shares one with the output it grades. I think a pinned evaluator is right for reproducing a score and wrong as the only gate at acceptance.

## The strongest case against

I think the FRO's own case against my worry is strong. The postmortem concludes that checking with an independent kernel still works. The release post says con-leche's approach eliminates a complete class of bugs, programming mistakes in the kernel implementation [s5]. And the bug-hunt postmortem says none of the groups using publicly available models reported any bugs [s15]. On that reading the extra kernels work as designed, and the lineage worry is theoretical.

I accept the FRO's point that even a stale external kernel made the attacker find a second bug, in a second implementation, and that raised the cost of the exploit. As I read it, the cost rose once, and the pin kept it from rising again.

The postmortem's conclusion also carries its own condition: current versions of both. The release post says con-leche is not bulletproof, because there might be bugs in the compiler and runtime used to build it [s6]. The FRO's answer to that caveat is con-ron. I read the quiet bug hunt for public models as saying little about the agents the FRO calls very effective at finding vulnerabilities, the agents that will write my next proof.

The sharpest objection to my own rule is that a current release is hindsight: it is the newest version, whose bugs nobody has found yet. I think that is true, and it is why I scope the rule to fixed bugs.

> [!WARNING]
> The bug-hunt postmortem reports that the official Lean distribution for Linux was not using the latest GMP v6.3.0 [s31]. The same postmortem explains that its Linux CI built Lean binaries with GMP v6.1.2 for libc compatibility, a version with a bug that could be exploited to construct a proof of `False` [s14]. I read it as the stale pin one layer down: a dependency held back for a good reason, under the kernel every vote relies on.

Count by lineage, pin to reproduce, run current to accept. Run the current kernels before you merge the proof.

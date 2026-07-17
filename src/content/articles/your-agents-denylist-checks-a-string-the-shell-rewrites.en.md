---
translationKey: command-denylist-not-a-security-boundary
lang: en
slug: your-agents-denylist-checks-a-string-the-shell-rewrites
title: Your Agent's Command Denylist Checks a String the Shell Then Rewrites
publishDate: 17-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'One Goal, Many Commands: Characterizing Denylist Fragility in AI Agents
    (arXiv 2606.15549)'
  url: https://arxiv.org/abs/2606.15549
  date: 14-06-2026
- label: Adversa AI, GuardFall shell injection in open-source AI coding agents
  url: https://adversa.ai/blog/opensource-ai-coding-agents-shell-injection-vulnerability/
  date: 30-06-2026
- label: The Hacker News, GuardFall exposes open-source AI coding agents to decades-old
    shell injection risks
  url: https://thehackernews.com/2026/06/guardfall-exposes-open-source-ai-coding.html
  date: 30-06-2026
contentHash: sha256:304b5a59562c6553
publishState: published
---


The auto-approve config you shipped this quarter checks a string that bash has not finished rewriting. Your gate and your shell disagree about what the command is, and they disagree by construction, so no rule you add closes a gap that only opens after your rule has already run.

That is a claim about layers, not about list quality, and it has an uncomfortable consequence: the effort you spend hardening the list buys you almost nothing, because the list is stationed at the wrong layer to be hardened.

## What the gate actually checks

Your gate runs a predicate over the text the model emitted. Then bash gets that same text and, before any syscall happens, rewrites it: parameter expansion, command substitution, alias and function resolution, quote removal, PATH lookup. The token your matcher inspected and the program the kernel eventually executes are separated by a rewriting pass your matcher does not model.

The failure mode has a name, and it fits on one line. Your denylist holds `rm -rf /`. Write it as `r""m -rf /` and the matcher sees a string it has never heard of; quote removal hands `rm` to the executor anyway. Or skip the lexical games entirely and let substitution do the work:

```bash
$(echo cm0K | base64 -d) -rf /
```

At match time that command contains no `rm` at all. At execution time it contains nothing else. You can block `base64`, and then someone reaches for `printf`, or `$'\x72m'`, or a variable assembled two lines earlier. Each patch is a rule about a specific spelling, and the shell's job is generating spellings.

So this is not a coverage problem that a longer list eventually solves. It is a layer problem: the gate is checking an artifact, and the shell executes the act.

## The maintenance rebuttal, killed

The obvious reply is that this is just bad list-keeping. Sloppy lists are fragile; careful lists are fine; write a better list.

That account makes a prediction, and this is what makes it worth taking seriously rather than dismissing: it predicts variance. If fragility tracks effort, then effort should show up in the measurements. Well-resourced lists should be measurably safer than careless ones, and the distribution should be lumpy, with the good teams clustering at the safe end.

The measurements have the wrong shape for that story. ShellSieve was applied to 1,709 real-world command denylists containing 13,332 rules collected from GitHub, and 69.0 to 98.6 percent of those denylists are fragile, with that fragility occurring consistently across projects and agents [s1]. Consistently is the load-bearing word. There is no safe end of the distribution to cluster at.

Then there is the datum that ends the argument. Even Claude Code's built-in denylist, well-maintained by its developers, can overlook bypass commands that invalidate its effectiveness, leaving a list that cannot block operations practitioners expect it to block [s4]. Those are the people with the most context, the most incentive, and the most direct feedback about their own list. If maintenance were the fix, that list is where maintenance should have won.

The economics finish it. ShellSieve is an LLM-driven pipeline: it prompts the LLM to propose possible bypasses and iteratively repairs them using feedback from a validator that executes them in a sandbox [s1]. Sit with the asymmetry. You enumerate the space of spellings by hand, one commit at a time. The attacker samples it with a loop. That is not a 1990s observation about shell semantics; it is a 2026 statement about what a bypass search costs, and it is what turns a practice that was merely imperfect into one that is hard to defend.

> [!WARNING]
> This is not a bug in one vendor's list. Every hook-based guardrail and every auto-approve config shipped this year inherits the same defect, because they all match on the pre-expansion string. If your safety story is a regex over a proposed command, you have this problem, and having written the regex yourself does not exempt you.

## The steelman, answered

Here is the strongest version of the case against me, and it is a good one.

The threat model is wrong. Nobody in your repo is attacking you. The realistic failure is a cooperative model that misreads an instruction and runs a destructive command by accident, and a denylist stops exactly that. It catches the accidental `rm -rf` on the first try, because a model making a mistake types the obvious spelling, not `r""m`. Judged against the risk that actually occurs, the list is doing precisely the job it was hired for, and the injection scenario is a security researcher's daydream.

That argument holds right up until the agent reads something. The moment it ingests untrusted repo content, an issue thread, a dependency's README, or a fetched page, the input is adversarial and the model is a faithful executor of whatever that input says. Prompt injection does not require an attacker with access to your machine. It requires an attacker with access to text your agent will read, which today is roughly everyone.

And once the input is adversarial, the accident-guard framing inverts. The list was built to catch the spellings a careless model produces. It is now facing spellings selected specifically because they are not on it, generated by a search loop that runs against a sandbox validator until one lands [s1]. A guard tuned for typos is meeting an optimizer.

## What closing it looks like

The survey data is where I have to concede something. Of the eleven agents surveyed, ten leave the agent-to-bash boundary exploitable, in one of four ways [s2]. Four ways, not one. My rewriting story explains the class of failures where the gate and the executor disagree about what the command is; it does not explain all four, and I am not going to stretch it to. Some of that surface is ordinary unlisted binaries and plain omissions, and those really would yield to a better list.

The tenth agent is the interesting one. Continue is the one agent examined that empirically closes the F01-class bypass surface [s3]. Take that for exactly what it is: proof that the surface is closable. One agent, one class. It is an existence proof, not a mechanism, and it does not tell you that moving the boundary is the only way to get there.

## The class is thirty years old

Nothing here is new. The class is decades-old shell injection [s5], and I think its age is the most damning fact in the piece rather than a reason to shrug.

Run the maintenance account forward thirty years. A defect this well documented, with this much literature, this many post-mortems, and this many people who can explain it at a whiteboard, should have been maintained away by now. It was not. It got picked up and re-shipped, at scale, by the most sophisticated engineering teams in the industry, inside their newest products. A failure that survives being universally understood is not a failure of understanding. It is a structural fact about where people keep putting the check.

## The verdict

So change the budget line, because that is the decision this actually touches.

Stop funding denylist coverage as if it were security work. Every hour spent on the next twenty rules is buying accident coverage priced as adversary coverage, and the gap between those two is where your incident lives. Keep the list; it is genuinely good at catching the cooperative model's obvious mistakes, and that is worth having. File it under UX.

Then put the real boundary underneath the rewriting layer, where the shell cannot reach in and change the string after you have looked at it. Parse the command into a structure and decide against the structure, or stop deciding about commands entirely and sandbox the blast radius: no credentials in the environment, a filesystem the agent cannot escape, egress you control. The test for any control you are considering is one question. Does bash get a chance to rewrite this after my check runs? If yes, you have bought an accident guard, whatever the config file calls it.

> [!CONFIRMED]
> Continue is the one agent examined that empirically closes the F01-class bypass surface [s3].

> [!INFERRED]
> What I think it buys is the end of the counsel of despair. Ten of eleven is not a law of nature, and someone shipping today already cleared the bar.

---
translationKey: llm-contribution-policy-premise-decides-the-leak
lang: en
slug: your-llm-policy-premise-decides-what-it-lets-through
title: The premise of your LLM policy decides what it lets through
publishDate: 08-08-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: Rust, the review-bandwidth number
  url: https://blog.rust-lang.org/inside-rust/2026/08/05/rust-langrust-is-adopting-an-llm-policy/
  date: 05-08-2026
- label: OpenJDK interim policy, the prohibition
  url: https://openjdk.org/legal/ai
  date: 08-08-2026
- label: LWN on the GCC policy, the copyright line
  url: https://lwn.net/Articles/1086041/
  date: 29-07-2026
contentHash: sha256:e2198d1dbf0469ee
publishState: published
---


If you are writing an LLM contribution policy for your repository, the premise you start from decides where the rule will leak. Three toolchain projects published theirs recently, each reasoning from a different starting point, and all three landed on the same instrument. The instrument was forced. What sits underneath it is a choice, and that choice is the thing you inherit.

## Three premises, one instrument

Rust starts from review capacity. The project has long had more people who want to write code than people willing to review it, and the arrival of LLMs makes that worse [s1]. The rule it derived permits using an LLM to answer questions, analyze, distill, refine, check, suggest and review, stops short of creation, and makes some of the permitted uses disclosable [s2].

OpenJDK starts somewhere else entirely. The Oracle Contributor Agreement requires a contributor to own the intellectual property rights in each contribution and to be able to grant them to Oracle without restriction; most generative AI tools are trained on copyrighted and licensed content, their output can include content that infringes those copyrights and licenses, and whether the user of such a tool holds IP rights in its output is the subject of active litigation [s6]. That premise leaves one conclusion available. Contributions in the OpenJDK Community must not include content generated in part or in full by large language models, diffusion models or similar deep-learning systems, across repositories, pull requests, e-mail, wiki pages and issues, while private use to comprehend, debug and review code stays allowed [s5].

GCC inherits its premise from copyright law as the GNU Project already reads it. The policy declines legally significant contributions that include or are derived from LLM-generated content, takes its definition of legally significant from the GNU Project maintainer guidelines, and still leaves GCC maintainers free to accept generated test cases [s8].

Same instrument at the end of all three: what the author declares about the change.

| Project | Premise it starts from | What the rule forbids | Where I expect it to leak |
| --- | --- | --- | --- |
| Rust | review capacity [s1] | creating content with an LLM, while assistance stays allowed and sometimes needs disclosure [s2] | at the boundary between refining a draft and producing one, which only the author can see |
| OpenJDK | intellectual-property exposure under the contributor agreement [s6] | contributing any LLM-generated content at all [s5] | at verification, since a total ban is a norm with no check behind it |
| GCC | copyright significance, at the GNU threshold [s8] | legally significant LLM-derived contributions [s8] | underneath the threshold, where small generated hunks stay compliant |

The fourth column is my judgment, and the rest of this piece is about it.

## The declaration was the only object available

Let me concede the obvious part before anyone presents it as a finding. Origin leaves no reliable trace in a diff, so a rule about where a contribution came from has to attach to something the submitter says. Open source has worked this way for two decades: the Developer Certificate of Origin, contributor licence agreements, every plagiarism rule, all of them unverifiable self-attestations enforced after the fact. Three LLM policies converging on the author's declaration was forced by that constraint, and calling it a discovery would be generous.

What the constraint forces downstream is more interesting. Rust spells it out for reviewers: the responsibility for determining whether a PR is LLM-generated sits with the author rather than the reviewer, a PR template will ask authors directly, uncertain cases go privately to moderation, and style is not evidence [s4]. In my experience that last clause is the one doing the work, because it disqualifies the inference a tired reviewer reaches for first.

## Each premise picks a different leak

A threshold rule leaks below the threshold. GCC's policy borrows the GNU Project maintainer guidelines' line for legally significant content, around 15 lines of code and/or text, and declines LLM-derived contributions that clear it [s8]. It also leaves research, analysis, bug discovery and reporting, and patch review untouched, so long as the output stays out of the contribution [s9]. That is a coherent rule with a measurable edge, and contributors optimize against measurable edges.

> [!WARNING]
> In my experience the failure mode here is quiet compliance: a contributor who keeps every generated hunk under the significance line never trips a threshold rule, keeps submitting, and the policy reports itself as respected while the review queue grows.

A licensing premise leaks in the opposite direction. The rule it produces is a flat prohibition on generated content in contributions [s5]. In my experience the gap shows up in one specific way: a contributor generates a patch, retypes it by hand, and submits something whose keystrokes are theirs while its origin is the model. No step in a review pipeline separates that patch from one written from scratch, so what the project holds is a strong norm and a form.

Judgment decides where a capacity premise leaks, and only the author has access to it. Rust permits an LLM to check, refine and review while stopping short of creation [s2]. In my experience the boundary between improving a draft and producing one is not a boundary at all: two honest contributors will place it differently on the same pull request, and both will file a truthful declaration.

## The strongest case against this

The strongest objection is that I have written at length about an analytic truth. If origin is undetectable, a declaration is the only available object, so three projects converging on declarations follows from the problem rather than from anything they discovered. On that reading, the divergent-premises framing is decoration over a conclusion with no alternative available.

That objection is right about the form and quiet about the scope. The form was forced; the scope was chosen. Nothing in "origin is undetectable" tells you whether to ban generated content, permit assisted work under disclosure, or draw the line at a copyright threshold, and those three rules fail in three different places. A maintainer writing a policy this quarter has to pick one, and the premise they pick decides which failure they get.

There is a second thing the objection leaves standing, and it is why Rust repays a close read.

> [!CONFIRMED]
> The policy states that some of its parts are unenforceable and that this is not a bug, so moderators can identify violations on the basis of actions and consider intent only when deciding how to respond [s3].

> [!INFERRED]
> My reading: that is the most transferable sentence in the three documents, because it changes what a contribution rule is understood to be for. An unenforceable rule still converts an argument about hidden intent into an argument about a stated declaration, and a declaration is cheap to adjudicate.

The Developer Certificate of Origin never argued for itself in those terms. Rust does.

## The rule taxes the thing it protects

These policies exist to protect reviewer attention, and the pressure is measurable. At the time of writing there are 1,281 open PRs to rust-lang/rust, a staggering amount of time invested by both authors and reviewers [s1]. The same pressure shows up from the other side of the review: generative AI tools make it easy to create large quantities of plausible-looking code with plausible-looking tests that is nonetheless incorrect or poorly designed, and reviewing such submissions can easily become a drain on the already limited time of human reviewers [s7].

Now price the rules against that. Each of them adds a step to a review that did not have one: read the declaration, decide whether you believe it, decide what to do when you do not. I think this is the part nobody has costed, because the cost of producing a submission keeps falling while the cost of checking a claim about it does not. The lever these projects reached for spends the resource it was built to defend.

## What I would put in my own CONTRIBUTING.md

Here is what I would ship. One declaration field in the pull-request template. Rust is adding one that asks authors whether their code was LLM-generated [s4]. I would phrase mine about this change rather than about the contributor's habits, because habits are not what a reviewer needs to know. One machine-checkable commit trailer, `LLM-Generated: yes|no|assisted`, so that `git interpret-trailers --parse` turns a policy question into a field CI can require and a maintainer can grep six months later. And one sentence at the top of the file naming the premise, so whoever edits the policy next knows which failure mode they are trading against.

What I would not ship is a line count. A threshold buys legal defensibility and hands every contributor a way to stay compliant while doing the exact thing the rule exists to discourage. My preference is a rule I cannot enforce paired with an audit trail I can read.

## What I am watching

The signal that would change my mind is what the declaration fields come back saying. If they read overwhelmingly negative on projects whose review queues keep growing, the field has become paperwork and the bargain failed. If maintainers report that it changes how they triage, the unenforceable rule earned its place. I expect the first serious argument to be about assisted work rather than generated work, because that boundary lives inside the author's head and no policy text can move it somewhere a reviewer can see.

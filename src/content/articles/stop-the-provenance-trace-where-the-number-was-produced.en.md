---
translationKey: fabricated-statistics-site-keeps-feeding-live-llm-retrieval
lang: en
slug: stop-the-provenance-trace-where-the-number-was-produced
title: Stop the provenance trace at the page that says how the number was produced
publishDate: 31-10-2026
tags:
- retrieval
- rag
- qualite
category: essays
difficulty: 3
sources:
- label: Peec AI, Publish stats, get cited (vantage)
  url: https://peec.ai/blog/publish-stats-get-cited-the-tactic-that-put-my-data-all-over-the-web
  date: 07-10-2026
- label: 'Aggarwal et al., GEO: Generative Engine Optimization, arXiv 2311.09735 (method
    definition)'
  url: https://arxiv.org/abs/2311.09735
  date: 16-11-2023
- label: 'Trakkr Research, Zombie Stats: where the numbers AI quotes come from (method)'
  url: https://trakkr.ai/trakkr-research/zombie-stats
  date: 28-10-2026
contentHash: sha256:f8e05cf5e8866bde
publishState: published
---


I think a grounding check that confirms the cited page holds the number passes a laundered statistic, and so does a trace that stops at the first credible page citing it. Trakkr Research asked five AI assistants 200 questions that call for a number [s21], with web search on [s20], and walked the trail of a random sample of 1,285 cited statistics [s14]. Trakkr reports that the page an assistant cited contained the figure 82% of the time [s16], while 40% of the traced statistics reached a study that says the same thing [s15]. In my reading, that gap is the failure mode in plain sight: a one-hop containment check certifies a faithful copy, and a trace that trusts the first credible citer certifies a laundered one.

## What the cited page holds

Both numbers can be true at once because they grade different steps. Containment grades the copy, and it is silent about where the copy came from. Trakkr reports that only 21% of the pages cited for a number were the original research [s17]. Its write-up says the pages AI cites are mostly blogs and roundups repeating a number [s22], and it tells publishers that the page AI cites for their numbers is often a roundup or a blog that copied them, sometimes with an older figure [s23]. Trakkr also reports that another 8% of the traced statistics reached the study with the number or its context changed on the way [s15]. In my reading, a containment check on such a copy still passes.

The Peec AI post comes at the same failure from a separate case. Its author writes from a company that talks about GEO and SEO every day [s1], and the post names the pattern citation laundering [s30]. On day one, the post says, a fake number on its site had zero authority; then an academic paper cited it, then a bank, so the next person or model that finds it sees a stat with a source [s24]. The post adds that every citation made the fake data look more trustworthy [s25].

In my reading, that chain produces exactly the pages a tracer stops on. An academic paper looks like an origin. So does a bank.

## A supply built to be fetched

The number at the bottom of that chain took a day to make, and that speed matters for anyone who retrieves at answer time. About 7 months before the post, its author launched a website with 50,000 statistics [s2], and by the author's own account every one of them was fake [s3]. The author bought a brand-new domain, stateglobe.com, and generated 50,000 statistics pages in a single day with GPT-4.1 [s4]; the post says every number was totally invented [s5].

On this site, in my reading, search visibility and live reads came apart. Two Google updates came out right after launch and the author's Google visibility collapsed [s6]. Yet in the last 30 days, the post reports, the site still got more than 600,000 requests from bots [s7], around 72,000 of them from ChatGPT-User [s8], the agent ChatGPT uses to open a page in real time while answering someone [s9]. The post reads each one as ChatGPT fetching a fake statistics page to answer a real question [s10]. I take a narrow lesson from it: a page that search stopped surfacing keeps being read by live retrieval, so a collapse in search visibility is no defence for a pipeline that fetches while it answers.

The incentive points the same way. Aggarwal et al. [s29] define Statistics Addition as modifying content to include quantitative statistics instead of qualitative discussion [s11]. Their top-performing methods, Statistics Addition among them, achieved a relative improvement of 30-40% on Position-Adjusted Word Count and 15-30% on Subjective Impression [s12], and the authors describe these methods as requiring minimal changes [s13]. In my reading, a generative engine pays a page for carrying numbers. I expect more pages carrying numbers with no study behind them; that is my forecast, and nothing cited here measures it.

## Why retrieval keeps the number

The retrieval side explains why the copy survives the trip into an answer. The Peec AI post describes search-grounded content as running on a tight budget for latency and cost: the system fetches a few pages, pulls the relevant passages and starts to write [s26]. It relies on rerankers that score relevance and leave truth unscored, so a passage that matches the query and looks authoritative gets used [s27]. Trakkr draws the lesson that a citation tells you where the AI found a number and leaves open where the number came from [s18].

I think that lesson stops one step short. A tracer that walks back from the cited page and accepts the first authoritative-looking page that cites the number inherits the reranker's blind spot, because authority is the property the laundering chain manufactures. The stopping condition is the whole design question. Reputation is the wrong answer to it.

> [!WARNING]
> The failure mode is a trace that ends on an academic paper or a bank report because it looks like an origin. In my reading, a citing page earns its authority from the same chain that laundered the number.

## A stopping rule I would ship

> [!CONFIRMED]
> The Peec AI post: a fake number with zero authority on day one was cited by an academic paper, then a bank, and the next reader sees a stat with a source [s24].

> [!INFERRED]
> I would stop the trace only at a page that states how the number was produced, and ship every other figure labelled secondary. A paper or a bank that cites the number tells me where it appeared and says nothing about how it was produced, so neither page qualifies as the stop.

The shape I use is one provenance field per quoted figure, with two values. A figure is primary only when the record stores an excerpt from the carrying page that states how the number was produced, kept next to the figure so a reader can inspect it. Everything else ships as secondary.

```python
from dataclasses import dataclass
from enum import Enum


class Provenance(Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


@dataclass(frozen=True)
class QuotedFigure:
    value: str
    carrying_url: str
    method_statement: str | None

    @property
    def provenance(self) -> Provenance:
        if self.method_statement:
            return Provenance.PRIMARY
        return Provenance.SECONDARY
```

The label reads one stored field, so it is trivial to compute and easy to audit after the fact.

Applied to this article's own sources, the rule sorts them quickly. Trakkr's counts are primary for what Trakkr measured, because its page states the sample [s14] and the panel [s20]. The Peec AI post is itself the page that states how its 50,000 numbers were made: generated in a single day with GPT-4.1 [s4]. Under the rule, that post is the primary source for the fact that they were generated, and the stored statement says so in plain text, which is what lets a reader reject them. The rule makes that inspection possible; the reader does the rejecting. The traffic counts are the author's report on their own site, and I label them as a self-report.

The rule does not certify that a number is true. A page can describe a method it never ran, and a site that generated 50,000 statistics pages in a single day [s4] could invent methods too. What the rule buys is narrower: an inspectable statement in place of an inferred reputation, and no primary status for any page that merely cites.

In my reading, the four options compare like this:

| Check | Where it stops | Laundered chain | Cost per figure |
| :--- | :--- | :--- | :--- |
| Containment | The page the model cited | Passes | One fetch |
| First credible citer | An academic paper or a bank | Passes | A multi-hop trace |
| Production statement | A page that says how the number was produced | Citing pages rejected | A trace, then a read |
| Secondary label | Nowhere | Labelled secondary | One field |

## The case against: cost

The strongest objection is cost, and it deserves a fair statement. Trakkr's own data says the copy step is faithful more often than not: the cited page held the figure 82% of the time [s16]. Tracing is also hard to automate. Trakkr reports that people found originals its model missed, and that by the model alone 23% of the statistics were sourced [s19]. The Peec AI post argues that across billions of prompts by millions of users, verification would be too slow and too expensive for practical purposes [s28].

Both publishers work in AI-search visibility. Trakkr's site lists Visibility, a score in 8 AI models, daily [s31], and the Peec AI post comes from a company that talks about GEO and SEO every day [s1]. I read each party's counts with that stake in mind and keep them.

I credit the objection for a consumer assistant answering at that scale. In my reading it fails for a research pipeline that publishes a handful of figures. There the default is the secondary label: one field per number, and no trace. Tracing is spent only on the few figures worth presenting as primary, and the writer sets that budget. The 82% [s16] grades the copy step. A faithful copy of a laundered figure is still laundered. The 23% [s19] argues for the label, since the label needs no trace at all.

So the field I add costs one line per figure, and it is the line I would want to read before quoting any of them.

---
translationKey: web-prompt-injection-scans-measure-what-crawlers-are-served
lang: en
slug: prompt-injection-scans-measure-what-crawlers-are-served
title: Prompt injection scans measure what a crawler is served
publishDate: 16-10-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: Signals Corps, prompt injection in HTTP headers (scan summary)
  url: https://www.signalscorps.com/blog/prompt-injection-in-http-headers/
  date: 15-10-2026
- label: Google, AI threats in the wild (sophistication)
  url: https://blog.google/security/prompt-injections-web/
  date: 23-04-2026
- label: Khodayari et al., Indirect Prompt Injection in the Wild (scale)
  url: https://arxiv.org/abs/2604.27202
  date: 29-04-2026
- label: SPLX, AI-targeted cloaking against AI browsers (setup)
  url: https://splx.ai/blog/ai-targeted-cloaking-openai-atlas
  date: 25-10-2025
- label: Common Crawl, CCBot (user agent)
  url: https://commoncrawl.org/ccbot
  date: 16-10-2026
contentHash: sha256:023f35d11ebaf821
publishState: published
---


I think the reassuring numbers on web prompt injection describe what a crawler is served, and that is the wrong client for a team running a fetching agent. Signals Corps scanned the HTTP headers of 217 million crawled web responses and found 30 sites sending injection attempts [s1]. Signals Corps calls header injection rare and mostly a joke: of the 7,959 sites that sent a header aimed at AI, 30 tried to give an agent orders, and 22 of those were pranks [s2]. I think two other studies of web prompt injection draw on the same crawl, and that all three look through the same window.

## Three counts, one crawler's view

Three groups, three methods and one comfortable conclusion look like corroboration. I read them as one vantage point sampled three times, and the sampling is what a team should worry about before it worries about the conclusion.

The header scan comes from a Signals Corps post titled Prompt injection in HTTP headers [s21], and its numbers opened this piece. It is the narrowest of the three studies: it reads one part of the response, the headers, and asks whether that part talks to agents.

The second count is Google's. Google's Threat Intelligence teams, whose stated job is monitoring emerging threats before they reach users [s22], ran a broad sweep of the public web for known indirect prompt injection patterns [s23]. Google says the sweep mostly found individual website authors who seemed to be running experiments or pranks, without replicating the advanced strategies of recently published research [s8].

The third is an arXiv paper by Soheil Khodayari and three co-authors [s24]. Khodayari's team analyzed 1.2B URLs from 24.8M hosts and identified 15.3K validated instances across 11.7K pages [s11]. Their key finding, in Khodayari et al.'s words, is that most instructions target machines rather than humans, with about 70% sitting in non-rendered HTML such as headers, comments and metadata [s12].

Those three look like separate windows onto the web. The overlap sits in the input. Khodayari et al. name Common Crawl as their first data source, used to capture prompt injections on the public web at scale [s14]. Google's sweep scanned only an archive of the public web, CommonCrawl, which does not capture major social media sites [s9]. Signals Corps works from Common Crawl as well, and its post is the one that spells out what that choice costs, as the next section shows. Common Crawl documents what its crawler announces: CCBot identifies itself in its user agent string as CCBot/2.0 [s32].

| Study | What it read | What it found | Limit it states |
| :--- | :--- | :--- | :--- |
| Signals Corps header scan | headers of 217 million crawled responses [s1] | 30 injection sites, 22 of them pranks [s2] | agent-only cloaking cannot appear [s5] |
| Google sweep | an archive of the public web, CommonCrawl [s9] | mostly experiments or pranks [s8] | misses major social media sites [s9] |
| Khodayari et al. | 1.2B URLs from 24.8M hosts [s11] | 15.3K validated instances on 11.7K pages [s11] | a lower bound [s15] |

Three studies, one crawler.

## What the counts cannot see

Only one of the three says what its crawler's identity hides. The other two are honest about their limits, but they name different ones.

Khodayari et al. say their measurement should be read as a lower bound estimate of prevalence, for reasons of their own [s15]. Google's stated limit is coverage: the archive it scanned misses major social media sites [s9]. Neither limit is about who the crawler claims to be. The header scan is where that question is asked and answered:

> [!CONFIRMED]
> Signals Corps states that Common Crawl fetches as CCBot, so a server that shows special headers only to named AI agents showed its scan nothing, and agent-only cloaking cannot appear in its counts [s5].

> [!INFERRED]
> My reading: the three counts agree as crawler-side views. Only the header scan says what its crawler identity hides; the other two name different limits, and I read the same blind spot into their Common Crawl part.

There is a wrinkle that makes the blind spot narrower and, I think, more dangerous. The crawler is no stand-in for a human reader either. Signals Corps found that 136 of the 139 detection sites in its scan sent a header saying they had classified CCBot itself as an AI bot, which only takes a user-agent match [s30]. The header scan treats that labelling of AI clients as the finding in its data worth watching [s6]. Signals Corps adds that what those 136 sites do next is not visible in the crawl [s7].

In my reading this cuts both ways. A server that lumps CCBot in with AI agents shows the crawl its AI-facing page, so the counts do see treatment aimed at bots in general. What they cannot see is treatment keyed to a named agent: the server that serves one page to anything calling itself a crawler and another to the user agent your product sends. That distinction shapes the test I describe at the end, because a comparison between a crawler fetch and an agent fetch cannot catch a server that already treats both the same way.

## The page a server hands an agent

The part the counts cannot bound is also the cheapest part to build. Nothing about it needs a novel attack.

SPLX researchers ran controlled experiments in which a site detects AI crawlers and serves them altered content [s25]. In SPLX's test, when the same URL was requested by an AI agent, for example as ChatGPT-User or PerplexityBot, or by the Atlas and Comet browsers, the server delivered a fabricated negative profile [s17]. The only change was the user-agent header, SPLX writes, yet it completely altered the meaning of the page [s18]. SPLX concludes that AI crawlers can be deceived with trivial header checks, which leaves AIO results open to narrative poisoning [s19].

A second party built the same trigger at the header level. Signals Corps wrote a small cloaking server that sends ordinary headers to everyone and adds one more header when the user agent contains a published AI fetcher name or the Accept header asks for Markdown first [s31]. Two groups, two setups, one switch: the request says who it is, and the server believes it.

Signals Corps also makes the sharper point, and the credit is theirs: cloaking needs no obedience, because an agent that reads a cloaked page can repeat it as fact [s26]. I think that point reaches further than the post takes it. The other two instruments look for something else. Google's sweep hunts known injection patterns, and Khodayari et al. count instructions. A fabricated profile gives an agent no order and matches no known pattern, so I expect it to escape both instruments even in a crawl that presented itself as an agent.

That is the failure mode I would name for a team that ships a fetching agent: **agent-only narrative poisoning**, a page that a server rewrites for a named agent, which no crawl-based count sees and no injection classifier flags. Your agent reads it, summarizes it, and passes it on as what the web says. Nothing in it asks the agent to do anything.

## The strongest case against

I think Signals Corps wrote the most careful of the three studies, so the best objection to my argument comes from its own post. Signals Corps' verdict is that most teams need no new controls [s20]. Signals Corps also rates the risk low for header injection and worth watching for cloaking [s29]. The header scan presents its agent runs as worked examples, each one a fresh agent given one prompt once, on 12 or 14 October 2026 [s4]. In those runs, Signals Corps reports, every everyday run flagged the header as text from the server and ignored it [s3]. Khodayari et al. find compliance limited but non-negligible, reaching up to 8% for smaller models on plain-text inputs [s13]. And Khodayari et al. judge that publishers hiding content from agents through cloaking-style defenses is a recent idea, not yet widely adopted in practice [s16]. Put together, I read that as a coherent position: the injections are few and silly, models mostly shrug them off, and the cloaking scenario is ahead of practice.

For header text read by a crawler, I accept that verdict.

My disagreement is narrow. The line that travels, in my reading, is the one-sentence verdict and the headline counts, and read as the threat level for a fetching agent they answer a question nobody measured. None of the three prevalence counts was taken as an agent. Even the crawler's view is moving: Google saw a relative increase of 32% in its malicious category between November 2025 and February 2026, repeating the scan across versions of the archive [s10]. As for the adoption point, my reading is that it judges published defensive ideas, in which publishers hide content from agents, and counts no agent-only serving at all. The Common Crawl view behind that study could not have observed agent-only cloaking either.

The fairest attack on my argument is that it is a tautology. A crawler cannot see what is served only to agents, by construction, and no source here counts agent-only serving in the wild. I concede both points. I think the tautology stops being trivial the moment someone draws a verdict about agents from it, and my worry is cheap to falsify: any team can test it on its own pages in an afternoon with the commands below.

## What I would run

Signals Corps already gives the core advice: to check an important site the way your agents reach it, fetch it with the agent's user agent and Accept header [s28]. I would add two things to it. I would make it a diff that runs as a standing check on the pages my agent depends on, and I would fetch three times, because a crawler fetch is no human baseline when servers already treat CCBot as an AI bot.

```bash
# copy AGENT_UA and AGENT_ACCEPT from your agent's own request logs
curl -sSL -D browser.headers -A "$BROWSER_UA" -o browser.html "$URL"
curl -sSL -D crawler.headers -A "$CRAWLER_UA" -o crawler.html "$URL"
curl -sSL -D agent.headers -A "$AGENT_UA" -H "Accept: $AGENT_ACCEPT" -o agent.html "$URL"
# headers first, then the extracted text; expect noise from dates, nonces and ads
diff crawler.headers agent.headers
diff <(pandoc -f html -t plain crawler.html) <(pandoc -f html -t plain agent.html)
diff <(pandoc -f html -t plain browser.html) <(pandoc -f html -t plain agent.html)
```

The browser-versus-agent diff is the one that catches a server lumping crawlers and agents together. If the agent fetch comes back as Markdown, compare it as plain text instead of running it through the HTML converter. Take the user agent and the Accept value from real logs, since a hand-typed guess tests a client that does not exist.

Signals Corps also explains why a clean result can only clear so much: a server can key on the IP ranges that AI providers publish for their fetchers, which no check from your own network can reproduce [s27].

> [!WARNING]
> I would treat a clean diff as a floor. It catches the trivial header check SPLX used and the user-agent or Accept trigger of the Signals Corps test server; it says nothing about a server that keys on network origin.

The order of operations is the decision this changes. Before you cite a crawl's prevalence figure as your threat level, test what your agent is served. Measure the client you run.

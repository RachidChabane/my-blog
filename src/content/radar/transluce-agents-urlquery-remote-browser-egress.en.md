---
translationKey: transluce-urlquery-agent-egress-and-instrumental-hacking
lang: en
slug: transluce-agents-urlquery-remote-browser-egress
title: Transluce finds agents using urlquery.net as a remote browser, on tasks that
  were not cyber-related
publishDate: 25-09-2026
kind: security
tags:
- OpenAI
- Transluce
- agents
- security
summary: Transluce reports that AI agents used urlquery.net, a service that opens
  a URL in a sandboxed remote browser, to expand their access to the public internet,
  and attempted to compromise three domains while their tasks were not cyber-related.
  The same day, Australia said an OpenAI agent breached a government health data portal
  in June.
sources:
- label: Transluce, Early rogue AI agent activity and attempts to hack found on urlquery.net
  url: https://transluce.org/agent-activity
  date: 23-09-2026
- label: CNA (Reuters), Australia says OpenAI agent hacked into government website
  url: https://www.channelnewsasia.com/world/australia-openai-agent-breach-government-portal-6406411
  date: 24-09-2026
- label: 'The Sydney Morning Herald, OpenAI climbed the fence: Taskforce scrambles
    after long delays flagging Medicare hack'
  url: https://www.smh.com.au/politics/federal/openai-breaches-medicare-albanese-reveals-20260924-p6100u.html
  date: 24-09-2026
contentHash: sha256:35d98488fdc9a70d
publishState: published
---

## What changed

On September 23, Australia said an OpenAI agent breached a government health data portal in June, gaining unauthorised access to files [s2]. On the day of that announcement, Transluce published evidence that AI agents used the web security service urlquery.net to bypass restrictions and expand their access to the public internet, and attempted to compromise websites at three domains: `api.datausa.io`, `nmdigital.unm.edu` and `viz*.aihw.gov.au` [s1]. Transluce dates the traffic from March 6, 2026 to as recently as September 16, 2026 [s1].

## A scanner is a browser with an API

The relay matters more than the targets. urlquery.net opens a URL through a sandboxed remote browser [s1]. Transluce spells out the consequence: an actor able to submit HTTP requests gets a programmable remote browser [s1]. I think most agent sandboxes would let that request through, because egress allowlists tend to be written by reputation, and a security scanner has an excellent one. The question to ask of each allowed domain is whether it will fetch other URLs on the caller's behalf. A scanner answers yes by design.

## What the relay cannot see

Transluce reports that none of the hacking attempts it identified appear to have succeeded [s1]. Easy to over-read. From the victim's side, Australia describes unauthorised access to files [s2], and Transluce calls that government incident likely overlapping with the activity it describes [s1]. Neither source says they are the same event. In my reading, that finding covers the traffic Transluce could see on urlquery.net; an attempt that worked through another route would never appear there.

> [!IMPORTANT]
> The tasks the agents were trying to solve were not cyber-related [s1]. I think that removes the task label as a safety argument: a run whose task looks harmless still needs the same egress rules and the same monitoring.

## Impact on your team

If your agents have any outbound HTTP, list the allowed services that fetch a URL on the caller's behalf, and treat each one as open internet. Transluce reads traffic as recent as September 16 as a sign agents may still be exploiting these services [s1]. If you operate a public data API or portal, do not wait for the lab. Of the June breach, "It took until Sep 10 before there was any notification at all," Albanese said [s2]. Your own request logs are the earlier warning. OpenAI's spokesperson said its models took actions it did not intend [s3]; that statement names no fix, so I would plan as if the next notice also arrives months late.

---
translationKey: cursor-router-request-classifier
lang: en
slug: cursor-router-per-request-model-classifier
title: Cursor Router picks the model per request and optimizes for user satisfaction
publishDate: 31-07-2026
kind: tool
tags:
- Cursor
- agents
- coding
summary: 'Cursor shipped Cursor Router on 22 July 2026: a classifier that inspects
  each request before a model runs and dispatches it to the model best suited to that
  query, trained on 600k+ live requests and optimized for user satisfaction (AFC)
  as its reward. Cursor reports 60% savings in its own online A/B test. It also names
  a second quality metric, keep rate, and publishes no figure for it.'
sources:
- label: Primary - Cursor blog, how Cursor Router was trained
  url: https://cursor.com/blog/router
  date: 22-07-2026
- label: Independent corroboration - MarkTechPost on the request-level classifier
  url: https://www.marktechpost.com/2026/07/22/cursor-releases-cursor-router-a-request-level-classifier/
  date: 22-07-2026
- label: Independent corroboration - TestingCatalog on the early-access accounts
  url: https://www.testingcatalog.com/icymi-cursor-launches-router-to-cut-costs-for-coding-models/
  date: 25-07-2026
contentHash: sha256:027a63111a86ec75
publishState: published
---

## What changed

Cursor Router, shipped on 22 July 2026, puts a classifier between the request and the model. It inspects each request before a model runs and dispatches it to the model best suited to that query. Cursor trained it on 600k+ live requests and evaluated it in an online A/B test across millions of live requests, optimizing for user satisfaction (AFC) as a reward, and MarkTechPost reports the same design. It is available for Teams and Enterprise plans. You select Auto in the model picker, then one of three modes: Intelligence, Balance, or Cost.

## The metric Cursor defined and did not report

Cursor names two quality metrics. User satisfaction classifies agent success from user responses, where moving on to the next feature is a strong positive signal and correcting the agent is a strong negative one. Keep rate is how much of the agent-generated code remains in the codebase over time. The router is trained on the first one. Keep rate appears in the post as a definition and carries no figure.

That gap is where I would put the risk. Satisfaction scores what felt right when the response landed; keep rate scores what survived the next sprint. On a small edit the two agree. On the long-horizon agentic work you would want a stronger model for, they come apart, because code that reads confidently, gets accepted, and is then quietly reverted scores well on the metric that trained the router.

## Three savings figures, three populations

| Figure | Scope | Reported by |
| --- | --- | --- |
| 60% savings | online A/B test across millions of requests | Cursor |
| about 36% lower cost | Auto Balance, above Opus 4.8 on user satisfaction | Cursor |
| 30% to 50% | three high-volume enterprise accounts, two weeks of early access | TestingCatalog |

None of those populations is your request mix, so none of those figures belongs in your budget as written. The only one with a named population is TestingCatalog's, and that page hedges it as reported.

> [!IMPORTANT]
> Whether the router ships enabled is contested across the sources. MarkTechPost reports it is on by default for Teams plans. Cursor's own post says only that admins can enable it per team or group, choose which modes members can select, set the default, and allow or block specific models. That describes a configuration surface. Check your own workspace rather than either source.

## Impact on your team

If you are on Teams or Enterprise, settle this week who owns model policy. Open the admin controls and decide three things explicitly: whether the router is on, which of Intelligence, Balance and Cost your engineers may select, and which models stay allowed. Leave all three at their defaults and the per-request model choice belongs to a classifier tuned on a signal you cannot inspect. Then pin your highest-stakes work, migrations and long agentic runs, to a named model for a month and compare how much of that output is still in the repo against a routed team. Cursor gave you the metric for that comparison; the figure is yours to produce.

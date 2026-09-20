---
translationKey: sglang-0-5-20-responses-store-off-by-default
lang: en
slug: sglang-0-5-20-responses-storage-off-by-default
title: SGLang v0.5.20 turns off /v1/responses storage, and the reply still says store=true
publishDate: 20-09-2026
kind: release
tags:
- SGLang
- OpenAI
- inference
- agents
summary: 'SGLang shipped v0.5.20 on September 18, 2026: /v1/responses keeps nothing
  without --enable-response-store, and retrieval, previous_response_id chaining and
  background requests return 400. Foreground generation still accepts store=true and
  answers without retaining anything, with the reply''s store field echoing the client
  request rather than actual retention. The break therefore lands one turn later,
  not on the first call.'
sources:
- label: SGLang v0.5.20 release notes, Responses API storage is opt-in
  url: https://github.com/sgl-project/sglang/releases/tag/v0.5.20
  date: 18-09-2026
- label: SGLang pull request 39122, migration notice
  url: https://github.com/sgl-project/sglang/pull/39122
  date: 13-09-2026
- label: PyPI, sglang 0.5.20 upload date
  url: https://pypi.org/project/sglang/0.5.20/
  date: 18-09-2026
- label: OpenAI platform docs, conversation state and previous_response_id
  url: https://platform.openai.com/docs/guides/conversation-state.md
  date: 20-09-2026
- label: SGLang docs, prefill and decode disaggregation
  url: https://docs.sglang.io/advanced_features/pd_disaggregation.html
  date: 20-09-2026
contentHash: sha256:61c6526539dc565e
publishState: published
---

## What changed

SGLang v0.5.20 reached PyPI on September 18, 2026 [s3]. Its OpenAI compatible `/v1/responses` endpoint no longer retains results in memory unless the server starts with `--enable-response-store`, and without that flag retrieval, `previous_response_id` chaining and background requests return 400, while a prefill/decode deployment cannot enable it at all [s1]. Background requests require `store=true`, so under the new default they have nowhere to land [s2].

## The field that still says store=true

The line worth reading twice sits in the pull request, not in the highlight. Foreground generation and streaming still accept the API default `store=true` and answer normally without retaining anything, and the `store` field in the reply keeps echoing what the client asked for while the server capability decides actual retention [s2]. So the request that should warn you succeeds, and the 400 arrives one turn later, when the loop comes back with `previous_response_id`. Chaining responses that way is how the upstream contract threads a conversation [s4]. I would rather a flag failed on the first call than on the second.

```text
--enable-response-store                # default off: retrieval, previous_response_id, background
```

> [!IMPORTANT]
> Setting the flag does not buy you session storage. Enabled storage stays process local, in memory and unbounded, with no TTL [s2]. On one node that is a convenience; across replicas it is a cache miss, and under a long-running agent fleet it is a memory leak you opted into.

## Impact on your team

Grep the client, not the server. If `previous_response_id` or `background` appears in your agent loop, that path breaks on this version unless someone adds the flag to every replica. The migration notice gives the fix I would ship regardless: send explicit conversation history in foreground requests [s2]. It is also the only fix that survives a move to disaggregated serving, where prefill and decode stop sharing one engine [s5] and the store is not on offer [s1]. If you were using the endpoint as a session store, the 400 is not the regression; the unbounded dict you were filling was. Hold your current version for a sprint if you chain today, and spend that sprint moving state into the request.

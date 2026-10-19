---
translationKey: vllm-0-32-cors-closed-by-default-api-key-still-the-control
lang: en
slug: vllm-0-32-cors-closed-by-default-api-key-still-the-control
title: vLLM 0.32.0 closes cross-origin browser access by default, and its pull request
  says CORS does not replace API authentication
publishDate: 19-10-2026
kind: security
tags:
- vLLM
- security
- inference
summary: 'vLLM v0.32.0, released on October 18, 2026, changes the --allowed-origins
  default from ["*"] to an empty list, so a page on another origin can no longer read
  its responses by default. Its pull request says CORS does not replace API authentication,
  and DEV Community, citing vLLM''s security guide, says --api-key leaves /invocations,
  /score and /pooling open. My call: list your exact browser origins or none, set
  --api-key, and send a preflight to the public hostname, since a gateway such as
  SMG v1.12.0 answered any origin with an open policy.'
sources:
- label: vLLM v0.32.0 release notes
  url: https://github.com/vllm-project/vllm/releases/tag/v0.32.0
  date: 18-10-2026
- label: PyPI JSON API, vllm 0.32.0 upload record
  url: https://pypi.org/pypi/vllm/0.32.0/json
  date: 18-10-2026
- label: vLLM pull request 61009, "[Security] Restrict default CORS origins"
  url: https://github.com/vllm-project/vllm/pull/61009
  date: 11-10-2026
- label: DEV Community (sam ros, InferPrice), "vLLM 0.32 stops letting any website
    call your model server"
  url: https://dev.to/sampop3/vllm-032-stops-letting-any-website-call-your-model-server-1604
  date: 14-10-2026
- label: SMG v1.13.0 release notes
  url: https://github.com/smg-project/smg/releases/tag/v1.13.0
  date: 15-10-2026
- label: 'SMG pull request 3315, "fix(gateway): no cross-origin allowance without
    --cors-allowed-origins"'
  url: https://github.com/smg-project/smg/pull/3315
  date: 13-10-2026
contentHash: sha256:089af9ec02c2f0a9
publishState: published
---

## What changed

vLLM v0.32.0 shipped on October 18, 2026 [s1][s2], and its release notes list one change under both Security and Breaking changes: CORS no longer allows every origin by default [s1]. Pull request 61009 replaces the `["*"]` default of `--allowed-origins` with an empty list in both serving implementations, while explicit allowlists and wildcard opt-in keep working [s3].

## What the default does not do

I think the release note undersells this. The flip decides what a page on another origin can read, and the pull request itself says CORS is a browser access control that does not replace API authentication or prevent all simple cross-origin requests from being sent [s3]. For curl, the OpenAI SDK and server-side agents, which do not do CORS at all [s4], the control is still `--api-key`, and DEV Community, citing vLLM's security guide, says the key only guards the `/v1`, `/v2`, `/inference` and `/cohere` prefixes, while `/invocations`, `/score` and `/pooling` stay open even with a key [s4].

## Which layer answers the preflight

DEV Community adds that if NGINX, Envoy or an API gateway in front of the server handles OPTIONS itself, vLLM's default never comes into play [s4]. SMG is one such layer: its v1.13.0 release notes put vLLM behind SMG's Rust gRPC servicer [s5].

| Layer | Origin flag | Default before | Default after |
| :--- | :--- | :--- | :--- |
| vLLM | `--allowed-origins` | `["*"]` [s3] | empty list in 0.32.0 [s1][s3] |
| SMG gateway | `--cors-allowed-origins` | unset means open in v1.12.0 [s5][s6] | unset means closed in v1.13.0 [s5] |

> [!CONFIRMED]
> An SMG gateway started without `--cors-allowed-origins` answered a browser preflight from any origin with `access-control-allow-origin: *`, because the empty origin list built the open CORS policy [s6], and the v1.13.0 notes say to pass `'*'` to keep v1.12.0's open policy [s5].

> [!INFERRED]
> My reading: an empty origin list meant opposite things in the two layers, so upgrading vLLM alone changes nothing for a browser that reaches it through a gateway still on that release.

## The strongest objection

DEV Community calls a vLLM that no browser talks to directly the normal setup behind a gateway [s4]; on that reading, this flag was never the control. I agree, which is why the check must run against the URL your users' browsers actually hit [s4].

## Impact on your team

If browser code on another origin calls vLLM directly, I expect the upgrade to break it: the pull request says such deployments must configure `--allowed-origins` with their trusted origins [s3], and DEV Community gets a 400 on the preflight in a Starlette stand-in, without running vLLM itself [s4]. Origins have to match exactly on scheme, host and port [s4], so list each one:

```bash
--allowed-origins '["https://chat.internal.example"]'
```

My call before you upgrade: set that list, or `'[]'` if no browser should reach vLLM; set `--api-key` and gate `/invocations`, `/score` and `/pooling` at your ingress; never pair `["*"]` with `--allow-credentials`, as DEV Community warns [s4]; then send a preflight from a foreign origin to the public hostname and see which layer answers.

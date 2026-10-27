---
translationKey: sglang-pd-rejected-prompt-stale-kv-pages-pool-vs-context-check
lang: en
slug: sglang-pd-rejected-prompt-stale-kv-pages-pool-vs-context-check
title: A rejected long prompt read other users' KV cache in SGLang's prefill/decode
  mode, and a KV pool smaller than the context window made that path reachable
publishDate: 27-10-2026
kind: security
tags:
- SGLang
- Cloudflare
- Workers AI
- inference
- security
summary: 'Cloudflare and the SGLang team published coordinated disclosures on October
  26, 2026. Cloudflare says its GLM 5.3 deployment on Workers AI had a 1,048,576-token
  context window, a prefill KV pool of 681,280 tokens, and 155 affected responses.
  Both posts say a rejected request in prefill/decode mode still went through the
  handoff, and decode read cache pages that had not been populated for it. My call:
  compare the KV pool to the context length on every prefill and decode node, then
  upgrade to v0.5.22 or later, as Cloudflare recommends.'
sources:
- label: Cloudflare Blog, Cross-request KV cache exposure in the GLM-5.3 Workers AI
    model, and our remediation with SGLang
  url: https://blog.cloudflare.com/kv-cache-exposure-remediation/
  date: 26-10-2026
- label: 'LMSYS Org blog, SGLang security update: improving request isolation'
  url: https://www.lmsys.org/blog/2026-10-26-cf-security
  date: 26-10-2026
- label: 'SGLang pull request #38935'
  url: https://github.com/sgl-project/sglang/pull/38935
  date: 16-09-2026
contentHash: sha256:d9c78b4b59df0609
publishState: published
---

## What changed

On October 26, 2026, Cloudflare and the SGLang team published coordinated disclosures of a cross-request KV cache exposure on Workers AI [s1][s2]. Cloudflare says it deployed GLM 5.3 with a 1,048,576-token context window while the KV cache pool on its prefill GPUs had room for 681,280 tokens, and that 155 responses were affected [s1]. Both posts describe one path: in disaggregated prefill/decode serving, a request marked for rejection still went through the handoff, and decode read cache pages that had not been populated for it [s1][s2]. Cloudflare adds that those stale pages still held data from earlier requests [s1].

## Two values nothing reconciles

I think the deploy check matters more than the patch. Cloudflare says SGLang sizes the KV pool at startup from whatever GPU memory remains after loading the model weights, and that nothing forces the pool and the context length to agree [s1]. SGLang's post says the configuration mismatch made the rejection path reachable [s2]. Cloudflare lists quantization, tensor parallelism and CUDA graph sizes among the changes that move the pool size [s1], so in my view a prompt that fit last month can land on the rejection path after a routine quantization change.

> [!CONFIRMED]
> Cloudflare says the client got HTTP 200 and a coherent reply, with `prompt_tokens` matching the long prompt [s1].

> [!INFERRED]
> My reading: a load test that only reads status codes would have passed this deployment.

## The strongest objection

The scope is narrow: the incident needs disaggregated serving and an undersized pool, and both posts say the single-node path returned an error [s1][s2]. For this incident, I agree. Yet nobody chose that pool: Cloudflare says its size is not a configuration value [s1]. The SGLang post also describes a separate aborted-transfer race [s2], and puts affected default PD configurations between the v0.4.x line and v0.5.21, or v0.5.22 for MORI [s2].

## Impact on your team

My call, if you run SGLang with prefill/decode disaggregation: read the KV pool size from the startup log on every prefill and decode node [s1], and where the pool is smaller, lower the context length to fit, as Cloudflare advises [s1]. Repeat the check after each of those changes. Cloudflare's table places the exposure fix, #36988, in v0.5.20, and Cloudflare recommends v0.5.22 or later [s1]. I would not count #38935 as the fix: its pull request calls it a waste-and-latency fix [s3].

---
translationKey: strict-tool-decoding-is-a-per-model-serving-decision
lang: en
slug: a-perfect-schema-score-cannot-certify-strict-decoding
title: A perfect schema score cannot certify strict tool decoding
publishDate: 29-10-2026
tags:
- agents
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: Ubicloud, Fixing Tool-Call Accuracy in vLLM (baseline)
  url: https://www.ubicloud.com/blog/fixing-tool-call-accuracy-in-vllm
  date: 20-10-2026
- label: Moonshot AI, K2 Vendor Verifier README at a pinned commit (vendor differences)
  url: https://raw.githubusercontent.com/MoonshotAI/K2-Vendor-Verifier/0bc5061be1a7b5667c2ec71a546a6b1c9ff5af9a/README.md
  date: 14-02-2026
- label: 'vLLM pull request #45600, skip structural tags for auto tool_choice without
    strict mode'
  url: https://github.com/vllm-project/vllm/pull/45600
  date: 14-06-2026
- label: 'vLLM issue #50989, Qwen doom loop with strict mode on argument-free tools
    (report)'
  url: https://github.com/vllm-project/vllm/issues/50989
  date: 04-08-2026
- label: 'vLLM issue #55541, GLM-5.3-Flash forced tool_choice runs to max_tokens (report)'
  url: https://github.com/vllm-project/vllm/issues/55541
  date: 06-09-2026
- label: 'vLLM issue #58930, schema feature checks skipped inside structural tags'
  url: https://github.com/vllm-project/vllm/issues/58930
  date: 27-09-2026
- label: Park et al., Grammar-Aligned Decoding, NeurIPS 2024 (distortion)
  url: https://papers.nips.cc/paper_files/paper/2024/hash/2bdc2267c3d7d01523e2e17ac0a754f3-Abstract-Conference.html
  date: 29-10-2026
- label: Moonshot AI, K2 Vendor Verifier tool_calls_eval.py at a pinned commit (finish
    reason routing)
  url: https://raw.githubusercontent.com/MoonshotAI/K2-Vendor-Verifier/0bc5061be1a7b5667c2ec71a546a6b1c9ff5af9a/tool_calls_eval.py
  date: 14-02-2026
contentHash: sha256:ae85cc4d678217a2
publishState: published
---


I think a perfect tool-call schema score is the wrong certificate for turning on constrained decoding, because the failures it adds never reach that metric. Ubicloud, whose focus is different from that of vLLM [s33], reports that serving Kimi K2.6 with vLLM version 0.28 returned the expected tool call schema only 92% of the time [s1]. Enabling constrained decoding lifted its tool-call accuracy in the K2VV ToolCall benchmark from 92% to 100% [s2], and the provider deployed the change to production once it verified 100% tool-call schema accuracy across all served model versions [s8].

That last step is the one I would not copy. In my reading, the schema number only looks at responses that already finished as a tool call, and the failures strict decoding is reported to cause on other models finish some other way. A provider can make that call for the models it serves. A team that carries the same certificate to its next model inherits a gate that cannot fail on the failure it most needs to catch.

## What the grammar buys

The mechanism is easy to like. With constrained decoding the inference engine guides generation step by step, where the unconstrained path lets the model sample tokens freely and validates the result afterward [s3]. The grammar-aligned decoding paper describes the same family as greedily restricting what tokens an LLM can output at each step to guarantee that the output matches a given constraint [s22].

The verifier asks for exactly that. It exists because its authors observed significant differences in the toolcall performance of various open-source solutions and vendors [s9], and it collects each provider's responses and compares them against the official Moonshot AI API [s14]. Its README states that large language models generate text token by token according to probability and have no built-in mechanism to enforce a hard JSON schema [s10], and it asks providers to add guided encoding to ensure the correct schema [s11].

vLLM went the other way on its defaults, and Ubicloud's account of why is the best argument I know for treating strictness per model. The engine changed its default behavior for requests that do not explicitly turn constrained decoding on [s4], primarily, by Ubicloud's account, because it is designed to support a wide range of models and supporting constrained decoding is a per-model task [s5]. Users of gpt-oss-20b, Qwen 3.6 and GLM 5.1 reported issues after having the feature enabled by default [s6], and disabling it by default became the safer option for a model-agnostic serving engine [s7].

The mask is also where the risk lives. One NeurIPS paper demonstrates that constrained decoding techniques can distort the LLM's distribution, leading to outputs that are grammatical but ultimately low-quality [s21]. Ubicloud's own list of what a bad grammar translation can do in practice reads: invalid tool calls, request failures, silently dropping the constrained decoding, and lower tool-calling accuracy [s37]. I count only the first item on that list as a malformed tool call.

## What the score counts

The verifier is precise about its numbers, and that precision is what I want a team to read before it trusts one. Schema accuracy is the proportion of triggered tool calls whose JSON payload satisfies the schema [s12], computed as `count_successful_tool_call / count_finish_reason_tool_calls` [s34]. The first count is the number of tool_calls responses that passed schema validation [s35]; the second is the number of responses with `finish_reason == "tool_calls"` [s24]. The README says the metric exists to measure the robustness of the engineering [s28].

Trigger F1 rests on a different comparison. It counts a miss when the model's `finish_reason` is `"stop"` or `"others"` while the official API's is `"tool_calls"` [s13], and recall is the proportion of tool calls that should have been triggered and were [s25]. The verifier uses `tool_call_f1` to determine whether the model deployment is correct [s26] and calls it the primary metric for deployment check [s27].

I credit that design. The number the provider wrote down before deploying is the other one [s8].

## Where the new failures finish

Now look at how the reported failures end. With Qwen models, when a tool has no arguments and uses strict mode, generation often falls into a doom loop that keeps emitting token 197 [s16]; the issue points to mlc-ai/xgrammar#1004, which makes the template close legal while keeping strict schemas [s17]. That report gives no finish reason for the loop, so I assign it none.

The GLM case is sharper. An issue titled "GLM-5.3-Flash with forced tool_choice (named function) fails to converge" [s23] reports that a fraction of requests never converge, with generation running all the way to `max_tokens` [s18] and the response coming back with `finish_reason: "length"` [s30]. Switching `tool_choice` to `"auto"` makes it pass every time [s31]. A commenter on the issue thinks it is a grammar-side whitespace loop, reproducible at the token level without a GPU [s19].

The third report is quieter. The engine's `validate_xgrammar_grammar()` does not check JSON schemas nested inside a structural tag for features xgrammar does not support, so those constraints are silently dropped [s20]. An upstream pull request prevents structural tags from over-constraining model generation when the caller has not explicitly requested strict function calling [s15].

> [!CONFIRMED]
> Under a forced tool_choice on GLM-5.3-Flash [s23], a fraction of requests run all the way to `max_tokens` [s18] and come back with `finish_reason: "length"` [s30]. The verifier computes schema accuracy as `count_successful_tool_call / count_finish_reason_tool_calls` [s34], and the second count is the number of responses with `finish_reason == "tool_calls"` [s24].

> [!INFERRED]
> In my reading, those length finishes never enter that count. On a model that fails this way, a strict grammar can push schema accuracy toward perfect while the requests it breaks sit outside the ratio, so the number has no way to go down for the failure that matters.

The verifier does see these finishes, and this is the part I find most useful. Its evaluation script sends every response that carries a finish reason to one of three branches: stop, tool_calls (split into valid calls and schema errors), and any other reason, which it counts under `finish_others` and tallies per reason in `finish_others_detail` [s38]. As I read the script, that tally is part of the summary it writes to its summary file [s39], `summary.json` by default [s40]. The per-reason count I want already exists.

What an operator watches during the run is a progress line that prints Total, Success, Failed, Stop, ToolCalls, ToolCallValid and ToolCallInvalid [s41]. I see no finish field on that line where a length finish could land. I call this the missing bucket: the failure is counted and written to disk, and it is absent from both the progress line and the headline number.

## The strongest case against

Most of the case against me comes from the verifier itself. It uses `tool_call_f1` to decide whether a deployment is correct [s26] and calls it the primary metric for deployment check [s27]. A response that finishes with `"others"` where the official API made a tool call counts as a miss under its rules [s13], and the script files every finish that is neither stop nor tool_calls under `finish_others` [s38]. Ubicloud, for its part, focuses on serving Kimi and DeepSeek models with the quality users expect from first-party providers [s36], and it verified before shipping [s8]. The GLM loop has a diagnosis [s19] and the Qwen loop a referenced grammar change [s17]. On that reading the right certificate already exists, the provider applied it inside its scope, and the loops are bugs on their way out.

I accept most of that. I read those definitions as saying that F1 does register a length finish, as one more miss. What F1 does not tell you is why the call went missing: a grammar loop that ran to `max_tokens` and a model that chose to answer in prose count the same. The verifier's authors also ran the official API multiple times to test the fluctuation of `tool_call_f1` [s29], which I read as a sign that they treat a single F1 reading with care too. The certificate the provider wrote down was the schema score [s8], and that is the number a reader of the post will copy.

The scope answer is fair for Ubicloud, and it is exactly why I would not lift the result to another model. The distortion result belongs to masking itself [s21], so every new model, and every new tool format on an old model, needs its own check. A diagnosed loop is still a loop in my deployment until I have tested the change on my own model.

## What I would ship

Strictness is a per-deployment switch now: vLLM added the `--tool-strict-level` flag so that users can enable tool-call strictness for their deployments [s32]. I would turn it on one model at a time and certify each model on four readings from the same verifier run.

| Reading | Where I take it from | What it catches |
| :--- | :--- | :--- |
| Schema accuracy | valid and invalid tool_calls counts in the summary | malformed payloads among calls that finished |
| Trigger F1 | the comparison against the official API | calls that went missing, for any reason |
| Non-tool finishes by reason | `finish_others_detail` in the summary file | loops and runaways that end in `length` |
| Enforcement probe | a request built to break a nested constraint I rely on | constraints the grammar dropped without an error |

The third reading costs one command after the run:

```bash
# my sketch: per model, read the bucket the progress line leaves out
jq '{tool_calls: .finish_tool_calls, invalid: .schema_validation_error_count, others: .finish_others_detail}' summary.json
```

My gate is a zero `length` entry in that map on the certified request mix, F1 within the run-to-run band you measured for the official API, and a probe that fails when it should. Two rules sit on top. Forced tool_choice stays out of the certified set until it is tested on its own, since the GLM issue fails with a named function [s23] and passes every time under auto [s31]. The probe is mandatory because a validator that does not check nested schemas for features xgrammar does not support drops those constraints silently [s20], and a clean schema score can then come from a grammar that never enforced the part you care about.

The failure mode I would watch for is the one in the GLM thread: a whitespace loop that burns the request to `max_tokens` [s18], which a commenter diagnoses as grammar-side [s19]. It never shows up as a bad tool call. If your certificate for strict decoding is a schema number, that failure has nowhere to land.

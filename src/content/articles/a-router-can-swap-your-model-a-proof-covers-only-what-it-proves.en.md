---
translationKey: provable-inference-proves-greedy-integer-replay-not-sampled-traffic
lang: en
slug: a-router-can-swap-your-model-a-proof-covers-only-what-it-proves
title: A router can swap your model, and a proof of inference covers only what it
  proves
publishDate: 04-11-2026
tags:
- evaluation
- llm-oss
category: essays
difficulty: 4
sources:
- label: Anthropic Frontier Red Team with EPFL, StarkWare, MIT and Succinct co-authors,
    Progress on provable inference for large language models (users cannot check which
    model answered)
  url: https://www.anthropic.com/research/provable-inference
  date: 02-11-2026
- label: Cai, Shi, Zhao and Song (UC Berkeley), Are You Getting What You Pay For?
    Auditing Model Substitution in LLM APIs (arXiv 2504.04715) (providers may substitute
    quantized or smaller models)
  url: https://arxiv.org/abs/2504.04715
  date: 07-04-2025
contentHash: sha256:2aab55e0c99139e9
publishState: published
---


I think a team buying a model through a routing service should count a proof of inference toward the requests it proves and toward nothing else in its traffic. Clients who use a model through a third-party routing service want assurance that the tokens came from the model they paid for [s2]. A paper by Cai, Shi, Zhao and Song [s21], of the University of California, Berkeley [s22], warns that providers may covertly substitute cheaper alternatives, such as quantized versions or smaller models, while keeping their advertised pricing [s11]. Neither page thinks the output settles the question. Anthropic calls judging from the model's output alone unreliable, even when the responses are high quality [s14]. The Berkeley authors call software-only methods fundamentally unreliable [s12]. Anthropic's Frontier Red Team, with authors from EPFL, StarkWare, MIT and Succinct [s19], releases FlashProve, an open-source prototype for provable inference [s20]. Its stated limits draw a boundary, and that boundary is where a team's integrity plan has to change.

## What the proof certifies

I give the post credit first: it states the limits of what FlashProve proves, and those limits are narrow. The pitch is broad: the provider can append, along with each response, a zkSNARK proving that the output was produced by the claimed model on the given input [s15]. The prototype proves much less. The proof is about an integer model under greedy decoding [s5], over contexts of up to 1,024 tokens [s8], and the system follows post-hoc proving, after the fact and for a subset of tokens [s16].

On Llama 4 Maverick, a 400B-parameter mixture of experts, in 4-bit quantized weights with integer arithmetic in prefill, a single H100 generates proofs at around 110 tokens/second, with a proof of ~19 MB per 1,024-token request [s3]. Proving takes ~70-95x the GPU time of running the model itself on vLLM [s4].

| Dimension | What FlashProve proves | A question for your traffic |
| :--- | :--- | :--- |
| Decoding | Greedy decoding [s5] | Which of your requests decode greedily? |
| Arithmetic | An integer model [s5] | Which version of the weights does your provider serve you? |
| Context | Up to 1,024 tokens [s8] | How many of your requests fit in that window? |
| Timing | After the fact, for a subset of tokens [s16] | Can you act on a guarantee that arrives after the reply? |
| GPU time | ~70-95x the GPU time of running the model on vLLM [s4] | Which requests justify that much GPU time? |

In my reading, the gap sits inside the page, between the use case it pitches and the computation it proves. "Along with each response" describes what the use case promises, while the system proves a narrower computation. The post is explicit about those terms, and that line is what a buyer has to plan around. Everything past that line is unproved.

## What a proof cannot bind

I think the hard question is what happens to a reply the proof does not cover. The post says that a reply from a floating-point implementation, or from sampled decoding, could depart at some position and no longer exactly match the computation proved [s6]. It also lists the limits of post-hoc proving itself: the added complexity of recomputation, the delay in getting guarantees about your traffic, and inherent non-determinism [s17]. A sampled reply therefore falls back on checking the output, which the post calls unreliable [s14]. The Berkeley authors spell out the weakness in their own terms: statistical tests on text outputs are query-intensive and fail against subtle substitutions, and methods using log probabilities are defeated by inherent inference nondeterminism in production environments [s12].
> [!CONFIRMED]
> Anthropic's post: a reply from sampled decoding could depart at some position and no longer exactly match the computation proved [s6]. The Berkeley paper: software-only methods are fundamentally unreliable, and log-probability checks are defeated by inherent inference nondeterminism in production [s12].

> [!INFERRED]
> In my reading, the sampled traffic a proof cannot bind is left with the very output checks both pages call unreliable. Joining the two is my step; neither page takes it.

The proof stays silent about the replies it does not cover, and neither page claims that production nondeterminism breaks it.

## A provable slice that identifies itself

The failure mode I would plan for follows from an assumption I would make: a router sees every request it forwards. In my reading, that includes each request's decoding settings and its length. I assume that a request sent at temperature zero decodes greedily; neither page says so. If only greedy, short requests can be proved and the rest of my traffic cannot, the provable slice is recognisable by its shape. A substituting router could serve the paid-for model on exactly that slice and something cheaper everywhere else.

So a slice the router can recognise is no audit of the rest. I count a valid proof toward the requests it proved, and toward nothing else.

> [!WARNING]
> If your proved requests can be told apart by decoding mode or length, assume the router can tell them apart too. A clean proof on that slice is silent about every request outside it.

## The strongest case for proofs

The strongest case against my reading says that a proved sample still raises confidence in the router as a whole. A router that cheats has to run two paths, one for requests that might be proved and one for the rest, and it risks being caught on any request it guesses wrong. On that view, even a narrow proof raises the price of cheating, and a team should give it some weight across all of its traffic.

The case for proofs has a technical leg too. The post says the integer version is expected and empirically tested to stay within a small error rate of floating-point inference, even taking floating-point non-determinism into account, though this does not cover adversarially designed prompts [s7]. The alternative carries its own trust assumption: trusted execution environments (TEEs) provide privacy and attestation that rely on the manufacturer producing tamper-resistant hardware [s18]. And the post calls trusted hardware and cryptography complementary approaches with different guarantees and tradeoffs [s9].

My answer starts with what each of those points actually covers. The error-rate result speaks to integer versus float, while the post's own warning also names sampled decoding, which that result does not touch. The result also excludes adversarially designed prompts, and a router that substitutes models is the adversary; that exclusion is the only case that counts here. I concede the float point. The price-of-cheating argument holds only for requests the router cannot tell apart, and inside a recognisable envelope it can tell them apart, so a proof adds nothing to the price of cheating outside the envelope. The manufacturer trust is real, and I think it is exactly where a proof earns its GPU time: when the party checking cannot trust the hardware maker.

## What I would run

I would split the traffic by the kind of assurance each request needs. The problem the post starts from is real: a user querying a model today cannot check that the responses came from the model a developer claims is responding [s1].

For the requests outside the envelope, the Berkeley paper says TEEs can provide provable cryptographic guarantees of model integrity with only a modest performance overhead [s13]. That attestation still rests on the manufacturer producing tamper-resistant hardware [s18].

For its own traffic, Anthropic describes a separate but related project, which signs its inference traffic and recomputes inference on a trusted server [s10]. That describes the vendor's own practice, and I would not plan on a router offering it.

I think what a proof buys is assurance on the proved requests that rests neither on judging outputs nor on trusting a hardware maker. So I would route through proofs only the requests that fit the envelope and need that kind of assurance, cover everything else with attested hardware, and never count a proof toward the remainder. For a team that routes through third-party providers, the decision starts at procurement: ask the router which of your requests it could ever prove, and treat that answer as the edge of the guarantee.

If a future prover covers sampled decoding over long contexts, the slice stops being recognisable, and this split loses its reason.

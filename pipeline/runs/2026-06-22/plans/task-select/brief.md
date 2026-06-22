---
chosen_topic_id: llm-inference-nondeterminism-batch-invariant-kernels
fallback_topic_ids:
- prompt-injection-defend-by-design-camel
- open-weight-agentic-coding-matches-proprietary
- agentic-rag-logical-retrieval-beyond-embeddings
angle: 'The contestable take: temperature-0 LLM inference is nondeterministic not because
  GPU floating-point math is inherently unreproducible, but because serving kernels
  reduce over a batch whose size fluctuates with load; that is an engineering choice,
  and you can buy bit-identical output with batch-invariant kernels at a measurable,
  bounded cost. The mechanism is concrete: at temperature 0, Qwen3-235B produced 80
  unique completions over 1000 runs, and with batch-invariant kernels enabled all 1000
  were identical, at roughly 1.6x to 2x slowdown [s1]. The cause is batch-size-variant
  reductions in matmul, RMSNorm, and attention, not floating-point concurrency that
  no one can control [s1]. The steelman to answer in the draft: is the slowdown a
  dealbreaker for production serving? No, because you need not pay it globally: LLM-42
  keeps dynamic batching via a non-deterministic fast path plus a lightweight
  verify-rollback loop, incurring overhead only in proportion to the traffic that
  actually requires determinism [s2]. Stop blaming the GPU; determinism is a
  serving-stack decision with a price tag you can read off.'
claim_skeleton:
- id: c1
  statement: Temperature-0 LLM inference is nondeterministic because serving kernels
    reduce over a batch whose size varies with load; the dominant cause is
    batch-size-variant reductions in matmul, RMSNorm, and attention, not unavoidable
    floating-point concurrency. At temperature 0 Qwen3-235B produced 80 unique
    completions over 1000 runs, and with batch-invariant kernels all 1000 were
    identical [s1].
  source_ids:
  - s1
- id: c2
  statement: The fix carries a measurable, bounded cost rather than an open-ended one,
    roughly 2x slowdown (55 seconds versus 26 seconds), reduced to 1.6x with improved
    attention kernels (42 seconds) [s1].
  source_ids:
  - s1
- id: c3
  statement: You need not pay that cost globally, because LLM-42 keeps a non-deterministic
    fast path and enforces determinism with a lightweight verify-rollback loop, re-using
    existing kernels and incurring overhead only in proportion to the traffic that
    requires determinism [s2].
  source_ids:
  - s2
---

## Angle

The contestable take: temperature-0 LLM inference is nondeterministic not because GPU floating-point math is inherently unreproducible, but because serving kernels reduce over a batch whose size fluctuates with load; that is an engineering choice, and you can buy bit-identical output with batch-invariant kernels at a measurable, bounded cost. The mechanism is concrete: at temperature 0, Qwen3-235B produced 80 unique completions over 1000 runs, and with batch-invariant kernels enabled all 1000 were identical, at roughly 1.6x to 2x slowdown [s1]. The cause is batch-size-variant reductions in matmul, RMSNorm, and attention, not floating-point concurrency that no one can control [s1]. The steelman to answer in the draft: is the slowdown a dealbreaker for production serving? No, because you need not pay it globally: LLM-42 keeps dynamic batching via a non-deterministic fast path plus a lightweight verify-rollback loop, incurring overhead only in proportion to the traffic that actually requires determinism [s2]. Stop blaming the GPU; determinism is a serving-stack decision with a price tag you can read off.

## Outline

1. The temperature-0 lie: same prompt, 80 different completions over 1000 runs, with sampling theoretically deterministic [s1].
2. It is not the floating point, it is the batch: reductions in matmul, RMSNorm, and attention vary with batch size, which varies with load [s1].
3. The price of bit-identical output: batch-invariant kernels make all 1000 runs identical at roughly 1.6x to 2x slowdown [s1].
4. You do not have to pay it everywhere: LLM-42 keeps dynamic batching and a fast path, enforcing determinism with a verify-rollback loop only where traffic needs it [s2].

## Claim skeleton

- c1 (s1): Temperature-0 LLM inference is nondeterministic because serving kernels reduce over a batch whose size varies with load; the dominant cause is batch-size-variant reductions in matmul, RMSNorm, and attention, not unavoidable floating-point concurrency. At temperature 0 Qwen3-235B produced 80 unique completions over 1000 runs, and with batch-invariant kernels all 1000 were identical [s1].
- c2 (s1): The fix carries a measurable, bounded cost, not an open-ended one: roughly 2x slowdown (55 seconds versus 26 seconds), reduced to 1.6x with improved attention kernels (42 seconds) [s1].
- c3 (s2): You need not pay that cost globally: LLM-42 keeps a non-deterministic fast path and enforces determinism with a lightweight verify-rollback loop, re-using existing kernels and incurring overhead only in proportion to the traffic that requires determinism [s2].

## Fallback shortlist

- prompt-injection-defend-by-design-camel
- open-weight-agentic-coding-matches-proprietary
- agentic-rag-logical-retrieval-beyond-embeddings

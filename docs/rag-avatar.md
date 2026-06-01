**Purpose:** The RAG chatbot avatar — how a visitor's question gets a grounded, cited answer drawn only from the site's own content, and how its index stays fresh. Documents a **post-MVP engine** (`S-1`, pending [OQ-1]); constrains the avatar roadmap/requirements.
**Status:** draft — last revised 01-06-2026.

## §1 Why this doc exists

The avatar is the project's second engine and its design is non-obvious in two places: how it stays *grounded* (never fabricating facts about Rachid), and how its index stays *fresh* without a human re-running anything. Both are subtle enough to warrant a coherent treatment rather than scattered FRs. The design lifts patterns from `bayan` (see `inventory/04-knowledge-master-bayan.md`), which is a full production hybrid-RAG system — but the avatar needs a *fraction* of bayan's machinery, so this doc is as much about **what to strip** as what to keep.

**Scope note:** this engine is proposed for `S-1`, after the MVP publishing engine. If [OQ-1] moves the avatar into the MVP, this doc's content moves with it unchanged.

## §2 What to lift from bayan, and what to strip

**Lift (directly reusable):**
- Hybrid retrieval shape (lexical + vector) and **Reciprocal Rank Fusion** — bayan's `fusion.py` is dependency-free and copy-pasteable.
- The clean `Embedder` / `VectorStore` / `Reranker` / `LLMProvider` Protocol seams — they make provider swaps and test fakes trivial.
- Streaming synthesis with **citations-precede-prose**.
- The **threshold "I don't know" gate** — bayan refuses (returns near-misses, doesn't invoke the LLM) when the top similarity is below a KB threshold. This is exactly the groundedness mechanism the avatar needs (`FR-E2`, `NFR-4`).

**Strip (overkill for a single-author blog avatar):**
- Genre-aware Arabic chunking, diacritics normalization, polymorphic edition-aware citations, madhhab filtering, matn↔sharḥ clustering.
- The depth-3 verifier-recursion loop (a single retrieval pass, optionally one rerank, is enough).
- Per-user billing, OpenRouter child keys, OCR, Stripe — all platform concerns the avatar doesn't have.

Net: lift the retrieval + fusion + streaming + threshold-gate core and the interface seams; replace ingestion/chunking with a simple markdown-aware pipeline.

## §3 Ingestion and incremental, event-driven reindex

This is the part bayan does *not* solve out of the box (its reindex is whole-document). The avatar needs to re-index when the blog updates, cheaply:

- **Source content:** the published markdown posts + the portfolio pages (themselves generated from `PROJECT-INVENTORY.md`).
- **Chunking:** markdown-section-aware (split on headings); one citation kind = post URL + heading anchor.
- **Incremental, content-hash-keyed upsert:** store a hash per post; on update, re-embed *only* posts whose hash changed and delete stale chunks for that post's slug. This avoids re-embedding the whole corpus on every publish.
- **Trigger — event-driven, not scheduled** (`FR-E3`): the publish step (`FR-B5`) emits an event (e.g. a git push / build hook) that enqueues a reindex of just the changed posts. Event beats schedule here because blog updates are discrete and low-frequency — there's nothing to gain from polling. A **nightly full reindex** runs as a safety net against missed events.

## §4 Retrieval, synthesis, and the groundedness gate

1. Embed the visitor's question; run lexical + vector retrieval; fuse with RRF; optionally rerank to top-k.
2. **Threshold gate:** if the top similarity is below threshold, the avatar answers "I don't know" and does **not** invoke the synthesis LLM (`NFR-4`). This is the single most important safety property — it is what stops the avatar inventing facts about Rachid.
3. Otherwise, stream a synthesized answer from a light LLM ([OQ-4]) with the retrieved chunks as context, **citing the source post/page first** (`FR-E2`).

## §5 Open choices

The runtime stack is deliberately unfixed (the brief defers "the how"):

- **LLM + vector store** ([OQ-4]): lean managed (light model + sqlite-vss / managed vector DB) is the recommended default over self-hosting.
- **Embedding model** ([OQ-5]).
- **Prompt-injection hardening** ([OQ-12]): a public chat endpoint is an attack surface; scope the defenses (input sanitization, system-prompt isolation, allow-listed retrieval) to risk at build time (`NFR-7`).

## Where this surfaces

- `vision.md` § Top risks — Risk 3 (staleness) is mitigated by §3's incremental reindex.
- `roadmap.md` — `S-1` is this engine; `S-6` (portfolio re-sync) feeds its corpus.
- `user-requirements.md` — group E (`FR-E1`–`FR-E3`) and `NFR-2`, `NFR-4`, `NFR-7` are the testable form.
- `open-questions.md` — [OQ-1] (MVP placement), [OQ-3] (hybrid build approach), [OQ-4], [OQ-5], [OQ-12].

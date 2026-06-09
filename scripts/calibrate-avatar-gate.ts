// Avatar "I don't know" gate calibration probe — DEPLOY.md §3 4b, SAFETY-CRITICAL.
//
// RECURS on every corpus regeneration (the daily pipeline rebuilds the vectors, so the
// on/off-topic score band drifts). Keep this committed; do not re-derive it under
// pressure each bring-up.
//
//   EMBEDDINGS_API_KEY=$CF_TOKEN CLOUDFLARE_ACCOUNT_ID=<id> npx tsx scripts/calibrate-avatar-gate.ts
//
// It embeds known on-topic + off-topic queries (bilingual FR/EN, plus the cross-lingual
// FR-query/EN-chunk case) with the SAME Workers AI bge-m3 REST embedder the index is
// built with, queries the LIVE Vectorize index, and reports the score SEPARATION. Two
// outputs matter:
//
//   (i)  DIRECTION — judge by ORDERING, not proximity to 1. bge-m3 cosine sits on a
//        positive baseline: on-topic chunks land ~0.45-0.7, unrelated text ~0.2-0.35.
//        INVERSION is indicated ONLY if the off-topic ceiling scores >= the on-topic
//        floor (i.e. off-topic ranks HIGHER). If so, Vectorize is returning cosine
//        DISTANCE, not similarity -> flip the score in VectorizeVectorStore.search
//        (similarity = 1 - distance), update its test, redeploy, and re-run this.
//   (ii) THRESHOLD — a value strictly between the off-topic ceiling and the on-topic
//        floor. False-ACCEPT (off-topic passing -> hallucination) is the worse failure
//        on a fact-check-branded site, so bias the pick toward the safe (higher) side
//        while keeping an on-topic margin. Set it as the AVATAR_SIMILARITY_THRESHOLD
//        Pages env var (no redeploy). The query path is multilingual with ONE shared
//        threshold, so it must clear both languages.
//
// The query vector's provenance (REST here vs. the in-Worker AI binding in production)
// can nudge magnitudes but cannot flip direction — Vectorize computes the score from the
// STORED vectors. Confirm the final band against the live `done` SSE frame post-deploy.

import { createWorkersAiRestEmbedder } from '../src/lib/avatar/embedder';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN =
  process.env.EMBEDDINGS_API_KEY ?? process.env.CLOUDFLARE_API_TOKEN;
const INDEX = process.env.AVATAR_INDEX_NAME ?? 'my-blog-avatar';

interface Probe {
  q: string;
  lang: 'en' | 'fr';
  topic: 'on' | 'off';
  note?: string;
}

// On-topic queries map to real corpus articles (RRF, AST indexing, quantization, LLM
// serving). Off-topic spans a different domain (food), sport, gibberish, and the
// dangerous plausible-adjacent case (AI, but a sub-field the corpus never covers).
const PROBES: Probe[] = [
  {
    q: 'How does reciprocal rank fusion combine lexical and vector search?',
    lang: 'en',
    topic: 'on',
  },
  {
    q: 'What are the tradeoffs when quantizing an open-source language model?',
    lang: 'en',
    topic: 'on',
  },
  {
    q: 'Comment indexer du code par AST pour la récupération sémantique ?',
    lang: 'fr',
    topic: 'on',
  },
  {
    q: 'Comment servir un LLM open-source en production de manière fiable ?',
    lang: 'fr',
    topic: 'on',
    note: 'cross-lingual: FR query, EN+FR chunks',
  },
  {
    q: 'What is a good recipe for chocolate chip cookies?',
    lang: 'en',
    topic: 'off',
  },
  {
    q: 'Qui a gagné la Coupe du Monde de football en 2018 ?',
    lang: 'fr',
    topic: 'off',
  },
  {
    q: 'qwerty asdf zxcv plugh xyzzy foobar baz',
    lang: 'en',
    topic: 'off',
    note: 'gibberish',
  },
  {
    q: 'How do I generate photorealistic images with Stable Diffusion?',
    lang: 'en',
    topic: 'off',
    note: 'AI-adjacent, not in corpus',
  },
];

interface VectorizeMatch {
  id: string;
  score: number;
}

async function vectorizeQuery(
  vector: number[],
  topK: number
): Promise<VectorizeMatch[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${INDEX}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector,
      topK,
      returnValues: false,
      returnMetadata: 'none',
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Vectorize query failed: ${res.status} ${await res.text()}`
    );
  }
  const json = (await res.json()) as {
    success: boolean;
    result?: { matches?: VectorizeMatch[] };
    errors?: unknown;
  };
  if (!json.success) {
    throw new Error(`Vectorize query error: ${JSON.stringify(json.errors)}`);
  }
  return json.result?.matches ?? [];
}

/** The slug is the first `#`-segment of a chunk id (`${slug}#${anchor}#${ordinal}`). */
const slugOf = (id: string): string => id.split('#')[0];

async function main(): Promise<void> {
  if (!ACCOUNT_ID || !TOKEN) {
    throw new Error(
      'Need CLOUDFLARE_ACCOUNT_ID + EMBEDDINGS_API_KEY (or CLOUDFLARE_API_TOKEN).'
    );
  }
  const embedder = createWorkersAiRestEmbedder(process.env);
  const on: number[] = [];
  const off: number[] = [];

  for (const p of PROBES) {
    const vec = await embedder.embedQuery(p.q);
    const matches = await vectorizeQuery(vec, 3);
    const top = matches[0]?.score ?? NaN;
    const slug = matches[0] ? slugOf(matches[0].id) : '-';
    (p.topic === 'on' ? on : off).push(top);
    const tag = `${p.topic.toUpperCase()}/${p.lang}${p.note ? ` (${p.note})` : ''}`;
    console.log(
      `${tag.padEnd(40)} top=${top.toFixed(4)}  -> ${slug.padEnd(36)} | ${p.q}`
    );
  }

  const onFloor = Math.min(...on);
  const offCeil = Math.max(...off);
  const gap = onFloor - offCeil;
  console.log('\n--- separation ---');
  console.log(`on-topic  floor (min): ${onFloor.toFixed(4)}`);
  console.log(`off-topic ceil  (max): ${offCeil.toFixed(4)}`);
  console.log(`gap (floor - ceil):    ${gap.toFixed(4)}`);

  if (!(gap > 0)) {
    console.log(
      '\n[X] NO SEPARATION: off-topic ceiling >= on-topic floor.\n' +
        '    If off-topic consistently outranks on-topic, Vectorize is returning\n' +
        '    DISTANCE -> flip the score in VectorizeVectorStore.search (sim = 1 - dist),\n' +
        '    update its test, redeploy, and re-run this probe.'
    );
    process.exitCode = 1;
    return;
  }
  // Bias toward the safe (higher) side: 60% of the way from the off-topic ceiling to the
  // on-topic floor. Zero false-accepts on these samples, with on-topic margin retained.
  const safe = +(offCeil + gap * 0.6).toFixed(3);
  const mid = +(offCeil + gap * 0.5).toFixed(3);
  console.log(
    `\n[OK] Separation positive (direction not inverted).\n` +
      `     Safe interval for AVATAR_SIMILARITY_THRESHOLD: (${offCeil.toFixed(4)}, ${onFloor.toFixed(4)}]\n` +
      `     midpoint=${mid}   lean-safe(0.6)=${safe}  <- recommended`
  );
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});

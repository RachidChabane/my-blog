import { describe, it, expect } from 'vitest';
import {
  WorkersAiRestEmbedder,
  WorkersAiBindingEmbedder,
  createWorkersAiRestEmbedder,
  EmbedderNotConfigured,
  WORKERS_AI_MODEL,
  WORKERS_AI_DIMENSIONS,
} from '@/lib/avatar/embedder';
import type { AiBinding } from '@/lib/avatar/cf';

const REST_URL =
  'https://api.cloudflare.com/client/v4/accounts/acc/ai/run/@cf/baai/bge-m3';

function dimVec(): number[] {
  return new Array<number>(WORKERS_AI_DIMENSIONS).fill(0);
}

/** A fetch stub that echoes one zero-vector per input text (the REST envelope). */
function workersAiFetch(
  capture?: {
    url: string;
    auth: string | undefined;
    body: { text: string | string[] };
  }[]
): typeof fetch {
  return ((url, init) => {
    const body = JSON.parse(String(init?.body ?? '{}')) as {
      text: string | string[];
    };
    const headers = (init?.headers ?? {}) as Record<string, string>;
    capture?.push({ url: String(url), auth: headers.Authorization, body });
    const n = Array.isArray(body.text) ? body.text.length : 1;
    const data = Array.from({ length: n }, dimVec);
    return Promise.resolve(
      new Response(JSON.stringify({ success: true, result: { data } }), {
        status: 200,
      })
    );
  }) as typeof fetch;
}

describe('WorkersAiRestEmbedder', () => {
  it('posts {text} to the Workers AI REST endpoint with a bearer token', async () => {
    const calls: {
      url: string;
      auth: string | undefined;
      body: { text: string | string[] };
    }[] = [];
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: workersAiFetch(calls),
    });
    const out = await emb.embed(['hello', 'world']);

    expect(emb.model).toBe(WORKERS_AI_MODEL);
    expect(emb.dimensions).toBe(WORKERS_AI_DIMENSIONS);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(WORKERS_AI_DIMENSIONS);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(REST_URL);
    expect(calls[0].auth).toBe('Bearer tok');
    expect(calls[0].body).toEqual({ text: ['hello', 'world'] });
  });

  it('embedQuery returns a single vector', async () => {
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: workersAiFetch(),
    });
    const v = await emb.embedQuery('hi');
    expect(v).toHaveLength(WORKERS_AI_DIMENSIONS);
  });

  it('batches inputs over EMBED_BATCH_SIZE into multiple requests', async () => {
    const calls: {
      url: string;
      auth: string | undefined;
      body: { text: string | string[] };
    }[] = [];
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: workersAiFetch(calls),
    });
    const texts = Array.from({ length: 101 }, (_, i) => `t${i}`);
    const out = await emb.embed(texts);
    expect(out).toHaveLength(101);
    expect(calls).toHaveLength(2); // 100 + 1
  });

  it('throws on a non-2xx response', async () => {
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: (() =>
        Promise.resolve(new Response('nope', { status: 500 }))) as typeof fetch,
    });
    await expect(emb.embed(['x'])).rejects.toThrow(/status 500/);
  });

  it('throws on a malformed (success:false) response', async () => {
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: (() =>
        Promise.resolve(
          new Response(JSON.stringify({ success: false }), { status: 200 })
        )) as typeof fetch,
    });
    await expect(emb.embed(['x'])).rejects.toThrow(/malformed/);
  });

  it('throws when the model returns the wrong dimension', async () => {
    const emb = new WorkersAiRestEmbedder({
      accountId: 'acc',
      apiToken: 'tok',
      fetchImpl: (() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ success: true, result: { data: [[1, 2, 3]] } }),
            {
              status: 200,
            }
          )
        )) as typeof fetch,
    });
    await expect(emb.embed(['x'])).rejects.toThrow(/expected 1024-d/);
  });
});

describe('WorkersAiBindingEmbedder', () => {
  function fakeAi(): AiBinding {
    return {
      run: (_model, input) => {
        const n = Array.isArray(input.text) ? input.text.length : 1;
        return Promise.resolve({
          shape: [n, WORKERS_AI_DIMENSIONS],
          data: Array.from({ length: n }, dimVec),
        });
      },
    };
  }

  it('embeds via the AI binding (no HTTP)', async () => {
    const emb = new WorkersAiBindingEmbedder(fakeAi());
    const out = await emb.embed(['a', 'b']);
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(WORKERS_AI_DIMENSIONS);
    const q = await emb.embedQuery('a');
    expect(q).toHaveLength(WORKERS_AI_DIMENSIONS);
  });
});

describe('createWorkersAiRestEmbedder', () => {
  it('throws EmbedderNotConfigured when token or account is absent', () => {
    expect(() => createWorkersAiRestEmbedder({})).toThrow(
      EmbedderNotConfigured
    );
    expect(() =>
      createWorkersAiRestEmbedder({ EMBEDDINGS_API_KEY: 'x' })
    ).toThrow(/CLOUDFLARE_ACCOUNT_ID/);
  });

  it('returns a bge-m3 embedder when both creds are present', () => {
    const emb = createWorkersAiRestEmbedder({
      EMBEDDINGS_API_KEY: 'tok',
      CLOUDFLARE_ACCOUNT_ID: 'acc',
    });
    expect(emb.model).toBe(WORKERS_AI_MODEL);
    expect(emb.dimensions).toBe(WORKERS_AI_DIMENSIONS);
  });

  it('falls back to CLOUDFLARE_API_TOKEN for the token', () => {
    const emb = createWorkersAiRestEmbedder({
      CLOUDFLARE_API_TOKEN: 'tok',
      CLOUDFLARE_ACCOUNT_ID: 'acc',
    });
    expect(emb.dimensions).toBe(WORKERS_AI_DIMENSIONS);
  });
});

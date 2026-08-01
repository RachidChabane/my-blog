// Monthly spend guardrail (src/lib/avatar/spend.ts + the endpoint gate).
// The cap must block BEFORE any retrieval/LLM work, answer with a comeback date
// (never the budget as a reason), record real OpenRouter costs after a grounded
// stream, and fail OPEN on ledger errors (degrade to "uncounted", never "down").

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import type { IndexArtifact, LlmRequest } from '@/lib/avatar/contracts';
import type { D1Database } from '@/lib/avatar/cf';
import {
  FakeEmbedder,
  FakeLLMProvider,
  buildFixtureArtifact,
} from '@/lib/avatar/fakes';
import { createRetriever } from '@/lib/avatar/retrieval';
import { parseSSE } from '@/lib/avatar/protocol';
import {
  D1SpendLedger,
  DEFAULT_MONTHLY_BUDGET_USD,
  FALLBACK_REQUEST_COST_USD,
  monthKey,
  nextMonthStart,
  parseMonthlyBudgetUsd,
} from '@/lib/avatar/spend';
import type { SpendLedger } from '@/lib/avatar/spend';
import { OpenRouterLLMProvider } from '@/lib/avatar/synthesize';
import { handleAvatarQuery } from '../functions/api/avatar/query';
import type { AvatarRetriever } from '../functions/api/avatar/query';

const ON_TOPIC = 'hybrid retrieval embeddings reranking';
const JULY = () => new Date(Date.UTC(2026, 6, 15, 12, 0, 0));

/** In-memory SpendLedger with failure switches + a call log. */
class InMemoryLedger implements SpendLedger {
  totals = new Map<string, number>();
  addCalls: Array<{ month: string; usd: number }> = [];
  failReads = false;
  failWrites = false;

  async getSpentUsd(month: string): Promise<number> {
    if (this.failReads) throw new Error('ledger read failed');
    return this.totals.get(month) ?? 0;
  }

  async addSpentUsd(month: string, usd: number): Promise<void> {
    if (this.failWrites) throw new Error('ledger write failed');
    this.addCalls.push({ month, usd });
    this.totals.set(month, (this.totals.get(month) ?? 0) + usd);
  }
}

async function drain(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let out = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  return out;
}

const post = (body: unknown): Request =>
  new Request('https://x/api/avatar/query', {
    method: 'POST',
    body: JSON.stringify(body),
  });

let artifact: IndexArtifact;
let retriever: AvatarRetriever;
let llm: FakeLLMProvider;
let ledger: InMemoryLedger;

beforeAll(async () => {
  const embedder = new FakeEmbedder();
  artifact = await buildFixtureArtifact(embedder);
  retriever = createRetriever(artifact, { embedder });
});
beforeEach(() => {
  llm = new FakeLLMProvider();
  ledger = new InMemoryLedger();
});

// --- calendar + budget parsing ----------------------------------------------
describe('spend calendar + budget parsing', () => {
  it('monthKey is the UTC YYYY-MM of the date', () => {
    expect(monthKey(JULY())).toBe('2026-07');
  });

  it('nextMonthStart is the 1st of the following month, incl. year rollover', () => {
    expect(nextMonthStart(JULY())).toBe('2026-08-01');
    expect(nextMonthStart(new Date(Date.UTC(2026, 11, 31)))).toBe('2027-01-01');
  });

  it('parseMonthlyBudgetUsd honors positive overrides, floors the rest to the default', () => {
    expect(parseMonthlyBudgetUsd(undefined)).toBe(DEFAULT_MONTHLY_BUDGET_USD);
    expect(parseMonthlyBudgetUsd('2.5')).toBe(2.5);
    // 0 / negative / NaN would disable the agent permanently — fall back.
    expect(parseMonthlyBudgetUsd('0')).toBe(DEFAULT_MONTHLY_BUDGET_USD);
    expect(parseMonthlyBudgetUsd('-1')).toBe(DEFAULT_MONTHLY_BUDGET_USD);
    expect(parseMonthlyBudgetUsd('abc')).toBe(DEFAULT_MONTHLY_BUDGET_USD);
  });
});

// --- endpoint gate ----------------------------------------------------------
describe('endpoint spend gate', () => {
  it('budget spent → 503 with availableAt; retriever and LLM never touched', async () => {
    ledger.totals.set('2026-07', 5);
    let retrieveCalls = 0;
    const spyRetriever: AvatarRetriever = {
      retrieve: (q, opts) => {
        retrieveCalls += 1;
        return retriever.retrieve(q, opts);
      },
    };
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever: spyRetriever,
      llm,
      spend: { ledger, budgetUsd: 5, now: JULY },
    });
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toContain('Aug 2026');
    const body = (await res.json()) as { error: string; availableAt: string };
    expect(body.availableAt).toBe('2026-08-01');
    // The reason (budget) is never disclosed.
    expect(JSON.stringify(body)).not.toMatch(/budget|spend|quota|cost/i);
    expect(retrieveCalls).toBe(0);
    expect(llm.callCount).toBe(0);
  });

  it('the gate is inclusive: spent === budget blocks', async () => {
    ledger.totals.set('2026-07', 2);
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever,
      llm,
      spend: { ledger, budgetUsd: 2, now: JULY },
    });
    expect(res.status).toBe(503);
  });

  it('under budget → grounded 200 and the request cost is recorded for the month', async () => {
    ledger.totals.set('2026-07', 4.5);
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever,
      llm,
      spend: { ledger, budgetUsd: 5, now: JULY },
    });
    expect(res.status).toBe(200);
    const frames = parseSSE(await drain(res));
    expect(frames.some((f) => f.event === 'done')).toBe(true);
    // FakeLLMProvider reports no usage → the conservative fallback is recorded.
    expect(ledger.addCalls).toEqual([
      { month: '2026-07', usd: FALLBACK_REQUEST_COST_USD },
    ]);
  });

  it('a ledger READ failure fails open: the avatar still answers', async () => {
    ledger.failReads = true;
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever,
      llm,
      spend: { ledger, budgetUsd: 5, now: JULY },
    });
    expect(res.status).toBe(200);
    expect(llm.callCount).toBe(1);
  });

  it('a ledger WRITE failure never breaks an already-streamed answer', async () => {
    ledger.failWrites = true;
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever,
      llm,
      spend: { ledger, budgetUsd: 5, now: JULY },
    });
    const frames = parseSSE(await drain(res));
    expect(frames.some((f) => f.event === 'done')).toBe(true);
    expect(frames.some((f) => f.event === 'error')).toBe(false);
  });

  it('no spend deps → no gate, no recording (local dev without D1)', async () => {
    const res = await handleAvatarQuery(post({ query: ON_TOPIC }), {
      retriever,
      llm,
    });
    expect(res.status).toBe(200);
    expect(ledger.addCalls).toEqual([]);
  });
});

// --- OpenRouter usage accounting --------------------------------------------
describe('OpenRouterLLMProvider usage accounting', () => {
  const sse = (lines: string[]): Response =>
    new Response(lines.map((l) => `data: ${l}\n`).join(''), { status: 200 });

  it('requests accounting and captures usage.cost from the final chunk', async () => {
    let sentBody: Record<string, unknown> = {};
    const provider = new OpenRouterLLMProvider({
      apiKey: 'k',
      fetchImpl: async (_url, init) => {
        sentBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return sse([
          '{"choices":[{"delta":{"content":"Hello"}}]}',
          '{"choices":[{"delta":{}}],"usage":{"cost":0.0042,"prompt_tokens":10}}',
          '[DONE]',
        ]);
      },
    });
    const request: LlmRequest = {
      system: 's',
      messages: [{ role: 'user', content: 'q' }],
    };
    const chunks: string[] = [];
    for await (const c of provider.stream(request)) chunks.push(c);
    expect(chunks).toEqual(['Hello']);
    expect(sentBody.usage).toEqual({ include: true });
    expect(provider.lastUsage()).toEqual({ costUsd: 0.0042 });
  });

  it('lastUsage resets per stream and stays undefined without a usage chunk', async () => {
    const provider = new OpenRouterLLMProvider({
      apiKey: 'k',
      fetchImpl: async () =>
        sse(['{"choices":[{"delta":{"content":"x"}}]}', '[DONE]']),
    });
    const request: LlmRequest = { system: 's', messages: [] };
    for await (const _ of provider.stream(request)) void _;
    expect(provider.lastUsage()).toBeUndefined();
  });
});

// --- D1 adapter -------------------------------------------------------------
describe('D1SpendLedger', () => {
  function fakeDb(firstValue: unknown) {
    const calls: Array<{ sql: string; binds: unknown[] }> = [];
    const stmtFor = (call: { sql: string; binds: unknown[] }) => {
      const stmt = {
        bind(...values: unknown[]) {
          call.binds = values;
          return stmt;
        },
        first: async () => firstValue,
        run: async () => ({ results: [], success: true, meta: {} }),
        all: async () => ({ results: [], success: true, meta: {} }),
      };
      return stmt;
    };
    const db = {
      prepare(sql: string) {
        const call = { sql, binds: [] as unknown[] };
        calls.push(call);
        return stmtFor(call);
      },
      batch: async () => [],
      exec: async () => ({ count: 0, duration: 0 }),
    };
    return { db: db as unknown as D1Database, calls };
  }

  it('getSpentUsd returns 0 for a month with no row', async () => {
    const { db } = fakeDb(null);
    expect(await new D1SpendLedger(db).getSpentUsd('2026-07')).toBe(0);
  });

  it('getSpentUsd returns the stored total', async () => {
    const { db, calls } = fakeDb(3.25);
    expect(await new D1SpendLedger(db).getSpentUsd('2026-07')).toBe(3.25);
    expect(calls[0].binds).toEqual(['2026-07']);
  });

  it('addSpentUsd upserts atomically (month, usd, timestamp)', async () => {
    const { db, calls } = fakeDb(null);
    await new D1SpendLedger(db).addSpentUsd('2026-07', 0.01);
    expect(calls[0].sql).toContain('ON CONFLICT(month)');
    expect(calls[0].sql).toContain('spent_usd + excluded.spent_usd');
    expect(calls[0].binds.slice(0, 2)).toEqual(['2026-07', 0.01]);
    expect(typeof calls[0].binds[2]).toBe('string'); // ISO timestamp
  });
});

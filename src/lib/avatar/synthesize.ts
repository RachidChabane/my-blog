// Server-only: do not import in client-side islands.
// Synthesis: build the grounded LlmRequest (citations-precede-prose is enforced
// by the endpoint's stream order, not here) + the real OpenRouter LLMProvider.
// Real impl targets OpenRouter (https://openrouter.ai/api/v1) — NOT Anthropic.

import type { Candidate, LLMProvider, LlmRequest, LlmUsage } from './contracts';
import type { Citation, Locale } from './protocol';
import {
  GROUNDING_CLAUSES,
  NO_EXFILTRATION_CLAUSES,
  wrapUserContent,
} from './guard';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview'; // Gemini 3 Flash (OpenRouter); swappable at the seam
const DEFAULT_TEMPERATURE = 0.2;

/** Localized refusal message for the idk branch. */
export const IDK_MESSAGE: Record<Locale, string> = {
  en: "I don't know. I couldn't find anything about that in the site content.",
  fr: "Je ne sais pas. Je n'ai rien trouvé à ce sujet dans le contenu du site.",
};

/**
 * Collapse the retrieved chunks to ONE per article, in the reader's language, so the
 * cited Sources list shows each article once (not its EN and FR versions both, nor the
 * same article's several sections). The corpus is fully bilingual but a chunk carries no
 * cross-lingual key (only `slug` + `lang`, and the slug differs across languages), so:
 *   1. prefer the query-language chunks (fallback: keep all if none match — e.g. an
 *      off-language-only match), then
 *   2. dedup by `slug`, keeping the highest-ranked (first) chunk per article.
 * Applied to `outcome.chunks` BEFORE buildSynthesisRequest, so the LLM context and the
 * citations use the same deduped, renumbered set and the inline [n] markers stay aligned.
 * `chunks` is assumed pre-sorted by relevance (the retriever's RRF order).
 */
export function dedupeChunksByArticle(
  chunks: Candidate[],
  lang: Locale
): Candidate[] {
  const inLang = chunks.filter((c) => c.chunk.lang === lang);
  const base = inLang.length > 0 ? inLang : chunks;
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of base) {
    if (seen.has(c.chunk.slug)) continue;
    seen.add(c.chunk.slug);
    out.push(c);
  }
  return out;
}

/** Map retrieved candidates → a numbered context block + the citation list. */
export function buildContextBlock(chunks: Candidate[]): {
  numbered: string;
  citations: Citation[];
} {
  const citations: Citation[] = chunks.map((c, i) => ({
    n: i + 1,
    title: c.chunk.title,
    sourceUrl: c.chunk.sourceUrl,
    headingAnchor: c.chunk.headingAnchor,
    slug: c.chunk.slug,
    lang: c.chunk.lang,
  }));
  const numbered = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.chunk.title} — ${c.chunk.sourceUrl}\n${c.chunk.text}`
    )
    .join('\n\n');
  return { numbered, citations };
}

/** Compose the hardened, grounded-only system prompt for a given locale. */
export function buildSystemPrompt(lang: Locale): string {
  const language = lang === 'fr' ? 'French' : 'English';
  return [
    "You are the assistant on Rachid Chabane's personal site. You answer",
    "visitors' questions about Rachid and the blog.",
    GROUNDING_CLAUSES,
    NO_EXFILTRATION_CLAUSES,
    `Cite sources inline as [n], matching the numbered SITE_CONTEXT items.`,
    `Never use em-dashes (the long dash); use commas, colons, semicolons, or periods instead.`,
    DIAGRAM_TOOL_CLAUSES,
    `Answer in ${language}. Be concise.`,
  ].join(' ');
}

/**
 * The one "tool" the assistant can use inline: a layered architecture diagram. It is
 * OPTIONAL and grounded — only draw what the SITE_CONTEXT actually describes (never
 * invent a structure). The endpoint parses this fenced block out of the stream and
 * renders it as a real diagram, so the JSON must be exact. Keep prose answering the
 * question; the diagram supplements it.
 */
const DIAGRAM_TOOL_CLAUSES = [
  'When the visitor asks about the ARCHITECTURE or STRUCTURE of a system that the',
  'SITE_CONTEXT describes as layered components, you MAY add ONE diagram by emitting',
  'a fenced block on its own lines:',
  '```rc-diagram',
  '{"title":"short title","layers":[{"label":"Layer name","nodes":["Component A","Component B"]}]}',
  '```',
  'Rules: emit valid minified JSON (double quotes, no trailing commas); 2 to 6 layers',
  'top-to-bottom; only components named in the SITE_CONTEXT; omit the diagram entirely',
  'if the context does not describe a layered structure. Still answer in prose and cite',
  '[n]; the diagram is a supplement, not a replacement.',
].join(' ');

/** Build the synthesis request + the citation list to stream before the prose. */
export function buildSynthesisRequest(args: {
  query: string;
  lang: Locale;
  chunks: Candidate[];
}): { request: LlmRequest; citations: Citation[] } {
  const { numbered, citations } = buildContextBlock(args.chunks);
  const request: LlmRequest = {
    system: buildSystemPrompt(args.lang),
    messages: [
      { role: 'user', content: wrapUserContent(args.query, numbered) },
    ],
    temperature: DEFAULT_TEMPERATURE,
  };
  return { request, citations };
}

export interface OpenRouterOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  /** Injectable for tests (defaults to globalThis.fetch). */
  fetchImpl?: typeof fetch;
}

/**
 * Real LLMProvider over OpenRouter's OpenAI-compatible streaming chat API.
 * Parses the `data: {json}` SSE response and yields `choices[0].delta.content`.
 * Throws a generic error on non-2xx (no response-body leak). Live calls are the
 * post-secret step; unit tests mock `fetchImpl`.
 */
export class OpenRouterLLMProvider implements LLMProvider {
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private usage: LlmUsage | undefined;

  constructor(opts: OpenRouterOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.baseUrl = opts.baseUrl ?? OPENROUTER_BASE_URL;
    // Bind to globalThis: on the Cloudflare Workers runtime a bare `globalThis.fetch`
    // called as `this.fetchImpl(...)` throws "Illegal invocation" (native fetch requires
    // `this === globalThis`). Tests inject fetchImpl, so this default path is live-only.
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  /** Usage of the last completed stream (undefined until OpenRouter reports it). */
  lastUsage(): LlmUsage | undefined {
    return this.usage;
  }

  async *stream(request: LlmRequest): AsyncIterable<string> {
    this.usage = undefined;
    const res = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model ?? this.model,
        messages: [
          { role: 'system', content: request.system },
          ...request.messages,
        ],
        stream: true,
        temperature: request.temperature ?? DEFAULT_TEMPERATURE,
        // OpenRouter accounting: the final SSE chunk then carries a `usage`
        // object whose `cost` is the request's price in USD credits. Feeds the
        // monthly spend guardrail (see ./spend.ts).
        usage: { include: true },
      }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`Synthesis provider error (status ${res.status}).`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') return;
        const parsed = JSON.parse(payload);
        const cost = parsed?.usage?.cost;
        if (typeof cost === 'number') this.usage = { costUsd: cost };
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) yield delta;
      }
    }
  }
}

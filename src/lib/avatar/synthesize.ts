// Server-only: do not import in client-side islands.
// Synthesis: build the grounded LlmRequest (citations-precede-prose is enforced
// by the endpoint's stream order, not here) + the real OpenRouter LLMProvider.
// Real impl targets OpenRouter (https://openrouter.ai/api/v1) — NOT Anthropic.

import type { Candidate, LLMProvider, LlmRequest } from './contracts';
import type { Citation, Locale } from './protocol';
import {
  GROUNDING_CLAUSES,
  NO_EXFILTRATION_CLAUSES,
  wrapUserContent,
} from './guard';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'anthropic/claude-3.5-haiku'; // Haiku-tier; swappable at the seam
const DEFAULT_TEMPERATURE = 0.2;

/** Localized refusal message for the idk branch. */
export const IDK_MESSAGE: Record<Locale, string> = {
  en: "I don't know — I couldn't find anything about that in the site content.",
  fr: "Je ne sais pas — je n'ai rien trouvé à ce sujet dans le contenu du site.",
};

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
    `Answer in ${language}. Be concise.`,
  ].join(' ');
}

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

  constructor(opts: OpenRouterOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.baseUrl = opts.baseUrl ?? OPENROUTER_BASE_URL;
    // Bind to globalThis: on the Cloudflare Workers runtime a bare `globalThis.fetch`
    // called as `this.fetchImpl(...)` throws "Illegal invocation" (native fetch requires
    // `this === globalThis`). Tests inject fetchImpl, so this default path is live-only.
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async *stream(request: LlmRequest): AsyncIterable<string> {
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
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) yield delta;
      }
    }
  }
}

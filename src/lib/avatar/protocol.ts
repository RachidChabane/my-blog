// API contract for the avatar query endpoint (POST /api/avatar/query).
// Browser-safe: task 20's client island imports this to parse the stream.
// Do NOT import any server-only module here.

export type Locale = 'fr' | 'en';

/** Request body the UI POSTs. `lang` is the page locale the answer is given in. */
export interface AvatarQueryRequest {
  query: string;
  lang?: Locale;
}

/** A grounded source, derived from a retrieved chunk (NOT model-generated). */
export interface Citation {
  /** 1-based marker the prose references as `[n]`. */
  n: number;
  title: string;
  sourceUrl: string;
  headingAnchor: string;
  slug: string;
  lang: Locale;
}

/** SSE event names. The stream always sends `sources` (or `idk`) BEFORE tokens. */
export const SSE_EVENT = {
  sources: 'sources',
  token: 'token',
  idk: 'idk',
  done: 'done',
  error: 'error',
} as const;
export type SseEventName = (typeof SSE_EVENT)[keyof typeof SSE_EVENT];

export interface SourcesEventData {
  citations: Citation[];
}
export interface TokenEventData {
  text: string;
}
export interface IdkEventData {
  message: string;
  suggestions: Citation[];
}
export interface DoneEventData {
  // Only 'grounded' | 'idk' are emitted: a `done` frame terminates the refusal
  // and success paths. The mid-stream failure path emits an `error` frame and
  // closes WITHOUT a `done`, so no 'error' finishReason is ever produced.
  finishReason: 'grounded' | 'idk';
  topSimilarity: number;
  threshold: number;
}
export interface ErrorEventData {
  message: string; // generic, user-safe; never leaks internals
}

export const SSE_CONTENT_TYPE = 'text/event-stream; charset=utf-8';

/** Encode one SSE frame: `event: <name>\ndata: <json>\n\n`. */
export function encodeSSE(event: SseEventName, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/**
 * Minimal SSE parser for tests + the task-20 client. Splits on the blank-line
 * frame separator; reads the `event:` and (single) `data:` line per frame.
 * (We always emit exactly one JSON `data:` line per frame.)
 */
export function parseSSE(raw: string): Array<{ event: string; data: unknown }> {
  const frames: Array<{ event: string; data: unknown }> = [];
  for (const block of raw.split('\n\n')) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    let event = 'message';
    let dataLine = '';
    for (const line of trimmed.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLine = line.slice(5).trim();
    }
    frames.push({ event, data: dataLine ? JSON.parse(dataLine) : null });
  }
  return frames;
}

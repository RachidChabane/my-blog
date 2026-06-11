// Server-side (but pure: no server-only imports, so it unit-tests directly).
// Streaming fence parser: turns the LLM's raw token stream into a sequence of
// `token` (prose) and `artifact` (diagram/code) events. The endpoint forwards each
// as an SSE frame. The model emits an artifact as a fenced block at a line start:
//
//   ```rc-diagram
//   {"title":"…","layers":[{"label":"Frontend","nodes":["React 19"]}]}
//   ```
//
// A `rc-diagram` fence whose body is valid diagram JSON becomes a DiagramArtifact;
// any other fence (and an rc-diagram fence with unparseable JSON) becomes a plain
// CodeArtifact. Text outside fences streams through as `token`s, word-by-word —
// the parser only holds back at a fresh line start that could still become a fence
// marker (so a fence split across deltas is detected), and flushes any unterminated
// fence as literal text on `end` (nothing the model emitted is ever dropped).

import type { Artifact, DiagramArtifact, CodeArtifact } from './protocol';

// ---- bounds (defensive: the model is grounded, but the artifact still hits the DOM) ----
const MAX_LAYERS = 8;
const MAX_NODES_PER_LAYER = 12;
const MAX_LABEL_LEN = 60;
const MAX_NODE_LEN = 48;
const MAX_TITLE_LEN = 120;
const MAX_CODE_LEN = 6000;
const MAX_LANG_LEN = 24;

const DIAGRAM_LANG = 'rc-diagram';

/** A parsed stream event: prose text, or a structured artifact. */
export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'artifact'; artifact: Artifact };

const tok = (text: string): StreamEvent => ({ type: 'token', text });

function clamp(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max) : t;
}

/** True when `s` (a fresh line so far, no newline yet) could still become a fence opener. */
function couldBeFenceOpener(s: string): boolean {
  // "`" / "``" / "```"  → a still-forming opener; "```lang…" → opener awaiting its newline.
  return '```'.startsWith(s) || s.startsWith('```');
}

/**
 * Build the artifact for a completed fence. `rc-diagram` + valid diagram JSON →
 * DiagramArtifact; everything else (incl. malformed diagram JSON) → CodeArtifact,
 * so a model slip degrades to a readable code card rather than breaking or vanishing.
 */
export function buildArtifact(lang: string, body: string): Artifact {
  const l = lang.trim().toLowerCase();
  if (l === DIAGRAM_LANG) {
    const diagram = tryParseDiagram(body);
    if (diagram) return diagram;
  }
  const code: CodeArtifact = { kind: 'code', code: body.replace(/\n+$/, '') };
  const langTag = clamp(l, MAX_LANG_LEN);
  if (langTag && langTag !== DIAGRAM_LANG) code.lang = langTag;
  return code;
}

function tryParseDiagram(body: string): DiagramArtifact | null {
  let obj: unknown;
  try {
    obj = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof obj !== 'object' || obj === null) return null;
  const raw = obj as Record<string, unknown>;
  if (!Array.isArray(raw.layers)) return null;
  const layers: DiagramArtifact['layers'] = [];
  for (const ly of raw.layers) {
    if (layers.length >= MAX_LAYERS) break;
    if (typeof ly !== 'object' || ly === null) continue;
    const lyr = ly as Record<string, unknown>;
    if (typeof lyr.label !== 'string' || !Array.isArray(lyr.nodes)) continue;
    const nodes: string[] = [];
    for (const n of lyr.nodes) {
      if (nodes.length >= MAX_NODES_PER_LAYER) break;
      if (typeof n === 'string' && n.trim()) nodes.push(clamp(n, MAX_NODE_LEN));
    }
    if (nodes.length === 0) continue;
    layers.push({ label: clamp(lyr.label, MAX_LABEL_LEN), nodes });
  }
  if (layers.length === 0) return null;
  const diagram: DiagramArtifact = { kind: 'diagram', layers };
  if (typeof raw.title === 'string' && raw.title.trim())
    diagram.title = clamp(raw.title, MAX_TITLE_LEN);
  if (typeof raw.caption === 'string' && raw.caption.trim())
    diagram.caption = clamp(raw.caption, MAX_TITLE_LEN);
  return diagram;
}

/**
 * Incremental parser. `push(delta)` returns the events newly decidable from the
 * text so far; `flush()` drains the tail (and emits any unterminated fence as
 * literal text). Stateful but pure — the async wrapper and the tests both drive it.
 */
export class ArtifactStreamParser {
  private buffer = '';
  private mode: 'prose' | 'fence' = 'prose';
  private freshLine = true; // at the start of a line (where a fence may open)?
  private fenceLang = '';
  private fenceBody = '';
  private codeBudget = MAX_CODE_LEN;

  push(delta: string): StreamEvent[] {
    this.buffer += delta;
    return this.drain(false);
  }

  flush(): StreamEvent[] {
    return this.drain(true);
  }

  private drain(end: boolean): StreamEvent[] {
    const out: StreamEvent[] = [];
    for (;;) {
      if (this.mode === 'prose') {
        if (!this.stepProse(out, end)) break;
      } else {
        if (!this.stepFence(out, end)) break;
      }
    }
    return out;
  }

  /** @returns true to keep draining, false to stop (need more input / done). */
  private stepProse(out: StreamEvent[], end: boolean): boolean {
    const nl = this.buffer.indexOf('\n');
    if (this.freshLine) {
      if (nl === -1) {
        if (this.buffer === '') return false;
        if (couldBeFenceOpener(this.buffer)) {
          if (!end) return false; // could still become a fence — wait
          out.push(tok(this.buffer)); // give up at end: emit literally
          this.buffer = '';
          return false;
        }
        // Disqualified as a fence: stream it; no longer at a line start.
        out.push(tok(this.buffer));
        this.buffer = '';
        this.freshLine = false;
        return false;
      }
      const line = this.buffer.slice(0, nl);
      if (line.startsWith('```')) {
        this.fenceLang = line.slice(3).trim();
        this.fenceBody = '';
        this.codeBudget = MAX_CODE_LEN;
        this.mode = 'fence';
        this.buffer = this.buffer.slice(nl + 1);
        this.freshLine = true;
        return true;
      }
      out.push(tok(this.buffer.slice(0, nl + 1)));
      this.buffer = this.buffer.slice(nl + 1);
      this.freshLine = true;
      return true;
    }
    // Mid-line: nothing here can open a fence; stream to the next newline.
    if (nl === -1) {
      if (this.buffer === '') return false;
      out.push(tok(this.buffer));
      this.buffer = '';
      return false;
    }
    out.push(tok(this.buffer.slice(0, nl + 1)));
    this.buffer = this.buffer.slice(nl + 1);
    this.freshLine = true;
    return true;
  }

  /** @returns true to keep draining, false to stop. */
  private stepFence(out: StreamEvent[], end: boolean): boolean {
    const nl = this.buffer.indexOf('\n');
    if (nl === -1) {
      if (end) {
        // Unterminated fence: emit everything literally so nothing is lost.
        out.push(
          tok('```' + this.fenceLang + '\n' + this.fenceBody + this.buffer)
        );
        this.buffer = '';
        this.mode = 'prose';
        this.freshLine = true;
      }
      return false;
    }
    const line = this.buffer.slice(0, nl);
    if (line.trim() === '```') {
      out.push({
        type: 'artifact',
        artifact: buildArtifact(this.fenceLang, this.fenceBody),
      });
      this.buffer = this.buffer.slice(nl + 1);
      this.mode = 'prose';
      this.freshLine = true;
      return true;
    }
    // Body line — append within the code budget (over-long bodies are clipped).
    const piece = this.buffer.slice(0, nl + 1);
    if (this.codeBudget > 0) {
      this.fenceBody += piece.slice(0, this.codeBudget);
      this.codeBudget -= piece.length;
    }
    this.buffer = this.buffer.slice(nl + 1);
    return true;
  }
}

/**
 * Async wrapper: transform a raw delta stream into a StreamEvent stream. Used by the
 * endpoint; the synchronous parser core above is what the tests exercise directly.
 */
export async function* parseArtifactStream(
  deltas: AsyncIterable<string>
): AsyncIterable<StreamEvent> {
  const parser = new ArtifactStreamParser();
  for await (const delta of deltas) {
    for (const ev of parser.push(delta)) yield ev;
  }
  for (const ev of parser.flush()) yield ev;
}

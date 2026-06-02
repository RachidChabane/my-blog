import { describe, it, expect } from 'vitest';
import { takeFrames } from '@/lib/sse-frames';
import { encodeSSE, parseSSE, SSE_EVENT } from '@/lib/avatar/protocol';

// Unit-tests the one piece of client streaming logic e2e cannot reach: a frame
// split across network reads (route.fulfill delivers the body in one chunk, so
// the cross-read reassembly path is never exercised by Playwright — plan R2/C2).
// Each emitted complete frame is fed back through the PINNED parseSSE so the
// splitter stays tied to the real parser rather than re-deriving line parsing.

describe('takeFrames — incremental SSE frame splitter', () => {
  it('peels a single complete frame and leaves an empty remainder', () => {
    const frame = 'event: token\ndata: {"text":"hi"}';
    const { frames, rest } = takeFrames(frame + '\n\n');
    expect(frames).toEqual([frame]);
    expect(rest).toBe('');
  });

  it('reassembles a frame split across two reads (no emit until the blank line)', () => {
    const whole = 'event: token\ndata: {"text":"partial"}\n\n';
    const a = whole.slice(0, 18); // cut mid-"data:", before the \n\n terminator
    const b = whole.slice(18);

    const first = takeFrames(a);
    expect(first.frames).toEqual([]); // nothing complete yet
    expect(first.rest).toBe(a); // the partial is retained verbatim

    const second = takeFrames(first.rest + b);
    expect(second.frames).toEqual(['event: token\ndata: {"text":"partial"}']);
    expect(second.rest).toBe('');
  });

  it('peels several complete frames out of one buffer', () => {
    const f1 = 'event: sources\ndata: {"citations":[]}';
    const f2 = 'event: token\ndata: {"text":"a"}';
    const f3 = 'event: done\ndata: {"finishReason":"grounded"}';
    const { frames, rest } = takeFrames([f1, f2, f3].join('\n\n') + '\n\n');
    expect(frames).toEqual([f1, f2, f3]);
    expect(rest).toBe('');
  });

  it('retains a trailing partial frame after the complete ones', () => {
    const f1 = 'event: token\ndata: {"text":"one"}';
    const f2 = 'event: token\ndata: {"text":"two"}';
    const partial = 'event: token\ndata: {"text":"thr';
    const { frames, rest } = takeFrames(f1 + '\n\n' + f2 + '\n\n' + partial);
    expect(frames).toEqual([f1, f2]);
    expect(rest).toBe(partial);
  });

  it('emitted frames round-trip through the pinned parseSSE', () => {
    const buffer =
      encodeSSE(SSE_EVENT.sources, { citations: [] }) +
      encodeSSE(SSE_EVENT.token, { text: 'Yes.' }) +
      encodeSSE(SSE_EVENT.done, { finishReason: 'grounded' });
    const { frames, rest } = takeFrames(buffer);
    expect(rest).toBe('');
    const parsed = frames.flatMap((f) => parseSSE(f));
    expect(parsed).toEqual([
      { event: 'sources', data: { citations: [] } },
      { event: 'token', data: { text: 'Yes.' } },
      { event: 'done', data: { finishReason: 'grounded' } },
    ]);
  });
});

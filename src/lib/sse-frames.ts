// Pure, framework-free SSE frame splitter. Browser-safe and generic — it lives
// OUTSIDE src/lib/avatar/** on purpose (it is not part of the avatar server seam),
// so the task-20 client island can buffer the streamed response without touching
// any server-only module. It does the incremental buffering the pinned `parseSSE`
// (src/lib/avatar/protocol.ts) does not: peel every COMPLETE blank-line-terminated
// frame off an accumulating buffer, returning the still-incomplete remainder so a
// frame split across network reads is reassembled before it is parsed.

/**
 * Peel complete `\n\n`-terminated frames off an accumulating buffer.
 * Returns the complete frame strings and the leftover (incomplete) remainder.
 */
export function takeFrames(buffer: string): { frames: string[]; rest: string } {
  const frames: string[] = [];
  let i: number;
  while ((i = buffer.indexOf('\n\n')) !== -1) {
    frames.push(buffer.slice(0, i));
    buffer = buffer.slice(i + 2);
  }
  return { frames, rest: buffer };
}

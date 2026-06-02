import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static-source guards (mirror shell.test.ts / about.test.ts) for the task-20
// avatar overlay. They MIGRATE the D-007/INV-9 guards that lived on the deleted
// AvatarLauncher.astro onto the interactive component, and add the island-specific
// ones: the textContent-only XSS posture, the pinned-contract wiring, and the
// tokens-only stylesheet. No gate regex enforces these, so they are pinned here.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(`${root}/${rel}`, 'utf8');

// See ui.test.ts for why Emoji_Presentation (not Extended_Pictographic).
const EMOJI = /\p{Emoji_Presentation}/u;

const avatar = read('src/components/Avatar.astro');
const panel = read('src/components/avatar/Panel.astro');
const css = read('src/styles/avatar.css');

describe('avatar overlay — INV-9 (no emoji)', () => {
  for (const [name, src] of [
    ['Avatar.astro', avatar],
    ['avatar/Panel.astro', panel],
    ['avatar.css', css],
  ] as const) {
    it(`${name}: contains no emoji`, () => {
      expect(EMOJI.test(src)).toBe(false);
    });
  }
});

describe('avatar overlay — non-figurative (D-007)', () => {
  for (const [name, src] of [
    ['Avatar.astro', avatar],
    ['avatar/Panel.astro', panel],
  ] as const) {
    it(`${name}: renders no figure (no <img>, no "face", no rc-avatar element)`, () => {
      expect(src).not.toMatch(/<img/);
      // Word-boundary: the figurative word "face", NOT --surface / interface.
      expect(src).not.toMatch(/\bface\b/i);
      // Substring check (NOT a tag regex — keep it strict): the design's custom
      // element name. We use the pure-CSS rc-mark lattice; the panel id is
      // `avatar-panel`, deliberately free of the rc-avatar substring.
      expect(src).not.toContain('rc-avatar');
    });

    it(`${name}: renders the abstract lattice`, () => {
      expect(src).toContain('rc-mark__node');
      expect(src).toContain('aria-hidden');
    });
  }
});

describe('avatar overlay — XSS posture (textContent only)', () => {
  // Untrusted streamed tokens / citation fields must never reach a markup sink.
  it('Avatar.astro uses neither innerHTML nor set:html (own comments avoid them too)', () => {
    expect(avatar).not.toContain('innerHTML');
    expect(avatar).not.toContain('set:html');
  });
});

describe('avatar overlay — launcher slot + pinned-contract wiring', () => {
  it('preserves the data-avatar-slot launcher hook with a localized label', () => {
    expect(avatar).toContain('data-avatar-slot'); // keeps shell.spec.ts green
    expect(avatar).toContain('aria-label');
    expect(avatar).toContain('avatarAria');
  });

  it('reuses the pinned SSE parser + the frame splitter, and posts to the endpoint', () => {
    expect(avatar).toContain('parseSSE'); // not a hand-rolled parser (C1)
    expect(avatar).toContain('SSE_EVENT');
    expect(avatar).toContain('@/lib/avatar/protocol');
    expect(avatar).toContain('takeFrames');
    expect(avatar).toContain('@/lib/sse-frames');
    expect(avatar).toContain('/api/avatar/query');
  });
});

describe('avatar.css — tokens only', () => {
  it('is non-empty and hard-codes no color literal', () => {
    expect(css.trim().length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}/); // no hex literal
    expect(css).not.toMatch(/\brgb\(/); // no rgb()/rgba()
    expect(css).not.toMatch(/\bhsl\(/); // no hsl()/hsla()
    // color-mix(in srgb, var(--accent) …) is allowed — it references a token.
  });
});

import { describe, it, expect } from 'vitest';
import {
  ArtifactStreamParser,
  buildArtifact,
  parseArtifactStream,
  type StreamEvent,
} from '@/lib/avatar/artifacts';
import type { DiagramArtifact, CodeArtifact } from '@/lib/avatar/protocol';

/** Drive the parser with a delta sequence and return all events (push… then flush). */
function run(deltas: string[]): StreamEvent[] {
  const p = new ArtifactStreamParser();
  const out: StreamEvent[] = [];
  for (const d of deltas) out.push(...p.push(d));
  out.push(...p.flush());
  return out;
}

const proseText = (evs: StreamEvent[]): string =>
  evs
    .filter((e): e is { type: 'token'; text: string } => e.type === 'token')
    .map((e) => e.text)
    .join('');

const artifacts = (evs: StreamEvent[]) =>
  evs
    .filter(
      (
        e
      ): e is { type: 'artifact'; artifact: DiagramArtifact | CodeArtifact } =>
        e.type === 'artifact'
    )
    .map((e) => e.artifact);

const DIAGRAM_JSON =
  '{"title":"Platform","layers":[{"label":"Frontend","nodes":["React 19","TypeScript"]},{"label":"Backend","nodes":["Django"]}]}';

describe('ArtifactStreamParser — prose passthrough', () => {
  it('streams plain prose unchanged regardless of delta boundaries', () => {
    const full = 'The platform is a full-stack product.\nIt cites [1].';
    const evs = run([
      'The platform ',
      'is a full-stack',
      ' product.\nIt cites [1].',
    ]);
    expect(artifacts(evs)).toHaveLength(0);
    expect(proseText(evs)).toBe(full);
  });

  it('emits mid-line text immediately (word-by-word streaming preserved)', () => {
    const p = new ArtifactStreamParser();
    expect(p.push('Hel')).toEqual([{ type: 'token', text: 'Hel' }]);
    expect(p.push('lo')).toEqual([{ type: 'token', text: 'lo' }]);
  });

  it('does not mistake inline single backticks for a fence', () => {
    const evs = run(['Use `npm test` to run.\n']);
    expect(artifacts(evs)).toHaveLength(0);
    expect(proseText(evs)).toBe('Use `npm test` to run.\n');
  });

  it('a fresh-line backtick prefix that is not a fence is not lost', () => {
    // "``x" begins like a fence then disqualifies — must still surface as prose.
    const evs = run(['``', 'x mid', '\n']);
    expect(artifacts(evs)).toHaveLength(0);
    expect(proseText(evs)).toBe('``x mid\n');
  });
});

describe('ArtifactStreamParser — diagram fences', () => {
  it('parses an rc-diagram fence into a DiagramArtifact, prose preserved around it', () => {
    const evs = run([
      'Here is the shape:\n',
      '```rc-diagram\n',
      DIAGRAM_JSON + '\n',
      '```\n',
      'That maps the layers.',
    ]);
    expect(proseText(evs)).toBe('Here is the shape:\nThat maps the layers.');
    const [art] = artifacts(evs);
    expect(art.kind).toBe('diagram');
    const d = art as DiagramArtifact;
    expect(d.title).toBe('Platform');
    expect(d.layers.map((l) => l.label)).toEqual(['Frontend', 'Backend']);
    expect(d.layers[0].nodes).toEqual(['React 19', 'TypeScript']);
  });

  it('detects a fence marker split across many deltas', () => {
    const evs = run([
      '``',
      '`rc-dia',
      'gram\n',
      '{"layers":[{"label":"A","nodes":["x"]}]}',
      '\n',
      '``',
      '`',
      '\n',
    ]);
    const [art] = artifacts(evs);
    expect(art?.kind).toBe('diagram');
    expect((art as DiagramArtifact).layers).toEqual([
      { label: 'A', nodes: ['x'] },
    ]);
    expect(proseText(evs)).toBe(''); // nothing but the artifact
  });

  // Observed live: Gemini emits the whole fence on ONE line (```rc-diagram {json} ```)
  // rather than the multi-line block. The parser must accept that form too.
  it('parses a SINGLE-LINE diagram fence (the live model form)', () => {
    const evs = run([
      'The platform is layered [1].\n\n',
      '```rc-diagram {"title":"Platform","layers":[{"label":"Frontend","nodes":["React 19"]},{"label":"Backend","nodes":["Django"]}]} ```\n\n',
      'That maps it.',
    ]);
    const [art] = artifacts(evs);
    expect(art?.kind).toBe('diagram');
    expect((art as DiagramArtifact).title).toBe('Platform');
    expect((art as DiagramArtifact).layers.map((l) => l.label)).toEqual([
      'Frontend',
      'Backend',
    ]);
    // the raw fence text never leaked into prose
    expect(proseText(evs)).not.toContain('```');
    expect(proseText(evs)).toContain('That maps it.');
  });

  it('resolves a single-line fence with no trailing newline (flush)', () => {
    const evs = run([
      '```rc-diagram {"layers":[{"label":"A","nodes":["x"]}]} ```',
    ]);
    expect(artifacts(evs)[0]?.kind).toBe('diagram');
    expect(proseText(evs)).toBe('');
  });

  it('parses a single-line code fence', () => {
    const evs = run(['```python print(1) ```\n']);
    expect(artifacts(evs)[0]).toEqual<CodeArtifact>({
      kind: 'code',
      lang: 'python',
      code: 'print(1)',
    });
  });

  it('orders interleaved prose and artifacts by arrival', () => {
    const evs = run([
      'intro\n',
      '```rc-diagram\n{"layers":[{"label":"A","nodes":["x"]}]}\n```\n',
      'outro',
    ]);
    expect(evs.map((e) => e.type)).toEqual(['token', 'artifact', 'token']);
  });
});

describe('ArtifactStreamParser — code fences & fallback', () => {
  it('turns a generic fence into a CodeArtifact with its lang', () => {
    const evs = run(['```python\n', "print('hi')\n", '```\n']);
    const [art] = artifacts(evs);
    expect(art).toEqual<CodeArtifact>({
      kind: 'code',
      lang: 'python',
      code: "print('hi')",
    });
  });

  it('falls back to a code card when rc-diagram JSON is invalid (never dropped/broken)', () => {
    const evs = run(['```rc-diagram\n', '{not json', '\n', '```\n']);
    const [art] = artifacts(evs);
    expect(art.kind).toBe('code');
    expect((art as CodeArtifact).code).toBe('{not json');
    // the rc-diagram marker is NOT surfaced as a misleading code language
    expect((art as CodeArtifact).lang).toBeUndefined();
  });

  it('flushes an unterminated fence as literal text', () => {
    const evs = run(['```python\n', 'x = 1\n', 'y = 2']); // no closing ```
    expect(artifacts(evs)).toHaveLength(0);
    expect(proseText(evs)).toBe('```python\nx = 1\ny = 2');
  });
});

describe('buildArtifact — validation, caps, and untrusted strings as data', () => {
  it('clips layers, nodes, and string lengths', () => {
    const layers = Array.from({ length: 20 }, (_, i) => ({
      label: 'L'.repeat(200) + i,
      nodes: Array.from({ length: 30 }, (_, j) => 'n' + j),
    }));
    const d = buildArtifact(
      'rc-diagram',
      JSON.stringify({ layers })
    ) as DiagramArtifact;
    expect(d.kind).toBe('diagram');
    expect(d.layers.length).toBeLessThanOrEqual(8);
    expect(d.layers[0].nodes.length).toBeLessThanOrEqual(12);
    expect(d.layers[0].label.length).toBeLessThanOrEqual(60);
  });

  it('carries an attacker-controlled title verbatim as DATA (render-layer escapes it)', () => {
    const evil = '<script>alert(1)</script>';
    const d = buildArtifact(
      'rc-diagram',
      JSON.stringify({ title: evil, layers: [{ label: 'A', nodes: ['x'] }] })
    ) as DiagramArtifact;
    // The parser must NOT execute or strip — it carries the literal string; the
    // island renders it via textContent so it can never become live markup.
    expect(d.title).toBe(evil);
  });

  it('rejects a diagram with no usable layers (→ code card)', () => {
    const art = buildArtifact('rc-diagram', '{"layers":[]}');
    expect(art.kind).toBe('code');
  });
});

describe('parseArtifactStream — async wrapper', () => {
  it('mirrors the sync parser over an async delta source', async () => {
    async function* gen(): AsyncIterable<string> {
      yield 'a\n';
      yield '```rc-diagram\n{"layers":[{"label":"A","nodes":["x"]}]}\n```\n';
      yield 'b';
    }
    const evs: StreamEvent[] = [];
    for await (const e of parseArtifactStream(gen())) evs.push(e);
    expect(evs.map((e) => e.type)).toEqual(['token', 'artifact', 'token']);
    expect(proseText(evs)).toBe('a\nb');
  });
});

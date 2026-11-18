import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { clawd, frieze, projectScene, TEAM, who } from '@/office/draw';
import { officeStrings, SECTION_ORDER, SECTION_PATHS } from '@/office/strings';
import { mergeRows, plainParagraphs, shortDek } from '@/office/view';
import type { Row } from '@/office/view';
import { validateQueryRequest } from '@/lib/avatar/guard';
import { PERSONAS } from '@/lib/avatar/protocol';
import { buildSystemPrompt, PERSONA_VOICE } from '@/lib/avatar/synthesize';
import {
  DEFAULT_DAILY_BUDGET_USD,
  parseDailyBudgetUsd,
} from '@/lib/avatar/spend';

const PROJECTS_DIR = 'src/content/projects';

describe('office drawings', () => {
  it('draws the mascot on its own grid', () => {
    const svg = clawd();
    expect(svg).toContain('viewBox="-1 -5.2 18 16.4"');
    expect(svg).toContain('width="12" height="8"');
  });

  it('gives a tall frame to a bearded, hatted Clawd', () => {
    const svg = who('Glose');
    expect(svg).toContain('class="beard"');
    expect(svg).toContain('viewBox="-1 -6.8 18 24.8"');
  });

  it('refuses a name that is not on the team', () => {
    expect(() => who('Nobody')).toThrow(/unknown Clawd/);
  });

  it('names every member once', () => {
    const names = TEAM.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('links each room of the frieze to its section', () => {
    const svg = frieze(
      (['radar', 'blog', 'work', 'library', 'journal'] as const).map((key) => ({
        key,
        label: key,
        href: `/fr/${key}/`,
        say: '',
      })),
      'office'
    );
    for (const key of ['radar', 'blog', 'work', 'library', 'journal'])
      expect(svg).toContain(`href="/fr/${key}/"`);
  });

  it('has a scene of its own for every published project', () => {
    const fallback = projectScene('no-such-project', 'x');
    const keys = new Set<string>();
    for (const file of readdirSync(PROJECTS_DIR)) {
      const { data } = matter(readFileSync(`${PROJECTS_DIR}/${file}`, 'utf8'));
      if (data.publishState === 'published') keys.add(data.translationKey);
    }
    expect(keys.size).toBeGreaterThan(0);
    for (const key of keys)
      expect(projectScene(key, 'x'), key).not.toBe(fallback);
  });

  it('makes a standalone scene a complete image', () => {
    expect(projectScene('shallnot', 'shallnot', true)).toContain(
      'xmlns="http://www.w3.org/2000/svg"'
    );
  });
});

describe('office view models', () => {
  it('keeps a short summary as written, without citation marks', () => {
    expect(shortDek('A claim [s1]. Another [s12].')).toBe('A claim. Another.');
  });

  it('cuts a long summary at a sentence when one ends in range', () => {
    const text = `${'word '.repeat(20)}end. ${'more '.repeat(40)}`;
    expect(shortDek(text, 150)).toBe(`${'word '.repeat(20)}end.`);
  });

  it('never cuts a word in half', () => {
    const out = shortDek('alpha '.repeat(80), 100);
    expect(out.endsWith('…')).toBe(true);
    expect(
      out
        .slice(0, -1)
        .split(' ')
        .every((w) => w === 'alpha')
    ).toBe(true);
  });

  it('turns a Markdown body into plain paragraphs', () => {
    const body =
      '## Heading\n\nFirst **bold** [s1] and a [link](https://x.y).\n\n```js\ncode\n```\n\n> quote\n\nSecond.';
    expect(plainParagraphs(body)).toEqual([
      'First bold and a link.',
      'Second.',
    ]);
  });

  it('merges lists newest first', () => {
    const row = (date: string): Row => ({
      section: 'blog',
      href: '/',
      date,
      month: '',
      title: date,
      dek: '',
      kind: '',
      minutes: 1,
      sources: 0,
      tags: [],
    });
    expect(
      mergeRows(
        [row('01-02-2026')],
        [row('03-02-2026'), row('02-01-2026')]
      ).map((r) => r.date)
    ).toEqual(['03-02-2026', '01-02-2026', '02-01-2026']);
  });
});

describe('office copy', () => {
  it('has a path and a label for every section in both locales', () => {
    for (const lang of ['fr', 'en'] as const)
      for (const key of SECTION_ORDER) {
        expect(SECTION_PATHS[key]).toMatch(/\/$/);
        expect(officeStrings(lang).sections[key]).toBeTruthy();
      }
  });

  it('says tokens, in both locales, when the budget is spent', () => {
    for (const lang of ['fr', 'en'] as const) {
      const lines = officeStrings(lang).ask.outOfTokens;
      expect(lines).toHaveLength(3);
      expect(lines[0]).toMatch(/token/);
    }
  });
});

describe('agent persona and daily budget', () => {
  it('accepts a known persona and carries it through', () => {
    const v = validateQueryRequest({ query: 'hello', persona: 'writer' });
    expect(v.ok && v.persona).toBe('writer');
  });

  it('rejects an unknown persona', () => {
    const v = validateQueryRequest({ query: 'hello', persona: 'boss' });
    expect(v.ok).toBe(false);
  });

  it('gives every persona a voice', () => {
    for (const p of PERSONAS)
      expect(PERSONA_VOICE[p]).toMatch(/^You speak as /);
  });

  it('adds the voice without dropping the grounding rules', () => {
    const plain = buildSystemPrompt('fr');
    const voiced = buildSystemPrompt('fr', 'writer');
    expect(voiced).toContain('Plume');
    expect(voiced.startsWith(plain.slice(0, 200))).toBe(true);
    expect(plain).not.toContain('Plume');
  });

  it('caps a day at ten cents unless a valid override is given', () => {
    expect(DEFAULT_DAILY_BUDGET_USD).toBe(0.1);
    expect(parseDailyBudgetUsd(undefined)).toBe(0.1);
    expect(parseDailyBudgetUsd('0')).toBe(0.1);
    expect(parseDailyBudgetUsd('0.5')).toBe(0.5);
  });
});

describe('redirects', () => {
  it('never catches the address of a text or a project', () => {
    const sources = readFileSync('public/_redirects', 'utf8')
      .split('\n')
      .filter((line) => line.trim() && !line.endsWith(' 404'))
      .map((line) => line.split(/\s+/)[0]);
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources)
      expect(source, source).not.toMatch(/\/(blog|radar|journal|work)\//);
  });
});

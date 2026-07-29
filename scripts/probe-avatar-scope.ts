// Avatar SCOPED-gate probe — the acceptance test for the per-article "Ask the agent"
// button. Companion to scripts/calibrate-avatar-gate.ts, which is corpus-wide only.
//
//   pnpm probe:avatar                      # 8 articles per language against production
//   pnpm probe:avatar -- --all             # every published article (costs one LLM call each)
//   pnpm probe:avatar -- --lang=fr --sample=20
//   pnpm probe:avatar -- --base=http://localhost:8788
//
// WHY THIS EXISTS. The scoped path retrieves from ONE article's chunks, so its on-topic
// cosine floor sits BELOW the corpus-wide floor that calibrate-avatar-gate.ts measures —
// that script's recommendation is an UPPER BOUND (DEPLOY.md §3 4b). Anything that moves
// the band (a threshold change, a retrieval change, a corpus that grew) can push scoped
// on-article questions under the gate, and the symptom is silent: the button answers
// "I don't know" on an article whose own content would have answered it.
//
// It replays the REAL seeded question the button sends — ARTICLE_DETAIL[lang].askSeed with
// {title} filled from the article's own title — scoped to that article, and reads the live
// `done` / `idk` SSE frame. It must mirror BOTH halves of what the page does (see
// seedQuestion): reading the template from source is not enough on its own.
//
// LOCAL DIAGNOSTIC — deliberately NOT wired into CI. It talks to the live deployment and
// spends a real LLM completion per grounded probe, so it belongs in a human's hands, run
// after a threshold, retrieval, or seed change. Think hard before making it a gate: a red
// check that is not a real defect, sitting in front of `deploy`, is exactly what froze this
// site for six days in July.
//
// Reading the output: `refused` is the count that matters. The BAND (lowest grounded score
// vs highest refused score) tells you WHICH layer is at fault — a refusal at
// `topSimilarity` 0 means retrieval never saw the article's chunks (a scoping/pre-filter
// bug); a refusal just under the threshold means the query is weak or the gate is, and the
// two are told apart by re-asking the same article a question drawn from its own title.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTICLE_DETAIL } from '../src/i18n/ui';
import type { Locale } from '../src/i18n/index';

const __filename = fileURLToPath(import.meta.url);

const DEFAULT_BASE = 'https://rachid-chabane.com';
const DEFAULT_SAMPLE = 8;
const ENDPOINT_PATH = '/api/avatar/query';
const SEED_PLACEHOLDER = '{title}';
const LOCALES: readonly Locale[] = ['fr', 'en'];

interface CliArgs {
  base: string;
  sample: number;
  all: boolean;
  langs: Locale[];
  json: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    base: process.env.SITE_URL ?? DEFAULT_BASE,
    sample: DEFAULT_SAMPLE,
    all: false,
    langs: [...LOCALES],
    json: false,
  };
  for (const arg of argv) {
    if (arg.startsWith('--base=')) args.base = arg.slice(7).replace(/\/$/, '');
    else if (arg.startsWith('--sample=')) args.sample = Number(arg.slice(9));
    else if (arg === '--all') args.all = true;
    else if (arg === '--json') args.json = true;
    else if (arg.startsWith('--lang=')) {
      const v = arg.slice(7);
      if (v === 'both') args.langs = [...LOCALES];
      else if (v === 'fr' || v === 'en') args.langs = [v];
      else throw new Error(`Unknown --lang=${v} (expected fr, en or both).`);
    } else throw new Error(`Unknown flag ${arg}`);
  }
  if (!Number.isInteger(args.sample) || args.sample < 1) {
    throw new Error(
      `--sample must be a positive integer (got ${args.sample}).`
    );
  }
  return args;
}

interface Article {
  slug: string;
  lang: Locale;
  title: string;
}

/** Strip YAML's surrounding quotes and unescape a doubled inner quote. */
function unquote(value: string): string {
  const q = value[0];
  if ((q !== "'" && q !== '"') || value.at(-1) !== q) return value;
  return value.slice(1, -1).replaceAll(q + q, q);
}

/** Minimal frontmatter read — no gray-matter, so the probe stays dependency-light. */
function parseArticle(raw: string): Omit<Article, 'lang'> | null {
  const fm = /^---\n([\s\S]*?)\n---/.exec(raw)?.[1];
  if (!fm) return null;
  if (!/^publishState:\s*published\s*$/m.test(fm)) return null;
  const slug = /^slug:\s*(.+)$/m.exec(fm)?.[1].trim();
  const title = /^title:\s*(.+)$/m.exec(fm)?.[1].trim();
  return slug && title ? { slug, title: unquote(title) } : null;
}

function loadArticles(repoRoot: string, lang: Locale): Article[] {
  const dir = join(repoRoot, 'src/content/articles');
  return readdirSync(dir)
    .filter((f) => f.endsWith(`.${lang}.md`))
    .sort() // deterministic order -> a deterministic sample
    .map((f) => parseArticle(readFileSync(join(dir, f), 'utf8')))
    .filter((a): a is Omit<Article, 'lang'> => a !== null)
    .map((a) => ({ ...a, lang }));
}

/**
 * The exact string [lang]/blog/[slug].astro puts in data-avatar-seed.
 *
 * Both halves must track that page: the TEMPLATE comes from ARTICLE_DETAIL, and the
 * SUBSTITUTION must use the same field the page uses. Reading only the template is not
 * enough — when the seed moved from {topic} to {title}, a probe that still substituted
 * {topic} sent the literal placeholder and reported a 100% refusal rate against a
 * perfectly healthy site. If this assertion trips, the page changed and this did not.
 */
function seedQuestion(article: Article): string {
  const template = ARTICLE_DETAIL[article.lang].askSeed;
  if (!template.includes(SEED_PLACEHOLDER)) {
    throw new Error(
      `askSeed no longer contains ${SEED_PLACEHOLDER} (got: ${template}). ` +
        'Update seedQuestion() to match [lang]/blog/[slug].astro.'
    );
  }
  return template.replace(SEED_PLACEHOLDER, article.title);
}

/**
 * Evenly spread `count` picks across the list rather than taking a prefix — a prefix is
 * alphabetical, which correlates with topic, and would hide a failure clustered in the
 * tail. No RNG: the same corpus always yields the same sample, so runs are comparable.
 */
function spread<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

interface ProbeResult {
  slug: string;
  lang: Locale;
  query: string;
  grounded: boolean;
  topSimilarity: number | null;
  threshold: number | null;
  error?: string;
}

async function probe(
  article: Article,
  query: string,
  base: string
): Promise<ProbeResult> {
  const common = { slug: article.slug, lang: article.lang, query };
  try {
    const res = await fetch(`${base}${ENDPOINT_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        lang: article.lang,
        scopeSlug: article.slug,
      }),
    });
    if (!res.ok) {
      return {
        ...common,
        grounded: false,
        topSimilarity: null,
        threshold: null,
        error: `HTTP ${res.status}`,
      };
    }
    const body = await res.text();
    // Both branches end in a `done` frame carrying the live gate numbers; `idk` is only
    // emitted on refusal, so it is the authoritative outcome signal.
    const done = /event: done\ndata: (.+)/.exec(body)?.[1];
    const frame = done
      ? (JSON.parse(done) as { topSimilarity?: number; threshold?: number })
      : {};
    return {
      ...common,
      grounded: !body.includes('event: idk'),
      topSimilarity: frame.topSimilarity ?? null,
      threshold: frame.threshold ?? null,
    };
  } catch (err) {
    return {
      ...common,
      grounded: false,
      topSimilarity: null,
      threshold: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function report(results: ProbeResult[], json: boolean): void {
  const refused = results.filter((r) => !r.grounded);
  if (json) {
    console.log(
      JSON.stringify(
        { total: results.length, refused: refused.length, results },
        null,
        2
      )
    );
  } else {
    for (const r of results) {
      const score =
        r.topSimilarity === null ? 'n/a' : r.topSimilarity.toFixed(4);
      const verdict = r.error
        ? `ERROR ${r.error}`
        : r.grounded
          ? 'grounded'
          : 'REFUSED';
      console.log(
        `  ${verdict.padEnd(10)} ${r.lang}  top=${score.padEnd(8)} ${r.slug}`
      );
    }
    const scored = results.filter((r) => r.topSimilarity !== null);
    const groundedFloor = Math.min(
      ...scored.filter((r) => r.grounded).map((r) => r.topSimilarity as number)
    );
    const refusedCeiling = Math.max(
      ...scored.filter((r) => !r.grounded).map((r) => r.topSimilarity as number)
    );
    const threshold = results.find((r) => r.threshold !== null)?.threshold;
    console.log(
      `\nrefused ${refused.length}/${results.length}` +
        (threshold === undefined ? '' : `  (live threshold ${threshold})`)
    );
    if (scored.some((r) => r.grounded)) {
      console.log(`  scoped on-article floor : ${groundedFloor.toFixed(4)}`);
    }
    if (refused.length > 0 && scored.some((r) => !r.grounded)) {
      console.log(`  highest refused score   : ${refusedCeiling.toFixed(4)}`);
    }
  }

  if (refused.length > 0) {
    console.error(
      `\nFAIL: ${refused.length} article(s) refused a question built from their own title.\n` +
        "  topSimilarity 0      -> retrieval never saw the article's chunks (a scoping bug).\n" +
        '  just under threshold -> re-ask that article something drawn from its body. If THAT\n' +
        '                          grounds, the article is thin (a bootstrap stub with little\n' +
        '                          prose has nothing to match); if it also refuses, the gate is\n' +
        '                          too high — re-calibrate against the SCOPED floor, never the\n' +
        '                          corpus-wide one.'
    );
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
  const targets = args.langs.flatMap((lang) => {
    const articles = loadArticles(repoRoot, lang);
    return (args.all ? articles : spread(articles, args.sample)).map(
      (article) => ({ article, query: seedQuestion(article) })
    );
  });

  console.log(
    `probing ${targets.length} scoped article question(s) against ${args.base}\n`
  );
  // Serial on purpose: each grounded probe costs one real LLM completion, and a burst
  // against the live Worker is not what this is measuring.
  const results: ProbeResult[] = [];
  for (const { article, query } of targets) {
    results.push(await probe(article, query, args.base));
  }

  report(results, args.json);
  if (results.some((r) => !r.grounded)) process.exitCode = 1;
}

if (__filename === process.argv[1]) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}

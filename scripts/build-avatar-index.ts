// Deploy-time CLI for the avatar index artifact (task 18). Thin imperative
// shell around the tested `loadPublishedSources` + `buildIndex` library; this
// I/O layer may use Date (the tested path stays Date-free). RELATIVE imports
// (tsx ignores the `@/` alias), mirroring scripts/gen-portfolio.ts.
//
//   pnpm build:index                      # real embedder (default) — throws
//                                          # until OQ-5 resolves (post-secret)
//   pnpm build:index --embedder=fake      # NON-PRODUCTION monolingual index
//   pnpm build:index --out=path.json      # custom output path
//
// The owner/deploy runs `pnpm build:index` (real embedder) BEFORE `pnpm build`.
// Wiring WHEN it runs in CI/Cloudflare is out of scope here (documented intent).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex, loadPublishedSources } from '../src/lib/avatar/index-build';
import { FakeEmbedder } from '../src/lib/avatar/fakes';
import type { Embedder, IndexArtifact } from '../src/lib/avatar/contracts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CliArgs {
  embedderKind: string;
  out: string;
}

function parseArgs(argv: string[]): CliArgs {
  let embedderKind = 'real'; // real by default — a fake index must NEVER ship.
  let out = join(__dirname, '../public/avatar-index.json');
  for (const arg of argv) {
    if (arg.startsWith('--embedder=')) embedderKind = arg.slice(11);
    else if (arg.startsWith('--out=')) out = arg.slice(6);
  }
  return { embedderKind, out };
}

/**
 * The real multilingual embedder is OQ-5, still pending — throws with the SAME
 * message shape as functions/api/avatar/query.ts#createEmbedder. The real impl
 * (reading EMBEDDINGS_API_KEY) lands as the post-secret step.
 */
function createRealEmbedder(env: NodeJS.ProcessEnv): Embedder {
  const hasKey = Boolean(env.EMBEDDINGS_API_KEY);
  throw new Error(
    `Avatar embedder not configured (OQ-5 pending — see docs/persona.md; ` +
      `EMBEDDINGS_API_KEY ${hasKey ? 'present, embedder not wired yet' : 'absent'}).`
  );
}

function createEmbedder(kind: string): Embedder {
  if (kind === 'fake') {
    console.warn(
      'WARNING: BUILDING NON-PRODUCTION FAKE AVATAR INDEX — monolingual, do not deploy.'
    );
    return new FakeEmbedder();
  }
  if (kind === 'real') return createRealEmbedder(process.env);
  throw new Error(`Unknown --embedder=${kind} (expected "real" or "fake").`);
}

/** Load a prior artifact for incremental reuse; a parse failure → full rebuild. */
function loadPrior(outPath: string): IndexArtifact | null {
  if (!existsSync(outPath)) return null;
  try {
    return JSON.parse(readFileSync(outPath, 'utf8')) as IndexArtifact;
  } catch {
    console.warn(
      `Could not parse prior artifact at ${outPath}; doing a full rebuild.`
    );
    return null;
  }
}

async function main(): Promise<void> {
  const { embedderKind, out } = parseArgs(process.argv.slice(2));
  const embedder = createEmbedder(embedderKind);
  const prior = loadPrior(out);
  const sources = loadPublishedSources();

  const { artifact, stats } = await buildIndex({
    sources,
    embedder,
    prior,
    generatedAt: new Date().toISOString(),
  });

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(artifact)); // minified — embeddings are large

  console.log(
    `avatar-index: embedded ${stats.embeddedSlugs.length} slug(s), ` +
      `reused ${stats.reusedSlugs.length}, dropped ${stats.droppedSlugs.length}; ` +
      `${stats.totalChunks} chunks (${artifact.dimensions}-d, model ${artifact.embeddingModel}) -> ${out}`
  );
}

if (__filename === process.argv[1]) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}

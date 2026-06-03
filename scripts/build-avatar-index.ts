// Deploy-time CLI for the avatar index artifact (task 18). Thin imperative
// shell around the tested `loadPublishedSources` + `buildIndex` library; this
// I/O layer may use Date (the tested path stays Date-free). RELATIVE imports
// (tsx ignores the `@/` alias), mirroring scripts/gen-portfolio.ts.
//
//   pnpm build:index                      # real embedder (default) — Workers AI
//                                          # bge-m3 (needs EMBEDDINGS_API_KEY +
//                                          # CLOUDFLARE_ACCOUNT_ID; see DEPLOY.md §5)
//   pnpm build:index --embedder=fake      # NON-PRODUCTION monolingual index
//   pnpm build:index --out=path.json      # custom output path
//
// The owner/deploy runs `pnpm build:index` (real embedder) BEFORE `pnpm build`.
// Wiring WHEN it runs in CI/Cloudflare is out of scope here (documented intent).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildIndex,
  loadPublishedSources,
} from '../src/lib/avatar/index-build';
import { FakeEmbedder } from '../src/lib/avatar/fakes';
import { createWorkersAiRestEmbedder } from '../src/lib/avatar/embedder';
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
 * The real multilingual embedder: Cloudflare Workers AI `@cf/baai/bge-m3` over the
 * REST API. `createWorkersAiRestEmbedder` reads EMBEDDINGS_API_KEY (the CF token) +
 * CLOUDFLARE_ACCOUNT_ID and throws `EmbedderNotConfigured` (fail-loud) when absent —
 * so an unconfigured `pnpm build:index` fails clearly instead of silent-faking.
 */
function createRealEmbedder(env: Record<string, string | undefined>): Embedder {
  return createWorkersAiRestEmbedder(env);
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

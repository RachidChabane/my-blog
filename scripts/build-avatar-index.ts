// Deploy-time CLI: build the avatar index and (--push) populate Cloudflare Vectorize
// + D1 (M-2/M-4). Thin imperative shell around the tested `buildIndex` + `index-sink`
// libraries. RELATIVE imports (tsx ignores the `@/` alias), mirroring gen-portfolio.ts.
//
//   pnpm build:index --push                 # real embedder (Workers AI bge-m3) -> upsert
//                                            # Vectorize + execute D1 (needs CF creds +
//                                            # the index/DB from scripts/cf-provision.sh)
//   pnpm build:index                        # dry run: write vectors.ndjson + index.sql only
//   pnpm build:index --embedder=fake        # NON-PRODUCTION monolingual vectors
//   pnpm build:index --out-dir=path         # where to write the sink artifacts
//
// Full rebuild + full replace every run: the corpus is small (one article/day) and
// bge-m3 re-embedding is ~$0, so there is no incremental prior. The daily refresh runs
// `build:index --push` (see .github/workflows/reindex.yml).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  buildIndex,
  loadPublishedSources,
} from '../src/lib/avatar/index-build';
import { toVectorizeNdjson, toD1Sql } from '../src/lib/avatar/index-sink';
import { FakeEmbedder } from '../src/lib/avatar/fakes';
import { createWorkersAiRestEmbedder } from '../src/lib/avatar/embedder';
import type { Embedder } from '../src/lib/avatar/contracts';

const __filename = fileURLToPath(import.meta.url);

interface CliArgs {
  embedderKind: string;
  outDir: string;
  push: boolean;
  indexName: string;
  dbName: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    embedderKind: 'real', // real by default — a fake index must NEVER ship.
    outDir: join(process.cwd(), '.avatar-index'),
    push: false,
    indexName: 'my-blog-avatar', // matches wrangler.toml + cf-provision.sh
    dbName: 'my-blog-avatar',
  };
  for (const arg of argv) {
    if (arg.startsWith('--embedder=')) args.embedderKind = arg.slice(11);
    else if (arg.startsWith('--out-dir=')) args.outDir = arg.slice(10);
    else if (arg === '--push') args.push = true;
    else if (arg.startsWith('--index=')) args.indexName = arg.slice(8);
    else if (arg.startsWith('--db=')) args.dbName = arg.slice(5);
  }
  return args;
}

/**
 * The real multilingual embedder: Cloudflare Workers AI `@cf/baai/bge-m3` (REST).
 * Reads EMBEDDINGS_API_KEY (the CF token) + CLOUDFLARE_ACCOUNT_ID; throws
 * `EmbedderNotConfigured` (fail-loud) when absent — never silent-fakes.
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

/**
 * UNTESTED-UNTIL-BRING-UP: the live wrangler shell-out. Upserts the vectors into
 * Vectorize and runs the full-replace SQL on the REMOTE D1. Needs
 * CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID and the index/DB created by
 * scripts/cf-provision.sh. `--remote --yes` so D1 runs non-interactively.
 */
function pushIndex(ndjsonPath: string, sqlPath: string, args: CliArgs): void {
  console.log(`==> wrangler vectorize upsert ${args.indexName}`);
  execFileSync(
    'npx',
    ['wrangler', 'vectorize', 'upsert', args.indexName, '--file', ndjsonPath],
    { stdio: 'inherit' }
  );
  console.log(`==> wrangler d1 execute ${args.dbName} (remote)`);
  execFileSync(
    'npx',
    [
      'wrangler',
      'd1',
      'execute',
      args.dbName,
      '--remote',
      '--file',
      sqlPath,
      '--yes',
    ],
    { stdio: 'inherit' }
  );
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const embedder = createEmbedder(args.embedderKind);
  const sources = loadPublishedSources();

  const { artifact, stats } = await buildIndex({
    sources,
    embedder,
    prior: null, // full rebuild every run (small corpus; bge-m3 ~$0)
    generatedAt: new Date().toISOString(),
  });

  mkdirSync(args.outDir, { recursive: true });
  const ndjsonPath = join(args.outDir, 'vectors.ndjson');
  const sqlPath = join(args.outDir, 'index.sql');
  writeFileSync(ndjsonPath, toVectorizeNdjson(artifact));
  writeFileSync(sqlPath, toD1Sql(artifact));

  console.log(
    `avatar-index: ${stats.totalChunks} chunks (${artifact.dimensions}-d, ` +
      `model ${artifact.embeddingModel}) -> ${ndjsonPath} + ${sqlPath}`
  );

  if (args.push) pushIndex(ndjsonPath, sqlPath, args);
  else
    console.log(
      '  (dry run — pass --push to upsert Vectorize + execute D1 via wrangler)'
    );
}

if (__filename === process.argv[1]) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}

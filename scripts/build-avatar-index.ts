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
// `build:index --push` (see .github/workflows/reindex.yml). On --push, after the
// Vectorize upsert + D1 full-replace, any vector for a slug that was removed since the
// last run is purged from Vectorize (UPSERT never deletes; D1 is full-replaced and so
// is already clean) — otherwise a pruned article leaves orphan vectors the avatar
// could cite at a now-404 URL. The purge is fail-open: a deploy never breaks on it.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  buildIndex,
  loadPublishedSources,
} from '../src/lib/avatar/index-build';
import {
  toVectorizeNdjson,
  toD1Sql,
  computeOrphanIds,
} from '../src/lib/avatar/index-sink';
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
 * Read the live D1 chunk ids (== the live Vectorize id set: both are written from the
 * same artifact each run) so removed slugs can be purged from Vectorize. FAIL-OPEN:
 * any failure (D1 unavailable, an unexpected `--json` shape) returns [] and logs a
 * warning, so the orphan purge is skipped rather than wedging the deploy. Captures
 * stdout (not `inherit`) to parse the `--json` result.
 */
function fetchPriorChunkIds(args: CliArgs): string[] {
  try {
    const out = execFileSync(
      'npx',
      [
        'wrangler',
        'd1',
        'execute',
        args.dbName,
        '--remote',
        '--json',
        '--command',
        'SELECT id FROM chunks',
      ],
      { encoding: 'utf8' }
    );
    const parsed = JSON.parse(out) as Array<{
      results?: Array<{ id?: unknown }>;
    }>;
    return parsed
      .flatMap((r) => r.results ?? [])
      .map((row) => row.id)
      .filter((id): id is string => typeof id === 'string');
  } catch (err) {
    console.warn(
      '  WARN: could not read prior D1 chunk ids; skipping Vectorize orphan ' +
        `purge (${err instanceof Error ? err.message : String(err)})`
    );
    return [];
  }
}

/**
 * Delete orphaned Vectorize vectors (removed slugs' dense vectors that UPSERT leaves
 * behind). Batched (wrangler caps the `--ids` list) and FAIL-OPEN: a failure leaves
 * the orphans for the next clean reindex rather than breaking the deploy. No metadata
 * indexes exist, so delete-by-id is clean (no recreate).
 */
function deleteVectorizeOrphans(orphanIds: string[], args: CliArgs): void {
  if (orphanIds.length === 0) {
    console.log('==> no Vectorize orphans to purge');
    return;
  }
  console.log(
    `==> wrangler vectorize delete-vectors ${args.indexName} ` +
      `(${orphanIds.length} orphan${orphanIds.length === 1 ? '' : 's'})`
  );
  const BATCH = 100;
  try {
    for (let i = 0; i < orphanIds.length; i += BATCH) {
      execFileSync(
        'npx',
        [
          'wrangler',
          'vectorize',
          'delete-vectors',
          args.indexName,
          '--ids',
          ...orphanIds.slice(i, i + BATCH),
        ],
        { stdio: 'inherit' }
      );
    }
  } catch (err) {
    console.warn(
      '  WARN: Vectorize orphan delete failed; orphans remain until the next ' +
        `clean reindex (${err instanceof Error ? err.message : String(err)})`
    );
  }
}

/**
 * UNTESTED-UNTIL-BRING-UP: the live wrangler shell-out. Reads the prior D1 ids,
 * upserts the current vectors into Vectorize, runs the full-replace SQL on the REMOTE
 * D1, then purges Vectorize orphans (vectors for slugs removed since the last run).
 * Needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID and the index/DB created by
 * scripts/cf-provision.sh. `--remote --yes` so D1 runs non-interactively. The
 * orphan-purge steps are fail-open: a deploy never breaks because cleanup failed.
 */
function pushIndex(
  ndjsonPath: string,
  sqlPath: string,
  currentIds: readonly string[],
  args: CliArgs
): void {
  // Read prior ids BEFORE the full-replace wipes D1 (so we can diff for orphans).
  const priorIds = fetchPriorChunkIds(args);

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
  // D1 is now the current set; prune Vectorize down to it (fail-open).
  deleteVectorizeOrphans(computeOrphanIds(priorIds, currentIds), args);
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

  if (args.push)
    pushIndex(
      ndjsonPath,
      sqlPath,
      artifact.chunks.map((c) => c.id),
      args
    );
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

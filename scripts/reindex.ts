// SUPERSEDED by `pnpm build:index --push` (Vectorize + D1 migration): the live
// avatar store is Cloudflare Vectorize + D1, not the public/avatar-index.json this
// writes, so the daily refresh (reindex.yml) now runs `build:index --push` (full
// rebuild). This CLI + the tested `reindex()` incremental-reuse lib are retained for
// reference / the incremental cost-optimization follow-up; they are NOT in the deploy
// path. Do not wire this into deploy.
//
// Deploy-time CLI for incremental + full avatar reindex (task 21, FR-E3). Thin
// imperative shell around the tested `reindex` wrapper (which delegates to the
// task-18 `buildIndex` core); this I/O layer may use Date. RELATIVE imports (tsx
// ignores the `@/` alias), mirroring scripts/build-avatar-index.ts.
//
//   pnpm reindex                              # incremental, real embedder (Workers AI bge-m3)
//   pnpm reindex --mode=full                  # full re-embed (nightly safety net)
//   pnpm reindex --event=push                 # mode from the GH trigger (selectMode)
//   pnpm reindex --embedder=fake              # NON-PRODUCTION monolingual index
//   pnpm reindex --prior=public/avatar-index.json   # local prior (dev)
//   pnpm reindex --prior=https://site/avatar-index.json --out=path.json
//
// Incremental fetches the LIVE deployed artifact as prior by default
// (${SITE_URL}/avatar-index.json) so a stateless CI job is truly incremental;
// a 404/parse-fail falls back to a full build. Full ignores any prior.

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  appendFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPublishedSources } from '../src/lib/avatar/index-build';
import { reindex, selectMode } from '../src/lib/avatar/reindex';
import type { ReindexMode } from '../src/lib/avatar/reindex';
import { FakeEmbedder } from '../src/lib/avatar/fakes';
import { createWorkersAiRestEmbedder } from '../src/lib/avatar/embedder';
import type { Embedder, IndexArtifact } from '../src/lib/avatar/contracts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_SITE_URL = 'https://rachid-chabane.com'; // mirror astro.config / index-build

interface CliArgs {
  mode?: ReindexMode; // explicit override (dispatch / local)
  event?: string; // github.event_name → selectMode
  embedderKind: string; // 'real' (default) | 'fake'
  out: string;
  prior?: string; // path or http(s) URL; default computed for incremental
  siteUrl: string;
}

function parseArgs(argv: string[]): CliArgs {
  let mode: ReindexMode | undefined;
  let event: string | undefined;
  let embedderKind = 'real'; // real by default — a fake index must NEVER ship.
  let out = join(__dirname, '../public/avatar-index.json');
  let prior: string | undefined;
  let siteUrl: string | undefined;

  for (const arg of argv) {
    if (arg.startsWith('--mode=')) {
      const m = arg.slice(7);
      if (m !== 'incremental' && m !== 'full') {
        throw new Error(
          `Unknown --mode=${m} (expected "incremental" or "full").`
        );
      }
      mode = m;
    } else if (arg.startsWith('--event=')) event = arg.slice(8);
    else if (arg.startsWith('--embedder=')) embedderKind = arg.slice(11);
    else if (arg.startsWith('--out=')) out = arg.slice(6);
    else if (arg.startsWith('--prior=')) prior = arg.slice(8);
    else if (arg.startsWith('--site=')) siteUrl = arg.slice(7);
  }

  return {
    mode,
    event,
    embedderKind,
    out,
    prior,
    siteUrl: siteUrl ?? process.env.SITE_URL ?? DEFAULT_SITE_URL,
  };
}

/**
 * The real multilingual embedder: Cloudflare Workers AI `@cf/baai/bge-m3` (REST),
 * shared with scripts/build-avatar-index.ts. Reads EMBEDDINGS_API_KEY (the CF token)
 * + CLOUDFLARE_ACCOUNT_ID; throws `EmbedderNotConfigured` (fail-loud) when absent.
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

/** Load a prior from a local PATH or an http(s) URL. Any failure → null → full build. */
async function loadPrior(spec: string): Promise<IndexArtifact | null> {
  try {
    if (/^https?:\/\//.test(spec)) {
      const res = await fetch(spec); // Node 20+ global fetch; public asset, no secret
      if (!res.ok) return null;
      return (await res.json()) as IndexArtifact;
    }
    if (!existsSync(spec)) return null;
    return JSON.parse(readFileSync(spec, 'utf8')) as IndexArtifact;
  } catch {
    return null; // 404 / network / parse → caller does a full build (logged)
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const mode = selectMode(args.event, args.mode);
  const embedder = createEmbedder(args.embedderKind);

  const priorSpec = args.prior ?? `${args.siteUrl}/avatar-index.json`;
  const prior = mode === 'full' ? null : await loadPrior(priorSpec);
  if (mode === 'incremental' && !prior) {
    console.warn(
      `reindex: no usable prior at ${priorSpec} — doing a full rebuild.`
    );
  }

  const sources = loadPublishedSources({ siteUrl: args.siteUrl });
  const { artifact, report } = await reindex({
    mode,
    sources,
    prior,
    embedder,
    generatedAt: new Date().toISOString(),
  });

  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, JSON.stringify(artifact)); // minified

  console.log(
    `avatar-reindex [${report.mode}]: changed ${report.changedSlugs.length}, ` +
      `reused ${report.reusedSlugs.length}, removed ${report.removedSlugs.length}; ` +
      `${report.totalChunks} chunks -> ${args.out} (changed=${report.changed})`
  );

  // Expose the no-op flag to the workflow (reserved for an optional deploy-skip).
  // No-op locally (GITHUB_OUTPUT unset).
  if (process.env.GITHUB_OUTPUT) {
    try {
      appendFileSync(process.env.GITHUB_OUTPUT, `changed=${report.changed}\n`);
    } catch {
      /* ignore */
    }
  }
}

if (__filename === process.argv[1]) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  });
}

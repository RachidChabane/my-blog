// Server-only: do not import in client-side islands.
//
// Reindex orchestration (task 21, FR-E3). A thin, mode-aware wrapper over the
// task-18 incremental core (buildIndex): `incremental` reuses a prior (re-embed
// only changed slugs, drop stale); `full` IGNORES any prior and re-embeds the
// whole current corpus — the nightly safety net that trusts nothing. No new index
// logic lives here; the algorithm is buildIndex. Pure + Date-free (the script
// injects generatedAt and does all I/O).

import { buildIndex } from './index-build';
import type { SourceDoc } from './index-build';
import type { Embedder, IndexArtifact } from './contracts';

export type ReindexMode = 'incremental' | 'full';

export interface ReindexInput {
  mode: ReindexMode;
  sources: SourceDoc[];
  /** Prior artifact for reuse. IGNORED when mode === 'full'. */
  prior?: IndexArtifact | null;
  embedder: Embedder;
  /** Injected ISO string (script: new Date().toISOString(); tests: a literal). */
  generatedAt: string;
}

/** FR-E3 vocabulary view over BuildStats — what the workflow logs / skips on. */
export interface ReindexReport {
  mode: ReindexMode;
  /** Slugs (re-)embedded this run = new or content-changed. (= stats.embeddedSlugs) */
  changedSlugs: string[];
  /** Slugs whose chunks were reused verbatim, no re-embed. (= stats.reusedSlugs) */
  reusedSlugs: string[];
  /** Stale slugs present in prior but absent now → their chunks removed. (= stats.droppedSlugs) */
  removedSlugs: string[];
  embeddedChunks: number;
  totalChunks: number;
  /** True iff the artifact differs from the prior (something embedded or removed).
   *  Incremental no-op → false (the workflow may skip the deploy). Full → always
   *  true when the corpus is non-empty (it re-embeds everything by definition). */
  changed: boolean;
}

export interface ReindexResult {
  artifact: IndexArtifact;
  report: ReindexReport;
}

/**
 * Reindex the avatar artifact. `incremental` passes the prior to buildIndex (reuse
 * unchanged, re-embed changed, drop stale). `full` discards the prior entirely so a
 * missed/stale/corrupt artifact cannot poison the result — the nightly safety net.
 */
export async function reindex(input: ReindexInput): Promise<ReindexResult> {
  const prior = input.mode === 'full' ? null : (input.prior ?? null);
  const { artifact, stats } = await buildIndex({
    sources: input.sources,
    embedder: input.embedder,
    prior,
    generatedAt: input.generatedAt,
  });
  const report: ReindexReport = {
    mode: input.mode,
    changedSlugs: stats.embeddedSlugs,
    reusedSlugs: stats.reusedSlugs,
    removedSlugs: stats.droppedSlugs,
    embeddedChunks: stats.embeddedChunks,
    totalChunks: stats.totalChunks,
    changed: stats.embeddedSlugs.length > 0 || stats.droppedSlugs.length > 0,
  };
  return { artifact, report };
}

/**
 * Map a GitHub Actions trigger to a reindex mode (the tested mode POLICY, so the
 * workflow YAML stays dumb). An explicit dispatch input always wins; otherwise the
 * nightly `schedule` is full and everything else (push, manual w/o mode) is incremental.
 */
export function selectMode(
  eventName: string | undefined,
  dispatchMode?: string
): ReindexMode {
  if (dispatchMode === 'full' || dispatchMode === 'incremental')
    return dispatchMode;
  return eventName === 'schedule' ? 'full' : 'incremental';
}

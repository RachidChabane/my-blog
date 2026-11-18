// Server-only: do not import in client-side islands.
// Daily spend guardrail for the avatar's OpenRouter usage. The ledger is a
// port (repository pattern); D1SpendLedger is the production adapter over the
// existing DB binding (table `avatar_spend`, see scripts/avatar-d1-schema.sql).
// The endpoint checks the current day's total BEFORE any LLM call and records
// each completed request's cost AFTER the stream ends. When the budget is spent
// the endpoint answers "temporarily unavailable" with a comeback date (the next
// day, UTC) and never discloses the budget as the reason.

import type { D1Database } from './cf';

/** Hard daily ceiling on avatar LLM spend (USD) unless overridden via env. */
export const DEFAULT_DAILY_BUDGET_USD = 0.1;

/**
 * Conservative per-request estimate used when the backend reports no usage
 * (e.g. a mid-stream failure). Erring high keeps the guardrail honest: an
 * unaccounted request must never let the day run past the budget.
 */
export const FALLBACK_REQUEST_COST_USD = 0.001;

/** Ledger port: daily spend totals keyed by 'YYYY-MM-DD' (UTC). */
export interface SpendLedger {
  getSpentUsd(day: string): Promise<number>;
  addSpentUsd(day: string, usd: number): Promise<void>;
}

/** Spend-guard configuration injected into the endpoint deps. */
export interface SpendGuardOptions {
  ledger: SpendLedger;
  budgetUsd: number;
  /** Injectable clock for tests (defaults to `() => new Date()`). */
  now?: () => Date;
}

/** UTC day key for a ledger row: '2026-07-14'. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** ISO date (UTC) of the next day: when the ledger rolls over. */
export function nextDayStart(date: Date): string {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  );
  return next.toISOString().slice(0, 10);
}

/**
 * Parse the optional AVATAR_DAILY_BUDGET_USD override. Same floor rationale as
 * parseThreshold: a non-finite or non-positive value would disable the agent
 * permanently (budget 0 is always "spent"), so such values fall back to the
 * default instead of being honored.
 */
export function parseDailyBudgetUsd(raw: string | undefined): number {
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_BUDGET_USD;
}

/**
 * D1 adapter over the `avatar_spend` table. The increment is a single atomic
 * upsert (`ON CONFLICT ... spent_usd + excluded.spent_usd`), so concurrent
 * streams cannot lose updates; slight overshoot within one in-flight request
 * is acceptable for a soft daily ceiling.
 */
/** The `month` column of `avatar_spend` holds the ledger key, a UTC day. */
export class D1SpendLedger implements SpendLedger {
  constructor(private readonly db: D1Database) {}

  async getSpentUsd(day: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT spent_usd FROM avatar_spend WHERE month = ?1')
      .bind(day)
      .first<number>('spent_usd');
    return typeof row === 'number' ? row : 0;
  }

  async addSpentUsd(day: string, usd: number): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO avatar_spend (month, spent_usd, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(month) DO UPDATE SET
           spent_usd = spent_usd + excluded.spent_usd,
           updated_at = excluded.updated_at`
      )
      .bind(day, usd, new Date().toISOString())
      .run();
  }
}

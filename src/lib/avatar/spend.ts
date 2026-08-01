// Server-only: do not import in client-side islands.
// Monthly spend guardrail for the avatar's OpenRouter usage. The ledger is a
// port (repository pattern); D1SpendLedger is the production adapter over the
// existing DB binding (table `avatar_spend`, see scripts/avatar-d1-schema.sql).
// The endpoint checks the current month's total BEFORE any LLM call and records
// each completed request's cost AFTER the stream ends. When the budget is spent
// the endpoint answers "temporarily unavailable" with a comeback date (the 1st
// of the next month, UTC) and never discloses the budget as the reason.

import type { D1Database } from './cf';

/** Hard monthly ceiling on avatar LLM spend (USD) unless overridden via env. */
export const DEFAULT_MONTHLY_BUDGET_USD = 5;

/**
 * Conservative per-request estimate used when the backend reports no usage
 * (e.g. a mid-stream failure). Erring high keeps the guardrail honest: an
 * unaccounted request must never let the month run past the budget.
 */
export const FALLBACK_REQUEST_COST_USD = 0.01;

/** Ledger port: monthly spend totals keyed by 'YYYY-MM' (UTC). */
export interface SpendLedger {
  getSpentUsd(month: string): Promise<number>;
  addSpentUsd(month: string, usd: number): Promise<void>;
}

/** Spend-guard configuration injected into the endpoint deps. */
export interface SpendGuardOptions {
  ledger: SpendLedger;
  budgetUsd: number;
  /** Injectable clock for tests (defaults to `() => new Date()`). */
  now?: () => Date;
}

/** UTC month key for a ledger row: '2026-07'. */
export function monthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** ISO date (UTC) of the first day of the next month: the comeback date. */
export function nextMonthStart(date: Date): string {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
  );
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

/**
 * Parse the optional AVATAR_MONTHLY_BUDGET_USD override. Same floor rationale as
 * parseThreshold: a non-finite or non-positive value would disable the agent
 * permanently (budget 0 is always "spent"), so such values fall back to the
 * default instead of being honored.
 */
export function parseMonthlyBudgetUsd(raw: string | undefined): number {
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MONTHLY_BUDGET_USD;
}

/**
 * D1 adapter over the `avatar_spend` table. The increment is a single atomic
 * upsert (`ON CONFLICT ... spent_usd + excluded.spent_usd`), so concurrent
 * streams cannot lose updates; slight overshoot within one in-flight request
 * is acceptable for a soft monthly ceiling.
 */
export class D1SpendLedger implements SpendLedger {
  constructor(private readonly db: D1Database) {}

  async getSpentUsd(month: string): Promise<number> {
    const row = await this.db
      .prepare('SELECT spent_usd FROM avatar_spend WHERE month = ?1')
      .bind(month)
      .first<number>('spent_usd');
    return typeof row === 'number' ? row : 0;
  }

  async addSpentUsd(month: string, usd: number): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO avatar_spend (month, spent_usd, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(month) DO UPDATE SET
           spent_usd = spent_usd + excluded.spent_usd,
           updated_at = excluded.updated_at`
      )
      .bind(month, usd, new Date().toISOString())
      .run();
  }
}

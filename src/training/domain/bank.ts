import { examDomain } from './exams';
import type { Answerable } from './options';

/** One question of the bank, in the page's language. */
export interface Question extends Answerable {
  readonly id: string;
  readonly domain: string;
  readonly stem: string;
  readonly why: string;
}

/** How a sheet is named on screen: its domain's label and its number ("AA-001"). */
export function sheetLabel(q: { id: string; domain: string }): string {
  const n = /(\d+)$/.exec(q.id)?.[1];
  if (!n) throw new Error(`sheet id without a number: ${q.id}`);
  return `${examDomain(q.domain).label}-${n}`;
}

export function idsByDomain(
  questions: readonly Question[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const q of questions) (out[q.domain] = out[q.domain] ?? []).push(q.id);
  return out;
}

/** Lower-cased, accent-free text for search. */
export const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .trim();

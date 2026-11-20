/**
 * The question banks, one per exam, in both languages. Read at build time only: the
 * page renders every question as a sheet and the game reads them back from the page,
 * so no bank ever ships in a script.
 */
import foundations from './exams/foundations/questions.json';
import developerProfessional from './exams/developer-professional/questions.json';
import type { Locale } from '@/i18n/index';
import { DEVELOPER_PROFESSIONAL_EXAM, FOUNDATIONS_EXAM } from '../domain/exams';

interface BankQuestion {
  id: string;
  domain: string;
  stem: Record<Locale, string>;
  options: Record<Locale, string[]>;
  answer: number;
  why: Record<Locale, string>;
}

export const BANKS: Readonly<Record<string, readonly BankQuestion[]>> = {
  [FOUNDATIONS_EXAM.key]: foundations,
  [DEVELOPER_PROFESSIONAL_EXAM.key]: developerProfessional,
};

export function bankOf(key: string): readonly BankQuestion[] {
  const bank = BANKS[key];
  if (!bank) throw new Error(`no question bank for ${key}`);
  return bank;
}

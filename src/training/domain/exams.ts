/**
 * The exams the training page prepares for: their names, domains and, when the exam
 * guide states them, the format and the weight of each domain. Only the definitions live
 * here, so the page script can read them; the question banks are read at build time
 * (data/banks.ts) and reach the browser as HTML only.
 */
import type { Locale } from '@/i18n/index';
import foundations from '../data/exams/foundations/exam.json';
import developerProfessional from '../data/exams/developer-professional/exam.json';

export interface ExamDomain {
  key: string;
  /** Prefix of the sheet labels of this domain ("AA" in "AA-001"). */
  label: string;
  name: Record<Locale, string>;
  /** Share of the exam, between 0 and 1, when the exam guide gives it. */
  weight?: number;
}

export interface Exam {
  /** Stable id: the key of the exam's campaign and of its progress in the save. */
  key: string;
  /** Path of the exam's page under the training page; empty for the training page itself. */
  slug: string;
  name: string;
  /** The name without its "Claude Certified" prefix, for the exam switcher. */
  short: string;
  /** The exam code and format, when the exam guide gives them. */
  code?: string;
  questionCount?: number;
  minutes?: number;
  passScore?: number;
  maxScore?: number;
  domains: ExamDomain[];
}

export const FOUNDATIONS_EXAM: Exam = foundations;
export const DEVELOPER_PROFESSIONAL_EXAM: Exam = developerProfessional;
export const EXAMS: readonly Exam[] = [
  FOUNDATIONS_EXAM,
  DEVELOPER_PROFESSIONAL_EXAM,
];

/** Path of an exam's page, relative to the language root. */
export const examPath = (exam: Exam): string =>
  exam.slug ? `training/${exam.slug}/` : 'training/';

/** The domain a question belongs to, in whichever exam defines it. */
export function examDomain(key: string): ExamDomain {
  for (const e of EXAMS) {
    const d = e.domains.find((x) => x.key === key);
    if (d) return d;
  }
  throw new Error(`no exam domain ${key}`);
}

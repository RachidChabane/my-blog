/**
 * View models of the training page: the certifications held and the outline of
 * the exam, with the number of questions the game has for each domain.
 */
import type { Locale } from '@/i18n/index';
import type { Exam } from '@/training/domain/exams';

export interface Certification {
  title: string;
  issuer: string;
  /** DD-MM-YYYY, or a year alone. */
  date: string;
  proof?: string;
  score?: string;
}

export interface CertificationRow {
  title: string;
  issuer: string;
  /** Date as read on the page. */
  date: string;
  /** Machine-readable date for the <time> element. */
  datetime: string;
  score: string;
  proof: { href: string; host: string } | null;
}

export interface DomainRow {
  key: string;
  name: string;
  /** Weight in whole percent, when the exam guide gives it. */
  weight: number | null;
  questions: number;
}

const DAY_DATE = /^(\d{2})-(\d{2})-(\d{4})$/;
const YEAR_DATE = /^\d{4}$/;

/** A DD-MM-YYYY date or a bare year, written out in the locale. */
export function certificationDate(
  date: string,
  months: string[]
): { date: string; datetime: string } {
  if (YEAR_DATE.test(date)) return { date, datetime: date };
  const m = DAY_DATE.exec(date);
  if (!m)
    throw new Error(
      `certification date is neither DD-MM-YYYY nor YYYY: ${date}`
    );
  const [, dd, mm, yyyy] = m;
  return {
    date: `${Number(dd)} ${months[Number(mm) - 1]} ${yyyy}`,
    datetime: `${yyyy}-${mm}-${dd}`,
  };
}

export function certificationRows(
  certs: Certification[],
  months: string[]
): CertificationRow[] {
  return certs.map((c) => ({
    title: c.title,
    issuer: c.issuer,
    ...certificationDate(c.date, months),
    score: c.score ?? '',
    proof: c.proof
      ? { href: c.proof, host: new URL(c.proof).hostname.replace(/^www\./, '') }
      : null,
  }));
}

/** Each exam domain with its weight, when known, and the questions the game holds for it. */
export function domainRows(
  exam: Exam,
  questions: readonly { domain: string }[],
  lang: Locale
): DomainRow[] {
  const counts = new Map(exam.domains.map((d) => [d.key, 0]));
  for (const q of questions) {
    const n = counts.get(q.domain);
    if (n === undefined)
      throw new Error(`question domain is not in the exam: ${q.domain}`);
    counts.set(q.domain, n + 1);
  }
  return exam.domains.map((d) => ({
    key: d.key,
    name: d.name[lang],
    weight: d.weight === undefined ? null : Math.round(d.weight * 100),
    questions: counts.get(d.key) ?? 0,
  }));
}

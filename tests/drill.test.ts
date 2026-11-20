import { describe, expect, it } from 'vitest';
import {
  certificationDate,
  certificationRows,
  domainRows,
} from '@/office/drill';
import type { Certification, Exam } from '@/office/drill';
import { officeStrings } from '@/office/strings';
import certifications from '@/training/data/certifications.json';
import exam from '@/training/data/exam.json';
import questions from '@/training/data/questions.json';

const MONTHS = officeStrings('fr').months;
const EXAM = exam as Exam;

describe('training page data', () => {
  it('writes a day date out and keeps a year as it is', () => {
    expect(certificationDate('15-10-2026', MONTHS)).toEqual({
      date: '15 octobre 2026',
      datetime: '2026-10-15',
    });
    expect(certificationDate('2025', MONTHS)).toEqual({
      date: '2025',
      datetime: '2025',
    });
    expect(() => certificationDate('2026-10-15', MONTHS)).toThrow(/DD-MM-YYYY/);
  });

  it('names the host of each proof and leaves the others without a link', () => {
    const rows = certificationRows(certifications as Certification[], MONTHS);
    expect(rows).toHaveLength(certifications.length);
    for (const [i, row] of rows.entries()) {
      const proof = (certifications[i] as Certification).proof;
      if (proof) expect(row.proof).toEqual({ href: proof, host: 'credly.com' });
      else expect(row.proof).toBeNull();
    }
  });

  it('counts the game questions of every exam domain', () => {
    const rows = domainRows(
      EXAM,
      [{ domain: 'claude_code' }, { domain: 'claude_code' }],
      'en'
    );
    expect(rows.map((r) => r.key)).toEqual(EXAM.domains.map((d) => d.key));
    expect(rows.find((r) => r.key === 'claude_code')?.questions).toBe(2);
    expect(rows.find((r) => r.key === 'tool_design_mcp')?.questions).toBe(0);
  });

  it('refuses a question whose domain is not in the exam', () => {
    expect(() => domainRows(EXAM, [{ domain: 'nowhere' }], 'fr')).toThrow(
      /nowhere/
    );
  });

  it('places every question of the game in a domain, weights summing to the whole exam', () => {
    const rows = domainRows(EXAM, questions, 'fr');
    expect(rows.reduce((n, r) => n + r.questions, 0)).toBe(questions.length);
    expect(rows.reduce((n, r) => n + r.weight, 0)).toBe(100);
    expect(rows.every((r) => r.name.length > 0)).toBe(true);
  });
});

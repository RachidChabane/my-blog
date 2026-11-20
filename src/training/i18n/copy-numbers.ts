import type { Locale } from '@/i18n/index';

const WORDS: Record<Locale, readonly string[]> = {
  fr: [
    'zéro',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
  ],
  en: [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
  ],
};

/** A small count written out in words ("cinq", "eight"), a larger one in digits. */
export const countWord = (lang: Locale, n: number): string =>
  WORDS[lang][n] ?? String(n);

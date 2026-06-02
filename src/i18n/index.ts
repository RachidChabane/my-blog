/**
 * src/i18n/index.ts — PINNED i18n contract.
 * Locale list, route builders, translationKey join, language-switcher fallback.
 * Import from this file only — do not duplicate locale logic elsewhere.
 */

export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

/** Runtime guard: is `s` a supported locale? */
export function isValidLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

/**
 * Build an absolute path for a given locale and optional sub-path.
 * Trailing slash is always present on the locale segment.
 * localePath('fr')               → '/fr/'
 * localePath('en', 'blog/post')  → '/en/blog/post/'
 * localePath('fr', '/blog/')     → '/fr/blog/'  (leading slash stripped)
 */
export function localePath(locale: Locale, subPath?: string): string {
  const base = `/${locale}/`;
  if (!subPath) return base;
  const cleaned = subPath.replace(/^\//, '').replace(/\/$/, '');
  return cleaned ? `${base}${cleaned}/` : base;
}

/**
 * Language-switcher fallback (NFR-11: never a dead switch).
 *
 * @param targetLocale  The locale the visitor wants to switch to.
 * @param slugMap       Optional map of locale → slug for the current article/project.
 *                      If the target locale has a slug, returns the full content URL.
 *                      If not, falls back to the localized index for targetLocale.
 *
 * switcherHref('en')                          → '/en/'
 * switcherHref('en', { fr: 'mon-article', en: 'my-article' })  → '/en/blog/my-article/'
 * switcherHref('en', { fr: 'mon-article' })   → '/en/'  (no EN translation → index)
 */
export function switcherHref(
  targetLocale: Locale,
  slugMap?: Partial<Record<Locale, string>>
): string {
  if (slugMap) {
    const slug = slugMap[targetLocale];
    if (slug) return localePath(targetLocale, `blog/${slug}`);
  }
  return localePath(targetLocale);
}

/**
 * Parse the `Accept-Language` HTTP header and return the best supported locale.
 * Falls back to DEFAULT_LOCALE when no supported locale is found.
 *
 * parseAcceptLanguage('fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7') → 'fr'
 * parseAcceptLanguage('en-GB,en;q=0.9')                        → 'en'
 * parseAcceptLanguage('')                                       → 'fr'
 */
export function parseAcceptLanguage(header: string): Locale {
  if (!header) return DEFAULT_LOCALE;

  const entries = header
    .split(',')
    .map((part) => {
      const [tag, qPart] = part.trim().split(';');
      const q = qPart ? parseFloat(qPart.split('=')[1] ?? '1') : 1;
      return { tag: tag.trim().toLowerCase(), q: isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    if (isValidLocale(tag)) return tag;
    const prefix = tag.split('-')[0];
    if (prefix && isValidLocale(prefix)) return prefix;
  }
  return DEFAULT_LOCALE;
}

import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { LOCALES, localePath } from '@/i18n/index';
import type { Locale } from '@/i18n/index';
import { getPublishedRadar, parsePublishDateToDate } from '@/lib/content';

const FEED_META: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: 'Rachid Chabane · Radar',
    description:
      'Ce qui vient de sortir en ingénierie de l’IA, en briefs sourcés',
  },
  en: {
    title: 'Rachid Chabane · Radar',
    description: 'What just shipped in AI engineering, in sourced briefs',
  },
};

export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Locale;
  const meta = FEED_META[lang];
  return rss({
    title: meta.title,
    description: meta.description,
    site: context.site!,
    items: getPublishedRadar(await getCollection('radar'), lang).map((e) => ({
      title: e.data.title,
      description: e.data.summary,
      pubDate: parsePublishDateToDate(e.data.publishDate),
      link: localePath(lang, `radar/${e.data.slug}`),
    })),
    customData: `<language>${lang === 'fr' ? 'fr-FR' : 'en-US'}</language>`,
  });
}

import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { LOCALES } from '@/i18n/index';
import type { Locale } from '@/i18n/index';
import { getFeedItems } from '@/lib/content';

const FEED_META: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: 'Rachid Chabane — Articles',
    description: "Blog d'ingénierie IA — agents, RAG, systèmes",
  },
  en: {
    title: 'Rachid Chabane — Articles',
    description: 'AI engineering blog — agents, RAG, systems',
  },
};

export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((lang) => ({ params: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.params.lang as Locale;
  const entries = await getCollection('articles');
  const items = getFeedItems(entries, lang);
  const meta = FEED_META[lang];

  return rss({
    title: meta.title,
    description: meta.description,
    site: context.site!,
    items,
    customData: `<language>${lang === 'fr' ? 'fr-FR' : 'en-US'}</language>`,
  });
}

/** What the 3D office shows on its walls and sheets, per locale, built from the content. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { LOCALES } from '@/i18n/index';
import type { Locale } from '@/i18n/index';
import type { Concept } from '@/content/schemas';
import { worldData } from '@/office/view';

export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params }) => {
  const [articles, radar, journal, projects, concepts] = await Promise.all([
    getCollection('articles'),
    getCollection('radar'),
    getCollection('journal'),
    getCollection('projects'),
    getCollection('concepts'),
  ]);
  const data = worldData(params.lang as Locale, {
    articles,
    radar,
    journal,
    projects,
    concepts: concepts.map(
      (c: CollectionEntry<'concepts'>) => c.data as Concept
    ),
  });
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};

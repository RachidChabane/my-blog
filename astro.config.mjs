import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCallouts from './src/lib/remark-callouts.mjs';
import rehypeCitations from './src/lib/rehype-citations.mjs';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rachid-chabane.com',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    // GFM + SmartyPants stay on (Astro defaults); tables parse with zero plugins.
    // remark-callouts turns `> [!NOTE]` blockquotes into PRESSWORK <aside> callouts.
    // rehype-citations turns inline `[sN]` markers into links to the source cards.
    syntaxHighlight: false,
    remarkPlugins: [remarkCallouts],
    rehypePlugins: [rehypeCitations],
  },
});

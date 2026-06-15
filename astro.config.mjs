import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCallouts from './src/lib/remark-callouts.mjs';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rachid-chabane.com',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    // GFM + SmartyPants stay on (Astro defaults); tables parse with zero plugins.
    // remark-callouts turns `> [!NOTE]` blockquotes into PRESSWORK <aside> callouts.
    syntaxHighlight: false,
    remarkPlugins: [remarkCallouts],
  },
});

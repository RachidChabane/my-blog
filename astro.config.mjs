import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rachid-chabane.com',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    syntaxHighlight: false,
  },
});

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkCallouts from './src/lib/remark-callouts.mjs';
import rehypeCitations from './src/lib/rehype-citations.mjs';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://rachid-chabane.com',
  output: 'static',
  // The whole site's CSS is ~10 KB across four small sheets (tokens, Base, and a
  // couple of component sheets). Shipping them as <link> tags cost four
  // render-blocking round trips before anything could paint; inlining them into
  // the document puts every rule — and the @font-face declarations that gate the
  // font fetches — in the first response instead. `'always'` is safe here because
  // the sheets are tiny and the site is fully static.
  build: { inlineStylesheets: 'always' },
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

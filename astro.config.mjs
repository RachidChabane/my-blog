import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: {
    // Token-styled, theme-aware <pre>/<code> (design parity: light, bordered,
    // --bg-sunken). GLOBAL: inherited by every markdown surface (S3 here, plus
    // S5/S1/search later) and the content pipeline. The design mockup faked
    // highlighting with hand-authored spans; real dual-theme Shiki is a deferred
    // alternative (plan D5).
    syntaxHighlight: false,
  },
});

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroPlugin from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
      // Server-side TS (src/lib, scripts/, functions/, env accessor) uses Node
      // globals (process, etc.) alongside browser globals in client islands.
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    // Config files run under Node — include .mjs/.cjs (e.g. astro.config.mjs
    // uses process.env for the sitemap site URL).
    files: ['*.config.ts', '*.config.js', '*.config.mjs', '*.config.cjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      'design/',
      'inventory/',
      'plans/',
    ],
  },
];

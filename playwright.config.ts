import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    // Neutralize the scroll-reveal (and any motion) so the suite never races a
    // transition. The reveal's hidden state is gated behind
    // `prefers-reduced-motion: no-preference`, so under 'reduce' all content is
    // always visible. e2e/reveal.spec.ts opts back into motion to cover the
    // animated path explicitly. (This Playwright passes reducedMotion via
    // contextOptions, not as a top-level use key.)
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4321',
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { test, expect } from '@playwright/test';

// S7 — Project detail. Primary fixture = mcp-secrets-vault (the one project wired
// with a live status, an npm out-link, and 2 related articles — so one page
// exercises links + related + live-status together). Selectors use CLASSES/roles
// (language-robust). External links are asserted by href + target/rel and NEVER
// clicked (same convention as work-index.spec.ts); internal back/related hrefs
// point at genuinely-built published pages (INV-3). Heading labels use
// toContainText (NOT toHaveText): .rc-sec__h wraps a .rc-sec__n ordinal span, so
// its text content is "01What it is", not "What it is".

const EN = '/en/work/mcp-secrets-vault/';
const FR = '/fr/work/coffre-secrets-mcp/';

test.describe('S7 project detail renders', () => {
  test('EN: title, two named depth sections, summary, serialized body, stack, live status', async ({
    page,
  }) => {
    await page.goto(EN);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1.rc-projd__title')).toContainText(
      'MCP Secrets Vault'
    );

    // the two named depth-section headings exist, in order (ordinal span included)
    const heads = page.locator('.rc-sec__h');
    await expect(heads.nth(0)).toContainText('What it is');
    await expect(heads.nth(1)).toContainText('Engineering');

    // 01 "What it is" = the plain summary (NOT Prose)
    await expect(page.locator('.rc-projd__what')).toBeVisible();

    // 02 "Engineering" body actually serialized (render() did not silent-empty) —
    // a known sentence from the EN body lead.
    await expect(page.locator('.rc-article__body')).toContainText(
      'MCP Secrets Vault sits between'
    );

    // 03 Stack — at least one chip
    expect(
      await page.locator('.rc-stack .rc-tag').count()
    ).toBeGreaterThanOrEqual(1);

    // 04 Status — the status-section pill is live (mcp = shipped). Scoped to
    // .rc-statusline so the meta-row pill (also is-live) does not double-match.
    await expect(
      page.locator('.rc-statusline .rc-pstatus.is-live')
    ).toBeVisible();
  });
});

test.describe('links resolve (the core acceptance)', () => {
  test('EN: npm out-link opens out safely; internal back-link resolves', async ({
    page,
  }) => {
    await page.goto(EN);

    const npm = page.locator(
      'a.rc-linkchip[href="https://www.npmjs.com/package/mcp-secrets-vault"]'
    );
    await expect(npm).toHaveAttribute('target', '_blank');
    await expect(npm).toHaveAttribute('rel', /noopener/);

    // back-link resolves to the (built) S6 index (INV-3)
    await expect(page.locator('a.rc-back')).toHaveAttribute(
      'href',
      '/en/work/'
    );
  });
});

test.describe('related articles resolve', () => {
  test('EN: 2 rows, key-order preserved, both target built published pages', async ({
    page,
  }) => {
    await page.goto(EN);
    const rows = page.locator('.rc-rel a.rc-rel__row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toHaveAttribute(
      'href',
      '/en/blog/evaluating-tool-using-agent/'
    );
    await expect(rows.nth(1)).toHaveAttribute(
      'href',
      '/en/blog/deterministic-coding-agent-workflows/'
    );
  });
});

test.describe('FR parallel', () => {
  test('FR: localized headings (U+2019), npm link, FR-slug related row', async ({
    page,
  }) => {
    await page.goto(FR);
    await expect(page.locator('h1.rc-projd__title')).toContainText(
      'MCP Secrets Vault'
    );

    const heads = page.locator('.rc-sec__h');
    await expect(heads.nth(0)).toContainText('Ce que c’est'); // U+2019
    await expect(heads.nth(1)).toContainText('Ingénierie');

    await expect(
      page.locator(
        'a.rc-linkchip[href="https://www.npmjs.com/package/mcp-secrets-vault"]'
      )
    ).toBeVisible();

    // same related key resolves to the FR-locale published slug
    await expect(page.locator('.rc-rel a.rc-rel__row').nth(0)).toHaveAttribute(
      'href',
      '/fr/blog/evaluer-agent-outille/'
    );
  });
});

test.describe('conditional sections (omit when empty)', () => {
  test('EN: a project with no links and no related omits those sections; enrichment still renders', async ({
    page,
  }) => {
    // claude-plan-execute has links: [] and no relatedArticles
    await page.goto('/en/work/claude-plan-execute/');
    await expect(page.locator('a.rc-linkchip')).toHaveCount(0); // Links omitted
    await expect(page.locator('.rc-rel')).toHaveCount(0); // Related omitted
    // the optional enrichment renders: the interactive architecture diagram present
    await expect(page.locator('.rc-arch')).toBeVisible();
  });
});

test.describe('language switch on a detail page (decision #6: home fallback)', () => {
  test('EN detail → FR switcher falls back to the localized home (no slugMap, D2)', async ({
    page,
  }) => {
    await page.goto(EN);
    // No slugMap on work-detail → switch bounces to /fr/ (home), never a dead end.
    // The slug-preserving switch for projects is the deferred i18n-generalization
    // task (switcherHref hardcodes the blog/ segment). NFR-11 still holds.
    await expect(page.locator('header a[lang="fr"]')).toHaveAttribute(
      'href',
      '/fr/'
    );
  });
});

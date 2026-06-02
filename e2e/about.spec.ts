import { test, expect } from '@playwright/test';

// S8 — About / contact (FR-A6). Selectors use CLASSES (language-robust). The GitHub
// link is the one real, verifiably-public contact (repo remote) — asserted by href,
// never clicked. Email/LinkedIn are owner-fill placeholder rows (not links) by a
// deliberate, unit-tested privacy decision (ui.test.ts CONTACTS).

test.describe('S8 About — renders in both locales (FR-A6)', () => {
  test('FR: url, lang, h1, three section headings, tagline, bio placeholder, real how-it-works', async ({
    page,
  }) => {
    await page.goto('/fr/about/');
    await expect(page).toHaveURL('/fr/about/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toHaveText('À propos');

    const heads = page.locator('.rc-sec__h');
    await expect(heads).toHaveCount(3);
    await expect(heads.nth(0)).toHaveText('Bio');
    await expect(heads.nth(1)).toHaveText('Contact');
    await expect(heads.nth(2)).toHaveText('Comment ce site fonctionne');

    await expect(page.locator('.rc-about__tagline')).toBeVisible();
    await expect(page.locator('.rc-ph')).toBeVisible(); // bio owner-fill block
    await expect(page.locator('.rc-howit__text')).toContainText(
      'sans intervention humaine'
    );
  });

  test('EN: parallel page, English headings + real how-it-works text', async ({
    page,
  }) => {
    await page.goto('/en/about/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveText('About');
    await expect(page.locator('.rc-sec__h').nth(2)).toHaveText(
      'How this site works'
    );
    await expect(page.locator('.rc-howit__text')).toContainText(
      'no human in the loop'
    );
  });
});

test.describe('contact links present (mailto/external — no backend form, W-2)', () => {
  test('FR: GitHub is a real external link; no <form>; 2 owner-fill rows', async ({
    page,
  }) => {
    await page.goto('/fr/about/');
    const gh = page.locator(
      'a.rc-contact__row[href="https://github.com/RachidChabane"]'
    );
    await expect(gh).toBeVisible();
    await expect(gh).toHaveAttribute('target', '_blank');
    await expect(gh).toHaveAttribute('rel', /noopener/);
    await expect(page.locator('form')).toHaveCount(0);
    // email + linkedin are present as non-link placeholder rows.
    // NOTE: this count drops by one per entry the owner later fills (handoff).
    await expect(page.locator('.rc-contact__row.is-placeholder')).toHaveCount(
      2
    );
  });
});

test.describe('brand — non-figurative (D-007)', () => {
  test('the about mark is the abstract lattice; no photo/figure in <main>', async ({
    page,
  }) => {
    await page.goto('/fr/about/');
    await expect(page.locator('.rc-about__mark .avatar-glyph')).toBeVisible();
    await expect(page.locator('main img')).toHaveCount(0); // launcher lives outside <main>
  });
});

test.describe('language switch on a section page (decision #6: home fallback)', () => {
  test('FR /about/ → EN switcher falls back to the localized home (never dead — NFR-11)', async ({
    page,
  }) => {
    await page.goto('/fr/about/');
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });
});

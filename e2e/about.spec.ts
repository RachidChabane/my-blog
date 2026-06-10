import { test, expect } from '@playwright/test';

// S8 — About / contact (FR-A6). Selectors use CLASSES (language-robust). The GitHub
// link is the one real, verifiably-public contact (repo remote) — asserted by href,
// never clicked. Email/LinkedIn are owner-fill placeholder rows (not links) by a
// deliberate, unit-tested privacy decision (ui.test.ts CONTACTS).

test.describe('S8 About — renders in both locales (FR-A6)', () => {
  test('FR: url, lang, h1, three section headings, tagline, real bio prose, real how-it-works', async ({
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
    // finished bio: two real prose paragraphs, no leftover bracketed placeholder.
    const bio = page.locator('.rc-bio__p');
    await expect(bio).toHaveCount(2);
    await expect(bio.first()).toContainText('Lille');
    await expect(page.locator('.rc-bio')).not.toContainText('[');
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
  test('FR: GitHub + LinkedIn are external links, email is a mailto; no <form>; no owner-fill rows', async ({
    page,
  }) => {
    await page.goto('/fr/about/');
    const gh = page.locator(
      'a.rc-contact__row[href="https://github.com/RachidChabane"]'
    );
    await expect(gh).toBeVisible();
    await expect(gh).toHaveAttribute('target', '_blank');
    await expect(gh).toHaveAttribute('rel', /noopener/);
    // LinkedIn: the second external link, populated from the public résumé.
    const li = page.locator('a.rc-contact__row[href*="linkedin.com/in/"]');
    await expect(li).toBeVisible();
    await expect(li).toHaveAttribute('target', '_blank');
    await expect(li).toHaveAttribute('rel', /noopener/);
    // Email: a mailto (not external → no target/rel).
    await expect(
      page.locator('a.rc-contact__row[href^="mailto:"]')
    ).toBeVisible();
    await expect(page.locator('form')).toHaveCount(0);
    // every contact is now a live link → zero owner-fill placeholder rows.
    await expect(page.locator('.rc-contact__row.is-placeholder')).toHaveCount(
      0
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

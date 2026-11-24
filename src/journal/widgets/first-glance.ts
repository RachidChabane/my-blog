/**
 * <j-first-glance>: the reader rates three screens seen for 50 ms, then rates them
 * again with no time limit, and compares their own two sets of ratings.
 */
import { sameOpinionCount } from '../model';
import { journalStrings } from '../strings';
import { MASK, MOCK_SCREENS } from './mocks';

const EXPOSURE_MS = 50;
const FIXATION_MS = 800;
const RATINGS = [1, 2, 3, 4, 5];
/** A rating button ignores clicks this soon after it appears, so a double click rates one screen. */
const ACCEPT_AFTER_MS = 400;

type Region = 'stage' | 'results' | 'below';

export class FirstGlance extends HTMLElement {
  private flashRatings: number[] = [];
  private longRatings: number[] = [];

  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    // The announced area is created once: a live region only speaks when its
    // content changes after it exists.
    this.innerHTML =
      '<div class="jg-stage"></div><div class="jg-results" hidden></div>' +
      '<div class="jg-below" aria-live="polite" tabindex="-1"></div>';
    this.showStart();
  }

  private get t() {
    return journalStrings(document.documentElement.lang).glance;
  }

  private region(name: Region): HTMLElement {
    return this.querySelector<HTMLElement>(`.jg-${name}`)!;
  }

  private frame(stage: string, below: string): void {
    this.region('results').hidden = true;
    this.region('stage').hidden = false;
    this.region('stage').innerHTML = stage;
    this.say(below);
  }

  /** Replaces the announced text and keeps keyboard focus inside the test. */
  private say(below: string): HTMLElement {
    const area = this.region('below');
    const hadFocus = this.contains(document.activeElement);
    area.innerHTML = below;
    if (hadFocus) {
      const target = area.querySelector<HTMLElement>('button') ?? area;
      target.focus({ preventScroll: true });
    }
    return area;
  }

  private showStart(): void {
    this.flashRatings = [];
    this.longRatings = [];
    this.frame(
      MASK,
      `<p>${this.t.warning}</p><button type="button" class="jg-go">${this.t.start}</button>`
    );
    this.region('below')
      .querySelector('button')!
      .addEventListener('click', () => this.flash(0));
  }

  private flash(index: number): void {
    const screen = MOCK_SCREENS[index];
    if (!screen) return this.showLong(0);
    this.frame(
      '<span class="jg-cross">+</span>',
      `<p>${this.t.pageOf(index + 1, MOCK_SCREENS.length)}. ${this.t.watch}.</p>`
    );
    const stage = this.region('stage');
    window.setTimeout(() => {
      stage.innerHTML = screen;
      requestAnimationFrame(() =>
        window.setTimeout(() => {
          stage.innerHTML = MASK;
          this.askRating(this.t.rateFlash, (rating) => {
            this.flashRatings.push(rating);
            this.flash(index + 1);
          });
        }, EXPOSURE_MS)
      );
    }, FIXATION_MS);
  }

  private showLong(index: number): void {
    const screen = MOCK_SCREENS[index];
    if (!screen) return this.showResult();
    this.frame(screen, '');
    this.askRating(
      `${index === 0 ? `${this.t.secondRound} ` : ''}${this.t.rateLong}`,
      (rating) => {
        this.longRatings.push(rating);
        this.showLong(index + 1);
      }
    );
  }

  private askRating(question: string, onRate: (rating: number) => void): void {
    const shownAt = performance.now();
    const area = this.say(
      `<p>${question}</p><div class="jg-scale"><span>${this.t.scaleLow}</span>` +
        RATINGS.map(
          (r) => `<button type="button" data-rating="${r}">${r}</button>`
        ).join('') +
        `<span>${this.t.scaleHigh}</span></div>`
    );
    area.querySelectorAll<HTMLButtonElement>('button').forEach((button) =>
      button.addEventListener('click', () => {
        if (performance.now() - shownAt < ACCEPT_AFTER_MS) return;
        onRate(Number(button.dataset.rating));
      })
    );
  }

  private showResult(): void {
    const rows = MOCK_SCREENS.map(
      (screen, i) =>
        `<tr><td><span class="jg-thumb">${screen}</span></td><td>${this.flashRatings[i]}</td><td>${this.longRatings[i]}</td></tr>`
    ).join('');
    const same = sameOpinionCount(this.flashRatings, this.longRatings);
    this.region('stage').hidden = true;
    const results = this.region('results');
    results.hidden = false;
    results.innerHTML = `<table class="jg-result"><thead><tr><th>${this.t.colPage}</th><th>${this.t.colFlash}</th><th>${this.t.colLong}</th></tr></thead><tbody>${rows}</tbody></table>`;
    this.say(
      `<p><strong>${this.t.verdict(same, MOCK_SCREENS.length)}</strong></p>` +
        `<button type="button" class="jg-go">${this.t.again}</button>`
    )
      .querySelector('button')!
      .addEventListener('click', () => this.showStart());
  }
}

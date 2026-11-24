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

export class FirstGlance extends HTMLElement {
  private flashRatings: number[] = [];
  private longRatings: number[] = [];

  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    this.showStart();
  }

  private get t() {
    return journalStrings(document.documentElement.lang).glance;
  }

  private frame(stage: string, below: string): void {
    this.innerHTML = `<div class="jg-stage">${stage}</div><div class="jg-below" aria-live="polite">${below}</div>`;
  }

  private showStart(): void {
    this.flashRatings = [];
    this.longRatings = [];
    this.frame(
      MASK,
      `<p>${this.t.warning}</p><button type="button" class="jg-go">${this.t.start}</button>`
    );
    this.querySelector('button')!.addEventListener('click', () =>
      this.flash(0)
    );
  }

  private flash(index: number): void {
    const screen = MOCK_SCREENS[index];
    if (!screen) return this.showLong(0);
    this.frame(
      '<span class="jg-cross">+</span>',
      `<p>${this.t.pageOf(index + 1, MOCK_SCREENS.length)}. ${this.t.watch}.</p>`
    );
    const stage = this.querySelector<HTMLElement>('.jg-stage')!;
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
    const below = this.querySelector<HTMLElement>('.jg-below')!;
    below.innerHTML =
      `<p>${question}</p><div class="jg-scale"><span>${this.t.scaleLow}</span>` +
      RATINGS.map(
        (r) => `<button type="button" data-rating="${r}">${r}</button>`
      ).join('') +
      `<span>${this.t.scaleHigh}</span></div>`;
    below
      .querySelectorAll<HTMLButtonElement>('button')
      .forEach((button) =>
        button.addEventListener('click', () =>
          onRate(Number(button.dataset.rating))
        )
      );
    below
      .querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true });
  }

  private showResult(): void {
    const rows = MOCK_SCREENS.map(
      (screen, i) =>
        `<tr><td><span class="jg-thumb">${screen}</span></td><td>${this.flashRatings[i]}</td><td>${this.longRatings[i]}</td></tr>`
    ).join('');
    const same = sameOpinionCount(this.flashRatings, this.longRatings);
    this.innerHTML =
      `<table class="jg-result"><thead><tr><th>${this.t.colPage}</th><th>${this.t.colFlash}</th><th>${this.t.colLong}</th></tr></thead><tbody>${rows}</tbody></table>` +
      `<div class="jg-below" aria-live="polite"><p><strong>${this.t.verdict(same, MOCK_SCREENS.length)}</strong></p>` +
      `<button type="button" class="jg-go">${this.t.again}</button></div>`;
    this.querySelector('button')!.addEventListener('click', () =>
      this.showStart()
    );
  }
}

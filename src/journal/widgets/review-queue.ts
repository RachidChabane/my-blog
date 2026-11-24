/** <j-review-queue>: a pile of changes that grows when they arrive faster than they are reviewed. */
import { reviewBacklog } from '../model';
import { journalStrings } from '../strings';

const DAYS = 20;
const PRODUCED = { min: 1, max: 40, start: 14 };
const REVIEWED = { min: 1, max: 20, start: 8 };
const DAY_MS = 260;
/** Share of the figure that must be on screen before it plays. */
const IN_VIEW = 0.6;
/** Side of one card in the pile, in pixels, gap included. */
const CARD = { largest: 16, smallest: 4 };

type Rate = 'produced' | 'reviewed';

export class ReviewQueue extends HTMLElement {
  private day = 0;
  private timer: number | undefined;
  private rates = { produced: PRODUCED.start, reviewed: REVIEWED.start };

  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const t = journalStrings(document.documentElement.lang).queue;
    const stepper = (rate: Rate, label: string) => `
      <div class="jq-step" role="group" aria-label="${label}">
        <button type="button" data-rate="${rate}" data-by="-1" aria-label="${t.less}">−</button>
        <output data-rate="${rate}"></output>
        <button type="button" data-rate="${rate}" data-by="1" aria-label="${t.more}">+</button>
        <span>${label}</span>
      </div>`;
    this.innerHTML = `
      <p class="jq-status" aria-hidden="true"></p>
      <div class="jq-pile" aria-hidden="true"></div>
      <p class="jq-summary" aria-live="polite"></p>
      <div class="jq-controls">
        ${stepper('produced', t.produced)}
        ${stepper('reviewed', t.reviewed)}
        <button type="button" class="jq-play">${t.replay(DAYS)}</button>
      </div>`;
    this.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest('button');
      if (!button) return;
      if (button.classList.contains('jq-play')) return this.play();
      if (button.getAttribute('aria-disabled') === 'true') return;
      const rate = button.dataset.rate as Rate;
      const limits = rate === 'produced' ? PRODUCED : REVIEWED;
      this.rates[rate] = Math.min(
        limits.max,
        Math.max(limits.min, this.rates[rate] + Number(button.dataset.by))
      );
      this.stop();
      this.showRates();
      this.show(DAYS);
    });
    this.showRates();
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return this.show(DAYS);
    this.show(0);
    const seen = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.intersectionRatio >= IN_VIEW))
          return;
        seen.disconnect();
        this.play();
      },
      { threshold: IN_VIEW }
    );
    seen.observe(this);
  }

  disconnectedCallback(): void {
    this.stop();
  }

  /** Writes the two rates and marks the stepper buttons that have reached a limit. */
  private showRates(): void {
    for (const [rate, limits] of [
      ['produced', PRODUCED],
      ['reviewed', REVIEWED],
    ] as const) {
      const value = this.rates[rate];
      this.querySelector(`output[data-rate="${rate}"]`)!.textContent =
        String(value);
      for (const button of this.querySelectorAll<HTMLElement>(
        `button[data-rate="${rate}"]`
      )) {
        const limit = button.dataset.by === '1' ? limits.max : limits.min;
        button.setAttribute('aria-disabled', String(value === limit));
      }
    }
  }

  private stop(): void {
    window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private play(): void {
    this.stop();
    this.show(0);
    this.timer = window.setInterval(() => {
      this.show(this.day + 1);
      if (this.day >= DAYS) this.stop();
    }, DAY_MS);
  }

  /** Draws the pile as it stands at the end of `day`; day 0 is the empty start. */
  private show(day: number): void {
    this.day = day;
    const t = journalStrings(document.documentElement.lang).queue;
    const { produced, reviewed } = this.rates;
    const waiting =
      day === 0 ? 0 : (reviewBacklog(produced, reviewed, day)[day - 1] ?? 0);
    const merged = Math.min(produced, reviewed) * day;
    this.querySelector('.jq-status')!.textContent = t.status(
      day,
      waiting,
      merged
    );
    if (day === DAYS) {
      this.querySelector('.jq-summary')!.textContent =
        waiting > 0 ? t.waiting(waiting, DAYS) : t.none(DAYS);
    }
    this.pile(waiting);
  }

  private pile(count: number): void {
    const pile = this.querySelector<HTMLElement>('.jq-pile')!;
    const fits = (side: number) =>
      Math.floor(pile.clientWidth / side) *
        Math.floor(pile.clientHeight / side) >=
      count;
    let side = CARD.largest;
    while (side > CARD.smallest && !fits(side)) side -= 1;
    pile.style.setProperty('--card', `${side}px`);
    while (pile.childElementCount > count) pile.lastElementChild!.remove();
    while (pile.childElementCount < count) {
      pile.append(document.createElement('i'));
    }
  }
}

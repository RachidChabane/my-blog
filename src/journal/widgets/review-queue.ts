/** <j-review-queue>: what piles up when changes arrive faster than they are reviewed. */
import { reviewBacklog } from '../model';
import { journalStrings } from '../strings';

const DAYS = 20;
const PRODUCED = { min: 1, max: 40, start: 14 };
const REVIEWED = { min: 1, max: 20, start: 8 };
const CHART = {
  width: 560,
  height: 180,
  left: 8,
  right: 8,
  top: 10,
  bottom: 22,
};
/** The chart never zooms in further than this many waiting changes. */
const SMALLEST_SCALE = 150;

export class ReviewQueue extends HTMLElement {
  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const t = journalStrings(document.documentElement.lang).queue;
    this.innerHTML = `
      <p class="jf-result" aria-live="polite"></p>
      <svg class="jf-chart" viewBox="0 0 ${CHART.width} ${CHART.height}" role="img" aria-label="${t.chartLabel}"></svg>
      <label class="jf-slider"><span>${t.produced}</span><output></output>
        <input type="range" name="produced" min="${PRODUCED.min}" max="${PRODUCED.max}" value="${PRODUCED.start}"></label>
      <label class="jf-slider"><span>${t.reviewed}</span><output></output>
        <input type="range" name="reviewed" min="${REVIEWED.min}" max="${REVIEWED.max}" value="${REVIEWED.start}"></label>`;
    const result = this.querySelector<HTMLElement>('.jf-result')!;
    const chart = this.querySelector<SVGElement>('.jf-chart')!;
    const [producedInput, reviewedInput] = [
      ...this.querySelectorAll<HTMLInputElement>('input'),
    ] as [HTMLInputElement, HTMLInputElement];
    const [producedOut, reviewedOut] = [
      ...this.querySelectorAll<HTMLOutputElement>('output'),
    ] as [HTMLOutputElement, HTMLOutputElement];

    const plotWidth = CHART.width - CHART.left - CHART.right;
    const plotHeight = CHART.height - CHART.top - CHART.bottom;
    const slot = plotWidth / DAYS;

    const render = () => {
      const produced = Number(producedInput.value);
      const reviewed = Number(reviewedInput.value);
      producedOut.textContent = String(produced);
      reviewedOut.textContent = String(reviewed);
      const backlog = reviewBacklog(produced, reviewed, DAYS);
      const last = backlog[DAYS - 1] ?? 0;
      const scale = Math.max(last, SMALLEST_SCALE);
      result.textContent = last > 0 ? t.waiting(last, DAYS) : t.none(DAYS);
      const bars = backlog
        .map((waiting, day) => {
          const height = (waiting / scale) * plotHeight;
          return `<rect class="jf-bar" x="${CHART.left + day * slot + 2}" y="${CHART.top + plotHeight - height}" width="${slot - 4}" height="${height}"/>`;
        })
        .join('');
      const ticks = [1, 5, 10, 15, DAYS]
        .map((day) => {
          const last = day === DAYS;
          const tickX = last
            ? CHART.width - CHART.right
            : CHART.left + (day - 0.5) * slot;
          return `<text class="jf-tick" x="${tickX}" y="${CHART.height - 6}" text-anchor="${last ? 'end' : 'middle'}">${t.day} ${day}</text>`;
        })
        .join('');
      chart.innerHTML =
        `<line class="jf-grid" x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${CHART.top + plotHeight}" y2="${CHART.top + plotHeight}"/>` +
        `<line class="jf-grid" x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${CHART.top}" y2="${CHART.top}"/>` +
        `<text class="jf-tick" x="${CHART.left + 2}" y="${CHART.top + 13}">${scale}</text>` +
        bars +
        ticks;
    };
    this.addEventListener('input', render);
    render();
  }
}

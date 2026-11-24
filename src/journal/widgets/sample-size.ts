/** <j-sample-size>: how much a handful of people already tells you about a product. */
import { shareFound } from '../model';
import { journalStrings } from '../strings';

const MAX_USERS = 15;
const DEFAULT_USERS = 5;
const PER_USER_MIN = 10;
const PER_USER_MAX = 50;
const DEFAULT_PER_USER = 31;
const CHART = {
  width: 560,
  height: 200,
  left: 46,
  right: 10,
  top: 12,
  bottom: 24,
};

export class SampleSize extends HTMLElement {
  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const lang = document.documentElement.lang;
    const t = journalStrings(lang).sample;
    const percent = new Intl.NumberFormat(lang, {
      style: 'percent',
      maximumFractionDigits: 0,
    });
    this.innerHTML = `
      <p class="jf-result" aria-live="polite"></p>
      <svg class="jf-chart" viewBox="0 0 ${CHART.width} ${CHART.height}" role="img" aria-label="${t.chartLabel}"></svg>
      <label class="jf-slider"><span>${t.users}</span><output></output>
        <input type="range" name="users" min="1" max="${MAX_USERS}" value="${DEFAULT_USERS}"></label>
      <label class="jf-slider"><span>${t.perUser}</span><output></output>
        <input type="range" name="perUser" min="${PER_USER_MIN}" max="${PER_USER_MAX}" value="${DEFAULT_PER_USER}"></label>`;
    const result = this.querySelector<HTMLElement>('.jf-result')!;
    const chart = this.querySelector<SVGElement>('.jf-chart')!;
    const [usersInput, perUserInput] = [
      ...this.querySelectorAll<HTMLInputElement>('input'),
    ] as [HTMLInputElement, HTMLInputElement];
    const [usersOut, perUserOut] = [
      ...this.querySelectorAll<HTMLOutputElement>('output'),
    ] as [HTMLOutputElement, HTMLOutputElement];

    const x = (n: number) =>
      CHART.left +
      ((n - 1) / (MAX_USERS - 1)) * (CHART.width - CHART.left - CHART.right);
    const y = (share: number) =>
      CHART.top + (1 - share) * (CHART.height - CHART.top - CHART.bottom);

    const render = () => {
      const users = Number(usersInput.value);
      const perUser = Number(perUserInput.value) / 100;
      usersOut.textContent = String(users);
      perUserOut.textContent = percent.format(perUser);
      result.textContent = t.found(
        percent.format(shareFound(perUser, users)),
        users
      );
      const counts = Array.from({ length: MAX_USERS }, (_, i) => i + 1);
      const line = counts
        .map((n) => `${x(n)},${y(shareFound(perUser, n))}`)
        .join(' ');
      const grid = [0, 0.5, 1]
        .map(
          (share) =>
            `<line class="jf-grid" x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${y(share)}" y2="${y(share)}"/>` +
            `<text class="jf-tick" x="${CHART.left - 6}" y="${y(share) + 4}" text-anchor="end">${percent.format(share)}</text>`
        )
        .join('');
      const ticks = [1, 5, 10, 15]
        .map(
          (n) =>
            `<text class="jf-tick" x="${x(n)}" y="${CHART.height - 6}" text-anchor="middle">${n}</text>`
        )
        .join('');
      chart.innerHTML =
        grid +
        ticks +
        `<polyline class="jf-line" points="${line}"/>` +
        `<circle class="jf-dot" cx="${x(users)}" cy="${y(shareFound(perUser, users))}" r="7"/>`;
    };
    this.addEventListener('input', render);
    render();
  }
}

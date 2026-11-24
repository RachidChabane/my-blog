/** <j-sample-size>: people try a product one after the other, and each finds less that is new. */
import { discoveries, drawTrials, seededRandom } from '../model';
import { journalStrings } from '../strings';

const PROBLEMS = 40;
const PEOPLE = { max: 15, start: 5 };
/** Share of the problems one person runs into: Nielsen's average. */
const PER_USER = 0.31;
/** The draw shown first: with five people it lands on Nielsen's 85%. */
const FIRST_DRAW = 6;

export class SampleSize extends HTMLElement {
  private people = PEOPLE.start;
  private draw = FIRST_DRAW;
  private trials: number[][] = [];

  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const t = journalStrings(document.documentElement.lang).sample;
    this.innerHTML = `
      <p class="jm-result" aria-live="polite"></p>
      <div class="jm-known" aria-hidden="true"><i></i></div>
      <ol class="jm-people"></ol>
      <p class="jm-key" aria-hidden="true"><i class="jm-new"></i>${t.keyNew}<i class="jm-seen"></i>${t.keySeen}</p>
      <div class="jm-controls">
        <button type="button" data-do="add">${t.add}</button>
        <button type="button" data-do="restart">${t.restart}</button>
      </div>`;
    this.addEventListener('click', (event) => {
      const pressed = (event.target as HTMLElement).closest('button');
      if (!pressed || pressed.getAttribute('aria-disabled') === 'true') return;
      if (pressed.dataset.do === 'add') this.people += 1;
      if (pressed.dataset.do === 'restart') {
        this.shuffle(this.draw + 1);
        this.people = 1;
      }
      this.render();
    });
    this.shuffle(FIRST_DRAW);
    this.render();
  }

  private shuffle(draw: number): void {
    this.draw = draw;
    this.trials = drawTrials(PEOPLE.max, PROBLEMS, seededRandom(draw));
  }

  private render(): void {
    const t = journalStrings(document.documentElement.lang).sample;
    const found = discoveries(this.trials, PER_USER).slice(0, this.people);
    const known = found.reduce((sum, person) => sum + person.fresh, 0);
    const width = (count: number) => `${(count / PROBLEMS) * 100}%`;
    this.querySelector('.jm-result')!.textContent = t.found(
      this.people,
      known,
      PROBLEMS
    );
    this.querySelector<HTMLElement>('.jm-known i')!.style.width = width(known);
    this.querySelector('.jm-people')!.innerHTML = found
      .map(
        (person, i) => `
        <li>
          <span class="jm-who">${t.person(i + 1)}</span>
          <span class="jm-bar" aria-hidden="true"><i class="jm-new" style="width:${width(person.fresh)}"></i><i class="jm-seen" style="width:${width(person.seen)}"></i></span>
          <span class="jm-what">${t.brought(person.fresh, person.seen)}</span>
        </li>`
      )
      .join('');
    this.querySelector('button[data-do="add"]')!.setAttribute(
      'aria-disabled',
      String(this.people >= PEOPLE.max)
    );
  }
}

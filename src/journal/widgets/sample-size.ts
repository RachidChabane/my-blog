/** <j-sample-size>: people drawn at random, and the problems each of them runs into. */
import {
  drawTrials,
  isMet,
  problemsMet,
  seededRandom,
  shareFound,
} from '../model';
import { journalStrings } from '../strings';

const PROBLEMS = 40;
const PEOPLE = { max: 15, start: 5 };
/** Shares of the problems one person may meet, in percent; Nielsen's average is 31. */
const PER_USER_CHOICES = [10, 31, 50];
const PER_USER_START = 31;
/** The draw shown first: with five people at 31% it lands on Nielsen's 85%. */
const FIRST_DRAW = 6;

export class SampleSize extends HTMLElement {
  private people = PEOPLE.start;
  private perUser = PER_USER_START / 100;
  private draw = FIRST_DRAW;
  private trials: number[][] = [];

  connectedCallback(): void {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    const lang = document.documentElement.lang;
    const t = journalStrings(lang).sample;
    const percent = new Intl.NumberFormat(lang, { style: 'percent' });
    const choices = PER_USER_CHOICES.map(
      (choice) =>
        `<label><input type="radio" name="jm-per-user" value="${choice}"${choice === PER_USER_START ? ' checked' : ''}><span>${percent.format(choice / 100)}</span></label>`
    ).join('');
    this.innerHTML = `
      <p class="jm-result" aria-live="polite"></p>
      <p class="jm-label">${t.metByAnyone}</p>
      <div class="jm-row jm-found" aria-hidden="true"></div>
      <p class="jm-label">${t.metByEach}</p>
      <div class="jm-people" aria-hidden="true"></div>
      <div class="jm-controls">
        <button type="button" data-do="remove">${t.remove}</button>
        <button type="button" data-do="add">${t.add}</button>
        <button type="button" data-do="redraw">${t.redraw}</button>
        <fieldset class="jm-choice"><legend>${t.perUser}</legend>${choices}</fieldset>
      </div>`;
    this.addEventListener('click', (event) => {
      const pressed = (event.target as HTMLElement).closest('button');
      if (pressed?.getAttribute('aria-disabled') === 'true') return;
      const action = pressed?.dataset.do;
      if (action === 'add') this.people = Math.min(PEOPLE.max, this.people + 1);
      if (action === 'remove') this.people = Math.max(1, this.people - 1);
      if (action === 'redraw') this.shuffle(this.draw + 1);
      if (action) this.render();
    });
    this.addEventListener('change', (event) => {
      this.perUser = Number((event.target as HTMLInputElement).value) / 100;
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
    const lang = document.documentElement.lang;
    const t = journalStrings(lang).sample;
    const percent = new Intl.NumberFormat(lang, {
      style: 'percent',
      maximumFractionDigits: 0,
    });
    const found = problemsMet(this.trials, this.perUser, this.people);
    const count = found.filter(Boolean).length;
    const cells = (met: boolean[]) =>
      met.map((yes) => `<i${yes ? ' class="met"' : ''}></i>`).join('');
    this.querySelector('.jm-result')!.textContent = t.found(
      this.people,
      count,
      PROBLEMS,
      percent.format(count / PROBLEMS),
      percent.format(shareFound(this.perUser, this.people))
    );
    this.querySelector('.jm-found')!.innerHTML = cells(found);
    this.querySelector('.jm-people')!.innerHTML = this.trials
      .slice(0, this.people)
      .map(
        (person) =>
          `<div class="jm-row">${cells(person.map((trial) => isMet(trial, this.perUser)))}</div>`
      )
      .join('');
    const button = (name: string) =>
      this.querySelector<HTMLElement>(`button[data-do="${name}"]`)!;
    button('add').setAttribute(
      'aria-disabled',
      String(this.people >= PEOPLE.max)
    );
    button('remove').setAttribute('aria-disabled', String(this.people <= 1));
  }
}

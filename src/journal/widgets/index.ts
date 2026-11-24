/** Registers the journal's interactive figures as custom elements. */
import { FirstGlance } from './first-glance';
import { ReviewQueue } from './review-queue';
import { SampleSize } from './sample-size';

const ELEMENTS: Record<string, CustomElementConstructor> = {
  'j-first-glance': FirstGlance,
  'j-sample-size': SampleSize,
  'j-review-queue': ReviewQueue,
};

for (const [name, element] of Object.entries(ELEMENTS)) {
  if (!customElements.get(name)) customElements.define(name, element);
}

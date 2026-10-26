import { describe, it, expect } from 'vitest';
import { isRelevantExcerpt } from '@/lib/search-relevance';

describe('isRelevantExcerpt', () => {
  it('rejects a one-letter token matched by a long nonsense query', () => {
    const excerpt = 'with Zora <mark>Z.</mark> Wang as first author';
    expect(isRelevantExcerpt('zzqxnotarealword', excerpt)).toBe(false);
  });

  it('rejects a CLI-flag token matched by a long nonsense query', () => {
    expect(isRelevantExcerpt('qqqqx', 'run it with <mark>-q</mark> set')).toBe(
      false
    );
  });

  it('keeps an exact match', () => {
    expect(isRelevantExcerpt('rag', 'hybrid <mark>RAG</mark> pipeline')).toBe(
      true
    );
  });

  it('keeps a prefix query that highlights the longer word', () => {
    expect(
      isRelevantExcerpt('quantiz', 'about <mark>quantizing</mark> models')
    ).toBe(true);
  });

  it('keeps a stemmed match that highlights the singular form', () => {
    expect(
      isRelevantExcerpt('benchmarks', 'one <mark>benchmark</mark> suite')
    ).toBe(true);
  });

  it('keeps a multi-word query when one term is genuinely highlighted', () => {
    expect(
      isRelevantExcerpt(
        'temperature zero',
        '<mark>temperature</mark> <mark>zero</mark> is not deterministic'
      )
    ).toBe(true);
  });

  it('keeps an excerpt that carries no highlight', () => {
    expect(isRelevantExcerpt('anything', 'a title-only match')).toBe(true);
  });
});

describe('isRelevantExcerpt stemming', () => {
  it('keeps a stem match whose highlighted word diverges from the typed suffix', () => {
    expect(
      isRelevantExcerpt('quantizing', '<mark>quantization</mark> of weights')
    ).toBe(true);
  });
});

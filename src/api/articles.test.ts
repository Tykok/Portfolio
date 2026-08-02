import { vi } from 'vitest';

import { getArticles, toArticle } from './articles';

const raw = {
  id: 4013034,
  title: 'The new HTTP method : QUERY',
  description: 'You work with REST APIs?',
  url: 'https://dev.to/tykok/the-new-http-method-query-2bec',
  published_timestamp: '2026-06-28T15:54:11Z',
  reading_time_minutes: 4,
  public_reactions_count: 137,
  comments_count: 12,
  tag_list: ['programming', 'http'],
};

describe('toArticle', () => {
  it('keeps the fields the window shows', () => {
    expect(toArticle(raw)).toEqual({
      id: 4013034,
      title: 'The new HTTP method : QUERY',
      description: 'You work with REST APIs?',
      url: 'https://dev.to/tykok/the-new-http-method-query-2bec',
      publishedAt: '2026-06-28T15:54:11Z',
      readingMinutes: 4,
      reactions: 137,
      comments: 12,
      tags: ['programming', 'http'],
    });
  });

  it('drops an entry that could not be rendered', () => {
    // Third-party JSON: a row without an id, a title or a usable url would
    // render as a blank line pointing nowhere.
    [null, 'nope', {}, { ...raw, id: undefined }, { ...raw, title: '  ' }, { ...raw, url: 'javascript:alert(1)' }].forEach((bad) => {
      expect(toArticle(bad)).toBeNull();
    });
  });

  it('fills the counters rather than printing undefined', () => {
    const sparse = toArticle({ id: 1, title: 'T', url: 'https://dev.to/x' });
    expect(sparse).toMatchObject({ reactions: 0, comments: 0, readingMinutes: 0, tags: [], description: '' });
  });
});

describe('getArticles', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns newest first, whatever order the API used', async () => {
    const older = { ...raw, id: 2, published_timestamp: '2022-01-14T09:00:00Z' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => [older, raw] });

    const articles = await getArticles();

    expect(articles.map((a) => a.id)).toEqual([4013034, 2]);
  });

  it('skips the unusable entries instead of failing the whole list', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [raw, { id: 'x' }, null] });

    await expect(getArticles()).resolves.toHaveLength(1);
  });

  it('throws when dev.to answers with an error or something that is not a list', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(getArticles()).rejects.toThrow('503');

    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ articles: [] }) });
    await expect(getArticles()).rejects.toThrow(/not a list/);
  });
});

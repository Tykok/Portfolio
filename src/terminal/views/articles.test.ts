import type { Article } from 'data/articles';

import { articlesView } from './articles';

const text = (lines: { text: string }[]) => lines.map((l) => l.text).join('\n');

const ARTICLE: Article = {
  id: 1,
  title: 'Kotlin coroutines, without the folklore',
  description: 'What suspend actually does.',
  url: 'https://dev.to/tykok/coroutines',
  publishedAt: '2026-03-04T08:00:00Z',
  readingMinutes: 7,
  reactions: 42,
  comments: 3,
  tags: ['kotlin', 'concurrency'],
};

describe('articlesView', () => {
  it('lists each post with its URL and reading time', () => {
    const out = text(articlesView([ARTICLE], false, false));
    expect(out).toContain(ARTICLE.title);
    expect(out).toContain(ARTICLE.url);
    expect(out).toContain('7 min');
  });

  it('says it is loading rather than claiming there are none', () => {
    expect(text(articlesView([], true, false))).toContain('Loading');
  });

  it('names the failure when dev.to is unreachable', () => {
    const out = text(articlesView([], false, true));
    expect(out).toContain('dev.to');
    expect(out).toContain('dev.to/tykok');
  });

  it('handles an empty but successful fetch', () => {
    expect(text(articlesView([], false, false))).toContain('No articles');
  });
});

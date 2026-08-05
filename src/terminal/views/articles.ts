import type { Article } from 'data/articles';

import { blank, col, dim, out } from '../lines';
import type { Line } from '../types';

/** `2026-03-04`, from dev.to's ISO timestamp — no locale in an English shell. */
const day = (iso: string): string => iso.slice(0, 10);

export function articlesView(articles: Article[], loading: boolean, failed: boolean): Line[] {
  if (loading) return dim('Loading articles from dev.to…');
  if (failed) return [...out('dev.to is unreachable from here.'), ...dim('The posts live at dev.to/tykok.')];
  if (articles.length === 0) return [...out('No articles came back.'), ...dim('They live at dev.to/tykok.')];

  return [
    ...out(`ARTICLES — ${articles.length}`),
    ...blank,
    ...articles.flatMap((article) => [
      ...out(`  ${article.title}`),
      ...dim(col('', `${day(article.publishedAt)} · ${article.readingMinutes} min · ${article.reactions} reactions`, 2)),
      ...dim(`    ${article.url}`),
    ]),
    ...blank,
    ...dim('→ `open articles` in the desktop terminal opens the reader.'),
  ];
}

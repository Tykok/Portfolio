import type { Article } from 'data/articles';

/** The dev.to fields this app reads. The response carries some forty more. */
interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_timestamp: string;
  reading_time_minutes: number;
  public_reactions_count: number;
  comments_count: number;
  tag_list: string[];
}

const DEV_TO_USER = 'tykok';
/* dev.to caps per_page at 1000; thirty is well past the current fourteen posts
   and keeps the response small. */
const ENDPOINT = `https://dev.to/api/articles?username=${DEV_TO_USER}&per_page=30`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Third-party JSON, so nothing is trusted: an entry missing an id, a title or a
 * url is dropped rather than rendered as a blank row, and the counters fall
 * back to zero instead of printing "undefined reactions".
 */
export function toArticle(raw: unknown): Article | null {
  if (!isRecord(raw)) return null;
  const { id, title, url } = raw as Partial<DevToArticle>;
  if (typeof id !== 'number' || typeof title !== 'string' || typeof url !== 'string') return null;
  if (!title.trim() || !/^https?:\/\//.test(url)) return null;

  const r = raw as Partial<DevToArticle>;
  return {
    id,
    title: title.trim(),
    description: typeof r.description === 'string' ? r.description.trim() : '',
    url,
    publishedAt: typeof r.published_timestamp === 'string' ? r.published_timestamp : '',
    readingMinutes: typeof r.reading_time_minutes === 'number' ? r.reading_time_minutes : 0,
    reactions: typeof r.public_reactions_count === 'number' ? r.public_reactions_count : 0,
    comments: typeof r.comments_count === 'number' ? r.comments_count : 0,
    tags: Array.isArray(r.tag_list) ? r.tag_list.filter((t): t is string => typeof t === 'string') : [],
  };
}

/**
 * Newest first — dev.to already returns that order, but the app depends on it,
 * so it is enforced here rather than assumed.
 */
export async function getArticles(): Promise<Article[]> {
  const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`dev.to responded ${res.status}`);

  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) throw new Error('dev.to returned something that is not a list');

  return payload
    .map(toArticle)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

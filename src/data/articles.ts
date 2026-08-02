/**
 * A published article, reduced to what the window shows.
 *
 * Not localized: the posts are written in English on dev.to, and translating
 * their titles in the UI would misrepresent what the reader is about to open.
 */
export interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  /** ISO 8601, as dev.to returns it. */
  publishedAt: string;
  readingMinutes: number;
  reactions: number;
  comments: number;
  tags: string[];
}

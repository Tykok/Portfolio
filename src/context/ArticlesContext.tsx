import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getArticles } from 'api/articles';

import type { Article } from 'data/articles';

interface ArticlesContextValue {
  data: Article[];
  loading: boolean;
  error: Error | null;
}

const ArticlesContext = createContext<ArticlesContextValue>({
  data: [],
  loading: true,
  error: null,
});

/**
 * Mirrors ProjectsProvider on purpose: same loading / error / data shape, so
 * the two windows behave the same when the network is down.
 *
 * The fetch is dev.to's public API, straight from the browser — no key, no
 * proxy. If it is unreachable the window says so; the articles are not worth
 * a build-time snapshot that would freeze the counters.
 */
export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    getArticles()
      .then((articles) => {
        if (active) setData(articles);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return <ArticlesContext.Provider value={{ data, loading, error }}>{children}</ArticlesContext.Provider>;
}

export function useArticles(): ArticlesContextValue {
  return useContext(ArticlesContext);
}

export default ArticlesProvider;

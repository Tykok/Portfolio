import { render, screen, waitFor } from '@testing-library/react';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import { vi } from 'vitest';

import { ArticlesProvider } from 'context/ArticlesContext';
import LangProvider from 'context/LangContext';
import type { Article } from 'data/articles';
import fr from 'i18n/fr';

import { Articles } from './Articles';

vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

const getArticlesMock = vi.mocked(getArticles);

const article: Article = {
  id: 4013034,
  title: 'The new HTTP method : QUERY',
  description: 'You work with REST APIs?',
  url: 'https://dev.to/tykok/the-new-http-method-query-2bec',
  publishedAt: '2026-06-28T15:54:11Z',
  readingMinutes: 4,
  reactions: 137,
  comments: 12,
  tags: ['programming', 'http', 'restapi', 'backend'],
};

function renderApp() {
  return render(
    <LangProvider>
      <ArticlesProvider>
        <Articles />
      </ArticlesProvider>
    </LangProvider>,
  );
}

describe('Articles app', () => {
  beforeEach(() => {
    getArticlesMock.mockResolvedValue([article]);
  });

  it('shows the loader, then the article', async () => {
    renderApp();
    expect(screen.getByRole('img', { name: /chargement|loading/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(article.title)).toBeInTheDocument();
    });
  });

  it('opens each article on dev.to, in a new tab', async () => {
    renderApp();

    const link = await screen.findByRole('link', { name: new RegExp(article.title) });
    expect(link).toHaveAttribute('href', article.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('shows the reaction and comment counts — the only outside proof anyone read this', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(/137/)).toBeInTheDocument();
    });
    expect(screen.getByText(/12/)).toBeInTheDocument();
    expect(screen.getByText('4 min')).toBeInTheDocument();
  });

  it('caps the tags so a heavily tagged post cannot push the row over', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('#programming')).toBeInTheDocument();
    });
    expect(screen.queryByText('#backend')).not.toBeInTheDocument();
  });

  it('says so when dev.to cannot be reached, and still points at the profile', async () => {
    getArticlesMock.mockRejectedValue(new Error('offline'));
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(fr.ar_error)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /dev\.to/i })).toHaveAttribute('href', 'https://dev.to/tykok');
  });

  it('says so when the account has no article rather than showing an empty box', async () => {
    getArticlesMock.mockResolvedValue([]);
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(fr.ar_empty)).toBeInTheDocument();
    });
  });
});

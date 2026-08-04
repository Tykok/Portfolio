import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { useWindowContext, WindowProvider } from 'context/WindowContext';
import { socials } from 'data/socials';
import fr from 'i18n/fr';

import { Web } from './Web';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));

function OpenWindows() {
  const { windows } = useWindowContext();
  return <output data-testid="open">{windows.map((w) => w.key).join(',')}</output>;
}

/* Awaits the projects table before handing back: the page holds a pending fetch,
   and a test that finishes first gets its state update outside act(). */
async function renderBrowser() {
  const utils = render(
    <LangProvider>
      <WindowProvider>
        <ProjectsProvider>
          <Web />
          <OpenWindows />
        </ProjectsProvider>
      </WindowProvider>
    </LangProvider>,
  );
  await waitFor(() => expect(document.querySelectorAll('.np-dbrow').length).toBeGreaterThan(0));
  return utils;
}

const bookmark = (label: string) =>
  screen
    .getAllByText(label)
    .find((el) => el.closest('.bm-item'))
    ?.closest('.bm-item') as HTMLElement;
const pageLink = (label: string) =>
  screen
    .getAllByText(label)
    .find((el) => el.closest('.np-extlink'))
    ?.closest('.np-extlink') as HTMLElement;

describe('TicoqExplorer', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
  });

  it('opens the Articles window for dev.to instead of leaving the desktop', async () => {
    // The articles are already in the OS; sending someone to dev.to to read
    // what the site can show them is a link out of a portfolio for nothing.
    await renderBrowser();

    fireEvent.click(bookmark('Dev.to'));

    expect(screen.getByTestId('open')).toHaveTextContent('articles');
    expect(screen.queryByText(fr.br_ext_body)).not.toBeInTheDocument();
  });

  it("does the same from the page's own link list", async () => {
    await renderBrowser();

    fireEvent.click(pageLink('Dev.to'));

    expect(screen.getByTestId('open')).toHaveTextContent('articles');
  });

  it('still shows the way out for the accounts with no window behind them', async () => {
    await renderBrowser();

    fireEvent.click(bookmark('GitHub'));

    expect(screen.getByText(fr.br_ext_body)).toBeInTheDocument();
    expect(screen.getByTestId('open')).toHaveTextContent('');
  });

  it('reads the bookmarks from socials, this list having drifted twice', async () => {
    // Both former copies wrote the LinkedIn URL without the www the data has.
    await renderBrowser();
    const labels = Array.from(document.querySelectorAll('.bm-item')).map((el) => el.textContent ?? '');
    socials
      .filter((s) => s.key !== 'email')
      .forEach((s) => {
        expect(labels.some((l) => l.includes(s.label))).toBe(true);
      });
    expect(labels.some((l) => l.includes('Email'))).toBe(false);
  });
});

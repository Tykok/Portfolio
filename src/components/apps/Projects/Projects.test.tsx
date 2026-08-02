import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { RouteProvider } from 'context/RouteContext';
import { companies } from 'data/companies';
import fr from 'i18n/fr';

import { Projects } from './Projects';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));

const getProjectsMock = vi.mocked(getProjects);

const total = mockProjects.length + companies.length;

function renderApp() {
  return render(
    <LangProvider>
      <RouteProvider>
        <ProjectsProvider>
          <Projects />
        </ProjectsProvider>
      </RouteProvider>
    </LangProvider>,
  );
}

async function renderLoadedApp() {
  renderApp();
  await waitFor(() => {
    expect(screen.getByText(`1 / ${total}`)).toBeInTheDocument();
  });
}

describe('Projects deck', () => {
  // vite.config sets restoreMocks, which clears the implementation before each
  // test, so the happy path has to be re-armed rather than set once.
  beforeEach(() => {
    getProjectsMock.mockResolvedValue(mockProjects);
  });

  it('shows the chicken loader before the deck', async () => {
    renderApp();

    expect(screen.getByRole('img', { name: /chargement|loading/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(`1 / ${total}`)).toBeInTheDocument();
    });
  });

  it('shows the first project by default with counter 1 / N', async () => {
    await renderLoadedApp();
    // First project title appears both in rail and stage.
    expect(screen.getAllByText(mockProjects[0].title.fr).length).toBeGreaterThan(0);
  });

  it('clicking a rail thumbnail switches the active slide', async () => {
    await renderLoadedApp();
    const rail = document.querySelector('.deck-rail') as HTMLElement;
    const thumbs = rail.querySelectorAll('.deck-thumb');
    fireEvent.click(thumbs[1]);
    expect(screen.getByText(`2 / ${total}`)).toBeInTheDocument();
  });

  it('next button advances the counter', async () => {
    await renderLoadedApp();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    expect(screen.getByText(`2 / ${total}`)).toBeInTheDocument();
  });

  it('keeps the company cards when the projects request fails', async () => {
    // Companies are static module data with no API in front of them. Before
    // this guard, a transient projects failure replaced the whole window and
    // took four cards down with it.
    getProjectsMock.mockRejectedValue(new Error('network down'));
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(fr.projects_error)).toBeInTheDocument();
    });
    expect(screen.getByText(`1 / ${companies.length}`)).toBeInTheDocument();
    expect(screen.getAllByText(companies[0].name).length).toBeGreaterThan(0);
  });

  it('keeps the deck a direct child of the shell, which the notice layout depends on', async () => {
    // .deck-shell is a flex column; .deck-shell > .deck-B overrides .deck-B's
    // height: 100% so the deck flexes instead of adding its full height to the
    // notice's. An intervening element, or the shell being dropped, silently
    // pushes the deck below the fold inside .os-winbody.
    getProjectsMock.mockRejectedValue(new Error('network down'));
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(fr.projects_error)).toBeInTheDocument();
    });
    const shell = document.querySelector('.deck-shell');
    expect(shell?.querySelectorAll(':scope > .deck-B')).toHaveLength(1);
    expect(shell?.querySelectorAll(':scope > .pj-notice')).toHaveLength(1);
    expect(shell?.firstElementChild).toHaveClass('pj-notice');
  });

  describe('the address bar', () => {
    afterEach(() => {
      window.history.replaceState(null, '', '/');
    });

    it('opens on the slide the URL names, project or company', async () => {
      window.history.replaceState(null, '', '#/projects/plant974');
      renderApp();

      await waitFor(() => {
        expect(screen.getByText(`4 / ${total}`)).toBeInTheDocument();
      });
      expect(screen.getAllByText('Plant974 — flore de La Réunion').length).toBeGreaterThan(0);
    });

    it('falls back to the first slide when the id names nothing', async () => {
      // A renamed project should not produce a broken window, and the address
      // should stop advertising an id that no longer resolves.
      window.history.replaceState(null, '', '#/projects/deleted-long-ago');
      renderApp();

      await waitFor(() => {
        expect(screen.getByText(`1 / ${total}`)).toBeInTheDocument();
      });
      // The correction lands a tick after the deck settles: the slide is drawn
      // first, the address catches up on the next flush.
      await waitFor(() => {
        expect(window.location.hash).toBe(`#/projects/${mockProjects[0].id}`);
      });
    });

    it('rewrites the address as the deck moves', async () => {
      window.history.replaceState(null, '', '#/projects');
      await renderLoadedApp();

      fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

      await waitFor(() => {
        expect(window.location.hash).toBe(`#/projects/${mockProjects[1].id}`);
      });
    });

    it('does not touch the address when another app is the one on screen', async () => {
      // The deck renders inside its window whatever has focus; only the focused
      // app gets to name itself in the URL.
      window.history.replaceState(null, '', '#/cv');
      await renderLoadedApp();

      fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

      expect(window.location.hash).toBe('#/cv');
    });
  });

  it('shows only the Pro group when the projects request fails', async () => {
    getProjectsMock.mockRejectedValue(new Error('network down'));
    renderApp();

    await waitFor(() => {
      expect(screen.getByText(fr.projects_error)).toBeInTheDocument();
    });
    const headings = Array.from(document.querySelectorAll('.deck-rail .hd')).map((h) => h.textContent ?? '');
    expect(headings).toHaveLength(1);
    expect(headings[0]).toContain(fr.p_group_company);
  });
});

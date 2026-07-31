import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import LangProvider from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';
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
      <ProjectsProvider>
        <Projects />
      </ProjectsProvider>
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

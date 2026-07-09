import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { mockProjects } from 'api/mock/projects.mock';

import LangProvider from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';

import { Projects } from './Projects';

const total = mockProjects.length;

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
    fireEvent.click(screen.getByRole('button', { name: 'Projet suivant' }));
    expect(screen.getByText(`2 / ${total}`)).toBeInTheDocument();
  });
});

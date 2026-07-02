import { render, screen, waitFor } from '@testing-library/react';

import { LangProvider } from 'context/LangContext';
import { ProjectsProvider } from 'context/ProjectsContext';

import { Projects } from './Projects';

function renderProjects() {
  return render(
    <LangProvider>
      <ProjectsProvider>
        <Projects />
      </ProjectsProvider>
    </LangProvider>,
  );
}

describe('Projects app', () => {
  it('shows the chicken loader then the project list', async () => {
    renderProjects();

    expect(screen.getByRole('img', { name: /chargement|loading/i })).toBeInTheDocument();

    await waitFor(() => {
      // sidebar count header appears once data is loaded
      expect(screen.getByText(/\(\d+\)/)).toBeInTheDocument();
    });
  });
});

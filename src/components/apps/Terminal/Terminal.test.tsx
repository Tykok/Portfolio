import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import { ArticlesProvider } from 'context/ArticlesContext';
import { LangProvider } from 'context/LangContext';
import { OSProvider } from 'context/OSContext';
import { ProjectsProvider } from 'context/ProjectsContext';
import { WindowProvider } from 'context/WindowContext';

import { Terminal } from './Terminal';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));
vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

function renderTerminal() {
  return render(
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <ProjectsProvider>
            <ArticlesProvider>
              <Terminal />
            </ArticlesProvider>
          </ProjectsProvider>
        </OSProvider>
      </WindowProvider>
    </LangProvider>,
  );
}

async function type(command: string) {
  const input = screen.getByRole('textbox');
  await userEvent.type(input, `${command}{Enter}`);
}

describe('the windowed terminal', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  it('greets in English and points at help', () => {
    renderTerminal();
    expect(screen.getByText(/Type 'help' for commands/)).toBeInTheDocument();
  });

  it('runs the shared registry — grouped help, no gui line', async () => {
    renderTerminal();
    await type('help');
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(screen.queryByText(/leave the console/)).not.toBeInTheDocument();
  });

  it('stays English on a French desktop', async () => {
    localStorage.setItem('ticoq.lang', 'fr');
    renderTerminal();
    await type('who');
    expect(screen.getByText(/Kotlin Backend Developer/)).toBeInTheDocument();
  });

  it('recalls the last command with the up arrow', async () => {
    renderTerminal();
    await type('skills');
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '{ArrowUp}');
    expect(input).toHaveValue('skills');
  });

  it('completes a command name on Tab', async () => {
    renderTerminal();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'neo{Tab}');
    expect(input).toHaveValue('neofetch');
  });

  it('clears the log', async () => {
    renderTerminal();
    await type('skills');
    expect(screen.getByText(/Stack:/)).toBeInTheDocument();
    await type('clear');
    expect(screen.queryByText(/Stack:/)).not.toBeInTheDocument();
  });
});

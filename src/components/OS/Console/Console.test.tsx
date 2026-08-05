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

import { Console } from './Console';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));
vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

function renderConsole(handlers: Partial<{ onGui: () => void; onLogout: () => void; onShutdown: () => void }> = {}) {
  const props = { onGui: vi.fn(), onLogout: vi.fn(), onShutdown: vi.fn(), ...handlers };
  render(
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <ProjectsProvider>
            <ArticlesProvider>
              <Console {...props} />
            </ArticlesProvider>
          </ProjectsProvider>
        </OSProvider>
      </WindowProvider>
    </LangProvider>,
  );
  return props;
}

describe('the console profile', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  it('opens on a POST banner and the full help, unasked', () => {
    renderConsole();
    expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument();
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(screen.getByText(/PROFILE/)).toBeInTheDocument();
  });

  it('advertises the way out in that help', () => {
    renderConsole();
    expect(screen.getByText(/leave the console for the graphical desktop/)).toBeInTheDocument();
  });

  it('reads the portfolio as text, without opening a window', async () => {
    renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'ls{Enter}');
    expect(screen.getByText(/PERSONAL PROJECTS/)).toBeInTheDocument();
    expect(document.querySelector('.os-window')).toBeNull();
  });

  it('crosses to the desktop on gui', async () => {
    const { onGui } = renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'gui{Enter}');
    expect(onGui).toHaveBeenCalled();
  });

  it('logs off and shuts down through its host', async () => {
    const { onLogout, onShutdown } = renderConsole();
    await userEvent.type(screen.getByRole('textbox'), 'logout{Enter}');
    expect(onLogout).toHaveBeenCalled();
    await userEvent.type(screen.getByRole('textbox'), 'shutdown{Enter}');
    expect(onShutdown).toHaveBeenCalled();
  });

  it('takes focus, so the first keystroke lands in the prompt', () => {
    renderConsole();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});

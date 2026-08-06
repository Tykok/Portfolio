import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { vi } from 'vitest';

import fr from 'i18n/fr';

import Main from './Main';

vi.mock('api/projects', async (importOriginal) => ({
  ...(await importOriginal<typeof projectsApi>()),
  getProjects: vi.fn(),
}));
vi.mock('api/articles', async (importOriginal) => ({
  ...(await importOriginal<typeof articlesApi>()),
  getArticles: vi.fn(),
}));

/**
 * The OS shell end to end: deep links, and the shortcuts that let someone drive
 * it without a mouse. Every route here skips boot and login, which is the point
 * of a shared link.
 */
function renderAt(hash: string) {
  window.history.replaceState(null, '', hash);
  return render(<Main />);
}

const windowsOnScreen = () => document.querySelectorAll('.os-window:not(.is-min)');

describe('TicoqOS', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('lands straight on the window a link names, boot and login skipped', async () => {
    renderAt('#/cv');

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /CV/ })).toBeInTheDocument();
    });
    expect(screen.queryByText(fr.login_hint_profiles)).not.toBeInTheDocument();
  });

  it('opens windows maximized, and keeps a size to restore them to', async () => {
    renderAt('#/cv');

    await waitFor(() => expect(document.querySelector('.os-window')).toBeInTheDocument());
    const win = document.querySelector('.os-window') as HTMLElement;
    expect(win).toHaveClass('maxd');

    // Restore has to land on a real window, not a zero-sized one: the geometry
    // is still computed at open even though nothing shows it at first.
    fireEvent.click(screen.getByRole('button', { name: new RegExp(fr.w_max) }));
    expect(win).not.toHaveClass('maxd');
    expect(win.style.width).not.toBe('');
    expect(win.style.height).not.toBe('');
  });

  it('gives the keyboard to the window that opens', async () => {
    renderAt('#/cv');

    await waitFor(() => {
      expect(document.activeElement).toHaveAttribute('role', 'dialog');
    });
  });

  it('closes the active window on Escape', async () => {
    renderAt('#/cv');
    await waitFor(() => expect(windowsOnScreen()).toHaveLength(1));

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(windowsOnScreen()).toHaveLength(0));
  });

  it('leaves Escape alone while someone is typing', async () => {
    // The terminal and the contact box both take free text; closing the window
    // out from under a half-written line would be its own bug.
    renderAt('#/terminal');
    await waitFor(() => expect(windowsOnScreen()).toHaveLength(1));

    const input = document.querySelector('.os-term-row input') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'Escape', target: input });

    expect(windowsOnScreen()).toHaveLength(1);
  });

  it('opens the Start menu on Ctrl+Esc, as Windows does', async () => {
    renderAt('#/contact');
    await waitFor(() => expect(windowsOnScreen()).toHaveLength(1));

    fireEvent.keyDown(document, { key: 'Escape', ctrlKey: true });

    expect(document.querySelector('.os-startmenu')).toBeInTheDocument();
  });

  it('shows the desktop on Ctrl+Alt+D', async () => {
    renderAt('#/cv');
    await waitFor(() => expect(windowsOnScreen()).toHaveLength(1));

    fireEvent.keyDown(document, { key: 'd', ctrlKey: true, altKey: true });

    await waitFor(() => expect(windowsOnScreen()).toHaveLength(0));
    // Minimised, not closed: the taskbar still lists it.
    expect(document.querySelectorAll('.os-window')).toHaveLength(1);
  });

  it('opens the tips window on F1, shortcut list included', async () => {
    renderAt('#/contact');
    await waitFor(() => expect(windowsOnScreen()).toHaveLength(1));

    fireEvent.keyDown(document, { key: 'F1' });

    expect(screen.getByText(fr.sc_title)).toBeInTheDocument();
    // Every binding the code implements is listed, or the sheet lies.
    fr.os_shortcuts.forEach(([keys]) => {
      expect(screen.getByText(keys)).toBeInTheDocument();
    });
  });

  it('names the focused window in the address bar', async () => {
    renderAt('#/contact');

    await waitFor(() => {
      expect(window.location.hash).toBe('#/contact');
    });
  });
});

describe('the console profile', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('lands straight in the console from a shared link', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());
    expect(screen.getByText(/NAVIGATION/)).toBeInTheDocument();
    expect(windowsOnScreen()).toHaveLength(0);
    expect(screen.queryByText(fr.login_hint_profiles)).not.toBeInTheDocument();
  });

  it('reads the deck without opening a single window', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    await userEvent.type(screen.getByRole('textbox'), 'show pictarine{Enter}');
    expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument();
    expect(windowsOnScreen()).toHaveLength(0);
  });

  it('crosses to the desktop on gui, and says so in the address bar', async () => {
    renderAt('#/console');

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    await userEvent.type(screen.getByRole('textbox'), 'gui{Enter}');
    await waitFor(() => expect(document.querySelector('.os-desktop')).toBeInTheDocument());
    expect(window.location.hash).toBe('#/');
  });

  it('is reachable from the login screen, and names itself in the address bar', async () => {
    renderAt('#/');

    await waitFor(() => expect(screen.getByText(fr.login_hint_profiles)).toBeInTheDocument(), { timeout: 4000 });
    await userEvent.click(screen.getByRole('button', { name: /root/ }));
    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());
    expect(window.location.hash).toBe('#/console');
  }, 8000);

  it('follows a pasted #/console into the shell, from the desktop', async () => {
    // The app hash already had this (route.app → windows). route.console had
    // nothing reconciling a *later* change with `phase` — the hash updated,
    // but the console never opened until something else changed phase.
    renderAt('#/contact'); // the suite's usual fast path to a rendered desktop
    await waitFor(() => expect(document.querySelector('.os-desktop')).toBeInTheDocument());

    window.location.hash = '#/console';
    fireEvent(window, new Event('hashchange'));

    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());
    expect(document.querySelector('.os-desktop')).toBeNull();
  });

  it('follows the address bar back out, when it is edited away from #/console', async () => {
    renderAt('#/console');
    await waitFor(() => expect(screen.getByText(/TicoqBIOS/)).toBeInTheDocument());

    window.location.hash = '#/';
    fireEvent(window, new Event('hashchange'));

    await waitFor(() => expect(document.querySelector('.os-desktop')).toBeInTheDocument());
    expect(screen.queryByText(/TicoqBIOS/)).not.toBeInTheDocument();
  });
});

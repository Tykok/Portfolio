import { fireEvent, render, screen } from '@testing-library/react';

import LangProvider from 'context/LangContext';
import { OSProvider } from 'context/OSContext';
import { useWindowContext, WindowProvider } from 'context/WindowContext';
import { appsMeta } from 'data/apps';

import { Desktop } from './Desktop';

/** Windows are rendered by Main, so the count is how a test sees an app open. */
function OpenWindows() {
  const { windows } = useWindowContext();
  return <output data-testid="open">{windows.map((w) => w.key).join(',')}</output>;
}

/**
 * Before this, the desktop had no `tabIndex`, no `role` and only an
 * `onDoubleClick`: a visitor on a keyboard could not open a single app.
 */
function renderDesktop() {
  return render(
    <LangProvider>
      <WindowProvider>
        <OSProvider>
          <Desktop />
          <OpenWindows />
        </OSProvider>
      </WindowProvider>
    </LangProvider>,
  );
}

const icons = () => screen.getAllByRole('button').filter((el) => el.classList.contains('os-deskicon'));

describe('Desktop icons on a keyboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes one focusable control per app, named after it', () => {
    renderDesktop();
    const visible = appsMeta.filter((a) => !a.hidden);

    expect(icons()).toHaveLength(visible.length);
    visible.forEach((app) => {
      expect(screen.getByRole('button', { name: app.title.fr })).toBeInTheDocument();
    });
  });

  it('keeps the desktop to a single tab stop', () => {
    // Roving tabindex: seven stops would put the taskbar seven presses away.
    renderDesktop();
    const tabbable = icons().filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName(appsMeta[0].title.fr);
  });

  it.each(['Enter', ' '])('opens the focused icon on %s', (key) => {
    renderDesktop();
    const cv = appsMeta.find((a) => a.key === 'cv');
    expect(screen.getByTestId('open')).toHaveTextContent('');

    fireEvent.keyDown(screen.getByRole('button', { name: cv?.title.fr ?? '' }), { key });

    expect(screen.getByTestId('open')).toHaveTextContent('cv');
  });

  it('moves focus between icons with the arrows, and wraps', () => {
    renderDesktop();
    const visible = appsMeta.filter((a) => !a.hidden);
    const first = screen.getByRole('button', { name: visible[0].title.fr });

    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveAccessibleName(visible[1].title.fr);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toHaveAccessibleName(visible[0].title.fr);

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(document.activeElement).toHaveAccessibleName(visible[visible.length - 1].title.fr);
  });

  it('treats down as next and up as previous, the icons being freely draggable', () => {
    // Positions are user-chosen, so there is no stable geometry to read a
    // "right" or a "below" from; the arrows walk the app order instead.
    renderDesktop();
    const visible = appsMeta.filter((a) => !a.hidden);
    const first = screen.getByRole('button', { name: visible[0].title.fr });

    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveAccessibleName(visible[1].title.fr);
  });
});

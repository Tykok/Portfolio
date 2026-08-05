import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LangProvider } from 'context/LangContext';
import { identity } from 'data/identity';
import en from 'i18n/en';

import { Login } from './Login';

function renderLogin() {
  const onLogin = vi.fn();
  render(
    <LangProvider>
      <Login onLogin={onLogin} />
    </LangProvider>,
  );
  return onLogin;
}

describe('the login screen', () => {
  beforeEach(() => localStorage.setItem('ticoq.lang', 'en'));

  it('offers both profiles', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: new RegExp(identity.name) })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /root/ })).toBeInTheDocument();
  });

  it('names what each profile leads to', () => {
    renderLogin();
    expect(screen.getByText(en.login_role)).toBeInTheDocument();
    expect(screen.getByText(en.login_role_console)).toBeInTheDocument();
  });

  it('opens the desktop from the first tile', async () => {
    const onLogin = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(identity.name) }));
    expect(onLogin).toHaveBeenCalledWith('desktop');
  });

  it('opens the console from the second', async () => {
    const onLogin = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /root/ }));
    expect(onLogin).toHaveBeenCalledWith('console');
  });

  it('is drivable from the keyboard: arrows move, Enter picks', async () => {
    const onLogin = renderLogin();
    const tiles = screen.getAllByRole('button');
    tiles[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(tiles[1]).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onLogin).toHaveBeenCalledWith('console');
  });

  it('wraps at the ends, so the arrows never dead-end', async () => {
    renderLogin();
    const tiles = screen.getAllByRole('button');
    tiles[0].focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(tiles[tiles.length - 1]).toHaveFocus();
  });
});

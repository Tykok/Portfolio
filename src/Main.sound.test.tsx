import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as articlesApi from 'api/articles';
import { getArticles } from 'api/articles';
import { mockProjects } from 'api/mock/projects.mock';
import type * as projectsApi from 'api/projects';
import { getProjects } from 'api/projects';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

/* A stand-in for the Web Audio API jsdom does not implement. Counting
   oscillators is how this suite hears the OS. */
class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  /** Chrome hands back a suspended context until the page has been clicked. */
  static bornSuspended = false;
  currentTime = 0;
  state = 'running';
  destination = {};
  oscillators: unknown[] = [];
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });

  constructor() {
    if (FakeAudioContext.bornSuspended) this.state = 'suspended';
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const osc = {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    this.oscillators.push(osc);
    return osc;
  }

  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
}

const tonesPlayed = () => FakeAudioContext.instances.reduce((total, ctx) => total + ctx.oscillators.length, 0);

describe('TicoqOS sounds', () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects);
    vi.mocked(getArticles).mockResolvedValue([]);
    localStorage.clear();
    FakeAudioContext.instances = [];
    FakeAudioContext.bornSuspended = false;
    (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  });

  afterEach(() => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
    window.history.replaceState(null, '', '/');
  });

  it('chimes on boot', async () => {
    window.history.replaceState(null, '', '#/');

    render(<Main />);

    await waitFor(() => expect(tonesPlayed()).toBeGreaterThanOrEqual(4));
  });

  it('chimes once under StrictMode, not twice', async () => {
    // StrictMode runs every effect twice in development. A boot chime that
    // followed it would play the four notes over themselves.
    window.history.replaceState(null, '', '#/');

    render(
      <React.StrictMode>
        <Main />
      </React.StrictMode>,
    );

    await waitFor(() => expect(tonesPlayed()).toBeGreaterThanOrEqual(4));
    expect(tonesPlayed()).toBe(4);
  });

  it('holds the chime for the first click when the browser blocks audio on load', async () => {
    // Chrome's autoplay policy: nothing is audible until the page is clicked.
    // Dropping the chime there is what made the OS start in silence.
    FakeAudioContext.bornSuspended = true;
    window.history.replaceState(null, '', '#/');
    render(<Main />);
    await waitFor(() => expect(document.querySelector('.os-boot')).toBeInTheDocument());
    expect(tonesPlayed()).toBe(0);

    fireEvent.click(document.querySelector('.os-boot') as HTMLElement);

    await waitFor(() => expect(tonesPlayed()).toBe(4));
  });

  it('stays silent on boot once the visitor has muted the OS', async () => {
    localStorage.setItem('ticoq.sound', 'off');
    window.history.replaceState(null, '', '#/');

    render(<Main />);

    await waitFor(() => expect(document.querySelector('.os-boot')).toBeInTheDocument());
    expect(tonesPlayed()).toBe(0);
  });

  it('puts the speaker in the tray, next to the language switch', async () => {
    window.history.replaceState(null, '', '#/cv');

    render(<Main />);

    await waitFor(() => expect(screen.getByRole('button', { name: fr.sound_on })).toBeInTheDocument());
  });

  it('plays the close sweep alone — no tick stacked on the title bar button', async () => {
    window.history.replaceState(null, '', '#/cv');
    render(<Main />);
    await waitFor(() => expect(document.querySelector('.os-window')).toBeInTheDocument());
    const before = tonesPlayed();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(fr.w_close) }));

    /* The close sweep is a single oscillator. A generic tick riding along on
       the same click would show up as a second one. */
    expect(tonesPlayed()).toBe(before + 1);
  });

  it('sounds the error chord when the OS blue-screens', async () => {
    window.history.replaceState(null, '', '#/console');
    render(<Main />);
    await waitFor(() => expect(document.querySelector('.os-console')).toBeInTheDocument());
    const input = document.querySelector('input') as HTMLInputElement;
    const before = tonesPlayed();

    await userEvent.type(input, 'crash{Enter}');

    await waitFor(() => expect(document.querySelector('.os-bsod')).toBeInTheDocument());
    expect(tonesPlayed()).toBeGreaterThan(before);
  });
});

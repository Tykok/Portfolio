import { fireEvent, render, screen } from '@testing-library/react';
import type { Engine } from 'audio/engine';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SoundToggle } from 'components/TaskBar/Tray/SoundToggle';
import { LangProvider } from 'context/LangContext';
import { SoundProvider } from 'context/SoundContext';
import fr from 'i18n/fr';

function renderToggle() {
  const engine: Engine = { play: vi.fn(() => true), resume: vi.fn(async () => true) };
  render(
    <LangProvider>
      <SoundProvider engine={engine}>
        <SoundToggle />
      </SoundProvider>
    </LangProvider>,
  );
  return engine;
}

describe('SoundToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts pressed, since the OS ships with sound on', () => {
    renderToggle();

    expect(screen.getByRole('button', { name: fr.sound_on })).toHaveAttribute('aria-pressed', 'true');
  });

  it('mutes the OS on a click, and says so', () => {
    renderToggle();

    fireEvent.click(screen.getByRole('button', { name: fr.sound_on }));

    expect(screen.getByRole('button', { name: fr.sound_off })).toHaveAttribute('aria-pressed', 'false');
  });

  it('makes no sound of its own — muting must not tick', () => {
    const engine = renderToggle();

    fireEvent.click(screen.getByRole('button', { name: fr.sound_on }));

    expect(engine.play).not.toHaveBeenCalled();
  });
});

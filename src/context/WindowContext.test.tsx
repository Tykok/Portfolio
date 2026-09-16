import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Engine } from 'audio/engine';
import { SOUNDS } from 'audio/sounds';
import { describe, expect, it, vi } from 'vitest';

import { SoundProvider } from 'context/SoundContext';
import { useWindowContext, WindowProvider } from 'context/WindowContext';

function Probe() {
  const { windows, openApp, closeWindow, minimizeWindow } = useWindowContext();
  const first = windows[0];
  /* data-sound="none" keeps the harness's own buttons from adding the generic
     tick on top of the lifecycle sound under test. */
  return (
    <div>
      <button data-sound="none" onClick={() => openApp('projects')}>
        open
      </button>
      <button data-sound="none" onClick={() => first && closeWindow(first.id)}>
        close
      </button>
      <button data-sound="none" onClick={() => first && minimizeWindow(first.id)}>
        minimize
      </button>
    </div>
  );
}

function renderTree() {
  const engine: Engine = { play: vi.fn(() => true), resume: vi.fn(async () => true), preload: vi.fn() };
  render(
    <SoundProvider engine={engine}>
      <WindowProvider>
        <Probe />
      </WindowProvider>
    </SoundProvider>,
  );
  return engine;
}

describe('WindowProvider sounds', () => {
  it('sweeps up when a window opens', () => {
    const engine = renderTree();

    fireEvent.click(screen.getByText('open'));

    expect(engine.play).toHaveBeenCalledWith(SOUNDS.open);
  });

  it('sweeps down when a window closes', () => {
    const engine = renderTree();
    fireEvent.click(screen.getByText('open'));
    vi.mocked(engine.play).mockClear();

    fireEvent.click(screen.getByText('close'));

    expect(engine.play).toHaveBeenCalledWith(SOUNDS.close);
  });

  it('drops a shorter sweep when a window is minimized', () => {
    const engine = renderTree();
    fireEvent.click(screen.getByText('open'));
    vi.mocked(engine.play).mockClear();

    act(() => {
      fireEvent.click(screen.getByText('minimize'));
    });

    expect(engine.play).toHaveBeenCalledWith(SOUNDS.minimize);
  });
});

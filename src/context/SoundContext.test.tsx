import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Engine } from 'audio/engine';
import { SOUNDS } from 'audio/sounds';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SoundProvider, useSound } from 'context/SoundContext';

function fakeEngine(): Engine {
  return { play: vi.fn(() => true), resume: vi.fn(async () => true) };
}

function Probe() {
  const { enabled, toggle } = useSound();
  return (
    <div>
      <span data-testid="state">{enabled ? 'on' : 'off'}</span>
      <button data-sound="none" onClick={toggle}>
        toggle
      </button>
    </div>
  );
}

function renderTree(engine: Engine) {
  return render(
    <SoundProvider engine={engine}>
      <Probe />
      <button>ordinary</button>
      <div data-sound="close" data-testid="closer">
        close me
      </div>
      <p data-testid="plain">plain content</p>
    </SoundProvider>,
  );
}

describe('SoundProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ticks on a click on any ordinary control', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByText('ordinary'));

    expect(engine.play).toHaveBeenCalledWith(SOUNDS.click);
  });

  it('plays the sound an element names through data-sound', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByTestId('closer'));

    expect(engine.play).toHaveBeenCalledWith(SOUNDS.close);
  });

  it('stays silent on a click on plain content', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByTestId('plain'));

    expect(engine.play).not.toHaveBeenCalled();
  });

  it('stays silent on a control that opts out with data-sound="none"', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByText('toggle'));

    expect(engine.play).not.toHaveBeenCalled();
  });

  it('plays nothing once sound is switched off', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByText('toggle'));
    fireEvent.click(screen.getByText('ordinary'));

    expect(screen.getByTestId('state')).toHaveTextContent('off');
    expect(engine.play).not.toHaveBeenCalled();
  });

  it('remembers the off state across a reload', () => {
    const first = fakeEngine();
    const { unmount } = renderTree(first);
    fireEvent.click(screen.getByText('toggle'));
    unmount();

    renderTree(fakeEngine());

    expect(screen.getByTestId('state')).toHaveTextContent('off');
  });

  it('starts switched on when nothing is stored', () => {
    renderTree(fakeEngine());

    expect(screen.getByTestId('state')).toHaveTextContent('on');
  });

  it('resumes the audio context on a gesture, even a silent one', () => {
    const engine = fakeEngine();
    renderTree(engine);

    fireEvent.click(screen.getByTestId('plain'));

    expect(engine.resume).toHaveBeenCalled();
  });
});

/** Chrome on a cold load: audio stays blocked until the page is clicked. */
function blockedEngine(): Engine {
  let audible = false;
  return {
    play: vi.fn(() => audible),
    resume: vi.fn(async () => {
      audible = true;
      return true;
    }),
  };
}

function Greeter() {
  const { playWhenAudible } = useSound();
  useEffect(() => playWhenAudible('boot'), [playWhenAudible]);
  return <p data-testid="plain">plain content</p>;
}

function renderGreeter(engine: Engine) {
  render(
    <SoundProvider engine={engine}>
      <Greeter />
    </SoundProvider>,
  );
}

const bootCalls = (engine: Engine) => vi.mocked(engine.play).mock.calls.filter(([tones]) => tones === SOUNDS.boot).length;

describe('a sound the browser blocked', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is held back, not lost, when audio is not yet allowed', async () => {
    const engine = blockedEngine();
    renderGreeter(engine);
    expect(bootCalls(engine)).toBe(1); // tried, and went nowhere

    fireEvent.click(screen.getByTestId('plain'));

    await waitFor(() => expect(bootCalls(engine)).toBe(2));
  });

  it('plays once, not on every later click', async () => {
    const engine = blockedEngine();
    renderGreeter(engine);
    fireEvent.click(screen.getByTestId('plain'));
    await waitFor(() => expect(bootCalls(engine)).toBe(2));

    fireEvent.click(screen.getByTestId('plain'));

    await waitFor(() => expect(bootCalls(engine)).toBe(2));
  });

  it('is never held at all while the OS is muted', async () => {
    localStorage.setItem('ticoq.sound', 'off');
    const engine = blockedEngine();
    renderGreeter(engine);

    fireEvent.click(screen.getByTestId('plain'));

    await waitFor(() => expect(engine.resume).toHaveBeenCalled());
    expect(bootCalls(engine)).toBe(0);
  });
});

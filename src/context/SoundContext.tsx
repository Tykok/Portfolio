import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Engine } from 'audio/engine';
import { createEngine } from 'audio/engine';
import type { SoundName } from 'audio/sounds';
import { SOUND_NAMES, SOUNDS } from 'audio/sounds';

const SOUND_KEY = 'ticoq.sound';

/* Anything a visitor can click gets the tick, so the selector lists what the
   OS actually builds its controls out of rather than trying to detect
   "interactive" generically. */
const CONTROL_SELECTOR =
  'button, a[href], [role="button"], [role="menuitem"], input[type="checkbox"], input[type="radio"], select, summary';

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (on: boolean) => void;
  play: (name: SoundName) => void;
  /**
   * For a sound that matters even when the browser is not listening yet — the
   * startup chime. Plays now if it can, otherwise waits for the first gesture
   * and plays then rather than being dropped.
   */
  playWhenAudible: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue>({
  enabled: true,
  toggle: () => {},
  setEnabled: () => {},
  play: () => {},
  playWhenAudible: () => {},
});

function storedEnabled(): boolean {
  /* Sound is on by default; only an explicit 'off' silences it. A stored value
     that predates a rename should not leave the OS mute forever. */
  return localStorage.getItem(SOUND_KEY) !== 'off';
}

function isSoundName(value: string | null): value is SoundName {
  return value !== null && (SOUND_NAMES as readonly string[]).includes(value);
}

/** The sound a click on `target` should make, or null for silence. */
export function soundForTarget(target: EventTarget | null): SoundName | null {
  const el = target instanceof Element ? target : null;
  if (!el) return null;

  /* A named element wins over the generic tick even when it sits inside a
     button — that is the point of naming it. 'none' is the opt-out. */
  const named = el.closest('[data-sound]');
  if (named) {
    const value = named.getAttribute('data-sound');
    return isSoundName(value) ? value : null;
  }

  return el.closest(CONTROL_SELECTOR) ? 'click' : null;
}

interface Props {
  children: ReactNode;
  /** Injected in tests; production builds the real Web Audio engine once. */
  engine?: Engine;
}

export function SoundProvider({ children, engine }: Props) {
  const [enabled, setEnabledState] = useState(storedEnabled);

  /* One engine for the life of the provider: it owns the AudioContext, and
     browsers cap how many of those a page may hold. Lazy state rather than a
     ref so nothing is built during render. */
  const [player] = useState<Engine>(() => engine ?? createEngine());

  /* The delegated listener below is installed once and must not be torn down
     and rebuilt on every toggle, so it reads the switch through a ref. */
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
    localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
  }, [enabled]);

  /* A sound the autoplay policy refused, waiting for the gesture that opens
     audio up. At most one: a queue of stale greetings helps nobody. */
  const heldRef = useRef<SoundName | null>(null);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabledRef.current) return;
      player.play(SOUNDS[name]);
    },
    [player],
  );

  const playWhenAudible = useCallback(
    (name: SoundName) => {
      if (!enabledRef.current) return;
      if (player.play(SOUNDS[name])) return;
      heldRef.current = name;
    },
    [player],
  );

  /* One delegated listener rather than a handler per control: the OS grows new
     buttons constantly, and none of them should have to remember the sound. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      /* Every click is a gesture, so it is also the cheapest moment to lift a
         context the autoplay policy suspended — silent clicks included. */
      void player.resume().then((audible) => {
        const held = heldRef.current;
        heldRef.current = null;
        if (audible && held && enabledRef.current) player.play(SOUNDS[held]);
      });

      if (!enabledRef.current) return;
      const name = soundForTarget(event.target);
      if (name) player.play(SOUNDS[name]);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [player]);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      toggle: () => setEnabledState((on) => !on),
      setEnabled: setEnabledState,
      play,
      playWhenAudible,
    }),
    [enabled, play, playWhenAudible],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  return useContext(SoundContext);
}

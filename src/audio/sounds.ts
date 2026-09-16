import type { Tone } from 'audio/engine';

/**
 * The system sounds, each in two forms.
 *
 * `file` names a sample under `public/sounds/`, which is where the real Windows
 * XP media go for anyone who drops them in — they are Microsoft's, so the
 * repository ships none of them and .gitignore keeps them out.
 *
 * `tones` is the oscillator score played when no sample is there: a cousin of
 * the original, not a copy. A fresh clone, and the deployed site, sound like
 * this and stay perfectly usable.
 */
export const SOUND_NAMES = ['boot', 'click', 'menu', 'open', 'close', 'minimize', 'error'] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

export interface Sound {
  /** Sample to play when the visitor has supplied it. */
  file: string;
  /** Synthesised stand-in, played whenever the sample is missing. */
  tones: Tone[];
}

/* F major, voiced low to high: the shape every 90s boot chime borrowed from
   the same few bars of ambient. Long attacks and overlapping tails make the
   four notes read as one pad instead of four beeps. */
const BOOT_NOTES = [174.61, 261.63, 349.23, 523.25];

const bootTones: Tone[] = BOOT_NOTES.map((freq, index) => ({
  freq,
  at: index * 0.17,
  dur: 1.5 - index * 0.12,
  type: 'sine',
  gain: 0.11 - index * 0.012,
  attack: 0.22,
}));

export const SOUNDS: Record<SoundName, Sound> = {
  boot: { file: '/sounds/boot.wav', tones: bootTones },

  /* Short and quiet on purpose: it fires on every click in the OS, and a tick
     you notice twice is a tick you mute. */
  click: {
    file: '/sounds/click.wav',
    tones: [{ freq: 2000, at: 0, dur: 0.022, type: 'square', gain: 0.045, attack: 0.001 }],
  },

  menu: {
    file: '/sounds/menu.wav',
    tones: [{ freq: 1250, at: 0, dur: 0.026, type: 'square', gain: 0.04, attack: 0.001 }],
  },

  /* Windows rise and fall, and so do their sweeps. */
  open: {
    file: '/sounds/open.wav',
    tones: [{ freq: 400, to: 900, at: 0, dur: 0.09, type: 'triangle', gain: 0.07 }],
  },
  close: {
    file: '/sounds/close.wav',
    tones: [{ freq: 900, to: 380, at: 0, dur: 0.09, type: 'triangle', gain: 0.07 }],
  },
  minimize: {
    file: '/sounds/minimize.wav',
    tones: [{ freq: 700, to: 300, at: 0, dur: 0.07, type: 'triangle', gain: 0.06 }],
  },

  /* A minor second held under a fifth — the dissonance every OS reached for to
     say "no". */
  error: {
    file: '/sounds/error.wav',
    tones: [
      { freq: 174.61, at: 0, dur: 0.34, type: 'square', gain: 0.06, attack: 0.006 },
      { freq: 185.0, at: 0, dur: 0.34, type: 'square', gain: 0.05, attack: 0.006 },
      { freq: 261.63, at: 0.02, dur: 0.3, type: 'square', gain: 0.035, attack: 0.006 },
    ],
  },
};

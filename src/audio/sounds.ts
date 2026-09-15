import type { Tone } from 'audio/engine';

/**
 * The system sounds, written as oscillator scores rather than sampled from the
 * era: the 95-vintage originals are Microsoft's, and a portfolio is a public
 * place to borrow them. These are cousins, not copies.
 */
export const SOUND_NAMES = ['boot', 'click', 'menu', 'open', 'close', 'minimize', 'error'] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

/* F major, voiced low to high: the shape every 90s boot chime borrowed from
   the same few bars of ambient. Long attacks and overlapping tails make the
   four notes read as one pad instead of four beeps. */
const BOOT_NOTES = [174.61, 261.63, 349.23, 523.25];

const boot: Tone[] = BOOT_NOTES.map((freq, index) => ({
  freq,
  at: index * 0.17,
  dur: 1.5 - index * 0.12,
  type: 'sine',
  gain: 0.11 - index * 0.012,
  attack: 0.22,
}));

export const SOUNDS: Record<SoundName, Tone[]> = {
  boot,

  /* Short and quiet on purpose: it fires on every click in the OS, and a tick
     you notice twice is a tick you mute. */
  click: [{ freq: 2000, at: 0, dur: 0.022, type: 'square', gain: 0.045, attack: 0.001 }],

  menu: [{ freq: 1250, at: 0, dur: 0.026, type: 'square', gain: 0.04, attack: 0.001 }],

  /* Windows rise and fall, and so do their sweeps. */
  open: [{ freq: 400, to: 900, at: 0, dur: 0.09, type: 'triangle', gain: 0.07 }],
  close: [{ freq: 900, to: 380, at: 0, dur: 0.09, type: 'triangle', gain: 0.07 }],
  minimize: [{ freq: 700, to: 300, at: 0, dur: 0.07, type: 'triangle', gain: 0.06 }],

  /* A minor second held under a fifth — the dissonance every OS reached for to
     say "no". */
  error: [
    { freq: 174.61, at: 0, dur: 0.34, type: 'square', gain: 0.06, attack: 0.006 },
    { freq: 185.0, at: 0, dur: 0.34, type: 'square', gain: 0.05, attack: 0.006 },
    { freq: 261.63, at: 0.02, dur: 0.3, type: 'square', gain: 0.035, attack: 0.006 },
  ],
};

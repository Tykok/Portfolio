import { SOUND_NAMES, SOUNDS } from 'audio/sounds';
import { describe, expect, it } from 'vitest';

describe('SOUNDS', () => {
  it('gives every named sound at least one audible tone', () => {
    for (const name of SOUND_NAMES) {
      const tones = SOUNDS[name];
      expect(tones.length, name).toBeGreaterThan(0);
      for (const tone of tones) {
        expect(tone.at, name).toBeGreaterThanOrEqual(0);
        expect(tone.dur, name).toBeGreaterThan(0);
        expect(tone.freq, name).toBeGreaterThan(0);
      }
    }
  });

  it('keeps interface feedback short enough not to overlap a fast clicker', () => {
    const end = (name: 'click' | 'menu') => Math.max(...SOUNDS[name].map((t) => t.at + t.dur));

    expect(end('click')).toBeLessThan(0.12);
    expect(end('menu')).toBeLessThan(0.12);
  });
});

/**
 * A minimal Web Audio wrapper: every sound in the OS is a handful of scheduled
 * oscillators, so nothing here loads, decodes or ships an audio file.
 *
 * The AudioContext is built on the first `play()` rather than at module load.
 * Browsers warn about — and sometimes suspend — a context created before any
 * user gesture, and jsdom has no AudioContext at all; deferring covers both.
 */

export type ToneType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface Tone {
  /** Starting frequency, in Hz. */
  freq: number;
  /** Offset from the moment `play()` is called, in seconds. */
  at: number;
  /** How long the tone sounds, in seconds. */
  dur: number;
  /** Sweep target: the frequency glides from `freq` to `to` over `dur`. */
  to?: number;
  type?: ToneType;
  /** Peak of the envelope, 0..1. */
  gain?: number;
  /** Fade-in, in seconds. Short enough to stay percussive, long enough to
      avoid the click a hard start puts on the speaker. */
  attack?: number;
}

export interface Engine {
  /**
   * Schedules the tones. Returns false when nothing was heard — the browser is
   * holding audio back until the page has been clicked, or has no Web Audio at
   * all. Callers who care can hang on to the sound and ask again later.
   */
  play(tones: readonly Tone[]): boolean;
  /**
   * Lifts a context the autoplay policy left suspended. Resolves to whether
   * audio is now audible. Safe to call on every gesture.
   */
  resume(): Promise<boolean>;
}

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor | undefined {
  const scope = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return scope.AudioContext ?? scope.webkitAudioContext;
}

const SILENCE = 0.0001;

/* Read through a call: `resume()` changes the state, and TypeScript's narrowing
   of a property it has already tested does not survive the await. */
function stateOf(target: AudioContext): AudioContextState {
  return target.state;
}

export function createEngine(): Engine {
  let ctx: AudioContext | null = null;
  /* One failed construction is enough: a browser without Web Audio will not
     grow it on the next click. */
  let unavailable = false;

  function ensureContext(): AudioContext | null {
    if (ctx || unavailable) return ctx;
    const Ctor = audioContextCtor();
    if (!Ctor) {
      unavailable = true;
      return null;
    }
    try {
      ctx = new Ctor();
    } catch {
      unavailable = true;
    }
    return ctx;
  }

  function schedule(target: AudioContext, tone: Tone, origin: number): void {
    const start = origin + tone.at;
    const end = start + tone.dur;
    const peak = tone.gain ?? 0.2;
    const attack = Math.min(tone.attack ?? 0.008, tone.dur / 2);

    const osc = target.createOscillator();
    const amp = target.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.to !== undefined) osc.frequency.exponentialRampToValueAtTime(tone.to, end);

    /* Exponential on the way out because loudness is perceived logarithmically;
       a linear fade still sounds like an abrupt cut. It cannot reach zero, so
       the tail lands on SILENCE and the oscillator stops there. */
    amp.gain.setValueAtTime(SILENCE, start);
    amp.gain.linearRampToValueAtTime(peak, start + attack);
    amp.gain.exponentialRampToValueAtTime(SILENCE, end);

    osc.connect(amp);
    amp.connect(target.destination);
    osc.start(start);
    osc.stop(end);
  }

  return {
    play(tones) {
      const target = ensureContext();
      if (!target) return false;
      /* A suspended context has a frozen clock, so anything scheduled against
         it fires whenever the browser finally lets go — the boot chime landing
         over the desktop, minutes late. Silence now, and let the caller decide
         whether the sound is still worth playing once audio opens up. */
      if (stateOf(target) === 'suspended') return false;
      try {
        const origin = target.currentTime;
        for (const tone of tones) schedule(target, tone, origin);
        return true;
      } catch {
        /* A context killed mid-flight (tab suspended, device unplugged) must
           never take a click handler down with it. */
        return false;
      }
    },
    async resume() {
      /* No context yet means nothing is being held back: the next play() builds
         one, and under a gesture it is born running. */
      if (!ctx) return !unavailable;
      if (stateOf(ctx) !== 'suspended') return true;
      try {
        await ctx.resume();
      } catch {
        return false;
      }
      return stateOf(ctx) === 'running';
    },
  };
}

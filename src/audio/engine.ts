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

/** A sound in its two forms: the visitor's sample, and the built-in stand-in. */
export interface Playable {
  /** Sample URL. Played when it was found; ignored when it was not. */
  file?: string;
  tones: readonly Tone[];
}

export interface Engine {
  /**
   * Plays the sample if it is loaded, and the tones otherwise. Returns false
   * when nothing was heard — the browser is holding audio back until the page
   * has been clicked, or has no Web Audio at all. Callers who care can hang on
   * to the sound and ask again later.
   */
  play(sound: Playable): boolean;
  /**
   * Fetches sample files, without touching the audio hardware: decoding waits
   * for a context, which waits for a gesture. Missing files are not an error —
   * the tones cover them.
   */
  preload(files: readonly string[]): void;
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

/* Samples carry their own recorded level, which is far hotter than the tones
   above. Trimming them keeps a click from jumping out of the mix. */
const SAMPLE_GAIN = 0.55;

/* Read through a call: `resume()` changes the state, and TypeScript's narrowing
   of a property it has already tested does not survive the await. */
function stateOf(target: AudioContext): AudioContextState {
  return target.state;
}

export function createEngine(): Engine {
  let ctx: AudioContext | null = null;
  /** Fetched bytes, waiting for a context to decode them. */
  const encoded = new Map<string, ArrayBuffer>();
  const decoded = new Map<string, AudioBuffer>();
  /** Files that are absent, unreadable or undecodable: never asked for twice. */
  const missing = new Set<string>();
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

  /** Turns whatever bytes have arrived into buffers. Needs a live context. */
  async function decodePending(target: AudioContext): Promise<void> {
    const waiting = [...encoded.entries()];
    encoded.clear();
    await Promise.all(
      waiting.map(async ([file, bytes]) => {
        try {
          decoded.set(file, await target.decodeAudioData(bytes));
        } catch {
          missing.add(file);
        }
      }),
    );
  }

  function playSample(target: AudioContext, buffer: AudioBuffer): void {
    const source = target.createBufferSource();
    const amp = target.createGain();
    source.buffer = buffer;
    amp.gain.setValueAtTime(SAMPLE_GAIN, target.currentTime);
    source.connect(amp);
    amp.connect(target.destination);
    source.start(target.currentTime);
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
    preload(files) {
      for (const file of files) {
        if (encoded.has(file) || decoded.has(file) || missing.has(file)) continue;
        /* Marked missing up front: a fetch that never resolves must not leave
           the file looking like it is still on its way. */
        missing.add(file);
        void (async () => {
          try {
            const response = await fetch(file);
            if (!response.ok) return;
            encoded.set(file, await response.arrayBuffer());
            missing.delete(file);
            if (ctx) await decodePending(ctx);
          } catch {
            /* No file, no network, no decoder — the tones cover all three. */
          }
        })();
      }
    },

    play(sound) {
      const target = ensureContext();
      if (!target) return false;
      /* A suspended context has a frozen clock, so anything scheduled against
         it fires whenever the browser finally lets go — the boot chime landing
         over the desktop, minutes late. Silence now, and let the caller decide
         whether the sound is still worth playing once audio opens up. */
      if (stateOf(target) === 'suspended') return false;
      try {
        const buffer = sound.file ? decoded.get(sound.file) : undefined;
        if (buffer) {
          playSample(target, buffer);
          return true;
        }
        const origin = target.currentTime;
        for (const tone of sound.tones) schedule(target, tone, origin);
        return true;
      } catch {
        /* A context killed mid-flight (tab suspended, device unplugged) must
           never take a click handler down with it. */
        return false;
      }
    },
    async resume() {
      /* A gesture is the one moment the browser lets us both open the hardware
         and get samples decoded, so do both here and report back only once the
         next play() can actually be heard. */
      const target = ensureContext();
      if (!target) return false;
      if (stateOf(target) === 'suspended') {
        try {
          await target.resume();
        } catch {
          return false;
        }
      }
      if (stateOf(target) !== 'running') return false;
      await decodePending(target);
      return true;
    },
  };
}

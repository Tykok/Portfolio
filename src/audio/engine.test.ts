import { createEngine } from 'audio/engine';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeParam {
  value = 0;
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class FakeOscillator {
  type = 'sine';
  frequency = new FakeParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeGain {
  gain = new FakeParam();
  connect = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  /** What the browser hands back on construction: Chrome suspends until a gesture. */
  static bornSuspended = false;
  currentTime = 10;
  state: 'running' | 'suspended' = 'running';
  destination = {};
  oscillators: FakeOscillator[] = [];
  gains: FakeGain[] = [];
  resume = vi.fn(() => {
    this.state = 'running';
    return Promise.resolve();
  });

  constructor() {
    if (FakeAudioContext.bornSuspended) this.state = 'suspended';
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const osc = new FakeOscillator();
    this.oscillators.push(osc);
    return osc;
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
}

function installFakeAudio(): void {
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
}

describe('createEngine', () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    FakeAudioContext.bornSuspended = false;
  });

  afterEach(() => {
    delete (window as unknown as { AudioContext?: unknown }).AudioContext;
  });

  it('builds no AudioContext before the first sound is played', () => {
    installFakeAudio();

    createEngine();

    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('reuses a single AudioContext across plays', () => {
    installFakeAudio();
    const engine = createEngine();

    engine.play([{ freq: 440, at: 0, dur: 0.1 }]);
    engine.play([{ freq: 880, at: 0, dur: 0.1 }]);

    expect(FakeAudioContext.instances).toHaveLength(1);
  });

  it('schedules one oscillator per tone, offset from the context clock', () => {
    installFakeAudio();
    const engine = createEngine();

    engine.play([
      { freq: 440, at: 0, dur: 0.2 },
      { freq: 660, at: 0.25, dur: 0.3, type: 'square' },
    ]);

    const ctx = FakeAudioContext.instances[0];
    expect(ctx.oscillators).toHaveLength(2);
    expect(ctx.oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(440, 10);
    expect(ctx.oscillators[0].start).toHaveBeenCalledWith(10);
    expect(ctx.oscillators[0].stop).toHaveBeenCalledWith(10.2);
    expect(ctx.oscillators[1].type).toBe('square');
    expect(ctx.oscillators[1].start).toHaveBeenCalledWith(10.25);
  });

  it('ramps the frequency when a tone declares a sweep target', () => {
    installFakeAudio();
    const engine = createEngine();

    engine.play([{ freq: 400, to: 900, at: 0, dur: 0.09 }]);

    const osc = FakeAudioContext.instances[0].oscillators[0];
    expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(900, 10.09);
  });

  it('resumes a context the browser left suspended', async () => {
    installFakeAudio();
    const engine = createEngine();
    engine.play([{ freq: 440, at: 0, dur: 0.1 }]);
    const ctx = FakeAudioContext.instances[0];
    ctx.state = 'suspended';

    await engine.resume();

    expect(ctx.resume).toHaveBeenCalled();
  });

  it('reports an audible play on a running context', () => {
    installFakeAudio();
    const engine = createEngine();

    expect(engine.play([{ freq: 440, at: 0, dur: 0.1 }])).toBe(true);
  });

  it('refuses to schedule into a context the autoplay policy suspended', () => {
    // Scheduling anyway is worse than silence: a suspended context's clock is
    // frozen, so the notes would fire whenever it finally resumes — long after
    // the moment they were meant for.
    FakeAudioContext.bornSuspended = true;
    installFakeAudio();
    const engine = createEngine();

    const heard = engine.play([{ freq: 440, at: 0, dur: 0.1 }]);

    expect(heard).toBe(false);
    expect(FakeAudioContext.instances[0].oscillators).toHaveLength(0);
  });

  it('resolves resume once the context actually runs', async () => {
    FakeAudioContext.bornSuspended = true;
    installFakeAudio();
    const engine = createEngine();
    engine.play([{ freq: 440, at: 0, dur: 0.1 }]);

    await expect(engine.resume()).resolves.toBe(true);
    expect(engine.play([{ freq: 440, at: 0, dur: 0.1 }])).toBe(true);
  });

  it('resolves resume with nothing to lift before the first sound', async () => {
    installFakeAudio();
    const engine = createEngine();

    await expect(engine.resume()).resolves.toBe(true);
  });

  it('reports no play at all when the browser exposes no AudioContext', () => {
    const engine = createEngine();

    expect(engine.play([{ freq: 440, at: 0, dur: 0.1 }])).toBe(false);
  });

  it('stays silent when the browser exposes no AudioContext', () => {
    const engine = createEngine();

    expect(() => engine.play([{ freq: 440, at: 0, dur: 0.1 }])).not.toThrow();
  });

  it('stays silent when the browser refuses to build a context', () => {
    (window as unknown as { AudioContext: unknown }).AudioContext = function Blocked() {
      throw new Error('autoplay policy');
    };
    const engine = createEngine();

    expect(() => engine.play([{ freq: 440, at: 0, dur: 0.1 }])).not.toThrow();
  });
});

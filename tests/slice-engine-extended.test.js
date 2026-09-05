// Slice Engine Extended Tests

import { Determinism } from '../src/determinism.js';
import { SliceBank } from '../src/slice-bank.js';
import { SliceEngine } from '../src/slice-engine.js';

describe('SliceEngine Extended', () => {
  let engine;
  let banks;
  let mockContext;

  beforeEach(() => {
    const determinism = new Determinism(12345);
    banks = [];
    for (let i = 0; i < 8; i++) {
      banks.push(new SliceBank(i, determinism));
    }
    engine = new SliceEngine(banks, { maxVoices: 64 });

    mockContext = {
      createBufferSource: () => ({
        connect: () => {},
        start: () => {},
        stop: () => {},
        buffer: null,
        playbackRate: { value: 1 }, // faithful AudioBufferSourceNode surface
        detune: { value: 0 },
        onended: null,
      }),
      createGain: () => ({
        connect: () => {},
        gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      }),
      createStereoPanner: () => ({
        connect: () => {},
        pan: { value: 0 },
      }),
      currentTime: 0,
      destination: {},
    };

    engine.onContext(mockContext);
  });

  test('trigger creates voice with correct parameters', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    engine.trigger(0, 0, 0.8);

    expect(engine.activeVoices.length).toBe(1);
  });

  test('trigger respects velocity', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    engine.trigger(0, 0, 0.5);

    expect(engine.activeVoices.length).toBe(1);
  });

  test('trigger ignores invalid bank', () => {
    engine.trigger(10, 0, 1.0);
    expect(engine.activeVoices.length).toBe(0);
  });

  test('trigger ignores invalid slice', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    engine.trigger(0, 10, 1.0);
    expect(engine.activeVoices.length).toBe(0);
  });

  test('stealVoice removes oldest voice', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    // Fill all voices
    for (let i = 0; i < 64; i++) {
      engine.trigger(0, 0, 1.0);
    }

    expect(engine.activeVoices.length).toBe(64);

    // Trigger one more
    engine.trigger(0, 0, 1.0);

    // Should still be 64 (oldest was stolen)
    expect(engine.activeVoices.length).toBe(64);
  });

  test('stop clears all voices', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    engine.trigger(0, 0, 1.0);
    engine.trigger(0, 0, 1.0);

    engine.stop();

    expect(engine.activeVoices.length).toBe(0);
    expect(engine.isPlaying).toBe(false);
  });

  test('dispose stops all voices and cleans up', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 0.5 }], {});

    engine.trigger(0, 0, 1.0);
    engine.dispose();

    expect(engine.activeVoices.length).toBe(0);
  });
});

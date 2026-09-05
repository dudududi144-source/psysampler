// Slice Engine Tests

import { Determinism } from '../src/determinism.js';
import { SliceBank } from '../src/slice-bank.js';
import { SliceEngine } from '../src/slice-engine.js';

describe('SliceEngine', () => {
  let engine;
  let banks;

  beforeEach(() => {
    const determinism = new Determinism(12345);
    banks = [];
    for (let i = 0; i < 8; i++) {
      banks.push(new SliceBank(i, determinism));
    }
    engine = new SliceEngine(banks, { maxVoices: 64 });
  });

  test('initializes with correct config', () => {
    expect(engine.banks).toBe(banks);
    expect(engine.maxVoices).toBe(64);
    expect(engine.activeVoices).toEqual([]);
  });

  test('play sets isPlaying', () => {
    engine.play();
    expect(engine.isPlaying).toBe(true);
  });

  test('stop clears isPlaying and voices', () => {
    engine.play();
    engine.stop();
    expect(engine.isPlaying).toBe(false);
    expect(engine.activeVoices).toEqual([]);
  });

  test('trigger does nothing if bank has no loop', () => {
    engine.trigger(0, 0, 1.0);
    expect(engine.activeVoices).toEqual([]);
  });

  test('trigger creates voice when bank has loop', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 1 }], {});

    // Mock context
    engine.context = {
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

    engine.trigger(0, 0, 1.0);
    expect(engine.activeVoices.length).toBeGreaterThan(0);
  });

  test('steals oldest voice when max reached', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    banks[0].load(mockBuffer, [{ start: 0, end: 1 }], {});

    // Mock context
    engine.context = {
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

  test('dispose stops all voices', () => {
    engine.play();
    engine.dispose();
    expect(engine.isPlaying).toBe(false);
    expect(engine.activeVoices).toEqual([]);
  });
});

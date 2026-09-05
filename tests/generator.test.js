// Generator Tests

import { Determinism } from '../src/determinism.js';
import { LoopGenerator } from '../src/generator.js';

describe('LoopGenerator', () => {
  let generator;
  let determinism;

  beforeEach(() => {
    determinism = new Determinism(12345);
    generator = new LoopGenerator(determinism);
  });

  test('generates melodic loop', async () => {
    const result = await generator.generate('melodic', {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('melodic');
    expect(result.config.bpm).toBe(140);
  });

  test('generates rhythmic loop', async () => {
    const result = await generator.generate('rhythmic', {
      bpm: 128,
      bars: 4,
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('rhythmic');
  });

  test('generates bass loop', async () => {
    const result = await generator.generate('bass', {
      bpm: 140,
      bars: 4,
      key: 'A',
      scale: 'minor',
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('bass');
  });

  test('generates fx loop', async () => {
    const result = await generator.generate('fx', {
      bpm: 140,
      bars: 4,
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('fx');
  });

  test('generates chord loop', async () => {
    const result = await generator.generate('chord', {
      bpm: 140,
      bars: 4,
      key: 'G',
      scale: 'major',
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('chord');
  });

  test('generates atmospheric loop', async () => {
    const result = await generator.generate('atmospheric', {
      bpm: 140,
      bars: 4,
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('atmospheric');
  });

  test('throws error for unknown type', async () => {
    await expect(generator.generate('unknown')).rejects.toThrow('Unknown loop type');
  });

  test('midiToFreq converts correctly', () => {
    expect(generator.midiToFreq(69)).toBe(440);
    expect(generator.midiToFreq(60)).toBeCloseTo(261.63, 2);
  });

  test('adsrEnvelope has correct shape', () => {
    expect(generator.adsrEnvelope(0)).toBe(0);
    expect(generator.adsrEnvelope(0.5)).toBeGreaterThan(0.7);
    expect(generator.adsrEnvelope(1)).toBeLessThan(0.1);
  });
});

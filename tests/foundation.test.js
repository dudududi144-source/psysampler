// Foundation Integration Tests

import { FoundationIntegration } from '../src/foundation-integration.js';

describe('FoundationIntegration', () => {
  let foundation;

  beforeEach(() => {
    foundation = new FoundationIntegration();
  });

  test('initializes with available=false', () => {
    expect(foundation.available).toBe(false);
  });

  test('getScales returns 9 scales', () => {
    const scales = foundation.getScales();
    expect(Object.keys(scales).length).toBe(9);
  });

  test('each scale has 7 notes', () => {
    const scales = foundation.getScales();
    Object.values(scales).forEach(scale => {
      expect(scale.length).toBe(7);
    });
  });

  test('getProgressions returns 8 progressions', () => {
    const progressions = foundation.getProgressions();
    expect(Object.keys(progressions).length).toBe(8);
  });

  test('each progression has valid chords', () => {
    const progressions = foundation.getProgressions();
    Object.values(progressions).forEach(prog => {
      expect(prog.length).toBeGreaterThan(0);
      prog.forEach(chord => {
        expect(chord).toBeGreaterThanOrEqual(0);
        expect(chord).toBeLessThan(7);
      });
    });
  });

  test('getMotifTransformer returns transformer', () => {
    const transformer = foundation.getMotifTransformer();
    expect(transformer).toBeDefined();
    expect(transformer.transform).toBeDefined();
  });

  test('getDSP returns DSP primitives', () => {
    const dsp = foundation.getDSP();
    expect(dsp).toBeDefined();
    expect(dsp).toHaveProperty('zdfSVF');
    expect(dsp).toHaveProperty('polyBLEP');
    expect(dsp).toHaveProperty('fft');
    expect(dsp).toHaveProperty('lufs');
  });
});

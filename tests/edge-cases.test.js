// Edge Case Tests

import { LoopAnalyzer } from '../src/analyzer.js';
import { Determinism } from '../src/determinism.js';
import { StepSequencer } from '../src/sequencer.js';

describe('Edge Cases', () => {
  test('Determinism handles seed 0', () => {
    const det = new Determinism(0);
    expect(det.next()).toBeGreaterThanOrEqual(0);
    expect(det.next()).toBeLessThan(1);
  });

  test('Determinism handles negative seed', () => {
    const det = new Determinism(-1);
    expect(det.next()).toBeGreaterThanOrEqual(0);
    expect(det.next()).toBeLessThan(1);
  });

  test('Determinism handles very large seed', () => {
    const det = new Determinism(2147483647);
    expect(det.next()).toBeGreaterThanOrEqual(0);
    expect(det.next()).toBeLessThan(1);
  });

  test('LoopAnalyzer handles empty buffer', () => {
    const analyzer = new LoopAnalyzer();
    const data = new Float32Array(0);

    const rms = analyzer.calculateRMS(data);
    expect(rms).toBe(0);
  });

  test('LoopAnalyzer handles single sample', () => {
    const analyzer = new LoopAnalyzer();
    const data = new Float32Array([0.5]);

    const rms = analyzer.calculateRMS(data);
    expect(rms).toBe(0.5);
  });

  test('LoopAnalyzer handles all zeros', () => {
    const analyzer = new LoopAnalyzer();
    const data = new Float32Array(100);

    const rms = analyzer.calculateRMS(data);
    expect(rms).toBe(0);

    const peak = analyzer.calculatePeak(data);
    expect(peak).toBe(0);
  });

  test('LoopAnalyzer handles all ones', () => {
    const analyzer = new LoopAnalyzer();
    const data = new Float32Array(100).fill(1.0);

    const rms = analyzer.calculateRMS(data);
    expect(rms).toBe(1.0);

    const peak = analyzer.calculatePeak(data);
    expect(peak).toBe(1.0);
  });

  test('LoopAnalyzer handles NaN values', () => {
    const analyzer = new LoopAnalyzer();
    const data = new Float32Array([Number.NaN, 0.5, Number.NaN]);

    // Should not throw
    expect(() => analyzer.calculateRMS(data)).not.toThrow();
  });

  test('StepSequencer handles invalid track index', () => {
    const seq = new StepSequencer(16, 8);

    expect(seq.getStep(-1, 0)).toBeNull();
    expect(seq.getStep(100, 0)).toBeNull();
    expect(seq.getStep(0, -1)).toBeNull();
    expect(seq.getStep(0, 100)).toBeNull();
  });

  test('StepSequencer setStep ignores invalid indices', () => {
    const seq = new StepSequencer(16, 8);

    // Should not throw
    expect(() => seq.setStep(-1, 0, true)).not.toThrow();
    expect(() => seq.setStep(100, 0, true)).not.toThrow();
    expect(() => seq.setStep(0, -1, true)).not.toThrow();
    expect(() => seq.setStep(0, 100, true)).not.toThrow();
  });

  test('Determinism pick handles empty array', () => {
    const det = new Determinism(12345);
    expect(det.pick([])).toBeNull();
  });

  test('Determinism nextInt handles same min and max', () => {
    const det = new Determinism(12345);
    expect(det.nextInt(5, 5)).toBe(5);
  });

  test('Determinism nextFloat handles same min and max', () => {
    const det = new Determinism(12345);
    expect(det.nextFloat(0.5, 0.5)).toBe(0.5);
  });
});

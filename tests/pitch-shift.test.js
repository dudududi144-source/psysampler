// Pitch Shift Tests

import { PitchShifter } from '../src/pitch-shift.js';

describe('PitchShifter', () => {
  let shifter;

  beforeEach(() => {
    shifter = new PitchShifter(48000);
  });

  test('initializes with correct sample rate', () => {
    expect(shifter.sampleRate).toBe(48000);
  });

  test('shift returns same buffer for 0 semitones', () => {
    const buffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1000 / 48000,
    };

    const result = shifter.shift(buffer, 0);
    expect(result).toBe(buffer);
  });

  test('shift maintains length', () => {
    const inputData = new Float32Array(1000);
    const buffer = {
      getChannelData: () => inputData,
      sampleRate: 48000,
      duration: 1000 / 48000,
    };

    const result = shifter.shift(buffer, 7);
    expect(result.duration).toBeCloseTo(1000 / 48000, 3);
  });

  test('resample upsamples for ratio > 1', () => {
    const data = [1, 2, 3, 4, 5];
    const resampled = shifter.resample(data, 2.0);

    expect(resampled.length).toBe(2);
  });

  test('resample downsamples for ratio < 1', () => {
    const data = [1, 2, 3, 4, 5];
    const resampled = shifter.resample(data, 0.5);

    expect(resampled.length).toBe(10);
  });

  test('resample interpolates correctly', () => {
    const data = [0, 1, 0];
    const resampled = shifter.resample(data, 1.5);

    // Should interpolate between samples
    expect(resampled[0]).toBe(0);
    expect(resampled[1]).toBeCloseTo(0.5, 1);
  });

  test('createBuffer returns valid buffer', () => {
    const data = new Float32Array(100);
    const buffer = shifter.createBuffer(data, 48000);

    expect(buffer.sampleRate).toBe(48000);
    expect(buffer.numberOfChannels).toBe(1);
  });

  test('formantPreserve returns buffer', () => {
    const inputData = new Float32Array(1000);
    const buffer = {
      getChannelData: () => inputData,
      sampleRate: 48000,
      duration: 1000 / 48000,
    };

    const result = shifter.formantPreserve(buffer, 5);
    expect(result).toBeDefined();
    expect(result.sampleRate).toBe(48000);
  });
});

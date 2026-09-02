// Time Stretch Tests

import { TimeStretcher } from '../src/time-stretch.js';

describe('TimeStretcher', () => {
  let stretcher;

  beforeEach(() => {
    stretcher = new TimeStretcher(48000);
  });

  test('initializes with correct sample rate', () => {
    expect(stretcher.sampleRate).toBe(48000);
  });

  test('stretch returns same buffer for ratio 1.0', () => {
    const buffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1000 / 48000
    };
    
    const result = stretcher.stretch(buffer, 1.0);
    expect(result).toBe(buffer);
  });

  test('stretch doubles length for ratio 2.0', () => {
    const inputData = new Float32Array(1000);
    for (let i = 0; i < inputData.length; i++) {
      inputData[i] = Math.sin(2 * Math.PI * 440 * (i / 48000));
    }
    
    const buffer = {
      getChannelData: () => inputData,
      sampleRate: 48000,
      duration: 1000 / 48000
    };
    
    const result = stretcher.stretch(buffer, 2.0);
    expect(result.duration).toBeCloseTo(2000 / 48000, 3);
  });

  test('stretch halves length for ratio 0.5', () => {
    const inputData = new Float32Array(1000);
    const buffer = {
      getChannelData: () => inputData,
      sampleRate: 48000,
      duration: 1000 / 48000
    };
    
    const result = stretcher.stretch(buffer, 0.5);
    expect(result.duration).toBeCloseTo(500 / 48000, 3);
  });

  test('correlate calculates similarity', () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 2, 3, 4, 5];
    
    const correlation = stretcher.correlate(a, b);
    expect(correlation).toBe(11);
  });

  test('correlate returns 0 for orthogonal signals', () => {
    const a = [1, 0, 0, 0];
    const b = [0, 1, 0, 0];
    
    const correlation = stretcher.correlate(a, b);
    expect(correlation).toBe(0);
  });

  test('fft returns spectrum', () => {
    const data = new Float32Array(100);
    const spectrum = stretcher.fft(data);
    
    expect(spectrum.length).toBe(50);
    expect(spectrum[0].mag).toBeDefined();
    expect(spectrum[0].phase).toBeDefined();
  });

  test('ifft returns time domain', () => {
    const spectrum = [
      { mag: 1, phase: 0 },
      { mag: 0.5, phase: Math.PI / 4 }
    ];
    
    const output = stretcher.ifft(spectrum);
    expect(output.length).toBe(4);
  });

  test('createBuffer returns valid buffer', () => {
    const data = new Float32Array(100);
    const buffer = stretcher.createBuffer(data, 48000);
    
    expect(buffer.sampleRate).toBe(48000);
    expect(buffer.duration).toBeCloseTo(100 / 48000, 3);
    expect(buffer.numberOfChannels).toBe(1);
  });
});

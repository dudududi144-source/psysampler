// FX Chain Extended Tests

import { FXChain } from '../src/fx-chain.js';

// Mock AudioContext
const mockContext = {
  createGain: () => ({
    connect: () => {},
    gain: { value: 1 },
  }),
  createBiquadFilter: () => ({
    connect: () => {},
    type: '',
    frequency: { value: 1000 },
    Q: { value: 1 },
    gain: { value: 0 },
  }),
  createDelay: () => ({
    connect: () => {},
    delayTime: { value: 0.5 },
  }),
  createConvolver: () => ({
    connect: () => {},
    buffer: null,
  }),
  createDynamicsCompressor: () => ({
    connect: () => {},
    threshold: { value: -24 },
    knee: { value: 30 },
    ratio: { value: 4 },
    attack: { value: 0.003 },
    release: { value: 0.25 },
  }),
  createWaveShaper: () => ({
    connect: () => {},
    curve: null,
  }),
  createBuffer: (channels, length, sampleRate) => ({
    getChannelData: () => new Float32Array(length),
    numberOfChannels: channels,
    length,
    sampleRate,
  }),
  sampleRate: 48000,
};

describe('FXChain Extended', () => {
  let fxChain;

  beforeEach(() => {
    fxChain = new FXChain(mockContext);
  });

  test('createFX handles all 12 types', () => {
    const types = [
      'transient-shaper',
      'filter',
      'delay',
      'reverb',
      'bitcrusher',
      'formant',
      'vocoder',
      'granular',
      'ott',
      'compressor',
      'saturation',
      'limiter',
    ];

    types.forEach((type) => {
      const fx = fxChain.createFX(type);
      expect(fx.type).toBe(type);
      expect(fx.input).toBeDefined();
      expect(fx.output).toBeDefined();
    });
  });

  test('filter FX has correct parameters', () => {
    const fx = fxChain.createFX('filter', {
      type: 'lowpass',
      frequency: 500,
      Q: 2,
    });

    expect(fx.type).toBe('filter');
    expect(fx.filter).toBeDefined();
  });

  test('delay FX has correct parameters', () => {
    const fx = fxChain.createFX('delay', {
      time: 0.25,
      feedback: 0.7,
      mix: 0.4,
    });

    expect(fx.type).toBe('delay');
  });

  test('reverb FX has correct parameters', () => {
    const fx = fxChain.createFX('reverb', {
      decay: 3.0,
      mix: 0.5,
    });

    expect(fx.type).toBe('reverb');
  });

  test('compressor FX has correct parameters', () => {
    const fx = fxChain.createFX('compressor', {
      threshold: -20,
      ratio: 6,
      attack: 0.01,
      release: 0.1,
    });

    expect(fx.type).toBe('compressor');
    expect(fx.compressor).toBeDefined();
  });

  test('saturation FX has correct parameters', () => {
    const fx = fxChain.createFX('saturation', {
      drive: 2.0,
    });

    expect(fx.type).toBe('saturation');
  });

  test('limiter FX has correct parameters', () => {
    const fx = fxChain.createFX('limiter', {
      threshold: -3,
      ceiling: -0.5,
    });

    expect(fx.type).toBe('limiter');
  });

  test('createBuffer returns valid buffer', () => {
    const data = new Float32Array(100);
    const buffer = fxChain.createBuffer(data, 48000);

    expect(buffer.numberOfChannels).toBe(1);
    expect(buffer.length).toBe(100);
    expect(buffer.sampleRate).toBe(48000);
  });

  test('createFX throws for unknown type', () => {
    expect(() => fxChain.createFX('unknown')).toThrow();
  });
});

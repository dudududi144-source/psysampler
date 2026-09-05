// FX Chain Tests

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

describe('FXChain', () => {
  let fxChain;

  beforeEach(() => {
    fxChain = new FXChain(mockContext);
  });

  test('creates filter effect', () => {
    const fx = fxChain.createFX('filter', {
      type: 'lowpass',
      frequency: 1000,
      Q: 1,
    });

    expect(fx.type).toBe('filter');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('creates delay effect', () => {
    const fx = fxChain.createFX('delay', {
      time: 0.5,
      feedback: 0.5,
      mix: 0.5,
    });

    expect(fx.type).toBe('delay');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('creates reverb effect', () => {
    const fx = fxChain.createFX('reverb', {
      decay: 2.0,
      mix: 0.3,
    });

    expect(fx.type).toBe('reverb');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('creates compressor effect', () => {
    const fx = fxChain.createFX('compressor', {
      threshold: -24,
      ratio: 4,
    });

    expect(fx.type).toBe('compressor');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('creates saturation effect', () => {
    const fx = fxChain.createFX('saturation', {
      drive: 1.5,
    });

    expect(fx.type).toBe('saturation');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('creates limiter effect', () => {
    const fx = fxChain.createFX('limiter', {
      threshold: -1,
    });

    expect(fx.type).toBe('limiter');
    expect(fx.input).toBeDefined();
    expect(fx.output).toBeDefined();
  });

  test('throws error for unknown FX type', () => {
    expect(() => fxChain.createFX('unknown')).toThrow('Unknown FX type');
  });

  test('creates all 12 FX types', () => {
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
    });
  });
});

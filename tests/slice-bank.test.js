// Slice Bank Tests

import { Determinism } from '../src/determinism.js';
import { SliceBank } from '../src/slice-bank.js';

describe('SliceBank', () => {
  let bank;
  let determinism;

  beforeEach(() => {
    determinism = new Determinism(12345);
    bank = new SliceBank(0, determinism);
  });

  test('initializes with empty state', () => {
    expect(bank.index).toBe(0);
    expect(bank.slices.length).toBe(0);
    expect(bank.hasLoop).toBe(false);
  });

  test('load sets audio and slices', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [
      { start: 0, end: 0.5 },
      { start: 0.5, end: 1.0 },
    ];

    bank.load(mockBuffer, slices, {});

    expect(bank.hasLoop).toBe(true);
    expect(bank.slices.length).toBe(2);
  });

  test('getSlice returns slice data', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [{ start: 0, end: 0.5 }];
    bank.load(mockBuffer, slices, {});

    const slice = bank.getSlice(0);
    expect(slice).toBeDefined();
    expect(slice.start).toBe(0);
    expect(slice.end).toBe(0.5);
  });

  test('getSlice returns null for invalid index', () => {
    expect(bank.getSlice(0)).toBeNull();
    expect(bank.getSlice(-1)).toBeNull();
    expect(bank.getSlice(100)).toBeNull();
  });

  test('getSliceInfo returns slice info', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [{ start: 0, end: 0.5 }];
    bank.load(mockBuffer, slices, {});

    const info = bank.getSliceInfo(0);
    expect(info).toBeDefined();
    expect(info.index).toBe(0);
    expect(info.start).toBe(0);
    expect(info.end).toBe(0.5);
    expect(info.duration).toBe(0.5);
  });

  test('setSliceParam sets parameter', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [{ start: 0, end: 0.5 }];
    bank.load(mockBuffer, slices, {});

    bank.setSliceParam(0, 'volume', 0.8);

    const slice = bank.getSlice(0);
    expect(slice.volume).toBe(0.8);
  });

  test('getInfo returns bank info', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [{ start: 0, end: 0.5 }];
    bank.load(mockBuffer, slices, {});

    const info = bank.getInfo();
    expect(info.index).toBe(0);
    expect(info.hasLoop).toBe(true);
    expect(info.numSlices).toBe(1);
  });

  test('export and import preserve state', () => {
    const mockBuffer = {
      getChannelData: () => new Float32Array(1000),
      sampleRate: 48000,
      duration: 1,
    };

    const slices = [{ start: 0, end: 0.5 }];
    bank.load(mockBuffer, slices, {});
    bank.setSliceParam(0, 'volume', 0.8);

    const exported = bank.export();

    const newBank = new SliceBank(1, determinism);
    newBank.import(exported);

    expect(newBank.hasLoop).toBe(true);
    expect(newBank.slices.length).toBe(1);
  });
});

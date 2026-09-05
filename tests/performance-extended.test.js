// Performance Extended Tests

import { PerformanceMode } from '../src/performance.js';

// Mock device
const mockDevice = {
  triggerSlice: () => {},
  setBank: () => {},
  play: () => {},
  stop: () => {},
  currentBank: 0,
};

describe('PerformanceMode Extended', () => {
  let perf;

  beforeEach(() => {
    perf = new PerformanceMode(mockDevice);
  });

  test('setPad and getPad work', () => {
    const config = { type: 'slice', bank: 0, slice: 0 };
    perf.setPad(0, config);

    expect(perf.getPad(0)).toEqual(config);
  });

  test('triggerPad handles different pad types', () => {
    // Slice pad
    perf.setPad(0, { type: 'slice', bank: 0, slice: 0 });
    perf.triggerPad(0, 1.0);

    // Loop pad
    perf.setPad(1, { type: 'loop', bank: 0 });
    perf.triggerPad(1, 1.0);

    // FX pad
    perf.setPad(2, { type: 'fx', fxType: 'riser' });
    perf.triggerPad(2, 1.0);

    // Macro pad
    perf.setPad(3, { type: 'macro', macroIndex: 0 });
    perf.triggerPad(3, 1.0);
  });

  test('setMode validates mode', () => {
    perf.setMode('one-shot');
    expect(perf.activeMode).toBe('one-shot');

    perf.setMode('loop');
    expect(perf.activeMode).toBe('loop');

    perf.setMode('gate');
    expect(perf.activeMode).toBe('gate');

    perf.setMode('slice-sequencer');
    expect(perf.activeMode).toBe('slice-sequencer');

    perf.setMode('invalid');
    expect(perf.activeMode).toBe('slice-sequencer');
  });

  test('setXY clamps values', () => {
    perf.setXY(-0.5, 1.5);
    expect(perf.xyPad.x).toBe(0);
    expect(perf.xyPad.y).toBe(1);

    perf.setXY(0.5, 0.5);
    expect(perf.xyPad.x).toBe(0.5);
    expect(perf.xyPad.y).toBe(0.5);
  });

  test('quantizeEvents quantizes correctly', () => {
    const events = [
      { time: 0.1, note: 60 },
      { time: 0.35, note: 62 },
      { time: 0.6, note: 64 },
    ];

    const quantized = perf.quantizeEvents(events, 16);

    expect(quantized[0].time).toBeCloseTo(0.125, 3);
    expect(quantized[1].time).toBeCloseTo(0.375, 3);
    expect(quantized[2].time).toBeCloseTo(0.625, 3);
  });

  test('humanizeEvents adds variation', () => {
    const events = [
      { time: 0.25, note: 60 },
      { time: 0.5, note: 62 },
    ];

    const humanized = perf.humanizeEvents(events, 0.1);

    expect(humanized[0].time).not.toBe(0.25);
    expect(humanized[1].time).not.toBe(0.5);
  });

  test('exportPerformance returns complete state', () => {
    perf.setPad(0, { type: 'slice', bank: 0, slice: 0 });
    perf.setXY(0.3, 0.7);

    const exported = perf.exportPerformance();

    expect(exported.pads).toBeDefined();
    expect(exported.macros).toBeDefined();
    expect(exported.xyPad).toBeDefined();
    expect(exported.mode).toBeDefined();
  });

  test('importPerformance restores state', () => {
    const data = {
      pads: new Array(64).fill(null),
      macros: new Array(8).fill(null),
      xyPad: { x: 0.5, y: 0.5 },
      mode: 'loop',
    };

    data.pads[0] = { type: 'slice', bank: 0, slice: 0 };

    perf.importPerformance(data);

    expect(perf.pads[0]).toEqual({ type: 'slice', bank: 0, slice: 0 });
    expect(perf.activeMode).toBe('loop');
  });
});

// Performance Mode Tests

import { PerformanceMode } from '../src/performance.js';

// Mock device
const mockDevice = {
  triggerSlice: jest.fn(),
  setBank: jest.fn(),
  play: jest.fn(),
  stop: jest.fn(),
  currentBank: 0
};

describe('PerformanceMode', () => {
  let perf;

  beforeEach(() => {
    perf = new PerformanceMode(mockDevice);
    jest.clearAllMocks();
  });

  test('initializes with 64 pads', () => {
    expect(perf.pads.length).toBe(64);
  });

  test('initializes with 8 macros', () => {
    expect(perf.macros.length).toBe(8);
  });

  test('initializes with default mode', () => {
    expect(perf.activeMode).toBe('one-shot');
  });

  test('setPad stores pad config', () => {
    const config = { type: 'slice', bank: 0, slice: 0 };
    perf.setPad(0, config);
    expect(perf.getPad(0)).toEqual(config);
  });

  test('setPad ignores invalid index', () => {
    perf.setPad(100, { type: 'slice' });
    expect(perf.getPad(100)).toBeNull();
  });

  test('triggerPad calls device for slice pad', () => {
    perf.setPad(0, { type: 'slice', bank: 0, slice: 0 });
    perf.triggerPad(0, 1.0);
    expect(mockDevice.triggerSlice).toHaveBeenCalledWith(0, 0, 1.0);
  });

  test('triggerPad does nothing for empty pad', () => {
    perf.triggerPad(0, 1.0);
    expect(mockDevice.triggerSlice).not.toHaveBeenCalled();
  });

  test('setMode changes mode', () => {
    perf.setMode('loop');
    expect(perf.activeMode).toBe('loop');
    
    perf.setMode('gate');
    expect(perf.activeMode).toBe('gate');
    
    perf.setMode('slice-sequencer');
    expect(perf.activeMode).toBe('slice-sequencer');
  });

  test('setMode ignores invalid mode', () => {
    perf.setMode('invalid');
    expect(perf.activeMode).toBe('one-shot');
  });

  test('playLoop calls device methods', () => {
    perf.playLoop(2);
    expect(mockDevice.setBank).toHaveBeenCalledWith(2);
    expect(mockDevice.play).toHaveBeenCalled();
  });

  test('stopLoop calls device.stop', () => {
    perf.stopLoop();
    expect(mockDevice.stop).toHaveBeenCalled();
  });

  test('setMacro stores macro config', () => {
    const config = { filterCutoff: 1000, reverbMix: 0.5 };
    perf.setMacro(0, config);
    expect(perf.macros[0]).toEqual(config);
  });

  test('setXY clamps values', () => {
    perf.setXY(-0.5, 1.5);
    expect(perf.xyPad.x).toBe(0);
    expect(perf.xyPad.y).toBe(1);
    
    perf.setXY(0.5, 0.5);
    expect(perf.xyPad.x).toBe(0.5);
    expect(perf.xyPad.y).toBe(0.5);
  });

  test('quantizeEvents quantizes to grid', () => {
    const events = [
      { time: 0.1, note: 60 },
      { time: 0.35, note: 62 },
      { time: 0.6, note: 64 }
    ];
    
    const quantized = perf.quantizeEvents(events, 16);
    
    expect(quantized[0].time).toBeCloseTo(0.125, 3);
    expect(quantized[1].time).toBeCloseTo(0.375, 3);
    expect(quantized[2].time).toBeCloseTo(0.625, 3);
  });

  test('humanizeEvents adds variation', () => {
    const events = [
      { time: 0.25, note: 60 },
      { time: 0.5, note: 62 }
    ];
    
    const humanized = perf.humanizeEvents(events, 0.1);
    
    expect(humanized[0].time).not.toBe(0.25);
    expect(humanized[1].time).not.toBe(0.5);
  });

  test('exportPerformance returns current state', () => {
    perf.setPad(0, { type: 'slice', bank: 0, slice: 0 });
    perf.setXY(0.3, 0.7);
    
    const exported = perf.exportPerformance();
    
    expect(exported.pads[0]).toEqual({ type: 'slice', bank: 0, slice: 0 });
    expect(exported.xyPad.x).toBe(0.3);
    expect(exported.xyPad.y).toBe(0.7);
  });

  test('importPerformance restores state', () => {
    const data = {
      pads: new Array(64).fill(null),
      macros: new Array(8).fill(null),
      xyPad: { x: 0.5, y: 0.5 },
      mode: 'loop'
    };
    
    data.pads[0] = { type: 'slice', bank: 0, slice: 0 };
    
    perf.importPerformance(data);
    
    expect(perf.pads[0]).toEqual({ type: 'slice', bank: 0, slice: 0 });
    expect(perf.activeMode).toBe('loop');
  });
});

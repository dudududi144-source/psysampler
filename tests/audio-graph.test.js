// Audio Graph Tests

import { AudioGraph } from '../src/audio-graph.js';

// Mock AudioContext
const mockContext = {
  createGain: () => ({
    connect: () => {},
    gain: { value: 1 },
    disconnect: () => {}
  }),
  createBiquadFilter: () => ({
    connect: () => {},
    type: 'peaking',
    frequency: { value: 1000 },
    Q: { value: 1 },
    gain: { value: 0 }
  }),
  createDynamicsCompressor: () => ({
    connect: () => {},
    threshold: { value: -24 },
    knee: { value: 30 },
    ratio: { value: 4 },
    attack: { value: 0.003 },
    release: { value: 0.25 }
  }),
  destination: {},
  sampleRate: 48000
};

describe('AudioGraph', () => {
  let graph;

  beforeEach(() => {
    graph = new AudioGraph({ numBuses: 8 });
    graph.init(mockContext);
  });

  test('initializes with 8 buses', () => {
    expect(graph.buses.length).toBe(8);
  });

  test('each bus has input and output', () => {
    graph.buses.forEach(bus => {
      expect(bus.input).toBeDefined();
      expect(bus.output).toBeDefined();
    });
  });

  test('setBusVolume sets volume', () => {
    graph.setBusVolume(0, 0.5);
    expect(graph.buses[0].gain.value).toBe(0.5);
  });

  test('setBusMute mutes bus', () => {
    graph.setBusMute(0, true);
    expect(graph.buses[0].mute).toBe(true);
    expect(graph.buses[0].gain.value).toBe(0);
  });

  test('setBusUnmute unmutes bus', () => {
    graph.setBusMute(0, true);
    graph.setBusMute(0, false);
    expect(graph.buses[0].mute).toBe(false);
    expect(graph.buses[0].gain.value).toBe(1);
  });

  test('setBusSolo solos bus', () => {
    graph.setBusSolo(0, true);
    expect(graph.buses[0].solo).toBe(true);
  });

  test('solo mutes other buses', () => {
    graph.setBusSolo(0, true);
    
    expect(graph.buses[0].gain.value).toBe(1);
    expect(graph.buses[1].gain.value).toBe(0);
    expect(graph.buses[2].gain.value).toBe(0);
  });

  test('unsolo restores volumes', () => {
    graph.setBusSolo(0, true);
    graph.setBusSolo(0, false);
    
    expect(graph.buses[0].gain.value).toBe(1);
    expect(graph.buses[1].gain.value).toBe(1);
  });

  test('master bus has FX chain', () => {
    expect(graph.masterBus).toBeDefined();
    expect(graph.masterBus.eq).toBeDefined();
    expect(graph.masterBus.compressor).toBeDefined();
    expect(graph.masterBus.limiter).toBeDefined();
  });

  test('dispose disconnects buses', () => {
    graph.dispose();
    // No errors should be thrown
  });
});

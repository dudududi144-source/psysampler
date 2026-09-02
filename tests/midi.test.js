// MIDI Integration Tests

import { MIDIIntegration } from '../src/midi-integration.js';

// Mock device
const mockDevice = {
  triggerSlice: jest.fn(),
  play: jest.fn(),
  stop: jest.fn()
};

describe('MIDIIntegration', () => {
  let midi;

  beforeEach(() => {
    midi = new MIDIIntegration(mockDevice);
    jest.clearAllMocks();
  });

  test('initializes with empty maps', () => {
    expect(midi.sliceMIDIMap.size).toBe(0);
    expect(midi.cclMap.size).toBe(0);
    expect(midi.clockEnabled).toBe(false);
  });

  test('mapSliceToNote adds mapping', () => {
    midi.mapSliceToNote(36, 0, 0);
    expect(midi.sliceMIDIMap.get(36)).toEqual({ bank: 0, slice: 0 });
  });

  test('unmapSliceFromNote removes mapping', () => {
    midi.mapSliceToNote(36, 0, 0);
    midi.unmapSliceFromNote(36);
    expect(midi.sliceMIDIMap.has(36)).toBe(false);
  });

  test('handleNoteOn triggers slice if mapped', () => {
    midi.mapSliceToNote(36, 0, 0);
    midi.handleNoteOn(36, 0.8);
    expect(mockDevice.triggerSlice).toHaveBeenCalledWith(0, 0, 0.8);
  });

  test('handleNoteOn does not trigger if not mapped', () => {
    midi.handleNoteOn(36, 0.8);
    expect(mockDevice.triggerSlice).not.toHaveBeenCalled();
  });

  test('learnCC adds CC mapping', () => {
    const callback = jest.fn();
    midi.learnCC(20, 'filter', callback);
    expect(midi.cclMap.has(20)).toBe(true);
  });

  test('handleCC calls mapped callback', () => {
    const callback = jest.fn();
    midi.learnCC(20, 'filter', callback);
    midi.handleCC(20, 0.5);
    expect(callback).toHaveBeenCalledWith(0.5);
  });

  test('handleStart calls device.play', () => {
    midi.handleStart();
    expect(mockDevice.play).toHaveBeenCalled();
  });

  test('handleStop calls device.stop', () => {
    midi.handleStop();
    expect(mockDevice.stop).toHaveBeenCalled();
  });

  test('enableClock sets clockEnabled', () => {
    midi.enableClock(140);
    expect(midi.clockEnabled).toBe(true);
    expect(midi.bpm).toBe(140);
  });

  test('disableClock clears clockEnabled', () => {
    midi.enableClock(140);
    midi.disableClock();
    expect(midi.clockEnabled).toBe(false);
  });

  test('encodeVarLength encodes correctly', () => {
    expect(midi.encodeVarLength(0)).toEqual([0]);
    expect(midi.encodeVarLength(127)).toEqual([127]);
    expect(midi.encodeVarLength(128)).toEqual([129, 0]);
    expect(midi.encodeVarLength(480)).toEqual([131, 96]);
  });

  test('createMIDIHeader returns valid header', () => {
    const header = midi.createMIDIHeader();
    expect(header.length).toBe(14);
    expect(header[0]).toBe(0x4D); // 'M'
    expect(header[1]).toBe(0x54); // 'T'
    expect(header[2]).toBe(0x68); // 'h'
    expect(header[3]).toBe(0x64); // 'd'
  });

  test('dispose clears maps', () => {
    midi.mapSliceToNote(36, 0, 0);
    midi.learnCC(20, 'filter', () => {});
    midi.dispose();
    
    expect(midi.sliceMIDIMap.size).toBe(0);
    expect(midi.cclMap.size).toBe(0);
  });
});

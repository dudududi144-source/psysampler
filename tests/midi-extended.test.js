// MIDI Extended Tests

import { MIDIIntegration } from '../src/midi-integration.js';

// Mock device
const mockDevice = {
  triggerSlice: () => {},
  play: () => {},
  stop: () => {}
};

describe('MIDIIntegration Extended', () => {
  let midi;

  beforeEach(() => {
    midi = new MIDIIntegration(mockDevice);
  });

  test('mapSliceToNote and unmapSliceFromNote work', () => {
    midi.mapSliceToNote(36, 0, 0);
    expect(midi.sliceMIDIMap.has(36)).toBe(true);
    
    midi.unmapSliceFromNote(36);
    expect(midi.sliceMIDIMap.has(36)).toBe(false);
  });

  test('learnCC and unlearnCC work', () => {
    const callback = () => {};
    midi.learnCC(20, 'filter', callback);
    expect(midi.cclMap.has(20)).toBe(true);
    
    midi.unlearnCC(20);
    expect(midi.cclMap.has(20)).toBe(false);
  });

  test('enableClock and disableClock work', () => {
    midi.enableClock(140);
    expect(midi.clockEnabled).toBe(true);
    expect(midi.bpm).toBe(140);
    
    midi.disableClock();
    expect(midi.clockEnabled).toBe(false);
  });

  test('encodeVarLength handles various values', () => {
    expect(midi.encodeVarLength(0)).toEqual([0]);
    expect(midi.encodeVarLength(127)).toEqual([127]);
    expect(midi.encodeVarLength(128)).toEqual([129, 0]);
    expect(midi.encodeVarLength(16383)).toEqual([255, 127]);
  });

  test('createMIDIHeader returns valid header', () => {
    const header = midi.createMIDIHeader();
    expect(header.length).toBe(14);
    expect(header[0]).toBe(0x4D); // 'M'
    expect(header[1]).toBe(0x54); // 'T'
    expect(header[2]).toBe(0x68); // 'h'
    expect(header[3]).toBe(0x64); // 'd'
  });

  test('createTrackHeader returns valid header', () => {
    const header = midi.createTrackHeader(100);
    expect(header.length).toBe(8);
    expect(header[0]).toBe(0x4D); // 'M'
    expect(header[1]).toBe(0x54); // 'T'
    expect(header[2]).toBe(0x72); // 'r'
    expect(header[3]).toBe(0x6B); // 'k'
  });

  test('exportMIDI returns valid MIDI data', () => {
    const slices = [
      { start: 0, end: 0.5, duration: 0.5 },
      { start: 0.5, end: 1.0, duration: 0.5 }
    ];
    
    const midiData = midi.exportMIDI(slices);
    expect(midiData).toBeInstanceOf(Uint8Array);
    expect(midiData.length).toBeGreaterThan(14);
  });

  test('dispose clears all maps', () => {
    midi.mapSliceToNote(36, 0, 0);
    midi.learnCC(20, 'filter', () => {});
    midi.enableClock(140);
    
    midi.dispose();
    
    expect(midi.sliceMIDIMap.size).toBe(0);
    expect(midi.cclMap.size).toBe(0);
    expect(midi.clockEnabled).toBe(false);
  });
});

// Export Tests

import { ExportManager } from '../src/export.js';

// Mock device
const mockDevice = {
  exportProject: () => ({
    version: '1.0.0',
    banks: [],
    config: {}
  }),
  importProject: jest.fn(),
  sliceBanks: [{ hasLoop: false }],
  currentBank: 0
};

describe('ExportManager', () => {
  let exporter;

  beforeEach(() => {
    exporter = new ExportManager(mockDevice);
  });

  test('exportProject returns JSON blob', () => {
    const blob = exporter.exportProject();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
  });

  test('createMIDIFile returns valid MIDI', () => {
    const midi = exporter.createMIDIFile();
    expect(midi).toBeInstanceOf(Uint8Array);
    expect(midi.length).toBeGreaterThan(14);
    
    // Check MIDI header
    expect(midi[0]).toBe(0x4D); // 'M'
    expect(midi[1]).toBe(0x54); // 'T'
    expect(midi[2]).toBe(0x68); // 'h'
    expect(midi[3]).toBe(0x64); // 'd'
  });

  test('encodeVarLength encodes correctly', () => {
    expect(exporter.encodeVarLength(0)).toEqual([0]);
    expect(exporter.encodeVarLength(127)).toEqual([127]);
    expect(exporter.encodeVarLength(128)).toEqual([129, 0]);
  });

  test('audioBufferToWav creates valid WAV', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 1,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = exporter.audioBufferToWav(buffer);
    expect(wav).toBeInstanceOf(Blob);
    expect(wav.type).toBe('audio/wav');
  });

  test('writeString writes correctly', () => {
    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    
    exporter.writeString(view, 0, 'RIFF');
    
    expect(view.getUint8(0)).toBe(82); // 'R'
    expect(view.getUint8(1)).toBe(73); // 'I'
    expect(view.getUint8(2)).toBe(70); // 'F'
    expect(view.getUint8(3)).toBe(70); // 'F'
  });

  test('download creates link and clicks', () => {
    const mockClick = jest.fn();
    const mockAppend = jest.fn();
    const mockRemove = jest.fn();
    
    global.document = {
      createElement: () => ({
        click: mockClick,
        href: '',
        download: ''
      }),
      body: {
        appendChild: mockAppend,
        removeChild: mockRemove
      }
    };
    
    global.URL = {
      createObjectURL: () => 'blob:test',
      revokeObjectURL: () => {}
    };
    
    const blob = new Blob(['test']);
    exporter.download(blob, 'test.wav');
    
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppend).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });
});

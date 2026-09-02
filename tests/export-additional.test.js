// Export Tests - Additional

import { ExportManager } from '../src/export.js';

describe('ExportManager - Additional', () => {
  let exporter;
  let mockDevice;

  beforeEach(() => {
    mockDevice = {
      exportProject: () => ({
        version: '1.0.0',
        banks: [],
        config: {}
      }),
      importProject: () => {},
      sliceBanks: [{ hasLoop: false }],
      currentBank: 0
    };
    exporter = new ExportManager(mockDevice);
  });

  test('exportProject creates valid JSON', () => {
    const blob = exporter.exportProject();
    expect(blob.type).toBe('application/json');
  });

  test('createMIDIFile handles empty bank', () => {
    const midi = exporter.createMIDIFile();
    expect(midi).toBeInstanceOf(Uint8Array);
    expect(midi.length).toBeGreaterThan(14);
  });

  test('encodeVarLength handles large values', () => {
    const encoded = exporter.encodeVarLength(16383);
    expect(encoded.length).toBeGreaterThan(1);
  });

  test('audioBufferToWav handles stereo', () => {
    const buffer = {
      getChannelData: (ch) => new Float32Array(100),
      numberOfChannels: 2,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = exporter.audioBufferToWav(buffer);
    expect(wav).toBeInstanceOf(Blob);
  });

  test('audioBufferToWav handles 24-bit', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 1,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = exporter.audioBufferToWav(buffer, 24);
    expect(wav).toBeInstanceOf(Blob);
  });
});

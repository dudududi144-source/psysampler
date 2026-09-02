// Recorder Tests

import { Recorder } from '../src/recorder.js';

// Mock AudioContext
const mockContext = {
  createBuffer: (channels, length, sampleRate) => ({
    getChannelData: () => new Float32Array(length),
    numberOfChannels: channels,
    length,
    sampleRate
  }),
  decodeAudioData: jest.fn().mockResolvedValue({
    getChannelData: () => new Float32Array(1000),
    numberOfChannels: 1,
    length: 1000,
    sampleRate: 48000
  }),
  sampleRate: 48000
};

describe('Recorder', () => {
  let recorder;

  beforeEach(() => {
    recorder = new Recorder(mockContext);
  });

  test('initializes with empty layers', () => {
    expect(recorder.layers.length).toBe(0);
    expect(recorder.isRecording).toBe(false);
  });

  test('undo returns null when no layers', () => {
    expect(recorder.undo()).toBeNull();
  });

  test('undo removes last layer', () => {
    const layer = { data: 'test' };
    recorder.layers.push(layer);
    
    const undone = recorder.undo();
    expect(undone).toBe(layer);
    expect(recorder.layers.length).toBe(0);
  });

  test('getCurrentRecording returns null when empty', () => {
    expect(recorder.getCurrentRecording()).toBeNull();
  });

  test('getCurrentRecording returns last layer', () => {
    const layer = { data: 'test' };
    recorder.layers.push(layer);
    
    expect(recorder.getCurrentRecording()).toBe(layer);
  });

  test('clear removes all layers', () => {
    recorder.layers.push({ data: 'test1' });
    recorder.layers.push({ data: 'test2' });
    
    recorder.clear();
    expect(recorder.layers.length).toBe(0);
  });

  test('mixBuffers combines buffers', () => {
    const buffer1 = {
      getChannelData: () => new Float32Array([0.5, 0.5, 0.5]),
      numberOfChannels: 1,
      length: 3,
      sampleRate: 48000
    };
    
    const buffer2 = {
      getChannelData: () => new Float32Array([0.25, 0.25, 0.25]),
      numberOfChannels: 1,
      length: 3,
      sampleRate: 48000
    };
    
    const mixed = recorder.mixBuffers(buffer1, buffer2);
    expect(mixed).toBeDefined();
  });

  test('writeString writes correctly', () => {
    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    
    recorder.writeString(view, 0, 'RIFF');
    
    expect(view.getUint8(0)).toBe(82); // 'R'
    expect(view.getUint8(1)).toBe(73); // 'I'
    expect(view.getUint8(2)).toBe(70); // 'F'
    expect(view.getUint8(3)).toBe(70); // 'F'
  });

  test('audioBufferToWav creates valid WAV', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 1,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = recorder.audioBufferToWav(buffer);
    
    expect(wav).toBeInstanceOf(Uint8Array);
    expect(wav.length).toBeGreaterThan(44); // Header + data
    
    // Check WAV header
    expect(String.fromCharCode(wav[0], wav[1], wav[2], wav[3])).toBe('RIFF');
    expect(String.fromCharCode(wav[8], wav[9], wav[10], wav[11])).toBe('WAVE');
  });
});

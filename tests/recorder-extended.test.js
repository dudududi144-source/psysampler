// Recorder Extended Tests

import { Recorder } from '../src/recorder.js';

// Mock AudioContext
const mockContext = {
  createBuffer: (channels, length, sampleRate) => ({
    getChannelData: () => new Float32Array(length),
    numberOfChannels: channels,
    length,
    sampleRate
  }),
  decodeAudioData: () => Promise.resolve({
    getChannelData: () => new Float32Array(1000),
    numberOfChannels: 1,
    length: 1000,
    sampleRate: 48000
  }),
  sampleRate: 48000
};

describe('Recorder Extended', () => {
  let recorder;

  beforeEach(() => {
    recorder = new Recorder(mockContext);
  });

  test('mixBuffers handles different lengths', () => {
    const buffer1 = {
      getChannelData: () => new Float32Array([0.5, 0.5, 0.5]),
      numberOfChannels: 1,
      length: 3,
      sampleRate: 48000
    };
    
    const buffer2 = {
      getChannelData: () => new Float32Array([0.25, 0.25]),
      numberOfChannels: 1,
      length: 2,
      sampleRate: 48000
    };
    
    const mixed = recorder.mixBuffers(buffer1, buffer2);
    expect(mixed).toBeDefined();
  });

  test('mixBuffers handles stereo', () => {
    const buffer1 = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 2,
      length: 100,
      sampleRate: 48000
    };
    
    const buffer2 = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 2,
      length: 100,
      sampleRate: 48000
    };
    
    const mixed = recorder.mixBuffers(buffer1, buffer2);
    expect(mixed.numberOfChannels).toBe(2);
  });

  test('audioBufferToWav creates correct header', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 1,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = recorder.audioBufferToWav(buffer);
    
    // Check WAV header
    expect(String.fromCharCode(wav[0], wav[1], wav[2], wav[3])).toBe('RIFF');
    expect(String.fromCharCode(wav[8], wav[9], wav[10], wav[11])).toBe('WAVE');
    expect(String.fromCharCode(wav[12], wav[13], wav[14], wav[15])).toBe('fmt ');
  });

  test('audioBufferToWav handles stereo', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 2,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = recorder.audioBufferToWav(buffer);
    expect(wav.length).toBeGreaterThan(44);
  });

  test('audioBufferToWav handles 16-bit', () => {
    const buffer = {
      getChannelData: () => new Float32Array(100),
      numberOfChannels: 1,
      length: 100,
      sampleRate: 48000
    };
    
    const wav = recorder.audioBufferToWav(buffer);
    expect(wav.length).toBe(44 + 100 * 2); // Header + 16-bit samples
  });

  test('writeString writes at correct offset', () => {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    
    recorder.writeString(view, 5, 'TEST');
    
    expect(view.getUint8(5)).toBe(84); // 'T'
    expect(view.getUint8(6)).toBe(69); // 'E'
    expect(view.getUint8(7)).toBe(83); // 'S'
    expect(view.getUint8(8)).toBe(84); // 'T'
  });

  test('undo returns layers in reverse order', () => {
    const layer1 = { id: 1 };
    const layer2 = { id: 2 };
    const layer3 = { id: 3 };
    
    recorder.layers.push(layer1);
    recorder.layers.push(layer2);
    recorder.layers.push(layer3);
    
    expect(recorder.undo()).toBe(layer3);
    expect(recorder.undo()).toBe(layer2);
    expect(recorder.undo()).toBe(layer1);
    expect(recorder.undo()).toBeNull();
  });

  test('getCurrentRecording returns latest layer', () => {
    const layer1 = { id: 1 };
    const layer2 = { id: 2 };
    
    recorder.layers.push(layer1);
    recorder.layers.push(layer2);
    
    expect(recorder.getCurrentRecording()).toBe(layer2);
  });
});

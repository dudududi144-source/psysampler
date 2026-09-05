// Analyzer Extended Tests

import { LoopAnalyzer } from '../src/analyzer.js';

describe('LoopAnalyzer Extended', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new LoopAnalyzer();
  });

  test('detectTempo handles 60 BPM', () => {
    const sampleRate = 48000;
    const duration = 4;
    const bpm = 60;
    const beatInterval = 60 / bpm;

    const data = new Float32Array(sampleRate * duration);
    for (let beat = 0; beat < duration / beatInterval; beat++) {
      const startSample = Math.floor(beat * beatInterval * sampleRate);
      for (let i = 0; i < 1000; i++) {
        if (startSample + i < data.length) {
          data[startSample + i] =
            Math.sin(2 * Math.PI * 100 * (i / sampleRate)) * Math.exp(-i / 100);
        }
      }
    }

    const tempo = analyzer.detectTempo(data, sampleRate);
    expect(tempo).toBeGreaterThan(55);
    expect(tempo).toBeLessThan(65);
  });

  test('detectTempo handles 240 BPM', () => {
    const sampleRate = 48000;
    const duration = 2;
    const bpm = 240;
    const beatInterval = 60 / bpm;

    const data = new Float32Array(sampleRate * duration);
    for (let beat = 0; beat < duration / beatInterval; beat++) {
      const startSample = Math.floor(beat * beatInterval * sampleRate);
      for (let i = 0; i < 500; i++) {
        if (startSample + i < data.length) {
          data[startSample + i] =
            Math.sin(2 * Math.PI * 100 * (i / sampleRate)) * Math.exp(-i / 50);
        }
      }
    }

    const tempo = analyzer.detectTempo(data, sampleRate);
    expect(tempo).toBeGreaterThan(230);
    expect(tempo).toBeLessThan(250);
  });

  test('spectralCentroid of sine wave', () => {
    const sampleRate = 48000;
    const data = new Float32Array(sampleRate);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * (i / sampleRate));
    }

    const centroid = analyzer.spectralCentroid(data, sampleRate);
    expect(centroid).toBeGreaterThan(0);
  });

  test('zeroCrossingRate of sine wave', () => {
    const sampleRate = 48000;
    const data = new Float32Array(sampleRate);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 10 * (i / sampleRate));
    }

    const zcr = analyzer.zeroCrossingRate(data);
    expect(zcr).toBeGreaterThan(0);
    expect(zcr).toBeLessThan(1);
  });

  test('calculateLUFS returns valid value', () => {
    const sampleRate = 48000;
    const data = new Float32Array(sampleRate);

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 1000 * (i / sampleRate)) * 0.5;
    }

    const lufs = analyzer.calculateLUFS(data, sampleRate);
    expect(lufs).toBeLessThan(0);
    expect(lufs).toBeGreaterThan(-60);
  });

  test('detectSlices returns valid slices', () => {
    const sampleRate = 48000;
    const duration = 2;

    const data = new Float32Array(sampleRate * duration);
    // Create 4 distinct hits
    for (let hit = 0; hit < 4; hit++) {
      const startSample = Math.floor(hit * 0.5 * sampleRate);
      for (let i = 0; i < 2000; i++) {
        if (startSample + i < data.length) {
          data[startSample + i] =
            Math.sin(2 * Math.PI * 200 * (i / sampleRate)) * Math.exp(-i / 200);
        }
      }
    }

    const buffer = {
      getChannelData: () => data,
      sampleRate,
      duration,
      numberOfChannels: 1,
    };

    const analysis = analyzer.analyze(buffer);
    const slices = analyzer.detectSlices(buffer, analysis);

    expect(slices.length).toBeGreaterThan(0);

    slices.forEach((slice) => {
      expect(slice.start).toBeGreaterThanOrEqual(0);
      expect(slice.end).toBeGreaterThan(slice.start);
      expect(slice.duration).toBeGreaterThan(0);
    });
  });
});

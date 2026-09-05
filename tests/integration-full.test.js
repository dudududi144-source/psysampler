// Full Integration Tests

import { LoopAnalyzer } from '../src/analyzer.js';
import { Determinism } from '../src/determinism.js';
import { LoopGenerator } from '../src/generator.js';
import { LooperDevice } from '../src/looper-device.js';

describe('Full Integration', () => {
  let device;

  beforeEach(() => {
    device = new LooperDevice({ sampleRate: 48000, numBanks: 8 });
  });

  test('complete workflow: generate -> analyze -> play', async () => {
    // Generate a loop
    const generator = new LoopGenerator(device.determinism);
    const result = await generator.generate('melodic', {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
    });

    expect(result.audio).toBeDefined();
    expect(result.type).toBe('melodic');
  });

  test('determinism: same seed produces same output', async () => {
    const det1 = new Determinism(12345);
    const det2 = new Determinism(12345);

    const gen1 = new LoopGenerator(det1);
    const gen2 = new LoopGenerator(det2);

    const result1 = await gen1.generate('melodic', {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
      seed: 12345,
    });

    const result2 = await gen2.generate('melodic', {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
      seed: 12345,
    });

    // Both should produce same audio data
    expect(result1.config).toEqual(result2.config);
  });

  test('analyzer handles all loop types', () => {
    const analyzer = new LoopAnalyzer();

    const types = [
      'melodic',
      'rhythmic',
      'lead',
      'fx',
      'percussion',
      'bass',
      'chord',
      'atmospheric',
    ];

    types.forEach((type) => {
      const data = new Float32Array(48000); // 1 second
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(2 * Math.PI * 440 * (i / 48000)) * 0.5;
      }

      const buffer = {
        getChannelData: () => data,
        sampleRate: 48000,
        duration: 1,
        numberOfChannels: 1,
      };

      const analysis = analyzer.analyze(buffer);
      expect(analysis).toBeDefined();
      expect(analysis.tempo).toBeDefined();
      expect(analysis.type).toBeDefined();
    });
  });

  test('device handles multiple banks', () => {
    for (let i = 0; i < 8; i++) {
      device.setBank(i);
      expect(device.currentBank).toBe(i);
    }
  });

  test('device exports and imports all banks', () => {
    const project = device.exportProject();

    expect(project.banks.length).toBe(8);

    device.importProject(project);
    expect(device.sliceBanks.length).toBe(8);
  });
});

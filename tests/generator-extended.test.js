// Generator Extended Tests

import { Determinism } from '../src/determinism.js';
import { LoopGenerator } from '../src/generator.js';

describe('LoopGenerator Extended', () => {
  let generator;
  let determinism;

  beforeEach(() => {
    determinism = new Determinism(12345);
    generator = new LoopGenerator(determinism);
  });

  test('generates all 8 loop types', async () => {
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

    for (const type of types) {
      const result = await generator.generate(type, {
        bpm: 140,
        bars: 4,
      });

      expect(result.audio).toBeDefined();
      expect(result.type).toBe(type);
    }
  });

  test('getScaleNotes returns correct notes', () => {
    const cMinor = generator.getScaleNotes('C', 'minor');
    expect(cMinor).toContain(60); // C
    expect(cMinor).toContain(62); // D
    expect(cMinor).toContain(63); // D#
    expect(cMinor).toContain(65); // F
    expect(cMinor).toContain(67); // G
    expect(cMinor).toContain(68); // G#
    expect(cMinor).toContain(70); // A#
  });

  test('getScaleNotes handles all scales', () => {
    const scales = [
      'major',
      'minor',
      'dorian',
      'phrygian',
      'lydian',
      'mixolydian',
      'aeolian',
      'locrian',
    ];

    scales.forEach((scale) => {
      const notes = generator.getScaleNotes('C', scale);
      expect(notes.length).toBe(7);
    });
  });

  test('midiToFreq handles all MIDI notes', () => {
    for (let midi = 0; midi <= 127; midi++) {
      const freq = generator.midiToFreq(midi);
      expect(freq).toBeGreaterThan(0);
      expect(freq).toBeLessThan(20000);
    }
  });

  test('adsrEnvelope has correct shape', () => {
    expect(generator.adsrEnvelope(0)).toBe(0);
    expect(generator.adsrEnvelope(0.05)).toBeGreaterThan(0);
    expect(generator.adsrEnvelope(0.1)).toBeCloseTo(1, 1);
    expect(generator.adsrEnvelope(0.5)).toBeGreaterThan(0.7);
    expect(generator.adsrEnvelope(0.9)).toBeLessThan(0.5);
    expect(generator.adsrEnvelope(1)).toBeLessThan(0.1);
  });

  test('generateMelody returns valid notes', () => {
    const melody = generator.generateMelody('C', 'minor', 16);

    expect(melody.length).toBe(16);

    melody.forEach((note) => {
      expect(note).toBeGreaterThanOrEqual(0);
      expect(note).toBeLessThanOrEqual(127);
    });
  });

  test('generateRhythmPattern returns valid pattern', () => {
    const pattern = generator.generateRhythmPattern(4);

    expect(pattern.length).toBe(64); // 4 bars * 16 steps

    pattern.forEach((hit) => {
      expect([0, 1]).toContain(hit);
    });
  });

  test('generateBassPattern returns valid notes', () => {
    const pattern = generator.generateBassPattern('C', 'minor', 4);

    expect(pattern.length).toBe(64);

    pattern.forEach((note) => {
      expect(note).toBeGreaterThanOrEqual(0);
      expect(note).toBeLessThanOrEqual(127);
    });
  });

  test('generateChordProgression returns valid chords', () => {
    const chords = generator.generateChordProgression('C', 'major', 4);

    expect(chords.length).toBe(4);

    chords.forEach((chord) => {
      expect(chord.length).toBe(3); // Triads

      chord.forEach((note) => {
        expect(note).toBeGreaterThanOrEqual(0);
        expect(note).toBeLessThanOrEqual(127);
      });
    });
  });

  test('createAudioBuffer returns valid buffer', () => {
    const data = new Float32Array(48000);
    const buffer = generator.createAudioBuffer(data, 48000);

    expect(buffer.sampleRate).toBe(48000);
    expect(buffer.duration).toBe(1);
    expect(buffer.numberOfChannels).toBe(1);
  });
});

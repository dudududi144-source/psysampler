// Loop Types Extended Tests

import { LOOP_TYPES, getLoopType, getLoopTypesByCategory, validateLoopType, SCALES, KEYS, KEY_TO_MIDI, PROGRESSIONS } from '../src/loop-types.js';

describe('Loop Types Extended', () => {
  test('each loop type has valid category', () => {
    const validCategories = ['musical', 'rhythm', 'fx', 'harmonic', 'texture'];
    
    Object.values(LOOP_TYPES).forEach(type => {
      expect(validCategories).toContain(type.category);
    });
  });

  test('each loop type has valid color', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      expect(type.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('each loop type has icon', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      expect(type.icon).toBeDefined();
      expect(type.icon.length).toBeGreaterThan(0);
    });
  });

  test('each loop type has features array', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      expect(Array.isArray(type.features)).toBe(true);
      expect(type.features.length).toBeGreaterThan(0);
    });
  });

  test('getLoopTypesByCategory returns correct counts', () => {
    const musical = getLoopTypesByCategory('musical');
    expect(musical.length).toBe(3); // melodic, lead, bass
    
    const rhythm = getLoopTypesByCategory('rhythm');
    expect(rhythm.length).toBe(2); // rhythmic, percussion
    
    const fx = getLoopTypesByCategory('fx');
    expect(fx.length).toBe(1); // fx
    
    const harmonic = getLoopTypesByCategory('harmonic');
    expect(harmonic.length).toBe(1); // chord
    
    const texture = getLoopTypesByCategory('texture');
    expect(texture.length).toBe(1); // atmospheric
  });

  test('SCALES intervals are valid', () => {
    Object.values(SCALES).forEach(scale => {
      expect(scale.length).toBe(7);
      
      scale.forEach(interval => {
        expect(interval).toBeGreaterThanOrEqual(0);
        expect(interval).toBeLessThan(12);
      });
    });
  });

  test('KEYS has 12 unique keys', () => {
    expect(KEYS.length).toBe(12);
    
    const uniqueKeys = new Set(KEYS);
    expect(uniqueKeys.size).toBe(12);
  });

  test('KEY_TO_MIDI maps all keys', () => {
    KEYS.forEach(key => {
      expect(KEY_TO_MIDI[key]).toBeDefined();
      expect(KEY_TO_MIDI[key]).toBeGreaterThanOrEqual(60);
      expect(KEY_TO_MIDI[key]).toBeLessThanOrEqual(71);
    });
  });

  test('PROGRESSIONS has valid chord indices', () => {
    Object.values(PROGRESSIONS).forEach(prog => {
      expect(prog.length).toBeGreaterThan(0);
      
      prog.forEach(chord => {
        expect(chord).toBeGreaterThanOrEqual(0);
        expect(chord).toBeLessThan(7);
      });
    });
  });

  test('all loop types have valid defaults', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      if (type.defaults.bpm) {
        expect(type.defaults.bpm).toBeGreaterThan(0);
        expect(type.defaults.bpm).toBeLessThan(300);
      }
      
      if (type.defaults.bars) {
        expect(type.defaults.bars).toBeGreaterThan(0);
        expect(type.defaults.bars).toBeLessThanOrEqual(16);
      }
    });
  });
});

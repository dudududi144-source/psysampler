// Loop Types Tests

import { LOOP_TYPES, getLoopType, getLoopTypesByCategory, validateLoopType, SCALES, KEYS } from '../src/loop-types.js';

describe('Loop Types', () => {
  test('has 8 loop types', () => {
    expect(Object.keys(LOOP_TYPES).length).toBe(8);
  });

  test('each loop type has required fields', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      expect(type.id).toBeDefined();
      expect(type.name).toBeDefined();
      expect(type.description).toBeDefined();
      expect(type.category).toBeDefined();
      expect(type.color).toBeDefined();
      expect(type.icon).toBeDefined();
      expect(type.features).toBeDefined();
      expect(type.defaults).toBeDefined();
    });
  });

  test('getLoopType returns correct type', () => {
    const melodic = getLoopType('melodic');
    expect(melodic).toBeDefined();
    expect(melodic.name).toBe('Melodic');
    
    const rhythmic = getLoopType('rhythmic');
    expect(rhythmic).toBeDefined();
    expect(rhythmic.name).toBe('Rhythmic');
  });

  test('getLoopType returns undefined for unknown type', () => {
    expect(getLoopType('unknown')).toBeUndefined();
  });

  test('getLoopTypesByCategory filters correctly', () => {
    const musical = getLoopTypesByCategory('musical');
    expect(musical.length).toBe(3); // melodic, lead, bass
    
    const rhythm = getLoopTypesByCategory('rhythm');
    expect(rhythm.length).toBe(2); // rhythmic, percussion
    
    const fx = getLoopTypesByCategory('fx');
    expect(fx.length).toBe(1); // fx
  });

  test('validateLoopType works correctly', () => {
    expect(validateLoopType('melodic')).toBe(true);
    expect(validateLoopType('rhythmic')).toBe(true);
    expect(validateLoopType('unknown')).toBe(false);
  });

  test('SCALES has 9 scales', () => {
    expect(Object.keys(SCALES).length).toBe(9);
  });

  test('each scale has 7 notes', () => {
    Object.values(SCALES).forEach(scale => {
      expect(scale.length).toBe(7);
    });
  });

  test('KEYS has 12 keys', () => {
    expect(KEYS.length).toBe(12);
  });

  test('all loop types have valid defaults', () => {
    Object.values(LOOP_TYPES).forEach(type => {
      if (type.defaults.bpm) {
        expect(type.defaults.bpm).toBeGreaterThan(0);
        expect(type.defaults.bpm).toBeLessThan(300);
      }
      if (type.defaults.bars) {
        expect(type.defaults.bars).toBeGreaterThan(0);
      }
    });
  });
});

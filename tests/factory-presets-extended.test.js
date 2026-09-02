// Factory Presets Extended Tests

import { FACTORY_PRESETS, getPreset, getAllPresets, getPresetsByType } from '../src/factory-presets.js';

describe('Factory Presets Extended', () => {
  test('all presets have valid types', () => {
    const validTypes = ['melodic', 'rhythmic', 'lead', 'fx', 'percussion', 'bass', 'chord', 'atmospheric'];
    
    Object.values(FACTORY_PRESETS).forEach(preset => {
      expect(validTypes).toContain(preset.type);
    });
  });

  test('all presets have unique names', () => {
    const names = Object.values(FACTORY_PRESETS).map(p => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('melodic presets have key and scale', () => {
    const melodicPresets = getPresetsByType('melodic');
    
    melodicPresets.forEach(preset => {
      expect(preset.config.key).toBeDefined();
      expect(preset.config.scale).toBeDefined();
    });
  });

  test('bass presets have key and scale', () => {
    const bassPresets = getPresetsByType('bass');
    
    bassPresets.forEach(preset => {
      expect(preset.config.key).toBeDefined();
      expect(preset.config.scale).toBeDefined();
    });
  });

  test('chord presets have key and scale', () => {
    const chordPresets = getPresetsByType('chord');
    
    chordPresets.forEach(preset => {
      expect(preset.config.key).toBeDefined();
      expect(preset.config.scale).toBeDefined();
    });
  });

  test('all presets have valid bpm', () => {
    Object.values(FACTORY_PRESETS).forEach(preset => {
      if (preset.config.bpm) {
        expect(preset.config.bpm).toBeGreaterThan(0);
        expect(preset.config.bpm).toBeLessThan(300);
      }
    });
  });

  test('all presets have valid bars', () => {
    Object.values(FACTORY_PRESETS).forEach(preset => {
      if (preset.config.bars) {
        expect(preset.config.bars).toBeGreaterThan(0);
        expect(preset.config.bars).toBeLessThanOrEqual(16);
      }
    });
  });

  test('getAllPresets returns all presets with ids', () => {
    const all = getAllPresets();
    
    expect(all.length).toBe(Object.keys(FACTORY_PRESETS).length);
    
    all.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.type).toBeDefined();
      expect(preset.config).toBeDefined();
    });
  });

  test('getPresetsByType returns empty array for unknown type', () => {
    const unknown = getPresetsByType('unknown');
    expect(unknown).toEqual([]);
  });

  test('getPreset returns undefined for unknown id', () => {
    expect(getPreset('unknown')).toBeUndefined();
  });
});

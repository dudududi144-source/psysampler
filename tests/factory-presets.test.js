// Factory Presets Tests

import { FACTORY_PRESETS, getPreset, getAllPresets, getPresetsByType } from '../src/factory-presets.js';

describe('Factory Presets', () => {
  test('has multiple presets', () => {
    expect(Object.keys(FACTORY_PRESETS).length).toBeGreaterThan(5);
  });

  test('each preset has required fields', () => {
    Object.values(FACTORY_PRESETS).forEach(preset => {
      expect(preset.name).toBeDefined();
      expect(preset.type).toBeDefined();
      expect(preset.config).toBeDefined();
    });
  });

  test('getPreset returns correct preset', () => {
    const preset = getPreset('psytrance-melody');
    expect(preset).toBeDefined();
    expect(preset.name).toBe('Psytrance Melody');
    expect(preset.type).toBe('melodic');
  });

  test('getPreset returns undefined for unknown', () => {
    expect(getPreset('unknown')).toBeUndefined();
  });

  test('getAllPresets returns all presets', () => {
    const all = getAllPresets();
    expect(all.length).toBe(Object.keys(FACTORY_PRESETS).length);
    
    all.forEach(preset => {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.type).toBeDefined();
    });
  });

  test('getPresetsByType filters correctly', () => {
    const melodic = getPresetsByType('melodic');
    expect(melodic.length).toBeGreaterThan(0);
    
    melodic.forEach(preset => {
      expect(preset.type).toBe('melodic');
    });
  });

  test('all presets have valid configs', () => {
    Object.values(FACTORY_PRESETS).forEach(preset => {
      const config = preset.config;
      
      if (config.bpm) {
        expect(config.bpm).toBeGreaterThan(0);
        expect(config.bpm).toBeLessThan(300);
      }
      
      if (config.bars) {
        expect(config.bars).toBeGreaterThan(0);
      }
    });
  });
});

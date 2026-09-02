// Factory Presets - Pre-configured loop settings

export const FACTORY_PRESETS = {
  // Melodic presets
  psytrance-melody: {
    name: 'Psytrance Melody',
    type: 'melodic',
    config: {
      bpm: 145,
      bars: 4,
      key: 'C',
      scale: 'minor',
      density: 0.7
    }
  },
  progressive-lead: {
    name: 'Progressive Lead',
    type: 'lead',
    config: {
      bpm: 138,
      bars: 4,
      key: 'A',
      scale: 'minor',
      octave: 1
    }
  },
  darkpsy-melody: {
    name: 'Darkpsy Melody',
    type: 'melodic',
    config: {
      bpm: 148,
      bars: 4,
      key: 'E',
      scale: 'phrygian',
      density: 0.9
    }
  },

  // Rhythmic presets
  four-on-floor: {
    name: '4-on-Floor',
    type: 'rhythmic',
    config: {
      bpm: 140,
      bars: 4,
      swing: 0
    }
  },
  rolling-bass: {
    name: 'Rolling Bass',
    type: 'bass',
    config: {
      bpm: 145,
      bars: 4,
      key: 'C',
      scale: 'minor',
      pattern: 'root'
    }
  },

  // FX presets
  riser-4bars: {
    name: 'Riser (4 bars)',
    type: 'fx',
    config: {
      bpm: 140,
      bars: 4,
      fxType: 'riser'
    }
  },
  impact: {
    name: 'Impact',
    type: 'fx',
    config: {
      bpm: 140,
      bars: 1,
      fxType: 'impact'
    }
  },

  // Atmospheric presets
  evolving-pad: {
    name: 'Evolving Pad',
    type: 'atmospheric',
    config: {
      bpm: 140,
      bars: 8,
      density: 0.5
    }
  }
};

export function getPreset(id) {
  return FACTORY_PRESETS[id];
}

export function getAllPresets() {
  return Object.entries(FACTORY_PRESETS).map(([id, preset]) => ({
    id,
    ...preset
  }));
}

export function getPresetsByType(type) {
  return getAllPresets().filter(p => p.type === type);
}

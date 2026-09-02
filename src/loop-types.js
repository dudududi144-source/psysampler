// Loop Types - 8 types of loops with metadata

export const LOOP_TYPES = {
  MELODIC: {
    id: 'melodic',
    name: 'Melodic',
    description: 'Melodic loops with scales and progressions',
    category: 'musical',
    color: '#00ff88',
    icon: '♪',
    features: ['scale-aware', 'progression-aware', 'motif-based'],
    defaults: {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor'
    }
  },
  RHYTHMIC: {
    id: 'rhythmic',
    name: 'Rhythmic',
    description: 'Polyrhythmic patterns with swing',
    category: 'rhythm',
    color: '#ff6644',
    icon: '◈',
    features: ['polyrhythmic', 'swing', 'humanization'],
    defaults: {
      bpm: 140,
      bars: 4,
      swing: 0.3
    }
  },
  LEAD: {
    id: 'lead',
    name: 'Lead',
    description: 'Lead melodies with arpeggios',
    category: 'musical',
    color: '#44aaff',
    icon: '♫',
    features: ['arpeggio', 'octave-shift', 'density'],
    defaults: {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
      octave: 0
    }
  },
  FX: {
    id: 'fx',
    name: 'FX',
    description: 'Sound effects: risers, impacts, sweeps',
    category: 'fx',
    color: '#ff44ff',
    icon: '✦',
    features: ['riser', 'impact', 'sweep', 'glitch'],
    defaults: {
      bpm: 140,
      bars: 4,
      fxType: 'riser'
    }
  },
  PERCUSSION: {
    id: 'percussion',
    name: 'Percussion',
    description: 'Percussion patterns and drum loops',
    category: 'rhythm',
    color: '#ffaa00',
    icon: '◉',
    features: ['drum-pattern', 'fill-generation', 'layering'],
    defaults: {
      bpm: 140,
      bars: 4,
      complexity: 0.5
    }
  },
  BASS: {
    id: 'bass',
    name: 'Bass',
    description: 'Basslines: root, walking, octave, pedal',
    category: 'musical',
    color: '#00aaff',
    icon: '♭',
    features: ['root', 'walking', 'octave', 'pedal', 'sidechain-ready'],
    defaults: {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'minor',
      pattern: 'root'
    }
  },
  CHORD: {
    id: 'chord',
    name: 'Chord',
    description: 'Chord progressions and pads',
    category: 'harmonic',
    color: '#aa44ff',
    icon: '♯',
    features: ['diatonic', 'extended-chords', 'voicing'],
    defaults: {
      bpm: 140,
      bars: 4,
      key: 'C',
      scale: 'major',
      progression: 'I-IV-V-I'
    }
  },
  ATMOSPHERIC: {
    id: 'atmospheric',
    name: 'Atmospheric',
    description: 'Pad textures and evolving atmospheres',
    category: 'texture',
    color: '#88ffcc',
    icon: '❋',
    features: ['pad', 'evolving', 'filter-sweep'],
    defaults: {
      bpm: 140,
      bars: 4,
      density: 0.5
    }
  }
};

export function getLoopType(id) {
  return Object.values(LOOP_TYPES).find(t => t.id === id);
}

export function getLoopTypesByCategory(category) {
  return Object.values(LOOP_TYPES).filter(t => t.category === category);
}

export function getAllLoopTypes() {
  return Object.values(LOOP_TYPES);
}

export function validateLoopType(type) {
  return getLoopType(type) !== undefined;
}

// Scale definitions
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

export const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const KEY_TO_MIDI = {
  'C': 60, 'C#': 61, 'D': 62, 'D#': 63, 'E': 64, 'F': 65,
  'F#': 66, 'G': 67, 'G#': 68, 'A': 69, 'A#': 70, 'B': 71
};

// Chord progressions
export const PROGRESSIONS = {
  'I-IV-V-I': [0, 3, 4, 0],
  'I-V-vi-IV': [0, 4, 5, 3],
  'vi-IV-I-V': [5, 3, 0, 4],
  'I-vi-IV-V': [0, 5, 3, 4],
  'ii-V-I': [1, 4, 0],
  'I-IV-vi-V': [0, 3, 5, 4],
  'i-VI-III-VII': [0, 5, 2, 6],
  'i-iv-v-i': [0, 3, 4, 0]
};

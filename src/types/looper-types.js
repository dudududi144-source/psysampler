// Type Definitions for PSY LOOPER

// Loop Types
export const LOOP_TYPES = {
  MELODIC: 'melodic',
  RHYTHMIC: 'rhythmic',
  BASS: 'bass',
  LEAD: 'lead',
  FX: 'fx',
  PERCUSSION: 'percussion',
  CHORD: 'chord',
  ATMOSPHERIC: 'atmospheric',
};

// Slice Types
export const SLICE_TYPES = {
  TRANSIENT: 'transient',
  MANUAL: 'manual',
  BEAT: 'beat',
  BAR: 'bar',
};

// FX Types
export const FX_TYPES = {
  TRANSIENT_SHAPER: 'transient-shaper',
  FILTER: 'filter',
  DELAY: 'delay',
  REVERB: 'reverb',
  BITCRUSHER: 'bitcrusher',
  FORMANT: 'formant',
  VOCODER: 'vocoder',
  GRANULAR: 'granular',
  OTT: 'ott',
  COMPRESSOR: 'compressor',
  SATURATION: 'saturation',
  LIMITER: 'limiter',
};

// Transport States
export const TRANSPORT_STATES = {
  STOPPED: 'stopped',
  PLAYING: 'playing',
  RECORDING: 'recording',
  PAUSED: 'paused',
};

// MIDI Message Types
export const MIDI_MESSAGES = {
  NOTE_ON: 0x90,
  NOTE_OFF: 0x80,
  CC: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  PITCH_BEND: 0xe0,
  CLOCK: 0xf8,
  START: 0xfa,
  STOP: 0xfc,
  CONTINUE: 0xfb,
};

// Automation Curve Types
export const CURVE_TYPES = {
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
  LOGARITHMIC: 'logarithmic',
  SINE: 'sine',
  TRIANGLE: 'triangle',
};

// Performance Modes
export const PERFORMANCE_MODES = {
  ONE_SHOT: 'one-shot',
  LOOP: 'loop',
  GATE: 'gate',
  TOGGLE: 'toggle',
};

// Export Formats
export const EXPORT_FORMATS = {
  WAV: 'wav',
  AIFF: 'aiff',
  MIDI: 'midi',
  REX2: 'rex2',
  JSON: 'json',
};

// Bit Depths
export const BIT_DEPTHS = {
  BIT_16: 16,
  BIT_24: 24,
  BIT_32: 32,
};

// Sample Rates
export const SAMPLE_RATES = {
  SR_44100: 44100,
  SR_48000: 48000,
  SR_88200: 88200,
  SR_96000: 96000,
};

// Oversampling Factors
export const OVERSAMPLING = {
  NONE: 1,
  X2: 2,
  X4: 4,
  X8: 8,
};

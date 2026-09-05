// Math Utilities
// Common mathematical functions for audio processing

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function inverseLerp(a, b, value) {
  return (value - a) / (b - a);
}

export function remap(value, fromMin, fromMax, toMin, toMax) {
  return lerp(toMin, toMax, inverseLerp(fromMin, fromMax, value));
}

export function dbToLinear(db) {
  return 10 ** (db / 20);
}

export function linearToDb(linear) {
  return 20 * Math.log10(linear);
}

export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function beatsToSeconds(beats, bpm) {
  return (beats * 60) / bpm;
}

export function secondsToBeats(seconds, bpm) {
  return (seconds * bpm) / 60;
}

export function bpmToMs(bpm, subdivision = 4) {
  return (60000 / bpm) * (4 / subdivision);
}

export function msToBpm(ms, subdivision = 4) {
  return (60000 * 4) / (ms * subdivision);
}

export function semitonesToRatio(semitones) {
  return 2 ** (semitones / 12);
}

export function ratioToSemitones(ratio) {
  return 12 * Math.log2(ratio);
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function easeOut(t) {
  return 1 - (1 - t) ** 2;
}

export function easeIn(t) {
  return t * t;
}

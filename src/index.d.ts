// PSY LOOPER TypeScript Definitions

export interface AudioBuffer {
  length: number;
  numberOfChannels: number;
  sampleRate: number;
  getChannelData(channel: number): Float32Array;
}

export interface LooperDeviceOptions {
  sampleRate?: number;
  numBanks?: number;
  oversampling?: number;
}

export interface LoopAnalysis {
  tempo?: number;
  key?: string;
  scale?: string;
  type?: string;
  slices: Slice[];
  duration: number;
  rms: number;
  peak: number;
}

export interface Slice {
  start: number;
  end: number;
  duration: number;
  index: number;
}

export interface FXOptions {
  type: string;
  params?: Record<string, number>;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  tags?: string[];
  config: Record<string, any>;
}

export interface AutomationPoint {
  time: number;
  value: number;
  curveType?: string;
}

export interface MIDIInput {
  id: string;
  name: string;
  manufacturer?: string;
}

export class LooperDevice {
  constructor(options?: LooperDeviceOptions);
  initialize(): Promise<void>;
  loadLoop(file: string | Blob): Promise<LoopAnalysis>;
  generateLoop(type: string, options?: Record<string, any>): Promise<AudioBuffer>;
  triggerSlice(bank: number, slice: number, velocity?: number): void;
  setBank(bank: number): void;
  play(): void;
  stop(): void;
  record(): void;
  overdub(): void;
  undo(): void;
  redo(): void;
  export(format: string): Promise<Blob>;
  getAnalysis(): LoopAnalysis;
  dispose(): void;
}

export class SliceEngine {
  constructor(device: LooperDevice);
  addVoice(bank: number, slice: number): void;
  removeVoice(bank: number, slice: number): void;
  triggerSlice(bank: number, slice: number, velocity?: number): void;
  stopAll(): void;
}

export class LoopAnalyzer {
  analyze(buffer: AudioBuffer): LoopAnalysis;
  detectTempo(buffer: AudioBuffer): number;
  detectKey(buffer: AudioBuffer): { key: string; scale: string };
  detectSlices(buffer: AudioBuffer): Slice[];
}

export class LoopGenerator {
  generate(type: string, options?: Record<string, any>): Promise<AudioBuffer>;
  generateMelodic(options?: Record<string, any>): Promise<AudioBuffer>;
  generateRhythmic(options?: Record<string, any>): Promise<AudioBuffer>;
  generateBass(options?: Record<string, any>): Promise<AudioBuffer>;
  generateLead(options?: Record<string, any>): Promise<AudioBuffer>;
  generateFX(options?: Record<string, any>): Promise<AudioBuffer>;
  generatePercussion(options?: Record<string, any>): Promise<AudioBuffer>;
  generateChord(options?: Record<string, any>): Promise<AudioBuffer>;
  generateAtmospheric(options?: Record<string, any>): Promise<AudioBuffer>;
}

export class AudioGraph {
  constructor(context: AudioContext);
  createBus(id: string): void;
  connectBuses(from: string, to: string): void;
  addFX(bus: string, fx: FXOptions): void;
  removeFX(bus: string, fxId: string): void;
  setMasterVolume(volume: number): void;
}

export class FXChain {
  constructor(context: AudioContext);
  addFX(type: string, params?: Record<string, number>): string;
  removeFX(fxId: string): void;
  setParameter(fxId: string, param: string, value: number): void;
  bypass(fxId: string, bypass: boolean): void;
}

export class MIDIIntegration {
  constructor(device: LooperDevice);
  initialize(): Promise<void>;
  mapSliceToNote(note: number, slice: number): void;
  mapCCToParam(cc: number, param: string, min?: number, max?: number): void;
  enableClock(): void;
  disableClock(): void;
  sendNoteOn(note: number, velocity?: number): void;
  sendNoteOff(note: number): void;
  sendCC(cc: number, value: number): void;
}

export class Determinism {
  constructor(seed?: number);
  next(): number;
  nextInt(min: number, max: number): number;
  nextFloat(min: number, max: number): number;
  nextBool(probability?: number): boolean;
  pick<T>(array: T[]): T;
  shuffle<T>(array: T[]): T[];
  seededProbability(seed: number, min: number, max: number): number;
  seededRandomize(seed: number): number;
  clone(): Determinism;
  getState(): any;
  setState(state: any): void;
}

export class Recorder {
  constructor(device: LooperDevice);
  startRecording(): void;
  stopRecording(): AudioBuffer;
  startOverdub(): void;
  stopOverdub(): void;
  undo(): void;
  redo(): void;
}

export class REX2Parser {
  parse(buffer: ArrayBuffer): Promise<LoopAnalysis>;
  export(analysis: LoopAnalysis, buffer: AudioBuffer): Promise<Blob>;
}

export class CoPilot {
  constructor(device: LooperDevice);
  suggest(): Promise<string>;
  learn(action: string, reward: number): void;
  reset(): void;
}

export class UIManager {
  constructor(device: LooperDevice);
  render(container: HTMLElement): void;
  update(): void;
  dispose(): void;
}

export class ExportManager {
  constructor(device: LooperDevice);
  exportWAV(options?: { bitDepth?: number }): Promise<Blob>;
  exportMIDI(): Promise<Blob>;
  exportJSON(): Promise<Blob>;
  exportProject(): Promise<Blob>;
}

export class AutomationManager {
  createLane(param: string): AutomationLane;
  getLane(param: string): AutomationLane;
  removeLane(param: string): void;
  clear(): void;
}

export class AutomationLane {
  addPoint(time: number, value: number, curveType?: string): void;
  removePoint(index: number): void;
  getValueAt(time: number): number;
  getPoints(): AutomationPoint[];
  setCurveType(type: string): void;
  clear(): void;
}

export class StepSequencer {
  constructor(steps?: number, tracks?: number);
  setStep(track: number, step: number, active: boolean, velocity?: number): void;
  getStep(track: number, step: number): { active: boolean; velocity: number };
  play(): void;
  stop(): void;
  nextStep(): void;
  getActiveEvents(step: number): Array<{ track: number; velocity: number }>;
  export(): any;
  import(data: any): void;
}

// Utility exports
export { clamp, lerp, map } from './utils/math-utils';
export { normalizeAudio, reverseAudio, fadeIn, fadeOut } from './utils/audio-utils';
export { validateConfig } from './utils/validation-utils';
export { createLogger } from './utils/logger';
export { StateManager } from './utils/state-manager';
export { PerformanceMonitor } from './utils/performance-monitor';
export { AudioVisualizer } from './utils/audio-visualizer';
export { PresetManager } from './utils/preset-manager';
export { MIDILearn } from './utils/midi-learn';
export { AutomationCurve } from './utils/automation-curves';
export { ErrorHandler } from './utils/error-handler';
export { AudioExporter } from './utils/audio-export';
export { AudioAnalyzer } from './utils/audio-analysis';
export { PerformanceOptimizer } from './utils/performance-optimizer';
export { Synthesizer } from './utils/audio-synthesis';
export { AudioRouter } from './utils/audio-routing';

// Version
export const VERSION: string;

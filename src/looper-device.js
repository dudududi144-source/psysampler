// PSY LOOPER - Main Device Implementation (HOW Layer)
// Implements PsyDevice contract from psy-foundation

import { SliceEngine } from './slice-engine.js';
import { SliceBank } from './slice-bank.js';
import { AudioGraph } from './audio-graph.js';
import { Determinism } from './determinism.js';
import { LoopGenerator } from './generator.js';
import { LoopAnalyzer } from './analyzer.js';

export class LooperDevice {
  constructor(config = {}) {
    this.config = {
      sampleRate: config.sampleRate || 48000,
      numBanks: config.numBanks || 8,
      oversampling: config.oversampling || 4,
      ...config
    };

    // Core components
    this.determinism = new Determinism();
    this.sliceBanks = [];
    for (let i = 0; i < this.config.numBanks; i++) {
      this.sliceBanks.push(new SliceBank(i, this.determinism));
    }
    
    this.sliceEngine = new SliceEngine(this.sliceBanks, this.config);
    this.audioGraph = new AudioGraph(this.config);
    this.generator = new LoopGenerator(this.determinism);
    this.analyzer = new LoopAnalyzer();
    
    // State
    this.currentBank = 0;
    this.isPlaying = false;
    this.transport = null;
    this.context = null;
    
    // Event handlers
    this.eventHandlers = new Map();
  }

  // PsyDevice contract implementation
  onTransport(transport) {
    this.transport = transport;
    this.sliceEngine.onTransport(transport);
    this.emit('transport', transport);
  }

  onContext(context) {
    this.context = context;
    this.audioGraph.init(context);
    this.sliceEngine.onContext(context);
    this.emit('context', context);
  }

  onEvent(event) {
    // Handle MusicalEvent from host
    if (event.type === 'note') {
      this.sliceEngine.triggerSlice(event.bank, event.slice, event.velocity);
    }
    this.emit('event', event);
  }

  // Public API
  loadLoop(audioBuffer, bankIndex = 0) {
    const analysis = this.analyzer.analyze(audioBuffer);
    const slices = this.analyzer.detectSlices(audioBuffer, analysis);
    
    this.sliceBanks[bankIndex].load(audioBuffer, slices, analysis);
    this.emit('loop-loaded', { bank: bankIndex, analysis });
    
    return analysis;
  }

  async generateLoop(type, options = {}) {
    const loop = await this.generator.generate(type, {
      ...options,
      seed: this.determinism.seed
    });
    
    const analysis = this.analyzer.analyze(loop.audio);
    const slices = this.analyzer.detectSlices(loop.audio, analysis);
    
    const bankIndex = options.bank || this.currentBank;
    this.sliceBanks[bankIndex].load(loop.audio, slices, analysis);
    
    this.emit('loop-generated', { type, bank: bankIndex, analysis });
    return { loop, analysis };
  }

  triggerSlice(bank, slice, velocity = 1.0) {
    this.sliceEngine.trigger(bank, slice, velocity);
  }

  triggerAll() {
    this.sliceBanks.forEach((bank, idx) => {
      if (bank.hasLoop) {
        this.sliceEngine.trigger(idx, 0, 1.0);
      }
    });
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.sliceEngine.play();
    this.emit('play');
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.sliceEngine.stop();
    this.emit('stop');
  }

  setBank(index) {
    if (index >= 0 && index < this.config.numBanks) {
      this.currentBank = index;
      this.emit('bank-change', index);
    }
  }

  getSliceInfo(bank, slice) {
    return this.sliceBanks[bank].getSliceInfo(slice);
  }

  getBankInfo(bank) {
    return this.sliceBanks[bank].getInfo();
  }

  // Event system
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => handler(data));
    }
  }

  // Export/Import
  exportProject() {
    return {
      version: '1.0.0',
      seed: this.determinism.seed,
      banks: this.sliceBanks.map(bank => bank.export()),
      config: this.config
    };
  }

  importProject(project) {
    this.determinism.seed = project.seed;
    project.banks.forEach((bankData, idx) => {
      this.sliceBanks[idx].import(bankData);
    });
    this.emit('project-loaded', project);
  }

  // Cleanup
  dispose() {
    this.stop();
    this.audioGraph.dispose();
    this.sliceEngine.dispose();
    this.eventHandlers.clear();
  }
}

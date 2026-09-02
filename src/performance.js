// Performance Mode - Live performance features

export class PerformanceMode {
  constructor(device) {
    this.device = device;
    this.pads = new Array(64).fill(null); // 8x8 pad grid
    this.macros = new Array(8).fill(null); // 8 performance macros
    this.xyPad = { x: 0.5, y: 0.5 };
    this.activeMode = 'one-shot'; // one-shot, loop, gate, slice-sequencer
  }

  // Pad grid management
  setPad(index, config) {
    if (index >= 0 && index < 64) {
      this.pads[index] = config;
    }
  }

  getPad(index) {
    return this.pads[index];
  }

  triggerPad(index, velocity = 1.0) {
    const pad = this.pads[index];
    if (!pad) return;
    
    switch (pad.type) {
      case 'slice':
        this.device.triggerSlice(pad.bank, pad.slice, velocity);
        break;
      case 'loop':
        this.playLoop(pad.bank);
        break;
      case 'fx':
        this.triggerFX(pad.fxType);
        break;
      case 'macro':
        this.triggerMacro(pad.macroIndex);
        break;
    }
  }

  // Loop modes
  setMode(mode) {
    const validModes = ['one-shot', 'loop', 'gate', 'slice-sequencer'];
    if (validModes.includes(mode)) {
      this.activeMode = mode;
    }
  }

  playLoop(bank) {
    this.device.setBank(bank);
    this.device.play();
  }

  stopLoop() {
    this.device.stop();
  }

  // Performance macros
  setMacro(index, config) {
    if (index >= 0 && index < 8) {
      this.macros[index] = config;
    }
  }

  triggerMacro(index) {
    const macro = this.macros[index];
    if (!macro) return;
    
    // Apply macro to device parameters
    if (macro.filterCutoff !== undefined) {
      // Set filter cutoff
    }
    if (macro.reverbMix !== undefined) {
      // Set reverb mix
    }
    if (macro.delayTime !== undefined) {
      // Set delay time
    }
  }

  // XY pad control
  setXY(x, y) {
    this.xyPad.x = Math.max(0, Math.min(1, x));
    this.xyPad.y = Math.max(0, Math.min(1, y));
    
    // Map XY to parameters
    this.applyXY();
  }

  applyXY() {
    // Map X to filter cutoff, Y to reverb mix (example)
    const filterCutoff = this.xyPad.x * 20000;
    const reverbMix = this.xyPad.y;
    
    // Apply to device
  }

  // Live looping features
  startRecording() {
    // Start recording mode
    this.recording = true;
  }

  stopRecording() {
    this.recording = false;
  }

  overdub() {
    // Add layer to existing loop
    this.overdubMode = true;
  }

  undo() {
    // Undo last action
  }

  redo() {
    // Redo last undone action
  }

  // Quantize
  quantizeEvents(events, gridSize = 16) {
    return events.map(event => {
      const quantizedTime = Math.round(event.time * gridSize) / gridSize;
      return { ...event, time: quantizedTime };
    });
  }

  // Humanize
  humanizeEvents(events, amount = 0.1) {
    return events.map(event => {
      const offset = (Math.random() - 0.5) * amount;
      return { ...event, time: event.time + offset };
    });
  }

  // Export performance
  exportPerformance() {
    return {
      pads: this.pads,
      macros: this.macros,
      xyPad: this.xyPad,
      mode: this.activeMode
    };
  }

  // Import performance
  importPerformance(data) {
    this.pads = data.pads || this.pads;
    this.macros = data.macros || this.macros;
    this.xyPad = data.xyPad || this.xyPad;
    this.activeMode = data.mode || 'one-shot';
  }
}

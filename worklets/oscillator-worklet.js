// Advanced Oscillator AudioWorklet
// PolyBLEP oscillators with multiple waveforms

class OscillatorWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'frequency', defaultValue: 440, minValue: 20, maxValue: 20000 },
      { name: 'waveform', defaultValue: 0, minValue: 0, maxValue: 4 },
      { name: 'pulseWidth', defaultValue: 0.5, minValue: 0.01, maxValue: 0.99 },
      { name: 'detune', defaultValue: 0, minValue: -100, maxValue: 100 },
      { name: 'phase', defaultValue: 0, minValue: 0, maxValue: 1 }
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.lastOutput = 0;
  }

  polyBlep(t, dt) {
    if (t < dt) {
      t = t / dt;
      return t + t - t * t - 1;
    } else if (t > 1 - dt) {
      t = (t - 1) / dt;
      return t * t + t + t + 1;
    }
    return 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if (output[0].length === 0) return true;

    const frequency = parameters.frequency[0];
    const waveform = Math.floor(parameters.waveform[0]);
    const pulseWidth = parameters.pulseWidth[0];
    const detune = parameters.detune[0];
    const phaseOffset = parameters.phase[0];

    const freq = frequency * Math.pow(2, detune / 1200);
    const phaseInc = freq / sampleRate;

    for (let i = 0; i < output[0].length; i++) {
      let sample = 0;
      const phaseWithOffset = (this.phase + phaseOffset) % 1;

      switch (waveform) {
        case 0: // Sine
          sample = Math.sin(2 * Math.PI * phaseWithOffset);
          break;

        case 1: // Sawtooth (PolyBLEP)
          sample = 2 * phaseWithOffset - 1;
          sample -= this.polyBlep(phaseWithOffset, phaseInc);
          break;

        case 2: // Square (PolyBLEP)
          sample = phaseWithOffset < 0.5 ? 1 : -1;
          sample += this.polyBlep(phaseWithOffset, phaseInc);
          sample -= this.polyBlep((phaseWithOffset + 0.5) % 1, phaseInc);
          break;

        case 3: // Triangle
          sample = phaseWithOffset < 0.5 
            ? 4 * phaseWithOffset - 1 
            : 3 - 4 * phaseWithOffset;
          break;

        case 4: // Pulse (variable width)
          sample = phaseWithOffset < pulseWidth ? 1 : -1;
          sample += this.polyBlep(phaseWithOffset, phaseInc);
          sample -= this.polyBlep((phaseWithOffset + pulseWidth) % 1, phaseInc);
          break;
      }

      output[0][i] = sample;
      if (output[1]) {
        output[1][i] = sample;
      }

      this.phase = (this.phase + phaseInc) % 1;
    }

    return true;
  }
}

registerProcessor('oscillator-worklet', OscillatorWorklet);

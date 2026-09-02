// Vocoder AudioWorklet
// 16-band vocoder with carrier and modulator

class VocoderWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bands', defaultValue: 16, minValue: 4, maxValue: 32 },
      { name: 'attack', defaultValue: 5, minValue: 1, maxValue: 50 },
      { name: 'release', defaultValue: 50, minValue: 10, maxValue: 200 },
      { name: 'mix', defaultValue: 1, minValue: 0, maxValue: 1 }
    ];
  }

  constructor() {
    super();
    this.bands = [];
    this.numBands = 16;
    this.initBands();
  }

  initBands() {
    const minFreq = 80;
    const maxFreq = 8000;
    
    for (let i = 0; i < this.numBands; i++) {
      const freq = minFreq * Math.pow(maxFreq / minFreq, i / (this.numBands - 1));
      this.bands.push({
        frequency: freq,
        modEnvelope: 0,
        carrierFilter: { x1: 0, x2: 0, y1: 0, y2: 0 },
        modFilter: { x1: 0, x2: 0, y1: 0, y2: 0 }
      });
    }
  }

  bandpassFilter(input, band, filterState) {
    const Q = 5;
    const omega = 2 * Math.PI * band.frequency / sampleRate;
    const alpha = Math.sin(omega) / (2 * Q);
    
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(omega);
    const a2 = 1 - alpha;

    const output = (b0 * input + b1 * filterState.x1 + b2 * filterState.x2 
                    - a1 * filterState.y1 - a2 * filterState.y2) / a0;

    filterState.x2 = filterState.x1;
    filterState.x1 = input;
    filterState.y2 = filterState.y1;
    filterState.y1 = output;

    return output;
  }

  envelopeFollower(input, band, attack, release) {
    const abs = Math.abs(input);
    const attackCoeff = 1 - Math.exp(-1 / (attack * sampleRate / 1000));
    const releaseCoeff = 1 - Math.exp(-1 / (release * sampleRate / 1000));
    
    if (abs > band.modEnvelope) {
      band.modEnvelope += attackCoeff * (abs - band.modEnvelope);
    } else {
      band.modEnvelope += releaseCoeff * (abs - band.modEnvelope);
    }
    
    return band.modEnvelope;
  }

  process(inputs, outputs, parameters) {
    const modulator = inputs[0];
    const carrier = inputs[1];
    const output = outputs[0];

    if (!modulator[0] || !carrier[0]) return true;

    const bands = parameters.bands[0];
    const attack = parameters.attack[0];
    const release = parameters.release[0];
    const mix = parameters.mix[0];

    if (bands !== this.numBands) {
      this.numBands = bands;
      this.initBands();
    }

    for (let i = 0; i < output[0].length; i++) {
      let vocodedSample = 0;

      for (let b = 0; b < this.numBands; b++) {
        const band = this.bands[b];
        
        // Filter modulator
        const modFiltered = this.bandpassFilter(modulator[0][i], band, band.modFilter);
        
        // Envelope follower
        const envelope = this.envelopeFollower(modFiltered, band, attack, release);
        
        // Filter carrier
        const carrierFiltered = this.bandpassFilter(carrier[0][i], band, band.carrierFilter);
        
        // Apply envelope to carrier
        vocodedSample += carrierFiltered * envelope;
      }

      // Mix
      output[0][i] = modulator[0][i] * (1 - mix) + vocodedSample * mix;
      if (output[1]) {
        output[1][i] = output[0][i];
      }
    }

    return true;
  }
}

registerProcessor('vocoder-worklet', VocoderWorklet);

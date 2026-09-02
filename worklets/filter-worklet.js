// Advanced Filter AudioWorklet
// ZDF SVF (Zero-Delay Feedback State Variable Filter)

class FilterWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'cutoff', defaultValue: 1000, minValue: 20, maxValue: 20000 },
      { name: 'resonance', defaultValue: 0, minValue: 0, maxValue: 20 },
      { name: 'drive', defaultValue: 1, minValue: 0.1, maxValue: 10 },
      { name: 'filterType', defaultValue: 0, minValue: 0, maxValue: 4 },
      { name: 'mix', defaultValue: 1, minValue: 0, maxValue: 1 }
    ];
  }

  constructor() {
    super();
    this.ic1eq = 0;
    this.ic2eq = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const cutoff = parameters.cutoff[0];
    const resonance = parameters.resonance[0];
    const drive = parameters.drive[0];
    const filterType = Math.floor(parameters.filterType[0]);
    const mix = parameters.mix[0];

    // Calculate filter coefficients
    const g = Math.tan(Math.PI * cutoff / sampleRate);
    const k = 2 - resonance / 10;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const a3 = g * a2;

    for (let i = 0; i < output[0].length; i++) {
      const inputSample = input[0][i] * drive;
      
      // Apply soft saturation
      const saturated = Math.tanh(inputSample);

      // ZDF SVF filter
      const v3 = saturated - this.ic2eq;
      const v1 = a1 * this.ic1eq + a2 * v3;
      const v2 = this.ic2eq + a2 * this.ic1eq + a3 * v3;
      
      this.ic1eq = 2 * v1 - this.ic1eq;
      this.ic2eq = 2 * v2 - this.ic2eq;

      // Select filter type
      let filtered;
      switch (filterType) {
        case 0: // Lowpass
          filtered = v2;
          break;
        case 1: // Highpass
          filtered = saturated - k * v1 - v2;
          break;
        case 2: // Bandpass
          filtered = v1;
          break;
        case 3: // Notch
          filtered = saturated - k * v1;
          break;
        case 4: // Peak
          filtered = saturated - k * v1 - 2 * v2;
          break;
        default:
          filtered = v2;
      }

      // Mix dry and wet
      output[0][i] = saturated * (1 - mix) + filtered * mix;
      if (output[1]) {
        output[1][i] = output[0][i];
      }
    }

    return true;
  }
}

registerProcessor('filter-worklet', FilterWorklet);

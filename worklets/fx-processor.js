// PSY LOOPER - FX Processor Worklet

class FXProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.fxType = 'none';
    this.params = {};

    this.port.onmessage = (event) => {
      if (event.data.type === 'set-fx') {
        this.fxType = event.data.fxType;
        this.params = event.data.params;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0] || !output || !output[0]) {
      return true;
    }

    const numSamples = input[0].length;

    switch (this.fxType) {
      case 'saturation':
        this.processSaturation(input, output, numSamples);
        break;
      case 'filter':
        this.processFilter(input, output, numSamples);
        break;
      case 'delay':
        this.processDelay(input, output, numSamples);
        break;
      default:
        // Pass through
        for (let channel = 0; channel < input.length; channel++) {
          output[channel].set(input[channel]);
        }
    }

    return true;
  }

  processSaturation(input, output, numSamples) {
    const drive = this.params.drive || 1.0;

    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < numSamples; i++) {
        output[channel][i] = Math.tanh(input[channel][i] * drive);
      }
    }
  }

  processFilter(input, output, numSamples) {
    // Simplified filter (real implementation would use ZDF SVF)
    const freq = this.params.frequency || 1000;
    const Q = this.params.Q || 1.0;

    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < numSamples; i++) {
        output[channel][i] = input[channel][i]; // Pass through for now
      }
    }
  }

  processDelay(input, output, numSamples) {
    // Simplified delay
    const time = this.params.time || 0.5;
    const feedback = this.params.feedback || 0.5;

    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < numSamples; i++) {
        output[channel][i] = input[channel][i];
      }
    }
  }
}

registerProcessor('fx-processor', FXProcessor);

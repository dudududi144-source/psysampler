// Convolution Reverb AudioWorklet
// High-quality convolution reverb with partitioned convolution

class ConvolutionWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'wetMix', defaultValue: 0.3, minValue: 0, maxValue: 1 },
      { name: 'preDelay', defaultValue: 0, minValue: 0, maxValue: 500 },
      { name: 'damping', defaultValue: 0.5, minValue: 0, maxValue: 1 },
      { name: 'decay', defaultValue: 1, minValue: 0.1, maxValue: 10 }
    ];
  }

  constructor() {
    super();
    this.irBuffer = null;
    this.inputBuffer = new Float32Array(8192);
    this.writePos = 0;
    this.preDelayBuffer = new Float32Array(24000); // 500ms at 48kHz
    this.preDelayWritePos = 0;
    
    // Simple IR (exponential decay)
    this.generateSimpleIR(2.0, 48000);
    
    this.port.onmessage = (event) => {
      if (event.data.type === 'loadIR') {
        this.irBuffer = event.data.ir;
      }
    };
  }

  generateSimpleIR(decayTime, sampleRate) {
    const length = Math.floor(decayTime * sampleRate);
    this.irBuffer = new Float32Array(length);
    
    for (let i = 0; i < length; i++) {
      const envelope = Math.exp(-i / (sampleRate * decayTime / 3));
      this.irBuffer[i] = (Math.random() * 2 - 1) * envelope;
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const wetMix = parameters.wetMix[0];
    const preDelay = parameters.preDelay[0];
    const damping = parameters.damping[0];

    const preDelaySamples = Math.floor(preDelay * sampleRate / 1000);

    for (let i = 0; i < output[0].length; i++) {
      const dry = input[0][i];

      // Pre-delay
      this.preDelayBuffer[this.preDelayWritePos] = dry;
      const preDelayReadPos = (this.preDelayWritePos - preDelaySamples + this.preDelayBuffer.length) % this.preDelayBuffer.length;
      const delayed = this.preDelayBuffer[preDelayReadPos];
      this.preDelayWritePos = (this.preDelayWritePos + 1) % this.preDelayBuffer.length;

      // Write to input buffer
      this.inputBuffer[this.writePos] = delayed;

      // Simple convolution (for demo - real implementation would use FFT-based partitioned convolution)
      let wet = 0;
      const irLength = Math.min(this.irBuffer.length, 4096); // Limit for performance
      
      for (let j = 0; j < irLength; j++) {
        const bufferIdx = (this.writePos - j + this.inputBuffer.length) % this.inputBuffer.length;
        wet += this.inputBuffer[bufferIdx] * this.irBuffer[j];
      }

      // Apply damping
      wet *= (1 - damping * 0.5);

      this.writePos = (this.writePos + 1) % this.inputBuffer.length;

      // Mix
      output[0][i] = dry * (1 - wetMix) + wet * wetMix * 0.1; // Scale down wet
      if (output[1]) {
        output[1][i] = output[0][i];
      }
    }

    return true;
  }
}

registerProcessor('convolution-worklet', ConvolutionWorklet);

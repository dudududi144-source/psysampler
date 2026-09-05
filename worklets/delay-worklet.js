// Delay AudioWorklet
// High-quality stereo delay with feedback and filtering

class DelayWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'delayTime', defaultValue: 0.25, minValue: 0, maxValue: 2 },
      { name: 'feedback', defaultValue: 0.4, minValue: 0, maxValue: 0.95 },
      { name: 'mix', defaultValue: 0.3, minValue: 0, maxValue: 1 },
      { name: 'filterCutoff', defaultValue: 8000, minValue: 200, maxValue: 20000 },
      { name: 'stereoWidth', defaultValue: 0.5, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.bufferSize = sampleRate * 2; // 2 seconds max delay
    this.leftBuffer = new Float32Array(this.bufferSize);
    this.rightBuffer = new Float32Array(this.bufferSize);
    this.writePos = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const delayTime = parameters.delayTime[0];
    const feedback = parameters.feedback[0];
    const mix = parameters.mix[0];
    const cutoff = parameters.filterCutoff[0];
    const stereoWidth = parameters.stereoWidth[0];

    const delaySamples = Math.floor(delayTime * sampleRate);

    for (let i = 0; i < output[0].length; i++) {
      const dryLeft = input[0][i] || 0;
      const dryRight = input[1] ? input[1][i] : dryLeft;

      // Read from delay buffer
      const readPos = (this.writePos - delaySamples + this.bufferSize) % this.bufferSize;
      let delayedLeft = this.leftBuffer[readPos];
      let delayedRight = this.rightBuffer[readPos];

      // Apply stereo width
      const mid = (delayedLeft + delayedRight) * 0.5;
      const side = (delayedLeft - delayedRight) * 0.5;
      delayedLeft = mid + side * stereoWidth;
      delayedRight = mid - side * stereoWidth;

      // Simple lowpass filter on feedback
      const filterCoeff = Math.min(cutoff / sampleRate, 0.99);
      delayedLeft =
        delayedLeft * filterCoeff +
        this.leftBuffer[(readPos - 1 + this.bufferSize) % this.bufferSize] * (1 - filterCoeff);
      delayedRight =
        delayedRight * filterCoeff +
        this.rightBuffer[(readPos - 1 + this.bufferSize) % this.bufferSize] * (1 - filterCoeff);

      // Write to delay buffer with feedback
      this.leftBuffer[this.writePos] = dryLeft + delayedLeft * feedback;
      this.rightBuffer[this.writePos] = dryRight + delayedRight * feedback;

      // Mix dry and wet
      output[0][i] = dryLeft * (1 - mix) + delayedLeft * mix;
      output[1][i] = dryRight * (1 - mix) + delayedRight * mix;

      this.writePos = (this.writePos + 1) % this.bufferSize;
    }

    return true;
  }
}

registerProcessor('delay-worklet', DelayWorklet);

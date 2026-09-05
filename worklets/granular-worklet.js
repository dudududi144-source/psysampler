// Granular Synthesis AudioWorklet
// High-quality granular synthesis processor

class GranularWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'grainSize', defaultValue: 50, minValue: 10, maxValue: 500 },
      { name: 'grainDensity', defaultValue: 20, minValue: 1, maxValue: 100 },
      { name: 'pitchRandom', defaultValue: 0, minValue: 0, maxValue: 12 },
      { name: 'panSpread', defaultValue: 0.5, minValue: 0, maxValue: 1 },
      { name: 'wetMix', defaultValue: 0.5, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.grains = [];
    this.writePosition = 0;
    this.bufferSize = sampleRate * 2; // 2 second buffer
    this.buffer = new Float32Array(this.bufferSize);
    this.nextGrainTime = 0;
  }

  createGrain(readPosition, duration, pitch, pan) {
    return {
      readPosition,
      writePosition: this.writePosition,
      duration,
      pitch,
      pan,
      age: 0,
    };
  }

  hannWindow(x) {
    return 0.5 * (1 - Math.cos(2 * Math.PI * x));
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const grainSize = parameters.grainSize[0];
    const grainDensity = parameters.grainDensity[0];
    const pitchRandom = parameters.pitchRandom[0];
    const panSpread = parameters.panSpread[0];
    const wetMix = parameters.wetMix[0];

    const grainInterval = 1000 / grainDensity;
    const currentTimeMs = currentTime * 1000; // global AudioWorklet clock (seconds) -> ms

    // Create new grains
    while (this.nextGrainTime <= currentTimeMs) {
      const readPos = Math.random() * this.bufferSize;
      const duration = grainSize + (Math.random() - 0.5) * grainSize * 0.2;
      const pitch = 1 + ((Math.random() - 0.5) * pitchRandom) / 12;
      const pan = (Math.random() - 0.5) * 2 * panSpread;

      this.grains.push(this.createGrain(readPos, duration, pitch, pan));
      this.nextGrainTime += grainInterval;
    }

    // Process samples
    for (let i = 0; i < output[0].length; i++) {
      // Write input to buffer
      this.buffer[this.writePosition] = input[0][i];
      this.writePosition = (this.writePosition + 1) % this.bufferSize;

      // Generate granular output
      let leftOut = 0;
      let rightOut = 0;

      // Process active grains
      this.grains = this.grains.filter((grain) => {
        grain.age += (1 / sampleRate) * 1000;

        if (grain.age >= grain.duration) {
          return false;
        }

        const progress = grain.age / grain.duration;
        const envelope = this.hannWindow(progress);

        const readPos = (grain.readPosition + grain.age * grain.pitch) % this.bufferSize;
        const readIndex = Math.floor(readPos);
        const frac = readPos - readIndex;

        // Linear interpolation
        const sample1 = this.buffer[readIndex];
        const sample2 = this.buffer[(readIndex + 1) % this.bufferSize];
        const sample = sample1 + frac * (sample2 - sample1);

        const grainSample = sample * envelope;

        // Apply pan
        leftOut += grainSample * Math.cos(((grain.pan + 1) * Math.PI) / 4);
        rightOut += grainSample * Math.sin(((grain.pan + 1) * Math.PI) / 4);

        return true;
      });

      // Mix dry and wet
      const dry = input[0][i];
      output[0][i] = dry * (1 - wetMix) + leftOut * wetMix;
      output[1][i] = dry * (1 - wetMix) + rightOut * wetMix;
    }

    return true;
  }
}

registerProcessor('granular-worklet', GranularWorklet);

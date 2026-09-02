// Chorus AudioWorklet
// Multi-voice chorus effect with LFO modulation

class ChorusWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'rate', defaultValue: 1.5, minValue: 0.1, maxValue: 5 },
      { name: 'depth', defaultValue: 5, minValue: 0.5, maxValue: 20 },
      { name: 'mix', defaultValue: 0.5, minValue: 0, maxValue: 1 },
      { name: 'voices', defaultValue: 3, minValue: 1, maxValue: 6 },
      { name: 'feedback', defaultValue: 0, minValue: 0, maxValue: 0.5 }
    ];
  }

  constructor() {
    super();
    this.bufferSize = sampleRate * 0.1; // 100ms buffer
    this.buffer = new Float32Array(this.bufferSize);
    this.writePos = 0;
    this.lfoPhases = [];
    
    // Initialize LFO phases for each voice
    for (let i = 0; i < 6; i++) {
      this.lfoPhases.push(i / 6); // Spread phases evenly
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const rate = parameters.rate[0];
    const depth = parameters.depth[0];
    const mix = parameters.mix[0];
    const numVoices = Math.floor(parameters.voices[0]);
    const feedback = parameters.feedback[0];

    for (let i = 0; i < output[0].length; i++) {
      const dry = input[0][i] || 0;

      // Write to buffer
      this.buffer[this.writePos] = dry;

      // Process chorus voices
      let wet = 0;
      const phaseInc = rate / sampleRate;

      for (let voice = 0; voice < numVoices; voice++) {
        // Update LFO phase
        this.lfoPhases[voice] = (this.lfoPhases[voice] + phaseInc) % 1;
        
        // Calculate delay modulation
        const lfo = Math.sin(2 * Math.PI * this.lfoPhases[voice]);
        const delayMs = 10 + lfo * depth; // Base delay + modulation
        const delaySamples = Math.floor(delayMs * sampleRate / 1000);
        
        // Read from buffer with interpolation
        const readPos = (this.writePos - delaySamples + this.bufferSize) % this.bufferSize;
        const readPosInt = Math.floor(readPos);
        const frac = readPos - readPosInt;
        
        const sample1 = this.buffer[readPosInt];
        const sample2 = this.buffer[(readPosInt + 1) % this.bufferSize];
        const delayed = sample1 + frac * (sample2 - sample1);
        
        wet += delayed;
      }

      // Normalize and apply feedback
      wet = wet / numVoices;
      
      // Mix dry and wet
      output[0][i] = dry * (1 - mix) + wet * mix;
      if (output[1]) {
        output[1][i] = output[0][i];
      }

      this.writePos = (this.writePos + 1) % this.bufferSize;
    }

    return true;
  }
}

registerProcessor('chorus-worklet', ChorusWorklet);

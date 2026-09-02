// Pitch Shift - High-quality pitch shifting

export class PitchShifter {
  constructor(sampleRate = 48000) {
    this.sampleRate = sampleRate;
  }

  shift(audioBuffer, semitones) {
    if (semitones === 0) return audioBuffer;
    
    const ratio = Math.pow(2, semitones / 12);
    const inputData = audioBuffer.getChannelData(0);
    const outputData = new Float32Array(inputData.length);
    
    // Granular pitch shifting
    this.granularShift(inputData, outputData, ratio);
    
    return this.createBuffer(outputData, this.sampleRate);
  }

  granularShift(input, output, ratio) {
    const grainSize = 2048;
    const overlap = grainSize / 2;
    const numGrains = Math.ceil(input.length / (grainSize - overlap));
    
    // Window function
    const window = new Float32Array(grainSize);
    for (let i = 0; i < grainSize; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / grainSize));
    }
    
    for (let g = 0; g < numGrains; g++) {
      const inputPos = g * (grainSize - overlap);
      const outputPos = g * (grainSize - overlap);
      
      // Extract grain
      const grain = new Float32Array(grainSize);
      for (let i = 0; i < grainSize; i++) {
        if (inputPos + i < input.length) {
          grain[i] = input[inputPos + i] * window[i];
        }
      }
      
      // Resample grain (pitch shift)
      const resampled = this.resample(grain, ratio);
      
      // Overlap-add
      for (let i = 0; i < resampled.length; i++) {
        if (outputPos + i < output.length) {
          output[outputPos + i] += resampled[i] * window[i];
        }
      }
    }
  }

  resample(data, ratio) {
    const outputLength = Math.floor(data.length / ratio);
    const output = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const pos = i * ratio;
      const idx = Math.floor(pos);
      const frac = pos - idx;
      
      if (idx < data.length - 1) {
        // Linear interpolation
        output[i] = data[idx] * (1 - frac) + data[idx + 1] * frac;
      } else if (idx < data.length) {
        output[i] = data[idx];
      }
    }
    
    return output;
  }

  formantPreserve(audioBuffer, semitones) {
    // Formant-preserving pitch shift (more complex)
    // Simplified version
    return this.shift(audioBuffer, semitones);
  }

  createBuffer(data, sampleRate) {
    return {
      getChannelData: () => data,
      sampleRate,
      duration: data.length / sampleRate,
      numberOfChannels: 1
    };
  }
}

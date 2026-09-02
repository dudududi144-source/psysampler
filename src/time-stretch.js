// Time Stretch - Phase vocoder + WSOLA

export class TimeStretcher {
  constructor(sampleRate = 48000) {
    this.sampleRate = sampleRate;
    this.fftSize = 2048;
    this.hopSize = 512;
  }

  stretch(audioBuffer, ratio) {
    if (ratio === 1.0) return audioBuffer;
    
    const inputData = audioBuffer.getChannelData(0);
    const outputLength = Math.floor(inputData.length * ratio);
    const outputData = new Float32Array(outputLength);
    
    // Phase vocoder for high-quality stretching
    this.phaseVocoder(inputData, outputData, ratio);
    
    return this.createBuffer(outputData, this.sampleRate);
  }

  phaseVocoder(input, output, ratio) {
    const fftSize = this.fftSize;
    const hopSize = this.hopSize;
    const hopOut = Math.floor(hopSize * ratio);
    
    // Window function (Hann)
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / fftSize));
    }
    
    let inputPos = 0;
    let outputPos = 0;
    let phase = new Float32Array(fftSize / 2 + 1);
    let prevPhase = new Float32Array(fftSize / 2 + 1);
    let sumPhase = new Float32Array(fftSize / 2 + 1);
    
    while (inputPos + fftSize < input.length && outputPos + fftSize < output.length) {
      // Extract windowed frame
      const frame = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        frame[i] = input[inputPos + i] * window[i];
      }
      
      // FFT (simplified - real implementation would use FFT library)
      const spectrum = this.fft(frame);
      
      // Phase vocoder processing
      for (let k = 0; k < spectrum.length; k++) {
        const mag = spectrum[k].mag;
        const ph = spectrum[k].phase;
        
        // Phase difference
        let dphi = ph - prevPhase[k];
        
        // Unwrap phase
        while (dphi > Math.PI) dphi -= 2 * Math.PI;
        while (dphi < -Math.PI) dphi += 2 * Math.PI;
        
        // Expected phase advance
        const expected = 2 * Math.PI * k * hopSize / fftSize;
        
        // Phase deviation
        const deviation = dphi - expected;
        
        // Accumulate phase
        sumPhase[k] += expected * ratio + deviation;
        
        // Store phase
        prevPhase[k] = ph;
        
        // Reconstruct with new phase
        spectrum[k].phase = sumPhase[k];
      }
      
      // IFFT (simplified)
      const outputFrame = this.ifft(spectrum);
      
      // Overlap-add
      for (let i = 0; i < fftSize; i++) {
        if (outputPos + i < output.length) {
          output[outputPos + i] += outputFrame[i] * window[i];
        }
      }
      
      inputPos += hopSize;
      outputPos += hopOut;
    }
  }

  wsola(input, output, ratio) {
    // WSOLA (Waveform Similarity Overlap-Add) - alternative to phase vocoder
    const frameSize = 1024;
    const overlap = frameSize / 2;
    const searchWindow = 256;
    
    let inputPos = 0;
    let outputPos = 0;
    let prevFrame = null;
    
    while (inputPos + frameSize < input.length && outputPos + frameSize < output.length) {
      // Find best matching position
      let bestOffset = 0;
      let bestCorrelation = -Infinity;
      
      if (prevFrame) {
        for (let offset = -searchWindow; offset <= searchWindow; offset++) {
          const pos = inputPos + offset;
          if (pos >= 0 && pos + frameSize < input.length) {
            const correlation = this.correlate(prevFrame, input.slice(pos, pos + overlap));
            if (correlation > bestCorrelation) {
              bestCorrelation = correlation;
              bestOffset = offset;
            }
          }
        }
      }
      
      inputPos += bestOffset;
      
      // Extract frame
      const frame = input.slice(inputPos, inputPos + frameSize);
      
      // Crossfade with previous frame
      if (prevFrame && outputPos > 0) {
        for (let i = 0; i < overlap; i++) {
          const fade = i / overlap;
          if (outputPos - overlap + i >= 0 && outputPos - overlap + i < output.length) {
            output[outputPos - overlap + i] = 
              output[outputPos - overlap + i] * (1 - fade) + 
              frame[i] * fade;
          }
        }
      }
      
      // Copy frame
      for (let i = overlap; i < frameSize; i++) {
        if (outputPos + i < output.length) {
          output[outputPos + i] = frame[i];
        }
      }
      
      prevFrame = frame;
      inputPos += Math.floor(frameSize * ratio);
      outputPos += frameSize;
    }
  }

  correlate(a, b) {
    let sum = 0;
    const length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      sum += a[i] * b[i];
    }
    return sum / length;
  }

  fft(data) {
    // Simplified FFT - returns magnitude and phase
    const spectrum = [];
    for (let k = 0; k < data.length / 2; k++) {
      spectrum.push({
        mag: Math.abs(data[k]) || 0,
        phase: 0
      });
    }
    return spectrum;
  }

  ifft(spectrum) {
    // Simplified IFFT
    const output = new Float32Array(spectrum.length * 2);
    for (let i = 0; i < spectrum.length; i++) {
      output[i] = spectrum[i].mag * Math.cos(spectrum[i].phase);
    }
    return output;
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

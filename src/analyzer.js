// Loop Analyzer - Transient detection, key/tempo detection, ML classification

export class LoopAnalyzer {
  constructor() {
    this.fftSize = 2048;
    this.hopSize = 512;
  }

  analyze(audioBuffer) {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    return {
      tempo: this.detectTempo(data, sampleRate),
      key: this.detectKey(data, sampleRate),
      beats: this.detectBeats(data, sampleRate),
      type: this.classifyLoop(data, sampleRate),
      rms: this.calculateRMS(data),
      peak: this.calculatePeak(data),
      lufs: this.calculateLUFS(data, sampleRate)
    };
  }

  detectSlices(audioBuffer, analysis) {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const transientPoints = this.detectTransients(data, sampleRate);
    
    const slices = [];
    for (let i = 0; i < transientPoints.length; i++) {
      const start = transientPoints[i] / sampleRate;
      const end = i < transientPoints.length - 1 
        ? transientPoints[i + 1] / sampleRate 
        : audioBuffer.duration;
      
      slices.push({
        index: i,
        start,
        end,
        duration: end - start,
        rms: this.calculateRMS(data.slice(
          transientPoints[i],
          i < transientPoints.length - 1 ? transientPoints[i + 1] : data.length
        )),
        zeroCrossings: this.findZeroCrossings(data, transientPoints[i], 
          i < transientPoints.length - 1 ? transientPoints[i + 1] : data.length)
      });
    }
    
    return slices;
  }

  detectTransients(data, sampleRate) {
    // Multi-band transient detection
    const lowBand = this.bandpassFilter(data, sampleRate, 20, 200);
    const midBand = this.bandpassFilter(data, sampleRate, 200, 2000);
    const highBand = this.bandpassFilter(data, sampleRate, 2000, 8000);
    
    const transients = new Set();
    const threshold = 0.3;
    const windowSize = Math.floor(sampleRate * 0.01); // 10ms window
    
    // Spectral flux for each band
    const fluxLow = this.spectralFlux(lowBand, windowSize);
    const fluxMid = this.spectralFlux(midBand, windowSize);
    const fluxHigh = this.spectralFlux(highBand, windowSize);
    
    // Combine flux from all bands
    for (let i = 0; i < fluxLow.length; i++) {
      const combined = fluxLow[i] + fluxMid[i] + fluxHigh[i];
      if (combined > threshold) {
        // Find zero crossing nearby for click-free slicing
        const idx = i * windowSize;
        const zeroCross = this.findNearestZeroCrossing(data, idx, sampleRate);
        transients.add(zeroCross);
      }
    }
    
    return Array.from(transients).sort((a, b) => a - b);
  }

  spectralFlux(data, windowSize) {
    const flux = [];
    for (let i = windowSize; i < data.length - windowSize; i += windowSize) {
      const current = this.fft(data.slice(i, i + windowSize));
      const previous = this.fft(data.slice(i - windowSize, i));
      
      let fluxValue = 0;
      for (let j = 0; j < current.length; j++) {
        fluxValue += Math.max(0, current[j] - previous[j]);
      }
      flux.push(fluxValue);
    }
    return flux;
  }

  detectTempo(data, sampleRate) {
    // Autocorrelation-based tempo detection
    const minBPM = 60;
    const maxBPM = 240;
    const minLag = Math.floor(sampleRate * 60 / maxBPM);
    const maxLag = Math.floor(sampleRate * 60 / minBPM);
    
    const onsetStrength = this.onsetStrengthFunction(data, sampleRate);
    const correlations = [];
    
    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      for (let i = 0; i < onsetStrength.length - lag; i++) {
        sum += onsetStrength[i] * onsetStrength[i + lag];
      }
      correlations.push({ lag, correlation: sum });
    }
    
    // Find peak correlation
    const peak = correlations.reduce((max, curr) => 
      curr.correlation > max.correlation ? curr : max
    );
    
    const bpm = 60 * sampleRate / peak.lag;
    return Math.round(bpm * 10) / 10; // Round to 0.1 BPM
  }

  detectKey(data, sampleRate) {
    // Chroma feature-based key detection
    const chroma = this.calculateChroma(data, sampleRate);
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const scales = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
    
    let bestKey = 'C';
    let bestScale = 'major';
    let bestScore = -Infinity;
    
    for (const key of keys) {
      for (const scale of scales) {
        const score = this.matchKeySignature(chroma, key, scale);
        if (score > bestScore) {
          bestScore = score;
          bestKey = key;
          bestScale = scale;
        }
      }
    }
    
    return { key: bestKey, scale: bestScale };
  }

  classifyLoop(data, sampleRate) {
    // ML-based loop classification
    const features = this.extractFeatures(data, sampleRate);
    
    // Simplified classification (full ML model would be loaded separately)
    const spectralCentroid = this.spectralCentroid(data, sampleRate);
    const zeroCrossingRate = this.zeroCrossingRate(data);
    const rms = this.calculateRMS(data);
    
    if (spectralCentroid < 500 && rms > 0.3) {
      return 'drum';
    } else if (spectralCentroid < 1000 && zeroCrossingRate < 0.1) {
      return 'bass';
    } else if (spectralCentroid > 2000) {
      return 'fx';
    } else if (zeroCrossingRate > 0.5) {
      return 'percussion';
    } else {
      return 'melodic';
    }
  }

  detectBeats(data, sampleRate) {
    const tempo = this.detectTempo(data, sampleRate);
    const beatInterval = 60 / tempo;
    const beats = [];
    
    for (let time = 0; time < data.length / sampleRate; time += beatInterval) {
      beats.push(time);
    }
    
    return beats;
  }

  // Helper methods
  bandpassFilter(data, sampleRate, lowFreq, highFreq) {
    // Simplified bandpass filter (real implementation would use biquad)
    return data; // Placeholder
  }

  fft(data) {
    // Simplified FFT (real implementation would use Web Audio API or library)
    return Array.from(data).map(x => Math.abs(x));
  }

  findNearestZeroCrossing(data, idx, sampleRate) {
    const searchRadius = Math.floor(sampleRate * 0.001); // 1ms search
    for (let offset = 0; offset < searchRadius; offset++) {
      if (idx + offset < data.length - 1) {
        if (data[idx + offset] * data[idx + offset + 1] < 0) {
          return idx + offset;
        }
      }
      if (idx - offset > 0) {
        if (data[idx - offset] * data[idx - offset - 1] < 0) {
          return idx - offset;
        }
      }
    }
    return idx;
  }

  findZeroCrossings(data, start, end) {
    let count = 0;
    for (let i = start; i < end - 1; i++) {
      if (data[i] * data[i + 1] < 0) {
        count++;
      }
    }
    return count;
  }

  onsetStrengthFunction(data, sampleRate) {
    const hopSize = 512;
    const strength = [];
    
    for (let i = hopSize; i < data.length; i += hopSize) {
      const current = this.calculateRMS(data.slice(i, i + hopSize));
      const previous = this.calculateRMS(data.slice(i - hopSize, i));
      strength.push(Math.max(0, current - previous));
    }
    
    return strength;
  }

  calculateChroma(data, sampleRate) {
    // Simplified chroma extraction
    return new Array(12).fill(0); // Placeholder
  }

  matchKeySignature(chroma, key, scale) {
    // Simplified key matching
    return Math.random(); // Placeholder
  }

  extractFeatures(data, sampleRate) {
    return {
      spectralCentroid: this.spectralCentroid(data, sampleRate),
      zeroCrossingRate: this.zeroCrossingRate(data),
      rms: this.calculateRMS(data)
    };
  }

  spectralCentroid(data, sampleRate) {
    const fft = this.fft(data);
    let weightedSum = 0;
    let totalSum = 0;
    
    for (let i = 0; i < fft.length; i++) {
      const freq = i * sampleRate / (2 * fft.length);
      weightedSum += freq * fft[i];
      totalSum += fft[i];
    }
    
    return totalSum > 0 ? weightedSum / totalSum : 0;
  }

  zeroCrossingRate(data) {
    let crossings = 0;
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] * data[i + 1] < 0) {
        crossings++;
      }
    }
    return crossings / data.length;
  }

  calculateRMS(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  calculatePeak(data) {
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
    return peak;
  }

  calculateLUFS(data, sampleRate) {
    // ITU-R BS.1770-4 LUFS measurement
    // Simplified version
    return -23; // Placeholder
  }
}

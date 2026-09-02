// Audio Analysis
// Advanced audio analysis utilities

export class AudioAnalyzer {
  constructor(audioContext) {
    this.context = audioContext;
    this.analyser = null;
    this.fftSize = 2048;
    this.smoothingTimeConstant = 0.8;
  }

  setup(sourceNode) {
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
    
    sourceNode.connect(this.analyser);
    
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainData = new Uint8Array(this.analyser.fftSize);
    this.floatFrequencyData = new Float32Array(this.analyser.frequencyBinCount);
    this.floatTimeDomainData = new Float32Array(this.analyser.fftSize);
  }

  getFrequencyData() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getTimeDomainData() {
    if (!this.analyser) return null;
    this.analyser.getByteTimeDomainData(this.timeDomainData);
    return this.timeDomainData;
  }

  getFloatFrequencyData() {
    if (!this.analyser) return null;
    this.analyser.getFloatFrequencyData(this.floatFrequencyData);
    return this.floatFrequencyData;
  }

  getFloatTimeDomainData() {
    if (!this.analyser) return null;
    this.analyser.getFloatTimeDomainData(this.floatTimeDomainData);
    return this.floatTimeDomainData;
  }

  getRMS() {
    const data = this.getFloatTimeDomainData();
    if (!data) return 0;
    
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    
    return Math.sqrt(sum / data.length);
  }

  getPeak() {
    const data = this.getFloatTimeDomainData();
    if (!data) return 0;
    
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
    
    return peak;
  }

  getPeakFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;
    
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i];
        maxIndex = i;
      }
    }
    
    const nyquist = this.context.sampleRate / 2;
    return (maxIndex / data.length) * nyquist;
  }

  getSpectralCentroid() {
    const data = this.getFloatFrequencyData();
    if (!data) return 0;
    
    let numerator = 0;
    let denominator = 0;
    const nyquist = this.context.sampleRate / 2;
    
    for (let i = 0; i < data.length; i++) {
      const frequency = (i / data.length) * nyquist;
      const magnitude = Math.pow(10, data[i] / 20);
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }
    
    return denominator > 0 ? numerator / denominator : 0;
  }

  getSpectralFlux(previousData) {
    const currentData = this.getFloatFrequencyData();
    if (!currentData || !previousData) return 0;
    
    let flux = 0;
    for (let i = 0; i < currentData.length; i++) {
      const diff = currentData[i] - previousData[i];
      if (diff > 0) {
        flux += diff;
      }
    }
    
    return flux;
  }

  getZeroCrossingRate() {
    const data = this.getFloatTimeDomainData();
    if (!data) return 0;
    
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i - 1] < 0) || 
          (data[i] < 0 && data[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    return crossings / data.length;
  }

  getSpectralRolloff(threshold = 0.85) {
    const data = this.getFloatFrequencyData();
    if (!data) return 0;
    
    let totalEnergy = 0;
    for (let i = 0; i < data.length; i++) {
      totalEnergy += Math.pow(10, data[i] / 20);
    }
    
    const thresholdEnergy = totalEnergy * threshold;
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < data.length; i++) {
      cumulativeEnergy += Math.pow(10, data[i] / 20);
      if (cumulativeEnergy >= thresholdEnergy) {
        const nyquist = this.context.sampleRate / 2;
        return (i / data.length) * nyquist;
      }
    }
    
    return 0;
  }

  getAnalysis() {
    return {
      rms: this.getRMS(),
      peak: this.getPeak(),
      peakFrequency: this.getPeakFrequency(),
      spectralCentroid: this.getSpectralCentroid(),
      zeroCrossingRate: this.getZeroCrossingRate(),
      spectralRolloff: this.getSpectralRolloff()
    };
  }
}

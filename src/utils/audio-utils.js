// Audio Utilities
// Common audio processing functions

export function normalizeAudio(buffer) {
  const data = buffer.getChannelData(0);
  let max = 0;
  
  for (let i = 0; i < data.length; i++) {
    const abs = Math.abs(data[i]);
    if (abs > max) max = abs;
  }
  
  if (max === 0) return buffer;
  
  const normalized = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    normalized[i] = data[i] / max;
  }
  
  return createAudioBuffer(normalized, buffer.sampleRate);
}

export function fadeAudio(buffer, fadeIn = 0.01, fadeOut = 0.01) {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const fadeInSamples = Math.floor(fadeIn * sampleRate);
  const fadeOutSamples = Math.floor(fadeOut * sampleRate);
  const result = new Float32Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    let gain = 1;
    
    // Fade in
    if (i < fadeInSamples) {
      gain = i / fadeInSamples;
    }
    
    // Fade out
    if (i > data.length - fadeOutSamples) {
      gain = (data.length - i) / fadeOutSamples;
    }
    
    result[i] = data[i] * gain;
  }
  
  return createAudioBuffer(result, sampleRate);
}

export function reverseAudio(buffer) {
  const data = buffer.getChannelData(0);
  const reversed = new Float32Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    reversed[i] = data[data.length - 1 - i];
  }
  
  return createAudioBuffer(reversed, buffer.sampleRate);
}

export function mixBuffers(buffer1, buffer2, mix = 0.5) {
  const data1 = buffer1.getChannelData(0);
  const data2 = buffer2.getChannelData(0);
  const length = Math.max(data1.length, data2.length);
  const result = new Float32Array(length);
  
  for (let i = 0; i < length; i++) {
    const sample1 = i < data1.length ? data1[i] : 0;
    const sample2 = i < data2.length ? data2[i] : 0;
    result[i] = sample1 * (1 - mix) + sample2 * mix;
  }
  
  return createAudioBuffer(result, buffer1.sampleRate);
}

export function crossfadeBuffers(buffer1, buffer2, crossfadeSamples = 1024) {
  const data1 = buffer1.getChannelData(0);
  const data2 = buffer2.getChannelData(0);
  const result = new Float32Array(data1.length + data2.length - crossfadeSamples);
  
  // Copy first buffer (minus crossfade region)
  for (let i = 0; i < data1.length - crossfadeSamples; i++) {
    result[i] = data1[i];
  }
  
  // Crossfade region
  for (let i = 0; i < crossfadeSamples; i++) {
    const t = i / crossfadeSamples;
    const sample1 = data1[data1.length - crossfadeSamples + i];
    const sample2 = data2[i];
    result[data1.length - crossfadeSamples + i] = sample1 * (1 - t) + sample2 * t;
  }
  
  // Copy second buffer (after crossfade region)
  for (let i = crossfadeSamples; i < data2.length; i++) {
    result[data1.length + i - crossfadeSamples] = data2[i];
  }
  
  return createAudioBuffer(result, buffer1.sampleRate);
}

export function createAudioBuffer(data, sampleRate) {
  return {
    getChannelData: () => data,
    sampleRate: sampleRate,
    duration: data.length / sampleRate,
    numberOfChannels: 1
  };
}

export function rms(audioData) {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  return Math.sqrt(sum / audioData.length);
}

export function peak(audioData) {
  let max = 0;
  for (let i = 0; i < audioData.length; i++) {
    const abs = Math.abs(audioData[i]);
    if (abs > max) max = abs;
  }
  return max;
}

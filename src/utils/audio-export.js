// Audio Export
// Export audio buffers to various formats

export class AudioExporter {
  constructor() {
    this.sampleRate = 48000;
  }

  bufferToWav(buffer, options = {}) {
    const {
      bitDepth = 16,
      numChannels = buffer.numberOfChannels || 1
    } = options;

    const length = buffer.length;
    const bytesPerSample = bitDepth / 8;
    const dataSize = length * numChannels * bytesPerSample;
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    
    // Format chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitDepth, true);
    
    // Data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = buffer.getChannelData ? 
          buffer.getChannelData(channel)[i] : 
          buffer[channel][i];
        
        const clampedSample = Math.max(-1, Math.min(1, sample));
        
        if (bitDepth === 16) {
          const intSample = clampedSample < 0 ? 
            clampedSample * 0x8000 : 
            clampedSample * 0x7FFF;
          view.setInt16(offset, intSample, true);
          offset += 2;
        } else if (bitDepth === 24) {
          const intSample = clampedSample < 0 ? 
            clampedSample * 0x800000 : 
            clampedSample * 0x7FFFFF;
          view.setUint8(offset, intSample & 0xFF);
          view.setUint8(offset + 1, (intSample >> 8) & 0xFF);
          view.setUint8(offset + 2, (intSample >> 16) & 0xFF);
          offset += 3;
        } else if (bitDepth === 32) {
          view.setFloat32(offset, clampedSample, true);
          offset += 4;
        }
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  bufferToFloat32Array(buffer) {
    if (buffer.getChannelData) {
      return buffer.getChannelData(0);
    }
    return buffer;
  }

  bufferToJSON(buffer) {
    return {
      sampleRate: this.sampleRate,
      length: buffer.length,
      numberOfChannels: buffer.numberOfChannels || 1,
      data: this.bufferToFloat32Array(buffer)
    };
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  async downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportWav(buffer, filename, options = {}) {
    const blob = this.bufferToWav(buffer, options);
    await this.downloadBlob(blob, filename);
  }
}

export const audioExporter = new AudioExporter();

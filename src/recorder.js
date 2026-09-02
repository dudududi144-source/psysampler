// Recorder - Live recording and overdub

export class Recorder {
  constructor(audioContext) {
    this.context = audioContext;
    this.mediaRecorder = null;
    this.chunks = [];
    this.isRecording = false;
    this.stream = null;
    this.overdubMode = false;
    this.layers = [];
  }

  async startRecording(destinationNode) {
    if (this.isRecording) return;
    
    // Create MediaStream from audio node
    const stream = destinationNode.context.createMediaStreamDestination();
    destinationNode.connect(stream);
    
    this.stream = stream.stream;
    this.chunks = [];
    
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm'
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      this.processRecording();
    };
    
    this.mediaRecorder.start(100); // Collect data every 100ms
    this.isRecording = true;
  }

  stopRecording() {
    if (!this.isRecording) return;
    
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  async processRecording() {
    const blob = new Blob(this.chunks, { type: 'audio/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    
    if (this.overdubMode) {
      // Mix with existing layers
      this.overdub(audioBuffer);
    } else {
      this.layers.push(audioBuffer);
    }
    
    return audioBuffer;
  }

  overdub(newLayer) {
    if (this.layers.length === 0) {
      this.layers.push(newLayer);
      return;
    }
    
    // Mix new layer with existing layers
    const baseLayer = this.layers[this.layers.length - 1];
    const mixed = this.mixBuffers(baseLayer, newLayer);
    this.layers.push(mixed);
  }

  mixBuffers(buffer1, buffer2) {
    const length = Math.max(buffer1.length, buffer2.length);
    const sampleRate = buffer1.sampleRate;
    const output = this.context.createBuffer(
      buffer1.numberOfChannels,
      length,
      sampleRate
    );
    
    for (let channel = 0; channel < buffer1.numberOfChannels; channel++) {
      const data1 = buffer1.getChannelData(channel);
      const data2 = buffer2.getChannelData(channel) || new Float32Array(length);
      const outputData = output.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const sample1 = data1[i] || 0;
        const sample2 = data2[i] || 0;
        outputData[i] = sample1 + sample2;
      }
    }
    
    return output;
  }

  // Undo last layer
  undo() {
    if (this.layers.length > 0) {
      return this.layers.pop();
    }
    return null;
  }

  // Get current recording
  getCurrentRecording() {
    return this.layers.length > 0 ? this.layers[this.layers.length - 1] : null;
  }

  // Clear all layers
  clear() {
    this.layers = [];
  }

  // Export as WAV
  async exportWAV() {
    if (this.layers.length === 0) return null;
    
    const buffer = this.layers[this.layers.length - 1];
    return this.audioBufferToWav(buffer);
  }

  audioBufferToWav(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Audio data
    const audioData = new Float32Array(length * numberOfChannels);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        audioData[channel * length + i] = channelData[i];
      }
    }
    
    // Convert to 16-bit PCM
    const pcmData = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    // Combine header and data
    const wav = new Uint8Array(44 + pcmData.length * 2);
    wav.set(new Uint8Array(wavHeader), 0);
    wav.set(new Uint8Array(pcmData.buffer), 44);
    
    return wav;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

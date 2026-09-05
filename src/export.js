// Export - WAV, MIDI, stems, project export

export class ExportManager {
  constructor(device) {
    this.device = device;
  }

  // Export as WAV
  async exportWAV(options = {}) {
    const { sampleRate = 48000, bitDepth = 16, banks = 'all' } = options;

    // Offline render
    const offlineContext = new OfflineAudioContext(2, sampleRate * 30, sampleRate);

    // Render each bank
    // Simplified - real implementation would render all banks

    const renderedBuffer = await offlineContext.startRendering();
    return this.audioBufferToWav(renderedBuffer, bitDepth);
  }

  // Export stems (separate files per bus)
  async exportStems() {
    const stems = [];

    for (let i = 0; i < 8; i++) {
      const stem = await this.exportWAV({ banks: i });
      stems.push({
        name: `stem-${i + 1}`,
        data: stem,
      });
    }

    return stems;
  }

  // Export MIDI
  exportMIDI() {
    const midiData = this.createMIDIFile();
    return new Blob([midiData], { type: 'audio/midi' });
  }

  createMIDIFile() {
    // MIDI file format
    const header = [
      0x4d,
      0x54,
      0x68,
      0x64, // "MThd"
      0x00,
      0x00,
      0x00,
      0x06, // Header length
      0x00,
      0x00, // Format 0
      0x00,
      0x01, // 1 track
      0x01,
      0xe0, // 480 ticks per beat
    ];

    // Track data
    const track = [];

    // Add slice triggers as MIDI notes
    const bank = this.device.sliceBanks[this.device.currentBank];
    if (bank?.hasLoop) {
      let tick = 0;
      const ticksPerBeat = 480;

      bank.slices.forEach((slice, idx) => {
        const note = 36 + idx; // C2 and up
        const duration = Math.floor(
          (((slice.end - slice.start) * (this.device.transport?.bpm || 140)) / 60) * ticksPerBeat,
        );

        // Note on
        track.push(...this.encodeVarLength(tick));
        track.push(0x90, note, 100);

        // Note off
        track.push(...this.encodeVarLength(duration));
        track.push(0x80, note, 0);

        tick = 0;
      });
    }

    // Track header
    const trackHeader = [
      0x4d,
      0x54,
      0x72,
      0x6b, // "MTrk"
      (track.length >> 24) & 0xff,
      (track.length >> 16) & 0xff,
      (track.length >> 8) & 0xff,
      track.length & 0xff,
    ];

    return new Uint8Array([...header, ...trackHeader, ...track]);
  }

  encodeVarLength(value) {
    const bytes = [];
    let v = value;

    bytes.unshift(v & 0x7f);
    v >>= 7;

    while (v > 0) {
      bytes.unshift((v & 0x7f) | 0x80);
      v >>= 7;
    }

    return bytes;
  }

  // Export project
  exportProject() {
    const project = this.device.exportProject();
    return new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  }

  // Import project
  async importProject(file) {
    const text = await file.text();
    const project = JSON.parse(text);
    this.device.importProject(project);
  }

  // Download helper
  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  audioBufferToWav(buffer, bitDepth = 16) {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    const bytesPerSample = bitDepth / 8;
    const dataSize = length * numberOfChannels * bytesPerSample;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
    view.setUint16(32, numberOfChannels * bytesPerSample, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const clamped = Math.max(-1, Math.min(1, sample));

        if (bitDepth === 16) {
          const value = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
          view.setInt16(offset, value, true);
          offset += 2;
        } else if (bitDepth === 24) {
          const value = Math.floor(clamped * 0x7fffff);
          view.setUint8(offset, value & 0xff);
          view.setUint8(offset + 1, (value >> 8) & 0xff);
          view.setUint8(offset + 2, (value >> 16) & 0xff);
          offset += 3;
        } else if (bitDepth === 32) {
          view.setFloat32(offset, clamped, true);
          offset += 4;
        }
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

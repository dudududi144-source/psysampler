// MIDI Learn
// Automatic MIDI mapping learning system

export class MIDILearn {
  constructor() {
    this.learning = false;
    this.targetParam = null;
    this.targetRange = { min: 0, max: 1 };
    this.callbacks = new Map();
    this.mappings = new Map();
  }

  startLearning(paramPath, min = 0, max = 1, callback = null) {
    this.learning = true;
    this.targetParam = paramPath;
    this.targetRange = { min, max };

    if (callback) {
      this.callbacks.set(paramPath, callback);
    }

    console.log(`🎹 MIDI Learn: Waiting for MIDI input for ${paramPath}...`);
  }

  stopLearning() {
    this.learning = false;
    this.targetParam = null;
    console.log('🎹 MIDI Learn: Stopped');
  }

  handleMIDIInput(message) {
    if (!this.learning) return;

    const [status, data1, data2] = message;
    const messageType = status & 0xf0;
    const channel = status & 0x0f;

    // CC messages
    if (messageType === 0xb0) {
      const ccNumber = data1;
      const value = data2 / 127;

      this.mapCC(ccNumber, this.targetParam, this.targetRange.min, this.targetRange.max);
      console.log(`✅ Mapped CC ${ccNumber} to ${this.targetParam}`);
      this.stopLearning();
    }

    // Note messages
    else if (messageType === 0x90 && data2 > 0) {
      const note = data1;
      this.mapNote(note, this.targetParam);
      console.log(`✅ Mapped Note ${note} to ${this.targetParam}`);
      this.stopLearning();
    }
  }

  mapCC(ccNumber, paramPath, min = 0, max = 1) {
    this.mappings.set(`cc:${ccNumber}`, {
      type: 'cc',
      ccNumber,
      paramPath,
      min,
      max,
    });
  }

  mapNote(note, paramPath) {
    this.mappings.set(`note:${note}`, {
      type: 'note',
      note,
      paramPath,
    });
  }

  unmapCC(ccNumber) {
    this.mappings.delete(`cc:${ccNumber}`);
  }

  unmapNote(note) {
    this.mappings.delete(`note:${note}`);
  }

  processMIDI(message) {
    const [status, data1, data2] = message;
    const messageType = status & 0xf0;

    // CC messages
    if (messageType === 0xb0) {
      const ccNumber = data1;
      const value = data2 / 127;
      const mapping = this.mappings.get(`cc:${ccNumber}`);

      if (mapping) {
        const scaledValue = mapping.min + value * (mapping.max - mapping.min);
        const callback = this.callbacks.get(mapping.paramPath);
        if (callback) {
          callback(scaledValue, mapping.paramPath);
        }
        return { paramPath: mapping.paramPath, value: scaledValue };
      }
    }

    // Note on messages
    else if (messageType === 0x90 && data2 > 0) {
      const note = data1;
      const mapping = this.mappings.get(`note:${note}`);

      if (mapping) {
        const callback = this.callbacks.get(mapping.paramPath);
        if (callback) {
          callback(1, mapping.paramPath);
        }
        return { paramPath: mapping.paramPath, value: 1 };
      }
    }

    return null;
  }

  getMapping(midiId) {
    return this.mappings.get(midiId);
  }

  getAllMappings() {
    return Array.from(this.mappings.entries());
  }

  clearAllMappings() {
    this.mappings.clear();
  }

  export() {
    return {
      mappings: Array.from(this.mappings.entries()),
    };
  }

  import(data) {
    this.mappings.clear();
    if (data.mappings) {
      data.mappings.forEach(([key, value]) => {
        this.mappings.set(key, value);
      });
    }
  }
}

export const midiLearn = new MIDILearn();

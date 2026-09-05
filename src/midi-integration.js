// MIDI Integration - Full MIDI support with clock sync

export class MIDIIntegration {
  constructor(looperDevice) {
    this.device = looperDevice;
    this.midiAccess = null;
    this.inputs = [];
    this.outputs = [];
    this.sliceMIDIMap = new Map(); // MIDI note -> slice
    this.cclMap = new Map(); // CC number -> parameter
    this.clockEnabled = false;
    this.clockInterval = null;
    this.bpm = 140;
  }

  async init() {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      // Enumerate inputs and outputs
      this.inputs = Array.from(this.midiAccess.inputs.values());
      this.outputs = Array.from(this.midiAccess.outputs.values());

      // Setup listeners
      this.inputs.forEach((input) => {
        input.onmidimessage = (e) => this.handleMIDIMessage(e);
      });

      return true;
    } catch (err) {
      console.error('MIDI initialization failed:', err);
      return false;
    }
  }

  handleMIDIMessage(event) {
    const [status, data1, data2] = event.data;
    const command = status & 0xf0;
    const channel = status & 0x0f;

    switch (command) {
      case 0x90: // Note on
        if (data2 > 0) {
          this.handleNoteOn(data1, data2 / 127);
        } else {
          this.handleNoteOff(data1);
        }
        break;

      case 0x80: // Note off
        this.handleNoteOff(data1);
        break;

      case 0xb0: // Control change
        this.handleCC(data1, data2 / 127);
        break;

      case 0xf8: // MIDI clock
        if (this.clockEnabled) {
          this.handleClock();
        }
        break;

      case 0xfa: // Start
        this.handleStart();
        break;

      case 0xfc: // Stop
        this.handleStop();
        break;
    }
  }

  handleNoteOn(note, velocity) {
    // Check if note is mapped to a slice
    if (this.sliceMIDIMap.has(note)) {
      const { bank, slice } = this.sliceMIDIMap.get(note);
      this.device.triggerSlice(bank, slice, velocity);
    }
  }

  handleNoteOff(note) {
    // Handle note off if needed
  }

  handleCC(cc, value) {
    if (this.cclMap.has(cc)) {
      const { target, callback } = this.cclMap.get(cc);
      callback(value);
    }
  }

  handleClock() {
    // MIDI clock: 24 ppqn (pulses per quarter note)
    // Update internal clock
  }

  handleStart() {
    this.device.play();
  }

  handleStop() {
    this.device.stop();
  }

  // Slice mapping
  mapSliceToNote(note, bank, slice) {
    this.sliceMIDIMap.set(note, { bank, slice });
  }

  unmapSliceFromNote(note) {
    this.sliceMIDIMap.delete(note);
  }

  // CC learn
  learnCC(cc, target, callback) {
    this.cclMap.set(cc, { target, callback });
  }

  unlearnCC(cc) {
    this.cclMap.delete(cc);
  }

  // MIDI clock
  enableClock(bpm = 140) {
    this.clockEnabled = true;
    this.bpm = bpm;
    this.startClock();
  }

  disableClock() {
    this.clockEnabled = false;
    this.stopClock();
  }

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);

    const msPerPulse = 60000 / this.bpm / 24; // 24 ppqn
    this.clockInterval = setInterval(() => {
      this.sendClock();
    }, msPerPulse);
  }

  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  sendClock() {
    this.sendMIDIMessage([0xf8]);
  }

  sendStart() {
    this.sendMIDIMessage([0xfa]);
  }

  sendStop() {
    this.sendMIDIMessage([0xfc]);
  }

  // MIDI output
  sendNoteOn(note, velocity, channel = 0) {
    this.sendMIDIMessage([0x90 | channel, note, Math.floor(velocity * 127)]);
  }

  sendNoteOff(note, channel = 0) {
    this.sendMIDIMessage([0x80 | channel, note, 0]);
  }

  sendCC(cc, value, channel = 0) {
    this.sendMIDIMessage([0xb0 | channel, cc, Math.floor(value * 127)]);
  }

  sendMIDIMessage(data) {
    this.outputs.forEach((output) => {
      output.send(data);
    });
  }

  // Export MIDI
  exportMIDI(slices) {
    const midiData = [];

    // MIDI header
    midiData.push(...this.createMIDIHeader());

    // Track with slice triggers
    const track = [];
    let tick = 0;
    const ticksPerBeat = 480;

    slices.forEach((slice, idx) => {
      const note = 36 + idx; // Start from C2
      const duration = slice.duration * (this.bpm / 60) * ticksPerBeat;

      // Note on
      track.push(...this.encodeVarLength(tick));
      track.push(0x90, note, 100);

      // Note off
      track.push(...this.encodeVarLength(Math.floor(duration)));
      track.push(0x80, note, 0);

      tick = 0;
    });

    // Track header
    midiData.push(...this.createTrackHeader(track.length));
    midiData.push(...track);

    return new Uint8Array(midiData);
  }

  createMIDIHeader() {
    return [
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
  }

  createTrackHeader(length) {
    return [
      0x4d,
      0x54,
      0x72,
      0x6b, // "MTrk"
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    ];
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

  dispose() {
    this.stopClock();
    this.clockEnabled = false;
    this.sliceMIDIMap.clear();
    this.cclMap.clear();
  }
}

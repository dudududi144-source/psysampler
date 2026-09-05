// Transport - Timing and clock management

export class Transport {
  constructor() {
    this.isPlaying = false;
    this.bpm = 140;
    this.swing = 0;
    this.timeSignature = { numerator: 4, denominator: 4 };
    this.position = 0; // in beats
    this.bar = 0;
    this.beat = 0;
    this.sixteenth = 0;
    this.listeners = new Map();
    this.startTime = null;
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTime = performance.now();
    this.emit('play');
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.position = 0;
    this.bar = 0;
    this.beat = 0;
    this.sixteenth = 0;
    this.emit('stop');
  }

  pause() {
    this.isPlaying = false;
    this.emit('pause');
  }

  setBPM(bpm) {
    this.bpm = Math.max(20, Math.min(300, bpm));
    this.emit('bpm-change', this.bpm);
  }

  setSwing(swing) {
    this.swing = Math.max(0, Math.min(1, swing));
    this.emit('swing-change', this.swing);
  }

  setTimeSignature(numerator, denominator) {
    this.timeSignature = { numerator, denominator };
    this.emit('time-signature-change', this.timeSignature);
  }

  // Get current position in various formats
  getPosition() {
    return {
      beats: this.position,
      bars: this.bar,
      beat: this.beat,
      sixteenth: this.sixteenth,
      seconds: this.position * (60 / this.bpm),
    };
  }

  // Convert beats to seconds
  beatsToSeconds(beats) {
    return beats * (60 / this.bpm);
  }

  // Convert seconds to beats
  secondsToBeats(seconds) {
    return seconds * (this.bpm / 60);
  }

  // Get sixteenth note duration in seconds
  getSixteenthDuration() {
    return 60 / this.bpm / 4;
  }

  // Get swing offset for a sixteenth note
  getSwingOffset(sixteenthIndex) {
    if (sixteenthIndex % 2 === 1) {
      // Off-beat sixteenths
      return this.swing * this.getSixteenthDuration() * 0.5;
    }
    return 0;
  }

  // Event system
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  off(event, handler) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((handler) => handler(data));
    }
  }

  // Update position (called by scheduler)
  update(deltaTime) {
    if (!this.isPlaying) return;

    const beatsElapsed = this.secondsToBeats(deltaTime);
    this.position += beatsElapsed;

    // Calculate bar, beat, sixteenth
    const beatsPerBar = this.timeSignature.numerator;
    this.bar = Math.floor(this.position / beatsPerBar);
    this.beat = Math.floor(this.position % beatsPerBar);
    this.sixteenth = Math.floor((this.position % 1) * 4);

    this.emit('tick', this.getPosition());
  }

  // Reset
  reset() {
    this.position = 0;
    this.bar = 0;
    this.beat = 0;
    this.sixteenth = 0;
    this.emit('reset');
  }

  // Export state
  getState() {
    return {
      isPlaying: this.isPlaying,
      bpm: this.bpm,
      swing: this.swing,
      timeSignature: this.timeSignature,
      position: this.position,
    };
  }

  // Import state
  setState(state) {
    this.isPlaying = state.isPlaying;
    this.bpm = state.bpm;
    this.swing = state.swing;
    this.timeSignature = state.timeSignature;
    this.position = state.position;
  }
}

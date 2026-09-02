// Scheduler - Worker-timed lookahead scheduler

export class Scheduler {
  constructor(transport, lookahead = 25, scheduleAheadTime = 0.1) {
    this.transport = transport;
    this.lookahead = lookahead; // ms
    this.scheduleAheadTime = scheduleAheadTime; // seconds
    this.nextNoteTime = 0;
    this.currentSixteenth = 0;
    this.timerID = null;
    this.eventQueue = [];
    this.isRunning = false;
    this.onSchedule = null; // Callback for scheduled events
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentSixteenth = 0;
    this.nextNoteTime = this.transport.startTime / 1000 || 0;
    
    this.timerID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = null;
    }
    this.eventQueue = [];
  }

  scheduler() {
    const currentTime = performance.now() / 1000;
    
    // Schedule notes while the next note is within the lookahead window
    while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentSixteenth, this.nextNoteTime);
      this.nextNote();
    }
  }

  scheduleNote(sixteenth, time) {
    // Add to event queue
    this.eventQueue.push({
      sixteenth,
      time,
      bar: this.transport.bar,
      beat: this.transport.beat
    });
    
    // Call callback if provided
    if (this.onSchedule) {
      this.onSchedule(sixteenth, time);
    }
  }

  nextNote() {
    const secondsPerSixteenth = this.transport.getSixteenthDuration();
    const swingOffset = this.transport.getSwingOffset(this.currentSixteenth);
    
    this.nextNoteTime += secondsPerSixteenth + swingOffset;
    this.currentSixteenth = (this.currentSixteenth + 1) % 16;
  }

  // Get events that should be triggered now
  getEventsToTrigger(currentTime) {
    const events = [];
    const threshold = currentTime + 0.001; // 1ms tolerance
    
    this.eventQueue = this.eventQueue.filter(event => {
      if (event.time <= threshold) {
        events.push(event);
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });
    
    return events;
  }

  // Quantize time to nearest sixteenth
  quantizeToSixteenth(time) {
    const sixteenthDuration = this.transport.getSixteenthDuration();
    return Math.round(time / sixteenthDuration) * sixteenthDuration;
  }

  // Get current position in sixteenths
  getCurrentSixteenth() {
    return this.currentSixteenth;
  }

  // Reset scheduler
  reset() {
    this.currentSixteenth = 0;
    this.nextNoteTime = 0;
    this.eventQueue = [];
  }

  // Export state
  getState() {
    return {
      currentSixteenth: this.currentSixteenth,
      nextNoteTime: this.nextNoteTime,
      eventQueue: [...this.eventQueue]
    };
  }

  // Import state
  setState(state) {
    this.currentSixteenth = state.currentSixteenth;
    this.nextNoteTime = state.nextNoteTime;
    this.eventQueue = [...state.eventQueue];
  }
}

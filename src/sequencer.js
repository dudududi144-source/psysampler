// Sequencer - Step sequencer with pattern support

export class StepSequencer {
  constructor(steps = 16, tracks = 8) {
    this.numSteps = steps;
    this.numTracks = tracks;
    this.patterns = [];
    for (let t = 0; t < tracks; t++) {
      const track = [];
      for (let s = 0; s < steps; s++) {
        track.push({ active: false, velocity: 1.0, probability: 1.0, note: 60 });
      }
      this.patterns.push(track);
    }
    this.currentStep = 0;
    this.isPlaying = false;
    this.swing = 0;
  }

  setStep(track, step, active, velocity = 1.0) {
    if (track >= 0 && track < this.numTracks && step >= 0 && step < this.numSteps) {
      this.patterns[track][step].active = active;
      this.patterns[track][step].velocity = velocity;
    }
  }

  toggleStep(track, step) {
    if (track >= 0 && track < this.numTracks && step >= 0 && step < this.numSteps) {
      const stepData = this.patterns[track][step];
      stepData.active = !stepData.active;
    }
  }

  getStep(track, step) {
    if (track >= 0 && track < this.numTracks && step >= 0 && step < this.numSteps) {
      return this.patterns[track][step];
    }
    return null;
  }

  setProbability(track, step, probability) {
    if (track >= 0 && track < this.numTracks && step >= 0 && step < this.numSteps) {
      this.patterns[track][step].probability = Math.max(0, Math.min(1, probability));
    }
  }

  nextStep() {
    this.currentStep = (this.currentStep + 1) % this.numSteps;
  }

  getActiveEvents(determinism) {
    const events = [];
    for (let track = 0; track < this.numTracks; track++) {
      const stepData = this.patterns[track][this.currentStep];
      if (stepData.active) {
        if (determinism && determinism.next() > stepData.probability) {
          continue;
        }
        events.push({
          track,
          step: this.currentStep,
          note: stepData.note,
          velocity: stepData.velocity,
        });
      }
    }
    return events;
  }

  play() {
    this.isPlaying = true;
    this.currentStep = 0;
  }

  stop() {
    this.isPlaying = false;
    this.currentStep = 0;
  }

  clearTrack(track) {
    if (track >= 0 && track < this.numTracks) {
      for (let step = 0; step < this.numSteps; step++) {
        this.patterns[track][step].active = false;
        this.patterns[track][step].velocity = 1.0;
        this.patterns[track][step].probability = 1.0;
      }
    }
  }

  clearAll() {
    for (let track = 0; track < this.numTracks; track++) {
      this.clearTrack(track);
    }
  }

  randomize(track, density = 0.5, determinism = null) {
    if (track >= 0 && track < this.numTracks) {
      for (let step = 0; step < this.numSteps; step++) {
        const rand = determinism ? determinism.next() : Math.random();
        this.patterns[track][step].active = rand < density;
        this.patterns[track][step].velocity = determinism
          ? determinism.nextFloat(0.5, 1.0)
          : 0.5 + Math.random() * 0.5;
      }
    }
  }

  copyPattern(fromTrack, toTrack) {
    if (fromTrack >= 0 && fromTrack < this.numTracks && toTrack >= 0 && toTrack < this.numTracks) {
      this.patterns[toTrack] = this.patterns[fromTrack].map((step) => ({ ...step }));
    }
  }

  export() {
    return {
      numSteps: this.numSteps,
      numTracks: this.numTracks,
      patterns: this.patterns.map((track) => track.map((step) => ({ ...step }))),
      swing: this.swing,
    };
  }

  import(data) {
    this.numSteps = data.numSteps;
    this.numTracks = data.numTracks;
    this.patterns = data.patterns.map((track) => track.map((step) => ({ ...step })));
    this.swing = data.swing;
  }
}

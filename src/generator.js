// Loop Generator - Generate 8 types of loops

export class LoopGenerator {
  constructor(determinism) {
    this.determinism = determinism;
    this.types = [
      'melodic',
      'rhythmic',
      'lead',
      'fx',
      'percussion',
      'bass',
      'chord',
      'atmospheric',
    ];
  }

  async generate(type, options = {}) {
    const config = {
      type,
      bpm: options.bpm || 140,
      bars: options.bars || 4,
      key: options.key || 'C',
      scale: options.scale || 'minor',
      sampleRate: options.sampleRate || 48000,
      seed: options.seed || this.determinism.seed,
      ...options,
    };

    this.determinism.setSeed(config.seed);

    switch (type) {
      case 'melodic':
        return await this.generateMelodic(config);
      case 'rhythmic':
        return await this.generateRhythmic(config);
      case 'lead':
        return await this.generateLead(config);
      case 'fx':
        return await this.generateFX(config);
      case 'percussion':
        return await this.generatePercussion(config);
      case 'bass':
        return await this.generateBass(config);
      case 'chord':
        return await this.generateChord(config);
      case 'atmospheric':
        return await this.generateAtmospheric(config);
      default:
        throw new Error(`Unknown loop type: ${type}`);
    }
  }

  async generateMelodic(config) {
    const { bpm, bars, key, scale, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars; // 4 beats per bar
    const numSamples = Math.floor(duration * sampleRate);

    // Generate melody using MotifTransformer (simplified)
    const notes = this.generateMelody(key, scale, bars * 16); // 16th notes
    const audio = new Float32Array(numSamples);

    // Synthesize notes
    const samplesPerBeat = Math.floor((sampleRate * 60) / bpm);
    const samplesPer16th = Math.floor(samplesPerBeat / 4);

    notes.forEach((note, idx) => {
      if (note > 0) {
        const startSample = idx * samplesPer16th;
        const noteDuration = samplesPer16th;
        const freq = this.midiToFreq(note);

        for (let i = 0; i < noteDuration && startSample + i < numSamples; i++) {
          const t = i / sampleRate;
          const envelope = this.adsrEnvelope(i / noteDuration);
          audio[startSample + i] += Math.sin(2 * Math.PI * freq * t) * 0.3 * envelope;
        }
      }
    });

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'melodic',
      config,
    };
  }

  async generateRhythmic(config) {
    const { bpm, bars, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars;
    const numSamples = Math.floor(duration * sampleRate);
    const audio = new Float32Array(numSamples);

    // Generate polyrhythmic pattern
    const pattern = this.generateRhythmPattern(bars);
    const samplesPer16th = Math.floor(((60 / bpm) * sampleRate) / 4);

    pattern.forEach((hit, idx) => {
      if (hit) {
        const startSample = idx * samplesPer16th;
        const hitDuration = Math.floor(samplesPer16th * 0.1);

        // Synthesize drum hit
        for (let i = 0; i < hitDuration && startSample + i < numSamples; i++) {
          const t = i / sampleRate;
          const envelope = Math.exp(-t * 50); // Quick decay
          const freq = 100 + this.determinism.nextFloat(0, 200);
          audio[startSample + i] += Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
        }
      }
    });

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'rhythmic',
      config,
    };
  }

  async generateLead(config) {
    const result = await this.generateMelodic(config); // Simplified
    return { ...result, type: 'lead' }; // Keep the requested type label honest
  }

  async generateFX(config) {
    const { bpm, bars, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars;
    const numSamples = Math.floor(duration * sampleRate);
    const audio = new Float32Array(numSamples);

    // Generate riser
    for (let i = 0; i < numSamples; i++) {
      const t = i / numSamples;
      const freq = 100 + t * 2000; // Sweep from 100Hz to 2100Hz
      const envelope = t; // Ramp up
      audio[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate)) * envelope * 0.3;

      // Add noise
      audio[i] += this.determinism.nextFloat(-1, 1) * 0.1 * envelope;
    }

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'fx',
      config,
    };
  }

  async generatePercussion(config) {
    const result = await this.generateRhythmic(config); // Simplified
    return { ...result, type: 'percussion' }; // Keep the requested type label honest
  }

  async generateBass(config) {
    const { bpm, bars, key, scale, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars;
    const numSamples = Math.floor(duration * sampleRate);
    const audio = new Float32Array(numSamples);

    // Generate bass pattern
    const pattern = this.generateBassPattern(key, scale, bars);
    const samplesPer16th = Math.floor(((60 / bpm) * sampleRate) / 4);

    pattern.forEach((note, idx) => {
      if (note > 0) {
        const startSample = idx * samplesPer16th;
        const noteDuration = samplesPer16th * 2;
        const freq = this.midiToFreq(note);

        for (let i = 0; i < noteDuration && startSample + i < numSamples; i++) {
          const t = i / sampleRate;
          const envelope = this.adsrEnvelope(i / noteDuration);
          audio[startSample + i] += Math.sin(2 * Math.PI * freq * t) * 0.4 * envelope;
        }
      }
    });

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'bass',
      config,
    };
  }

  async generateChord(config) {
    const { bpm, bars, key, scale, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars;
    const numSamples = Math.floor(duration * sampleRate);
    const audio = new Float32Array(numSamples);

    // Generate chord progression
    const chords = this.generateChordProgression(key, scale, bars);
    const samplesPerBar = Math.floor((60 / bpm) * 4 * sampleRate);

    chords.forEach((chord, idx) => {
      const startSample = idx * samplesPerBar;

      chord.forEach((note) => {
        const freq = this.midiToFreq(note);
        for (let i = 0; i < samplesPerBar && startSample + i < numSamples; i++) {
          const t = i / sampleRate;
          const envelope = this.adsrEnvelope(i / samplesPerBar);
          audio[startSample + i] += Math.sin(2 * Math.PI * freq * t) * 0.15 * envelope;
        }
      });
    });

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'chord',
      config,
    };
  }

  async generateAtmospheric(config) {
    const { bpm, bars, sampleRate } = config;
    const duration = (60 / bpm) * 4 * bars;
    const numSamples = Math.floor(duration * sampleRate);
    const audio = new Float32Array(numSamples);

    // Generate pad texture
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;

      // Multiple oscillators with detuning
      for (let osc = 0; osc < 4; osc++) {
        const baseFreq = 110 + osc * 55;
        const detune = this.determinism.nextFloat(-5, 5);
        const freq = baseFreq + detune;

        audio[i] += Math.sin(2 * Math.PI * freq * t) * 0.1;
      }

      // Slow LFO
      const lfo = Math.sin(2 * Math.PI * 0.1 * t);
      audio[i] *= 0.5 + lfo * 0.3;
    }

    return {
      audio: this.createAudioBuffer(audio, sampleRate),
      type: 'atmospheric',
      config,
    };
  }

  // Helper methods
  generateMelody(key, scale, length) {
    const scaleNotes = this.getScaleNotes(key, scale);
    const notes = [];
    let prevNote = scaleNotes[this.determinism.nextInt(0, scaleNotes.length - 1)];

    for (let i = 0; i < length; i++) {
      if (this.determinism.nextFloat() < 0.7) {
        // 70% chance of note
        const jump = this.determinism.nextInt(-2, 2);
        const noteIdx = scaleNotes.indexOf(prevNote) + jump;
        const clampedIdx = Math.max(0, Math.min(scaleNotes.length - 1, noteIdx));
        prevNote = scaleNotes[clampedIdx];
        notes.push(prevNote);
      } else {
        notes.push(0); // Rest
      }
    }

    return notes;
  }

  generateRhythmPattern(bars) {
    const pattern = [];
    const stepsPerBar = 16;

    for (let bar = 0; bar < bars; bar++) {
      for (let step = 0; step < stepsPerBar; step++) {
        if (step % 4 === 0) {
          pattern.push(1); // Kick on every beat
        } else if (step % 8 === 4) {
          pattern.push(this.determinism.nextFloat() < 0.8 ? 1 : 0); // Snare
        } else {
          pattern.push(this.determinism.nextFloat() < 0.3 ? 1 : 0); // Hi-hat
        }
      }
    }

    return pattern;
  }

  generateBassPattern(key, scale, bars) {
    const scaleNotes = this.getScaleNotes(key, scale);
    const rootNote = scaleNotes[0];
    const pattern = [];
    const stepsPerBar = 16;

    for (let bar = 0; bar < bars; bar++) {
      for (let step = 0; step < stepsPerBar; step++) {
        if (step % 4 === 0) {
          pattern.push(rootNote); // Root on every beat
        } else if (step % 8 === 4) {
          pattern.push(rootNote + 7); // Fifth
        } else {
          pattern.push(0);
        }
      }
    }

    return pattern;
  }

  generateChordProgression(key, scale, bars) {
    const scaleNotes = this.getScaleNotes(key, scale);
    const chords = [];

    // I-IV-V-I progression
    const progression = [0, 3, 4, 0];

    for (let bar = 0; bar < bars; bar++) {
      const chordIdx = progression[bar % progression.length];
      const root = scaleNotes[chordIdx];
      const third = scaleNotes[(chordIdx + 2) % scaleNotes.length];
      const fifth = scaleNotes[(chordIdx + 4) % scaleNotes.length];

      chords.push([root, third, fifth]);
    }

    return chords;
  }

  getScaleNotes(key, scale) {
    const keyMap = {
      C: 60,
      'C#': 61,
      D: 62,
      'D#': 63,
      E: 64,
      F: 65,
      'F#': 66,
      G: 67,
      'G#': 68,
      A: 69,
      'A#': 70,
      B: 71,
    };
    const rootNote = keyMap[key] || 60;

    const intervals = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      aeolian: [0, 2, 3, 5, 7, 8, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],
    };

    const scaleIntervals = intervals[scale] || intervals.minor;
    return scaleIntervals.map((i) => rootNote + i);
  }

  midiToFreq(midi) {
    return 440 * 2 ** ((midi - 69) / 12);
  }

  adsrEnvelope(t) {
    if (t < 0.1) return t / 0.1; // Attack
    if (t < 0.2) return 1.0 - (t - 0.1) * 2; // Decay
    if (t < 0.8) return 0.8; // Sustain
    return 0.8 * (1.0 - (t - 0.8) / 0.2); // Release
  }

  createAudioBuffer(data, sampleRate) {
    // In browser, use AudioContext.createBuffer
    // For now, return raw data
    return {
      getChannelData: () => data,
      sampleRate,
      duration: data.length / sampleRate,
      numberOfChannels: 1,
    };
  }
}

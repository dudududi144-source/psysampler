// Audio Synthesis
// Advanced synthesis utilities

export class Synthesizer {
  constructor(audioContext) {
    this.context = audioContext;
    this.oscillators = new Map();
    this.envelopes = new Map();
    this.filters = new Map();
  }

  createOscillator(type = 'sine', frequency = 440, detune = 0) {
    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    return osc;
  }

  createADSR(attack = 0.01, decay = 0.1, sustain = 0.5, release = 0.3) {
    const gain = this.context.createGain();
    gain.gain.value = 0;

    return {
      node: gain,
      trigger: (time = this.context.currentTime) => {
        gain.gain.cancelScheduledValues(time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(1, time + attack);
        gain.gain.linearRampToValueAtTime(sustain, time + attack + decay);
      },
      release: (time = this.context.currentTime) => {
        gain.gain.cancelScheduledValues(time);
        gain.gain.setValueAtTime(gain.gain.value, time);
        gain.gain.linearRampToValueAtTime(0, time + release);
      },
    };
  }

  createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    return filter;
  }

  playNote(frequency, duration = 1, options = {}) {
    const {
      type = 'sine',
      attack = 0.01,
      decay = 0.1,
      sustain = 0.7,
      release = 0.3,
      filterType = null,
      filterFreq = 2000,
      filterQ = 1,
      destination = this.context.destination,
    } = options;

    const osc = this.createOscillator(type, frequency);
    const envelope = this.createADSR(attack, decay, sustain, release);

    let lastNode = osc;

    if (filterType) {
      const filter = this.createFilter(filterType, filterFreq, filterQ);
      lastNode.connect(filter);
      lastNode = filter;
    }

    lastNode.connect(envelope.node);
    envelope.node.connect(destination);

    const now = this.context.currentTime;
    osc.start(now);
    envelope.trigger(now);
    envelope.release(now + duration);
    osc.stop(now + duration + release + 0.1);

    return { osc, envelope };
  }

  createChord(rootFreq, chordType = 'major', duration = 1, options = {}) {
    const intervals = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
      augmented: [0, 4, 8],
      sus2: [0, 2, 7],
      sus4: [0, 5, 7],
    };

    const notes = intervals[chordType] || intervals.major;

    return notes.map((interval) => {
      const freq = rootFreq * 2 ** (interval / 12);
      return this.playNote(freq, duration, options);
    });
  }

  createArpeggio(rootFreq, pattern = [0, 4, 7, 12], noteDuration = 0.25, options = {}) {
    const now = this.context.currentTime;

    pattern.forEach((interval, index) => {
      const freq = rootFreq * 2 ** (interval / 12);
      const time = now + index * noteDuration;

      setTimeout(
        () => {
          this.playNote(freq, noteDuration * 0.8, options);
        },
        (time - now) * 1000,
      );
    });
  }

  midiToFreq(midi) {
    return 440 * 2 ** ((midi - 69) / 12);
  }

  freqToMidi(freq) {
    return 69 + 12 * Math.log2(freq / 440);
  }

  scaleToFreqs(rootMidi, scale = 'major', octaves = 1) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9],
      blues: [0, 3, 5, 6, 7, 10],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    };

    const intervals = scales[scale] || scales.major;
    const freqs = [];

    for (let oct = 0; oct < octaves; oct++) {
      intervals.forEach((interval) => {
        const midi = rootMidi + oct * 12 + interval;
        freqs.push(this.midiToFreq(midi));
      });
    }

    return freqs;
  }
}

// Synthesis Example
// Demonstrates advanced synthesis capabilities

import { Synthesizer } from '../src/utils/audio-synthesis.js';
import { AudioRouter } from '../src/utils/audio-routing.js';

async function synthesisExample() {
  console.log('🎹 Synthesis Example');
  
  const audioContext = new AudioContext();
  const synth = new Synthesizer(audioContext);
  const router = new AudioRouter(audioContext);

  // Create a simple synth patch
  console.log('Creating synth patch...');
  
  router.createNode('osc1', 'oscillator', { type: 'sawtooth', frequency: 220 });
  router.createNode('osc2', 'oscillator', { type: 'square', frequency: 220, detune: 7 });
  router.createNode('mixer', 'gain', { gain: 0.5 });
  router.createNode('filter', 'filter', { type: 'lowpass', frequency: 2000, Q: 5 });
  router.createNode('amp', 'gain', { gain: 0.7 });

  // Route the signal
  router.connect('osc1', 'mixer');
  router.connect('osc2', 'mixer');
  router.connect('mixer', 'filter');
  router.connect('filter', 'amp');
  router.routeToDestination('amp');

  // Play a simple melody
  console.log('Playing melody...');
  
  const melody = [
    { note: 60, duration: 0.5 }, // C4
    { note: 62, duration: 0.5 }, // D4
    { note: 64, duration: 0.5 }, // E4
    { note: 65, duration: 0.5 }, // F4
    { note: 67, duration: 1.0 }, // G4
    { note: 65, duration: 0.5 }, // F4
    { note: 64, duration: 0.5 }, // E4
    { note: 62, duration: 0.5 }, // D4
    { note: 60, duration: 1.0 }  // C4
  ];

  let time = audioContext.currentTime;
  
  melody.forEach(({ note, duration }) => {
    const freq = synth.midiToFreq(note);
    synth.playNote(freq, duration, {
      type: 'sawtooth',
      attack: 0.01,
      decay: 0.1,
      sustain: 0.6,
      release: 0.3,
      filterType: 'lowpass',
      filterFreq: 3000,
      filterQ: 2
    });
    time += duration;
  });

  // Play a chord progression
  console.log('\nPlaying chord progression...');
  
  const chords = [
    { root: 60, type: 'major', duration: 1.0 },  // C major
    { root: 65, type: 'minor', duration: 1.0 },  // F minor
    { root: 67, type: 'major', duration: 1.0 },  // G major
    { root: 60, type: 'major', duration: 1.0 }   // C major
  ];

  setTimeout(() => {
    chords.forEach(({ root, type, duration }) => {
      const freq = synth.midiToFreq(root);
      synth.createChord(freq, type, duration, {
        type: 'triangle',
        attack: 0.05,
        decay: 0.2,
        sustain: 0.5,
        release: 0.5
      });
    });
  }, time * 1000);

  // Play an arpeggio
  console.log('\nPlaying arpeggio...');
  
  setTimeout(() => {
    const rootFreq = synth.midiToFreq(60);
    synth.createArpeggio(rootFreq, [0, 4, 7, 12, 7, 4], 0.2, {
      type: 'sine',
      attack: 0.01,
      decay: 0.05,
      sustain: 0.3,
      release: 0.2
    });
  }, (time + 4) * 1000);

  console.log('\n✅ Synthesis example complete');
  console.log('🎹 Melody, chords, and arpeggio playing');
  
  return { synth, router };
}

synthesisExample().catch(console.error);

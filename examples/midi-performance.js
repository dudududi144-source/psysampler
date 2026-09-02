// MIDI Performance Example
// Full MIDI integration with live performance features

import { LooperDevice } from '../src/looper-device.js';
import { MIDILearn } from '../src/utils/midi-learn.js';
import { StepSequencer } from '../src/sequencer.js';

async function midiPerformanceExample() {
  console.log('🎹 MIDI Performance Example');
  
  const looper = new LooperDevice();
  await looper.initialize();
  
  const midiLearn = new MIDILearn();
  const sequencer = new StepSequencer(16, 8);

  // Initialize MIDI
  await looper.midi.initialize();
  
  // Map MIDI notes to slices
  console.log('Mapping MIDI notes to slices...');
  
  // C3-C4 (notes 48-60) mapped to slices 0-12
  for (let i = 0; i < 13; i++) {
    looper.midi.mapSliceToNote(48 + i, i);
    midiLearn.mapNote(48 + i, `slice:${i}`);
  }

  // Map CC controls
  console.log('Mapping CC controls...');
  
  // Mod wheel (CC1) -> Filter cutoff
  looper.midi.mapCCToParam(1, 'filterCutoff', 20, 20000);
  midiLearn.mapCC(1, 'filterCutoff', 20, 20000);
  
  // Volume (CC7) -> Master volume
  looper.midi.mapCCToParam(7, 'masterVolume', 0, 1);
  midiLearn.mapCC(7, 'masterVolume', 0, 1);
  
  // Pan (CC10) -> Pan
  looper.midi.mapCCToParam(10, 'pan', -1, 1);
  midiLearn.mapCC(10, 'pan', -1, 1);
  
  // Expression (CC11) -> Reverb mix
  looper.midi.mapCCToParam(11, 'reverbMix', 0, 1);
  midiLearn.mapCC(11, 'reverbMix', 0, 1);
  
  // Filter resonance (CC71)
  looper.midi.mapCCToParam(71, 'filterResonance', 0, 20);
  midiLearn.mapCC(71, 'filterResonance', 0, 20);
  
  // Delay mix (CC91)
  looper.midi.mapCCToParam(91, 'delayMix', 0, 1);
  midiLearn.mapCC(91, 'delayMix', 0, 1);

  // Map transport controls
  console.log('Mapping transport controls...');
  looper.midi.mapTransport('play', 0x7F); // Start
  looper.midi.mapTransport('stop', 0xFC); // Stop
  looper.midi.mapTransport('record', 0xFB); // Continue

  // Create a step sequencer pattern
  console.log('Creating step sequencer pattern...');
  
  // Track 0: Kick pattern
  sequencer.setStep(0, 0, true);
  sequencer.setStep(0, 4, true);
  sequencer.setStep(0, 8, true);
  sequencer.setStep(0, 12, true);
  
  // Track 1: Snare pattern
  sequencer.setStep(1, 4, true);
  sequencer.setStep(1, 12, true);
  
  // Track 2: Hi-hat pattern (every step with velocity variation)
  for (let i = 0; i < 16; i++) {
    sequencer.setStep(2, i, true, i % 2 === 0 ? 1.0 : 0.6);
  }

  // Connect sequencer to looper
  sequencer.onStep = (step) => {
    const events = sequencer.getActiveEvents(step);
    events.forEach(event => {
      if (event.track === 0) {
        looper.triggerSlice(0); // Kick
      } else if (event.track === 1) {
        looper.triggerSlice(1); // Snare
      } else if (event.track === 2) {
        looper.triggerSlice(2, event.velocity); // Hi-hat
      }
    });
  };

  // MIDI learn mode
  console.log('\n🎹 MIDI Learn Mode:');
  console.log('To map a new control:');
  console.log('1. Call midiLearn.startLearning(paramPath, min, max)');
  console.log('2. Move the MIDI control');
  console.log('3. Mapping is automatic!');

  // Example: Learn a new mapping
  // midiLearn.startLearning('customParam', 0, 1);

  // Load a loop
  await looper.loadLoop('performance-loop.wav');

  // Start MIDI clock sync
  looper.midi.enableClock();
  console.log('✅ MIDI clock sync enabled');

  // Start playback
  looper.play();
  sequencer.play();

  console.log('\n🎛️ Performance Setup:');
  console.log('🎹 Notes C3-C4: Trigger slices 0-12');
  console.log('🎚️ CC1: Filter cutoff');
  console.log('🎚️ CC7: Master volume');
  console.log('🎚️ CC10: Pan');
  console.log('🎚️ CC11: Reverb mix');
  console.log('🎚️ CC71: Filter resonance');
  console.log('🎚️ CC91: Delay mix');
  console.log('⏯️ Transport: Start/Stop/Continue');
  console.log('🥁 Step sequencer: 16-step drum pattern active');

  return { looper, midiLearn, sequencer };
}

midiPerformanceExample().catch(console.error);

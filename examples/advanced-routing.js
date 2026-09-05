// Advanced Audio Routing Example
// Demonstrates complex audio routing with multiple buses and effects

import { AudioRouter } from '../src/utils/audio-routing.js';
import { Synthesizer } from '../src/utils/audio-synthesis.js';

async function advancedRoutingExample() {
  console.log('🔀 Advanced Audio Routing Example');

  const audioContext = new AudioContext();
  const router = new AudioRouter(audioContext);
  const synth = new Synthesizer(audioContext);

  // Create multiple buses
  console.log('Creating audio buses...');

  router.createBus('drums', { gain: 0.8 });
  router.createBus('bass', { gain: 0.9 });
  router.createBus('synth', { gain: 0.7 });
  router.createBus('fx', { gain: 0.6 });
  router.createBus('master', { gain: 1.0 });

  // Create sound sources
  console.log('Creating sound sources...');

  // Drum sounds
  router.createNode('kick', 'gain', { gain: 0 });
  router.createNode('snare', 'gain', { gain: 0 });
  router.createNode('hihat', 'gain', { gain: 0 });

  // Bass synth
  router.createNode('bass_osc', 'oscillator', {
    type: 'sawtooth',
    frequency: 55,
  });
  router.createNode('bass_filter', 'filter', {
    type: 'lowpass',
    frequency: 800,
    Q: 5,
  });
  router.createNode('bass_amp', 'gain', { gain: 0.7 });

  // Lead synth
  router.createNode('lead_osc1', 'oscillator', {
    type: 'sawtooth',
    frequency: 440,
  });
  router.createNode('lead_osc2', 'oscillator', {
    type: 'square',
    frequency: 440,
    detune: 7,
  });
  router.createNode('lead_mixer', 'gain', { gain: 0.5 });
  router.createNode('lead_filter', 'filter', {
    type: 'lowpass',
    frequency: 3000,
    Q: 8,
  });

  // Effects
  router.createNode('reverb', 'convolver');
  router.createNode('reverb_mix', 'gain', { gain: 0.3 });

  router.createNode('delay', 'delay', { delayTime: 0.375 });
  router.createNode('delay_feedback', 'gain', { gain: 0.4 });
  router.createNode('delay_mix', 'gain', { gain: 0.25 });

  // Master compressor
  router.createNode('master_comp', 'compressor');
  router.createNode('master_limiter', 'gain', { gain: 0.95 });

  // Route drums to drum bus
  console.log('Routing drums...');
  router.addToBus('drums', 'kick');
  router.addToBus('drums', 'snare');
  router.addToBus('drums', 'hihat');

  // Route bass through filter
  console.log('Routing bass...');
  router.connect('bass_osc', 'bass_filter');
  router.connect('bass_filter', 'bass_amp');
  router.addToBus('bass', 'bass_amp');

  // Route lead synth
  console.log('Routing lead synth...');
  router.connect('lead_osc1', 'lead_mixer');
  router.connect('lead_osc2', 'lead_mixer');
  router.connect('lead_mixer', 'lead_filter');
  router.addToBus('synth', 'lead_filter');

  // Send synth bus to effects
  console.log('Setting up effects sends...');
  const synthBus = router.getBus('synth');

  // Send to reverb
  router.connect('lead_filter', 'reverb');
  router.connect('reverb', 'reverb_mix');
  router.addToBus('fx', 'reverb_mix');

  // Send to delay
  router.connect('lead_filter', 'delay');
  router.connect('delay', 'delay_feedback');
  router.connect('delay_feedback', 'delay'); // Feedback loop
  router.connect('delay', 'delay_mix');
  router.addToBus('fx', 'delay_mix');

  // Route all buses to master
  console.log('Routing to master bus...');
  const drumBus = router.getBus('drums');
  const bassBus = router.getBus('bass');
  const fxBus = router.getBus('fx');

  drumBus.output.connect(router.getBus('master').input);
  bassBus.output.connect(router.getBus('master').input);
  synthBus.output.connect(router.getBus('master').input);
  fxBus.output.connect(router.getBus('master').input);

  // Route master to destination
  console.log('Routing master to output...');
  router.connect('master_output', 'master_comp');
  router.connect('master_comp', 'master_limiter');
  router.routeToDestination('master_limiter');

  // Play some sounds
  console.log('\nPlaying sounds through routing...');

  const now = audioContext.currentTime;

  // Trigger kick
  router.getNode('kick').gain.setValueAtTime(0.8, now);
  router.getNode('kick').gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  // Trigger snare
  setTimeout(() => {
    router.getNode('snare').gain.setValueAtTime(0.6, audioContext.currentTime);
    router
      .getNode('snare')
      .gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
  }, 500);

  // Play bass note
  setTimeout(() => {
    const bassFreq = synth.midiToFreq(36);
    router.getNode('bass_osc').frequency.setValueAtTime(bassFreq, audioContext.currentTime);
  }, 250);

  // Play lead note
  setTimeout(() => {
    const leadFreq = synth.midiToFreq(69);
    router.getNode('lead_osc1').frequency.setValueAtTime(leadFreq, audioContext.currentTime);
    router.getNode('lead_osc2').frequency.setValueAtTime(leadFreq, audioContext.currentTime);
  }, 750);

  console.log('\n🔀 Routing Setup:');
  console.log('Drums → Drum Bus → Master');
  console.log('Bass → Filter → Bass Bus → Master');
  console.log('Lead → Mixer → Filter → Synth Bus → Master');
  console.log('Lead → Reverb → FX Bus → Master');
  console.log('Lead → Delay → FX Bus → Master');
  console.log('Master → Compressor → Limiter → Output');

  console.log('\n✅ Advanced routing example complete');

  return router;
}

advancedRoutingExample().catch(console.error);

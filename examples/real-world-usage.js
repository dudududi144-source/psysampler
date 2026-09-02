// Real-World Usage Example
// Demonstrates PSY LOOPER in a live performance scenario

import { LooperDevice } from '../src/looper-device.js';
import { StepSequencer } from '../src/sequencer.js';

async function livePerformance() {
  console.log('🎭 Live Performance Setup');
  console.log('═'.repeat(60));

  const looper = new LooperDevice();
  await looper.initialize();

  // Scenario: Live psytrance performance
  console.log('\nScenario: Live Psytrance Performance');
  console.log('─'.repeat(60));

  // 1. Load kick loop
  console.log('\n1. Loading kick loop...');
  const kickLoop = await looper.loadLoop('kick-145bpm.wav');
  console.log(`   ✅ Kick loaded: ${kickLoop.duration.toFixed(2)}s, ${kickLoop.slices.length} slices`);

  // 2. Load bass loop
  console.log('\n2. Loading bass loop...');
  const bassLoop = await looper.loadLoop('bass-145bpm-Gmin.wav');
  console.log(`   ✅ Bass loaded: ${bassLoop.duration.toFixed(2)}s, ${bassLoop.slices.length} slices`);

  // 3. Generate lead melody
  console.log('\n3. Generating lead melody...');
  const leadLoop = await looper.generateLoop('melodic', {
    bpm: 145,
    key: 'A',
    scale: 'minor',
    bars: 4
  });
  console.log(`   ✅ Lead generated: ${leadLoop.duration.toFixed(2)}s`);

  // 4. Generate atmospheric pad
  console.log('\n4. Generating atmospheric pad...');
  const padLoop = await looper.generateLoop('atmospheric', {
    bpm: 145,
    key: 'A',
    scale: 'minor',
    bars: 8
  });
  console.log(`   ✅ Pad generated: ${padLoop.duration.toFixed(2)}s`);

  // 5. Setup step sequencer for drums
  console.log('\n5. Setting up drum sequencer...');
  const drumSeq = new StepSequencer(16, 4);
  
  // Kick pattern (4-on-the-floor)
  for (let i = 0; i < 16; i += 4) {
    drumSeq.setStep(0, i, true, 1.0);
  }
  
  // Snare pattern (beats 2 and 4)
  drumSeq.setStep(1, 4, true, 0.9);
  drumSeq.setStep(1, 12, true, 0.9);
  
  // Hi-hat pattern (8ths)
  for (let i = 0; i < 16; i++) {
    drumSeq.setStep(2, i, true, i % 2 === 0 ? 0.8 : 0.5);
  }
  
  // Percussion (off-beat 16ths)
  for (let i = 1; i < 16; i += 2) {
    if (i % 4 !== 1) {
      drumSeq.setStep(3, i, true, 0.6);
    }
  }
  
  console.log('   ✅ Drum pattern created');

  // 6. Setup effects
  console.log('\n6. Setting up effects...');
  
  const fxChain = looper.audioGraph.masterBus.fxChain;
  
  await fxChain.addFX('compressor', {
    threshold: -18,
    ratio: 4,
    attack: 3,
    release: 80
  });
  
  await fxChain.addFX('reverb', {
    decay: 2.5,
    mix: 0.25
  });
  
  await fxChain.addFX('delay', {
    time: 0.375,
    feedback: 0.4,
    mix: 0.2
  });
  
  await fxChain.addFX('limiter', {
    ceiling: -0.5
  });
  
  console.log('   ✅ Effects chain ready');

  // 7. Setup MIDI controller
  console.log('\n7. Setting up MIDI controller...');
  
  await looper.midi.initialize();
  
  // Map pads to slices
  for (let i = 0; i < 16; i++) {
    looper.midi.mapSliceToNote(36 + i, i);
  }
  
  // Map faders to FX
  looper.midi.mapCCToParam(1, 'filterCutoff', 100, 10000);
  looper.midi.mapCCToParam(2, 'reverbMix', 0, 1);
  looper.midi.mapCCToParam(3, 'delayMix', 0, 1);
  
  console.log('   ✅ MIDI controller mapped');

  // 8. Performance sequence
  console.log('\n8. Performance sequence:');
  console.log('   [0:00] Start with kick + bass');
  console.log('   [0:30] Add hi-hats');
  console.log('   [1:00] Add percussion');
  console.log('   [1:30] Bring in lead melody');
  console.log('   [2:00] Add atmospheric pad');
  console.log('   [2:30] Build-up with filter sweep');
  console.log('   [3:00] Drop - full arrangement');
  console.log('   [4:00] Breakdown - pad only');
  console.log('   [4:30] Build-up again');
  console.log('   [5:00] Final drop');
  console.log('   [6:00] Outro');

  // 9. Setup automation for build-ups
  console.log('\n9. Setting up automation...');
  
  const filterAuto = looper.automation.createLane('filterCutoff');
  filterAuto.addPoint(150, 200);   // 2:30 - start sweep
  filterAuto.addPoint(180, 10000); // 3:00 - fully open
  filterAuto.addPoint(240, 500);   // 4:00 - breakdown
  filterAuto.addPoint(270, 200);   // 4:30 - start sweep
  filterAuto.addPoint(300, 10000); // 5:00 - fully open
  
  console.log('   ✅ Filter automation ready');

  // 10. Ready to perform
  console.log('\n' + '═'.repeat(60));
  console.log('🎭 Live Performance Ready!');
  console.log('═'.repeat(60));
  console.log('\nSetup:');
  console.log('  🥁 Kick + Bass loops loaded');
  console.log('  🎹 Lead melody generated');
  console.log('  🌌 Atmospheric pad ready');
  console.log('  🎵 Drum sequencer programmed');
  console.log('  🎛️ Effects chain active');
  console.log('  🎹 MIDI controller mapped');
  console.log('  📈 Automation configured');
  console.log('\nControls:');
  console.log('  - MIDI pads: Trigger slices');
  console.log('  - Fader 1: Filter cutoff');
  console.log('  - Fader 2: Reverb mix');
  console.log('  - Fader 3: Delay mix');
  console.log('  - Transport: Play/Stop/Record');
  console.log('\nReady to perform! 🎉\n');

  // Start performance
  looper.setTempo(145);
  
  return {
    looper,
    drumSeq,
    start: () => {
      console.log('▶️ Starting performance...');
      looper.play();
      drumSeq.play();
    },
    stop: () => {
      console.log('⏹️ Stopping performance...');
      looper.stop();
      drumSeq.stop();
    }
  };
}

// Initialize
livePerformance().catch(console.error);

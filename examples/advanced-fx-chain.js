// Advanced FX Chain Example
// Demonstrates complex FX routing and automation

import { FX_TYPES } from '../src/fx-chain.js';
import { LooperDevice } from '../src/looper-device.js';
import { AutomationLane, CURVE_TYPES } from '../src/utils/automation-curves.js';

async function advancedFXExample() {
  console.log('🎛️ Advanced FX Chain Example');

  const looper = new LooperDevice();
  await looper.initialize();

  // Create a complex FX chain
  const fxChain = looper.audioGraph.masterBus.fxChain;

  // 1. Compressor with sidechain
  const compressor = await fxChain.addFX(FX_TYPES.COMPRESSOR, {
    threshold: -20,
    ratio: 4,
    attack: 5,
    release: 100,
    knee: 6,
  });

  // 2. Multi-band EQ
  const eq = await fxChain.addFX(FX_TYPES.EQ, {
    bands: [
      { frequency: 80, gain: 3, Q: 0.7, type: 'lowshelf' },
      { frequency: 250, gain: -2, Q: 1.5, type: 'peaking' },
      { frequency: 1000, gain: 1, Q: 1, type: 'peaking' },
      { frequency: 3000, gain: 2, Q: 1.2, type: 'peaking' },
      { frequency: 8000, gain: -1, Q: 0.8, type: 'highshelf' },
    ],
  });

  // 3. Granular delay
  const granularDelay = await fxChain.addFX(FX_TYPES.GRANULAR, {
    grainSize: 50,
    grainDensity: 20,
    pitchRandom: 2,
    panSpread: 0.8,
    wetMix: 0.3,
  });

  // 4. Convolution reverb
  const reverb = await fxChain.addFX(FX_TYPES.CONVOLUTION, {
    wetMix: 0.25,
    preDelay: 20,
    damping: 0.6,
    decay: 2.5,
  });

  // 5. Master limiter
  const limiter = await fxChain.addFX(FX_TYPES.LIMITER, {
    ceiling: -0.3,
    release: 50,
  });

  // Create automation for filter cutoff
  const filterAutomation = new AutomationLane();
  filterAutomation.setCurveType(CURVE_TYPES.SMOOTH);

  filterAutomation.addPoint(0, 200);
  filterAutomation.addPoint(2, 5000);
  filterAutomation.addPoint(4, 1000);
  filterAutomation.addPoint(6, 8000);
  filterAutomation.addPoint(8, 200);

  // Create automation for reverb mix
  const reverbAutomation = new AutomationLane();
  reverbAutomation.setCurveType(CURVE_TYPES.SINE);

  reverbAutomation.addPoint(0, 0.1);
  reverbAutomation.addPoint(4, 0.5);
  reverbAutomation.addPoint(8, 0.1);

  // Apply automation in real-time
  const applyAutomation = () => {
    const time = looper.transport.currentTime;

    // Apply filter automation
    const filterValue = filterAutomation.getValueAt(time);
    eq.setParameter('frequency', filterValue, 1); // Band 1

    // Apply reverb automation
    const reverbValue = reverbAutomation.getValueAt(time);
    reverb.setParameter('wetMix', reverbValue);

    if (looper.transport.playing) {
      requestAnimationFrame(applyAutomation);
    }
  };

  // Load a loop and start playback
  await looper.loadLoop('demo-loop.wav');

  looper.transport.on('play', () => {
    applyAutomation();
  });

  looper.play();

  console.log('✅ Advanced FX chain with automation running');
  console.log('🎚️ Compressor → EQ → Granular Delay → Reverb → Limiter');
  console.log('📈 Filter and reverb automation active');

  return looper;
}

advancedFXExample().catch(console.error);

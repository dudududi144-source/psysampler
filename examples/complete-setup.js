// Complete Setup Example
// Full PSY LOOPER setup with all features enabled

import { LooperDevice } from '../src/looper-device.js';
import { ErrorHandler } from '../src/utils/error-handler.js';
import { MIDILearn } from '../src/utils/midi-learn.js';
import { PerformanceMonitor } from '../src/utils/performance-monitor.js';
import { PresetManager } from '../src/utils/preset-manager.js';
import { StateManager } from '../src/utils/state-manager.js';

async function completeSetup() {
  console.log('🎛️ PSY LOOPER - Complete Setup');
  console.log('═'.repeat(60));

  // Initialize error handler
  const errorHandler = new ErrorHandler();
  errorHandler.addListener((error) => {
    console.error('Error:', error.message);
  });

  // Initialize performance monitor
  const perfMonitor = new PerformanceMonitor();
  perfMonitor.start();
  console.log('✅ Performance monitor started');

  // Initialize state manager
  const state = new StateManager();
  state.setState('app.initialized', false);
  console.log('✅ State manager initialized');

  // Initialize preset manager
  const presetManager = new PresetManager();
  await presetManager.loadFromLocalStorage();
  console.log('✅ Preset manager initialized');

  // Initialize MIDI learn
  const midiLearn = new MIDILearn();
  console.log('✅ MIDI learn initialized');

  // Initialize main device
  console.log('\nInitializing LooperDevice...');
  const looper = await errorHandler.wrapAsync(async () => {
    const device = new LooperDevice({
      sampleRate: 48000,
      numBanks: 8,
      oversampling: 4,
    });

    await device.initialize();
    return device;
  }, 'device-init');

  console.log('✅ LooperDevice initialized');

  // Setup audio graph
  console.log('\nSetting up audio graph...');

  const audioGraph = looper.audioGraph;

  // Create buses
  audioGraph.createBus('drums', { gain: 0.8 });
  audioGraph.createBus('bass', { gain: 0.9 });
  audioGraph.createBus('synth', { gain: 0.7 });
  audioGraph.createBus('fx', { gain: 0.6 });
  audioGraph.createBus('master', { gain: 1.0 });

  console.log('✅ Audio buses created');

  // Add effects to master bus
  const masterFx = audioGraph.masterBus.fxChain;

  await masterFx.addFX('compressor', {
    threshold: -15,
    ratio: 3,
    attack: 5,
    release: 100,
  });

  await masterFx.addFX('eq', {
    bands: [
      { frequency: 80, gain: 2, Q: 0.7 },
      { frequency: 3000, gain: 1, Q: 1 },
      { frequency: 8000, gain: -1, Q: 0.8 },
    ],
  });

  await masterFx.addFX('limiter', {
    ceiling: -0.3,
    release: 50,
  });

  console.log('✅ Master effects added');

  // Setup MIDI
  console.log('\nSetting up MIDI...');

  await looper.midi.initialize();

  // Map slices to MIDI notes
  for (let i = 0; i < 16; i++) {
    looper.midi.mapSliceToNote(48 + i, i);
  }

  // Map CC controls
  looper.midi.mapCCToParam(1, 'filterCutoff', 20, 20000);
  looper.midi.mapCCToParam(7, 'masterVolume', 0, 1);
  looper.midi.mapCCToParam(10, 'pan', -1, 1);
  looper.midi.mapCCToParam(91, 'reverbMix', 0, 1);

  looper.midi.enableClock();

  console.log('✅ MIDI configured');

  // Load presets
  console.log('\nLoading presets...');

  presetManager.addPreset('psy-kick', {
    name: 'Psytrance Kick',
    category: 'drums',
    config: { bpm: 145 },
  });

  presetManager.addPreset('psy-bass', {
    name: 'Psytrance Bass',
    category: 'bass',
    config: { bpm: 145, key: 'G', scale: 'minor' },
  });

  presetManager.addPreset('acid-lead', {
    name: 'Acid Lead',
    category: 'lead',
    config: { bpm: 145, key: 'A', scale: 'minor' },
  });

  console.log('✅ Presets loaded');

  // Setup keyboard shortcuts
  console.log('\nSetting up keyboard shortcuts...');

  looper.keyboard.on('space', () => {
    looper.transport.playing ? looper.stop() : looper.play();
  });

  looper.keyboard.on('r', () => looper.record());
  looper.keyboard.on('o', () => looper.overdub());
  looper.keyboard.on('z', () => looper.undo());
  looper.keyboard.on('x', () => looper.redo());

  // Slice triggers 1-9
  for (let i = 1; i <= 9; i++) {
    looper.keyboard.on(String(i), () => {
      looper.triggerSlice(looper.currentBank, i - 1);
    });
  }

  console.log('✅ Keyboard shortcuts configured');

  // Setup CO-PILOT
  console.log('\nSetting up CO-PILOT...');

  looper.copilot.onSuggestion((suggestion) => {
    console.log(`CO-PILOT suggests: ${suggestion.action}`);
    state.setState('copilot.lastSuggestion', suggestion);
  });

  console.log('✅ CO-PILOT configured');

  // Setup automation
  console.log('\nSetting up automation...');

  const filterAutomation = looper.automation.createLane('filterCutoff');
  filterAutomation.addPoint(0, 200);
  filterAutomation.addPoint(4, 5000);
  filterAutomation.addPoint(8, 200);

  console.log('✅ Automation lanes created');

  // Update state
  state.setState('app.initialized', true);
  state.setState('app.version', '1.0.0');
  state.setState('app.startTime', Date.now());

  // Get performance metrics
  const metrics = perfMonitor.getMetrics();
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 Performance Metrics:');
  console.log(`  FPS: ${metrics.fps.toFixed(2)}`);
  console.log(`  Frame time: ${metrics.frameTime.toFixed(2)}ms`);
  console.log(`  Jitter: ${metrics.jitter.toFixed(2)}ms`);

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log('🎉 PSY LOOPER Complete Setup Summary:');
  console.log('═'.repeat(60));
  console.log('✅ Device initialized (8 banks, 4x oversampling)');
  console.log('✅ Audio graph configured (5 buses)');
  console.log('✅ Master effects chain (compressor, EQ, limiter)');
  console.log('✅ MIDI integration (16 slices + CC controls)');
  console.log('✅ Presets loaded (3 presets)');
  console.log('✅ Keyboard shortcuts (space, R, O, Z, X, 1-9)');
  console.log('✅ CO-PILOT enabled');
  console.log('✅ Automation lanes created');
  console.log('✅ State management active');
  console.log('✅ Performance monitoring active');
  console.log('✅ Error handling active');
  console.log('═'.repeat(60));
  console.log('\n🎛️ PSY LOOPER is ready!\n');

  return {
    looper,
    state,
    presetManager,
    midiLearn,
    perfMonitor,
    errorHandler,
  };
}

// Run setup
completeSetup().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});

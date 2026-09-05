// State Management Example
// Demonstrates centralized state management with undo/redo

import { LooperDevice } from '../src/looper-device.js';
import { StateManager } from '../src/utils/state-manager.js';

async function stateManagementExample() {
  console.log('🗄️ State Management Example');

  const state = new StateManager();
  const looper = new LooperDevice();
  await looper.initialize();

  // Initialize state
  console.log('Initializing state...');

  state.setState('transport.bpm', 120);
  state.setState('transport.playing', false);
  state.setState('transport.looping', true);

  state.setState('audio.masterVolume', 0.8);
  state.setState('audio.masterPan', 0);

  state.setState('fx.filter.enabled', true);
  state.setState('fx.filter.cutoff', 1000);
  state.setState('fx.filter.resonance', 2);

  state.setState('fx.reverb.enabled', true);
  state.setState('fx.reverb.mix', 0.3);
  state.setState('fx.reverb.decay', 2.5);

  // Subscribe to state changes
  console.log('Setting up subscriptions...');

  const unsubscribe1 = state.subscribe('transport.bpm', (newVal, oldVal) => {
    console.log(`BPM changed: ${oldVal} → ${newVal}`);
    looper.setTempo(newVal);
  });

  const unsubscribe2 = state.subscribe('audio.masterVolume', (newVal) => {
    console.log(`Master volume: ${newVal}`);
    looper.audioGraph.masterBus.setVolume(newVal);
  });

  const unsubscribe3 = state.subscribe('fx.*', (newVal, oldVal, path) => {
    console.log(`FX parameter changed: ${path} = ${newVal}`);
    // Apply FX changes
  });

  // Global subscriber
  const unsubscribe4 = state.subscribe('*', (newVal, oldVal, path) => {
    console.log(`State change: ${path}`);
  });

  // Demonstrate state changes
  console.log('\n--- Making state changes ---');

  state.setState('transport.bpm', 140);
  state.setState('audio.masterVolume', 0.6);
  state.setState('fx.filter.cutoff', 5000);
  state.setState('fx.reverb.mix', 0.5);

  // Demonstrate update with function
  console.log('\n--- Updating with function ---');

  state.updateState('audio.masterVolume', (current) => current * 0.5);

  // Demonstrate undo
  console.log('\n--- Demonstrating undo ---');
  console.log(`Can undo: ${state.canUndo()}`);
  console.log(`History length: ${state.getHistory().length}`);

  state.undo();
  state.undo();
  state.undo();

  // Demonstrate nested state
  console.log('\n--- Nested state ---');

  state.setState('banks.0.loop', 'loop1.wav');
  state.setState('banks.0.slices', 16);
  state.setState('banks.0.currentSlice', 0);

  state.setState('banks.1.loop', 'loop2.wav');
  state.setState('banks.1.slices', 12);
  state.setState('banks.1.currentSlice', 0);

  // Get nested state
  const bank0State = state.getState('banks.0');
  console.log('Bank 0 state:', bank0State);

  // Export and import state
  console.log('\n--- Export/Import state ---');

  const exported = state.export();
  console.log('Exported state:', exported);

  const newState = new StateManager();
  newState.import(exported);
  console.log('Imported state successfully');

  // Cleanup
  unsubscribe1();
  unsubscribe2();
  unsubscribe3();
  unsubscribe4();

  console.log('\n✅ State management example complete');

  return state;
}

stateManagementExample().catch(console.error);

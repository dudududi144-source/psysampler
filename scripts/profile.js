#!/usr/bin/env bun
// CPU/Memory profiler for PSY LOOPER

import { Determinism } from '../src/determinism.js';
import { LooperDevice } from '../src/looper-device.js';
import { StepSequencer } from '../src/sequencer.js';

console.log('🔍 Running PSY LOOPER profiler...\n');

async function profileMemory() {
  console.log('💾 Memory Profile:');
  console.log('  Creating 100 LooperDevice instances...');

  const devices = [];
  for (let i = 0; i < 100; i++) {
    devices.push(new LooperDevice());
  }

  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    console.log(`  RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(mem.external / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('  Clearing devices...');
  devices.length = 0;
  console.log('');
}

async function profileCPU() {
  console.log('⚡ CPU Profile:');

  // Profile sequencer
  console.log('  Profiling sequencer...');
  const seq = new StepSequencer(16, 8);
  const det = new Determinism(12345);

  for (let track = 0; track < 8; track++) {
    for (let step = 0; step < 16; step++) {
      seq.setStep(track, step, true);
    }
  }

  let start = performance.now();
  for (let i = 0; i < 100000; i++) {
    seq.getActiveEvents(det);
    seq.nextStep();
  }
  let end = performance.now();
  console.log(`  100k step cycles: ${(end - start).toFixed(2)}ms`);

  // Profile determinism
  console.log('  Profiling determinism...');
  start = performance.now();
  for (let i = 0; i < 1000000; i++) {
    det.next();
  }
  end = performance.now();
  console.log(`  1M RNG calls: ${(end - start).toFixed(2)}ms`);

  console.log('');
}

async function runProfile() {
  await profileMemory();
  await profileCPU();
  console.log('✅ Profiling complete!');
}

runProfile().catch((err) => {
  console.error('❌ Profiling failed:', err);
  process.exit(1);
});

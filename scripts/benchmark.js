#!/usr/bin/env bun
// Performance benchmarks for PSY LOOPER

import { Determinism } from '../src/determinism.js';
import { StepSequencer } from '../src/sequencer.js';

console.log('🚀 Running PSY LOOPER benchmarks...\n');

// Benchmark 1: Determinism RNG
console.log('📊 Benchmark 1: Determinism RNG');
const det = new Determinism(12345);
const iterations = 1000000;
let start = performance.now();
for (let i = 0; i < iterations; i++) {
  det.next();
}
let end = performance.now();
console.log(`  ${iterations} RNG calls: ${(end - start).toFixed(2)}ms`);
console.log(`  ${(iterations / (end - start) * 1000).toFixed(0)} calls/second\n`);

// Benchmark 2: Sequencer step processing
console.log('📊 Benchmark 2: Sequencer step processing');
const seq = new StepSequencer(16, 8);
for (let track = 0; track < 8; track++) {
  for (let step = 0; step < 16; step++) {
    seq.setStep(track, step, true);
  }
}
const seqIterations = 10000;
start = performance.now();
for (let i = 0; i < seqIterations; i++) {
  seq.getActiveEvents(det);
  seq.nextStep();
}
end = performance.now();
console.log(`  ${seqIterations} step cycles: ${(end - start).toFixed(2)}ms`);
console.log(`  ${(seqIterations / (end - start) * 1000).toFixed(0)} cycles/second\n`);

// Benchmark 3: Array shuffle
console.log('📊 Benchmark 3: Array shuffle');
const array = Array.from({ length: 10000 }, (_, i) => i);
const shuffleIterations = 1000;
start = performance.now();
for (let i = 0; i < shuffleIterations; i++) {
  det.shuffle([...array]);
}
end = performance.now();
console.log(`  ${shuffleIterations} shuffles of ${array.length} elements: ${(end - start).toFixed(2)}ms`);
console.log(`  ${(shuffleIterations / (end - start) * 1000).toFixed(0)} shuffles/second\n`);

// Benchmark 4: Pattern export/import
console.log('📊 Benchmark 4: Pattern export/import');
const seq2 = new StepSequencer(64, 16);
const exportIterations = 100;
start = performance.now();
for (let i = 0; i < exportIterations; i++) {
  const exported = seq2.export();
  seq2.import(exported);
}
end = performance.now();
console.log(`  ${exportIterations} export/import cycles: ${(end - start).toFixed(2)}ms`);
console.log(`  ${(exportIterations / (end - start) * 1000).toFixed(0)} cycles/second\n`);

console.log('✅ Benchmarks complete!');

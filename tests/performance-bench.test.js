// Performance Benchmark Tests

import { Determinism } from '../src/determinism.js';
import { StepSequencer } from '../src/sequencer.js';

describe('Performance Benchmarks', () => {
  test('Determinism generates 1M values in <100ms', () => {
    const det = new Determinism(12345);
    
    const start = performance.now();
    for (let i = 0; i < 1000000; i++) {
      det.next();
    }
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });

  test('StepSequencer processes 1000 steps in <50ms', () => {
    const seq = new StepSequencer(16, 8);
    
    // Fill pattern
    for (let track = 0; track < 8; track++) {
      for (let step = 0; step < 16; step++) {
        seq.setStep(track, step, true);
      }
    }
    
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      seq.getActiveEvents(null);
      seq.nextStep();
    }
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });

  test('Determinism shuffle handles large arrays', () => {
    const det = new Determinism(12345);
    const array = Array.from({ length: 10000 }, (_, i) => i);
    
    const start = performance.now();
    det.shuffle(array);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(10);
  });

  test('StepSequencer export handles large patterns', () => {
    const seq = new StepSequencer(64, 16);
    
    const start = performance.now();
    const exported = seq.export();
    const end = performance.now();
    
    expect(end - start).toBeLessThan(10);
    expect(exported.patterns.length).toBe(16);
  });
});

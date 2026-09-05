// Sequencer Tests

import { Determinism } from '../src/determinism.js';
import { StepSequencer } from '../src/sequencer.js';

describe('StepSequencer', () => {
  let sequencer;

  beforeEach(() => {
    sequencer = new StepSequencer(16, 8);
  });

  test('initializes with correct dimensions', () => {
    expect(sequencer.numSteps).toBe(16);
    expect(sequencer.numTracks).toBe(8);
    expect(sequencer.patterns.length).toBe(8);
    expect(sequencer.patterns[0].length).toBe(16);
  });

  test('setStep sets step state', () => {
    sequencer.setStep(0, 0, true, 0.8);

    const step = sequencer.getStep(0, 0);
    expect(step.active).toBe(true);
    expect(step.velocity).toBe(0.8);
  });

  test('toggleStep toggles step', () => {
    sequencer.toggleStep(0, 0);
    expect(sequencer.getStep(0, 0).active).toBe(true);

    sequencer.toggleStep(0, 0);
    expect(sequencer.getStep(0, 0).active).toBe(false);
  });

  test('setProbability clamps to 0-1', () => {
    sequencer.setProbability(0, 0, -0.5);
    expect(sequencer.getStep(0, 0).probability).toBe(0);

    sequencer.setProbability(0, 0, 1.5);
    expect(sequencer.getStep(0, 0).probability).toBe(1);
  });

  test('nextStep advances and wraps', () => {
    expect(sequencer.currentStep).toBe(0);

    sequencer.nextStep();
    expect(sequencer.currentStep).toBe(1);

    for (let i = 0; i < 15; i++) {
      sequencer.nextStep();
    }
    expect(sequencer.currentStep).toBe(0);
  });

  test('getActiveEvents returns active steps', () => {
    sequencer.setStep(0, 0, true, 1.0);
    sequencer.setStep(1, 0, true, 0.8);
    sequencer.setStep(2, 0, false, 1.0);

    const events = sequencer.getActiveEvents(null);

    expect(events.length).toBe(2);
    expect(events[0].track).toBe(0);
    expect(events[1].track).toBe(1);
  });

  test('getActiveEvents respects probability', () => {
    const determinism = new Determinism(12345);

    sequencer.setStep(0, 0, true, 1.0);
    sequencer.setProbability(0, 0, 0); // Never trigger

    const events = sequencer.getActiveEvents(determinism);

    expect(events.length).toBe(0);
  });

  test('play and stop control isPlaying', () => {
    sequencer.play();
    expect(sequencer.isPlaying).toBe(true);

    sequencer.stop();
    expect(sequencer.isPlaying).toBe(false);
  });

  test('clearTrack clears track', () => {
    sequencer.setStep(0, 0, true);
    sequencer.setStep(0, 1, true);

    sequencer.clearTrack(0);

    expect(sequencer.getStep(0, 0).active).toBe(false);
    expect(sequencer.getStep(0, 1).active).toBe(false);
  });

  test('clearAll clears all tracks', () => {
    sequencer.setStep(0, 0, true);
    sequencer.setStep(1, 0, true);

    sequencer.clearAll();

    expect(sequencer.getStep(0, 0).active).toBe(false);
    expect(sequencer.getStep(1, 0).active).toBe(false);
  });

  test('randomize creates pattern with density', () => {
    const determinism = new Determinism(12345);
    sequencer.randomize(0, 0.5, determinism);

    let activeCount = 0;
    for (let step = 0; step < 16; step++) {
      if (sequencer.getStep(0, step).active) activeCount++;
    }

    expect(activeCount).toBeGreaterThan(2);
    expect(activeCount).toBeLessThan(14);
  });

  test('copyPattern copies pattern', () => {
    sequencer.setStep(0, 0, true, 0.8);
    sequencer.setStep(0, 1, true, 0.6);

    sequencer.copyPattern(0, 1);

    expect(sequencer.getStep(1, 0).active).toBe(true);
    expect(sequencer.getStep(1, 0).velocity).toBe(0.8);
    expect(sequencer.getStep(1, 1).active).toBe(true);
  });

  test('export and import preserve state', () => {
    sequencer.setStep(0, 0, true, 0.8);
    sequencer.setProbability(0, 0, 0.7);

    const exported = sequencer.export();

    const newSequencer = new StepSequencer();
    newSequencer.import(exported);

    expect(newSequencer.getStep(0, 0).active).toBe(true);
    expect(newSequencer.getStep(0, 0).velocity).toBe(0.8);
    expect(newSequencer.getStep(0, 0).probability).toBe(0.7);
  });
});

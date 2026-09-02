// Transport Tests

import { Transport } from '../src/transport.js';

describe('Transport', () => {
  let transport;

  beforeEach(() => {
    transport = new Transport();
  });

  test('initializes with default values', () => {
    expect(transport.isPlaying).toBe(false);
    expect(transport.bpm).toBe(140);
    expect(transport.swing).toBe(0);
    expect(transport.position).toBe(0);
  });

  test('play sets isPlaying', () => {
    transport.play();
    expect(transport.isPlaying).toBe(true);
  });

  test('stop clears isPlaying and resets position', () => {
    transport.play();
    transport.update(1);
    transport.stop();
    
    expect(transport.isPlaying).toBe(false);
    expect(transport.position).toBe(0);
  });

  test('setBPM clamps to valid range', () => {
    transport.setBPM(10);
    expect(transport.bpm).toBe(20);
    
    transport.setBPM(500);
    expect(transport.bpm).toBe(300);
    
    transport.setBPM(140);
    expect(transport.bpm).toBe(140);
  });

  test('setSwing clamps to 0-1', () => {
    transport.setSwing(-0.5);
    expect(transport.swing).toBe(0);
    
    transport.setSwing(1.5);
    expect(transport.swing).toBe(1);
    
    transport.setSwing(0.5);
    expect(transport.swing).toBe(0.5);
  });

  test('beatsToSeconds converts correctly', () => {
    transport.setBPM(120);
    expect(transport.beatsToSeconds(1)).toBe(0.5);
    expect(transport.beatsToSeconds(4)).toBe(2);
  });

  test('secondsToBeats converts correctly', () => {
    transport.setBPM(120);
    expect(transport.secondsToBeats(0.5)).toBe(1);
    expect(transport.secondsToBeats(2)).toBe(4);
  });

  test('getSixteenthDuration calculates correctly', () => {
    transport.setBPM(120);
    expect(transport.getSixteenthDuration()).toBeCloseTo(0.125, 3);
  });

  test('getSwingOffset returns 0 for on-beat', () => {
    expect(transport.getSwingOffset(0)).toBe(0);
    expect(transport.getSwingOffset(2)).toBe(0);
  });

  test('getSwingOffset returns offset for off-beat', () => {
    transport.setSwing(0.5);
    const offset = transport.getSwingOffset(1);
    expect(offset).toBeGreaterThan(0);
  });

  test('update advances position', () => {
    transport.play();
    transport.update(0.5);
    expect(transport.position).toBeGreaterThan(0);
  });

  test('reset clears position', () => {
    transport.play();
    transport.update(1);
    transport.reset();
    expect(transport.position).toBe(0);
  });

  test('event system works', () => {
    let eventFired = false;
    transport.on('play', () => {
      eventFired = true;
    });
    
    transport.play();
    expect(eventFired).toBe(true);
  });
});

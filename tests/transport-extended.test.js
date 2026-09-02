// Transport Extended Tests

import { Transport } from '../src/transport.js';

describe('Transport Extended', () => {
  let transport;

  beforeEach(() => {
    transport = new Transport();
  });

  test('setTimeSignature updates signature', () => {
    transport.setTimeSignature(3, 4);
    expect(transport.timeSignature.numerator).toBe(3);
    expect(transport.timeSignature.denominator).toBe(4);
  });

  test('getPosition returns complete position', () => {
    transport.play();
    transport.update(1);
    
    const pos = transport.getPosition();
    
    expect(pos.beats).toBeDefined();
    expect(pos.bars).toBeDefined();
    expect(pos.beat).toBeDefined();
    expect(pos.sixteenth).toBeDefined();
    expect(pos.seconds).toBeDefined();
  });

  test('beatsToSeconds and secondsToBeats are inverse', () => {
    transport.setBPM(120);
    
    const beats = 4;
    const seconds = transport.beatsToSeconds(beats);
    const backToBeats = transport.secondsToBeats(seconds);
    
    expect(backToBeats).toBeCloseTo(beats, 5);
  });

  test('getSixteenthDuration is correct', () => {
    transport.setBPM(120);
    
    const duration = transport.getSixteenthDuration();
    
    expect(duration).toBeCloseTo(60 / 120 / 4, 5);
  });

  test('getSwingOffset returns 0 for on-beat sixteenths', () => {
    expect(transport.getSwingOffset(0)).toBe(0);
    expect(transport.getSwingOffset(2)).toBe(0);
    expect(transport.getSwingOffset(4)).toBe(0);
    expect(transport.getSwingOffset(6)).toBe(0);
  });

  test('getSwingOffset returns offset for off-beat sixteenths', () => {
    transport.setSwing(0.5);
    
    expect(transport.getSwingOffset(1)).toBeGreaterThan(0);
    expect(transport.getSwingOffset(3)).toBeGreaterThan(0);
    expect(transport.getSwingOffset(5)).toBeGreaterThan(0);
    expect(transport.getSwingOffset(7)).toBeGreaterThan(0);
  });

  test('update advances position correctly', () => {
    transport.setBPM(120);
    transport.play();
    
    transport.update(0.5); // 0.5 seconds at 120 BPM = 1 beat
    
    expect(transport.position).toBeCloseTo(1, 2);
  });

  test('pause stops playback', () => {
    transport.play();
    transport.pause();
    
    expect(transport.isPlaying).toBe(false);
  });

  test('getState and setState preserve state', () => {
    transport.setBPM(160);
    transport.setSwing(0.3);
    transport.play();
    transport.update(1);
    
    const state = transport.getState();
    
    const newTransport = new Transport();
    newTransport.setState(state);
    
    expect(newTransport.bpm).toBe(160);
    expect(newTransport.swing).toBe(0.3);
    expect(newTransport.isPlaying).toBe(true);
  });

  test('event system emits correct events', () => {
    let playFired = false;
    let stopFired = false;
    let bpmFired = false;
    
    transport.on('play', () => { playFired = true; });
    transport.on('stop', () => { stopFired = true; });
    transport.on('bpm-change', () => { bpmFired = true; });
    
    transport.play();
    expect(playFired).toBe(true);
    
    transport.stop();
    expect(stopFired).toBe(true);
    
    transport.setBPM(140);
    expect(bpmFired).toBe(true);
  });
});

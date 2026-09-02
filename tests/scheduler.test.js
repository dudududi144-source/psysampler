// Scheduler Tests

import { Scheduler } from '../src/scheduler.js';
import { Transport } from '../src/transport.js';

describe('Scheduler', () => {
  let transport;
  let scheduler;

  beforeEach(() => {
    transport = new Transport();
    scheduler = new Scheduler(transport, 25, 0.1);
  });

  test('initializes with correct defaults', () => {
    expect(scheduler.lookahead).toBe(25);
    expect(scheduler.scheduleAheadTime).toBe(0.1);
    expect(scheduler.isRunning).toBe(false);
    expect(scheduler.eventQueue).toEqual([]);
  });

  test('start sets isRunning', () => {
    scheduler.start();
    expect(scheduler.isRunning).toBe(true);
  });

  test('stop clears isRunning', () => {
    scheduler.start();
    scheduler.stop();
    expect(scheduler.isRunning).toBe(false);
  });

  test('scheduleNote adds event to queue', () => {
    scheduler.scheduleNote(0, 1.0);
    expect(scheduler.eventQueue.length).toBe(1);
    expect(scheduler.eventQueue[0].sixteenth).toBe(0);
    expect(scheduler.eventQueue[0].time).toBe(1.0);
  });

  test('getEventsToTrigger returns due events', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.scheduleNote(1, 2.0);
    
    const events = scheduler.getEventsToTrigger(1.5);
    expect(events.length).toBe(1);
    expect(events[0].sixteenth).toBe(0);
    
    expect(scheduler.eventQueue.length).toBe(1);
  });

  test('getEventsToTrigger removes triggered events', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.getEventsToTrigger(2.0);
    
    expect(scheduler.eventQueue.length).toBe(0);
  });

  test('quantizeToSixteenth quantizes correctly', () => {
    transport.setBPM(120);
    
    const sixteenthDuration = transport.getSixteenthDuration();
    const time = sixteenthDuration * 2.7;
    const quantized = scheduler.quantizeToSixteenth(time);
    
    expect(quantized).toBe(sixteenthDuration * 3);
  });

  test('reset clears state', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.currentSixteenth = 5;
    scheduler.reset();
    
    expect(scheduler.currentSixteenth).toBe(0);
    expect(scheduler.eventQueue.length).toBe(0);
  });

  test('nextNote advances sixteenth', () => {
    scheduler.currentSixteenth = 0;
    scheduler.nextNote();
    expect(scheduler.currentSixteenth).toBe(1);
  });

  test('nextNote wraps around at 16', () => {
    scheduler.currentSixteenth = 15;
    scheduler.nextNote();
    expect(scheduler.currentSixteenth).toBe(0);
  });

  test('getState and setState preserve state', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.currentSixteenth = 5;
    
    const state = scheduler.getState();
    
    scheduler.reset();
    scheduler.setState(state);
    
    expect(scheduler.currentSixteenth).toBe(5);
    expect(scheduler.eventQueue.length).toBe(1);
  });
});

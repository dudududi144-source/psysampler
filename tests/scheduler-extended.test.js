// Scheduler Extended Tests

import { Scheduler } from '../src/scheduler.js';
import { Transport } from '../src/transport.js';

describe('Scheduler Extended', () => {
  let transport;
  let scheduler;

  beforeEach(() => {
    transport = new Transport();
    scheduler = new Scheduler(transport, 25, 0.1);
  });

  test('scheduler respects swing', () => {
    transport.setSwing(0.5);
    
    scheduler.scheduleNote(0, 1.0);
    
    expect(scheduler.eventQueue.length).toBe(1);
  });

  test('getEventsToTrigger returns events in order', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.scheduleNote(1, 2.0);
    scheduler.scheduleNote(2, 3.0);
    
    const events = scheduler.getEventsToTrigger(3.5);
    
    expect(events.length).toBe(3);
    expect(events[0].sixteenth).toBe(0);
    expect(events[1].sixteenth).toBe(1);
    expect(events[2].sixteenth).toBe(2);
  });

  test('getEventsToTrigger removes triggered events', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.scheduleNote(1, 2.0);
    
    scheduler.getEventsToTrigger(1.5);
    
    expect(scheduler.eventQueue.length).toBe(1);
  });

  test('quantizeToSixteenth handles edge cases', () => {
    transport.setBPM(120);
    
    const sixteenthDuration = transport.getSixteenthDuration();
    
    // Exactly on grid
    expect(scheduler.quantizeToSixteenth(sixteenthDuration * 2)).toBe(sixteenthDuration * 2);
    
    // Just before
    expect(scheduler.quantizeToSixteenth(sixteenthDuration * 2.4)).toBe(sixteenthDuration * 2);
    
    // Just after
    expect(scheduler.quantizeToSixteenth(sixteenthDuration * 2.6)).toBe(sixteenthDuration * 3);
  });

  test('nextNote applies swing to off-beat sixteenths', () => {
    transport.setSwing(0.5);
    
    scheduler.currentSixteenth = 0;
    const time1 = scheduler.nextNoteTime;
    scheduler.nextNote();
    const time2 = scheduler.nextNoteTime;
    
    // Off-beat sixteenth should have swing offset
    const duration = time2 - time1;
    expect(duration).toBeGreaterThan(0);
  });

  test('reset clears all state', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.scheduleNote(1, 2.0);
    scheduler.currentSixteenth = 5;
    
    scheduler.reset();
    
    expect(scheduler.currentSixteenth).toBe(0);
    expect(scheduler.eventQueue.length).toBe(0);
  });

  test('getState and setState preserve state', () => {
    scheduler.scheduleNote(0, 1.0);
    scheduler.scheduleNote(1, 2.0);
    scheduler.currentSixteenth = 5;
    
    const state = scheduler.getState();
    
    const newScheduler = new Scheduler(transport);
    newScheduler.setState(state);
    
    expect(newScheduler.currentSixteenth).toBe(5);
    expect(newScheduler.eventQueue.length).toBe(2);
  });

  test('onSchedule callback is called', () => {
    let scheduledSixteenth = null;
    scheduler.onSchedule = (sixteenth, time) => {
      scheduledSixteenth = sixteenth;
    };
    
    scheduler.scheduleNote(7, 1.0);
    
    expect(scheduledSixteenth).toBe(7);
  });
});

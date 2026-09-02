// Determinism Extended Tests

import { Determinism } from '../src/determinism.js';

describe('Determinism Extended', () => {
  test('nextBool with probability 0 always returns false', () => {
    const det = new Determinism(12345);
    
    for (let i = 0; i < 100; i++) {
      expect(det.nextBool(0)).toBe(false);
    }
  });

  test('nextBool with probability 1 always returns true', () => {
    const det = new Determinism(12345);
    
    for (let i = 0; i < 100; i++) {
      expect(det.nextBool(1)).toBe(true);
    }
  });

  test('pick from single element array', () => {
    const det = new Determinism(12345);
    
    for (let i = 0; i < 10; i++) {
      expect(det.pick([42])).toBe(42);
    }
  });

  test('shuffle preserves all elements', () => {
    const det = new Determinism(12345);
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const shuffled = det.shuffle(array);
    
    expect(shuffled.length).toBe(array.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(array);
  });

  test('shuffle is deterministic', () => {
    const det1 = new Determinism(12345);
    const det2 = new Determinism(12345);
    
    const array = [1, 2, 3, 4, 5];
    
    const shuffled1 = det1.shuffle(array);
    const shuffled2 = det2.shuffle(array);
    
    expect(shuffled1).toEqual(shuffled2);
  });

  test('seededProbability is consistent', () => {
    const det = new Determinism(12345);
    
    const p1 = det.seededProbability(123, 1, 0);
    const p2 = det.seededProbability(123, 1, 0);
    const p3 = det.seededProbability(123, 1, 0);
    
    expect(p1).toBe(p2);
    expect(p2).toBe(p3);
  });

  test('seededRandomize is consistent', () => {
    const det = new Determinism(12345);
    
    const r1 = det.seededRandomize(456);
    const r2 = det.seededRandomize(456);
    
    expect(r1).toBe(r2);
  });

  test('different seeds produce different results', () => {
    const det1 = new Determinism(12345);
    const det2 = new Determinism(54321);
    
    const p1 = det1.seededProbability(123, 1, 0);
    const p2 = det2.seededProbability(123, 1, 0);
    
    expect(p1).not.toBe(p2);
  });

  test('clone creates independent copy', () => {
    const det = new Determinism(12345);
    det.next();
    
    const clone = det.clone();
    
    const value1 = det.next();
    const value2 = clone.next();
    
    expect(value1).toBe(value2);
  });

  test('getState and setState preserve exact state', () => {
    const det = new Determinism(12345);
    det.next();
    det.next();
    
    const state = det.getState();
    const value1 = det.next();
    
    det.setState(state);
    const value2 = det.next();
    
    expect(value1).toBe(value2);
  });
});

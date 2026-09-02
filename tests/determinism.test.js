// Determinism Tests

import { Determinism } from '../src/determinism.js';

describe('Determinism', () => {
  let det;

  beforeEach(() => {
    det = new Determinism(12345);
  });

  test('generates same sequence with same seed', () => {
    const det1 = new Determinism(12345);
    const det2 = new Determinism(12345);

    for (let i = 0; i < 100; i++) {
      expect(det1.next()).toBe(det2.next());
    }
  });

  test('nextInt returns value in range', () => {
    for (let i = 0; i < 1000; i++) {
      const value = det.nextInt(10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
    }
  });

  test('nextFloat returns value in range', () => {
    for (let i = 0; i < 1000; i++) {
      const value = det.nextFloat(0.5, 1.5);
      expect(value).toBeGreaterThanOrEqual(0.5);
      expect(value).toBeLessThan(1.5);
    }
  });

  test('reset returns to initial state', () => {
    const initial = det.next();
    det.next();
    det.next();
    det.reset();
    const afterReset = det.next();

    expect(afterReset).toBe(initial);
  });
});

// CO-PILOT Tests

import { CoPilot } from '../src/co-pilot.js';

describe('CoPilot', () => {
  let copilot;

  beforeEach(() => {
    copilot = new CoPilot();
  });

  test('initializes with 8 actions', () => {
    expect(copilot.actions.length).toBe(8);
  });

  test('has all required actions', () => {
    expect(copilot.actions).toContain('suggest-melodic-loop');
    expect(copilot.actions).toContain('suggest-rhythmic-loop');
    expect(copilot.actions).toContain('auto-slice');
    expect(copilot.actions).toContain('auto-classify');
  });

  test('getContext extracts features', () => {
    const deviceState = {
      currentBank: 0,
      hasLoop: true,
      loopType: 'melodic',
      bpm: 140,
      energy: 0.7
    };

    const context = copilot.getContext(deviceState);

    expect(context.hasLoop).toBe(true);
    expect(context.loopType).toBe('melodic');
    expect(context.bpm).toBe(140);
  });

  test('selectAction returns valid action', () => {
    const context = {
      hasLoop: true,
      loopType: 'melodic',
      energy: 0.5
    };

    const action = copilot.selectAction(context);
    expect(copilot.actions).toContain(action);
  });

  test('update stores Q-value', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    const nextContext = { hasLoop: true, loopType: 'melodic', energy: 0.6 };

    copilot.update(context, 'suggest-melodic-loop', 1.0, nextContext);

    const contextKey = copilot.contextToKey(context);
    const key = `${contextKey}:suggest-melodic-loop`;

    expect(copilot.qTable.has(key)).toBe(true);
  });

  test('reset clears model', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    copilot.update(context, 'suggest-melodic-loop', 1.0, context);

    copilot.reset();

    expect(copilot.qTable.size).toBe(0);
    expect(copilot.history.length).toBe(0);
  });
});

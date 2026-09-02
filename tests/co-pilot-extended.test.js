// CO-PILOT Extended Tests

import { CoPilot } from '../src/co-pilot.js';

describe('CoPilot Extended', () => {
  let copilot;

  beforeEach(() => {
    copilot = new CoPilot();
  });

  test('selectAction explores with epsilon probability', () => {
    const context = {
      hasLoop: true,
      loopType: 'melodic',
      energy: 0.5
    };
    
    // Run many times to check exploration
    const actions = new Set();
    for (let i = 0; i < 100; i++) {
      actions.add(copilot.selectAction(context));
    }
    
    // Should have selected multiple different actions due to exploration
    expect(actions.size).toBeGreaterThan(1);
  });

  test('getBestAction returns highest Q-value', () => {
    const context = {
      hasLoop: true,
      loopType: 'melodic',
      energy: 0.5
    };
    
    const contextKey = copilot.contextToKey(context);
    
    copilot.qTable.set(contextKey + ':suggest-melodic-loop', 0.3);
    copilot.qTable.set(contextKey + ':suggest-rhythmic-loop', 0.9);
    copilot.qTable.set(contextKey + ':auto-slice', 0.5);
    
    const bestAction = copilot.getBestAction(context);
    expect(bestAction).toBe('suggest-rhythmic-loop');
  });

  test('update applies Q-learning formula', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    const nextContext = { hasLoop: true, loopType: 'melodic', energy: 0.6 };
    
    const contextKey = copilot.contextToKey(context);
    const key = contextKey + ':suggest-melodic-loop';
    
    copilot.update(context, 'suggest-melodic-loop', 1.0, nextContext);
    
    const qValue = copilot.qTable.get(key);
    expect(qValue).toBeGreaterThan(0);
    expect(qValue).toBeLessThanOrEqual(1.0);
  });

  test('update with negative reward decreases Q-value', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    const nextContext = { hasLoop: true, loopType: 'melodic', energy: 0.6 };
    
    const contextKey = copilot.contextToKey(context);
    const key = contextKey + ':suggest-melodic-loop';
    
    // First update with positive reward
    copilot.update(context, 'suggest-melodic-loop', 1.0, nextContext);
    const qValue1 = copilot.qTable.get(key);
    
    // Then update with negative reward
    copilot.update(context, 'suggest-melodic-loop', -1.0, nextContext);
    const qValue2 = copilot.qTable.get(key);
    
    expect(qValue2).toBeLessThan(qValue1);
  });

  test('getSuggestions returns sorted by confidence', () => {
    const context = { hasLoop: true, loopType: 'melodic', energy: 0.5 };
    const contextKey = copilot.contextToKey(context);
    
    copilot.qTable.set(contextKey + ':suggest-melodic-loop', 0.8);
    copilot.qTable.set(contextKey + ':suggest-rhythmic-loop', 0.6);
    copilot.qTable.set(contextKey + ':auto-slice', 0.9);
    
    const suggestions = copilot.getSuggestions(context);
    
    expect(suggestions.length).toBe(3);
    expect(suggestions[0].confidence).toBeGreaterThanOrEqual(suggestions[1].confidence);
    expect(suggestions[1].confidence).toBeGreaterThanOrEqual(suggestions[2].confidence);
  });

  test('exportModel and importModel preserve Q-table', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    const nextContext = { hasLoop: true, loopType: 'melodic', energy: 0.6 };
    
    copilot.update(context, 'suggest-melodic-loop', 1.0, nextContext);
    copilot.update(context, 'suggest-rhythmic-loop', 0.5, nextContext);
    
    const model = copilot.exportModel();
    
    const newCopilot = new CoPilot();
    newCopilot.importModel(model);
    
    expect(newCopilot.qTable.size).toBe(copilot.qTable.size);
  });

  test('reset clears Q-table and history', () => {
    const context = { hasLoop: false, loopType: null, energy: 0.5 };
    copilot.update(context, 'suggest-melodic-loop', 1.0, context);
    
    copilot.reset();
    
    expect(copilot.qTable.size).toBe(0);
    expect(copilot.history.length).toBe(0);
  });

  test('contextToKey creates consistent keys', () => {
    const context1 = { hasLoop: true, loopType: 'melodic', energy: 0.5 };
    const context2 = { hasLoop: true, loopType: 'melodic', energy: 0.5 };
    
    expect(copilot.contextToKey(context1)).toBe(copilot.contextToKey(context2));
  });
});

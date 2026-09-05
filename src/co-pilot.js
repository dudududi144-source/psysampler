// CO-PILOT - Contextual bandit integration from psy-foundation

export class CoPilot {
  constructor() {
    this.actions = [
      'suggest-melodic-loop',
      'suggest-rhythmic-loop',
      'suggest-bass-loop',
      'suggest-fx-loop',
      'auto-slice',
      'auto-classify',
      'suggest-variation',
      'suggest-transition',
    ];

    this.contextFeatures = [];
    this.qTable = new Map();
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.epsilon = 0.1; // Exploration rate
    this.history = [];
  }

  // Get context from current state
  getContext(deviceState) {
    return {
      currentBank: deviceState.currentBank,
      hasLoop: deviceState.hasLoop,
      loopType: deviceState.loopType,
      bpm: deviceState.bpm,
      energy: deviceState.energy || 0.5,
      timeInSession: deviceState.timeInSession || 0,
    };
  }

  // Select action using epsilon-greedy
  selectAction(context) {
    if (Math.random() < this.epsilon) {
      // Explore: random action
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }

    // Exploit: best known action
    return this.getBestAction(context);
  }

  getBestAction(context) {
    const contextKey = this.contextToKey(context);
    let bestAction = this.actions[0];
    let bestValue = Number.NEGATIVE_INFINITY;

    for (const action of this.actions) {
      const key = `${contextKey}:${action}`;
      const value = this.qTable.get(key) || 0;

      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }

    return bestAction;
  }

  // Update Q-value after action
  update(context, action, reward, nextContext) {
    const contextKey = this.contextToKey(context);
    const nextContextKey = this.contextToKey(nextContext);
    const key = `${contextKey}:${action}`;

    const currentValue = this.qTable.get(key) || 0;
    const nextBestValue = this.getNextBestValue(nextContextKey);

    const newValue =
      currentValue +
      this.learningRate * (reward + this.discountFactor * nextBestValue - currentValue);

    this.qTable.set(key, newValue);

    // Store history
    this.history.push({
      context,
      action,
      reward,
      nextContext,
      timestamp: Date.now(),
    });
  }

  getNextBestValue(contextKey) {
    let bestValue = 0;

    for (const action of this.actions) {
      const key = `${contextKey}:${action}`;
      const value = this.qTable.get(key) || 0;
      bestValue = Math.max(bestValue, value);
    }

    return bestValue;
  }

  contextToKey(context) {
    return JSON.stringify({
      hasLoop: context.hasLoop,
      loopType: context.loopType,
      energy: Math.round(context.energy * 10) / 10,
    });
  }

  // Get suggestions based on context
  getSuggestions(context) {
    const suggestions = [];

    for (const action of this.actions) {
      const contextKey = this.contextToKey(context);
      const key = `${contextKey}:${action}`;
      const value = this.qTable.get(key) || 0;

      if (value > 0.5) {
        suggestions.push({
          action,
          confidence: value,
          description: this.getActionDescription(action),
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  getActionDescription(action) {
    const descriptions = {
      'suggest-melodic-loop': 'Generate a melodic loop',
      'suggest-rhythmic-loop': 'Generate a rhythmic loop',
      'suggest-bass-loop': 'Generate a bass loop',
      'suggest-fx-loop': 'Generate an FX loop',
      'auto-slice': 'Automatically slice the audio',
      'auto-classify': 'Classify the loop type',
      'suggest-variation': 'Create a variation',
      'suggest-transition': 'Suggest a transition',
    };

    return descriptions[action] || action;
  }

  // Export learned model
  exportModel() {
    return {
      qTable: Object.fromEntries(this.qTable),
      history: this.history.slice(-100), // Last 100 entries
    };
  }

  // Import learned model
  importModel(model) {
    this.qTable = new Map(Object.entries(model.qTable || {}));
    this.history = model.history || [];
  }

  // Reset learning
  reset() {
    this.qTable.clear();
    this.history = [];
  }
}

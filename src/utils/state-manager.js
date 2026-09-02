// State Manager
// Centralized state management for PSY LOOPER

export class StateManager {
  constructor() {
    this.state = {};
    this.subscribers = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.isUndoing = false;
  }

  getState(path = null) {
    if (!path) return { ...this.state };
    
    const keys = path.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }

  setState(path, value, options = {}) {
    const { record = true, notify = true } = options;
    
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    let current = this.state;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    if (record && !this.isUndoing) {
      this.history.push({
        path,
        oldValue,
        newValue: value,
        timestamp: Date.now()
      });
      
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    
    if (notify) {
      this.notifySubscribers(path, value, oldValue);
    }
  }

  updateState(path, updater, options = {}) {
    const currentValue = this.getState(path);
    const newValue = typeof updater === 'function' ? updater(currentValue) : updater;
    this.setState(path, newValue, options);
  }

  deleteState(path, options = {}) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    let current = this.state;
    for (const key of keys) {
      if (!(key in current)) return;
      current = current[key];
    }
    
    const oldValue = current[lastKey];
    delete current[lastKey];
    
    const { record = true, notify = true } = options;
    if (record && !this.isUndoing) {
      this.history.push({
        path,
        oldValue,
        newValue: undefined,
        deleted: true,
        timestamp: Date.now()
      });
    }
    
    if (notify) {
      this.notifySubscribers(path, undefined, oldValue);
    }
  }

  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path).add(callback);
    
    return () => {
      const subs = this.subscribers.get(path);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(path);
        }
      }
    };
  }

  notifySubscribers(path, newValue, oldValue) {
    // Exact match
    if (this.subscribers.has(path)) {
      this.subscribers.get(path).forEach(cb => cb(newValue, oldValue, path));
    }
    
    // Wildcard subscribers
    const pathParts = path.split('.');
    for (let i = 0; i < pathParts.length; i++) {
      const wildcardPath = pathParts.slice(0, i + 1).join('.') + '.*';
      if (this.subscribers.has(wildcardPath)) {
        this.subscribers.get(wildcardPath).forEach(cb => cb(newValue, oldValue, path));
      }
    }
    
    // Global subscribers
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => cb(newValue, oldValue, path));
    }
  }

  undo() {
    if (this.history.length === 0) return false;
    
    this.isUndoing = true;
    const lastChange = this.history.pop();
    
    if (lastChange.deleted) {
      this.setState(lastChange.path, lastChange.oldValue, { record: false });
    } else {
      this.setState(lastChange.path, lastChange.oldValue, { record: false });
    }
    
    this.isUndoing = false;
    return true;
  }

  canUndo() {
    return this.history.length > 0;
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }

  reset() {
    this.state = {};
    this.history = [];
    this.subscribers.clear();
  }

  export() {
    return {
      state: { ...this.state },
      history: [...this.history]
    };
  }

  import(data) {
    this.state = data.state || {};
    this.history = data.history || [];
  }
}

// Global state manager instance
export const globalState = new StateManager();

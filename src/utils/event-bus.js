// Event Bus
// Centralized event system for PSY LOOPER

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      const callbacks = Array.from(this.listeners.get(event));
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).size : 0;
  }

  events() {
    return Array.from(this.listeners.keys());
  }
}

// Global event bus instance
export const globalBus = new EventBus();

// Event types
export const EVENTS = {
  // Loop events
  LOOP_LOADED: 'loop:loaded',
  LOOP_GENERATED: 'loop:generated',
  LOOP_PLAYING: 'loop:playing',
  LOOP_STOPPED: 'loop:stopped',
  
  // Slice events
  SLICE_TRIGGERED: 'slice:triggered',
  SLICE_ADDED: 'slice:added',
  SLICE_REMOVED: 'slice:removed',
  SLICE_UPDATED: 'slice:updated',
  
  // Bank events
  BANK_SELECTED: 'bank:selected',
  BANK_CLEARED: 'bank:cleared',
  BANK_LOADED: 'bank:loaded',
  
  // FX events
  FX_ADDED: 'fx:added',
  FX_REMOVED: 'fx:removed',
  FX_UPDATED: 'fx:updated',
  
  // MIDI events
  MIDI_CONNECTED: 'midi:connected',
  MIDI_DISCONNECTED: 'midi:disconnected',
  MIDI_NOTE_ON: 'midi:note-on',
  MIDI_NOTE_OFF: 'midi:note-off',
  MIDI_CC: 'midi:cc',
  
  // Transport events
  TRANSPORT_PLAY: 'transport:play',
  TRANSPORT_STOP: 'transport:stop',
  TRANSPORT_RECORD: 'transport:record',
  
  // Analysis events
  ANALYSIS_STARTED: 'analysis:started',
  ANALYSIS_COMPLETE: 'analysis:complete',
  ANALYSIS_FAILED: 'analysis:failed',
  
  // Export events
  EXPORT_STARTED: 'export:started',
  EXPORT_COMPLETE: 'export:complete',
  EXPORT_FAILED: 'export:failed',
  
  // UI events
  UI_READY: 'ui:ready',
  UI_ERROR: 'ui:error'
};

// Keyboard Shortcuts - 21 shortcuts

export const KEYBOARD_SHORTCUTS = {
  // Transport
  SPACE: { key: ' ', action: 'play-stop', description: 'Play/Stop' },
  T: { key: 't', action: 'tap-tempo', description: 'Tap Tempo' },
  N: { key: 'n', action: 'metronome', description: 'Toggle Metronome' },
  
  // Slices (1-9)
  SLICE_1: { key: '1', action: 'trigger-slice-1', description: 'Trigger Slice 1' },
  SLICE_2: { key: '2', action: 'trigger-slice-2', description: 'Trigger Slice 2' },
  SLICE_3: { key: '3', action: 'trigger-slice-3', description: 'Trigger Slice 3' },
  SLICE_4: { key: '4', action: 'trigger-slice-4', description: 'Trigger Slice 4' },
  SLICE_5: { key: '5', action: 'trigger-slice-5', description: 'Trigger Slice 5' },
  SLICE_6: { key: '6', action: 'trigger-slice-6', description: 'Trigger Slice 6' },
  SLICE_7: { key: '7', action: 'trigger-slice-7', description: 'Trigger Slice 7' },
  SLICE_8: { key: '8', action: 'trigger-slice-8', description: 'Trigger Slice 8' },
  SLICE_9: { key: '9', action: 'trigger-slice-9', description: 'Trigger Slice 9' },
  
  // Banks (F1-F8)
  BANK_1: { key: 'F1', action: 'select-bank-1', description: 'Select Bank 1' },
  BANK_2: { key: 'F2', action: 'select-bank-2', description: 'Select Bank 2' },
  BANK_3: { key: 'F3', action: 'select-bank-3', description: 'Select Bank 3' },
  BANK_4: { key: 'F4', action: 'select-bank-4', description: 'Select Bank 4' },
  
  // Pattern editing
  X: { key: 'x', action: 'randomize', description: 'Randomize (seeded)' },
  C: { key: 'c', action: 'clear', description: 'Clear Pattern' },
  D: { key: 'd', action: 'chord-progression', description: 'Generate Chord Progression' },
  
  // Pattern variations
  A: { key: 'a', action: 'cycle-arpeggio', description: 'Cycle Arpeggio Pattern' },
  B: { key: 'b', action: 'cycle-bass', description: 'Cycle Bass Pattern' },
  
  // Utility
  H: { key: 'h', action: 'help', description: 'Show Help' },
  ESC: { key: 'Escape', action: 'panic', description: 'Panic (stop all voices)' }
};

export class KeyboardManager {
  constructor(device) {
    this.device = device;
    this.enabled = true;
    this.handlers = new Map();
    
    // Register default handlers
    this.registerDefaultHandlers();
  }

  registerDefaultHandlers() {
    this.on('play-stop', () => {
      if (this.device.isPlaying) {
        this.device.stop();
      } else {
        this.device.play();
      }
    });

    this.on('trigger-slice-1', () => this.device.triggerSlice(this.device.currentBank, 0, 1.0));
    this.on('trigger-slice-2', () => this.device.triggerSlice(this.device.currentBank, 1, 1.0));
    this.on('trigger-slice-3', () => this.device.triggerSlice(this.device.currentBank, 2, 1.0));
    this.on('trigger-slice-4', () => this.device.triggerSlice(this.device.currentBank, 3, 1.0));
    this.on('trigger-slice-5', () => this.device.triggerSlice(this.device.currentBank, 4, 1.0));
    this.on('trigger-slice-6', () => this.device.triggerSlice(this.device.currentBank, 5, 1.0));
    this.on('trigger-slice-7', () => this.device.triggerSlice(this.device.currentBank, 6, 1.0));
    this.on('trigger-slice-8', () => this.device.triggerSlice(this.device.currentBank, 7, 1.0));
    this.on('trigger-slice-9', () => this.device.triggerSlice(this.device.currentBank, 8, 1.0));

    this.on('select-bank-1', () => this.device.setBank(0));
    this.on('select-bank-2', () => this.device.setBank(1));
    this.on('select-bank-3', () => this.device.setBank(2));
    this.on('select-bank-4', () => this.device.setBank(3));

    this.on('panic', () => {
      this.device.stop();
    });

    this.on('help', () => {
      this.showHelp();
    });
  }

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    if (!this.enabled) return;
    
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const key = e.key;
    
    // Find matching shortcut
    for (const [name, shortcut] of Object.entries(KEYBOARD_SHORTCUTS)) {
      if (shortcut.key === key) {
        e.preventDefault();
        this.trigger(shortcut.action);
        return;
      }
    }
    
    // Handle F keys
    if (key.startsWith('F') && key.length <= 3) {
      const fn = parseInt(key.substring(1));
      if (fn >= 1 && fn <= 8) {
        e.preventDefault();
        this.trigger(`select-bank-${fn}`);
      }
    }
  }

  trigger(action) {
    if (this.handlers.has(action)) {
      this.handlers.get(action).forEach(handler => handler());
    }
  }

  on(action, handler) {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action).push(handler);
  }

  off(action, handler) {
    if (this.handlers.has(action)) {
      const handlers = this.handlers.get(action);
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  showHelp() {
    const help = Object.entries(KEYBOARD_SHORTCUTS)
      .map(([name, s]) => `${s.key.padEnd(8)} - ${s.description}`)
      .join('\n');
    
    console.log('=== PSY LOOPER Keyboard Shortcuts ===\n' + help);
    
    // Could show a modal here
    alert('Keyboard Shortcuts:\n\n' + help);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeydown);
    this.handlers.clear();
  }
}

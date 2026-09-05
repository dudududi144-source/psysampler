// Keyboard Extended Tests

import { KEYBOARD_SHORTCUTS, KeyboardManager } from '../src/keyboard.js';

// Mock device
const mockDevice = {
  triggerSlice: () => {},
  setBank: () => {},
  play: () => {},
  stop: () => {},
  isPlaying: false,
};

describe('KeyboardManager Extended', () => {
  let manager;

  beforeEach(() => {
    manager = new KeyboardManager(mockDevice);
  });

  test('has at least 21 shortcuts', () => {
    expect(Object.keys(KEYBOARD_SHORTCUTS).length).toBeGreaterThanOrEqual(21);
  });

  test('each shortcut has unique key', () => {
    const keys = Object.values(KEYBOARD_SHORTCUTS).map((s) => s.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  test('each shortcut has unique action', () => {
    const actions = Object.values(KEYBOARD_SHORTCUTS).map((s) => s.action);
    const uniqueActions = new Set(actions);
    expect(uniqueActions.size).toBe(actions.length);
  });

  test('all shortcuts have descriptions', () => {
    Object.values(KEYBOARD_SHORTCUTS).forEach((shortcut) => {
      expect(shortcut.description).toBeDefined();
      expect(shortcut.description.length).toBeGreaterThan(0);
    });
  });

  test('trigger calls registered handlers', () => {
    let called = false;
    manager.on('test-action', () => {
      called = true;
    });

    manager.trigger('test-action');
    expect(called).toBe(true);
  });

  test('multiple handlers for same action', () => {
    let count = 0;
    manager.on('test-action', () => {
      count++;
    });
    manager.on('test-action', () => {
      count++;
    });

    manager.trigger('test-action');
    expect(count).toBe(2);
  });

  test('off removes specific handler', () => {
    let count = 0;
    const handler1 = () => {
      count++;
    };
    const handler2 = () => {
      count += 10;
    };

    manager.on('test-action', handler1);
    manager.on('test-action', handler2);
    manager.off('test-action', handler1);

    manager.trigger('test-action');
    expect(count).toBe(10);
  });

  test('enable and disable work', () => {
    manager.disable();
    expect(manager.enabled).toBe(false);

    manager.enable();
    expect(manager.enabled).toBe(true);
  });

  test('dispose clears all handlers', () => {
    manager.on('test-action', () => {});
    manager.dispose();

    expect(manager.handlers.size).toBe(0);
  });

  test('showHelp does not throw', () => {
    // Mock alert
    global.alert = () => {};

    expect(() => manager.showHelp()).not.toThrow();
  });
});

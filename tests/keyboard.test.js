// Keyboard Tests

import { KEYBOARD_SHORTCUTS, KeyboardManager } from '../src/keyboard.js';

// Mock device
const mockDevice = {
  triggerSlice: jest.fn(),
  setBank: jest.fn(),
  play: jest.fn(),
  stop: jest.fn(),
  isPlaying: false,
};

describe('KeyboardManager', () => {
  let manager;

  beforeEach(() => {
    manager = new KeyboardManager(mockDevice);
    jest.clearAllMocks();
  });

  test('has 21 shortcuts defined', () => {
    expect(Object.keys(KEYBOARD_SHORTCUTS).length).toBeGreaterThanOrEqual(21);
  });

  test('each shortcut has required fields', () => {
    Object.values(KEYBOARD_SHORTCUTS).forEach((shortcut) => {
      expect(shortcut.key).toBeDefined();
      expect(shortcut.action).toBeDefined();
      expect(shortcut.description).toBeDefined();
    });
  });

  test('registerDefaultHandlers registers handlers', () => {
    expect(manager.handlers.size).toBeGreaterThan(0);
  });

  test('play-stop handler toggles playback', () => {
    mockDevice.isPlaying = false;
    manager.trigger('play-stop');
    expect(mockDevice.play).toHaveBeenCalled();

    jest.clearAllMocks();
    mockDevice.isPlaying = true;
    manager.trigger('play-stop');
    expect(mockDevice.stop).toHaveBeenCalled();
  });

  test('trigger-slice handlers call device', () => {
    manager.trigger('trigger-slice-1');
    expect(mockDevice.triggerSlice).toHaveBeenCalled();
  });

  test('select-bank handlers call device', () => {
    manager.trigger('select-bank-1');
    expect(mockDevice.setBank).toHaveBeenCalledWith(0);

    manager.trigger('select-bank-2');
    expect(mockDevice.setBank).toHaveBeenCalledWith(1);
  });

  test('panic handler stops device', () => {
    manager.trigger('panic');
    expect(mockDevice.stop).toHaveBeenCalled();
  });

  test('on and off manage handlers', () => {
    let called = false;
    const handler = () => {
      called = true;
    };

    manager.on('test-action', handler);
    manager.trigger('test-action');
    expect(called).toBe(true);

    called = false;
    manager.off('test-action', handler);
    manager.trigger('test-action');
    expect(called).toBe(false);
  });

  test('enable and disable control processing', () => {
    manager.disable();
    expect(manager.enabled).toBe(false);

    manager.enable();
    expect(manager.enabled).toBe(true);
  });

  test('dispose clears handlers', () => {
    manager.dispose();
    expect(manager.handlers.size).toBe(0);
  });
});

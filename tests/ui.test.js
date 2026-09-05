// UI Manager Tests

import { UIManager } from '../src/ui.js';

// Mock device
const mockDevice = {
  triggerSlice: jest.fn(),
  setBank: jest.fn(),
  currentBank: 0,
  getBankInfo: () => ({
    hasLoop: true,
    numSlices: 16,
    duration: 4.0,
    analysis: {
      tempo: 140,
      key: { key: 'C', scale: 'minor' },
      type: 'melodic',
    },
  }),
};

describe('UIManager', () => {
  let ui;

  beforeEach(() => {
    ui = new UIManager(mockDevice);

    // Mock DOM
    global.document = {
      getElementById: jest.fn().mockReturnValue(null),
      querySelectorAll: jest.fn().mockReturnValue([]),
      createElement: jest.fn().mockReturnValue({
        getContext: () => ({
          clearRect: jest.fn(),
          fillRect: jest.fn(),
          fillStyle: '',
        }),
        width: 800,
        height: 100,
        className: '',
        dataset: {},
        addEventListener: jest.fn(),
        appendChild: jest.fn(),
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
    };
  });

  test('initializes with device', () => {
    expect(ui.device).toBe(mockDevice);
  });

  test('highlightSlice adds playing class', () => {
    const mockSlice = {
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    };

    global.document.querySelectorAll = jest.fn().mockReturnValue([mockSlice]);

    ui.highlightSlice(0);

    expect(mockSlice.classList.add).toHaveBeenCalledWith('playing');
  });

  test('dispose clears elements', () => {
    ui.elements.set('test', {});
    ui.dispose();

    expect(ui.elements.size).toBe(0);
  });
});

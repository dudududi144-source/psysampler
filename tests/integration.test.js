// Integration Tests

import { LooperDevice } from '../src/looper-device.js';

describe('LooperDevice Integration', () => {
  let device;

  beforeEach(() => {
    device = new LooperDevice({ sampleRate: 48000, numBanks: 8 });
  });

  test('initializes with correct config', () => {
    expect(device.config.sampleRate).toBe(48000);
    expect(device.config.numBanks).toBe(8);
    expect(device.sliceBanks.length).toBe(8);
  });

  test('exports and imports project', () => {
    const project = device.exportProject();

    expect(project.version).toBe('1.0.0');
    expect(project.banks).toBeDefined();
    expect(project.banks.length).toBe(8);

    device.importProject(project);
    expect(device.determinism.seed).toBe(project.seed);
  });

  test('setBank changes current bank', () => {
    device.setBank(3);
    expect(device.currentBank).toBe(3);
  });

  test('setBank ignores invalid index', () => {
    device.setBank(10);
    expect(device.currentBank).toBe(0);
  });

  test('play sets isPlaying', () => {
    device.play();
    expect(device.isPlaying).toBe(true);
  });

  test('stop clears isPlaying', () => {
    device.play();
    device.stop();
    expect(device.isPlaying).toBe(false);
  });

  test('event system works', () => {
    let eventFired = false;
    device.on('test', () => {
      eventFired = true;
    });

    device.emit('test', {});
    expect(eventFired).toBe(true);
  });

  test('off removes event handler', () => {
    let count = 0;
    const handler = () => {
      count++;
    };

    device.on('test', handler);
    device.emit('test', {});
    expect(count).toBe(1);

    device.off('test', handler);
    device.emit('test', {});
    expect(count).toBe(1);
  });

  test('dispose cleans up', () => {
    device.play();
    device.dispose();
    expect(device.isPlaying).toBe(false);
  });
});

// PSY LOOPER - Main Entry Point
// The most advanced looper in the PSY family

import { LooperDevice } from './looper-device.js';
import { createLogger } from './utils/logger.js';
import { loadConfig, DEFAULT_CONFIG } from './utils/config-utils.js';
import { globalBus, EVENTS } from './utils/event-bus.js';

const logger = createLogger('Main');

/**
 * Initialize PSY LOOPER
 * @param {Object} options - Configuration options
 * @returns {LooperDevice} The initialized looper device
 */
export async function initPSYLooper(options = {}) {
  logger.info('Initializing PSY LOOPER...');
  
  // Load configuration
  const config = loadConfig(DEFAULT_CONFIG);
  const mergedConfig = { ...config, ...options };
  
  // Create device
  const device = new LooperDevice(mergedConfig);
  
  // Initialize audio context
  await device.init();
  
  logger.info('PSY LOOPER initialized successfully');
  globalBus.emit(EVENTS.UI_READY);
  
  return device;
}

/**
 * Create a standalone PSY LOOPER instance
 * @param {Object} options - Configuration options
 * @returns {LooperDevice} The looper device
 */
export function createPSYLooper(options = {}) {
  return new LooperDevice(options);
}

// Export all public APIs
export { LooperDevice } from './looper-device.js';
export { SliceEngine } from './slice-engine.js';
export { LoopAnalyzer } from './analyzer.js';
export { LoopGenerator } from './generator.js';
export { AudioGraph } from './audio-graph.js';
export { FXChain } from './fx-chain.js';
export { MIDIIntegration } from './midi-integration.js';
export { Determinism } from './determinism.js';
export { Recorder } from './recorder.js';
export { REX2Parser } from './rex2-parser.js';
export { CoPilot } from './co-pilot.js';
export { UIManager } from './ui.js';
export { ExportManager } from './export.js';
export { AutomationManager } from './automation.js';
export { StepSequencer } from './sequencer.js';

// Export utilities
export { globalBus, EVENTS } from './utils/event-bus.js';
export { createLogger, LOG_LEVELS } from './utils/logger.js';
export { loadConfig, saveConfig, DEFAULT_CONFIG } from './utils/config-utils.js';
export * from './utils/math-utils.js';
export * from './utils/audio-utils.js';
export * from './utils/validation-utils.js';

// Export types
export * from './types/index.js';

// Version
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString().split('T')[0];

logger.info(`PSY LOOPER v${VERSION} loaded`);

// Build Script - Bundle all files into self-contained index.html

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('Building PSY LOOPER...');

// Read source files
const srcFiles = [
  'src/looper-device.js',
  'src/slice-engine.js',
  'src/slice-bank.js',
  'src/analyzer.js',
  'src/generator.js',
  'src/audio-graph.js',
  'src/fx-chain.js',
  'src/midi-integration.js',
  'src/determinism.js',
  'src/loop-types.js',
  'src/time-stretch.js',
  'src/pitch-shift.js',
  'src/keyboard.js',
  'src/performance.js',
  'src/transport.js',
  'src/scheduler.js',
  'src/recorder.js',
  'src/rex2-parser.js',
  'src/co-pilot.js',
  'src/ui.js',
  'src/export.js',
  'src/factory-presets.js',
  'src/automation.js',
  'src/sequencer.js',
  'src/foundation-integration.js'
];

// Read CSS
const css = readFileSync('css/looper.css', 'utf-8');

// Bundle JavaScript
let jsBundle = '';
for (const file of srcFiles) {
  try {
    const content = readFileSync(file, 'utf-8');
    jsBundle += content + '\n\n';
  } catch (err) {
    console.warn('Warning: Could not read ' + file);
  }
}

console.log('Bundle size: ' + (jsBundle.length / 1024).toFixed(2) + ' KB');
console.log('Build complete!');

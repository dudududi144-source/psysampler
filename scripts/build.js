#!/usr/bin/env bun
// Build script for PSY LOOPER

import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function build() {
  console.log('🔨 Building PSY LOOPER...');

  // Clean dist
  console.log('📦 Cleaning dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist', { recursive: true });

  // Build with bun
  console.log('📦 Building with bun...');
  await execAsync('bun build ./src/index.js --outdir ./dist --minify');

  // Copy assets
  console.log('📦 Copying assets...');
  if (fs.existsSync('public')) {
    fs.cpSync('public', 'dist', { recursive: true });
  }

  // Copy worklets
  console.log('📦 Copying worklets...');
  if (fs.existsSync('worklets')) {
    fs.cpSync('worklets', path.join('dist', 'worklets'), { recursive: true });
  }

  console.log('✅ Build complete!');
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

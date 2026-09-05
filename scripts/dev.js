#!/usr/bin/env bun
// Development server for PSY LOOPER

import { spawn } from 'node:child_process';
import chokidar from 'chokidar';

console.log('🚀 Starting PSY LOOPER development server...');

// Start bun dev server
const server = spawn('bun', ['run', '--hot', 'src/index.js'], {
  stdio: 'inherit',
  shell: true,
});

// Watch for changes
const watcher = chokidar.watch(['src', 'worklets', 'public'], {
  ignored: /node_modules/,
  persistent: true,
});

watcher.on('change', (path) => {
  console.log(`📝 File changed: ${path}`);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.kill();
  watcher.close();
  process.exit(0);
});

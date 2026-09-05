#!/usr/bin/env bun
// Deployment script for PSY LOOPER

import { exec } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function deploy() {
  console.log('🚀 Deploying PSY LOOPER...\n');

  // Run tests first
  console.log('🧪 Running tests...');
  try {
    await execAsync('bun test');
    console.log('✅ Tests passed\n');
  } catch (error) {
    console.error('❌ Tests failed, aborting deployment');
    process.exit(1);
  }

  // Build
  console.log('🔨 Building...');
  await execAsync('bun run build');
  console.log('✅ Build complete\n');

  // Check if dist exists
  if (!fs.existsSync('dist')) {
    console.error('❌ Build failed: dist directory not found');
    process.exit(1);
  }

  // Deploy options
  const args = process.argv.slice(2);
  const target = args[0] || 'local';

  if (target === 'docker') {
    console.log('🐳 Deploying with Docker...');
    await execAsync('docker-compose up -d --build');
    console.log('✅ Deployed to Docker\n');
  } else if (target === 'github-pages') {
    console.log('📄 Deploying to GitHub Pages...');
    await execAsync('git subtree push --prefix dist origin gh-pages');
    console.log('✅ Deployed to GitHub Pages\n');
  } else {
    console.log('📦 Deploying locally...');
    console.log('✅ Build ready in dist/ directory\n');
  }

  console.log('🎉 Deployment complete!');
}

deploy().catch((err) => {
  console.error('❌ Deployment failed:', err);
  process.exit(1);
});

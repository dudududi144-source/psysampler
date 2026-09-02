#!/usr/bin/env node
// Build Optimization Script
// Optimizes the build output for production

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting build optimization...\n');

// Configuration
const config = {
  distDir: 'dist',
  publicDir: 'public',
  workletDir: 'worklets',
  maxAssetSize: 500 * 1024, // 500KB
  compressImages: true,
  minifyHTML: true,
  generateSW: true
};

// Utility functions
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Step 1: Clean dist directory
console.log('📦 Step 1: Cleaning dist directory...');
if (fs.existsSync(config.distDir)) {
  fs.rmSync(config.distDir, { recursive: true });
}
fs.mkdirSync(config.distDir, { recursive: true });
console.log('✅ Dist directory cleaned\n');

// Step 2: Build with Vite
console.log('🔨 Step 2: Building with Vite...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build complete\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Analyze bundle size
console.log('📊 Step 3: Analyzing bundle size...');
const files = [];
function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else {
      files.push(fullPath);
    }
  }
}
walkDir(config.distDir);

let totalSize = 0;
const fileSizes = files.map(file => {
  const size = getFileSize(file);
  totalSize += size;
  return { file, size };
}).sort((a, b) => b.size - a.size);

console.log(`Total build size: ${formatBytes(totalSize)}`);
console.log(`Number of files: ${files.length}`);
console.log('\nLargest files:');
fileSizes.slice(0, 10).forEach(({ file, size }) => {
  const relativePath = path.relative(config.distDir, file);
  console.log(`  ${relativePath}: ${formatBytes(size)}`);
});

// Warn about large files
const largeFiles = fileSizes.filter(f => f.size > config.maxAssetSize);
if (largeFiles.length > 0) {
  console.log('\n⚠️  Warning: Large files detected:');
  largeFiles.forEach(({ file, size }) => {
    const relativePath = path.relative(config.distDir, file);
    console.log(`  ${relativePath}: ${formatBytes(size)} (limit: ${formatBytes(config.maxAssetSize)})`);
  });
}
console.log('');

// Step 4: Copy worklets
console.log('🎵 Step 4: Copying worklets...');
if (fs.existsSync(config.workletDir)) {
  const workletDistDir = path.join(config.distDir, 'worklets');
  if (!fs.existsSync(workletDistDir)) {
    fs.mkdirSync(workletDistDir, { recursive: true });
  }
  
  const worklets = fs.readdirSync(config.workletDir);
  worklets.forEach(worklet => {
    fs.copyFileSync(
      path.join(config.workletDir, worklet),
      path.join(workletDistDir, worklet)
    );
  });
  console.log(`✅ Copied ${worklets.length} worklets\n`);
}

// Step 5: Generate service worker
if (config.generateSW) {
  console.log('🔧 Step 5: Generating service worker...');
  const swContent = `
// Service Worker for PSY LOOPER
const CACHE_NAME = 'psy-looper-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './demo.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;
  
  fs.writeFileSync(path.join(config.distDir, 'sw.js'), swContent);
  console.log('✅ Service worker generated\n');
}

// Step 6: Generate asset manifest
console.log('📋 Step 6: Generating asset manifest...');
const manifest = {
  version: require('./package.json').version,
  buildTime: new Date().toISOString(),
  files: files.map(file => ({
    path: path.relative(config.distDir, file),
    size: getFileSize(file)
  }))
};

fs.writeFileSync(
  path.join(config.distDir, 'asset-manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ Asset manifest generated\n');

// Step 7: Create gzip versions
console.log('🗜️  Step 7: Creating gzip versions...');
const zlib = require('zlib');
let gzipped = 0;

files.forEach(file => {
  const ext = path.extname(file);
  if (['.js', '.css', '.html', '.json', '.svg'].includes(ext)) {
    const content = fs.readFileSync(file);
    const gzipped = zlib.gzipSync(content, { level: 9 });
    fs.writeFileSync(file + '.gz', gzipped);
    gzipped++;
  }
});
console.log(`✅ Created ${gzipped} gzip files\n`);

// Summary
console.log('═══════════════════════════════════════');
console.log('🎉 Build optimization complete!');
console.log('═══════════════════════════════════════');
console.log(`Total size: ${formatBytes(totalSize)}`);
console.log(`Files: ${files.length}`);
console.log(`Gzipped: ${gzipped}`);
console.log(`Output: ${config.distDir}/`);
console.log('═══════════════════════════════════════\n');

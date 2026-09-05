import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        demo: path.resolve(__dirname, 'demo.html'),
      },
      output: {
        manualChunks: {
          'audio-core': [
            './src/looper-device.js',
            './src/slice-engine.js',
            './src/analyzer.js',
            './src/generator.js',
          ],
          'audio-fx': ['./src/fx-chain.js', './src/audio-graph.js'],
          utils: [
            './src/utils/math-utils.js',
            './src/utils/audio-utils.js',
            './src/utils/logger.js',
            './src/utils/state-manager.js',
          ],
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@worklets': path.resolve(__dirname, './worklets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  optimizeDeps: {
    include: [],
  },
});

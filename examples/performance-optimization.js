// Performance Optimization Example
// Demonstrates performance optimization techniques

import { PerformanceOptimizer } from '../src/utils/performance-optimizer.js';
import { PerformanceMonitor } from '../src/utils/performance-monitor.js';
import { LooperDevice } from '../src/looper-device.js';

async function performanceOptimizationExample() {
  console.log('⚡ Performance Optimization Example');
  
  const optimizer = new PerformanceOptimizer();
  const monitor = new PerformanceMonitor();
  const looper = new LooperDevice();
  await looper.initialize();

  // Start monitoring
  monitor.start();
  optimizer.measureFrameTime();

  console.log('Running performance tests...\n');

  // Test 1: Task scheduling
  console.log('Test 1: Task Scheduling');
  
  for (let i = 0; i < 100; i++) {
    optimizer.scheduleTask(async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 1));
    }, i % 3); // Different priorities
  }

  // Test 2: Batch updates
  console.log('\nTest 2: Batch Updates');
  
  const updates = [];
  for (let i = 0; i < 1000; i++) {
    updates.push(async () => {
      // Simulate update
      await new Promise(resolve => setTimeout(resolve, 0.1));
    });
  }

  const batches = optimizer.batchUpdates(updates, 50);
  for (const batch of batches) {
    await batch();
  }

  // Test 3: Throttling
  console.log('\nTest 3: Throttling');
  
  const throttledFn = optimizer.throttle(() => {
    console.log('Throttled function called');
  }, 100);

  for (let i = 0; i < 20; i++) {
    throttledFn();
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Test 4: Debouncing
  console.log('\nTest 4: Debouncing');
  
  const debouncedFn = optimizer.debounce(() => {
    console.log('Debounced function called');
  }, 100);

  for (let i = 0; i < 10; i++) {
    debouncedFn();
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Test 5: Adaptive quality
  console.log('\nTest 5: Adaptive Quality');
  
  const baseQuality = 1.0;
  const adaptedQuality = optimizer.adaptiveQuality(baseQuality);
  console.log(`Base quality: ${baseQuality}`);
  console.log(`Adapted quality: ${adaptedQuality}`);

  // Wait a bit for tasks to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get metrics
  console.log('\n📊 Performance Metrics:');
  const metrics = optimizer.getMetrics();
  console.log(`Average frame time: ${metrics.averageFrameTime.toFixed(2)}ms`);
  console.log(`FPS: ${metrics.fps.toFixed(2)}`);
  console.log(`Dropped frames: ${metrics.droppedFrames}`);
  console.log(`Drop rate: ${(metrics.dropRate * 100).toFixed(2)}%`);

  // Get monitor metrics
  const monitorMetrics = monitor.getMetrics();
  console.log('\n📈 Monitor Metrics:');
  console.log(`Current FPS: ${monitorMetrics.fps.toFixed(2)}`);
  console.log(`Frame time: ${monitorMetrics.frameTime.toFixed(2)}ms`);
  console.log(`Jitter: ${monitorMetrics.jitter.toFixed(2)}ms`);

  // Stop monitoring
  monitor.stop();

  console.log('\n✅ Performance optimization example complete');
  
  return { optimizer, monitor, metrics };
}

performanceOptimizationExample().catch(console.error);

// Performance Optimizer
// Real-time performance optimization utilities

export class PerformanceOptimizer {
  constructor() {
    this.frameBudget = 16.67; // 60 FPS
    this.taskQueue = [];
    this.isProcessing = false;
    this.metrics = {
      frameTime: 0,
      droppedFrames: 0,
      totalFrames: 0,
    };
  }

  scheduleTask(task, priority = 0) {
    this.taskQueue.push({ task, priority, timestamp: performance.now() });
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessing) {
      this.processTasks();
    }
  }

  async processTasks() {
    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const startTime = performance.now();
      const { task } = this.taskQueue.shift();

      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }

      const elapsed = performance.now() - startTime;

      if (elapsed > this.frameBudget) {
        this.metrics.droppedFrames++;
        await this.yieldToMain();
      }
    }

    this.isProcessing = false;
  }

  async yieldToMain() {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  measureFrameTime() {
    let lastFrameTime = performance.now();

    const measure = () => {
      const now = performance.now();
      this.metrics.frameTime = now - lastFrameTime;
      this.metrics.totalFrames++;
      lastFrameTime = now;

      requestAnimationFrame(measure);
    };

    requestAnimationFrame(measure);
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageFrameTime: this.metrics.frameTime,
      fps: 1000 / this.metrics.frameTime,
      dropRate: this.metrics.droppedFrames / this.metrics.totalFrames,
    };
  }

  adaptiveQuality(baseQuality) {
    const fps = 1000 / this.metrics.frameTime;

    if (fps < 30) {
      return Math.max(0.25, baseQuality * 0.5);
    }
    if (fps < 45) {
      return Math.max(0.5, baseQuality * 0.75);
    }
    if (fps > 55) {
      return Math.min(1.0, baseQuality);
    }

    return baseQuality;
  }

  batchUpdates(updates, batchSize = 10) {
    const batches = [];
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize));
    }

    return batches.map((batch) => async () => {
      await Promise.all(batch.map((update) => update()));
      await this.yieldToMain();
    });
  }

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  requestIdleCallback(callback, timeout = 1000) {
    if (typeof window.requestIdleCallback === 'function') {
      return window.requestIdleCallback(callback, { timeout });
    }
    return setTimeout(callback, timeout);
  }

  cancelIdleCallback(id) {
    if (typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

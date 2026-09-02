// Performance Monitor
// Real-time performance monitoring for PSY LOOPER

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.frames = [];
    this.maxFrames = 1000;
    this.isMonitoring = false;
    this.animationFrameId = null;
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.monitor();
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  monitor() {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.frames.push(frameTime);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }

    this.animationFrameId = requestAnimationFrame(() => this.monitor());
  }

  getFPS() {
    if (this.frames.length === 0) return 0;
    const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    return 1000 / avgFrameTime;
  }

  getFrameTime() {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  getMinFrameTime() {
    if (this.frames.length === 0) return 0;
    return Math.min(...this.frames);
  }

  getMaxFrameTime() {
    if (this.frames.length === 0) return 0;
    return Math.max(...this.frames);
  }

  getJitter() {
    if (this.frames.length < 2) return 0;
    const avg = this.getFrameTime();
    const variance = this.frames.reduce((sum, frame) => sum + Math.pow(frame - avg, 2), 0) / this.frames.length;
    return Math.sqrt(variance);
  }

  startMetric(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      count: 0,
      totalTime: 0
    });
  }

  endMetric(name) {
    const metric = this.metrics.get(name);
    if (!metric) return;

    const duration = performance.now() - metric.startTime;
    metric.totalTime += duration;
    metric.count++;
    metric.avgTime = metric.totalTime / metric.count;
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    const result = {};
    this.metrics.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  getCPUUsage() {
    if (typeof process !== 'undefined' && process.cpuUsage) {
      return process.cpuUsage();
    }
    return null;
  }

  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  getReport() {
    return {
      fps: this.getFPS(),
      frameTime: this.getFrameTime(),
      minFrameTime: this.getMinFrameTime(),
      maxFrameTime: this.getMaxFrameTime(),
      jitter: this.getJitter(),
      metrics: this.getAllMetrics(),
      cpu: this.getCPUUsage(),
      memory: this.getMemoryUsage(),
      timestamp: Date.now()
    };
  }

  reset() {
    this.frames = [];
    this.metrics.clear();
  }
}

// Global performance monitor
export const perfMonitor = new PerformanceMonitor();

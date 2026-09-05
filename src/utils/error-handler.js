// Error Handler
// Centralized error handling and reporting for PSY LOOPER

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = new Set();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(event.error, 'window.error');
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason, 'unhandledrejection');
      });
    }

    // Process errors (Node.js)
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error) => {
        this.handleError(error, 'uncaughtException');
      });

      process.on('unhandledRejection', (reason) => {
        this.handleError(reason, 'unhandledRejection');
      });
    }
  }

  handleError(error, context = 'unknown') {
    const errorInfo = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: Date.now(),
      name: error.name || 'Error',
    };

    this.errors.push(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    console.error(`[${context}] ${errorInfo.message}`, error);
    this.notifyListeners(errorInfo);

    return errorInfo;
  }

  wrapAsync(fn, context = 'async') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  wrapSync(fn, context = 'sync') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  tryCatch(fn, fallback = null, context = 'tryCatch') {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }
  }

  async tryCatchAsync(fn, fallback = null, context = 'tryCatchAsync') {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return typeof fallback === 'function' ? await fallback(error) : fallback;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(errorInfo) {
    this.listeners.forEach((callback) => {
      try {
        callback(errorInfo);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  getErrors() {
    return [...this.errors];
  }

  getErrorsByContext(context) {
    return this.errors.filter((e) => e.context === context);
  }

  clearErrors() {
    this.errors = [];
  }

  export() {
    return { errors: [...this.errors] };
  }

  import(data) {
    this.errors = data.errors || [];
  }
}

export const errorHandler = new ErrorHandler();

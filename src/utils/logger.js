// Logger
// Structured logging for PSY LOOPER

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

export class Logger {
  constructor(name, level = LOG_LEVELS.INFO) {
    this.name = name;
    this.level = level;
  }

  setLevel(level) {
    this.level = level;
  }

  error(message, ...args) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[${this.name}] ERROR:`, message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[${this.name}] WARN:`, message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[${this.name}] INFO:`, message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.debug(`[${this.name}] DEBUG:`, message, ...args);
    }
  }

  trace(message, ...args) {
    if (this.level >= LOG_LEVELS.TRACE) {
      console.trace(`[${this.name}] TRACE:`, message, ...args);
    }
  }

  time(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.time(`[${this.name}] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.timeEnd(`[${this.name}] ${label}`);
    }
  }

  group(label) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.group(`[${this.name}] ${label}`);
    }
  }

  groupEnd() {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.groupEnd();
    }
  }

  table(data) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.table(data);
    }
  }
}

// Create logger instances
export function createLogger(name, level) {
  return new Logger(name, level);
}

// Default loggers
export const audioLogger = createLogger('Audio', LOG_LEVELS.INFO);
export const midiLogger = createLogger('MIDI', LOG_LEVELS.INFO);
export const sliceLogger = createLogger('Slice', LOG_LEVELS.INFO);
export const fxLogger = createLogger('FX', LOG_LEVELS.INFO);
export const performanceLogger = createLogger('Performance', LOG_LEVELS.WARN);
export const uiLogger = createLogger('UI', LOG_LEVELS.INFO);

// Global logger
export const logger = createLogger('PSY-LOOPER', LOG_LEVELS.INFO);

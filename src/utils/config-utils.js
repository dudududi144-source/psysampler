// Configuration Utilities
// Load and manage configuration

export function loadConfig(defaults = {}) {
  const config = { ...defaults };

  // Load from localStorage if available
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('psy-looper-config');
      if (stored) {
        Object.assign(config, JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load config from localStorage:', e);
    }
  }

  // Load from environment if available
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.SAMPLE_RATE) config.sampleRate = Number.parseInt(process.env.SAMPLE_RATE);
    if (process.env.MAX_VOICES) config.maxVoices = Number.parseInt(process.env.MAX_VOICES);
    if (process.env.LOG_LEVEL) config.logLevel = process.env.LOG_LEVEL;
  }

  return config;
}

export function saveConfig(config) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('psy-looper-config', JSON.stringify(config));
      return true;
    } catch (e) {
      console.warn('Failed to save config to localStorage:', e);
      return false;
    }
  }
  return false;
}

export function resetConfig(defaults = {}) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('psy-looper-config');
  }
  return { ...defaults };
}

export function mergeConfig(base, overrides) {
  const result = { ...base };

  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      if (
        typeof overrides[key] === 'object' &&
        overrides[key] !== null &&
        !Array.isArray(overrides[key])
      ) {
        result[key] = mergeConfig(result[key] || {}, overrides[key]);
      } else {
        result[key] = overrides[key];
      }
    }
  }

  return result;
}

export function validateConfig(config, schema) {
  const errors = [];

  for (const key in schema) {
    const rule = schema[key];
    const value = config[key];

    if (rule.required && (value === undefined || value === null)) {
      errors.push(`Missing required config: ${key}`);
      continue;
    }

    if (value !== undefined && value !== null) {
      // biome-ignore lint/suspicious/useValidTypeof: rule.type is a dynamic type name from user config, not a literal
      if (rule.type && typeof value !== rule.type) {
        errors.push(`Invalid type for ${key}: expected ${rule.type}, got ${typeof value}`);
      }

      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Value for ${key} too small: ${value} < ${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Value for ${key} too large: ${value} > ${rule.max}`);
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`Invalid value for ${key}: ${value} not in ${rule.enum.join(', ')}`);
      }
    }
  }

  return errors;
}

export const DEFAULT_CONFIG = {
  audio: {
    sampleRate: 48000,
    bufferSize: 2048,
    oversampling: 4,
  },
  performance: {
    maxVoices: 64,
    maxFxPerSlice: 8,
    maxAutomationPoints: 1000,
  },
  midi: {
    enabled: true,
    clockSync: true,
  },
  features: {
    enableCopilot: true,
    enableMlClassification: true,
    enableLiveLooping: true,
  },
  export: {
    format: 'wav',
    bitDepth: 24,
    sampleRate: 48000,
  },
  logging: {
    level: 'info',
    enablePerformanceLogs: false,
  },
};

// Validation Utilities
// Input validation and sanitization functions

export function validateNumber(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, value));
}

export function validateString(value, maxLength = Infinity, defaultValue = '') {
  if (typeof value !== 'string') {
    return defaultValue;
  }
  return value.substring(0, maxLength);
}

export function validateBoolean(value, defaultValue = false) {
  if (typeof value !== 'boolean') {
    return defaultValue;
  }
  return value;
}

export function validateArray(value, defaultValue = []) {
  if (!Array.isArray(value)) {
    return defaultValue;
  }
  return value;
}

export function validateObject(value, defaultValue = {}) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return defaultValue;
  }
  return value;
}

export function validateEnum(value, validValues, defaultValue) {
  if (validValues.includes(value)) {
    return value;
  }
  return defaultValue;
}

export function validateRange(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

export function validateInteger(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return defaultValue;
  }
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function validatePositiveNumber(value, defaultValue = 0) {
  return validateNumber(value, 0, Infinity, defaultValue);
}

export function validateUnitInterval(value, defaultValue = 0) {
  return validateNumber(value, 0, 1, defaultValue);
}

export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

export function validateAudioBuffer(buffer) {
  if (!buffer || typeof buffer.getChannelData !== 'function') {
    return false;
  }
  if (!buffer.sampleRate || buffer.sampleRate < 8000 || buffer.sampleRate > 192000) {
    return false;
  }
  if (!buffer.duration || buffer.duration <= 0) {
    return false;
  }
  return true;
}

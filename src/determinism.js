// Determinism Layer - Seeded operations for byte-identical output

export class Determinism {
  constructor(seed = null) {
    this.seed = seed !== null ? seed : this.generateSeed();
    this.state = this.seed;
  }

  generateSeed() {
    return Math.floor(Math.random() * 2147483647);
  }

  setSeed(seed) {
    this.seed = seed;
    this.state = seed;
  }

  reset() {
    this.state = this.seed;
  }

  // Mulberry32 PRNG
  next() {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min = 0, max = 1) {
    return this.next() * (max - min) + min;
  }

  nextBool(probability = 0.5) {
    return this.next() < probability;
  }

  pick(array) {
    if (array.length === 0) return null;
    return array[Math.floor(this.next() * array.length)];
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Seeded operations for determinism
  seededSlice(data, probability = 1.0) {
    if (this.next() < probability) {
      return data;
    }
    return null;
  }

  seededRoundRobin(index, options) {
    return options[index % options.length];
  }

  seededProbability(seed, bar, step) {
    // Instance seed MUST participate: two Determinism instances with different
    // seeds must diverge even for identical (seed, bar, step) arguments.
    const combinedSeed = (this.seed ^ (seed * 0x9e3779b1) ^ (bar * 1000) ^ step) | 0;
    const tempState = this.state;
    this.state = combinedSeed;
    const result = this.next();
    this.state = tempState;
    return result;
  }

  seededRandomize(seed) {
    const tempState = this.state;
    this.state = seed;
    const result = this.next();
    this.state = tempState;
    return result;
  }

  // State management
  getState() {
    return { seed: this.seed, state: this.state };
  }

  setState(state) {
    this.seed = state.seed;
    this.state = state.state;
  }

  clone() {
    const clone = new Determinism(this.seed);
    clone.state = this.state;
    return clone;
  }
}

// FX Chain - Advanced effects processing

export class FXChain {
  constructor(context) {
    this.context = context;
    this.effects = [];
  }

  createFX(type, params = {}) {
    switch (type) {
      case 'transient-shaper':
        return this.createTransientShaper(params);
      case 'filter':
        return this.createFilter(params);
      case 'delay':
        return this.createDelay(params);
      case 'reverb':
        return this.createReverb(params);
      case 'bitcrusher':
        return this.createBitcrusher(params);
      case 'formant':
        return this.createFormant(params);
      case 'vocoder':
        return this.createVocoder(params);
      case 'granular':
        return this.createGranular(params);
      case 'ott':
        return this.createOTT(params);
      case 'compressor':
        return this.createCompressor(params);
      case 'saturation':
        return this.createSaturation(params);
      case 'limiter':
        return this.createLimiter(params);
      default:
        throw new Error('Unknown FX type: ' + type);
    }
  }

  createTransientShaper(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    // Simplified transient shaper
    const attack = params.attack || 1.0;
    const sustain = params.sustain || 1.0;
    
    input.connect(output);
    output.gain.value = attack * sustain;
    
    return { type: 'transient-shaper', input, output, params: { attack, sustain } };
  }

  createFilter(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const output = ctx.createGain();
    
    filter.type = params.type || 'lowpass';
    filter.frequency.value = params.frequency || 1000;
    filter.Q.value = params.Q || 1.0;
    filter.gain.value = params.gain || 0;
    
    input.connect(filter);
    filter.connect(output);
    
    return { type: 'filter', input, output, filter, params };
  }

  createDelay(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();
    const wet = ctx.createGain();
    const output = ctx.createGain();
    
    delay.delayTime.value = params.time || 0.5;
    feedback.gain.value = params.feedback || 0.5;
    wet.gain.value = params.mix || 0.5;
    
    input.connect(output);
    input.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(output);
    
    return { type: 'delay', input, output, params };
  }

  createReverb(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const convolver = ctx.createConvolver();
    const wet = ctx.createGain();
    const output = ctx.createGain();
    
    // Generate IR
    const irLength = Math.floor(ctx.sampleRate * (params.decay || 2.0));
    const ir = new Float32Array(irLength);
    for (let i = 0; i < irLength; i++) {
      ir[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLength, params.decay || 2.0);
    }
    convolver.buffer = this.createBuffer(ir, ctx.sampleRate);
    
    wet.gain.value = params.mix || 0.3;
    
    input.connect(output);
    input.connect(convolver);
    convolver.connect(wet);
    wet.connect(output);
    
    return { type: 'reverb', input, output, params };
  }

  createBitcrusher(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    input.connect(output);
    
    return { type: 'bitcrusher', input, output, params };
  }

  createFormant(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    input.connect(output);
    
    return { type: 'formant', input, output, params };
  }

  createVocoder(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    input.connect(output);
    
    return { type: 'vocoder', input, output, params };
  }

  createGranular(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    input.connect(output);
    
    return { type: 'granular', input, output, params };
  }

  createOTT(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const output = ctx.createGain();
    
    input.connect(output);
    
    return { type: 'ott', input, output, params };
  }

  createCompressor(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const output = ctx.createGain();
    
    compressor.threshold.value = params.threshold || -24;
    compressor.knee.value = params.knee || 30;
    compressor.ratio.value = params.ratio || 4;
    compressor.attack.value = params.attack || 0.003;
    compressor.release.value = params.release || 0.25;
    
    input.connect(compressor);
    compressor.connect(output);
    
    return { type: 'compressor', input, output, compressor, params };
  }

  createSaturation(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const waveshaper = ctx.createWaveShaper();
    const output = ctx.createGain();
    
    const drive = params.drive || 1.0;
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * drive);
    }
    waveshaper.curve = curve;
    
    input.connect(waveshaper);
    waveshaper.connect(output);
    
    return { type: 'saturation', input, output, params };
  }

  createLimiter(params) {
    const ctx = this.context;
    const input = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const output = ctx.createGain();
    
    compressor.threshold.value = params.threshold || -1;
    compressor.knee.value = 0;
    compressor.ratio.value = 20;
    compressor.attack.value = 0.001;
    compressor.release.value = 0.1;
    
    input.connect(compressor);
    compressor.connect(output);
    
    return { type: 'limiter', input, output, compressor, params };
  }

  createBuffer(data, sampleRate) {
    const buffer = this.context.createBuffer(1, data.length, sampleRate);
    buffer.getChannelData(0).set(data);
    return buffer;
  }
}

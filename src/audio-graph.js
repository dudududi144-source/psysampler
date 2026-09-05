// Audio Graph - 8 buses with advanced FX chain

export class AudioGraph {
  constructor(config) {
    this.config = config;
    this.context = null;
    this.buses = [];
    this.inputNode = null;
    this.outputNode = null;
  }

  init(context) {
    this.context = context;

    // Create 8 buses
    for (let i = 0; i < 8; i++) {
      this.buses.push(this.createBus(i));
    }

    // Master bus
    this.masterBus = this.createMasterBus();

    // Input node
    this.inputNode = context.createGain();

    // Output node
    this.outputNode = context.destination;

    // Connect input to all buses
    this.buses.forEach((bus) => {
      this.inputNode.connect(bus.input);
    });

    // Connect buses to master
    this.buses.forEach((bus) => {
      bus.output.connect(this.masterBus.input);
    });

    // Connect master to output
    this.masterBus.output.connect(this.outputNode);
  }

  createBus(index) {
    const ctx = this.context;

    // Input gain
    const input = ctx.createGain();
    input.gain.value = 1.0;

    // FX chain
    const fxChain = this.createFXChain();
    input.connect(fxChain.input);

    // Output gain
    const output = ctx.createGain();
    output.gain.value = 1.0;
    fxChain.output.connect(output);

    return {
      index,
      input,
      output,
      fxChain,
      gain: input.gain,
      mute: false,
      solo: false,
    };
  }

  createMasterBus() {
    const ctx = this.context;

    const input = ctx.createGain();

    // Master FX chain
    const eq = this.createEQ();
    const compressor = this.createMultibandCompressor();
    const limiter = this.createLimiter();
    const dither = this.createDither();

    input.connect(eq.input);
    eq.output.connect(compressor.input);
    compressor.output.connect(limiter.input);
    limiter.output.connect(dither.input);

    const output = ctx.createGain();
    dither.output.connect(output);

    return {
      input,
      output,
      eq,
      compressor,
      limiter,
      dither,
    };
  }

  createFXChain() {
    const ctx = this.context;

    // Simplified FX chain (full implementation in worklets)
    const input = ctx.createGain();
    const output = ctx.createGain();

    input.connect(output);

    return { input, output };
  }

  createEQ() {
    const ctx = this.context;

    // 8-band parametric EQ
    const bands = [];
    const input = ctx.createGain();
    let currentNode = input;

    for (let i = 0; i < 8; i++) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = 100 * 2 ** i;
      filter.Q.value = 1.0;
      filter.gain.value = 0;

      currentNode.connect(filter);
      currentNode = filter;
      bands.push(filter);
    }

    const output = ctx.createGain();
    currentNode.connect(output);

    return { input, output, bands };
  }

  createMultibandCompressor() {
    const ctx = this.context;

    // Simplified multiband compressor
    const input = ctx.createGain();
    const output = ctx.createGain();

    input.connect(output);

    return { input, output };
  }

  createLimiter() {
    const ctx = this.context;

    // True peak limiter
    const input = ctx.createGain();
    const output = ctx.createGain();

    input.connect(output);

    return { input, output };
  }

  createDither() {
    const ctx = this.context;

    // Dither for bit reduction
    const input = ctx.createGain();
    const output = ctx.createGain();

    input.connect(output);

    return { input, output };
  }

  setBusVolume(index, volume) {
    if (index >= 0 && index < this.buses.length) {
      this.buses[index].gain.value = volume;
    }
  }

  setBusMute(index, mute) {
    if (index >= 0 && index < this.buses.length) {
      this.buses[index].mute = mute;
      this.buses[index].gain.value = mute ? 0 : 1;
    }
  }

  setBusSolo(index, solo) {
    if (index >= 0 && index < this.buses.length) {
      this.buses[index].solo = solo;
      this.updateSoloState();
    }
  }

  updateSoloState() {
    const hasSolo = this.buses.some((b) => b.solo);
    this.buses.forEach((bus) => {
      if (hasSolo) {
        bus.gain.value = bus.solo ? 1 : 0;
      } else {
        bus.gain.value = bus.mute ? 0 : 1;
      }
    });
  }

  dispose() {
    this.buses.forEach((bus) => {
      bus.input.disconnect();
      bus.output.disconnect();
    });
  }
}

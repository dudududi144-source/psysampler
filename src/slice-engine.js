// Slice Engine - Core slice processing and playback

export class SliceEngine {
  constructor(sliceBanks, config) {
    this.banks = sliceBanks;
    this.config = config;
    this.activeVoices = [];
    this.maxVoices = 64;
    this.isPlaying = false;
    this.transport = null;
    this.context = null;
  }

  onTransport(transport) {
    this.transport = transport;
  }

  onContext(context) {
    this.context = context;
  }

  trigger(bank, slice, velocity = 1.0) {
    if (!this.context) return; // No audio context — cannot create voices (headless-safe)
    const bankObj = this.banks[bank];
    if (!bankObj || !bankObj.hasLoop) return;

    const sliceData = bankObj.getSlice(slice);
    if (!sliceData) return;

    // Voice management
    if (this.activeVoices.length >= this.maxVoices) {
      this.stealVoice();
    }

    const voice = this.createVoice(sliceData, velocity);
    this.activeVoices.push(voice);

    voice.play();

    // Auto-cleanup when done
    voice.onComplete(() => {
      const idx = this.activeVoices.indexOf(voice);
      if (idx > -1) this.activeVoices.splice(idx, 1);
    });
  }

  createVoice(sliceData, velocity) {
    const { audioBuffer, start, end, pitch, time, reverse } = sliceData;
    const ctx = this.context;

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Apply pitch shift
    if (pitch !== 0) {
      source.detune.value = pitch * 100; // cents
    }

    // Apply time stretch (simplified - full impl in worklet)
    source.playbackRate.value = time;

    // Gain
    const gain = ctx.createGain();
    gain.gain.value = velocity * sliceData.volume;

    // Pan
    const panner = ctx.createStereoPanner();
    panner.pan.value = sliceData.pan;

    // Connect chain
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.getOutputNode());

    // Envelope
    const attack = sliceData.attack || 0.01;
    const release = sliceData.release || 0.1;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(velocity, ctx.currentTime + attack);

    return {
      play: () => {
        if (reverse) {
          source.start(0, end, end - start);
        } else {
          source.start(0, start, end - start);
        }
      },
      stop: () => source.stop(),
      source,
      onComplete: (cb) => {
        source.onended = cb;
      },
    };
  }

  // Alias matching the PsyDevice contract naming (used by LooperDevice.onEvent + keyboard bindings)
  triggerSlice(bank, slice, velocity = 1.0) {
    return this.trigger(bank, slice, velocity);
  }

  stealVoice() {
    if (this.activeVoices.length > 0) {
      const oldest = this.activeVoices.shift();
      oldest.stop();
    }
  }

  getOutputNode() {
    // Returns the input node of the audio graph
    return this.audioGraph?.inputNode || this.context?.destination;
  }

  setAudioGraph(audioGraph) {
    this.audioGraph = audioGraph;
  }

  play() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    this.activeVoices.forEach((v) => v.stop());
    this.activeVoices = [];
  }

  dispose() {
    this.stop();
  }
}

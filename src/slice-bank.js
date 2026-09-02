// Slice Bank - Manages slices for a single loop

export class SliceBank {
  constructor(index, determinism) {
    this.index = index;
    this.determinism = determinism;
    this.slices = [];
    this.audioBuffer = null;
    this.analysis = null;
    this.hasLoop = false;
  }

  load(audioBuffer, slices, analysis) {
    this.audioBuffer = audioBuffer;
    this.slices = slices;
    this.analysis = analysis;
    this.hasLoop = true;
    
    // Initialize slice properties
    this.slices.forEach((slice, idx) => {
      slice.volume = 1.0;
      slice.pan = 0;
      slice.pitch = 0;
      slice.time = 1.0;
      slice.reverse = false;
      slice.attack = 0.01;
      slice.release = 0.1;
      slice.fxChain = [];
    });
  }

  getSlice(index) {
    if (index >= 0 && index < this.slices.length) {
      const slice = this.slices[index];
      return {
        audioBuffer: this.audioBuffer,
        start: slice.start,
        end: slice.end,
        volume: slice.volume,
        pan: slice.pan,
        pitch: slice.pitch,
        time: slice.time,
        reverse: slice.reverse,
        attack: slice.attack,
        release: slice.release
      };
    }
    return null;
  }

  getSliceInfo(index) {
    const slice = this.slices[index];
    if (!slice) return null;
    
    return {
      index,
      start: slice.start,
      end: slice.end,
      duration: slice.end - slice.start,
      volume: slice.volume,
      pan: slice.pan,
      pitch: slice.pitch,
      time: slice.time,
      reverse: slice.reverse
    };
  }

  setSliceParam(index, param, value) {
    if (index >= 0 && index < this.slices.length) {
      this.slices[index][param] = value;
    }
  }

  getInfo() {
    return {
      index: this.index,
      hasLoop: this.hasLoop,
      numSlices: this.slices.length,
      analysis: this.analysis,
      duration: this.audioBuffer?.duration || 0
    };
  }

  export() {
    return {
      index: this.index,
      slices: this.slices.map(s => ({
        start: s.start,
        end: s.end,
        volume: s.volume,
        pan: s.pan,
        pitch: s.pitch,
        time: s.time,
        reverse: s.reverse,
        attack: s.attack,
        release: s.release
      })),
      analysis: this.analysis
    };
  }

  import(data) {
    this.slices = data.slices;
    this.analysis = data.analysis;
    this.hasLoop = data.slices.length > 0;
  }
}

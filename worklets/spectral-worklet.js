// Spectral Processing AudioWorklet
// FFT-based spectral effects

class SpectralWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'fftSize', defaultValue: 2048, minValue: 256, maxValue: 8192 },
      { name: 'freeze', defaultValue: 0, minValue: 0, maxValue: 1 },
      { name: 'spectralBlur', defaultValue: 0, minValue: 0, maxValue: 1 },
      { name: 'harmonizer', defaultValue: 0, minValue: -12, maxValue: 12 },
      { name: 'wetMix', defaultValue: 0.5, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this.fftSize = 2048;
    this.hopSize = this.fftSize / 4;
    this.inputBuffer = new Float32Array(this.fftSize);
    this.outputBuffer = new Float32Array(this.fftSize);
    this.window = this.createHannWindow(this.fftSize);
    this.spectrum = new Float32Array(this.fftSize);
    this.phase = new Float32Array(this.fftSize);
    this.frozenSpectrum = null;
    this.writePos = 0;
    this.readPos = 0;
  }

  createHannWindow(size) {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / size));
    }
    return window;
  }

  fft(real, imag) {
    const n = real.length;
    if (n === 1) return;

    // Bit reversal
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) {
        j ^= bit;
      }
      j ^= bit;

      if (i < j) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }

    // FFT
    for (let len = 2; len <= n; len <<= 1) {
      const angle = (-2 * Math.PI) / len;
      const wReal = Math.cos(angle);
      const wImag = Math.sin(angle);

      for (let i = 0; i < n; i += len) {
        let curReal = 1;
        let curImag = 0;
        for (let j = 0; j < len / 2; j++) {
          const uReal = real[i + j];
          const uImag = imag[i + j];
          const vReal = real[i + j + len / 2] * curReal - imag[i + j + len / 2] * curImag;
          const vImag = real[i + j + len / 2] * curImag + imag[i + j + len / 2] * curReal;

          real[i + j] = uReal + vReal;
          imag[i + j] = uImag + vImag;
          real[i + j + len / 2] = uReal - vReal;
          imag[i + j + len / 2] = uImag - vImag;

          const newCurReal = curReal * wReal - curImag * wImag;
          curImag = curReal * wImag + curImag * wReal;
          curReal = newCurReal;
        }
      }
    }
  }

  ifft(real, imag) {
    // Conjugate
    for (let i = 0; i < imag.length; i++) {
      imag[i] = -imag[i];
    }

    this.fft(real, imag);

    // Conjugate and scale
    const n = real.length;
    for (let i = 0; i < n; i++) {
      real[i] /= n;
      imag[i] = -imag[i] / n;
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input[0] || input[0].length === 0) return true;

    const freeze = parameters.freeze[0];
    const spectralBlur = parameters.spectralBlur[0];
    const harmonizer = parameters.harmonizer[0];
    const wetMix = parameters.wetMix[0];

    for (let i = 0; i < output[0].length; i++) {
      // Write to input buffer
      this.inputBuffer[this.writePos] = input[0][i];
      this.writePos = (this.writePos + 1) % this.fftSize;

      // Read from output buffer
      const dry = input[0][i];
      const wet = this.outputBuffer[this.readPos];
      this.readPos = (this.readPos + 1) % this.fftSize;

      output[0][i] = dry * (1 - wetMix) + wet * wetMix;
      if (output[1]) {
        output[1][i] = output[0][i];
      }

      // Process FFT when we have enough samples
      if (this.writePos % this.hopSize === 0) {
        this.processSpectralFrame(freeze, spectralBlur, harmonizer);
      }
    }

    return true;
  }

  processSpectralFrame(freeze, spectralBlur, harmonizer) {
    const real = new Float32Array(this.fftSize);
    const imag = new Float32Array(this.fftSize);

    // Apply window and copy to FFT buffers
    for (let i = 0; i < this.fftSize; i++) {
      const idx = (this.writePos + i) % this.fftSize;
      real[i] = this.inputBuffer[idx] * this.window[i];
      imag[i] = 0;
    }

    // Forward FFT
    this.fft(real, imag);

    // Compute magnitude and phase
    const magnitude = new Float32Array(this.fftSize / 2);
    const phase = new Float32Array(this.fftSize / 2);

    for (let i = 0; i < this.fftSize / 2; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
      phase[i] = Math.atan2(imag[i], real[i]);
    }

    // Freeze spectrum
    if (freeze > 0.5) {
      if (!this.frozenSpectrum) {
        this.frozenSpectrum = {
          magnitude: new Float32Array(magnitude),
          phase: new Float32Array(phase),
        };
      }
      magnitude.set(this.frozenSpectrum.magnitude);
      phase.set(this.frozenSpectrum.phase);
    } else {
      this.frozenSpectrum = null;
    }

    // Spectral blur
    if (spectralBlur > 0) {
      for (let i = 1; i < magnitude.length; i++) {
        magnitude[i] = magnitude[i] * (1 - spectralBlur) + magnitude[i - 1] * spectralBlur;
      }
    }

    // Harmonizer (pitch shift in frequency domain)
    if (Math.abs(harmonizer) > 0.5) {
      const shift = Math.round(harmonizer);
      const newMagnitude = new Float32Array(magnitude.length);
      const newPhase = new Float32Array(phase.length);

      for (let i = 0; i < magnitude.length - Math.abs(shift); i++) {
        if (shift > 0) {
          newMagnitude[i + shift] = magnitude[i];
          newPhase[i + shift] = phase[i];
        } else {
          newMagnitude[i] = magnitude[i - shift];
          newPhase[i] = phase[i - shift];
        }
      }

      magnitude.set(newMagnitude);
      phase.set(newPhase);
    }

    // Convert back to complex
    for (let i = 0; i < this.fftSize / 2; i++) {
      real[i] = magnitude[i] * Math.cos(phase[i]);
      imag[i] = magnitude[i] * Math.sin(phase[i]);
    }

    // Inverse FFT
    this.ifft(real, imag);

    // Overlap-add to output buffer
    for (let i = 0; i < this.fftSize; i++) {
      const idx = (this.readPos + i) % this.fftSize;
      this.outputBuffer[idx] += real[i] * this.window[i] * (4 / this.fftSize);
    }
  }
}

registerProcessor('spectral-worklet', SpectralWorklet);

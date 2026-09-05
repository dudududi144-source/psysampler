// Audio Visualizer
// Real-time audio visualization utilities

export class AudioVisualizer {
  constructor(analyserNode) {
    this.analyser = analyserNode;
    this.fftSize = analyserNode.fftSize;
    this.frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
    this.timeDomainData = new Uint8Array(analyserNode.fftSize);
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  start() {
    if (this.animationId) return;
    this.draw();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  draw() {
    this.animationId = requestAnimationFrame(() => this.draw());

    if (!this.ctx) return;

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    this.drawSpectrum();
    this.drawWaveform();
  }

  drawSpectrum() {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height / 2;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    const barWidth = width / this.frequencyData.length;
    const barHeight = height;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const value = this.frequencyData[i];
      const percent = value / 255;
      const h = barHeight * percent;

      const hue = (i / this.frequencyData.length) * 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.ctx.fillRect(i * barWidth, height - h, barWidth - 1, h);
    }
  }

  drawWaveform() {
    if (!this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height / 2;
    const y = height;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, y, width, height);

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#0f0';
    this.ctx.beginPath();

    const sliceWidth = width / this.timeDomainData.length;
    let x = 0;

    for (let i = 0; i < this.timeDomainData.length; i++) {
      const value = this.timeDomainData[i] / 128.0;
      const yPos = y + (value * height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, yPos);
      } else {
        this.ctx.lineTo(x, yPos);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();
  }

  getPeakFrequency() {
    this.analyser.getByteFrequencyData(this.frequencyData);

    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < this.frequencyData.length; i++) {
      if (this.frequencyData[i] > maxValue) {
        maxValue = this.frequencyData[i];
        maxIndex = i;
      }
    }

    const nyquist = this.analyser.context.sampleRate / 2;
    return (maxIndex / this.frequencyData.length) * nyquist;
  }

  getRMS() {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      sum += this.timeDomainData[i] * this.timeDomainData[i];
    }

    return Math.sqrt(sum / this.timeDomainData.length);
  }

  getSpectralCentroid() {
    this.analyser.getFloatFrequencyData(this.frequencyData);

    let numerator = 0;
    let denominator = 0;
    const nyquist = this.analyser.context.sampleRate / 2;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const frequency = (i / this.frequencyData.length) * nyquist;
      const magnitude = 10 ** (this.frequencyData[i] / 20);

      numerator += frequency * magnitude;
      denominator += magnitude;
    }

    return denominator > 0 ? numerator / denominator : 0;
  }
}

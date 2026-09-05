// UI Manager - User interface components

export class UIManager {
  constructor(device) {
    this.device = device;
    this.elements = new Map();
    this.waveformCanvas = null;
    this.spectrumCanvas = null;
    this.animationFrame = null;
  }

  init() {
    this.setupWaveform();
    this.setupSpectrum();
    this.setupSliceGrid();
    this.setupBankSelector();
    this.setupControls();
    this.startAnimation();
  }

  setupWaveform() {
    const container = document.getElementById('waveform');
    if (!container) return;

    this.waveformCanvas = document.createElement('canvas');
    this.waveformCanvas.width = container.clientWidth || 800;
    this.waveformCanvas.height = container.clientHeight || 100;
    container.appendChild(this.waveformCanvas);

    this.waveformCtx = this.waveformCanvas.getContext('2d');
  }

  setupSpectrum() {
    const container = document.getElementById('spectrum');
    if (!container) return;

    this.spectrumCanvas = document.createElement('canvas');
    this.spectrumCanvas.width = container.clientWidth || 800;
    this.spectrumCanvas.height = container.clientHeight || 200;
    container.appendChild(this.spectrumCanvas);

    this.spectrumCtx = this.spectrumCanvas.getContext('2d');
  }

  setupSliceGrid() {
    const grid = document.getElementById('slice-grid');
    if (!grid) return;

    // Create 16 slice buttons
    for (let i = 0; i < 16; i++) {
      const slice = document.createElement('div');
      slice.className = 'slice';
      slice.dataset.index = i;
      slice.textContent = i + 1;

      slice.addEventListener('click', () => {
        this.device.triggerSlice(this.device.currentBank, i, 1.0);
        this.highlightSlice(i);
      });

      grid.appendChild(slice);
    }
  }

  setupBankSelector() {
    const selector = document.getElementById('bank-selector');
    if (!selector) return;

    for (let i = 0; i < 8; i++) {
      const btn = document.createElement('div');
      btn.className = `bank-btn${i === 0 ? ' active' : ''}`;
      btn.dataset.bank = i;
      btn.textContent = i + 1;

      btn.addEventListener('click', () => {
        this.selectBank(i);
      });

      selector.appendChild(btn);
    }
  }

  setupControls() {
    // BPM slider
    const bpmSlider = document.getElementById('bpm-slider');
    if (bpmSlider) {
      bpmSlider.addEventListener('input', (e) => {
        const bpm = Number.parseInt(e.target.value);
        document.getElementById('bpm-value').textContent = bpm;
        this.device.transport?.setBPM(bpm);
      });
    }

    // Bars slider
    const barsSlider = document.getElementById('bars-slider');
    if (barsSlider) {
      barsSlider.addEventListener('input', (e) => {
        const bars = Number.parseInt(e.target.value);
        document.getElementById('bars-value').textContent = bars;
      });
    }
  }

  selectBank(index) {
    // Update UI
    document.querySelectorAll('.bank-btn').forEach((btn) => {
      btn.classList.toggle('active', Number.parseInt(btn.dataset.bank) === index);
    });

    // Update device
    this.device.setBank(index);
    this.updateBankInfo();
  }

  updateBankInfo() {
    const info = this.device.getBankInfo(this.device.currentBank);
    const infoBox = document.getElementById('bank-info');

    if (!infoBox) return;

    infoBox.innerHTML = `<h3>Bank ${this.device.currentBank + 1}</h3>`;

    if (info.hasLoop) {
      infoBox.innerHTML += `<p>Slices: ${info.numSlices}</p>`;
      infoBox.innerHTML += `<p>Duration: ${info.duration.toFixed(2)}s</p>`;
      infoBox.innerHTML += `<p>Type: ${info.analysis?.type || 'unknown'}</p>`;
      infoBox.innerHTML += `<p>Tempo: ${info.analysis?.tempo || 'N/A'} BPM</p>`;
      infoBox.innerHTML += `<p>Key: ${info.analysis?.key?.key || 'N/A'} ${info.analysis?.key?.scale || ''}</p>`;
    } else {
      infoBox.innerHTML += '<p>No loop loaded</p>';
    }
  }

  highlightSlice(index) {
    const slices = document.querySelectorAll('.slice');
    const slice = slices[index];

    if (slice) {
      slice.classList.add('playing');
      setTimeout(() => slice.classList.remove('playing'), 500);
    }
  }

  drawWaveform(audioBuffer) {
    if (!this.waveformCtx) return;

    const ctx = this.waveformCtx;
    const canvas = this.waveformCanvas;
    const data = audioBuffer.getChannelData(0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';

    const step = Math.floor(data.length / canvas.width);

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const value = data[i * step + j] || 0;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }

      const y1 = ((1 - max) * canvas.height) / 2;
      const y2 = ((1 - min) * canvas.height) / 2;

      ctx.fillRect(i, y1, 1, y2 - y1 || 1);
    }
  }

  drawSpectrum(analyser) {
    if (!this.spectrumCtx) return;

    const ctx = this.spectrumCtx;
    const canvas = this.spectrumCanvas;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      ctx.fillStyle = `hsl(${120 + (dataArray[i] / 255) * 120}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  startAnimation() {
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      // Update visualizations
    };

    animate();
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  dispose() {
    this.stopAnimation();
    this.elements.clear();
  }
}

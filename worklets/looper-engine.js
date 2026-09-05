// PSY LOOPER - AudioWorklet Processor

class LooperEngine extends AudioWorkletProcessor {
  constructor() {
    super();

    this.sampleRate = 48000;
    this.isPlaying = false;
    this.currentPosition = 0;
    this.banks = [];
    this.activeVoices = [];
    this.maxVoices = 64;

    // Message handling
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'play':
        this.isPlaying = true;
        break;

      case 'stop':
        this.isPlaying = false;
        this.currentPosition = 0;
        break;

      case 'trigger':
        this.triggerSlice(message.bank, message.slice, message.velocity);
        break;

      case 'load-bank':
        this.loadBank(message.bank, message.slices, message.audioData);
        break;

      case 'set-param':
        this.setParameter(message.bank, message.slice, message.param, message.value);
        break;
    }
  }

  loadBank(bankIndex, slices, audioData) {
    this.banks[bankIndex] = {
      slices,
      audioData,
      hasLoop: true,
    };
  }

  triggerSlice(bankIndex, sliceIndex, velocity) {
    const bank = this.banks[bankIndex];
    if (!bank || !bank.hasLoop) return;

    const slice = bank.slices[sliceIndex];
    if (!slice) return;

    if (this.activeVoices.length >= this.maxVoices) {
      this.stealVoice();
    }

    const voice = {
      bank: bankIndex,
      slice: sliceIndex,
      position: slice.start * this.sampleRate,
      endPosition: slice.end * this.sampleRate,
      velocity,
      pitch: slice.pitch || 0,
      time: slice.time || 1.0,
      reverse: slice.reverse || false,
      volume: slice.volume || 1.0,
      pan: slice.pan || 0,
      attack: slice.attack || 0.01,
      release: slice.release || 0.1,
      envelope: 0,
      phase: 'attack',
      startTime: currentTime,
    };

    this.activeVoices.push(voice);
  }

  stealVoice() {
    if (this.activeVoices.length > 0) {
      // Remove oldest voice
      this.activeVoices.shift();
    }
  }

  setParameter(bankIndex, sliceIndex, param, value) {
    const bank = this.banks[bankIndex];
    if (!bank) return;

    const slice = bank.slices[sliceIndex];
    if (!slice) return;

    slice[param] = value;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const numChannels = output.length;
    const numSamples = output[0].length;

    if (!this.isPlaying) {
      // Output silence
      for (let channel = 0; channel < numChannels; channel++) {
        output[channel].fill(0);
      }
      return true;
    }

    // Process each sample
    for (let i = 0; i < numSamples; i++) {
      let leftSum = 0;
      let rightSum = 0;

      // Process active voices
      for (let v = 0; v < this.activeVoices.length; v++) {
        const voice = this.activeVoices[v];
        const bank = this.banks[voice.bank];

        if (!bank || !bank.audioData) continue;

        // Get sample value
        let pos = voice.position;
        if (voice.reverse) {
          pos = voice.endPosition - (voice.position - voice.slice.start * this.sampleRate);
        }

        const sampleIndex = Math.floor(pos);
        if (sampleIndex >= 0 && sampleIndex < bank.audioData.length) {
          let sample = bank.audioData[sampleIndex] || 0;

          // Apply envelope
          const timeSinceStart = currentTime - voice.startTime;
          let envelope = 1.0;

          if (voice.phase === 'attack') {
            envelope = Math.min(1.0, timeSinceStart / voice.attack);
            if (envelope >= 1.0) voice.phase = 'sustain';
          } else if (voice.phase === 'release') {
            envelope = Math.max(0, 1.0 - timeSinceStart / voice.release);
          }

          sample *= envelope * voice.volume * voice.velocity;

          // Apply pan
          const pan = voice.pan;
          leftSum += sample * Math.cos((pan * Math.PI) / 4);
          rightSum += sample * Math.sin((pan * Math.PI) / 4);
        }

        // Advance position
        voice.position += voice.time;

        // Check if voice is done
        if (voice.position >= voice.endPosition || voice.envelope <= 0) {
          this.activeVoices.splice(v, 1);
          v--;
        }
      }

      // Soft clip
      leftSum = Math.tanh(leftSum);
      rightSum = Math.tanh(rightSum);

      // Write to output
      if (numChannels === 1) {
        output[0][i] = (leftSum + rightSum) / 2;
      } else if (numChannels >= 2) {
        output[0][i] = leftSum;
        output[1][i] = rightSum;
      }
    }

    return true;
  }
}

registerProcessor('looper-engine', LooperEngine);

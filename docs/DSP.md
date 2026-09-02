# PSY LOOPER - DSP Documentation

## Overview

PSY LOOPER uses advanced DSP techniques for highest audio quality.

## Core DSP Components

### ZDF SVF (Zero-Delay Feedback State-Variable Filter)

- Simper/Zavalashin topology
- No latency
- Stable at all resonances
- Used in per-slice filters

### PolyBLEP Oscillators

- Band-limited oscillators
- No aliasing
- Used in loop generation

### Phase Vocoder

- High-quality time stretching
- Preserves pitch
- 2048-point FFT
- 512-sample hop size

### Granular Pitch Shifting

- Preserves duration
- Natural sound
- Formant preservation option

## FX Chain

### Transient Shaper

- Attack control
- Sustain control
- Envelope follower

### Filter

- Lowpass, highpass, bandpass
- Resonance control
- Frequency modulation

### Delay

- Mono/stereo
- Ping-pong
- Feedback control
- Dotted rhythms

### Reverb

- Convolution reverb
- Seeded IR generation
- True stereo decorrelation

### Bitcrusher

- Bit depth reduction
- Sample rate reduction
- Lo-fi effect

### Formant Filter

- Vocal formant emulation
- Multiple formant bands
- Vowel morphing

### Vocoder

- Carrier/modulator
- 16 bands
- Classic vocoder sound

### Granular FX

- Grain size control
- Grain density
- Pitch randomization

### OTT (Multiband Expander)

- 3-band crossover
- Upward expansion
- Downward expansion
- Per-band control

### Compressor

- Single/multiband
- Adjustable attack/release
- Sidechain input

### Saturation

- Tanh waveshaper
- Drive control
- Harmonic generation

### Limiter

- True peak detection
- ISP-safe ceiling
- Lookahead processing

## Master Chain

1. 8-band parametric EQ
2. Multiband compressor
3. Saturation
4. True peak limiter
5. Dither (16/24-bit)

## Audio Quality

- THD: <0.01%
- SNR: >100dB
- Frequency response: flat ±0.5dB
- Oversampling: 4x

## License

MIT

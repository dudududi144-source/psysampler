# PSY LOOPER - FX Chain Documentation

## Overview

PSY LOOPER has 12 advanced FX types, available per-slice and per-bus.

## FX Types

### 1. Transient Shaper

Shapes the attack and sustain of audio.

Parameters:
- Attack: -100 to +100
- Sustain: -100 to +100

### 2. Filter

Resonant filter with multiple types.

Parameters:
- Type: lowpass, highpass, bandpass, notch
- Frequency: 20Hz to 20kHz
- Resonance: 0 to 20
- Gain: -24 to +24 dB

### 3. Delay

Stereo delay with feedback.

Parameters:
- Time: 0 to 2 seconds
- Feedback: 0 to 100%
- Mix: 0 to 100%
- Ping-pong: on/off

### 4. Reverb

Convolution reverb with seeded IR.

Parameters:
- Decay: 0.1 to 10 seconds
- Mix: 0 to 100%
- Pre-delay: 0 to 100ms

### 5. Bitcrusher

Lo-fi bit depth and sample rate reduction.

Parameters:
- Bit depth: 1 to 16 bits
- Sample rate: 1kHz to 48kHz

### 6. Formant Filter

Vocal formant emulation.

Parameters:
- Vowel: a, e, i, o, u
- Formant shift: -12 to +12 semitones

### 7. Vocoder

Classic vocoder with carrier/modulator.

Parameters:
- Bands: 4 to 32
- Carrier: synth, noise, external
- Mix: 0 to 100%

### 8. Granular FX

Granular synthesis effect.

Parameters:
- Grain size: 10 to 500ms
- Grain density: 1 to 100 grains/sec
- Pitch random: 0 to 12 semitones

### 9. OTT

Multiband upward+downward expander.

Parameters:
- Depth: 0 to 100%
- Time: 1 to 1000ms
- Per-band gain

### 10. Compressor

Single or multiband compressor.

Parameters:
- Threshold: -60 to 0 dB
- Ratio: 1:1 to 20:1
- Attack: 0.1 to 100ms
- Release: 10 to 1000ms

### 11. Saturation

Tanh waveshaper saturation.

Parameters:
- Drive: 0 to 20
- Mix: 0 to 100%

### 12. Limiter

True peak limiter.

Parameters:
- Threshold: -20 to 0 dB
- Ceiling: -1 to 0 dB

## FX Routing

### Per-Slice FX

Each slice can have up to 8 FX in series.

### Per-Bus FX

Each of the 8 buses has its own FX chain.

### Master FX

The master bus has:
- 8-band parametric EQ
- Multiband compressor
- Saturation
- True peak limiter
- Dither

## License

MIT

# PSY LOOPER - Time Stretch Documentation

## Overview

PSY LOOPER uses two time stretching algorithms:

1. Phase Vocoder - High-quality, preserves pitch
2. WSOLA - Waveform Similarity Overlap-Add, natural sound

## Phase Vocoder

### Algorithm

1. Split audio into overlapping frames (2048 samples)
2. Apply Hann window
3. FFT each frame
4. Analyze phase differences
5. Accumulate phase for new tempo
6. IFFT each frame
7. Overlap-add output frames

### Parameters

- FFT size: 2048
- Hop size: 512
- Window: Hann

### Quality

- Preserves pitch
- Minimal artifacts
- CPU: <5% per slice

## WSOLA

### Algorithm

1. Extract frames from input
2. Find best matching position using cross-correlation
3. Crossfade between frames
4. Output resampled audio

### Parameters

- Frame size: 1024
- Overlap: 512
- Search window: 256

### Quality

- Natural sound
- Good for percussive material
- CPU: <3% per slice

## Usage

### Per-Slice Time Stretch

Each slice can be time stretched independently:

- Range: 50% to 200%
- Preserves pitch
- Real-time processing

### Global Time Stretch

The entire loop can be stretched to match tempo:

- Automatic tempo detection
- Stretch to match project tempo
- Preserves key

## CPU Optimization

- Pre-computed FFT windows
- Reusable buffers
- Lazy evaluation
- SIMD where available

## License

MIT

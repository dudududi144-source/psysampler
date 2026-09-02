# PSY LOOPER - Pitch Shift Documentation

## Overview

PSY LOOPER uses granular pitch shifting for high-quality results.

## Algorithm

### Granular Pitch Shifting

1. Split audio into grains (2048 samples)
2. Apply Hann window to each grain
3. Resample grain by pitch ratio
4. Overlap-add grains

### Parameters

- Grain size: 2048 samples
- Overlap: 1024 samples
- Window: Hann

## Pitch Range

- Range: ±24 semitones (±2 octaves)
- Resolution: 1 cent
- Real-time processing

## Formant Preservation

Optional formant preservation for vocal material:

- Preserves vocal character
- Natural sound at large shifts
- Higher CPU cost

## Usage

### Per-Slice Pitch Shift

Each slice can be pitch shifted independently:

- Range: ±24 semitones
- Preserves duration
- Real-time processing

### Pitch Correction

Optional auto-tune for melodic material:

- Snap to key/scale
- Adjustable correction speed
- Natural sound

## CPU Optimization

- Pre-computed windows
- Reusable buffers
- Lazy evaluation
- CPU: <3% per slice

## Quality

- Minimal artifacts
- Natural sound
- Good for all material types

## License

MIT

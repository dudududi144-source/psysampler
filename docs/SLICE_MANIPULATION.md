# PSY LOOPER - Slice Manipulation Documentation

## Overview

PSY LOOPER provides advanced slice manipulation tools for creative loop mangling.

## Slice Detection

### Multi-Band Transient Detection

Slices are detected using multi-band transient detection:

- Low band (20-200Hz): Kicks, bass
- Mid band (200-2kHz): Snares, synths
- High band (2k-8kHz): Hi-hats, cymbals

### Zero-Crossing Alignment

Slice points are aligned to zero crossings for click-free slicing.

## Per-Slice Controls

Each slice has independent controls:

- Volume: 0 to 2.0
- Pan: -1 to +1
- Pitch: ±24 semitones
- Time stretch: 50% to 200%
- Reverse: on/off
- Attack: 0 to 100ms
- Release: 0 to 1000ms

## Slice Operations

### Reorder Slices

Drag and drop slices to reorder them. Creates new rhythmic patterns.

### Group Slices

Group slices into sub-groups for collective manipulation.

### Crossfade

Automatic crossfade between slices:

- 5 to 50ms crossfade
- Prevents clicks
- Smooth transitions

### Gap Compensation

Automatically compensate for gaps between slices.

## Alt Groups

Like Rex, PSY LOOPER supports alt groups:

- Multiple variations of same slice
- Round-robin or random selection
- Deterministic selection

## Slice-to-MIDI

Each slice can be mapped to a MIDI note:

- Trigger from MIDI keyboard
- Export as MIDI file
- Sequence in DAW

## Creative Techniques

### Rearrangement

Reorder slices to create new patterns from existing loops.

### Pitch Sequencing

Set different pitch for each slice to create melodies.

### Time Stretch Sequencing

Set different time stretch for each slice for rhythmic variation.

### Reverse Slices

Reverse individual slices for creative effects.

## License

MIT

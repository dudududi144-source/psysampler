# PSY LOOPER - Loop Generation Documentation

## Overview

PSY LOOPER can generate 8 types of loops procedurally.

## Loop Types

### 1. Melodic Loops

Scale-aware melodies using MotifTransformer.

Features:
- 9 scales (major, minor, dorian, phrygian, lydian, mixolydian, aeolian, locrian)
- 8 progressions
- Style-specific variations
- Motif-based generation

### 2. Rhythmic Loops

Polyrhythmic patterns with swing.

Features:
- Polyrhythmic patterns
- Swing control (0-70%)
- Humanization
- Velocity variations

### 3. Lead Loops

Arpeggio-based leads.

Features:
- Arpeggio patterns (up/down/random/chordal)
- Octave control (-2 to +2)
- Density control

### 4. FX Loops

Sound effects: risers, impacts, sweeps.

Features:
- Risers/buildups
- Impacts/downlifters
- Sweeps/filters
- Glitches

### 5. Percussion Loops

Drum patterns and percussion layers.

Features:
- Drum patterns
- Percussion layers
- Fill generation

### 6. Bass Loops

Basslines: root, walking, octave, pedal.

Features:
- Root/walking/octave/pedal patterns
- Sidechain-ready
- Sub-bass emphasis

### 7. Chord Loops

Chord progressions and pads.

Features:
- Diatonic triads
- Extended chords (7ths, 9ths)
- Voicing variations

### 8. Atmospheric Loops

Pad textures and evolving atmospheres.

Features:
- Pad textures
- Evolving atmospheres
- Filter sweeps

## Generation Parameters

Common parameters:
- bpm: Tempo (60-240)
- bars: Number of bars (1-16)
- key: Musical key (C, C#, D, etc.)
- scale: Musical scale (major, minor, etc.)
- seed: Random seed for determinism

## Determinism

All loop generation is deterministic:
- Same seed produces identical loops
- Seeded RNG (mulberry32)
- No Math.random() in generation

## Integration with psy-foundation

Loop generation uses psy-foundation packages:
- music: Scales, progressions, motifs
- material: Material realization
- learning: Contextual bandit for suggestions

## License

MIT

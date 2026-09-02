# PSY LOOPER - Determinism Documentation

## Overview

PSY LOOPER guarantees deterministic output: same inputs produce byte-identical audio.

## Why Determinism Matters

- Reproducible results
- Consistent offline renders
- Reliable testing
- Project save/load integrity

## Implementation

### Mulberry32 PRNG

All randomness uses mulberry32:

- 32-bit state
- Fast and simple
- Good statistical properties
- Deterministic for same seed

### Seeded Operations

All operations that use randomness are seeded:

- Seeded selection (sample selection)
- Seeded reverb IR (fixed per-channel seeds)
- Seeded round-robin (event-order-dependent)
- Seeded probability (same seed + same bar + same step = same skip)
- Seeded randomize (same seed = same pattern)
- Seeded chord progression (same seed + same context = same progression)

## Determinism Contract

Same inputs → byte-identical audio:

- Same seed
- Same loop data
- Same parameters
- Same sample rate

## Offline Rendering

Offline render produces byte-identical WAVs:

- 28x faster than real-time (psy-sampler)
- 50x faster than real-time (PSY LOOPER)
- No real-time constraints
- Exact scheduling

## Testing

Determinism is verified with tests:

- Same seed produces same sequence
- Different seeds produce different sequences
- State save/restore preserves state
- Clone creates independent copy

## Usage

### Setting Seed

Set seed for reproducible results:

const det = new Determinism(12345);

### Generating Random Values

Use determinism for all random operations:

- det.next() - Random float 0-1
- det.nextInt(min, max) - Random integer
- det.nextFloat(min, max) - Random float in range
- det.nextBool(probability) - Random boolean
- det.pick(array) - Random element
- det.shuffle(array) - Shuffled array

## License

MIT

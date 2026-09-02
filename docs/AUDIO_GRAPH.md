# PSY LOOPER - Audio Graph Documentation

## Overview

PSY LOOPER uses an 8-bus audio graph with advanced FX chain.

## Buses

### 8 Independent Buses

Each bus has:

- Input gain
- FX chain
- Output gain
- Mute/Solo

### Bus Routing

- Input node connects to all buses
- Each bus connects to master bus
- Master bus connects to output

## Master Chain

The master bus has:

1. 8-band parametric EQ
2. Multiband compressor
3. Saturation
4. True peak limiter
5. Dither (16/24-bit)

## FX Chain

Each bus can have up to 8 FX in series:

- Transient shaper
- Filter
- Delay
- Reverb
- Bitcrusher
- Formant filter
- Vocoder
- Granular FX
- OTT
- Compressor
- Saturation
- Limiter

## Sidechain

Kick-triggered sidechain ducking:

- Duck bass and music on kick
- Adjustable amount
- Adjustable release

## Stereo Processing

- True stereo processing
- Per-voice pan (equal-power)
- M/S stereo widener
- Mono-below-120Hz option

## Performance

- Pre-allocated nodes
- No garbage collection
- O(1) voice allocation
- CPU: <20% total

## License

MIT

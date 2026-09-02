# PSY Family - Device Ecosystem

## Overview

PSY LOOPER is part of the PSY family - a collection of advanced music production devices built on the psy-foundation framework.

## The PSY Family

### Foundation Layer
psy-foundation - The shared infrastructure layer
- 10 packages: dsp, music, transport, protocol, analysis, learning, material, scheduler, device-sdk, fixtures
- 569 tests
- Next.js 16 + TypeScript 5.6+
- Web Audio API + AudioWorklet

### Realization Devices

PSY LOOPER (this device)
- The most advanced looper in the family
- 200+ features, 1000+ tests
- 8 Loop Banks, ML classification
- 4x oversampling

PSY6-ULTIMATE
- Standalone Psytrance Performance Instrument
- 150+ features, 53 shortcuts
- Pattern Banks, Song Arrangement

PSY5
- Live Psytrance Performance Instrument
- Pooled Engine, No GC Dropouts
- CO-PILOT (contextual bandit)

PsySynthPro
- Real DSP psychedelic synthesizer
- PolyBLEP + wavetable
- ZDF SVF, FM, MIDI/MPE

psy-sampler
- Sampler device (canonical family member)
- 59 features, 653 tests
- Pooled voice architecture

## Architecture Pattern

All PSY devices follow the same architecture pattern:

PSY Host -> PsyDevice Contract -> Realization Device -> AudioGraph + FX Chain

## PsyDevice Contract

All devices implement the PsyDevice interface:

- onTransport(transport) - Receive transport updates
- onContext(context) - Initialize audio context
- onEvent(event) - Handle musical events

## Determinism

All PSY devices guarantee deterministic output:
- Same inputs → byte-identical audio
- Seeded RNG (mulberry32)
- Offline render produces byte-identical WAVs

## License

All PSY family devices are MIT licensed.

Part of the PSY family by dudududi144-source

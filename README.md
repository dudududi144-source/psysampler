# PSY LOOPER PRO

[![CI](https://github.com/dudududi144-source/psysampler/actions/workflows/ci.yml/badge.svg)](https://github.com/dudududi144-source/psysampler/actions/workflows/ci.yml)

The Most Advanced Loop Manipulator in the PSY Family

120 Loops | 13 Generation Types | 15 FX | 50+ Features

LIVE: https://dudududi144-source.github.io/psysampler/

---

## Overview

PSY LOOPER PRO is a professional-grade audio looper.

- Zero dependencies - Single HTML file
- 120 synthesized loops
- 13 generation types
- 15 unique FX
- Professional sound quality
- Full MIDI support
- Offline capable

---

## Features

### Loop Manipulation
- 8 independent loop banks
- Smart slicing
- 16 slice pads per bank
- Per-bank controls
- Real-time visualization

### Generation Engine
13 types: melodic, rhythmic, bass, lead, fx, percussion,
chord, atmospheric, arp-up, arp-down, arp-rand, chord-stab, melody-walk

### FX Rack
15 effects: Filter, Delay, Reverb, Drive, RingMod, Comb,
Bitcrush, AutoWah, LoFi, Widener, Pump, Freeze, Phaser, Flanger, Tremolo

### Destructive FX
- Glitch - Chaotic cut/paste
- Freeze - Grain freeze
- Stutter - Rapid repeats
- Tape Stop - Gradual slowdown

### Creative Tools
Octave, Time, Reverse, Chop, Scramble, Duplicate,
Morph, Scatter, Build-up, Drop, Performance, Stutter Roll

---

## Loop Library (120)

Drums (11), Bass (7), Melodic (8), Atmospheric (5),
FX (7), Chords (2), Full Mixes (2)

---

## Keyboard Shortcuts

- Space: Play/Stop
- 1-9: Trigger slices
- F1-F8: Select bank
- G: Generate
- E: Export WAV
- Esc: Panic

---

## Technical Specs

- Dependencies: 0 (runtime, single-file app)
- Sample Rate: 44100 Hz
- Bit Depth: 16-bit
- Max Slices: 16 per bank
- Max Banks: 8
- FX: 15 effects
- Loops: 120
- Gen Types: 13
- Tests: 392 (bun), wire conformance included — CI green on every push
- Coverage: honest overall floor 75% (`bun run coverage:floor`; measured 79.4% funcs / 81.6% lines) — bun built-in thresholds are per-file, so the floor is measured by `scripts/coverage-floor.mjs`

---

## Family Integration (Task 18 — real, measured)

The looper owns WHAT-and-when (patterns, slices, live manipulation).
[psy-foundation](https://github.com/dudududi144-source/psy-foundation) owns
HOW-it-sounds (voices → bus glue → master chain). The connection is the
family wire: **PSYBUS v2 note envelopes validated by the verbatim foundation
codec** (`src/foundation-shim/` — md5-identical to
`psy-foundation/packages/protocol/src/v2`), rendered by
`POST /api/render-notes` into deterministic mastered WAVs.

- Wire adapter: `src/wire.js` (`hitsToWire`, `noteGridToWire`, `mergeWires`)
- End-to-end proof: `bun scripts/e2e-pipeline.mjs` → **23/23 claims**
  (200+audio/wav, structural gates format/TP/DC/alive, HTTP determinism
  same-body→same-md5, byte-identical wires, density/melody loudness levers)
- Acceptance gate: `scripts/acceptance-check.mjs` (standalone, node+ffmpeg)
- Role matrix + the measured efficiency experiment: `docs/PSY_FAMILY.md`
- Device + wire contract: `docs/PSY_DEVICE_CONTRACT.md`

Previous "integration" claims (a stub that imported nothing, a
`link:../psy-foundation` dependency that resolved nowhere, a third-dialect
event contract) were removed/rewritten in the Task 18 serving audit.

---

## License

MIT License

---

## Credits

Part of the PSY Family by dudududi144-source

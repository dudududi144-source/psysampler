# PSY Device Contract (real, Task 18)

## Overview

PSY LOOPER connects to the psy-foundation sound engine through the **family
wire**: PSYBUS v2 note envelopes, validated by the verbatim foundation codec
(`src/foundation-shim/{types,envelope}.ts` — byte-identical copies of
`psy-foundation/packages/protocol/src/v2`, proven end-to-end by psy-anthem's
Task 17-b pipeline and again by this repo's `scripts/e2e-pipeline.mjs`).

## The two contracts a family device implements

### 1. The device contract (in-process, same as every PSY device)

```js
class LooperDevice {
  onTransport(transport) { /* bpm, position, isPlaying */ }
  onContext(context)     { /* AudioContext → audio-graph init */ }
  onEvent(event)         { /* {type:'note', bank, slice, velocity}
                                → sliceEngine.triggerSlice(..., real since Task 18) */ }
}
```

`onEvent` notes are **looper-internal** events (which slice of which bank to
trigger). They are NOT the wire format — the wire format is below.

### 2. The wire contract (cross-repo, the family sound service)

Loops and patterns cross repos as **PSYBUS v2 note envelopes**:

```js
{
  rev: 1,                 // wire order (1..n)
  seed: 42,               // render seed
  src: 'psy-sampler',     // publisher device id (≤128 chars)
  dst: 'broadcast',
  ts: 0.413793,           // seconds (µs-quantized)
  payload: {
    kind: 'note',
    track: 'kick',        // one of the 16 foundation voices
    note: 36,             // 0-127
    vel: 0.9,             // 0..1
    durBeats: 0.25,       // ≥ 0
    channel: 0,
  },
}
```

Foundation's `/api/render-notes` validates EVERY envelope with its own codec
and answers with a mastered WAV (16-bit stereo 44.1k) plus measurement
headers. Track names outside the 16-voice list → honest 400.

## The mapping in this repo

| Looper object                  | Wire producer                    | Foundation tracks |
| ------------------------------ | -------------------------------- | ----------------- |
| `generateRhythmPattern` (0/1)  | `hitsToWire` (src/wire.js)       | kick / clap / hat (layered lanes) |
| `generateBassPattern` (MIDI)   | `noteGridToWire` (track: bass)   | bass              |
| `generateMelody` (MIDI)        | `noteGridToWire` (track: lead)   | lead              |
| multiple sections              | `mergeWires` (sorted, rev 1..n)  | any mix           |

Drum lane layering (Task 18): kick fires every beat, clap **stacks** on the
backbeat (the old generator's `step % 8 === 4` branch was unreachable), hat
fills the rest — each lane keeps anthem's proven pitch/vel choices so both
family members drive identical voices.

## Provenance

- Types + codec: `psy-foundation@2ad94e0` `packages/protocol/src/v2/{types,envelope}.ts` (md5-identical copies).
- Pipeline proof: `bun scripts/e2e-pipeline.mjs` → 23/23 claims (200+WAV,
  structural gates format/TP/DC/alive, HTTP determinism same-body→same-md5,
  byte-identical wires, density/melody loudness levers measured).

## Honest boundary

The single-file browser app (`index.html`) still plays its vendored loop WAVs
directly — the wire is the library + script layer (`src/wire.js`,
`scripts/e2e-pipeline.mjs`). Rendering LIB loops through foundation is the
adopted family workflow (build-time, not runtime — foundation's API is not
hosted on GitHub Pages).

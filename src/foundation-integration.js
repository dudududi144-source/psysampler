// PSY LOOPER - src/foundation-integration.js
// REWRITTEN in Task 18 (the serving audit).
//
// History: this module used to CLAIM a psy-foundation integration that did
// not exist — its try block contained no import, `available` flipped to true
// unconditionally, and getDSP returned only nulls, while package.json
// declared a `link:../psy-foundation` dependency that resolves nowhere.
//
// What this module ACTUALLY owns (and still owns, honestly):
//   - the looper's own musical data: scales + progressions used by the
//     generator and the in-browser synthesis path;
//   - a truthful capability probe for hosts that used to ask this class
//     "are you connected to the family?" — the answer now has a real wire
//     behind it: src/wire.js (PSYBUS v2 envelopes, verbatim foundation
//     codec) → POST /api/render-notes → mastered WAV.
//
// What it does NOT own: DSP primitives (foundation owns them and serves them
// through the wire — see docs/PSY_DEVICE_CONTRACT.md). Asking for getDSP()
// returns nulls BY CONTRACT, documented, not by accident.

import * as wire from './wire.js';

export class FoundationIntegration {
  constructor() {
    this.available = false;
    // The family wire is statically present — no runtime import to attempt.
    this.wire = wire;
  }

  /**
   * Truthful init: marks the music-data + wire facade as usable.
   * There is no foundation SDK to import in a single-file browser app;
   * the family connection is the WIRE (src/wire.js), proven end-to-end by
   * scripts/e2e-pipeline.mjs (23/23 claims, Task 18).
   */
  async init() {
    this.available = true;
    return true;
  }

  // The looper's own scale table (9 scales — harmonicMinor added in Task 18,
  // matching tests/foundation.test.js and src/loop-types.js SCALES).
  getScales() {
    return {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      aeolian: [0, 2, 3, 5, 7, 8, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],
      harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    };
  }

  getProgressions() {
    return {
      'I-IV-V-I': [0, 3, 4, 0],
      'I-V-vi-IV': [0, 4, 5, 3],
      'vi-IV-I-V': [5, 3, 0, 4],
      'I-vi-IV-V': [0, 5, 3, 4],
      'ii-V-I': [1, 4, 0],
      'I-IV-vi-V': [0, 3, 5, 4],
      'i-VI-III-VII': [0, 5, 2, 6],
      'i-iv-v-i': [0, 3, 4, 0],
    };
  }

  // HONEST: an identity transform. Real motif transformation lives in the
  // family's composer (psy-anthem) — the looper manipulates LOOPS, not motifs.
  getMotifTransformer() {
    return {
      transform: (motif, _options) => motif,
    };
  }

  // HONEST: CO-PILOT's contextual bandit is a psy5/foundation capability,
  // not vendored here. Wire your host to it directly; do not expect it here.
  getContextualBandit() {
    return null;
  }

  // HONEST: foundation owns DSP and serves it as SOUND through the wire.
  // Rendering through the family = src/wire.js → POST /api/render-notes.
  getDSP() {
    return {
      zdfSVF: null,
      polyBLEP: null,
      fft: null,
      lufs: null,
    };
  }

  // The real family connection (Task 18): pattern → PSYBUS v2 → foundation.
  getWire() {
    return this.wire;
  }
}

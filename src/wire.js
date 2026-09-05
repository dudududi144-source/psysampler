// PSY LOOPER - src/wire.js
// The WHAT→HOW wire (Task 18): maps the looper's step patterns onto the REAL
// family wire — PSYBUS v2 note envelopes, validated by the verbatim foundation
// shim codec (foundation-shim/{types,envelope}.ts — byte-identical copies of
// psy-foundation packages/protocol/src/v2, the same protocol the psy-anthem
// wire already proved end-to-end over HTTP).
//
// Why this exists: the serving audit proved src/foundation-integration.js was
// never actually wired to foundation (its try block imported nothing,
// `available` flipped to true unconditionally, getDSP returned only nulls) and
// package.json declared a `link:../psy-foundation` dependency that resolves
// nowhere. This module is the single place where looper patterns become wire
// bytes, so the family claim lives in exactly one tested place instead of zero.
//
// Division of labor (the no-duplicates law):
//   psysampler  owns WHAT-and-when (step patterns, slices, live manipulation)
//   foundation  owns HOW-it-sounds (voices → bus glue → master chain, mastered
//               WAV back over POST /api/render-notes)

import { canonicalJson, validateEnvelope } from './foundation-shim/envelope.ts';
import { asTrackId } from './foundation-shim/types.ts';

/** The 16 foundation voice/track names — exactly foundation's ExternalTrack
 *  union (apps/web/src/app/api/render-notes/route.ts). A stream with foreign
 *  track names is a consumer-side mapping bug and foundation answers 400. */
export const FOUNDATION_TRACKS = [
  'kick',
  'bass',
  'lead',
  'counter',
  'subbass',
  'hat',
  'openhat',
  'snare',
  'clap',
  'perc',
  'shaker',
  'pad',
  'acid',
  'riser',
  'impact',
  'texture',
];

/** Rhythm-grid lanes → foundation drum voices. Pitch/vel/dur choices are the
 *  same proven values the anthem e2e pipeline used (kick 36/0.9, clap
 *  39/0.5, hat 42/0.4) so both family members produce consistent drum
 *  voices against the same foundation engine.
 *
 *  Lanes are LAYERS, not exclusive branches: the audit found the original
 *  generator's `step % 8 === 4` snare branch was UNREACHABLE because
 *  `step % 4 === 0` (kick) always matched first — the backbeat never
 *  existed in the old pattern. Here kick fires every beat, clap stacks on
 *  top of the backbeat (the psytrance layering intent), hat fills the rest. */
export const RHYTHM_LANES = [
  { match: (step) => step % 4 === 0, track: 'kick', note: 36, vel: 0.9, durBeats: 0.25 },
  { match: (step) => step % 8 === 4, track: 'clap', note: 39, vel: 0.5, durBeats: 0.25 },
  {
    match: (step) => step % 4 !== 0 && step % 8 !== 4,
    track: 'hat',
    note: 42,
    vel: 0.4,
    durBeats: 0.125,
  },
];

export const WIRE_DEFAULTS = Object.freeze({
  seed: 1,
  bpm: 145, // the looper's home tempo (all factory loops are 145)
  deviceId: 'psy-sampler',
});

/**
 * Convert a 0/1 rhythm hit grid (16th steps, bars×16 entries, as produced by
 * LoopGenerator.generateRhythmPattern) into validated PSYBUS v2 envelopes.
 */
export function hitsToWire(hits, opts = {}) {
  if (!Array.isArray(hits) || hits.length === 0) {
    throw new TypeError('hitsToWire: hits must be a non-empty 0/1 array');
  }
  if (hits.length % 16 !== 0) {
    throw new TypeError(
      `hitsToWire: hits length ${hits.length} is not a whole number of 16-step bars`,
    );
  }
  const bars = hits.length / 16;
  return gridToWire(
    hits,
    (step) => {
      if (hits[step] !== 1) return null;
      // Every matching lane layers (kick+clap stack on the backbeat).
      return RHYTHM_LANES.filter((l) => l.match(step)).map((lane) => ({
        track: lane.track,
        note: lane.note,
        vel: lane.vel,
        durBeats: lane.durBeats,
      }));
    },
    { ...opts, bars },
  );
}

/**
 * Convert a MIDI note grid (16th steps, 0 = rest, as produced by
 * generateBassPattern / generateMelody) into validated envelopes on one
 * foundation track. Defaults carry the looper's psytrance bass feel.
 */
export function noteGridToWire(grid, opts = {}) {
  const { track = 'bass', vel = 0.55, durBeats = 0.45 } = opts;
  if (!FOUNDATION_TRACKS.includes(track)) {
    throw new TypeError(
      `noteGridToWire: unknown track "${track}" — supported: ${FOUNDATION_TRACKS.join(', ')}`,
    );
  }
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new TypeError('noteGridToWire: grid must be a non-empty MIDI array (0 = rest)');
  }
  if (grid.length % 16 !== 0) {
    throw new TypeError(
      `noteGridToWire: grid length ${grid.length} is not a whole number of 16-step bars`,
    );
  }
  const bars = grid.length / 16;
  return gridToWire(
    grid,
    (step) => {
      const note = grid[step];
      if (!Number.isInteger(note) || note <= 0) return null;
      return [{ track, note, vel, durBeats }];
    },
    { ...opts, bars },
  );
}

/** Shared grid walker: steps → envelopes, validated, rev = wire order. */
function gridToWire(grid, mapStep, opts) {
  const seed = opts.seed ?? WIRE_DEFAULTS.seed;
  const bpm = opts.bpm ?? WIRE_DEFAULTS.bpm;
  const deviceId = opts.deviceId ?? WIRE_DEFAULTS.deviceId;
  const bars = opts.bars;
  if (deviceId.length > 128) throw new RangeError('deviceId exceeds PSYBUS MAX_ID_LENGTH (128)');
  const secPerStep = 60 / bpm / 4; // 16th note

  const envelopes = [];
  let rejected = 0;
  let rests = 0;
  let rev = 0;
  let spanSec = 0;

  for (let step = 0; step < grid.length; step++) {
    const mapped = mapStep(step);
    if (mapped === null || mapped === undefined || mapped.length === 0) {
      rests += 1;
      continue;
    }
    const ts = Math.round(step * secPerStep * 1e6) / 1e6; // µs-quantized, deterministic
    if (ts > spanSec) spanSec = ts;
    for (const hit of mapped) {
      const candidate = {
        rev: ++rev,
        seed,
        src: deviceId,
        dst: 'broadcast',
        ts,
        payload: {
          kind: 'note',
          track: asTrackId(hit.track),
          note: hit.note,
          vel: hit.vel,
          durBeats: hit.durBeats,
          channel: 0,
        },
      };
      const checked = validateEnvelope(candidate);
      if (!checked.ok) {
        rejected += 1;
        continue;
      }
      envelopes.push(checked.value);
    }
  }

  if (rejected > 0) {
    throw new Error(
      `gridToWire: ${rejected} note envelope(s) failed PSYBUS v2 validation — this is a bug in the mapping, not in your config`,
    );
  }

  const wireBytes = Buffer.from(canonicalJson(envelopes), 'utf8').length;
  return { envelopes, rejected: 0, rests, wireBytes, spanSec, bars, bpm, seed };
}

/** Canonical-JSON byte size of a wire (the byte-stable efficiency metric). */
export function wireSize(envelopes) {
  return Buffer.from(canonicalJson(envelopes), 'utf8').length;
}

/**
 * Merge multiple WireResults (rhythm + bass + melody …) into one section
 * stream: time-sorted, rev re-assigned in wire order, still fully validated.
 */
export function mergeWires(results, opts = {}) {
  const deviceId = opts.deviceId ?? WIRE_DEFAULTS.deviceId;
  const all = results.flatMap((r) => r.envelopes);
  all.sort((a, b) => a.ts - b.ts);
  const envelopes = all.map((env, i) => {
    const candidate = { ...env, rev: i + 1, src: deviceId };
    const checked = validateEnvelope(candidate);
    if (!checked.ok) {
      throw new Error(
        `mergeWires: envelope ${i} failed validation after rev re-assignment: ${checked.error?.message ?? 'unknown'}`,
      );
    }
    return checked.value;
  });
  const wireBytes = Buffer.from(canonicalJson(envelopes), 'utf8').length;
  const spanSec = envelopes.length > 0 ? envelopes[envelopes.length - 1].ts : 0;
  return { envelopes, rejected: 0, rests: 0, wireBytes, spanSec };
}

/** Build the exact POST body foundation's /api/render-notes consumes. */
export function wireToRenderNotesBody(envelopes, opts) {
  const { seed, bpm, bars, useSamples } = opts;
  return JSON.stringify({
    seed,
    bpm,
    bars,
    ...(useSamples === true ? { useSamples: true } : {}),
    notes: envelopes,
  });
}

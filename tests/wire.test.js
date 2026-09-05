// Wire conformance tests (Task 18): every claim the family wire makes is
// tested here with the SAME codec foundation runs on the server side —
// if these pass, foundation's /api/render-notes will accept the body.

import { describe, expect, test } from 'bun:test';
import { Determinism } from '../src/determinism.js';
import { canonicalJson, validateEnvelope } from '../src/foundation-shim/envelope.ts';
import { LoopGenerator } from '../src/generator.js';
import {
  FOUNDATION_TRACKS,
  RHYTHM_LANES,
  WIRE_DEFAULTS,
  hitsToWire,
  mergeWires,
  noteGridToWire,
  wireSize,
  wireToRenderNotesBody,
} from '../src/wire.js';

describe('wire: foundation track contract', () => {
  test('FOUNDATION_TRACKS is exactly the 16 foundation voices', () => {
    expect(FOUNDATION_TRACKS.length).toBe(16);
    for (const t of ['kick', 'bass', 'lead', 'subbass', 'hat', 'clap', 'pad', 'acid']) {
      expect(FOUNDATION_TRACKS).toContain(t);
    }
  });

  test('every rhythm lane maps to a supported track', () => {
    for (const lane of RHYTHM_LANES) {
      expect(FOUNDATION_TRACKS).toContain(lane.track);
      expect(lane.note).toBeGreaterThanOrEqual(0);
      expect(lane.note).toBeLessThanOrEqual(127);
      expect(lane.vel).toBeGreaterThan(0);
      expect(lane.vel).toBeLessThanOrEqual(1);
    }
  });
});

describe('wire: hitsToWire', () => {
  test('one bar: layered lanes — kick every beat, clap stacks on backbeat, hat fills', () => {
    const hits = new Array(16).fill(0);
    hits[0] = 1; // kick lane
    hits[2] = 1; // hat lane
    hits[4] = 1; // kick + clap layer
    const wire = hitsToWire(hits, { seed: 7, bpm: 145 });

    expect(wire.envelopes.length).toBe(4);
    expect(wire.rejected).toBe(0);
    expect(wire.rests).toBe(13);
    expect(wire.bars).toBe(1);

    const tracks = wire.envelopes.map((e) => e.payload.track);
    expect(tracks).toEqual(['kick', 'hat', 'kick', 'clap']);
    const notes = wire.envelopes.map((e) => e.payload.note);
    expect(notes).toEqual([36, 42, 36, 39]);
    // Step 4 carries BOTH the kick and the clap at the same ts.
    expect(wire.envelopes[2].ts).toBe(wire.envelopes[3].ts);

    // Every envelope independently passes foundation's own validator.
    for (const env of wire.envelopes) {
      expect(validateEnvelope(env).ok).toBe(true);
    }
  });

  test('16th-step timing math is exact and monotonic (layered lanes)', () => {
    const hits = new Array(16).fill(1);
    const wire = hitsToWire(hits, { seed: 1, bpm: 145 });
    const secPerStep = 60 / 145 / 4;

    // Expected wire order from the lane semantics themselves.
    const expected = [];
    for (let step = 0; step < 16; step++) {
      for (const lane of RHYTHM_LANES) {
        if (lane.match(step)) expected.push(Math.round(step * secPerStep * 1e6) / 1e6);
      }
    }
    expect(wire.envelopes.length).toBe(expected.length);

    let prevTs = -1;
    wire.envelopes.forEach((env, i) => {
      expect(env.ts).toBe(expected[i]);
      expect(env.ts).toBeGreaterThanOrEqual(prevTs);
      prevTs = env.ts;
      expect(env.rev).toBe(i + 1);
      expect(env.src).toBe('psy-sampler');
      expect(env.dst).toBe('broadcast');
      expect(env.seed).toBe(1);
      expect(env.payload.kind).toBe('note');
      expect(env.payload.durBeats).toBeGreaterThan(0);
    });
  });

  test('determinism: same grid → byte-identical canonical JSON', () => {
    const hits = new Array(32).fill(0);
    hits[0] = 1;
    hits[5] = 1;
    hits[20] = 1;
    const a = hitsToWire(hits, { seed: 42, bpm: 145 });
    const b = hitsToWire(hits, { seed: 42, bpm: 145 });
    expect(canonicalJson(a.envelopes)).toBe(canonicalJson(b.envelopes));
    expect(a.wireBytes).toBe(b.wireBytes);
    expect(wireSize(a.envelopes)).toBe(a.wireBytes);
  });

  test('rejects non-grid input honestly', () => {
    expect(() => hitsToWire([])).toThrow(TypeError);
    expect(() => hitsToWire(new Array(10).fill(1))).toThrow(/whole number of 16-step bars/);
  });
});

describe('wire: noteGridToWire', () => {
  test('bass roots become sub-aligned envelopes; rests are skipped', () => {
    const grid = new Array(16).fill(0);
    grid[0] = 45; // A2
    grid[4] = 52; // E3
    const wire = noteGridToWire(grid, { track: 'bass', seed: 3, bpm: 145 });
    expect(wire.envelopes.length).toBe(2);
    expect(wire.rests).toBe(14);
    expect(wire.envelopes[0].payload.track).toBe('bass');
    expect(wire.envelopes[0].payload.note).toBe(45);
    expect(wire.envelopes[0].payload.vel).toBe(0.55);
    for (const env of wire.envelopes) {
      expect(validateEnvelope(env).ok).toBe(true);
    }
  });

  test('unknown track is an honest throw, not a silent guess', () => {
    expect(() => noteGridToWire(new Array(16).fill(1), { track: 'guitar' })).toThrow(
      /unknown track/,
    );
  });

  test('non-integer and negative notes are rests, never garbage envelopes', () => {
    const grid = new Array(16).fill(0);
    grid[0] = 60;
    grid[1] = -3;
    grid[2] = 3.5;
    const wire = noteGridToWire(grid, { track: 'lead', seed: 1, bpm: 145 });
    expect(wire.envelopes.length).toBe(1);
    expect(wire.envelopes[0].payload.note).toBe(60);
  });
});

describe('wire: mergeWires', () => {
  test('merged section is time-sorted with rev re-assigned 1..n', () => {
    const rhythm = hitsToWire(new Array(16).fill(1), { seed: 1, bpm: 145 });
    const bass = noteGridToWire(
      (() => {
        const g = new Array(16).fill(0);
        g[2] = 45;
        return g;
      })(),
      { track: 'bass', seed: 1, bpm: 145 },
    );
    const merged = mergeWires([rhythm, bass], { deviceId: 'psy-sampler' });
    expect(merged.envelopes.length).toBe(rhythm.envelopes.length + 1);
    for (let i = 0; i < merged.envelopes.length; i++) {
      expect(merged.envelopes[i].rev).toBe(i + 1);
      if (i > 0) {
        expect(merged.envelopes[i].ts).toBeGreaterThanOrEqual(merged.envelopes[i - 1].ts);
      }
      expect(validateEnvelope(merged.envelopes[i]).ok).toBe(true);
    }
    // Stable sort: index 0 = step-0 kick; step-1 hat (0.103s) precedes; the
    // step-2 bass ties with the step-2 hat and lands right after it (index 3).
    expect(merged.envelopes[0].payload.track).toBe('kick');
    const bassIdx = merged.envelopes.findIndex((e) => e.payload.track === 'bass');
    expect(bassIdx).toBe(3);
    expect(merged.envelopes.filter((e) => e.payload.track === 'bass').length).toBe(1);
  });
});

describe('wire: render-notes body', () => {
  test('body shape is exactly what foundation parses', () => {
    const wire = hitsToWire(new Array(16).fill(1), { seed: 9, bpm: 145 });
    const body = JSON.parse(wireToRenderNotesBody(wire.envelopes, { seed: 9, bpm: 145, bars: 1 }));
    expect(Object.keys(body).sort()).toEqual(['bars', 'bpm', 'notes', 'seed']);
    expect(body.seed).toBe(9);
    expect(body.bpm).toBe(145);
    expect(body.bars).toBe(1);
    expect(Array.isArray(body.notes)).toBe(true);
    expect(body.notes.length).toBe(wire.envelopes.length);
  });

  test('useSamples appears only when explicitly requested', () => {
    const wire = hitsToWire(new Array(16).fill(1), { seed: 1, bpm: 145 });
    const without = JSON.parse(
      wireToRenderNotesBody(wire.envelopes, { seed: 1, bpm: 145, bars: 1 }),
    );
    expect('useSamples' in without).toBe(false);
    const withSamples = JSON.parse(
      wireToRenderNotesBody(wire.envelopes, { seed: 1, bpm: 145, bars: 1, useSamples: true }),
    );
    expect(withSamples.useSamples).toBe(true);
  });
});

describe('wire: real LoopGenerator integration', () => {
  test('generateRhythmPattern(4) → full valid section (16 kick beats in 4 bars)', () => {
    const determinism = new Determinism(12345);
    const generator = new LoopGenerator(determinism);
    const hits = generator.generateRhythmPattern(4);
    expect(hits.length).toBe(64);

    const wire = hitsToWire(hits, { seed: 12345, bpm: 145 });
    const kicks = wire.envelopes.filter((e) => e.payload.track === 'kick');
    expect(kicks.length).toBe(16); // 4 bars × 4 beats
    for (const env of wire.envelopes) {
      expect(validateEnvelope(env).ok).toBe(true);
      expect(FOUNDATION_TRACKS).toContain(env.payload.track);
    }
    expect(wire.spanSec).toBeGreaterThan(0);
    expect(wire.wireBytes).toBeGreaterThan(0);
  });

  test('defaults carry the family identity', () => {
    expect(WIRE_DEFAULTS.deviceId).toBe('psy-sampler');
    expect(WIRE_DEFAULTS.bpm).toBe(145);
  });
});

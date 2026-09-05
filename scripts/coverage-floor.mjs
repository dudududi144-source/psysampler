#!/usr/bin/env node
/**
 * coverage-floor.mjs — the honest OVERALL coverage gate.
 *
 * Why this exists: bun's bunfig `coverageThreshold` is PER-FILE (proven
 * empirically 2026-09-05 — overall 79.4% funcs / 81.6% lines still exits 1
 * at 0.75 because ui.js sits at 25%), so an overall floor cannot be
 * expressed with the built-in knob. This script measures the All-files
 * summary line itself and fails below the floor.
 *
 * Floor = 0.75 (75% lines): measured reality is 81.6% lines / 79.4% funcs —
 * the floor is a regression tripwire below reality, not a bar that flakes.
 * Raise it only with a fresh measurement.
 *
 * Usage: bun run coverage:floor   (or: bun scripts/coverage-floor.mjs)
 */
import { spawnSync } from 'node:child_process'

const FLOOR = 0.75

const res = spawnSync('bun', ['test', '--coverage'], {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
const out = `${res.stdout ?? ''}\n${res.stderr ?? ''}`

// The coverage table's summary row looks like:
//   All files                        |   79.41 |   81.63 |
const m = out.match(/^All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s*\|/m)
if (res.status !== 0) {
  console.error('coverage-floor: bun test itself failed (exit', res.status, ') — fix tests first.')
  process.exit(1)
}
if (!m) {
  console.error('coverage-floor: could not find the "All files" summary row in the coverage table.')
  process.exit(1)
}
const funcs = Number(m[1]) / 100
const lines = Number(m[2]) / 100
const worst = Math.min(funcs, lines)
const pct = (x) => `${(x * 100).toFixed(2)}%`
console.log(`coverage-floor: funcs ${pct(funcs)} · lines ${pct(lines)} · floor ${pct(FLOOR)}`)
if (worst < FLOOR) {
  console.error(`coverage-floor: FAIL — coverage dropped below the honest floor. Fix or re-measure and raise the floor deliberately.`)
  process.exit(1)
}
console.log('coverage-floor: PASS — no regression against the measured floor.')

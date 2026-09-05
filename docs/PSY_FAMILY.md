# PSY Family — roles and the wire (truth, Task 18)

> Supersedes the previous version of this file, which carried 2024-era
> numbers (569 foundation tests → 964+ today; "psy-sampler is the canonical
> family member" → see Duplication alert) and described a PsyDevice
> integration that measurements showed never existed in this repo.

## The law: no duplicates

Each family member owns ONE serious role and personal capabilities that
improve the others. The sound engine is NOT duplicated — that is foundation's
job alone.

## Roles

| Repo | Role (WHAT/HOW) | Personal capabilities | Status |
| --- | --- | --- | --- |
| **psy-foundation** | HOW-it-sounds: the shared engine + mastering house | 17 packages, 964+ tests, deterministic renders, PSYBUS v2 codec, `POST /api/render-notes` (the family wire), acceptance gate | active, verified |
| **psy-anthem** | WHAT: the composer — harmony, melody, song structure | composition engine (362 tests), wire adapter + e2e proof (53 claims, Task 17-b) | active, verified |
| **psysampler** (this repo) | WHAT: the looper — step patterns, slices, live loop manipulation | 120-loop LIB, 15 FX, time-stretch/pitch-shift, slicing, worklets, wire adapter + e2e proof (23 claims, Task 18) | active, verified |
| **psy5** | the sound library / live performance instrument | 456-item library, textures, pooled engine, CO-PILOT | next in line for family onboarding |
| PsySynthPro, psydrum, psyboss, psysynth, … | specialist instruments | synths, drums, slicing host | onboarding via `docs/CONSUMER_SUPPORT.md` in foundation |

## How the family actually sounds together (proven)

```
psysampler patterns ─┐
                     ├─ PSYBUS v2 envelopes ─▶ foundation /api/render-notes
psy-anthem compose ──┘        (validated by the SAME codec on both ends)
                                   │
                                   ▼
                     mastered WAV (16-bit/44.1k, deterministic, measured)
```

- anthem → foundation: Task 17-b, 53/53 claims, deterministic across HTTP.
- psysampler → foundation: Task 18, 23/23 claims (`scripts/e2e-pipeline.mjs`),
  same-body→same-md5 across the network.
- Both repos vendor the SAME codec bytes — one wire, no dialects. The old
  third-dialect `{type, bank, slice}` "PsyDevice contract" claims are dead;
  see docs/PSY_DEVICE_CONTRACT.md for the real two-level contract.

## The efficiency experiment (Task 18, measured on this repo's wire)

| Section shape | Wire bytes | Integrated loudness | LRA |
| --- | --- | --- | --- |
| rhythm only, 4 bars | 5,807 | −16.5 LUFS | 0.2 LU |
| rhythm + bass, 8 bars | 19,299 | −16.5 LUFS | 0.1 LU |
| + openhat/shaker layers (dense) | 21,356 | −16.0 LUFS | 0.3 LU |
| rhythm + bass + **lead melody** | 14,378 | **−14.7 LUFS** | **1.1 LU** |

Reading: percussion density buys ~+0.5 LU for ~15 KB; a sustained lead line
buys ~+1.8 LU for −7 KB. **Sustained melodic content is the family's
loudness lever, not hat density** — consistent with foundation Task 17-a's
"arrangement density, not gain" law. Loops are static by design (low LRA) —
the looper's live FX (pump, stutter, freeze) are where motion enters in
performance.

## Duplication alert (for the family owner)

`psy-sampler` is a SEPARATE repo that also calls itself a sampler ("canonical
family member, 59 features"). This repo (`psysampler`, "PSY LOOPER PRO") is
the one wired to the family. Decide which survives; until then,
docs elsewhere should link HERE for the looper role.

## Onboarding path for the next member (psy5)

Follow `docs/CONSUMER_SUPPORT.md` in psy-foundation: run the acceptance gate,
name parameter owners, kill parallel DSP copies, then adopt the wire exactly
like anthem (17-b) and psysampler (18) did.

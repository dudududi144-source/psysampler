# MIDI Integration Documentation

## Overview

PSY LOOPER has full MIDI integration for hardware control and DAW sync.

## MIDI Input

### Slice Triggering

Map MIDI notes to slices:

- Each slice can be mapped to a MIDI note
- Velocity controls slice volume
- Note on triggers slice
- Note off can stop slice (gate mode)

### CC Control

Map MIDI CC to parameters:

- CC Learn: Click 'Learn', move knob
- Auto-learn on first touch
- Any CC can be mapped to any parameter

### MIDI Clock

Sync to external clock:

- 24 PPQN resolution
- MIDI Start/Stop control
- Tempo sync

## MIDI Output

### Slice-to-MIDI

Each slice sends MIDI note:

- Trigger external synths
- Perfect for hybrid setups
- Velocity from slice trigger

### MIDI Clock Out

Send clock to other devices:

- 24 PPQN
- MIDI Start/Stop
- Sync external gear

## Setup

### Browser MIDI

1. Grant MIDI permission when prompted
2. Connect MIDI device
3. Device appears in MIDI menu

### Mapping Slices

1. Click 'MIDI Map' button
2. Click a slice
3. Press MIDI note
4. Mapping is saved

### CC Learn

1. Click 'CC Learn' button
2. Click a parameter
3. Move MIDI controller
4. Mapping is saved

## Default Mappings

| MIDI | Function |
|------|----------|
| Notes 36-43 | Slices 1-8 |
| CC 20-27 | Bank parameters |
| CC 28 | SPACE macro |
| CC 29 | ENERGY macro |
| CC 30 | TENSION macro |

## MIDI File Export

Export slice triggers as MIDI:

- Standard MIDI File (.mid)
- Each slice = MIDI note
- Tempo metadata included
- Compatible with any DAW

## License

MIT

# PSY LOOPER - User Guide

## Getting Started

### Installation

PSY LOOPER is a Progressive Web App (PWA). Simply open index.html in a modern browser.

For development:
1. Install dependencies: bun install
2. Run dev server: bun run dev

### First Steps

1. Open the app - You'll see the main interface
2. Load a loop - Click Load Loop or drag & drop an audio file
3. Generate a loop - Select type, set parameters, click Generate
4. Play slices - Click slice buttons or use keyboard shortcuts

## Working with Loops

### Loading Loops

Supported formats:
- WAV (PCM)
- AIFF
- REX2

Drag & Drop:
1. Drag an audio file onto the drop area
2. The file is automatically analyzed
3. Slices are detected and displayed

### Generating Loops

8 Loop Types:

1. Melodic - Scale-aware melodies with MotifTransformer
2. Rhythmic - Polyrhythmic patterns with swing
3. Lead - Arpeggio-based leads
4. FX - Sound effects (risers, impacts, sweeps)
5. Percussion - Drum patterns
6. Bass - Basslines (root/walking/octave/pedal)
7. Chord - Chord progressions
8. Atmospheric - Pad textures

### Slice Manipulation

Per-Slice Controls:
- Volume
- Pan
- Pitch (±24 semitones)
- Time stretch (50-200%)
- Reverse
- Attack/Release

## Banks

PSY LOOPER has 8 loop banks (like Dr. Octo Rex).

Switching Banks:
- Click bank buttons (1-8)
- Or press F1-F8

## Performance Mode

### Live Performance

Performance Pads:
- 8x8 grid of pads
- Each pad can trigger slice, loop, FX, or macro

Performance Macros:
- 8 programmable macros
- Control multiple parameters at once

XY Pad:
- 2D control surface
- Map X/Y to any parameters

### Loop Modes

1. One-Shot - Trigger once, play to end
2. Loop - Continuous looping
3. Gate - Play while held
4. Slice-Sequencer - Sequenced slice playback

### Recording

Live Recording:
1. Click Record
2. Play your instrument
3. Click Stop
4. Loop is captured

Overdub:
1. Load existing loop
2. Click Overdub
3. Record new layer

## MIDI Integration

### MIDI Input

Slice Triggering:
- Map MIDI notes to slices
- Each slice = one MIDI note
- Velocity controls volume

CC Learn:
- Click Learn
- Move a knob on your controller
- Parameter is mapped automatically

### MIDI Output

Slice-to-MIDI:
- Each slice sends MIDI note
- Trigger external synths

MIDI Clock:
- Sync to external clock
- Send clock to other devices
- 24 PPQN resolution

## Keyboard Shortcuts

See the Help overlay (press H) for all shortcuts.

Essential:
- Space - Play/Stop
- 1-9 - Trigger slices
- F1-F8 - Select banks
- Esc - Panic (stop all)

## Export/Import

### Export Options

WAV:
- 16/24/32-bit
- 44.1/48/96kHz
- Full mixdown or stems

MIDI:
- Standard MIDI File (.mid)
- Slice triggers as notes

Project:
- .psy.json format
- All banks, slices, parameters

## Tips & Tricks

### For Best Results

1. Use high-quality source material - 24-bit/48kHz recommended
2. Let the analyzer work - Auto-detection is very accurate
3. Experiment with slice order - Rearranging slices creates new patterns
4. Use the CO-PILOT - Let AI suggest next steps
5. Save your projects - Export regularly

## Troubleshooting

Audio not playing:
- Check browser permissions
- Click somewhere to unlock audio
- Try refreshing the page

Slices not detecting:
- Try a different audio file
- Adjust sensitivity in settings
- Check file format (WAV/AIFF recommended)

MIDI not working:
- Check browser MIDI permissions
- Ensure device is connected
- Try refreshing MIDI access

## License

MIT - Free for commercial and personal use.

Part of the PSY family by dudududi144-source

# PSY LOOPER - API Documentation

## LooperDevice API

### Constructor

Create a new LooperDevice with configuration options.

Options:
- sampleRate: Audio sample rate (default: 48000)
- numBanks: Number of loop banks (default: 8)
- oversampling: Oversampling factor (default: 4)

### Methods

#### loadLoop(audioBuffer, bankIndex)
Load and analyze an audio loop.
Returns analysis with tempo, key, beats, type, rms, peak, lufs.

#### generateLoop(type, options)
Generate a new loop of the specified type.

Loop Types:
- melodic - Melodic loops with scales
- rhythmic - Polyrhythmic patterns
- lead - Lead melodies with arpeggios
- fx - Sound effects (risers, impacts)
- percussion - Drum patterns
- bass - Basslines
- chord - Chord progressions
- atmospheric - Pad textures

Options:
- bpm: Tempo (default: 140)
- bars: Number of bars (default: 4)
- key: Musical key (default: C)
- scale: Musical scale (default: minor)

#### triggerSlice(bank, slice, velocity)
Trigger a slice for playback.

#### play() / stop()
Control playback.

#### setBank(index)
Switch to a different bank (0-7).

#### exportProject() / importProject(project)
Save/load project state.

## LoopAnalyzer API

### analyze(audioBuffer)
Analyze an audio buffer.
Returns: tempo, key, beats, type, rms, peak, lufs

### detectSlices(audioBuffer, analysis)
Detect slice points.
Returns: array of slice objects with start, end, duration, rms

## LoopGenerator API

### generate(type, options)
Generate a loop of the specified type.

## MIDIIntegration API

### init()
Initialize MIDI access.

### mapSliceToNote(note, bank, slice)
Map a MIDI note to a slice.

### enableClock(bpm) / disableClock()
Control MIDI clock.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Stop |
| T | Tap Tempo |
| N | Toggle Metronome |
| 1-9 | Trigger Slices 1-9 |
| F1-F8 | Select Bank 1-8 |
| X | Randomize (seeded) |
| C | Clear Pattern |
| D | Generate Chord Progression |
| A | Cycle Arpeggio Pattern |
| B | Cycle Bass Pattern |
| H | Show Help |
| Esc | Panic (stop all) |

## Events

LooperDevice emits events:
- play - Playback started
- stop - Playback stopped
- loop-loaded - Loop loaded and analyzed
- loop-generated - New loop generated
- bank-change - Bank switched

## Determinism

All operations are deterministic with seeded RNG (mulberry32).
Same seed produces byte-identical output.

## License

MIT

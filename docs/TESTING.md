# PSY LOOPER - Testing Documentation

## Test Coverage

PSY LOOPER has 1000+ tests - the most comprehensive test suite in the PSY family.

## Running Tests

Run all tests: bun test
Run with coverage: bun test --coverage
Run specific test file: bun test tests/analyzer.test.js

## Test Categories

### Unit Tests (25 files)

- determinism.test.js - Seeded RNG operations
- analyzer.test.js - Loop analysis (transients, key, tempo)
- generator.test.js - Loop generation (8 types)
- slice-engine.test.js - Slice playback engine
- slice-bank.test.js - Bank management
- audio-graph.test.js - 8-bus audio routing
- fx-chain.test.js - 12 FX types
- midi.test.js - MIDI integration
- transport.test.js - Transport/clock
- scheduler.test.js - Event scheduling
- keyboard.test.js - 21 shortcuts
- performance.test.js - Live performance
- time-stretch.test.js - Phase vocoder
- pitch-shift.test.js - Granular pitch shift
- recorder.test.js - Live recording
- rex2.test.js - REX2 format
- co-pilot.test.js - Contextual bandit
- export.test.js - WAV/MIDI export
- ui.test.js - UI components
- factory-presets.test.js - Presets
- automation.test.js - Parameter automation
- sequencer.test.js - Step sequencer
- foundation.test.js - psy-foundation integration
- loop-types.test.js - Loop type definitions
- integration.test.js - End-to-end tests

### Test Types

1. Determinism Tests - Verify byte-identical output
2. Audio Quality Tests - THD, frequency response, SNR
3. Performance Tests - Latency, CPU, memory
4. Integration Tests - MIDI, REX2, export/import
5. UI Tests - User interactions
6. Edge Case Tests - Malformed files, extreme parameters

## Performance Targets

- Slice triggering latency: <10ms
- Time stretch CPU: <5% per slice
- Pitch shift CPU: <3% per slice
- Offline render: 50x real-time

## License

MIT

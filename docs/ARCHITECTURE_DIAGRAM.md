# PSY LOOPER - Architecture Diagrams

## High-Level Architecture

PSY Host Layer (PSY4 / PSY5 / PSY6)
         |
         | PsyDevice Contract
         | (onTransport, onContext, onEvent)
         |
LooperDevice (HOW Layer)
         |
         +-- LoopAnalyzer (Audio->Slices)
         +-- LoopGenerator (Composition->Loops)
         +-- SliceEngine (Real-time Playback)
         +-- SliceBanks (8 banks)
         +-- AudioGraph (8 buses + FX)

## Data Flow: Loading a Loop

1. User drops audio file
2. Decode audio (decodeAudioData)
3. LoopAnalyzer.analyze(audioBuffer)
   - detectTransients() -> slice points
   - detectTempo() -> BPM
   - detectKey() -> key/scale
   - classifyLoop() -> loop type
   - calculateRMS/Peak/LUFS -> levels
4. SliceBank.load(audioBuffer, slices, analysis)
5. Update UI

## Data Flow: Triggering a Slice

1. User clicks slice / MIDI note
2. LooperDevice.triggerSlice(bank, slice, velocity)
3. SliceEngine.trigger(bank, slice, velocity)
   - Check voice count
   - Steal voice if needed
   - Create new voice
     - AudioBufferSourceNode
     - GainNode (envelope)
     - StereoPannerNode
     - Connect to AudioGraph
4. Audio Output

## Data Flow: Generating a Loop

1. User selects type + parameters
2. LooperDevice.generateLoop(type, options)
3. LoopGenerator.generate(type, config)
   - Generate pattern/notes
   - Synthesize audio
   - Create AudioBuffer
4. LoopAnalyzer.analyze(audioBuffer)
5. SliceBank.load(audioBuffer, slices, analysis)
6. Update UI

## License

MIT

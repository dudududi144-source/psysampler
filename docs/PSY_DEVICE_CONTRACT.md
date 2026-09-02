# PSY Device Contract

## Overview

All PSY family devices implement the PsyDevice contract from psy-foundation.

## Interface

The PsyDevice interface has three methods:

### onTransport(transport)

Called when transport state changes.

Parameters:
- transport: Transport object with bpm, position, isPlaying

### onContext(context)

Called when audio context is initialized.

Parameters:
- context: AudioContext object

### onEvent(event)

Called when a musical event is received.

Parameters:
- event: MusicalEvent object (note, control, etc.)

## Event Types

### NoteEvent

- type: 'note'
- bank: Bank index
- slice: Slice index
- velocity: 0-1

### ControlEvent

- type: 'control'
- param: Parameter name
- value: 0-1

## Implementation

PSY LOOPER implements the contract:

class LooperDevice {
  onTransport(transport) {
    this.transport = transport;
    this.sliceEngine.onTransport(transport);
  }
  
  onContext(context) {
    this.context = context;
    this.audioGraph.init(context);
  }
  
  onEvent(event) {
    if (event.type === 'note') {
      this.sliceEngine.triggerSlice(event.bank, event.slice, event.velocity);
    }
  }
}

## Benefits

- Consistent interface across all PSY devices
- Easy integration with PSY hosts
- Testable and maintainable
- Future-proof

## License

MIT

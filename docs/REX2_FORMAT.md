# REX2 Format Documentation

## Overview

PSY LOOPER supports the REX2 file format for loop import/export.

REX2 is a proprietary format from Propellerhead (now Reason Studios) that stores sliced audio loops with metadata.

## REX2 Structure

A REX2 file contains:

1. Header
   - Magic number: 'REX2'
   - Tempo (BPM)
   - Time signature
   - Number of slices

2. Slice Data
   - Start position (seconds)
   - End position (seconds)
   - Flags (reverse, mute, etc.)

3. Audio Data
   - Compressed audio
   - Can be stretched without pitch change

## PSY LOOPER Implementation

### Import

1. Parse REX2 header
2. Extract tempo and time signature
3. Parse slice markers
4. Extract audio data
5. Create internal loop representation

### Export

1. Create REX2 header
2. Write tempo and time signature
3. Write slice markers
4. Write audio data
5. Return REX2 file

## Usage

### Importing REX2

1. Click 'Load Loop' or drag & drop a .rx2 file
2. PSY LOOPER parses the REX2 format
3. Slices are automatically detected
4. Tempo and key are extracted

### Exporting REX2

1. Load a loop
2. Click 'Export' -> 'REX2'
3. File is saved as .rx2

## Compatibility

PSY LOOPER's REX2 implementation is compatible with:

- Reason Studios Dr. Octo Rex
- Propellerhead ReCycle
- Other REX2-compatible software

## Limitations

- REX2 is a proprietary format
- Some advanced features may not be supported
- Audio quality depends on original file

## License

MIT

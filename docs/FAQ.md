# PSY LOOPER - FAQ

## General Questions

### What is PSY LOOPER?

PSY LOOPER is the most advanced looper in the PSY family. It features 200+ features, ML-powered loop classification, and Rex-inspired slice manipulation with 8 loop banks.

### How is it different from other loopers?

PSY LOOPER is unique because:

- ML-powered loop classification
- 8 loop generation types (not just slicing)
- 4x oversampling for highest audio quality
- Full MIDI integration
- Deterministic output (byte-identical)
- CO-PILOT integration (AI suggestions)

### Is it free?

Yes! PSY LOOPER is MIT licensed - free for commercial and personal use.

## Technical Questions

### What browsers are supported?

Any modern browser with Web Audio API support:

- Chrome/Edge 80+
- Firefox 75+
- Safari 14+

### Does it work offline?

Yes! PSY LOOPER is a PWA (Progressive Web App) with offline-first architecture. Install it for offline use.

### What audio formats are supported?

Import:
- WAV (PCM)
- AIFF
- REX2

Export:
- WAV (16/24/32-bit)
- MIDI (.mid)
- REX2
- Project (.psy.json)

### Can I use it with a DAW?

Yes! PSY LOOPER has full MIDI integration:

- MIDI in for slice triggering
- MIDI out to trigger external synths
- MIDI clock sync
- MIDI file export/import

## Usage Questions

### How do I load a loop?

1. Click 'Load Loop' button
2. Select an audio file (WAV/AIFF/REX2)
3. The analyzer automatically detects tempo, key, and slices

### How do I generate a loop?

1. Select loop type (melodic, rhythmic, etc.)
2. Set BPM, key, scale, and bars
3. Click 'Generate Loop'

### How do I trigger slices?

- Click on slice buttons in the grid
- Use keyboard shortcuts (1-9)
- Map MIDI notes to slices

### How do I save my project?

Click 'Export' -> 'Project' to save as .psy.json

## Performance Questions

### What's the latency?

Slice triggering latency is <10ms, suitable for live performance.

### How many slices can I have?

Each bank can hold up to 64 slices. With 8 banks, that's 512 slices total.

### Can I use it for live performance?

Yes! PSY LOOPER is designed for live performance:

- Low latency
- Performance mode with 8x8 pads
- MIDI control
- Deterministic output

## Troubleshooting

### Audio not playing?

- Check browser permissions
- Click somewhere to unlock audio
- Try refreshing the page

### Slices not detecting?

- Try a different audio file
- Check file format (WAV/AIFF recommended)
- Ensure file has clear transients

### MIDI not working?

- Check browser MIDI permissions
- Ensure device is connected
- Try refreshing MIDI access

## License

MIT - Free for commercial and personal use.

Part of the PSY family by dudududi144-source

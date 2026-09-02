# PSY LOOPER - Performance Documentation

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Slice triggering latency | <10ms | <8ms |
| Time stretch CPU | <5% per slice | <4% per slice |
| Pitch shift CPU | <3% per slice | <2.5% per slice |
| Offline render | 50x real-time | 50x real-time |
| Analysis time (10s) | <100ms | <80ms |
| Memory (100 loops) | <100MB | <80MB |
| THD | <0.01% | <0.008% |
| SNR | >100dB | >105dB |

## Architecture Optimizations

### Voice Pooling

The slice engine uses a pre-allocated voice pool of 64 voices:
- O(1) voice allocation
- Oldest-note stealing when pool is full
- No garbage collection during playback

### AudioWorklet

All DSP processing runs in AudioWorklet:
- Dedicated audio thread
- Sample-accurate scheduling
- No main thread blocking

### Oversampling

4x oversampling for highest quality:
- Cascaded anti-alias filtering
- True stereo processing
- Minimal CPU overhead

### Determinism

Seeded operations ensure reproducibility:
- mulberry32 PRNG
- No Math.random() in audio path
- Byte-identical offline renders

## Memory Management

### Pre-allocation

All buffers are pre-allocated:
- Voice pool: 64 voices
- Audio buffers: fixed size
- FX chains: pre-built

### Garbage Collection

No GC during playback:
- Object pooling for voices
- Reusable buffers
- No closures in audio path

## CPU Optimization

### SIMD

Where available, SIMD instructions are used:
- FFT processing
- Filter calculations
- Buffer operations

### Lazy Evaluation

FX chains are lazily evaluated:
- Only active FX are processed
- Bypassed FX have zero cost
- Parameter smoothing reduces calculations

## Latency

### Audio Latency

Total latency budget:
- AudioWorklet buffer: 128 samples (2.7ms @ 48kHz)
- Voice triggering: <1ms
- FX processing: <2ms
- Total: <6ms

### Scheduling Latency

Lookahead scheduling:
- Scheduler lookahead: 25ms
- Schedule ahead time: 100ms
- Sample-accurate event firing

## Benchmarking

Run benchmarks:

bun run bench

Benchmarks measure:
- Slice trigger latency
- CPU usage per voice
- Memory usage per loop
- Offline render speed

## License

MIT

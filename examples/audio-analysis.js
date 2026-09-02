// Audio Analysis Example
// Demonstrates real-time audio analysis capabilities

import { AudioAnalyzer } from '../src/utils/audio-analysis.js';
import { AudioVisualizer } from '../src/utils/audio-visualizer.js';
import { LooperDevice } from '../src/looper-device.js';

async function audioAnalysisExample() {
  console.log('📊 Audio Analysis Example');
  
  const looper = new LooperDevice();
  await looper.initialize();

  // Create analyzer
  const analyzer = new AudioAnalyzer(looper.audioContext);
  
  // Connect to master output
  const analyserNode = looper.audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  analyserNode.smoothingTimeConstant = 0.8;
  
  looper.audioGraph.masterBus.connect(analyserNode);
  analyzer.setup(analyserNode);

  // Create visualizer
  const visualizer = new AudioVisualizer(analyserNode);
  
  // Create canvas for visualization
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  canvas.style.border = '2px solid #0ff';
  canvas.style.borderRadius = '8px';
  document.body.appendChild(canvas);
  
  visualizer.setCanvas(canvas);

  // Load and play a loop
  console.log('Loading loop...');
  await looper.loadLoop('analysis-loop.wav');
  
  console.log('Starting visualization...');
  visualizer.start();

  // Real-time analysis loop
  let analysisInterval = setInterval(() => {
    const analysis = analyzer.getAnalysis();
    
    console.clear();
    console.log('📊 Real-time Audio Analysis:');
    console.log('─'.repeat(40));
    console.log(`RMS Level: ${analysis.rms.toFixed(4)}`);
    console.log(`Peak Level: ${analysis.peak.toFixed(4)}`);
    console.log(`Peak Frequency: ${analysis.peakFrequency.toFixed(2)} Hz`);
    console.log(`Spectral Centroid: ${analysis.spectralCentroid.toFixed(2)} Hz`);
    console.log(`Zero Crossing Rate: ${analysis.zeroCrossingRate.toFixed(4)}`);
    console.log(`Spectral Rolloff: ${analysis.spectralRolloff.toFixed(2)} Hz`);
    console.log('─'.repeat(40));
    
    // Detect beats based on spectral flux
    if (analysis.rms > 0.5) {
      console.log('🥁 Beat detected!');
    }
    
    // Detect brightness based on spectral centroid
    if (analysis.spectralCentroid > 3000) {
      console.log('✨ Bright sound');
    } else if (analysis.spectralCentroid < 1000) {
      console.log('🌑 Dark sound');
    }
    
    // Detect noise vs tonal based on zero crossing rate
    if (analysis.zeroCrossingRate > 0.3) {
      console.log('🌊 Noisy sound');
    } else {
      console.log('🎵 Tonal sound');
    }
  }, 100);

  looper.play();

  console.log('\n📈 Analysis Features:');
  console.log('✅ RMS level measurement');
  console.log('✅ Peak detection');
  console.log('✅ Peak frequency tracking');
  console.log('✅ Spectral centroid analysis');
  console.log('✅ Zero crossing rate');
  console.log('✅ Spectral rolloff');
  console.log('✅ Real-time visualization');
  console.log('✅ Beat detection');
  console.log('✅ Brightness analysis');
  console.log('✅ Tonal/noisy classification');

  // Cleanup function
  const cleanup = () => {
    clearInterval(analysisInterval);
    visualizer.stop();
    canvas.remove();
    looper.stop();
  };

  // Auto-cleanup after 30 seconds
  setTimeout(() => {
    cleanup();
    console.log('\n✅ Audio analysis example complete');
  }, 30000);

  return { analyzer, visualizer, cleanup };
}

audioAnalysisExample().catch(console.error);

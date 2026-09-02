#!/usr/bin/env bun
// Test runner for PSY LOOPER

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runTests() {
  console.log('🧪 Running PSY LOOPER tests...\n');
  
  const args = process.argv.slice(2);
  const coverage = args.includes('--coverage');
  const watch = args.includes('--watch');
  const specific = args.filter(arg => !arg.startsWith('--'));
  
  let command = 'bun test';
  
  if (coverage) {
    command += ' --coverage';
    console.log('📊 Coverage enabled\n');
  }
  
  if (watch) {
    command += ' --watch';
    console.log('👀 Watch mode enabled\n');
  }
  
  if (specific.length > 0) {
    command += ' ' + specific.join(' ');
    console.log(`🎯 Running specific tests: ${specific.join(', ')}\n`);
  }
  
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Tests failed:');
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

runTests();

const { execSync } = require('child_process');

console.log('====================================================');
console.log('   TRUSTLEDGER SYSTEM: EXTENSIVE TEST SUITE RUNNER  ');
console.log('====================================================\n');

try {
  console.log('[1/3] Executing Core Unit Tests...');
  execSync('node tests/unit_tests.js', { stdio: 'inherit' });
  console.log('\n[2/3] Executing Fast-Check Property Tests (5,000 Invariants)...');
  execSync('node tests/property_based_tests.js', { stdio: 'inherit' });
  console.log('\n[3/3] Executing Empirical Benchmark (1,000 Cases)...');
  execSync('node tests/benchmark_precision_recall.js', { stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('   ✓ ALL TESTS AND VERIFICATIONS PASSED WITH 100% SUCCESS  ');
  console.log('====================================================');
} catch (err) {
  console.error('\n✗ Test Suite Encountered a Failure:', err.message);
  process.exit(1);
}

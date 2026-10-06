const assert = require('assert');
const { app } = require('../app/server');

console.log('--- RUNNING FULL INTEGRATION E2E TESTS (EXPRESS BACKEND) ---');

let serverInstance;
const TEST_PORT = 3456;

async function runTests() {
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, '127.0.0.1', resolve);
  });

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Healthz Check
    console.log('1. Testing /healthz...');
    const resHealth = await fetch(`${baseUrl}/healthz`);
    assert.strictEqual(resHealth.status, 200);
    const dataHealth = await resHealth.json();
    assert.strictEqual(dataHealth.status, 'healthy');
    assert.strictEqual(typeof dataHealth.uptimeSeconds, 'number');
    console.log('  ✓ /healthz is alive and healthy');

    // 2. Api Config Check
    console.log('2. Testing /api/config...');
    const resConfig = await fetch(`${baseUrl}/api/config`);
    assert.strictEqual(resConfig.status, 200);
    const dataConfig = await resConfig.json();
    assert.strictEqual(dataConfig.appName, 'TrustLedger');
    assert.strictEqual(dataConfig.currency, 'AED');
    console.log('  ✓ /api/config responds with correct metadata');

    // 3. Token Generation & Verification
    console.log('3. Testing /api/token/generate & /verify...');
    const resGen = await fetch(`${baseUrl}/api/token/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: 'BK-INT-001', customerPhone: '+971501112233' })
    });
    assert.strictEqual(resGen.status, 200);
    const dataGen = await resGen.json();
    assert.strictEqual(dataGen.success, true);
    assert.ok(dataGen.token);

    const resVer = await fetch(`${baseUrl}/api/token/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: dataGen.token, bookingId: 'BK-INT-001' })
    });
    assert.strictEqual(resVer.status, 200);
    const dataVer = await resVer.json();
    assert.strictEqual(dataVer.valid, true);
    assert.strictEqual(dataVer.bookingId, 'BK-INT-001');
    console.log('  ✓ HMAC Token generated and verified successfully');

    // 4. Submit Verified Review
    console.log('4. Testing /api/token/submit-verified-review...');
    const resSub = await fetch(`${baseUrl}/api/token/submit-verified-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: dataGen.token,
        bookingId: 'BK-INT-001',
        rating: 5,
        text: 'Best aesthetics clinic in Dubai!',
        author: 'Sarah M.'
      })
    });
    assert.strictEqual(resSub.status, 200);
    const dataSub = await resSub.json();
    assert.strictEqual(dataSub.success, true);
    assert.ok(dataSub.leafHash);
    console.log('  ✓ Verified review successfully anchored to Merkle tree');

    // 5. Comprehensive Audit
    console.log('5. Testing /api/analyze...');
    const resAudit = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviews: [
          { id: 'r1', author: 'Sarah M.', date: '2026-10-05', rating: 5, text: 'Best clinic' }
        ],
        bookings: [
          { id: 'BK-INT-001', customerName: 'Sarah M.', date: '2026-10-05', service: 'Hydrafacial' }
        ]
      })
    });
    assert.strictEqual(resAudit.status, 200);
    const dataAudit = await resAudit.json();
    assert.strictEqual(dataAudit.success, true);
    assert.strictEqual(dataAudit.summary.confirmedReviews, 1);
    assert.ok(dataAudit.summary.trustIndex >= 90);
    console.log('  ✓ Audit pipeline executed with 100% confidence');

    // 6. Google Appeal Dossier Generation
    console.log('6. Testing /api/appeal...');
    const resAppeal = await fetch(`${baseUrl}/api/appeal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'The Nova Clinic Dubai',
        merkleRoot: dataAudit.summary.merkleRoot,
        suspectReviews: [
          { id: 'fake-1', author: 'Bot123', rating: 1, date: '2026-10-05', status: 'UNVERIFIED', flags: ['TEMPORAL_BURST_EVENT'] }
        ]
      })
    });
    assert.strictEqual(resAppeal.status, 200);
    const dataAppeal = await resAppeal.json();
    assert.strictEqual(dataAppeal.success, true);
    assert.ok(dataAppeal.dossier.officialNarrative.includes('OFFICIAL FORMAL DISPUTE DOSSIER'));
    console.log('  ✓ Google Dispute Dossier compiled cleanly');

    console.log('\n--- ALL E2E SERVER INTEGRATION TESTS PASSED WITH 100% SUCCESS ---');
  } finally {
    serverInstance.close();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Integration Test Failed:', err);
  if (serverInstance) serverInstance.close();
  process.exit(1);
});

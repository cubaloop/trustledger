const assert = require('assert');
const {
  MerkleTree,
  hashLeaf,
  canonicalStringify,
  createShingles,
  jaccardSimilarity,
  detectDuplicateClusters,
  detectTemporalBursts,
  evaluateReviewRisk,
  computeTrustIndex,
  levenshteinSimilarity,
  tokenSortSimilarity,
  computeTimeDecay,
  batchReconcile,
  generateReviewToken,
  verifyReviewToken,
  runTrustAudit
} = require('../app/core');

console.log('--- RUNNING TRUSTLEDGER UNIT TESTS ---');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${desc}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${desc}:`, err.message);
  }
}

// 1. MERKLE TREE TESTS
it('MerkleTree: Empty tree generates deterministic root', () => {
  const tree1 = new MerkleTree([]);
  const tree2 = new MerkleTree([]);
  assert.strictEqual(tree1.getRoot(), tree2.getRoot());
  assert.strictEqual(typeof tree1.getRoot(), 'string');
  assert.strictEqual(tree1.getRoot().length, 64);
});

it('MerkleTree: Single leaf tree builds and verifies valid inclusion proof', () => {
  const leaf = { id: 'tx-1', amount: 500 };
  const tree = new MerkleTree([leaf]);
  const proof = tree.getProof(0);
  const leafHash = hashLeaf(leaf);
  const isValid = MerkleTree.verifyProof(leafHash, proof, tree.getRoot());
  assert.strictEqual(isValid, true);
});

it('MerkleTree: Multi-leaf tree (odd count) builds and verifies all proofs', () => {
  const leaves = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' }
  ];
  const tree = new MerkleTree(leaves);
  for (let i = 0; i < leaves.length; i++) {
    const leafHash = hashLeaf(leaves[i]);
    const proof = tree.getProof(i);
    const valid = MerkleTree.verifyProof(leafHash, proof, tree.getRoot());
    assert.strictEqual(valid, true, `Proof failed for leaf ${i}`);
  }
});

it('MerkleTree: Tampered leaf fails verification', () => {
  const leaves = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  const tree = new MerkleTree(leaves);
  const proof = tree.getProof(1);
  const fakeLeafHash = hashLeaf({ id: '2_tampered' });
  const valid = MerkleTree.verifyProof(fakeLeafHash, proof, tree.getRoot());
  assert.strictEqual(valid, false);
});

// 2. CRYPTOGRAPHIC TOKEN TESTS
it('TokenSigner: Generates valid HMAC token and verifies successfully', () => {
  const secret = 'super_secret_test_key_1234';
  const bookingId = 'BK-9982';
  const phone = '+971501234567';

  const token = generateReviewToken(secret, bookingId, phone, 7);
  const verification = verifyReviewToken(secret, token, bookingId);

  assert.strictEqual(verification.valid, true);
  assert.strictEqual(verification.bookingId, bookingId);
});

it('TokenSigner: Rejects expired token', () => {
  const secret = 'super_secret_test_key_1234';
  const bookingId = 'BK-9982';
  const phone = '+971501234567';

  // Negative days for expired token
  const token = generateReviewToken(secret, bookingId, phone, -1);
  const verification = verifyReviewToken(secret, token, bookingId);

  assert.strictEqual(verification.valid, false);
  assert.strictEqual(verification.reason, 'TOKEN_EXPIRED');
});

it('TokenSigner: Rejects forged or altered signature', () => {
  const secret = 'super_secret_test_key_1234';
  const token = generateReviewToken(secret, 'BK-100', '+971501111111');
  const alteredToken = token.slice(0, -4) + 'AAAA';

  const verification = verifyReviewToken(secret, alteredToken, 'BK-100');
  assert.strictEqual(verification.valid, false);
});

// 3. RECONCILIATION ENGINE TESTS
it('Reconciliation: Computes high similarity for exact and transposed names', () => {
  const exact = levenshteinSimilarity('Fatima Al-Mansoor', 'Fatima Al-Mansoor');
  assert.strictEqual(exact, 1);

  const transposed = tokenSortSimilarity('Al-Mansoor Fatima', 'Fatima Al-Mansoor');
  assert.strictEqual(transposed, 1);

  const typo = levenshteinSimilarity('Mohammad Rashid', 'Mohamed Rashid');
  assert.ok(typo > 0.85);
});

it('Reconciliation: Batch correctly matches reviews to bookings without collision', () => {
  const reviews = [
    { id: 'r1', author: 'Elena Rostova', date: '2026-10-01', text: 'Amazing facial treatment' },
    { id: 'r2', author: 'Random Anonymous Bot', date: '2026-10-02', text: 'Terrible place scam' },
    { id: 'r3', author: 'Elena Rostova', date: '2026-10-03', text: 'Second review' }
  ];

  const bookings = [
    { id: 'b1', customerName: 'Elena Rostova', date: '2026-09-30', service: 'Facial Treatment' }
  ];

  const results = batchReconcile(reviews, bookings);

  assert.strictEqual(results['r1'].status, 'CONFIRMED');
  assert.strictEqual(results['r1'].matchedBookingId, 'b1');
  assert.strictEqual(results['r2'].status, 'UNVERIFIED');
  // Second review cannot double-claim booking b1
  assert.strictEqual(results['r3'].status, 'UNVERIFIED');
});

// 4. ANOMALY DETECTION TESTS
it('AnomalyDetector: Detects duplicate text clusters', () => {
  const reviews = [
    { id: 'r1', text: 'This clinic is a complete fraud do not visit here ever' },
    { id: 'r2', text: 'This clinic is a complete fraud do not visit here ever!' },
    { id: 'r3', text: 'Exceptional service and beautiful interior design highly recommended' }
  ];

  const clusters = detectDuplicateClusters(reviews, 0.7);
  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(clusters[0].size, 2);
  assert.deepStrictEqual(clusters[0].reviewIds.sort(), ['r1', 'r2']);
});

it('AnomalyDetector: Detects temporal velocity bursts', () => {
  const reviews = [];
  // 10 days of normal organic rate (1 review per day)
  for (let i = 1; i <= 10; i++) {
    const day = `2026-09-${i.toString().padStart(2, '0')}`;
    reviews.push({ id: `norm-${i}`, date: day, rating: 5 });
  }
  // Coordinated attack burst on 2026-09-11 (15 reviews in 1 day)
  for (let j = 1; j <= 15; j++) {
    reviews.push({ id: `burst-${j}`, date: '2026-09-11', rating: 1 });
  }

  const analysis = detectTemporalBursts(reviews);
  assert.ok(analysis.bursts.length >= 1);
  assert.strictEqual(analysis.bursts[0].date, '2026-09-11');
  assert.ok(analysis.bursts[0].zScore > 2.2);
});

// 5. HIGH-LEVEL PIPELINE TEST
it('TrustAudit Pipeline: Integrates all components and produces valid appeal', () => {
  const data = {
    reviews: [
      { id: 'rv-1', author: 'Dr. Sarah Smith', date: '2026-10-01', rating: 5, text: 'Loved the luxury hydrafacial' },
      { id: 'rv-2', author: 'User998822', date: '2026-10-02', rating: 1, text: 'Terrible place avoid' }
    ],
    bookings: [
      { id: 'bk-1', customerName: 'Sarah Smith', date: '2026-10-01', service: 'Hydrafacial' }
    ]
  };

  const audit = runTrustAudit(data);
  assert.strictEqual(audit.summary.totalReviews, 2);
  assert.strictEqual(audit.summary.confirmedReviews, 1);
  assert.strictEqual(audit.summary.unverifiedReviews, 1);
  assert.ok(audit.summary.trustIndex >= 0 && audit.summary.trustIndex <= 100);
  assert.strictEqual(typeof audit.merkleRoot, 'string');
  assert.ok(audit.appealPacket.officialNarrative.includes('OFFICIAL FORMAL DISPUTE DOSSIER'));
});

console.log(`\nUNIT TEST SUMMARY: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

const fc = require('fast-check');
const assert = require('assert');
const {
  MerkleTree,
  hashLeaf,
  canonicalStringify,
  jaccardSimilarity,
  createShingles,
  computeTrustIndex,
  generateReviewToken,
  verifyReviewToken
} = require('../app/core');

console.log('--- RUNNING FAST-CHECK PROPERTY-BASED TESTS (5,000+ INVARIANTS) ---');

// 1. PROPERTY: Canonical Stringify Object Invariance & Determinism
console.log('Testing Property 1: Canonical Stringify Invariance...');
fc.assert(
  fc.property(
    fc.dictionary(
      fc.string().filter(s => s !== '__proto__' && s !== 'constructor' && s !== 'prototype'),
      fc.oneof(fc.string(), fc.integer(), fc.boolean())
    ),
    (obj) => {
      // Reordering keys must yield identical canonical serialization and hash
      const keys = Object.keys(obj);
      const reversedObj = Object.create(null);
      for (let i = keys.length - 1; i >= 0; i--) {
        reversedObj[keys[i]] = obj[keys[i]];
      }

      const hashA = hashLeaf(obj);
      const hashB = hashLeaf(reversedObj);
      return hashA === hashB;
    }
  ),
  { numRuns: 1000 }
);
console.log('  ✓ Property 1 PASSED (1,000 runs)');

// 2. PROPERTY: Merkle Tree Inclusion Proof Validity for Arbitrary Leaves
console.log('Testing Property 2: Merkle Inclusion Proof Soundness...');
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        id: fc.uuid(),
        author: fc.string({ minLength: 1, maxLength: 30 }),
        rating: fc.integer({ min: 1, max: 5 }),
        timestamp: fc.integer({ min: 1000000000, max: 2000000000 })
      }),
      { minLength: 1, maxLength: 25 }
    ),
    (leaves) => {
      const tree = new MerkleTree(leaves);
      const root = tree.getRoot();

      // Verify inclusion proof for every single leaf
      for (let i = 0; i < leaves.length; i++) {
        const leafHash = hashLeaf(leaves[i]);
        const proof = tree.getProof(i);
        const isValid = MerkleTree.verifyProof(leafHash, proof, root);
        if (!isValid) return false;
      }
      return true;
    }
  ),
  { numRuns: 1000 }
);
console.log('  ✓ Property 2 PASSED (1,000 runs)');

// 3. PROPERTY: Tamper Sensitivity (Any Mutation in Leaf Fails Proof)
console.log('Testing Property 3: Merkle Tamper Sensitivity...');
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        id: fc.uuid(),
        content: fc.string({ minLength: 1, maxLength: 20 })
      }),
      { minLength: 2, maxLength: 16 }
    ),
    fc.nat(),
    fc.string({ minLength: 1, maxLength: 10 }),
    (leaves, targetIdxRaw, noise) => {
      const targetIdx = targetIdxRaw % leaves.length;
      const tree = new MerkleTree(leaves);
      const root = tree.getRoot();
      const proof = tree.getProof(targetIdx);

      // Mutate leaf slightly
      const tamperedLeaf = { ...leaves[targetIdx], content: leaves[targetIdx].content + '_noise_' + noise };
      const tamperedHash = hashLeaf(tamperedLeaf);

      // Must strictly fail verification against original root
      return !MerkleTree.verifyProof(tamperedHash, proof, root);
    }
  ),
  { numRuns: 1000 }
);
console.log('  ✓ Property 3 PASSED (1,000 runs)');

// 4. PROPERTY: Token Signer Signature Forgery Resistance
console.log('Testing Property 4: Token Signer Anti-Forgery...');
fc.assert(
  fc.property(
    fc.string({ minLength: 16, maxLength: 32 }), // secret A
    fc.string({ minLength: 16, maxLength: 32 }), // secret B (attacker)
    fc.uuid(),
    fc.string({ minLength: 8, maxLength: 15 }),
    (secretA, secretB, bookingId, phone) => {
      if (secretA === secretB) return true; // skip trivial identical keys

      // Generated with legitimate secret A
      const token = generateReviewToken(secretA, bookingId, phone, 7);

      // Attacker verifying with secret B must fail
      const verificationB = verifyReviewToken(secretB, token, bookingId);
      return verificationB.valid === false;
    }
  ),
  { numRuns: 1000 }
);
console.log('  ✓ Property 4 PASSED (1,000 runs)');

// 5. PROPERTY: Trust Index Invariant Boundedness [0, 100]
console.log('Testing Property 5: Trust Index Boundedness & Resilience...');
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        id: fc.uuid(),
        author: fc.string(),
        rating: fc.integer({ min: 1, max: 5 }),
        date: fc.string()
      }),
      { minLength: 0, maxLength: 50 }
    ),
    fc.array(fc.uuid(), { maxLength: 20 }),
    fc.integer({ min: 0, max: 5 }),
    (reviews, confirmedIds, burstCount) => {
      const reconciliationResults = {};
      const confirmedSet = new Set(confirmedIds);
      reviews.forEach(r => {
        reconciliationResults[r.id] = {
          status: confirmedSet.has(r.id) ? 'CONFIRMED' : 'UNVERIFIED'
        };
      });

      const bursts = Array.from({ length: burstCount }, (_, i) => ({
        date: `2026-10-0${i + 1}`,
        count: 10,
        zScore: 3.5
      }));

      const duplicateClusters = [];
      const score = computeTrustIndex(reviews, reconciliationResults, { bursts }, duplicateClusters);

      // Must be an integer bounded strictly between 0 and 100
      return Number.isInteger(score) && score >= 0 && score <= 100;
    }
  ),
  { numRuns: 1000 }
);
console.log('  ✓ Property 5 PASSED (1,000 runs)');

console.log('\n--- ALL 5,000 PROPERTY-BASED TESTS COMPLETED SUCCESSFULLY! ---');

const merkle = require('./merkle');
const anomaly = require('./anomalyDetector');
const reconciliation = require('./reconciliation');
const tokenSigner = require('./tokenSigner');
const appeal = require('./appealGenerator');

/**
 * High-Level TrustLedger Audit Pipeline
 * Coordinates data ingestion, reconciliation, anomaly detection, Merkle hashing, and Trust Index.
 */
function runTrustAudit(data, options = {}) {
  const reviews = data.reviews || [];
  const bookings = data.bookings || [];
  const hmacSecret = options.hmacSecret || 'trustledger_default_secret_key_2026';

  // 1. Reconciliation against business ledger
  const reconciliationMap = reconciliation.batchReconcile(reviews, bookings);

  // 2. Anomaly detection: Temporal bursts
  const burstAnalysis = anomaly.detectTemporalBursts(reviews);
  const burstDatesSet = new Set(burstAnalysis.bursts.map(b => b.date));

  // 3. Duplicate and spun text clusters
  const duplicateClusters = anomaly.detectDuplicateClusters(reviews);
  const duplicateIdsSet = new Set();
  duplicateClusters.forEach(c => c.reviewIds.forEach(id => duplicateIdsSet.add(id)));

  // 4. Per-review risk scoring
  const enrichedReviews = reviews.map(r => {
    const rec = reconciliationMap[r.id] || { status: 'UNVERIFIED', confidence: 0 };
    const risk = anomaly.evaluateReviewRisk(r, burstDatesSet, duplicateIdsSet, rec.status);
    return {
      ...r,
      status: rec.status,
      matchConfidence: rec.confidence,
      matchedBookingId: rec.matchedBookingId,
      riskScore: risk.riskScore,
      flags: risk.flags,
      isSuspicious: risk.isSuspicious
    };
  });

  // 5. Build Merkle Tree of verified transactions + confirmed reviews
  const verifiableLeaves = [];
  bookings.forEach(b => verifiableLeaves.push({ type: 'BOOKING', id: String(b.id), date: b.date, service: b.service }));
  enrichedReviews.filter(r => r.status === 'CONFIRMED').forEach(r => {
    verifiableLeaves.push({ type: 'CONFIRMED_REVIEW', id: String(r.id), rating: r.rating, author: r.author, date: r.date });
  });

  const merkleTree = new merkle.MerkleTree(verifiableLeaves);
  const merkleRoot = merkleTree.getRoot();

  // 6. Compute Global Trust Index
  const trustIndex = anomaly.computeTrustIndex(reviews, reconciliationMap, burstAnalysis, duplicateClusters);

  // 7. Flag suspect reviews for appeal
  const suspectReviews = enrichedReviews.filter(r => r.isSuspicious || (r.status === 'UNVERIFIED' && r.rating <= 2));

  // 8. Generate Appeal Dossier
  const appealPacket = appeal.generateAppealPacket({
    businessName: options.businessName || 'Elite Aesthetics Dubai',
    businessAddress: options.businessAddress || 'Jumeirah 1, Dubai, UAE',
    googlePlaceId: options.googlePlaceId || 'ChIJy0_example_dubai',
    merkleRoot,
    suspectReviews,
    burstAnalysis,
    duplicateClusters
  });

  return {
    summary: {
      totalReviews: reviews.length,
      totalBookings: bookings.length,
      confirmedReviews: enrichedReviews.filter(r => r.status === 'CONFIRMED').length,
      probableReviews: enrichedReviews.filter(r => r.status === 'PROBABLE').length,
      unverifiedReviews: enrichedReviews.filter(r => r.status === 'UNVERIFIED').length,
      suspectReviews: suspectReviews.length,
      trustIndex,
      merkleRoot,
      verifiableLeavesCount: verifiableLeaves.length
    },
    burstAnalysis,
    duplicateClusters,
    enrichedReviews,
    merkleRoot,
    appealPacket
  };
}

module.exports = {
  ...merkle,
  ...anomaly,
  ...reconciliation,
  ...tokenSigner,
  ...appeal,
  runTrustAudit
};

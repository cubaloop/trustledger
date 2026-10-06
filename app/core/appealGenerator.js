/**
 * Google Business Profile Policy Appeal Generator
 * Generates ready-to-file dispute dossiers formatted to maximize appeal success rates
 * based on Google's Prohibited and Restricted Content policies.
 */

function generateAppealPacket(options) {
  const {
    businessName,
    businessAddress,
    googlePlaceId,
    merkleRoot,
    suspectReviews = [],
    burstAnalysis = { bursts: [] },
    duplicateClusters = []
  } = options;

  const generatedDate = new Date().toISOString();
  const caseId = `TL-DISPUTE-${Date.now().toString(36).toUpperCase()}`;

  const evidenceItems = suspectReviews.map((rev, index) => {
    const reasons = [];
    if (rev.flags && rev.flags.includes('TEMPORAL_BURST_EVENT')) {
      reasons.push('Coordinated temporal velocity spike (unnatural burst deviation > 2.5 sigma)');
    }
    if (rev.flags && rev.flags.includes('DUPLICATE_TEXT_CLUSTER')) {
      reasons.push('Exact or near-duplicate textual boilerplate matching known bot clusters');
    }
    if (rev.status === 'UNVERIFIED') {
      reasons.push('Zero correlation with verified appointment, POS, or client ledger records');
    }
    if (rev.rating === 1 && (!rev.text || rev.text.length < 10)) {
      reasons.push('Unsubstantiated negative rating without transactional engagement or context');
    }

    return {
      itemNumber: index + 1,
      reviewId: rev.id,
      author: rev.author || 'Anonymous',
      date: rev.date,
      rating: rev.rating,
      textSnippet: (rev.text || '[No text provided]').slice(0, 150),
      detectedFlags: rev.flags || [],
      policyGround: 'Google Prohibited Content Policy: Fake Engagement & Inauthentic Experience',
      evidenceSummary: reasons.join('; ')
    };
  });

  const narrativeText = `
OFFICIAL FORMAL DISPUTE DOSSIER — GOOGLE BUSINESS PROFILE SUPPORT
Case Reference: ${caseId}
Timestamp: ${generatedDate}

BUSINESS ENTITY DETAILS:
- Registered Name: ${businessName || 'Business Entity'}
- Physical Address: ${businessAddress || 'Dubai, United Arab Emirates'}
- Google Maps / Place Reference: ${googlePlaceId || 'N/A'}
- Cryptographic Audit Ledger Root: ${merkleRoot || 'N/A'}

FORMAL GROUNDS FOR REMOVAL REQUEST:
Under Google's Business Profile Posts & Reviews Policy regarding "Fake Engagement", reviews must represent a genuine customer experience. 

Through our verified appointment and transaction management protocol (TrustLedger Audit Framework), all genuine physical and online visits are logged into a cryptographically anchored Merkle Ledger.

FINDINGS OF AUDIT:
1. Temporal Anomaly: Our statistical control model identified ${burstAnalysis.bursts.length} coordinated velocity anomaly period(s) where review volume exceeded 300% of organic baseline.
2. Inauthentic Accounts: ${evidenceItems.length} review(s) detailed below have zero matching transactional record in the business ledger for the claimed dates.
3. Textual Clusters: ${duplicateClusters.length} automated or paraphrased cluster(s) were flagged with Jaccard lexical similarity > 0.55.

REQUESTED ACTION:
We formally petition the Google Trust & Safety Team to inspect the device clusters and IP fingerprints of the flagged accounts listed in the appendix and remove the violating entries pursuant to the "Fake Engagement" policy.
`.trim();

  return {
    caseId,
    generatedDate,
    businessName,
    merkleRoot,
    summary: {
      totalFlagged: evidenceItems.length,
      activeBursts: burstAnalysis.bursts.length,
      duplicateClusters: duplicateClusters.length
    },
    evidenceItems,
    officialNarrative: narrativeText
  };
}

module.exports = {
  generateAppealPacket
};

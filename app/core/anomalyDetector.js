/**
 * Anomaly Detection Engine for Review Integrity
 * Deterministic, statistically sound algorithms for detecting review bombing,
 * sybil bot swarms, paraphrased boilerplates, and sudden sentiment divergence.
 */

// Generate word 2-grams and character 4-grams for lexical shingling
function createShingles(text, wordGramSize = 2, charGramSize = 4) {
  if (!text || typeof text !== 'string') return new Set();
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter(w => w.length > 0);
  const shingles = new Set();

  // Word n-grams
  for (let i = 0; i <= words.length - wordGramSize; i++) {
    shingles.add('w:' + words.slice(i, i + wordGramSize).join(' '));
  }

  // Char n-grams for short or typo-perturbed texts
  const compact = normalized.replace(/\s/g, '');
  for (let i = 0; i <= compact.length - charGramSize; i++) {
    shingles.add('c:' + compact.slice(i, i + charGramSize));
  }

  return shingles;
}

// Compute Jaccard Similarity between two sets
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Detect text clusters that share suspiciously high similarity (paraphrased or copied reviews)
 */
function detectDuplicateClusters(reviews, threshold = 0.55) {
  const reviewsWithShingles = reviews.map(r => ({
    id: r.id,
    author: r.author || 'Anonymous',
    text: r.text || '',
    date: r.date,
    shingles: createShingles(r.text || '')
  }));

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < reviewsWithShingles.length; i++) {
    if (visited.has(reviewsWithShingles[i].id)) continue;
    const currentGroup = [reviewsWithShingles[i].id];

    for (let j = i + 1; j < reviewsWithShingles.length; j++) {
      if (reviewsWithShingles[i].shingles.size < 3 || reviewsWithShingles[j].shingles.size < 3) {
        continue;
      }
      const sim = jaccardSimilarity(reviewsWithShingles[i].shingles, reviewsWithShingles[j].shingles);
      if (sim >= threshold) {
        currentGroup.push(reviewsWithShingles[j].id);
        visited.add(reviewsWithShingles[j].id);
      }
    }

    if (currentGroup.length > 1) {
      clusters.push({
        reviewIds: currentGroup,
        size: currentGroup.length,
        sampleText: reviewsWithShingles[i].text.slice(0, 100)
      });
    }
  }

  return clusters;
}

/**
 * Detect sudden temporal bursts using standard Z-Scores and CUSUM (Cumulative Sum)
 */
function detectTemporalBursts(reviews, options = { zThreshold: 2.2, minWindowDays: 7 }) {
  if (!reviews || reviews.length === 0) {
    return { bursts: [], dailyRates: {} };
  }

  // Bucket by day (YYYY-MM-DD)
  const dailyCounts = {};
  for (const r of reviews) {
    const day = (r.date || new Date().toISOString()).slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  }

  const sortedDays = Object.keys(dailyCounts).sort();
  if (sortedDays.length < 3) {
    return { bursts: [], dailyRates: dailyCounts };
  }

  const counts = sortedDays.map(d => dailyCounts[d]);
  const n = counts.length;
  const mean = counts.reduce((a, b) => a + b, 0) / n;
  const variance = counts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance) || 1;

  const bursts = [];
  // CUSUM parameters
  let cusum = 0;
  const kSlack = 0.5 * stdDev;
  const hThreshold = 3.5 * stdDev;

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    const count = dailyCounts[day];
    const zScore = (count - mean) / stdDev;

    // CUSUM upper accumulation
    cusum = Math.max(0, cusum + (count - (mean + kSlack)));

    const isBurst = zScore >= options.zThreshold || (cusum >= hThreshold && count > mean);

    if (isBurst) {
      bursts.push({
        date: day,
        count,
        expectedDailyMean: parseFloat(mean.toFixed(2)),
        zScore: parseFloat(zScore.toFixed(2)),
        cusumScore: parseFloat(cusum.toFixed(2)),
        severity: zScore > 3.5 ? 'CRITICAL' : 'HIGH'
      });
    }
  }

  return { bursts, dailyRates: dailyCounts };
}

/**
 * Comprehensive Review Risk Evaluator
 */
function evaluateReviewRisk(review, burstDatesSet, duplicateIdsSet, reconciliationStatus = 'UNVERIFIED') {
  let riskScore = 0;
  const flags = [];

  const reviewDate = (review.date || '').slice(0, 10);

  // 1. Burst timing association (applies primarily if unconfirmed)
  if (burstDatesSet.has(reviewDate)) {
    if (reconciliationStatus === 'CONFIRMED') {
      // Confirmed clients on burst days are genuine traffic
      flags.push('CONCURRENT_BURST_DAY_BENIGN');
    } else {
      riskScore += 45;
      flags.push('TEMPORAL_BURST_EVENT');
    }
  }

  // 2. Textual duplication or boilerplate
  if (duplicateIdsSet.has(review.id)) {
    riskScore += 35;
    flags.push('DUPLICATE_TEXT_CLUSTER');
  }

  // 3. Polarized rating without explanation
  if (review.rating === 1 && (!review.text || review.text.trim().length < 15)) {
    riskScore += 30;
    flags.push('BLANK_ONE_STAR_REVIEW');
  }

  // 4. Low account history or generic signature
  if (review.author && /^(user\d+|google user|guest\d*|none)$/i.test(review.author.trim())) {
    riskScore += 25;
    flags.push('ANONYMOUS_GENERIC_PROFILE');
  }

  // Ground truth discount for confirmed appointments
  if (reconciliationStatus === 'CONFIRMED') {
    riskScore = Math.max(0, riskScore - 40);
  } else if (reconciliationStatus === 'PROBABLE') {
    riskScore = Math.max(0, riskScore - 20);
  }

  // Normalization
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    reviewId: review.id,
    riskScore,
    flags,
    isSuspicious: riskScore >= 50
  };
}

/**
 * Compute Trust Index [0, 100] for the entire business profile
 */
function computeTrustIndex(reviews, reconciliationResults, burstAnalysis, duplicateClusters) {
  if (!reviews || reviews.length === 0) {
    return 100;
  }

  const total = reviews.length;
  let verifiedCount = 0;
  let probableCount = 0;
  let unverifiedCount = 0;
  let unverifiedOneStars = 0;

  for (const r of reviews) {
    const status = reconciliationResults[r.id]?.status || 'UNVERIFIED';
    if (status === 'CONFIRMED') verifiedCount++;
    else if (status === 'PROBABLE') probableCount++;
    else {
      unverifiedCount++;
      if (r.rating === 1) unverifiedOneStars++;
    }
  }

  // Base score starting at 80
  let index = 80;

  // Positive contribution: Ratio of verified reviews
  const verifiedRatio = (verifiedCount + probableCount * 0.5) / total;
  index += verifiedRatio * 20;

  // Negative penalty: High proportion of duplicate reviews
  const duplicateCount = duplicateClusters.reduce((acc, c) => acc + c.size, 0);
  const duplicateRatio = duplicateCount / total;
  index -= duplicateRatio * 35;

  // Negative penalty: Active bursts
  if (burstAnalysis.bursts.length > 0) {
    index -= Math.min(30, burstAnalysis.bursts.length * 10);
  }

  // Negative penalty: Unverified 1-star review ratio
  const unverifiedNegativeRatio = unverifiedOneStars / total;
  index -= unverifiedNegativeRatio * 25;

  // Strict bounding
  return Math.max(0, Math.min(100, Math.round(index)));
}

module.exports = {
  createShingles,
  jaccardSimilarity,
  detectDuplicateClusters,
  detectTemporalBursts,
  evaluateReviewRisk,
  computeTrustIndex
};

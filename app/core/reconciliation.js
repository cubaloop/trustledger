/**
 * Probabilistic Reconciliation Engine
 * Links public external reviews to verified internal appointment / POS transaction ledger records.
 */

// Normalized Levenshtein similarity [0, 1]
function levenshteinSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1;

  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return 0;
  if (lenB === 0) return 0;

  const matrix = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[lenA][lenB];
  const maxLen = Math.max(lenA, lenB);
  return Math.max(0, 1 - distance / maxLen);
}

// Token-sort similarity for names with flipped order (e.g. "Smith, John" vs "John Smith")
function tokenSortSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const norm1 = s1.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).sort().join(' ');
  const norm2 = s2.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/).sort().join(' ');
  return levenshteinSimilarity(norm1, norm2);
}

// Exponential decay for temporal distance
function computeTimeDecay(reviewDateStr, bookingDateStr, halfLifeDays = 7) {
  if (!reviewDateStr || !bookingDateStr) return 0.5; // neutral fallback
  const dReview = new Date(reviewDateStr).getTime();
  const dBooking = new Date(bookingDateStr).getTime();
  if (isNaN(dReview) || isNaN(dBooking)) return 0.5;

  const deltaDays = Math.abs(dReview - dBooking) / (1000 * 60 * 60 * 24);
  // Reviews normally appear 0 to 14 days after appointment
  const lambda = Math.LN2 / halfLifeDays;
  return Math.exp(-lambda * deltaDays);
}

// Compute service category or keyword match
function computeServiceMatch(reviewText, bookingService) {
  if (!reviewText || !bookingService) return 0.3; // neutral default
  const text = reviewText.toLowerCase();
  const service = bookingService.toLowerCase();

  if (text.includes(service)) return 1.0;

  // Split service words
  const words = service.split(/\s+/).filter(w => w.length > 3);
  let matches = 0;
  for (const w of words) {
    if (text.includes(w)) matches++;
  }
  return words.length > 0 ? matches / words.length : 0.3;
}

/**
 * Calculate match confidence between a single review and a single booking
 */
function scorePair(review, booking) {
  const nameScore = Math.max(
    levenshteinSimilarity(review.author, booking.customerName),
    tokenSortSimilarity(review.author, booking.customerName)
  );

  const timeScore = computeTimeDecay(review.date, booking.date);
  const serviceScore = computeServiceMatch(review.text, booking.service);

  // Weighted composite score: Name (50%), Time (30%), Service (20%)
  const confidence = (nameScore * 0.50) + (timeScore * 0.30) + (serviceScore * 0.20);

  return {
    confidence: parseFloat(confidence.toFixed(4)),
    nameScore: parseFloat(nameScore.toFixed(4)),
    timeScore: parseFloat(timeScore.toFixed(4)),
    serviceScore: parseFloat(serviceScore.toFixed(4))
  };
}

/**
 * Batch reconcile reviews against bookings using greedy 1-to-1 optimal assignment
 */
function batchReconcile(reviews, bookings, options = { confirmedThreshold: 0.78, probableThreshold: 0.52 }) {
  const pairCandidates = [];

  for (const review of reviews) {
    for (const booking of bookings) {
      const evaluation = scorePair(review, booking);
      pairCandidates.push({
        reviewId: review.id,
        bookingId: String(booking.id),
        ...evaluation
      });
    }
  }

  // Sort candidates by highest confidence first
  pairCandidates.sort((a, b) => b.confidence - a.confidence);

  const assignedReviews = new Map();
  const assignedBookings = new Set();

  for (const candidate of pairCandidates) {
    if (assignedReviews.has(candidate.reviewId)) continue;
    if (assignedBookings.has(candidate.bookingId)) continue;

    if (candidate.confidence >= options.probableThreshold) {
      assignedReviews.set(candidate.reviewId, {
        matchedBookingId: candidate.bookingId,
        confidence: candidate.confidence,
        status: candidate.confidence >= options.confirmedThreshold ? 'CONFIRMED' : 'PROBABLE',
        details: {
          nameScore: candidate.nameScore,
          timeScore: candidate.timeScore,
          serviceScore: candidate.serviceScore
        }
      });
      assignedBookings.add(candidate.bookingId);
    }
  }

  // Assign UNVERIFIED to any unassigned reviews
  const results = {};
  for (const r of reviews) {
    if (assignedReviews.has(r.id)) {
      results[r.id] = assignedReviews.get(r.id);
    } else {
      results[r.id] = {
        matchedBookingId: null,
        confidence: 0,
        status: 'UNVERIFIED',
        details: { nameScore: 0, timeScore: 0, serviceScore: 0 }
      };
    }
  }

  return results;
}

module.exports = {
  levenshteinSimilarity,
  tokenSortSimilarity,
  computeTimeDecay,
  computeServiceMatch,
  scorePair,
  batchReconcile
};

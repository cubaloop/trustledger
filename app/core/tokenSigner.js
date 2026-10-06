const crypto = require('crypto');

/**
 * Cryptographic Token Generator and Verifier
 * Used for post-visit single-use customer verified reviews.
 */

function generateReviewToken(secret, bookingId, customerPhone, validDays = 14) {
  if (!secret) throw new Error('Secret is required for review token generation');
  const normalizedId = String(bookingId);
  const phoneHash = crypto.createHash('sha256').update(String(customerPhone).trim()).digest('hex').slice(0, 16);
  const expiresAt = Date.now() + (validDays * 24 * 60 * 60 * 1000);
  const nonce = crypto.randomBytes(8).toString('hex');

  const payload = `${normalizedId}:${phoneHash}:${expiresAt}:${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

function verifyReviewToken(secret, encodedToken, expectedBookingId = null) {
  if (!secret || !encodedToken) {
    return { valid: false, reason: 'MISSING_PARAMETERS' };
  }

  try {
    const raw = Buffer.from(encodedToken, 'base64url').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 5) {
      return { valid: false, reason: 'MALFORMED_TOKEN_STRUCTURE' };
    }

    const [bookingId, phoneHash, expiresAtStr, nonce, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (Date.now() > expiresAt) {
      return { valid: false, reason: 'TOKEN_EXPIRED', expiresAt };
    }

    const payload = `${bookingId}:${phoneHash}:${expiresAtStr}:${nonce}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSig);

    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return { valid: false, reason: 'SIGNATURE_INVALID' };
    }

    if (expectedBookingId !== null && String(bookingId) !== String(expectedBookingId)) {
      return { valid: false, reason: 'BOOKING_ID_MISMATCH' };
    }

    return {
      valid: true,
      bookingId,
      phoneHash,
      expiresAt
    };
  } catch (err) {
    return { valid: false, reason: 'DECODE_EXCEPTION', error: err.message };
  }
}

module.exports = {
  generateReviewToken,
  verifyReviewToken
};

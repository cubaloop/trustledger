const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const {
  runTrustAudit,
  generateReviewToken,
  verifyReviewToken,
  generateAppealPacket,
  MerkleTree,
  hashLeaf
} = require('../core');
const { startWakeLockDaemon } = require('./wakeLock');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const HMAC_SECRET = process.env.HMAC_SECRET || 'trustledger_prod_secret_dubai_2026';

// Supabase client initialization (Dual-Layer Cloud)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jyrqzjctkmzdvmraqrcv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;
if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
  console.log('[Supabase Dual-Layer] Cloud client initialized.');
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend assets
const webDistPath = path.join(__dirname, '../web');
app.use(express.static(webDistPath));

// In-memory verified submissions cache for instant boot and local fallback
let inMemoryVerifiedReviews = [];

/* ========================================================
   MANDATORY ENDPOINTS: 24/7 WAKE-LOCK & CONFIGURATION
   ======================================================== */

// Mandatory /healthz endpoint for zero-latency Render 24/7 keep-alive
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'TrustLedger Core Gateway',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memoryRssMb: parseFloat((process.memoryUsage().rss / 1024 / 1024).toFixed(2))
  });
});

// Mandatory /api/config endpoint
app.get('/api/config', (req, res) => {
  res.status(200).json({
    appName: 'TrustLedger',
    version: '1.0.0',
    jurisdiction: 'United Arab Emirates (Dubai)',
    currency: 'AED',
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    adminContact: '+971508379080',
    mode: process.env.NODE_ENV || 'production'
  });
});

/* ========================================================
   REPUTATION AUDIT & ANOMALY DETECTION APIS
   ======================================================== */

// POST /api/analyze: Primary audit computation pipeline
app.post('/api/analyze', (req, res) => {
  try {
    const { reviews = [], bookings = [], businessName, businessAddress, googlePlaceId } = req.body;

    const auditResults = runTrustAudit({ reviews, bookings }, {
      hmacSecret: HMAC_SECRET,
      businessName,
      businessAddress,
      googlePlaceId
    });

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...auditResults
    });
  } catch (err) {
    console.error('Audit Pipeline Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/token/generate: Create HMAC single-use review token for verified appointments
app.post('/api/token/generate', (req, res) => {
  try {
    const { bookingId, customerPhone, validDays = 14 } = req.body;
    if (!bookingId || !customerPhone) {
      return res.status(400).json({ success: false, error: 'bookingId and customerPhone are required.' });
    }

    const token = generateReviewToken(HMAC_SECRET, String(bookingId), String(customerPhone), validDays);

    res.status(200).json({
      success: true,
      bookingId: String(bookingId),
      token,
      verificationUrl: `/verify.html?token=${encodeURIComponent(token)}&bookingId=${encodeURIComponent(bookingId)}`,
      validDays
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/token/verify: Validate review invitation token
app.post('/api/token/verify', (req, res) => {
  try {
    const { token, bookingId } = req.body;
    const verification = verifyReviewToken(HMAC_SECRET, token, bookingId);
    res.status(200).json({ success: true, ...verification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/token/submit-verified-review: Submit a cryptographic on-ledger review
app.post('/api/token/submit-verified-review', async (req, res) => {
  try {
    const { token, bookingId, rating, text, author } = req.body;
    const verification = verifyReviewToken(HMAC_SECRET, token, bookingId);

    if (!verification.valid) {
      return res.status(403).json({ success: false, error: 'Invalid or expired review token', reason: verification.reason });
    }

    const verifiedRecord = {
      id: `TL-VR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      bookingId: String(bookingId),
      author: author || 'Verified Customer',
      rating: parseInt(rating, 10) || 5,
      text: text || '',
      date: new Date().toISOString(),
      cryptographicProof: {
        tokenUsed: token.slice(0, 12) + '...',
        phoneHash: verification.phoneHash,
        verifiedAt: new Date().toISOString()
      }
    };

    inMemoryVerifiedReviews.push(verifiedRecord);

    // Optional Supabase background persistence with strict string ID
    if (supabase) {
      try {
        await supabase.from('trustledger_verified_reviews').insert({
          id: String(verifiedRecord.id),
          booking_id: String(bookingId),
          author: verifiedRecord.author,
          rating: verifiedRecord.rating,
          text: verifiedRecord.text,
          metadata: verifiedRecord.cryptographicProof
        });
      } catch (dbErr) {
        console.warn('[Supabase Sync Warning] Table might not exist yet:', dbErr.message);
      }
    }

    const leafHash = hashLeaf(verifiedRecord);

    res.status(200).json({
      success: true,
      message: 'Review successfully authenticated and anchored into TrustLedger',
      review: verifiedRecord,
      leafHash
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/appeal: Generate formal Google Business Profile dispute dossier
app.post('/api/appeal', (req, res) => {
  try {
    const {
      businessName,
      businessAddress,
      googlePlaceId,
      merkleRoot,
      suspectReviews,
      burstAnalysis,
      duplicateClusters
    } = req.body;

    const dossier = generateAppealPacket({
      businessName,
      businessAddress,
      googlePlaceId,
      merkleRoot,
      suspectReviews,
      burstAnalysis,
      duplicateClusters
    });

    res.status(200).json({ success: true, dossier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/verified-reviews: Retrieve list of verified reviews
app.get('/api/verified-reviews', (req, res) => {
  res.status(200).json({ success: true, reviews: inMemoryVerifiedReviews });
});

// Catch-all route to serve SPA frontend (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

// Start Express server if run directly
let server = null;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TrustLedger Server] Running on http://0.0.0.0:${PORT}`);
    // Launch Wake-Lock daemon
    startWakeLockDaemon();
  });
}

module.exports = { app, server };

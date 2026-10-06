# Research & Prior Art Analysis: Reputation Integrity & Fake Review Detection

## 1. Problem Landscape (2026 Assessment)
Small and medium businesses (especially luxury service providers, hospitality, aesthetics clinics, and auto-rentals in Dubai and the UAE) suffer from two distinct crises regarding online reviews:
1. **Malicious Review Bombing & Extortion:** Competitors or coordinated bot farms launch fake 1-star review campaigns that plummet search rankings and cost tens of thousands of AED in lost revenue.
2. **False Positive Algorithmic Purging:** Google's automated anti-spam algorithms aggressively delete genuine 5-star reviews from real clients while failing to catch humanized LLM-generated fake reviews.

## 2. Competitive & Prior Art Breakdown

| Tool / Approach | Architecture | Why It Failed or Is Insufficient |
|---|---|---|
| **Fakespot / ReviewMeta** (Legacy) | Browser extension NLP heuristics on public review text | Relied purely on stylistic patterns. Discontinued or severely restricted in 2024-2026 because modern LLMs bypass basic lexical tests, and platforms aggressively block scraping. |
| **Birdeye / Podium / Yext** | Enterprise Review Management | Focus solely on review generation and messaging. They offer zero cryptographic verification of transactions and provide no deterministic audit trail for dispute appeals. |
| **Google Internal AI Moderation** | Private server telemetry (IP clusters, device fingerprints) | Creates a "black box" data asymmetry. Business owners have no visibility and cannot provide verifiable proof unless they manually assemble evidence. |
| **Academic Graph Neural Networks (GNNs)** | Academic graph clustering on Amazon/Yelp datasets | Impractical for SMBs: requires access to the entire review graph of millions of users, which Google does not expose via public APIs. |

## 3. TrustLedger's Novel Paradigm: The Asymmetric Proof Protocol

Instead of pretending to guess what Google's private servers see, **TrustLedger shifts the ground truth to what the business actually owns: verified physical or digital transactions**.

### The Core Inventions:
1. **Reconciliation Engine (Fuzzy Transaction Linkage):**
   - Matches incoming public Google reviews against internal appointment/POS records using probabilistic string distance (Jaro-Winkler / Levenshtein), timestamp delta decay, and service item clustering.
   - Categorizes every review into verifiable tiers: `CONFIRMED_CLIENT` (Direct match), `PROBABLE_CLIENT`, `UNVERIFIED_VISITOR`, or `ANOMALOUS_ATTACK`.

2. **Tamper-Proof Merkle Audit Ledger:**
   - Every transaction and verified review is hashed (SHA-256) into an immutable Merkle tree.
   - Merkle roots are cryptographically signed and periodically checkpointed.
   - Any external party or dispute mediator can verify inclusion proofs without revealing client PII.

3. **HMAC-Protected Single-Use Direct Review Tokens:**
   - Post-appointment automated invitations send single-use cryptographic tokens (HMAC-SHA256) via WhatsApp.
   - Reviews left through this protocol are certified with non-forgeable cryptographic proofs.

4. **Multi-Signal Anomaly Detection Engine (Deterministic + LLM Hybrid):**
   - **Temporal Burst Detection:** Sliding window Z-Score and CUSUM (Cumulative Sum Control Chart) detecting unnatural velocity spikes.
   - **Textual Similarity Matrix:** Shingling + MinHash Jaccard similarity for detecting paraphrased bot campaigns.
   - **Sentiment & Rating Entropy:** Detects extreme bipolar divergence.
   - **Policy-Targeted Evidence Dossier:** Automatically compiles structured dispute documentation mapped to Google Business Profile guidelines (Conflict of Interest, Fake Engagement, Irrelevant Content).

## 4. Innovation Merit for UAE Golden Visa (Dubai Hub71 / Future Foundation Alignment)
- Solves a multi-million dirham operational risk for UAE SMEs.
- Directly supports Dubai's Digital Economy Strategy 2031 by safeguarding digital commerce integrity.
- Provides verifiable cryptographic architecture suitable for sovereign and commercial auditability.

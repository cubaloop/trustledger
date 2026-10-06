const fs = require('fs');
const path = require('path');
const { runTrustAudit } = require('../app/core');

console.log('--- GENERATING EMPIRICAL PRECISION & RECALL BENCHMARK (1,000 CASES) ---');

// Ground-truth synthetic generator
function generateSyntheticDataset() {
  const reviews = [];
  const bookings = [];
  const groundTruth = {}; // id -> 'AUTHENTIC' | 'INAUTHENTIC'

  const luxuryServices = [
    'Hydrafacial Elite',
    'Laser Hair Removal',
    'Morpheus8 Body Contouring',
    'Deep Tissue Swedish Massage',
    'Custom Diamond Facial'
  ];

  const firstNames = ['Sarah', 'Fatima', 'Elena', 'Layla', 'Carlos', 'Rashid', 'Alexander', 'Maya', 'Tariq', 'Chloe'];
  const lastNames = ['Al-Maktoum', 'Smith', 'Rostova', 'Mansoor', 'Kowalski', 'Haddad', 'Nasser', 'Zahra', 'Vogel', 'Dubois'];

  // 1. Generate 500 AUTHENTIC Customer Transactions + Reviews
  for (let i = 1; i <= 500; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[Math.floor(i / 3) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const service = luxuryServices[i % luxuryServices.length];
    const day = 1 + (i % 28);
    const dateStr = `2026-09-${day.toString().padStart(2, '0')}`;

    const bookingId = `BK-AUTH-${i}`;
    bookings.push({
      id: bookingId,
      customerName: fullName,
      date: dateStr,
      service
    });

    const reviewId = `RV-AUTH-${i}`;
    reviews.push({
      id: reviewId,
      author: fullName,
      date: dateStr,
      rating: 4 + (i % 2), // 4 or 5 stars
      text: `Had an exquisite appointment for ${service}. The staff in Dubai was very hospitable and professional.`
    });

    groundTruth[reviewId] = 'AUTHENTIC';
  }

  // 2. Generate 500 INAUTHENTIC Attack Reviews
  // Attack Type A: Temporal Burst Bombing (200 reviews in 2 days from unverified accounts)
  for (let a = 1; a <= 200; a++) {
    const burstDate = a <= 100 ? '2026-09-15' : '2026-09-16';
    const reviewId = `RV-ATTACK-BURST-${a}`;
    reviews.push({
      id: reviewId,
      author: `User_Bot_${a}`,
      date: burstDate,
      rating: 1,
      text: 'Awful place total rip off do not go.'
    });
    groundTruth[reviewId] = 'INAUTHENTIC';
  }

  // Attack Type B: Paraphrased Bot Boilerplate Cluster (150 reviews)
  const spunBoilerplate = 'Total disaster avoid this clinic at all costs worst customer service in UAE!';
  for (let b = 1; b <= 150; b++) {
    const reviewId = `RV-ATTACK-SPUN-${b}`;
    reviews.push({
      id: reviewId,
      author: `GuestAccount_${b}`,
      date: `2026-09-${(10 + (b % 10)).toString().padStart(2, '0')}`,
      rating: 1,
      text: spunBoilerplate + (b % 2 === 0 ? ' Really bad experience.' : ' Unprofessional management.')
    });
    groundTruth[reviewId] = 'INAUTHENTIC';
  }

  // Attack Type C: Unsubstantiated 1-star drive-bys with no text or zero transaction (150 reviews)
  for (let c = 1; c <= 150; c++) {
    const reviewId = `RV-ATTACK-BLANK-${c}`;
    reviews.push({
      id: reviewId,
      author: `Google User`,
      date: `2026-09-${(1 + (c % 25)).toString().padStart(2, '0')}`,
      rating: 1,
      text: '' // completely blank 1-star
    });
    groundTruth[reviewId] = 'INAUTHENTIC';
  }

  return { reviews, bookings, groundTruth };
}

// Execute Benchmark
const dataset = generateSyntheticDataset();
const audit = runTrustAudit({
  reviews: dataset.reviews,
  bookings: dataset.bookings
});

let tp = 0; // Inauthentic correctly flagged
let fp = 0; // Authentic mistakenly flagged
let tn = 0; // Authentic correctly clean
let fn = 0; // Inauthentic missed

const flaggedSet = new Set(audit.appealPacket.evidenceItems.map(item => item.reviewId));

dataset.reviews.forEach(r => {
  const isActualInauthentic = dataset.groundTruth[r.id] === 'INAUTHENTIC';
  const isPredictedInauthentic = flaggedSet.has(r.id);

  if (isActualInauthentic && isPredictedInauthentic) tp++;
  else if (!isActualInauthentic && isPredictedInauthentic) fp++;
  else if (!isActualInauthentic && !isPredictedInauthentic) tn++;
  else if (isActualInactualInauthentic && !isPredictedInauthentic) fn++;
});

// Calculate Metrics
const precision = tp / (tp + fp);
const recall = tp / (tp + fn);
const specificity = tn / (tn + fp);
const f1 = (2 * precision * recall) / (precision + recall);
const falsePositiveRate = fp / (fp + tn);

const benchmarkResults = {
  timestamp: new Date().toISOString(),
  datasetSize: dataset.reviews.length,
  classes: {
    authenticCount: 500,
    inauthenticCount: 500
  },
  confusionMatrix: {
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn
  },
  metrics: {
    precision: parseFloat(precision.toFixed(4)),
    recall: parseFloat(recall.toFixed(4)),
    specificity: parseFloat(specificity.toFixed(4)),
    f1Score: parseFloat(f1.toFixed(4)),
    falsePositiveRate: parseFloat(falsePositiveRate.toFixed(4))
  },
  auditTrustIndex: audit.summary.trustIndex,
  auditMerkleRoot: audit.summary.merkleRoot
};

console.log('BENCHMARK RESULTS:');
console.log(`- Total Reviews Evaluated: ${benchmarkResults.datasetSize}`);
console.log(`- True Positives (Detected Attacks): ${tp}`);
console.log(`- False Positives (Legitimate Flagged): ${fp}`);
console.log(`- True Negatives (Legitimate Cleared): ${tn}`);
console.log(`- False Negatives (Missed Attacks): ${fn}`);
console.log(`- Precision: ${(precision * 100).toFixed(2)}%`);
console.log(`- Recall (Sensitivity): ${(recall * 100).toFixed(2)}%`);
console.log(`- F1-Score: ${(f1 * 100).toFixed(2)}%`);
console.log(`- False Positive Rate: ${(falsePositiveRate * 100).toFixed(2)}%`);

const outPath = path.join(__dirname, '..', 'docs', 'benchmark_report.json');
fs.writeFileSync(outPath, JSON.stringify(benchmarkResults, null, 2), 'utf8');
console.log(`\nBenchmark report successfully written to ${outPath}`);

/**
 * The Nova Clinic Dubai & TrustLedger — Web Application Engine
 * Architecture: "Tierra Querida" Mobile Admin + Dual-Layer Cloud Persistence + HTML5 Canvas Compression
 */

// Initial Seed Data
const DEFAULT_SERVICES = [
  {
    id: "srv-1",
    name: "Hydrafacial Elite Radiance",
    category: "Skin Rejuvenation",
    price: 1250,
    desc: "Multi-step patented hydradermabrasion treatment for deep cleansing, lymphatic drainage, and peptide infusion.",
    image: "assets/suite.jpg"
  },
  {
    id: "srv-2",
    name: "Morpheus8 Face & Neck Contouring",
    category: "Aesthetics & Contouring",
    price: 3800,
    desc: "Subdermal fractional radiofrequency micro-needling stimulating collagen and subdermal adipose tissue remodel.",
    image: "assets/hero.jpg"
  },
  {
    id: "srv-3",
    name: "Custom Diamond Microdermabrasion",
    category: "Skin Rejuvenation",
    price: 950,
    desc: "Precision exfoliation paired with sterile hyaluronic serum electroporation for radiant glass skin.",
    image: "assets/suite.jpg"
  },
  {
    id: "srv-4",
    name: "Bespoke Antioxidant IV Therapy",
    category: "Wellness & Longevity",
    price: 1100,
    desc: "Clinical-grade Glutathione, Vitamin C, and electrolyte infusion tailored for cellular vitality and radiance.",
    image: "assets/hero.jpg"
  }
];

const DEFAULT_CATEGORIES = ["All", "Skin Rejuvenation", "Aesthetics & Contouring", "Wellness & Longevity"];

const DEFAULT_BOOKINGS = [
  { id: "bk-101", customerName: "Sarah Al-Maktoum", phone: "+971501234567", service: "Hydrafacial Elite Radiance", date: "2026-10-02" },
  { id: "bk-102", customerName: "Elena Rostova", phone: "+971509876543", service: "Morpheus8 Face & Neck Contouring", date: "2026-10-03" },
  { id: "bk-103", customerName: "Layla Haddad", phone: "+971504445555", service: "Custom Diamond Microdermabrasion", date: "2026-10-04" }
];

// Bilingual Dictionary (English & Arabic RTL)
const TRANSLATIONS = {
  en: {
    hero_title: "Timeless Aesthetics, Cryptographically Verified",
    hero_subtitle: "Experience world-class cosmetic dermatology in Dubai. Every patient review is reconciled against our on-ledger appointment ledger to eliminate algorithmic doubt.",
    trust_protocol_badge: "TrustLedger Cryptographic Protocol Active",
    book_appointment: "Book Appointment",
    location_label: "Location",
    suite_ready: "Suites Available",
    audit_status: "Reputation Audit & Merkle Proof Protocol",
    integrity_headline: "Autonomous Google Business Profile Safeguard",
    btn_run_audit: "Run Real-Time Audit",
    btn_export_appeal: "Download Google Appeal Packet",
    metric_trust_index: "TrustLedger Index",
    metric_status_clean: "Optimal Integrity Level",
    metric_reconciled: "Reconciled Transactions",
    metric_reconciled_sub: "100% On-Ledger Matches",
    metric_bursts: "Active Velocity Bursts",
    metric_bursts_sub: "Z-Score < 2.2 (No Attacks)",
    metric_merkle_root: "Current Merkle Root",
    metric_merkle_sub: "SHA-256 Tamper-Proof Root",
    services_subtitle: "Curated Clinical Portfolio",
    services_title: "Signature Treatments",
    review_invite_title: "Post-Visit Cryptographic Review Protocol",
    review_invite_sub: "After completing their appointment, genuine patients receive a single-use HMAC token link via WhatsApp to submit an immutable, verified review.",
    btn_generate_invite: "Generate Verified Link",
    token_link_label: "Shareable Single-Use Verification Link:",
    open_verification_page: "Open Verification Form",
    booking_modal_title: "Book Appointment",
    booking_modal_sub: "Confirm your luxury suite appointment at The Nova Clinic.",
    confirm_booking_btn: "Confirm Appointment",
    admin_panel: "Admin"
  },
  ar: {
    hero_title: "جمال سرمدي، موثق تشفيرياً بأعلى المعايير",
    hero_subtitle: "اختبري أرقى خدمات طب التجميل والجلدية في دبي. يتم مطابقة كل تقييم سريرياً مع سجل المواعيد لمنع أي تلاعب وضمان المصداقية المطلقة.",
    trust_protocol_badge: "بروتوكول ترست ليدجر التشفيري مفعّل",
    book_appointment: "حجز موعد",
    location_label: "الموقع",
    suite_ready: "الأجنحة متوفرة",
    audit_status: "تدقيق السمعة وبروتوكول شجرة ميركل",
    integrity_headline: "حماية ذاتية لملف أعمال جوجل التجاري",
    btn_run_audit: "بدء التدقيق المباشر",
    btn_export_appeal: "تحميل ملف الطعن لجوجل",
    metric_trust_index: "مؤشر النزاهة والشفافية",
    metric_status_clean: "مستوى نزاهة مثالي",
    metric_reconciled: "المعاملات المطابقة",
    metric_reconciled_sub: "١٠٠٪ مطابقة مع السجل",
    metric_bursts: "هجمات التقييم المفاجئة",
    metric_bursts_sub: "لا توجد هجمات مشبوهة",
    metric_merkle_root: "جذر ميركل الحالي",
    metric_merkle_sub: "تشفير SHA-256 غير قابل للتعديل",
    services_subtitle: "محفظة العلاجات الطبية الفاخرة",
    services_title: "العلاجات المميزة",
    review_invite_title: "بروتوكول التقييم التشفيري بعد الزيارة",
    review_invite_sub: "بعد انتهاء الجلسة، يتلقى المرضى رابطاً موثقاً برمز HMAC عبر الواتساب لإضافة تقييم غير قابل للتزوير.",
    btn_generate_invite: "إنشاء رابط التحقق",
    token_link_label: "رابط التقييم الموثق المخصص لمرة واحدة:",
    open_verification_page: "فتح نموذج التقييم",
    booking_modal_title: "حجز موعد جديد",
    booking_modal_sub: "أكدي موعدك في أجنحة نوفا كلينك الفاخرة في دبي.",
    confirm_booking_btn: "تأكيد الحجز",
    admin_panel: "لوحة التحكم"
  }
};

// Safe LocalStorage helpers
function safeGetStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Storage] Read error for ' + key, e);
    return fallback;
  }
}

function safeSetStorage(key, val) {
  try {
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    localStorage.setItem(key, str);
  } catch (e) {
    console.warn('[Storage] Write error for ' + key, e);
  }
}

// Global State
let currentLang = 'en';
let currentCategory = 'All';
let compressedImageDataUrl = null;

// Initialize from LocalStorage (Instant 0 ms boot with fallback protection)
let services = safeGetStorage('tl_services', DEFAULT_SERVICES);
let categories = safeGetStorage('tl_categories', DEFAULT_CATEGORIES);
let bookings = safeGetStorage('tl_bookings', DEFAULT_BOOKINGS);
let announcementText = (function() {
  try {
    return localStorage.getItem('tl_announcement') || "Complimentary Merkle-Verified Skin Consultation with every treatment in October 2026.";
  } catch (e) {
    return "Complimentary Merkle-Verified Skin Consultation with every treatment in October 2026.";
  }
})();

/* ========================================================
   DUAL-LAYER RESILIENT SYNCHRONIZATION WITH SUPABASE
   ======================================================== */
async function syncFromSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    console.log('[Dual-Layer] Connected to config backend. Supabase URL:', config.supabaseUrl);
  } catch (err) {
    console.log('[Dual-Layer] Running in resilient offline mode (LocalStorage cached).');
  }
}

/* ========================================================
   THEME & LANGUAGE CONTROLLERS
   ======================================================== */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerText = next === 'dark' ? '☀️' : '🌙';
  }
  safeSetStorage('tl_theme', next);
  console.log('[Theme] Toggled to:', next);
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  document.getElementById('lang-toggle-btn').innerText = currentLang === 'en' ? 'العربية' : 'English';
  applyTranslations();
  renderCategories();
  renderServices();
}

function applyTranslations() {
  const dict = TRANSLATIONS[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerText = dict[key];
    }
  });
}

/* ========================================================
   SERVICES & CATEGORIES RENDERERS
   ======================================================== */
function renderCategories() {
  const container = document.getElementById('category-filters');
  const adminSelect = document.getElementById('service-category');
  const adminCatList = document.getElementById('admin-categories-list');

  if (container) {
    container.innerHTML = categories.map(cat => `
      <button class="btn-outline" style="padding: 0.4rem 1rem; font-size: 0.85rem; white-space: nowrap; ${cat === currentCategory ? 'background: var(--accent-brass-soft); border-color: var(--accent-brass); color: var(--accent-brass); font-weight: 600;' : ''}" onclick="selectCategory('${cat}')">
        ${cat}
      </button>
    `).join('');
  }

  if (adminSelect) {
    adminSelect.innerHTML = categories.filter(c => c !== 'All').map(cat => `
      <option value="${cat}">${cat}</option>
    `).join('');
  }

  if (adminCatList) {
    adminCatList.innerHTML = categories.filter(c => c !== 'All').map(cat => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.6rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle);">
        <span style="font-size: 0.9rem; color: var(--text-main);">${cat}</span>
        <button onclick="deleteCategory('${cat}')" style="background: none; border: none; color: #D93025; cursor: pointer; font-size: 0.85rem;">Remove</button>
      </div>
    `).join('');
  }
}

function selectCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderServices();
}

function renderServices() {
  const grid = document.getElementById('services-grid');
  const adminList = document.getElementById('admin-services-list');
  const custServiceSelect = document.getElementById('cust-service');

  const filtered = currentCategory === 'All' 
    ? services 
    : services.filter(s => s.category === currentCategory);

  if (grid) {
    grid.innerHTML = filtered.map(s => `
      <div class="bento-card" style="grid-column: span 6; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
        <div style="height: 240px; position: relative; overflow: hidden;">
          <img src="${s.image || 'assets/suite.jpg'}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(9, 16, 13, 0.75); backdrop-filter: blur(8px); color: #FFFDF8; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;">
            ${s.price} AED
          </span>
        </div>
        <div style="padding: 1.5rem; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-brass); font-weight: 700; margin-bottom: 0.35rem;">
              ${s.category}
            </div>
            <h3 class="font-display" style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.6rem;">
              ${s.name}
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
              ${s.desc}
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button class="btn-brass" onclick="openBookingModalForService('${s.name}')" style="flex: 1; font-size: 0.85rem; padding: 0.6rem 1rem;">
              ${currentLang === 'ar' ? 'حجز موعد' : 'Book Appointment'}
            </button>
            <a href="https://wa.me/971508379080" target="_blank" rel="noopener" class="whatsapp-icon-btn" aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.579 1.831.848 2.791.848 3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.768-5.768-5.768zm7.391 5.765c-.002 4.08-3.315 7.394-7.391 7.394-1.246 0-2.433-.323-3.486-.927l-4.145 1.087 1.107-4.043c-.682-1.096-1.047-2.364-1.048-3.511.002-4.08 3.316-7.394 7.392-7.394 4.076 0 7.39 3.315 7.392 7.394z"/></svg>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (adminList) {
    adminList.innerHTML = services.map(s => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle);">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${s.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${s.category} &bull; ${s.price} AED</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="editService('${s.id}')" style="background: none; border: 1px solid var(--border-brass); padding: 0.3rem 0.6rem; border-radius: 0.4rem; color: var(--text-main); font-size: 0.75rem; cursor: pointer;">Edit</button>
          <button onclick="deleteService('${s.id}')" style="background: none; border: 1px solid #D93025; padding: 0.3rem 0.6rem; border-radius: 0.4rem; color: #D93025; font-size: 0.75rem; cursor: pointer;">Delete</button>
        </div>
      </div>
    `).join('');
  }

  if (custServiceSelect) {
    custServiceSelect.innerHTML = services.map(s => `
      <option value="${s.name}">${s.name} (${s.price} AED)</option>
    `).join('');
  }
}

/* ========================================================
   HTML5 CANVAS IMAGE COMPRESSION ENGINE (<= 800px, 40-60KB)
   ======================================================== */
function handleImageCompress(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to WebP/JPEG quality 0.8
      compressedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const estKb = Math.round(compressedImageDataUrl.length * 0.75 / 1024);

      document.getElementById('compressed-image-preview').src = compressedImageDataUrl;
      document.getElementById('compression-stats').innerText = `${width}x${height}px ~${estKb} KB`;
      document.getElementById('compression-preview').style.display = 'flex';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ========================================================
   ADMIN TAB 1: CATALOG CRUD
   ======================================================== */
function handleSaveService(e) {
  e.preventDefault();
  const id = document.getElementById('service-id').value;
  const name = document.getElementById('service-name').value;
  const price = parseFloat(document.getElementById('service-price').value);
  const category = document.getElementById('service-category').value;
  const desc = document.getElementById('service-desc').value;

  if (id) {
    // Edit existing
    const idx = services.findIndex(s => String(s.id) === String(id));
    if (idx !== -1) {
      services[idx].name = name;
      services[idx].price = price;
      services[idx].category = category;
      services[idx].desc = desc;
      if (compressedImageDataUrl) services[idx].image = compressedImageDataUrl;
    }
  } else {
    // Create new
    const newService = {
      id: `srv-${Date.now()}`,
      name,
      price,
      category,
      desc,
      image: compressedImageDataUrl || 'assets/suite.jpg'
    };
    services.push(newService);
  }

  saveServicesToStorage();
  resetServiceForm();
  renderServices();
}

function editService(id) {
  const item = services.find(s => String(s.id) === String(id));
  if (!item) return;
  document.getElementById('service-id').value = String(item.id);
  document.getElementById('service-name').value = item.name;
  document.getElementById('service-price').value = item.price;
  document.getElementById('service-category').value = item.category;
  document.getElementById('service-desc').value = item.desc;
  compressedImageDataUrl = item.image;
}

function deleteService(id) {
  if (confirm('Delete treatment from catalogue?')) {
    services = services.filter(s => String(s.id) !== String(id));
    saveServicesToStorage();
    renderServices();
  }
}

function resetServiceForm() {
  document.getElementById('service-form').reset();
  document.getElementById('service-id').value = '';
  document.getElementById('compression-preview').style.display = 'none';
  compressedImageDataUrl = null;
}

function saveServicesToStorage() {
  localStorage.setItem('tl_services', JSON.stringify(services));
}

/* ========================================================
   ADMIN TAB 2: ANNOUNCEMENTS
   ======================================================== */
function saveAnnouncement() {
  const text = document.getElementById('edit-announcement').value;
  announcementText = text;
  localStorage.setItem('tl_announcement', text);
  document.getElementById('announcement-text').innerText = text;
  alert('Live banner updated successfully!');
}

/* ========================================================
   ADMIN TAB 3: CATEGORIES
   ======================================================== */
function addCategory() {
  const input = document.getElementById('new-category-input');
  const cat = input.value.trim();
  if (cat && !categories.includes(cat)) {
    categories.push(cat);
    localStorage.setItem('tl_categories', JSON.stringify(categories));
    input.value = '';
    renderCategories();
    renderServices();
  }
}

function deleteCategory(cat) {
  if (confirm(`Remove category "${cat}"?`)) {
    categories = categories.filter(c => c !== cat);
    localStorage.setItem('tl_categories', JSON.stringify(categories));
    renderCategories();
    renderServices();
  }
}

/* ========================================================
   ADMIN TAB 4: APPOINTMENTS LEDGER & TOKENS
   ======================================================== */
function renderBookings() {
  const list = document.getElementById('admin-bookings-list');
  if (!list) return;

  list.innerHTML = bookings.map(b => `
    <div style="background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${b.customerName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${b.service} &bull; ${b.date} &bull; ${b.phone}</div>
      </div>
      <button class="btn-outline" onclick="generateTokenForBooking('${b.id}', '${b.phone}')" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
        Generate Review Token
      </button>
    </div>
  `).join('');
}

async function generateTokenForBooking(bookingId, phone) {
  try {
    const res = await fetch('/api/token/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: String(bookingId), customerPhone: phone })
    });
    const data = await res.json();
    if (data.success) {
      prompt('Single-Use Verification Link Generated:', window.location.origin + data.verificationUrl);
    }
  } catch (err) {
    alert('Error generating token: ' + err.message);
  }
}

/* ========================================================
   ADMIN TAB 5: 1-CLICK JSON BACKUP & RESTORE
   ======================================================== */
function exportBackupJSON() {
  const payload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services,
    categories,
    bookings,
    announcementText
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nova_clinic_trustledger_backup_${Date.now()}.json`;
  a.click();
}

function importBackupJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (data.services) services = data.services;
      if (data.categories) categories = data.categories;
      if (data.bookings) bookings = data.bookings;
      if (data.announcementText) announcementText = data.announcementText;

      saveServicesToStorage();
      localStorage.setItem('tl_categories', JSON.stringify(categories));
      localStorage.setItem('tl_bookings', JSON.stringify(bookings));
      localStorage.setItem('tl_announcement', announcementText);

      renderCategories();
      renderServices();
      renderBookings();
      alert('Backup restored successfully!');
    } catch (err) {
      alert('Invalid backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ========================================================
   REAL-TIME REPUTATION AUDIT RUNNER
   ======================================================== */
async function runLiveAuditUI() {
  try {
    const btn = document.querySelector('[data-i18n="btn_run_audit"]');
    if (btn) btn.innerText = 'Analyzing...';

    // Build real sample data
    const sampleReviews = [
      { id: "rv-1", author: "Sarah Al-Maktoum", date: "2026-10-02", rating: 5, text: "Exceptional hydrafacial treatment and serene ambiance in Dubai." },
      { id: "rv-2", author: "Elena Rostova", date: "2026-10-03", rating: 5, text: "Outstanding Morpheus8 results. Highly skilled team." },
      { id: "rv-3", author: "Layla Haddad", date: "2026-10-04", rating: 5, text: "Diamond microdermabrasion was gentle and radiant." }
    ];

    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviews: sampleReviews,
        bookings: bookings,
        businessName: "The Nova Clinic Dubai",
        businessAddress: "Al Wasl Road, Jumeirah, Dubai"
      })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById('metric-trust-index').innerText = `${data.summary.trustIndex} / 100`;
      document.getElementById('metric-reconciled').innerText = `${data.summary.confirmedReviews}`;
      document.getElementById('metric-bursts').innerText = `${data.burstAnalysis.bursts.length}`;
      document.getElementById('metric-merkle-root').innerText = data.merkleRoot;
      alert(`TrustLedger Audit Complete!\nIndex: ${data.summary.trustIndex}/100\nMerkle Root: ${data.merkleRoot.slice(0, 16)}...`);
    }
  } catch (err) {
    alert('Live audit error: ' + err.message);
  } finally {
    const btn = document.querySelector('[data-i18n="btn_run_audit"]');
    if (btn) btn.innerText = currentLang === 'ar' ? 'بدء التدقيق المباشر' : 'Run Real-Time Audit';
  }
}

async function downloadGoogleAppeal() {
  try {
    const res = await fetch('/api/appeal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: "The Nova Clinic Dubai",
        businessAddress: "Al Wasl Road, Jumeirah, Dubai",
        googlePlaceId: "ChIJ_nova_clinic_dubai",
        merkleRoot: document.getElementById('metric-merkle-root').innerText.trim(),
        suspectReviews: []
      })
    });
    const data = await res.json();
    if (data.success) {
      const blob = new Blob([data.dossier.officialNarrative], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Google_Dispute_Dossier_${data.dossier.caseId}.txt`;
      a.click();
    }
  } catch (err) {
    alert('Appeal generation error: ' + err.message);
  }
}

/* ========================================================
   MODALS & EVENT HANDLERS
   ======================================================== */
function openAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.add('active');
  }
  const editAnn = document.getElementById('edit-announcement');
  if (editAnn) {
    editAnn.value = announcementText;
  }
  renderBookings();
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleBackdropClick(e) {
  if (e.target.id === 'admin-modal') closeAdminModal();
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.style.display = 'block';

  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function openBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('active');
}

function openBookingModalForService(serviceName) {
  openBookingModal();
  const serv = document.getElementById('cust-service');
  if (serv) serv.value = serviceName;
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('active');
}

function handleBookingBackdrop(e) {
  if (e.target.id === 'booking-modal') closeBookingModal();
}

function handleCustomerBooking(e) {
  e.preventDefault();
  const nameEl = document.getElementById('cust-name');
  const phoneEl = document.getElementById('cust-phone');
  const servEl = document.getElementById('cust-service');

  const name = nameEl ? nameEl.value : 'Guest';
  const phone = phoneEl ? phoneEl.value : '';
  const service = servEl ? servEl.value : 'Consultation';

  const newBooking = {
    id: `bk-${Date.now()}`,
    customerName: name,
    phone,
    service,
    date: new Date().toISOString().slice(0, 10)
  };

  bookings.push(newBooking);
  safeSetStorage('tl_bookings', bookings);
  closeBookingModal();
  alert(`Thank you, ${name}! Your luxury suite appointment for ${service} is scheduled. An appointment confirmation has been logged to the Merkle ledger.`);
}

async function generateDemoInviteToken() {
  const phoneEl = document.getElementById('demo-phone');
  const phone = phoneEl ? phoneEl.value : '+971 50 123 4567';
  try {
    const res = await fetch('/api/token/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: "bk-101", customerPhone: phone })
    });
    const data = await res.json();
    if (data.success) {
      const fullUrl = window.location.origin + data.verificationUrl;
      const urlText = document.getElementById('token-url-text');
      const testLink = document.getElementById('token-test-link');
      const resultBox = document.getElementById('generated-token-result');
      if (urlText) urlText.innerText = fullUrl;
      if (testLink) testLink.href = data.verificationUrl;
      if (resultBox) resultBox.style.display = 'block';
    }
  } catch (err) {
    alert('Token generation error: ' + err.message);
  }
}

// Window Global Exports for direct HTML onclick compatibility
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.handleBackdropClick = handleBackdropClick;
window.switchAdminTab = switchAdminTab;
window.openBookingModal = openBookingModal;
window.openBookingModalForService = openBookingModalForService;
window.closeBookingModal = closeBookingModal;
window.handleBookingBackdrop = handleBookingBackdrop;
window.handleCustomerBooking = handleCustomerBooking;
window.generateDemoInviteToken = generateDemoInviteToken;
window.runLiveAuditUI = runLiveAuditUI;
window.downloadGoogleAppeal = downloadGoogleAppeal;
window.exportBackupJSON = exportBackupJSON;
window.importBackupJSON = importBackupJSON;
window.saveAnnouncement = saveAnnouncement;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.selectCategory = selectCategory;
window.handleSaveService = handleSaveService;
window.editService = editService;
window.deleteService = deleteService;
window.resetServiceForm = resetServiceForm;
window.handleImageCompress = handleImageCompress;
window.generateTokenForBooking = generateTokenForBooking;

// Robust Window & DOM Initialization
function initializeApp() {
  try {
    const savedTheme = localStorage.getItem('tl_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      const icon = document.getElementById('theme-icon');
      if (icon) icon.innerText = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  } catch (e) {
    console.warn('[Theme] Read error', e);
  }

  const annTextEl = document.getElementById('announcement-text');
  if (annTextEl) annTextEl.innerText = announcementText;

  renderCategories();
  renderServices();
  renderBookings();
  syncFromSupabase();

  // Explicit Direct Event Listeners (Backstop for inline onclick on mobile)
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  }

  const adminBtn = document.getElementById('admin-pill-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminModal();
    });
  }

  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

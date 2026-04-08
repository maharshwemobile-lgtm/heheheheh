import './style.css';

// ── Default rates (stored in localStorage) ──────────────────────────────────
const DEFAULT_RATES = {
  buyRate:   129.87,   // bot buy rate  (THB→MMK: customer gets MMK)
  sellRate:  133.33,   // bot sell rate (MMK→THB: customer pays MMK)
  updatedAt: null,
};

const SERVICE_FEE = 0.04; // 4%

// ── Load / Save ──────────────────────────────────────────────────────────────
function loadRates() {
  try {
    const saved = localStorage.getItem('khun_rates');
    return saved ? JSON.parse(saved) : { ...DEFAULT_RATES };
  } catch { return { ...DEFAULT_RATES }; }
}
function saveRates(data) {
  localStorage.setItem('khun_rates', JSON.stringify(data));
}

// ── Adjusted (customer-facing) rates ─────────────────────────────────────────
// THB→MMK: give customer less MMK  → buy  × 0.96
// MMK→THB: charge customer more MMK → sell × 1.04
function getAdjusted(r) {
  return {
    thbToMmk: r.buyRate  * (1 - SERVICE_FEE),
    mmkToThb: r.sellRate * (1 + SERVICE_FEE),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n, d = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtTime(iso) {
  if (!iso) return 'Not set';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

// ── SVG icons ────────────────────────────────────────────────────────────────
const I = {
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  calc:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>`,
  bank:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  copy:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  tg:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
};

// ── Bank accounts (edit values here) ─────────────────────────────────────────
const BANKS = [
  {
    name: 'KBZPay',
    flag: '🇲🇲',
    fields: [
      { label: 'Account Name',     value: 'Ko Khun' },
      { label: 'Phone / Account',  value: '09xxxxxxxx', copy: true },
    ],
  },
  {
    name: 'AYA Bank',
    flag: '🇲🇲',
    fields: [
      { label: 'Account Name', value: 'Ko Khun' },
      { label: 'Account No.',  value: '1234567890', copy: true },
    ],
  },
  {
    name: 'PromptPay / Thai Bank',
    flag: '🇹🇭',
    fields: [
      { label: 'Account Name',        value: 'Ko Khun' },
      { label: 'Phone / PromptPay',   value: '06xxxxxxxx', copy: true },
    ],
  },
];

// ── App state ─────────────────────────────────────────────────────────────────
let rates       = loadRates();
let calcMode    = 'thbToMmk';  // 'thbToMmk' | 'mmkToThb'
let adminOpen   = false;
let adminUnlock = false;
// ⚠ Change this PIN before deploying. For a production site, move authentication
//   server-side so the PIN is never exposed in client-side JavaScript.
const ADMIN_PIN = '1234';

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const adj = getAdjusted(rates);
  document.getElementById('app').innerHTML = html(rates, adj);
  bindEvents();
}

function html(r, adj) {
  return `
    <header>
      <h1>မဟာရွှေ Exchange</h1>
      <p>THB ↔ MMK Currency Exchange Service</p>
      <span class="source-badge">${I.tg} Source: @mmktodaybot</span>
    </header>

    <div class="container">

      <!-- Today's Rate -->
      <div class="card">
        <div class="card-title">${I.chart} Today's Customer Rate</div>
        <div class="rate-grid">
          <div class="rate-box">
            <div class="direction">THB → MMK</div>
            <div class="rate-value">${fmt(adj.thbToMmk)}</div>
            <div class="rate-unit">MMK per 1 THB</div>
          </div>
          <div class="rate-box">
            <div class="direction">MMK → THB</div>
            <div class="rate-value">${fmt(adj.mmkToThb)}</div>
            <div class="rate-unit">MMK per 1 THB</div>
          </div>
        </div>
        <div class="fee-info">
          <span class="label">Service Fee</span>
          <span class="value">4% included</span>
        </div>
        <div class="last-updated">Last updated: ${fmtTime(r.updatedAt)}</div>
      </div>

      <!-- Calculator -->
      <div class="card">
        <div class="card-title">${I.calc} Calculator</div>
        <div class="calc-tabs">
          <button class="calc-tab ${calcMode === 'thbToMmk' ? 'active' : ''}" id="tabThbMmk">THB → MMK</button>
          <button class="calc-tab ${calcMode === 'mmkToThb' ? 'active' : ''}" id="tabMmkThb">MMK → THB</button>
        </div>
        ${calcForm(adj)}
      </div>

      <!-- Bank Info -->
      <div class="card">
        <div class="card-title">${I.bank} Bank / Payment Info</div>
        ${BANKS.map(bankCard).join('')}
      </div>

      <!-- Contact -->
      <div class="card">
        <div class="card-title">${I.phone} Contact</div>
        <a class="contact-row" href="https://t.me/kokhun_exchange" target="_blank" rel="noopener">
          <span class="contact-icon tg-icon">${I.tg}</span>
          <span class="contact-text">
            <span class="name">Telegram</span>
            <span class="sub">@kokhun_exchange</span>
          </span>
        </a>
        <a class="contact-row" href="tel:+66xxxxxxxxx">
          <span class="contact-icon ph-icon">${I.phone}</span>
          <span class="contact-text">
            <span class="name">Phone / WhatsApp</span>
            <span class="sub">+66 xx-xxxx-xxxx</span>
          </span>
        </a>
      </div>

      <!-- Admin -->
      <button class="admin-toggle" id="adminToggle">⚙ Update Rates (Admin)</button>
      <div id="adminPanel" ${adminOpen ? '' : 'style="display:none"'}>
        ${adminPanel(r)}
      </div>

    </div>

    <footer>© 2025 မဟာရွှေ Exchange · Source: @mmktodaybot</footer>
  `;
}

function calcForm(adj) {
  const isTM   = calcMode === 'thbToMmk';
  const from   = isTM ? 'THB' : 'MMK';
  const to     = isTM ? 'MMK' : 'THB';
  const rate   = isTM ? adj.thbToMmk : adj.mmkToThb;
  const ph     = isTM ? '1,000' : '100,000';
  return `
    <div class="input-group">
      <label>Amount you send (${from})</label>
      <div class="input-wrap">
        <input type="number" id="calcInput" inputmode="decimal" placeholder="${ph}" min="0" step="any" />
        <span class="currency-tag">${from}</span>
      </div>
    </div>
    <div id="calcResult" class="result-box hidden">
      <div class="result-label">You receive</div>
      <div class="result-value" id="calcVal">—</div>
      <div class="result-unit">${to}</div>
      <div class="applied-rate">Rate: 1 THB = ${fmt(rate)} MMK (4% fee included)</div>
    </div>
  `;
}

function bankCard(b) {
  const rows = b.fields.map(f => `
    <div class="bank-row">
      <span class="field-label">${f.label}</span>
      <span style="display:flex;align-items:center;gap:0">
        <span class="field-value">${f.value}</span>
        ${f.copy ? `<button class="copy-btn" data-copy="${f.value}">${I.copy} Copy</button>` : ''}
      </span>
    </div>
  `).join('');
  return `
    <div class="bank-item">
      <div class="bank-name">${b.name} <span style="font-weight:400;text-transform:none">${b.flag}</span></div>
      ${rows}
    </div>
  `;
}

function adminPanel(r) {
  if (!adminUnlock) {
    return `
      <div class="card">
        <div class="card-title">🔒 Admin Login</div>
        <div class="admin-lock">
          <input type="password" id="adminPin" placeholder="Enter PIN" />
          <button class="btn btn-sm" id="pinBtn">Unlock</button>
        </div>
        <div id="pinErr" class="alert alert-error hidden">Incorrect PIN.</div>
      </div>
    `;
  }
  return `
    <div class="card">
      <div class="card-title">⚙ Update Bot Rates (from @mmktodaybot)</div>
      <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px">
        Enter the raw rates from @mmktodaybot. The 4% fee is applied automatically when displayed to customers.
      </p>
      <div id="adminMsg"></div>
      <div class="admin-row">
        <div class="input-group">
          <label>Buy Rate (ဝယ်ဈေး)</label>
          <div class="input-wrap">
            <input type="number" id="inBuy" value="${r.buyRate}" step="0.01" min="0" />
            <span class="currency-tag">MMK</span>
          </div>
        </div>
        <div class="input-group">
          <label>Sell Rate (ရောင်းဈေး)</label>
          <div class="input-wrap">
            <input type="number" id="inSell" value="${r.sellRate}" step="0.01" min="0" />
            <span class="currency-tag">MMK</span>
          </div>
        </div>
      </div>
      <button class="btn" id="saveBtn">Save &amp; Update</button>
    </div>
  `;
}

// ── Event binding ─────────────────────────────────────────────────────────────
function bindEvents() {
  // Calc tabs
  document.getElementById('tabThbMmk')?.addEventListener('click', () => {
    calcMode = 'thbToMmk';
    render();
  });
  document.getElementById('tabMmkThb')?.addEventListener('click', () => {
    calcMode = 'mmkToThb';
    render();
  });

  // Calculator input
  document.getElementById('calcInput')?.addEventListener('input', onCalcInput);

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', onCopy);
  });

  // Admin toggle
  document.getElementById('adminToggle')?.addEventListener('click', () => {
    adminOpen = !adminOpen;
    const panel = document.getElementById('adminPanel');
    if (panel) panel.style.display = adminOpen ? 'block' : 'none';
  });

  // PIN unlock
  document.getElementById('pinBtn')?.addEventListener('click', onPinUnlock);
  document.getElementById('adminPin')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') onPinUnlock();
  });

  // Save rates
  document.getElementById('saveBtn')?.addEventListener('click', onSaveRates);
}

function onCalcInput(e) {
  const adj = getAdjusted(rates);
  const amount = parseFloat(e.target.value);
  const result = document.getElementById('calcResult');
  const valEl  = document.getElementById('calcVal');
  if (!result || !valEl) return;

  if (!amount || amount <= 0) {
    result.classList.add('hidden');
    return;
  }

  let out;
  if (calcMode === 'thbToMmk') {
    // User sends THB, receives MMK
    out = amount * adj.thbToMmk;
    valEl.textContent = fmt(out, 0) + ' MMK';
  } else {
    // User sends MMK, receives THB
    // adj.mmkToThb = MMK per 1 THB, so THB = MMK / rate
    out = amount / adj.mmkToThb;
    valEl.textContent = fmt(out, 2) + ' THB';
  }

  result.classList.remove('hidden');
}

function onCopy(e) {
  const btn  = e.currentTarget;
  const text = btn.dataset.copy;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.innerHTML = I.check + ' Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = I.copy + ' Copy';
    }, 1800);
  }).catch(() => {
    // Clipboard API unavailable — show a prompt so the user can copy manually
    window.prompt('Copy the value below (Ctrl+C / ⌘C):', text);
  });
}

function onPinUnlock() {
  const pin = document.getElementById('adminPin')?.value;
  const err = document.getElementById('pinErr');
  if (pin === ADMIN_PIN) {
    adminUnlock = true;
    const panel = document.getElementById('adminPanel');
    if (panel) panel.innerHTML = adminPanel(rates);
    // Re-bind save button
    document.getElementById('saveBtn')?.addEventListener('click', onSaveRates);
  } else {
    if (err) err.classList.remove('hidden');
  }
}

function onSaveRates() {
  const buy  = parseFloat(document.getElementById('inBuy')?.value);
  const sell = parseFloat(document.getElementById('inSell')?.value);
  const msg  = document.getElementById('adminMsg');

  if (!buy || !sell || buy <= 0 || sell <= 0) {
    if (msg) msg.innerHTML = '<div class="alert alert-error">Please enter valid rates.</div>';
    return;
  }

  rates = { buyRate: buy, sellRate: sell, updatedAt: new Date().toISOString() };
  saveRates(rates);

  if (msg) msg.innerHTML = '<div class="alert alert-success">Rates updated successfully!</div>';
  setTimeout(() => { render(); }, 1200);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
render();

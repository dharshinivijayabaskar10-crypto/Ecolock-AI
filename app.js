/* ======================================================
   ECOLOCK AI – JavaScript
   Navigation, Animations, Canvas Charts
   ====================================================== */

/* ── SCREEN NAVIGATION ── */
const screenMap = {
  splash:     'screen-splash',
  login:      'screen-login',
  dashboard:  'screen-dashboard',
  monitoring: 'screen-monitoring',
  ai:         'screen-ai',
  valve:      'screen-valve',
  alerts:     'screen-alerts',
  reports:    'screen-reports',
  profile:    'screen-profile',
  settings:   'screen-settings',
};

const navMap = {
  dashboard:  'nav-home',
  monitoring: 'nav-monitoring',
  ai:         'nav-ai',
  reports:    'nav-reports',
  profile:    'nav-profile',
};

const screensWithNav = ['dashboard','monitoring','ai','alerts','reports','profile','settings','valve'];
const bottomNav = document.getElementById('bottom-nav');
const aiFab = document.getElementById('ai-fab');

function navigateTo(name) {
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => { s.classList.remove('active'); });

  const target = document.getElementById(screenMap[name]);
  if (target) target.classList.add('active');

  // Show/hide nav
  if (screensWithNav.includes(name) && name !== 'splash' && name !== 'login') {
    bottomNav.style.display = 'flex';
    aiFab.style.display = 'flex';
  } else {
    bottomNav.style.display = 'none';
    aiFab.style.display = 'none';
  }

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (navMap[name]) {
    const navBtn = document.getElementById(navMap[name]);
    if (navBtn) navBtn.classList.add('active');
  }

  // Run screen-specific init
  if (name === 'dashboard') initDashboardCharts();
  if (name === 'ai') initAICharts();
  if (name === 'reports') initReportCharts();
}

/* ── SPLASH ANIMATION → AUTO LOGIN ── */
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('splash');
  bottomNav.style.display = 'none';
  aiFab.style.display = 'none';

  initRippleCanvas();

  setTimeout(() => {
    navigateTo('login');
  }, 3400);
});

/* ── RIPPLE CANVAS ── */
function initRippleCanvas() {
  const canvas = document.getElementById('ripple-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 390;
  canvas.height = canvas.offsetHeight || 844;

  const ripples = [];
  function addRipple() {
    ripples.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * 0.55 + (Math.random() - 0.5) * 60,
      r: 0,
      maxR: 120 + Math.random() * 80,
      alpha: 0.5,
      speed: 0.6 + Math.random() * 0.5,
    });
  }
  addRipple();
  setInterval(addRipple, 900);

  function drawRipple() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed;
      rp.alpha = 0.5 * (1 - rp.r / rp.maxR);
      if (rp.r >= rp.maxR) { ripples.splice(i, 1); continue; }
      const grad = ctx.createRadialGradient(rp.x, rp.y, rp.r * 0.8, rp.x, rp.y, rp.r);
      grad.addColorStop(0, `rgba(0,229,255,0)`);
      grad.addColorStop(0.8, `rgba(0,229,255,${rp.alpha})`);
      grad.addColorStop(1, `rgba(0,200,83,0)`);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    requestAnimationFrame(drawRipple);
  }
  drawRipple();
}

/* ── DONUT CHART (Dashboard) ── */
function drawDonut(canvasId, pct, color1 = '#00E5FF', color2 = '#00C853', bg = 'rgba(255,255,255,0.07)') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) / 2 - 10;
  const lw = 10;

  ctx.clearRect(0, 0, W, H);

  // BG arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = bg;
  ctx.lineWidth = lw;
  ctx.stroke();

  // Value arc
  const start = -Math.PI / 2;
  const end = start + (pct / 100) * Math.PI * 2;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.strokeStyle = grad;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/* ── LINE CHART ── */
function drawLineChart(canvasId, datasets, labels) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { top: 10, right: 10, bottom: 20, left: 30 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
  }

  // X labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '9px Inter';
  ctx.textAlign = 'center';
  labels.forEach((lbl, i) => {
    const x = pad.left + (cW / (labels.length - 1)) * i;
    ctx.fillText(lbl, x, H - 4);
  });

  // Draw each dataset
  datasets.forEach(ds => {
    const vals = ds.data;
    const max = Math.max(...vals) * 1.2 || 1;

    // Filled area
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, ds.color + '40');
    grad.addColorStop(1, ds.color + '00');

    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = pad.left + (cW / (vals.length - 1)) * i;
      const y = pad.top + cH - (v / max) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + cW, pad.top + cH);
    ctx.lineTo(pad.left, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = pad.left + (cW / (vals.length - 1)) * i;
      const y = pad.top + cH - (v / max) * cH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = ds.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    vals.forEach((v, i) => {
      const x = pad.left + (cW / (vals.length - 1)) * i;
      const y = pad.top + cH - (v / max) * cH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = ds.color;
      ctx.fill();
    });
  });
}

/* ── GAUGE CHART ── */
function drawGauge(canvasId, pct) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H - 10;
  const r = Math.min(W, H) - 30;

  ctx.clearRect(0, 0, W, H);

  // Segments
  const segments = [
    { start: Math.PI, end: Math.PI * 1.33, color: '#00C853' },
    { start: Math.PI * 1.33, end: Math.PI * 1.66, color: '#FFB300' },
    { start: Math.PI * 1.66, end: Math.PI * 2, color: '#EF5350' },
  ];
  segments.forEach(seg => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, seg.start, seg.end);
    ctx.strokeStyle = seg.color + '55';
    ctx.lineWidth = 16;
    ctx.lineCap = 'butt';
    ctx.stroke();
  });

  // Active arc
  const activeEnd = Math.PI + (pct / 100) * Math.PI;
  const activeColor = pct < 33 ? '#00C853' : pct < 66 ? '#FFB300' : '#EF5350';
  const grd = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grd.addColorStop(0, '#00C853');
  grd.addColorStop(0.5, activeColor);
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, activeEnd);
  ctx.strokeStyle = grd;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Needle
  const needleAngle = Math.PI + (pct / 100) * Math.PI;
  const nx = cx + (r - 20) * Math.cos(needleAngle);
  const ny = cy + (r - 20) * Math.sin(needleAngle);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
}

/* ── INIT DASHBOARD CHARTS ── */
function initDashboardCharts() {
  drawDonut('donut-chart', 6, '#00E5FF', '#00C853');
  drawLineChart('line-chart',
    [
      { data: [7.1, 7.3, 7.0, 7.4, 7.2, 7.5, 7.2], color: '#00E5FF' },
      { data: [42, 38, 50, 45, 39, 47, 45], color: '#00C853' },
    ],
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  );
}

/* ── INIT AI CHARTS ── */
function initAICharts() {
  drawGauge('gauge-canvas', 6);
  drawLineChart('risk-chart',
    [{ data: [12, 8, 15, 5, 9, 11, 6], color: '#00E5FF' }],
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  );
}

/* ── INIT REPORT CHARTS ── */
function initReportCharts() {
  drawLineChart('report-chart',
    [
      { data: [7.1, 7.3, 6.8, 7.4, 7.0, 7.2, 7.5, 7.3, 7.1], color: '#00E5FF' },
      { data: [42, 35, 55, 48, 39, 44, 38, 50, 45], color: '#00C853' },
      { data: [18, 22, 14, 20, 16, 19, 15, 21, 18], color: '#FFB300' },
    ],
    ['1','2','3','4','5','6','7','8','9']
  );
  drawDonut('acc-donut', 99.1, '#00E5FF', '#00C853');
}

/* ── VALVE CONTROL ── */
let valveOpen = true;
function setValve(state) {
  valveOpen = (state === 'open');
  const circle = document.getElementById('valve-circle');
  const statusText = document.getElementById('valve-status-text');
  const viStatus = document.getElementById('vi-status');
  const flow = document.getElementById('valve-flow');

  if (valveOpen) {
    circle.classList.remove('closed');
    statusText.textContent = 'OPEN';
    viStatus.textContent = 'OPEN';
    viStatus.className = 'vi-val green';
    if (flow) flow.style.display = 'flex';
    showToast('✅ Valve Opened Successfully');
  } else {
    circle.classList.add('closed');
    statusText.textContent = 'CLOSED';
    viStatus.textContent = 'CLOSED';
    viStatus.className = 'vi-val red';
    if (flow) flow.style.display = 'none';
    showToast('🔒 Valve Closed Successfully');
  }
}

let autoMode = true;
function toggleAutoMode() {
  autoMode = !autoMode;
  const toggle = document.getElementById('auto-toggle');
  const viMode = document.getElementById('vi-mode');
  toggle.classList.toggle('active', autoMode);
  if (viMode) viMode.textContent = autoMode ? 'Automatic' : 'Manual';
  showToast(autoMode ? '🤖 Switched to Automatic Mode' : '🔧 Manual Mode Activated');
}

/* ── ETP / PDF ALERT ── */
function showETPAlert() {
  showToast('🔄 Water redirected to ETP treatment plant');
}
function showPDFAlert() {
  showToast('📄 PDF report generating... Ready in 2s');
}

/* ── REPORT TABS ── */
function setReportTab(tab) {
  ['daily','weekly','monthly'].forEach(t => {
    const el = document.getElementById('rtab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });
  showToast(`📊 ${tab.charAt(0).toUpperCase() + tab.slice(1)} report loaded`);
}

/* ── AI ASSISTANT ── */
let aiPanelOpen = false;
function toggleAIAssistant() {
  aiPanelOpen = !aiPanelOpen;
  const panel = document.getElementById('ai-panel');
  panel.classList.toggle('open', aiPanelOpen);
}

const aiResponses = {
  'check bod levels': 'Current BOD level is 22 mg/L. This is 73% of the permissible limit (30 mg/L). Status: MODERATE. Consider scheduling ETP maintenance soon.',
  'generate report': 'Generating today\'s compliance report... Report ID: RPT-20260709-001. Compliance Rate: 98.2%. Download initiated.',
  'valve status': 'Discharge Valve V-03 is currently OPEN in Automatic Mode. Pressure: 2.4 bar. Flow Rate: 82 m³/h. AI is monitoring continuously.',
};

function aiSuggest(question) {
  const input = document.getElementById('ai-input');
  input.value = question;
  sendAIMessage();
}

function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const chat = document.getElementById('ai-chat');
  const msg = input.value.trim();
  if (!msg) return;

  // User message
  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user';
  userDiv.innerHTML = `<p>${msg}</p>`;
  chat.appendChild(userDiv);

  input.value = '';

  // Bot response
  setTimeout(() => {
    const key = msg.toLowerCase();
    const response = aiResponses[key] ||
      `Analyzing "${msg}"... Based on current sensor data, all systems are operating normally. EcoLock AI confidence: 94%. No immediate action required.`;
    const botDiv = document.createElement('div');
    botDiv.className = 'ai-msg bot';
    botDiv.innerHTML = `<p>${response}</p>`;
    chat.appendChild(botDiv);
    chat.scrollTop = chat.scrollHeight;
  }, 600);

  chat.scrollTop = chat.scrollHeight;
}

// Enter key for AI input
document.getElementById('ai-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendAIMessage();
});

/* ── TOAST ── */
function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── LIVE SENSOR SIMULATION ── */
function simulateSensors() {
  const bodVal = document.getElementById('bod-val');
  const bodBar = document.getElementById('bod-bar');
  const bodStatus = document.getElementById('bod-status');
  if (!bodVal) return;

  const base = 22;
  const fluctuation = (Math.random() - 0.5) * 4;
  const newVal = (base + fluctuation).toFixed(1);
  const pct = (newVal / 50) * 100;
  bodVal.textContent = newVal;
  if (bodBar) bodBar.style.width = pct + '%';

  if (newVal > 30) {
    if (bodBar) { bodBar.className = 'sensor-bar red'; bodBar.style.width = pct + '%'; }
    if (bodStatus) { bodStatus.className = 'sensor-status red-badge'; bodStatus.textContent = '✗ EXCEEDED'; }
  } else if (newVal > 24) {
    if (bodBar) { bodBar.className = 'sensor-bar yellow'; bodBar.style.width = pct + '%'; }
    if (bodStatus) { bodStatus.className = 'sensor-status yellow-badge'; bodStatus.textContent = '⚠ MODERATE'; }
  } else {
    if (bodBar) { bodBar.className = 'sensor-bar green'; bodBar.style.width = pct + '%'; }
    if (bodStatus) { bodStatus.className = 'sensor-status green-badge'; bodStatus.textContent = '✓ SAFE'; }
  }
}
setInterval(simulateSensors, 3000);

/* ── ALERT FILTER BUTTONS ── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

/* ── LOGIN FORM ANIMATION ── */
document.getElementById('login-btn').addEventListener('mousedown', function() {
  this.style.transform = 'scale(0.97)';
});
document.getElementById('login-btn').addEventListener('mouseup', function() {
  this.style.transform = 'scale(1)';
});

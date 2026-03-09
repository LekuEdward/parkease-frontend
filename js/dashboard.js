// ============================================================
// dashboard.js — Dashboard Page Interactivity
// ParkEase v2.4.0
// ============================================================

// ──────────────────────────────────────────────
// Mock arrivals data (in production: fetched from API)
// ──────────────────────────────────────────────
var ALL_ARRIVALS = [
  { time: '10:45 AM', plate: 'UBD 123X', type: 'Personal Car',  status: 'Parked'     },
  { time: '10:32 AM', plate: 'UAU 890L', type: 'Taxi',          status: 'Signed Out' },
  { time: '10:15 AM', plate: 'UBK 442A', type: 'Boda-boda',     status: 'Parked'     },
  { time: '09:58 AM', plate: 'UBA 551G', type: 'Coaster',       status: 'Parked'     },
  { time: '09:40 AM', plate: 'UBH 200W', type: 'Personal Car',  status: 'Signed Out' },
  { time: '09:22 AM', plate: 'UAX 123A', type: 'Truck',         status: 'Parked'     },
  { time: '09:10 AM', plate: 'UCB 778P', type: 'Personal Car',  status: 'Parked'     },
  { time: '08:54 AM', plate: 'UCC 300M', type: 'Taxi',          status: 'Parked'     }
];


// ──────────────────────────────────────────────
// renderArrivals(data)
// Draws the arrivals table from the provided array.
// ──────────────────────────────────────────────
function renderArrivals(data) {
  var tbody = document.getElementById('arrivals-tbody');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = [
      '<tr>',
      '  <td colspan="5" style="text-align:center;padding:32px;color:var(--text-muted)">',
      '    <div style="font-size:28px;opacity:.25;margin-bottom:8px">🚗</div>',
      '    No arrivals match your search.',
      '  </td>',
      '</tr>'
    ].join('');
    return;
  }

  tbody.innerHTML = data.map(function (row) {
    var badgeClass  = row.status === 'Parked' ? 'badge--green' : 'badge--grey';
    return [
      '<tr>',
      '  <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">' + row.time + '</td>',
      '  <td><span class="plate-badge">' + row.plate + '</span></td>',
      '  <td>' + row.type + '</td>',
      '  <td><span class="badge ' + badgeClass + '">' + row.status + '</span></td>',
      '  <td>',
      '    <button class="row-action-btn" title="Actions" onclick="handleRowAction(\'' + row.plate + '\')">⋮</button>',
      '  </td>',
      '</tr>'
    ].join('');
  }).join('');
}


// ──────────────────────────────────────────────
// searchPlate(query)
// Filters the arrivals table based on plate or type.
// ──────────────────────────────────────────────
function searchPlate(query) {
  var q = query.trim().toLowerCase();

  if (!q) {
    renderArrivals(ALL_ARRIVALS);
    return;
  }

  var filtered = ALL_ARRIVALS.filter(function (row) {
    return row.plate.toLowerCase().includes(q)
      || row.type.toLowerCase().includes(q);
  });

  renderArrivals(filtered);
}


// ──────────────────────────────────────────────
// handleRowAction(plate)
// Shows a simple action prompt for the selected vehicle.
// ──────────────────────────────────────────────
function handleRowAction(plate) {
  var action = window.confirm(
    'Vehicle: ' + plate + '\n\nChoose action:\n• OK → Sign-out this vehicle\n• Cancel → Stay on dashboard'
  );
  if (action) {
    window.location.href = 'signout.html';
  }
}


// ──────────────────────────────────────────────
// printDailySummary()
// Triggers the browser print dialog for the daily report.
// ──────────────────────────────────────────────
function printDailySummary() {
  alert('📊 Printing daily summary...\n\nDate: ' + new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  }));
}


// ──────────────────────────────────────────────
// setTodayDate()
// Formats and inserts today's date into the topbar.
// ──────────────────────────────────────────────
function setTodayDate() {
  var el = document.getElementById('today-date');
  if (!el) return;

  el.textContent = new Date().toLocaleDateString('en-UG', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });
}


// ──────────────────────────────────────────────
// setSessionTime()
// Shows the session start time in the page footer.
// ──────────────────────────────────────────────
function setSessionTime() {
  var el      = document.getElementById('session-time');
  var session = JSON.parse(localStorage.getItem('parkease_session') || '{}');

  if (el && session.loginTime) {
    var d = new Date(session.loginTime);
    el.textContent = d.toLocaleTimeString('en-UG', {
      hour:   '2-digit',
      minute: '2-digit'
    });
  }
}


// ──────────────────────────────────────────────
// animateCounter(elId, target, prefix)
// Increments a number from 0 to target over ~40 steps.
// ──────────────────────────────────────────────
function animateCounter(elId, target, prefix) {
  var el = document.getElementById(elId);
  if (!el) return;

  var current  = 0;
  var stepSize = Math.max(Math.ceil(target / 40), 1);
  var prefix   = prefix || '';

  var interval = setInterval(function () {
    current = Math.min(current + stepSize, target);
    el.textContent = prefix + current.toLocaleString();
    if (current >= target) {
      clearInterval(interval);
    }
  }, 28);
}


// ──────────────────────────────────────────────
// init() — runs on DOMContentLoaded
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  setTodayDate();
  setSessionTime();
  renderArrivals(ALL_ARRIVALS);

  // Animate stat counters after a short delay
  setTimeout(function () {
    animateCounter('stat-parked', 142, '');
    animateCounter('stat-revenue', 450000, '');
  }, 200);
});

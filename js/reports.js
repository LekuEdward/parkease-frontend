// ============================================================
// reports.js — Admin Revenue Reports, Filtering & Pagination
// ParkEase v2.4.0
// ============================================================

var ROWS_PER_PAGE = 5;
var currentPage   = 1;
var filteredData  = [];
var currentDate   = new Date('2026-03-08');
var dayOffset     = 0;

// ──────────────────────────────────────────────
// Mock signed-out transactions
// ──────────────────────────────────────────────
var ALL_TRANSACTIONS = [
  { receipt: 'PE-98231', plate: 'KAA 123X', inTime: '08:15 AM', outTime: '05:30 PM', duration: '9h 15m',  fee: 45000,  discount: false },
  { receipt: 'PE-98232', plate: 'KCB 776L', inTime: '09:00 AM', outTime: '11:30 AM', duration: '2h 30m',  fee: 6000,   discount: false },
  { receipt: 'PE-98233', plate: 'KDD 001A', inTime: '07:45 AM', outTime: '06:15 PM', duration: '10h 30m', fee: 50000,  discount: true  },
  { receipt: 'PE-98234', plate: 'KBA 999Z', inTime: '11:20 AM', outTime: '02:45 PM', duration: '3h 25m',  fee: 9000,   discount: false },
  { receipt: 'PE-98235', plate: 'KBX 442W', inTime: '06:00 AM', outTime: '08:00 PM', duration: '14h 00m', fee: 70000,  discount: false },
  { receipt: 'PE-98236', plate: 'UAX 123A', inTime: '08:45 AM', outTime: '01:07 PM', duration: '4h 22m',  fee: 17500,  discount: false },
  { receipt: 'PE-98237', plate: 'UBD 123X', inTime: '07:30 AM', outTime: '03:45 PM', duration: '8h 15m',  fee: 24000,  discount: false },
  { receipt: 'PE-98238', plate: 'UCB 900L', inTime: '10:00 AM', outTime: '12:30 PM', duration: '2h 30m',  fee: 3000,   discount: false },
  { receipt: 'PE-98239', plate: 'UAB 312K', inTime: '09:15 AM', outTime: '04:00 PM', duration: '6h 45m',  fee: 20000,  discount: true  },
  { receipt: 'PE-98240', plate: 'UBC 555T', inTime: '11:00 AM', outTime: '05:00 PM', duration: '6h 00m',  fee: 18000,  discount: false },
  { receipt: 'PE-98241', plate: 'UCA 789P', inTime: '08:00 AM', outTime: '02:30 PM', duration: '6h 30m',  fee: 19500,  discount: false },
  { receipt: 'PE-98242', plate: 'UBB 234M', inTime: '07:00 AM', outTime: '11:45 AM', duration: '4h 45m',  fee: 14250,  discount: false }
];

// ──────────────────────────────────────────────
// Revenue data per day offset (0 = today, 1 = yesterday, etc.)
// ──────────────────────────────────────────────
var REVENUE_BY_DAY = {
  0: { parking: 1240000, parkingDelta: '+12%', tyre: 450000, tyreDelta: '+5.4%', battery: 180000, batteryDelta: '-2.1%' },
  1: { parking: 1090000, parkingDelta: '-4%',  tyre: 380000, tyreDelta: '+2.1%', battery: 195000, batteryDelta: '+1.5%' },
  2: { parking: 1340000, parkingDelta: '+22%', tyre: 500000, tyreDelta: '+8.3%', battery: 160000, batteryDelta: '-8.2%' }
};


// ──────────────────────────────────────────────
// formatDate(date)
// Returns human-readable date string.
// ──────────────────────────────────────────────
function formatDate(date) {
  return date.toLocaleDateString('en-UG', {
    month: 'long',
    day:   'numeric',
    year:  'numeric'
  });
}


// ──────────────────────────────────────────────
// changeDate(direction)
// Navigates forward/back by one day and refreshes cards.
// ──────────────────────────────────────────────
function changeDate(direction) {
  dayOffset += direction;

  var baseDate = new Date('2026-03-08');
  baseDate.setDate(baseDate.getDate() - dayOffset);
  currentDate = baseDate;

  document.getElementById('selected-date').textContent = formatDate(currentDate);
  refreshRevenueCards();
}


// ──────────────────────────────────────────────
// refreshRevenueCards()
// Updates the three revenue summary cards.
// ──────────────────────────────────────────────
function refreshRevenueCards() {
  var key  = Math.abs(dayOffset) % 3;
  var data = REVENUE_BY_DAY[key] || REVENUE_BY_DAY[0];

  // Parking card
  document.getElementById('parking-rev').textContent     = 'UGX ' + data.parking.toLocaleString();
  document.getElementById('parking-change').textContent  = data.parkingDelta + ' vs previous day average';
  document.getElementById('parking-change').className    = 'rev-card__trend ' + (data.parkingDelta.startsWith('+') ? 'is-up' : 'is-down');

  // Tyre clinic card
  document.getElementById('tyre-rev').textContent        = 'UGX ' + data.tyre.toLocaleString();
  document.getElementById('tyre-change').textContent     = data.tyreDelta + ' vs previous day';
  document.getElementById('tyre-change').className       = 'rev-card__trend ' + (data.tyreDelta.startsWith('+') ? 'is-up' : 'is-down');

  // Battery hire card
  document.getElementById('battery-rev').textContent     = 'UGX ' + data.battery.toLocaleString();
  document.getElementById('battery-change').textContent  = data.batteryDelta + ' vs previous day';
  document.getElementById('battery-change').className    = 'rev-card__trend ' + (data.batteryDelta.startsWith('+') ? 'is-up' : 'is-down');
}


// ──────────────────────────────────────────────
// filterTable(query)
// Filters transactions by receipt number or plate.
// ──────────────────────────────────────────────
function filterTable(query) {
  var q = query.toLowerCase().trim();

  if (!q) {
    filteredData = ALL_TRANSACTIONS.slice();
  } else {
    filteredData = ALL_TRANSACTIONS.filter(function (row) {
      return row.receipt.toLowerCase().includes(q)
        || row.plate.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, ''));
    });
  }

  currentPage = 1;
  renderTable();
}


// ──────────────────────────────────────────────
// renderTable()
// Draws the current page of transactions.
// ──────────────────────────────────────────────
function renderTable() {
  var tbody = document.getElementById('reports-tbody');
  var start = (currentPage - 1) * ROWS_PER_PAGE;
  var end   = start + ROWS_PER_PAGE;
  var page  = filteredData.slice(start, end);

  if (page.length === 0) {
    tbody.innerHTML = [
      '<tr>',
      '  <td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted)">',
      '    <div style="font-size:28px;opacity:.25;margin-bottom:8px">🔍</div>',
      '    No transactions match your filter.',
      '  </td>',
      '</tr>'
    ].join('');
    updateSummaryValues(0, 0);
    renderPagination();
    return;
  }

  tbody.innerHTML = page.map(function (row) {
    var discountTag = row.discount
      ? ' <span class="discount-tag">DISCOUNT</span>'
      : '';

    return [
      '<tr>',
      '  <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted)">' + row.receipt + '</td>',
      '  <td><span class="plate-badge">' + row.plate + '</span></td>',
      '  <td style="font-family:var(--font-mono);font-size:12.5px">' + row.inTime + '</td>',
      '  <td style="font-family:var(--font-mono);font-size:12.5px">' + row.outTime + '</td>',
      '  <td style="font-family:var(--font-mono);font-size:12.5px">' + row.duration + '</td>',
      '  <td style="font-family:var(--font-mono);font-weight:700;font-size:13px">',
      '    UGX ' + row.fee.toLocaleString() + discountTag,
      '  </td>',
      '</tr>'
    ].join('');
  }).join('');

  var totalFee = filteredData.reduce(function (acc, row) {
    return acc + row.fee;
  }, 0);

  updateSummaryValues(totalFee, filteredData.length);
  renderPagination();
}


// ──────────────────────────────────────────────
// updateSummaryValues(total, count)
// Updates the grand total and record count displays.
// ──────────────────────────────────────────────
function updateSummaryValues(total, count) {
  var start = (currentPage - 1) * ROWS_PER_PAGE + 1;
  var end   = Math.min(currentPage * ROWS_PER_PAGE, count);

  var grandTotalEl  = document.getElementById('grand-total');
  var visibleTotalEl = document.getElementById('visible-total');
  var countEl       = document.getElementById('table-count');

  if (grandTotalEl)   grandTotalEl.textContent   = 'UGX ' + total.toLocaleString();
  if (visibleTotalEl) visibleTotalEl.textContent  = 'UGX ' + total.toLocaleString();
  if (countEl)        countEl.textContent         = count
    ? 'Showing ' + Math.min(ROWS_PER_PAGE, filteredData.slice(start - 1).length) + ' of ' + count + ' records'
    : 'No records found';
}


// ──────────────────────────────────────────────
// renderPagination()
// Draws the pagination buttons below the table.
// ──────────────────────────────────────────────
function renderPagination() {
  var totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  var infoEl     = document.getElementById('page-info');
  var btnsEl     = document.getElementById('page-buttons');
  var start      = (currentPage - 1) * ROWS_PER_PAGE + 1;
  var end        = Math.min(currentPage * ROWS_PER_PAGE, filteredData.length);

  if (infoEl) {
    infoEl.textContent = filteredData.length
      ? 'Showing ' + start + ' to ' + end + ' of ' + filteredData.length + ' transactions'
      : 'No results';
  }

  if (!btnsEl) return;

  // Prev button
  var html = '<button class="page-btn" onclick="goToPage(' + (currentPage - 1) + ')"'
    + (currentPage === 1 ? ' disabled' : '') + '>‹ Prev</button>';

  // Page number buttons (up to 5 visible)
  var maxVisible  = 5;
  var startPage   = Math.max(1, currentPage - 2);
  var endPage     = Math.min(totalPages, startPage + maxVisible - 1);
  startPage = Math.max(1, endPage - maxVisible + 1);

  for (var i = startPage; i <= endPage; i++) {
    html += '<button class="page-btn' + (i === currentPage ? ' is-active' : '')
      + '" onclick="goToPage(' + i + ')">' + i + '</button>';
  }

  // Next button
  html += '<button class="page-btn" onclick="goToPage(' + (currentPage + 1) + ')"'
    + (currentPage >= totalPages || totalPages === 0 ? ' disabled' : '') + '>Next ›</button>';

  btnsEl.innerHTML = html;
}


// ──────────────────────────────────────────────
// goToPage(page)
// Sets the current page and re-renders the table.
// ──────────────────────────────────────────────
function goToPage(page) {
  var totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}


// ──────────────────────────────────────────────
// exportCSV()
// Downloads a CSV file of all filtered transactions.
// ──────────────────────────────────────────────
function exportCSV() {
  var headers = ['Receipt #', 'Plate Number', 'Check-in', 'Check-out', 'Duration', 'Fee (UGX)'];
  var rows    = filteredData.map(function (r) {
    return [r.receipt, r.plate, r.inTime, r.outTime, r.duration, r.fee];
  });

  var csv  = [headers].concat(rows).map(function (row) {
    return row.join(',');
  }).join('\n');

  var blob     = new Blob([csv], { type: 'text/csv' });
  var url      = URL.createObjectURL(blob);
  var link     = document.createElement('a');
  link.href    = url;
  link.download = 'parkease-report-' + currentDate.toISOString().split('T')[0] + '.csv';
  link.click();
  URL.revokeObjectURL(url);
}


// ──────────────────────────────────────────────
// downloadPDF()
// Placeholder — in production uses wkhtmltopdf/jsPDF.
// ──────────────────────────────────────────────
function downloadPDF() {
  alert('📄 PDF download initiated.\n\nIn production, this uses a PDF generation library (e.g. jsPDF) to export the formatted report.');
}


// ──────────────────────────────────────────────
// DOMContentLoaded — initialise table and cards
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  filteredData = ALL_TRANSACTIONS.slice();
  renderTable();
  refreshRevenueCards();
});

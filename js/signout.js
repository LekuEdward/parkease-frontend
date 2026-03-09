// ============================================================
// signout.js — Vehicle Sign-out & Fee Calculation
// ParkEase v2.4.0
// ============================================================

// ──────────────────────────────────────────────
// Mock parked vehicles — simulates the backend database.
// In production these would come from an API.
// ──────────────────────────────────────────────
var MOCK_VEHICLES = [
  {
    receiptNo:   'PE-2026-03-0112',
    plate:       'UAX123A',
    driverName:  'John Baptist Ssemuwemba',
    vehicleType: 'Truck',
    arrivalTime: new Date(Date.now() - 4.4 * 3600000).toISOString(),
    status:      'Parked'
  },
  {
    receiptNo:   'PE-2026-03-0098',
    plate:       'UBD123X',
    driverName:  'Agnes Nakato Nalwanga',
    vehicleType: 'Personal Car',
    arrivalTime: new Date(Date.now() - 2.2 * 3600000).toISOString(),
    status:      'Parked'
  },
  {
    receiptNo:   'PE-2026-03-0076',
    plate:       'UBA551G',
    driverName:  'Robert Kizito Ssali',
    vehicleType: 'Taxi',
    arrivalTime: new Date(Date.now() - 5.0 * 3600000).toISOString(),
    status:      'Parked'
  },
  {
    receiptNo:   'PE-2026-03-0055',
    plate:       'UCB778P',
    driverName:  'Mary Akello Odongkara',
    vehicleType: 'Boda-boda',
    arrivalTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    status:      'Parked'
  }
];

// Currently loaded vehicle
var currentVehicle = null;


// ──────────────────────────────────────────────
// searchVehicle()
// Looks up the entered query in localStorage + mock data.
// ──────────────────────────────────────────────
function searchVehicle() {
  var raw   = document.getElementById('search-input').value.trim().toUpperCase().replace(/\s/g, '');

  if (!raw) {
    alert('Please enter a plate number or receipt ID to search.');
    return;
  }

  // Merge localStorage vehicles with mock data
  var stored   = JSON.parse(localStorage.getItem('parkease_vehicles') || '[]');
  var allData  = stored.concat(MOCK_VEHICLES);

  var found = allData.find(function (v) {
    return v.plate.replace(/\s/g, '').toUpperCase() === raw
      || v.receiptNo.replace(/\s/g, '-').toUpperCase() === raw;
  });

  if (!found) {
    alert('No vehicle found for: "' + raw + '"\n\nTry: UAX123A · UBD123X · UBA551G · UCB778P');
    return;
  }

  if (found.status === 'Signed Out') {
    alert('This vehicle (' + found.plate + ') has already been signed out.');
    return;
  }

  currentVehicle = found;
  renderVehicleDetails(found);
}


// ──────────────────────────────────────────────
// renderVehicleDetails(vehicle)
// Populates the left panel and receipt preview.
// ──────────────────────────────────────────────
function renderVehicleDetails(vehicle) {
  var now         = new Date();
  var arrivalDate = new Date(vehicle.arrivalTime);
  var durationMs  = now - arrivalDate;
  var fee         = calculateFee(vehicle.vehicleType, arrivalDate.getTime(), now.getTime());
  var rateLabel   = getRateLabel(vehicle.vehicleType, arrivalDate.getTime(), now.getTime());

  // Show the panels
  document.getElementById('no-vehicle-msg').style.display  = 'none';
  document.getElementById('vehicle-details').style.display = 'block';
  document.getElementById('no-receipt-msg').style.display  = 'none';
  document.getElementById('receipt-preview').style.display = 'block';

  // Populate detail fields
  document.getElementById('d-driver').textContent   = vehicle.driverName;
  document.getElementById('d-type').textContent     = vehicle.vehicleType;
  document.getElementById('d-arrival').textContent  = arrivalDate.toLocaleString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('d-duration').textContent = formatDuration(durationMs);
  document.getElementById('d-fee').textContent      = formatUGX(fee);
  document.getElementById('d-fee-rate').textContent = rateLabel;

  // Populate receipt preview
  var receiptNo = vehicle.receiptNo || generateReceiptNo();

  document.getElementById('r-no').textContent      = receiptNo;
  document.getElementById('r-date').textContent    = now.toLocaleString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('r-plate').textContent    = vehicle.plate;
  document.getElementById('r-category').textContent = vehicle.vehicleType.toUpperCase();
  document.getElementById('r-checkin').textContent  = arrivalDate.toLocaleString('en-UG', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
  document.getElementById('r-duration-r').textContent = formatDuration(durationMs) + ' @ ' + formatUGX(fee) + '/stay';
  document.getElementById('r-total').textContent      = formatUGX(fee);

  // Cache for form submission
  currentVehicle._fee        = fee;
  currentVehicle._receiptNo  = receiptNo;
  currentVehicle._durationMs = durationMs;

  // Setup receiver form
  wireReceiverForm();
}


// ──────────────────────────────────────────────
// wireReceiverForm()
// Attaches submit handler (only once).
// ──────────────────────────────────────────────
function wireReceiverForm() {
  var form = document.getElementById('receiver-form');
  if (!form || form._wired) return;
  form._wired = true;
  form.addEventListener('submit', handleConfirmSignout);
}


// ──────────────────────────────────────────────
// handleConfirmSignout(e)
// Validates the receiver form before confirming sign-out.
// ──────────────────────────────────────────────
function handleConfirmSignout(e) {
  e.preventDefault();

  var name   = document.getElementById('receiver-name').value.trim();
  var phone  = document.getElementById('receiver-phone').value.trim();
  var nin    = document.getElementById('receiver-nin').value.trim();

  clearAllErrors(['receiver-name', 'receiver-phone', 'receiver-nin']);
  var valid = true;

  // Validate receiver name
  if (!name) {
    showFieldError('receiver-name', 'Receiver name is required.');
    valid = false;
  } else if (!validateName(name)) {
    showFieldError('receiver-name', 'Name must start with a capital letter. No numbers.');
    valid = false;
  }

  // Validate phone
  if (!phone) {
    showFieldError('receiver-phone', 'Phone number is required.');
    valid = false;
  } else {
    var fullPhone = phone.replace(/^0/, '+256');
    if (!validatePhone(phone) && !validatePhone(fullPhone)) {
      showFieldError('receiver-phone', 'Enter a valid Ugandan phone number.');
      valid = false;
    }
  }

  // Validate NIN
  if (!nin) {
    showFieldError('receiver-nin', 'NIN is required for vehicle collection.');
    valid = false;
  } else if (!validateNIN(nin)) {
    showFieldError('receiver-nin', 'NIN format: 2 letters + 8–10 alphanumeric + 1 letter.');
    valid = false;
  }

  if (!valid) return;

  // Update receipt with receiver details
  document.getElementById('r-receiver').textContent = name;
  document.getElementById('r-nin').textContent      = nin.substring(0, 6) + '***' + nin.slice(-2);

  // Mark vehicle as signed out in localStorage
  var stored = JSON.parse(localStorage.getItem('parkease_vehicles') || '[]');
  var idx    = stored.findIndex(function (v) {
    return v.plate === currentVehicle.plate;
  });

  if (idx > -1) {
    stored[idx].status      = 'Signed Out';
    stored[idx].signOutTime = new Date().toISOString();
    stored[idx].fee         = currentVehicle._fee;
    localStorage.setItem('parkease_vehicles', JSON.stringify(stored));
  }

  // Show confirmation modal
  document.getElementById('confirm-receipt-no').textContent = currentVehicle._receiptNo;
  document.getElementById('confirm-modal').classList.add('is-visible');
}


// ──────────────────────────────────────────────
// cancelSignout() — reset the panels to empty state
// ──────────────────────────────────────────────
function cancelSignout() {
  document.getElementById('vehicle-details').style.display = 'none';
  document.getElementById('no-vehicle-msg').style.display  = '';
  document.getElementById('receipt-preview').style.display = 'none';
  document.getElementById('no-receipt-msg').style.display  = '';
  document.getElementById('search-input').value            = '';
  currentVehicle = null;
}


// ──────────────────────────────────────────────
// closeConfirmModal() — dismiss and print
// ──────────────────────────────────────────────
function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('is-visible');
  printReceipt();
}


// ──────────────────────────────────────────────
// goToDashboard() — navigate to dashboard
// ──────────────────────────────────────────────
function goToDashboard() {
  window.location.href = 'dashboard.html';
}


// ──────────────────────────────────────────────
// printReceipt() — trigger browser print dialog
// ──────────────────────────────────────────────
function printReceipt() {
  window.print();
}


// ──────────────────────────────────────────────
// DOMContentLoaded — wire up Enter key on search input
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        searchVehicle();
      }
    });
  }
});

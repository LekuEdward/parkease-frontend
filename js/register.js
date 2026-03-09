// ============================================================
// register.js — Vehicle Registration Form Logic
// ParkEase v2.4.0
// ============================================================

var FORM_FIELDS = ['driver-name', 'phone', 'vehicle-type', 'plate', 'model-color'];


// ──────────────────────────────────────────────
// DOMContentLoaded — wire up all event listeners
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  setSessionTime();
  setupVehicleTypeToggle();
  setupRealTimeValidation();
  setupFormSubmit();
});


// ──────────────────────────────────────────────
// setSessionTime()
// Shows login time in the page footer.
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
// setupVehicleTypeToggle()
// Shows/hides the NIN section when Boda-boda is selected.
// ──────────────────────────────────────────────
function setupVehicleTypeToggle() {
  var selectEl   = document.getElementById('vehicle-type');
  var ninSection = document.getElementById('nin-section');

  if (!selectEl) return;

  selectEl.addEventListener('change', function () {
    if (this.value === 'Boda-boda') {
      ninSection.classList.add('is-visible');
      document.getElementById('nin').required = true;
    } else {
      ninSection.classList.remove('is-visible');
      document.getElementById('nin').required = false;
      document.getElementById('nin').value    = '';
      clearFieldError('nin');
    }

    // Clear this field's error on change
    clearFieldError('vehicle-type');
  });
}


// ──────────────────────────────────────────────
// setupRealTimeValidation()
// Validates fields on blur for immediate feedback.
// ──────────────────────────────────────────────
function setupRealTimeValidation() {
  var driverInput = document.getElementById('driver-name');
  var plateInput  = document.getElementById('plate');
  var phoneInput  = document.getElementById('phone');
  var ninInput    = document.getElementById('nin');

  if (driverInput) {
    driverInput.addEventListener('blur', function () {
      if (this.value.trim() && !validateName(this.value)) {
        showFieldError('driver-name', 'Name must start with a capital letter and contain no numbers.');
      } else if (this.value.trim()) {
        clearFieldError('driver-name');
      }
    });
  }

  if (plateInput) {
    plateInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
    plateInput.addEventListener('blur', function () {
      if (this.value.trim() && !validatePlate(this.value)) {
        showFieldError('plate', 'Plate must start with U and be alphanumeric (e.g. UBA 123X).');
      } else if (this.value.trim()) {
        clearFieldError('plate');
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
      if (this.value.trim() && !validatePhone(this.value)) {
        showFieldError('phone', 'Enter a valid Ugandan number: +256XXXXXXXXX or 07XXXXXXXX.');
      } else if (this.value.trim()) {
        clearFieldError('phone');
      }
    });
  }

  if (ninInput) {
    ninInput.addEventListener('input', function () {
      this.value = this.value.toUpperCase();
    });
    ninInput.addEventListener('blur', function () {
      if (this.value.trim() && !validateNIN(this.value)) {
        showFieldError('nin', 'NIN format: 2 letters + 8–10 alphanumeric + 1 letter.');
      } else if (this.value.trim()) {
        clearFieldError('nin');
      }
    });
  }
}


// ──────────────────────────────────────────────
// setupFormSubmit()
// Binds the form's submit event to our validator.
// ──────────────────────────────────────────────
function setupFormSubmit() {
  var form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateRegistrationForm()) {
      submitRegistration();
    }
  });
}


// ──────────────────────────────────────────────
// validateRegistrationForm()
// Runs all field validations. Returns true if all pass.
// ──────────────────────────────────────────────
function validateRegistrationForm() {
  clearAllErrors([...FORM_FIELDS, 'nin']);

  var valid = true;

  var driverName  = document.getElementById('driver-name').value.trim();
  var phone       = document.getElementById('phone').value.trim();
  var vehicleType = document.getElementById('vehicle-type').value;
  var plate       = document.getElementById('plate').value.trim();
  var modelColor  = document.getElementById('model-color').value.trim();

  // Validate: Driver Name
  if (!driverName) {
    showFieldError('driver-name', 'Driver name is required.');
    valid = false;
  } else if (!validateName(driverName)) {
    showFieldError('driver-name', 'Name must start with a capital letter. No numbers allowed.');
    valid = false;
  }

  // Validate: Phone
  if (!phone) {
    showFieldError('phone', 'Phone number is required.');
    valid = false;
  } else if (!validatePhone(phone)) {
    showFieldError('phone', 'Enter a valid Ugandan number: +256XXXXXXXXX, 07XXXXXXXX, or 06XXXXXXXX.');
    valid = false;
  }

  // Validate: Vehicle Type
  if (!vehicleType) {
    showFieldError('vehicle-type', 'Please select a vehicle type.');
    valid = false;
  }

  // Validate: Number Plate
  if (!plate) {
    showFieldError('plate', 'Number plate is required.');
    valid = false;
  } else if (!validatePlate(plate)) {
    showFieldError('plate', 'Plate must start with U, be alphanumeric, and max 8 characters (e.g. UBA123X).');
    valid = false;
  }

  // Validate: Model & Colour
  if (!modelColor) {
    showFieldError('model-color', 'Vehicle model and colour is required.');
    valid = false;
  }

  // Validate: NIN (only for Boda-boda)
  if (vehicleType === 'Boda-boda') {
    var nin = document.getElementById('nin').value.trim();
    if (!nin) {
      showFieldError('nin', 'NIN is required for Boda-boda registration.');
      valid = false;
    } else if (!validateNIN(nin)) {
      showFieldError('nin', 'NIN format: 2 letters + 8–10 alphanumeric + 1 letter (e.g. CM12345678A).');
      valid = false;
    }
  }

  return valid;
}


// ──────────────────────────────────────────────
// submitRegistration()
// Saves registration to localStorage and shows the modal.
// ──────────────────────────────────────────────
function submitRegistration() {
  var plate       = document.getElementById('plate').value.trim().toUpperCase().replace(/\s/g, '');
  var driverName  = document.getElementById('driver-name').value.trim();
  var vehicleType = document.getElementById('vehicle-type').value;
  var phone       = document.getElementById('phone').value.trim();
  var modelColor  = document.getElementById('model-color').value.trim();
  var nin         = vehicleType === 'Boda-boda'
    ? document.getElementById('nin').value.trim().toUpperCase()
    : '';

  var receiptNo = generateReceiptNo();
  var now       = new Date();

  var record = {
    receiptNo:   receiptNo,
    plate:       plate,
    driverName:  driverName,
    vehicleType: vehicleType,
    phone:       phone,
    modelColor:  modelColor,
    nin:         nin,
    arrivalTime: now.toISOString(),
    status:      'Parked'
  };

  // Persist to localStorage
  var existing = JSON.parse(localStorage.getItem('parkease_vehicles') || '[]');
  existing.unshift(record);
  localStorage.setItem('parkease_vehicles', JSON.stringify(existing));

  // Show success modal
  document.getElementById('receipt-number').textContent = receiptNo;
  document.getElementById('success-modal').classList.add('is-visible');
}


// ──────────────────────────────────────────────
// closeModal() — dismiss success modal and reset form
// ──────────────────────────────────────────────
function closeModal() {
  document.getElementById('success-modal').classList.remove('is-visible');
  clearForm();
}


// ──────────────────────────────────────────────
// clearForm() — reset all fields and error states
// ──────────────────────────────────────────────
function clearForm() {
  document.getElementById('register-form').reset();
  clearAllErrors([...FORM_FIELDS, 'nin']);
  document.getElementById('nin-section').classList.remove('is-visible');
  document.getElementById('nin').required = false;
}

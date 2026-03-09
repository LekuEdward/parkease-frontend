// ============================================================
// validation.js — Reusable Validation & Utility Functions
// ParkEase v2.4.0
// ============================================================


// ──────────────────────────────────────────────
// 1. validateName(name)
//    Must start with a capital letter, no digits,
//    minimum 2 characters, letters/spaces/hyphens only.
// ──────────────────────────────────────────────
function validateName(name) {
  const trimmed = name.trim();
  return /^[A-Z][a-zA-Z\s'\-]{1,}$/.test(trimmed);
}


// ──────────────────────────────────────────────
// 2. validatePlate(plate)
//    Must start with U, alphanumeric only, max 8 chars.
//    Spaces are stripped before testing.
//    Examples: UBA 123X → UBA123X ✓
// ──────────────────────────────────────────────
function validatePlate(plate) {
  const clean = plate.replace(/\s/g, '').toUpperCase();
  return /^U[A-Z0-9]{2,6}$/.test(clean);
}


// ──────────────────────────────────────────────
// 3. validatePhone(phone)
//    Accepts Ugandan formats:
//    +256XXXXXXXXX, 07XXXXXXXX, 06XXXXXXXX
// ──────────────────────────────────────────────
function validatePhone(phone) {
  const clean = phone.replace(/\s/g, '');
  return /^(\+256|0)(7|6)\d{8}$/.test(clean);
}


// ──────────────────────────────────────────────
// 4. validateNIN(nin)
//    Format: 2 letters + 8–10 alphanumeric + 1 letter
//    Example: CM12345678A
// ──────────────────────────────────────────────
function validateNIN(nin) {
  const clean = nin.trim().toUpperCase();
  return /^[A-Z]{2}[0-9A-Z]{8,10}[A-Z]$/.test(clean);
}


// ──────────────────────────────────────────────
// 5. calculateFee(vehicleType, arrivalTime, signOutTime)
//    Returns the parking fee in UGX based on:
//    - Vehicle type
//    - Duration (short stay < 3 hrs)
//    - Time of day (day: 6am–7pm, otherwise night)
// ──────────────────────────────────────────────
function calculateFee(vehicleType, arrivalTime, signOutTime) {
  const durationMs  = signOutTime - arrivalTime;
  const durationHrs = durationMs / (1000 * 60 * 60);
  const arrivalHour = new Date(arrivalTime).getHours();

  const isDayRate  = arrivalHour >= 6 && arrivalHour < 19;
  const isShortStay = durationHrs < 3;

  const RATES = {
    'Truck':        { short: 2000,  day: 5000,  night: 10000 },
    'Personal Car': { short: 2000,  day: 3000,  night: 2000  },
    'Taxi':         { short: 2000,  day: 3000,  night: 2000  },
    'Coaster':      { short: 3000,  day: 4000,  night: 2000  },
    'Boda-boda':    { short: 1000,  day: 2000,  night: 2000  }
  };

  const rate = RATES[vehicleType] || RATES['Personal Car'];

  if (isShortStay) {
    return rate.short;
  }

  return isDayRate ? rate.day : rate.night;
}


// ──────────────────────────────────────────────
// 6. getRateLabel(vehicleType, arrivalTime, signOutTime)
//    Returns a human-readable rate description string.
// ──────────────────────────────────────────────
function getRateLabel(vehicleType, arrivalTime, signOutTime) {
  const durationMs  = signOutTime - arrivalTime;
  const durationHrs = durationMs / (1000 * 60 * 60);
  const arrivalHour = new Date(arrivalTime).getHours();

  const isDayRate   = arrivalHour >= 6 && arrivalHour < 19;
  const isShortStay = durationHrs < 3;

  const fee = calculateFee(vehicleType, arrivalTime, signOutTime);

  let rateType = '';
  if (isShortStay) {
    rateType = 'Short Stay (< 3 hrs)';
  } else if (isDayRate) {
    rateType = 'Day Rate (06:00 – 19:00)';
  } else {
    rateType = 'Night Rate (19:00 – 06:00)';
  }

  return `Rate Applied: UGX ${fee.toLocaleString()} — ${rateType}`;
}


// ──────────────────────────────────────────────
// 7. formatDuration(milliseconds)
//    Returns "Xh Ym" or "Y Minutes" string.
// ──────────────────────────────────────────────
function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours        = Math.floor(totalMinutes / 60);
  const minutes      = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
  }

  if (minutes === 0) {
    return `${hours} Hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${minutes}m`;
}


// ──────────────────────────────────────────────
// 8. generateReceiptNo()
//    Generates: PE-YYYY-MM-XXXX
// ──────────────────────────────────────────────
function generateReceiptNo() {
  const now    = new Date();
  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `PE-${year}-${month}-${random}`;
}


// ──────────────────────────────────────────────
// 9. formatUGX(amount)
//    Returns "UGX X,XXX,XXX"
// ──────────────────────────────────────────────
function formatUGX(amount) {
  return `UGX ${Number(amount).toLocaleString()}`;
}


// ──────────────────────────────────────────────
// 10. showFieldError(fieldId, message)
//     Adds error class to input and shows error element.
// ──────────────────────────────────────────────
function showFieldError(fieldId, message) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');

  if (inputEl) {
    inputEl.classList.add('is-error');
  }

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
  }
}


// ──────────────────────────────────────────────
// 11. clearFieldError(fieldId)
//     Removes error styles from a single field.
// ──────────────────────────────────────────────
function clearFieldError(fieldId) {
  const inputEl = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');

  if (inputEl) {
    inputEl.classList.remove('is-error');
  }

  if (errorEl) {
    errorEl.style.display = 'none';
  }
}


// ──────────────────────────────────────────────
// 12. clearAllErrors(fieldIds[])
//     Clears error state for an array of field IDs.
// ──────────────────────────────────────────────
function clearAllErrors(fieldIds) {
  fieldIds.forEach(function (id) {
    clearFieldError(id);
  });
}


// Expose all functions on window for cross-file access
window.validateName      = validateName;
window.validatePlate     = validatePlate;
window.validatePhone     = validatePhone;
window.validateNIN       = validateNIN;
window.calculateFee      = calculateFee;
window.getRateLabel      = getRateLabel;
window.formatDuration    = formatDuration;
window.generateReceiptNo = generateReceiptNo;
window.formatUGX         = formatUGX;
window.showFieldError    = showFieldError;
window.clearFieldError   = clearFieldError;
window.clearAllErrors    = clearAllErrors;

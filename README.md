# ParkEase — Integrated Parking & Vehicle Services

## What is ParkEase?

ParkEase is a frontend web application for managing a parking facility.
I built it as a coursework project for Refactory CSE 2026.

The system lets parking attendants register incoming vehicles, calculate fees, process sign-outs, and print receipts — while admins can view revenue reports by date.

---

## Pages

| File | Purpose |
|---|---|
| `index.html` | Login — role-based redirect to dashboard or reports |
| `dashboard.html` | Attendant dashboard — live stats, recent arrivals |
| `register.html` | Register an incoming vehicle with full validation |
| `signout.html` | Sign out a vehicle, calculate fee, generate receipt |
| `reports.html` | Admin view — daily revenue cards, filterable table, CSV export |

---

## How to Run

1. Download or clone this project folder
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge but preferably use Chrome)
3. No server or internet required - everything runs locally

**Login credentials:**

| Username | Password | Goes to |
|---|---|---|
| `admin` | `admin123` | Reports page |
| `attendant` | `park2026` | Dashboard |

---

## Validation Rules

| Field | Rule |
|---|---|
| Driver / Receiver Name | Must start with a capital letter. No numbers. Min 2 characters |
| Number Plate | Must start with `U`, alphanumeric, max 8 characters (e.g. `UBA 123X`) |
| Phone Number | Ugandan format: `+256XXXXXXXXX`, `07XXXXXXXX`, or `06XXXXXXXX` |
| NIN | 2 letters + 8–10 alphanumeric + 1 letter — e.g. `CM12345678A` |
| NIN required | Only enforced when vehicle type is Boda-boda |

---

## Parking Fee Schedule

| Vehicle Type | Short Stay (< 3h) | Day Rate (6am–7pm) | Night Rate |
|---|---|---|---|
| Truck | UGX 2,000 | UGX 5,000 / hr | UGX 10,000 / hr |
| Personal Car | UGX 2,000 | UGX 3,000 / hr | UGX 2,000 / hr |
| Taxi | UGX 2,000 | UGX 3,000 / hr | UGX 2,000 / hr |
| Coaster | UGX 3,000 | UGX 4,000 / hr | UGX 2,000 / hr |
| Boda-boda | UGX 1,000 | UGX 2,000 / hr | UGX 2,000 / hr |

---

## File Structure

```
parkease/
├── index.html          — Login page
├── dashboard.html      — Attendant dashboard
├── register.html       — Vehicle registration form
├── signout.html        — Sign-out & receipting
├── reports.html        — Admin revenue reports
├── css/
│   └── style.css       — All styles (2,200+ lines, fully commented)
├── js/
│   ├── auth.js         — Login, session, logout
│   ├── validation.js   — Name, plate, phone, NIN validators
│   ├── dashboard.js    — Stats counters, arrivals table
│   ├── register.js     — Registration form logic
│   ├── signout.js      — Vehicle lookup, fee calculation, receipt
│   └── reports.js      — Table filter, pagination, CSV export
└── assets/
    ├── logo.png            — ParkEase logo
    ├── parking-night.webp  — Login page background
    ├── parking-day.webp    — Dashboard hero banner
    ├── parking-aerial.webp — Reports: parking revenue card
    ├── tyre-wash.webp      — Reports: tyre clinic card
    ├── carwash-exterior.jpg — Reports: battery hire card
    └── ...other images
```

---

## Features

- [x] Login with role-based redirect
- [x] Session stored in localStorage (persists on refresh)
- [x] Dashboard with animated stat counters
- [x] Vehicle registration with full client-side validation
- [x] NIN field shown only for Boda-boda vehicles
- [x] Sign-out with automatic fee calculation
- [x] Receipt preview with QR placeholder and print support
- [x] Admin reports with date navigation
- [x] Table search filter and pagination (5 rows per page)
- [x] CSV export of daily transactions

---

## Notes

- No backend — all data lives in `localStorage` and mock arrays
- Registered vehicles persist and can be searched on the sign-out page
- Printing calls `window.print()` — receipt layout is print-optimised

---

## Author

LEKU EDWARD SHAME — Refactory CSE 2026

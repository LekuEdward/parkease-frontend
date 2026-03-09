// ============================================================
// auth.js — Authentication & Session Management
// ParkEase v2.4.0
// ============================================================

const USERS = {
  'admin': {
    password:  'admin123',
    role:      'admin',
    name:      'Admin User',
    roleLabel: 'Administrator'
  },
  'attendant': {
    password:  'park2026',
    role:      'attendant',
    name:      'Alex Mukasa',
    roleLabel: 'Attendant #04'
  }
};

// ──────────────────────────────────────────────
// handleLogin()  — reads form, validates, stores session
// ──────────────────────────────────────────────
function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  // Hide previous errors
  errorEl.style.display = 'none';

  // Basic empty check
  if (!username || !password) {
    errorEl.textContent = 'Please enter both username and password.';
    errorEl.style.display = 'flex';
    return;
  }

  // Simulate network delay then check credentials
  loginBtn.innerHTML = '<span class="spinner"></span> Signing in...';
  loginBtn.disabled  = true;

  setTimeout(function () {
    const user = USERS[username.toLowerCase()];

    if (user && user.password === password) {
      // Store session in localStorage
      localStorage.setItem('parkease_session', JSON.stringify({
        username:  username,
        name:      user.name,
        role:      user.role,
        roleLabel: user.roleLabel,
        loginTime: new Date().toISOString()
      }));

      // Role-based redirect
      if (user.role === 'admin') {
        window.location.href = 'reports.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      loginBtn.innerHTML = '<span>🔐</span> Sign In to Dashboard';
      loginBtn.disabled  = false;

      errorEl.textContent = 'Invalid username or password. Please try again.';
      errorEl.style.display = 'flex';

      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  }, 650);
}

// ──────────────────────────────────────────────
// requireLogin() — guard for protected pages
// ──────────────────────────────────────────────
function requireLogin() {
  const raw = localStorage.getItem('parkease_session');

  if (!raw) {
    window.location.href = 'index.html';
    return null;
  }

  const session = JSON.parse(raw);
  populateUserUI(session);
  return session;
}

// ──────────────────────────────────────────────
// populateUserUI() — fill in name/role/avatar
// ──────────────────────────────────────────────
function populateUserUI(session) {
  const nameEl   = document.getElementById('user-name');
  const roleEl   = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');
  const initial  = (session.name || session.username || 'U')[0].toUpperCase();

  if (nameEl)   nameEl.textContent   = session.name || session.username;
  if (roleEl)   roleEl.textContent   = session.roleLabel || session.role;
  if (avatarEl) avatarEl.textContent = initial;
}

// ──────────────────────────────────────────────
// logout() — clear session and redirect to login
// ──────────────────────────────────────────────
function logout() {
  localStorage.removeItem('parkease_session');
  window.location.href = 'index.html';
}

// ──────────────────────────────────────────────
// Auto-run on every protected page load
// ──────────────────────────────────────────────
(function autoGuard() {
  const isLoginPage = window.location.pathname.endsWith('index.html')
    || window.location.pathname === '/'
    || window.location.pathname.endsWith('/');

  if (!isLoginPage) {
    requireLogin();
  }
}());

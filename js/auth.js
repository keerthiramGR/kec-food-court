import { state } from './state.js';
import { DEFAULT_USERS } from './data.js';

export function initAuth(showToast, renderApp) {
  const loginGateway = document.getElementById('login-gateway');
  const siteWrapper = document.getElementById('site-wrapper');
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const loginForms = document.querySelectorAll('.role-login-form');
  const demoFillBtns = document.querySelectorAll('.btn-demo-fill');

  // Populate Shop Manager dropdown with current shops
  function populateShopManagerDropdown() {
    const shopSelect = document.getElementById('shop-manager-select');
    if (shopSelect) {
      const shops = state.getShops();
      shopSelect.innerHTML = shops.map(s => `
        <option value="${s.id}">${s.stallNumber} - ${s.name} (${s.ownerName})</option>
      `).join('');
    }
  }

  // Gateway Theme Toggle
  const gatewayThemeBtn = document.getElementById('gateway-theme-btn');
  const gatewayThemeText = document.getElementById('gateway-theme-text');
  if (gatewayThemeBtn) {
    gatewayThemeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('kec_foodcourt_theme', isDark ? 'dark' : 'light');
      if (gatewayThemeText) gatewayThemeText.textContent = isDark ? 'Dark' : 'Light';
      const mainThemeText = document.getElementById('theme-toggle-text');
      if (mainThemeText) mainThemeText.textContent = isDark ? 'Dark' : 'Light';
      showToast(`Switched to ${isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}`, 'info');
    });
  }

  // Handle Role Tab Switching inside Login Gateway
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetRole = tab.dataset.role;
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      loginForms.forEach(form => {
        if (form.dataset.role === targetRole) {
          form.style.display = 'block';
        } else {
          form.style.display = 'none';
        }
      });

      if (targetRole === 'shop_owner') {
        populateShopManagerDropdown();
      }
    });
  });

  // Demo auto-fill buttons
  demoFillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      if (role === 'student') {
        const nameIn = document.getElementById('student-name');
        const rollIn = document.getElementById('student-roll');
        const mobileIn = document.getElementById('student-mobile');
        if (nameIn) nameIn.value = 'Aravind Kumar';
        if (rollIn) rollIn.value = '21EC108';
        if (mobileIn) mobileIn.value = '9876543210';
      } else if (role === 'shop_owner') {
        populateShopManagerDropdown();
        const passIn = document.getElementById('shop-manager-pass');
        if (passIn) passIn.value = 'owner123';
      } else if (role === 'super_admin') {
        const nameIn = document.getElementById('admin-name');
        const phoneIn = document.getElementById('admin-phone');
        const passIn = document.getElementById('admin-pass');
        if (nameIn) nameIn.value = 'Dr. Balakrishnan';
        if (phoneIn) phoneIn.value = '9443322110';
        if (passIn) passIn.value = 'admin123';
      }
    });
  });

  // Gateway Transition Helpers
  window.showLoginGateway = function(preferredRole = 'student') {
    if (loginGateway) loginGateway.classList.remove('hidden');
    if (siteWrapper) siteWrapper.classList.add('hidden');
    populateShopManagerDropdown();
    const targetTab = document.querySelector(`.role-tab-btn[data-role="${preferredRole}"]`);
    if (targetTab) {
      targetTab.click();
    }
  };

  window.hideLoginGateway = function() {
    if (loginGateway) loginGateway.classList.add('hidden');
    if (siteWrapper) siteWrapper.classList.remove('hidden');
  };

  window.openLoginModal = function(preferredRole = 'student') {
    window.showLoginGateway(preferredRole);
  };

  // 1. Student Login Form Submission (Name, Roll No, Mobile No)
  const studentForm = document.getElementById('form-login-student');
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('student-name').value.trim();
      const rollNo = document.getElementById('student-roll').value.trim().toUpperCase();
      const mobile = document.getElementById('student-mobile').value.trim();

      if (!name || !rollNo || !mobile) {
        showToast('Please fill in Name, Roll Number, and Mobile Number', 'error');
        return;
      }

      state.login({
        role: 'student',
        name: name,
        rollNo: rollNo,
        mobile: mobile,
        department: "Electronics & Communication Engg",
        year: "Campus Diner",
        walletBalance: 850,
        avatar: "🎓",
        loginTime: Date.now()
      });

      window.hideLoginGateway();
      showToast(`Welcome, ${name}! (${rollNo}) - Navigating to Student Portal`, 'success');
      window.switchAppPortal('student');
    });
  }

  // 2. Shop Manager Login Form Submission (Selecting their shop, Password)
  const ownerForm = document.getElementById('form-login-owner');
  if (ownerForm) {
    ownerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const shopSelect = document.getElementById('shop-manager-select');
      const pass = document.getElementById('shop-manager-pass').value.trim();
      const selectedShopId = shopSelect ? shopSelect.value : null;

      const shops = state.getShops();
      const matchedShop = shops.find(s => s.id === selectedShopId);

      if (!matchedShop) {
        showToast('Please select a valid stall', 'error');
        return;
      }

      if (pass === matchedShop.password || pass === 'owner123') {
        state.login({
          role: 'shop_owner',
          shopId: matchedShop.id,
          stallName: matchedShop.name,
          stallNumber: matchedShop.stallNumber,
          ownerName: matchedShop.ownerName,
          email: matchedShop.email,
          icon: matchedShop.icon || '🏪',
          loginTime: Date.now()
        });

        window.hideLoginGateway();
        showToast(`Welcome ${matchedShop.ownerName}! Manager portal for ${matchedShop.name} active.`, 'success');
        window.switchAppPortal('owner');
      } else {
        showToast(`Invalid password for ${matchedShop.name}. Use demo: owner123`, 'error');
      }
    });
  }

  // 3. Super Admin Login Form Submission (Name, Ph No, Password)
  const adminForm = document.getElementById('form-login-admin');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-name').value.trim();
      const phone = document.getElementById('admin-phone').value.trim();
      const pass = document.getElementById('admin-pass').value.trim();

      if (!name || !phone || !pass) {
        showToast('Please enter Name, Phone Number, and Password', 'error');
        return;
      }

      if (pass === 'admin123') {
        state.login({
          role: 'super_admin',
          name: name,
          phone: phone,
          email: 'admin@kec.ac.in',
          designation: 'Director of Food Court Facilities',
          avatar: '👑',
          loginTime: Date.now()
        });

        window.hideLoginGateway();
        showToast(`Welcome, ${name}! Navigating to Super Admin Command Center`, 'success');
        window.switchAppPortal('admin');
      } else {
        showToast('Invalid Super Admin security password. Use demo: admin123', 'error');
      }
    });
  }

  // Logout Handler
  window.handleLogout = function() {
    state.logout();
    showToast('Logged out. Please select your portal.', 'info');
    window.showLoginGateway('student');
    renderApp();
  };

  // Initial check on load: If user is not logged in, ensure gateway is visible and site is hidden
  const currentUser = state.getCurrentUser();
  if (!currentUser) {
    window.showLoginGateway('student');
  } else {
    window.hideLoginGateway();
  }
}

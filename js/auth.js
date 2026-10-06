import { state } from './state.js';
import { DEFAULT_USERS } from './data.js';

export function initAuth(showToast, renderApp) {
  const loginModal = document.getElementById('login-modal');
  const navUserSection = document.getElementById('nav-user-section');
  const roleTabs = document.querySelectorAll('.role-tab-btn');
  const loginForms = document.querySelectorAll('.role-login-form');
  const demoFillBtns = document.querySelectorAll('.btn-demo-fill');

  // Handle Role Tab Switching inside Login Modal
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
    });
  });

  // Demo auto-fill buttons
  demoFillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      if (role === 'student') {
        const emailInput = document.getElementById('student-email');
        const passInput = document.getElementById('student-pass');
        if (emailInput && passInput) {
          emailInput.value = 'student@kec.ac.in';
          passInput.value = 'student123';
        }
      } else if (role === 'shop_owner') {
        const emailInput = document.getElementById('owner-email');
        const passInput = document.getElementById('owner-pass');
        if (emailInput && passInput) {
          emailInput.value = 'spice@kecfood.in';
          passInput.value = 'owner123';
        }
      } else if (role === 'super_admin') {
        const emailInput = document.getElementById('admin-email');
        const passInput = document.getElementById('admin-pass');
        if (emailInput && passInput) {
          emailInput.value = 'admin@kec.ac.in';
          passInput.value = 'admin123';
        }
      }
    });
  });

  // Handle Form Submissions
  // 1. Student Login
  const studentForm = document.getElementById('form-login-student');
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('student-email').value.trim();
      const pass = document.getElementById('student-pass').value.trim();

      if ((email === 'student@kec.ac.in' || email.includes('kec.ac.in')) && pass === 'student123') {
        state.login({
          ...DEFAULT_USERS.demoStudent,
          email: email,
          loginTime: Date.now()
        });
        closeLoginModal();
        showToast('Welcome back, Aravind! (Student Portal Active)', 'success');
        renderApp();
      } else {
        showToast('Invalid student credentials. Use demo: student@kec.ac.in / student123', 'error');
      }
    });
  }

  // 2. Shop Owner Login
  const ownerForm = document.getElementById('form-login-owner');
  if (ownerForm) {
    ownerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('owner-email').value.trim();
      const pass = document.getElementById('owner-pass').value.trim();

      // Check across all shops in state (including dynamically created ones!)
      const shops = state.getShops();
      const matchedShop = shops.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === pass);

      if (matchedShop) {
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
        closeLoginModal();
        showToast(`Welcome ${matchedShop.ownerName}! (${matchedShop.name} Portal Active)`, 'success');
        renderApp();
      } else {
        showToast('Stall credentials not matched. Use demo: spice@kecfood.in / owner123', 'error');
      }
    });
  }

  // 3. Super Admin Login
  const adminForm = document.getElementById('form-login-admin');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const pass = document.getElementById('admin-pass').value.trim();

      if (email === DEFAULT_USERS.superAdmin.email && pass === DEFAULT_USERS.superAdmin.password) {
        state.login({
          ...DEFAULT_USERS.superAdmin,
          loginTime: Date.now()
        });
        closeLoginModal();
        showToast('Welcome, Super Admin! (Master Food Court Command Center)', 'success');
        renderApp();
      } else {
        showToast('Invalid Super Admin credentials. Use: admin@kec.ac.in / admin123', 'error');
      }
    });
  }

  // Window helper to open login modal with a preselected role tab
  window.openLoginModal = function(preferredRole = 'student') {
    if (loginModal) {
      loginModal.classList.add('open');
      const targetTab = document.querySelector(`.role-tab-btn[data-role="${preferredRole}"]`);
      if (targetTab) {
        targetTab.click();
      }
    }
  };

  window.closeLoginModal = function() {
    if (loginModal) {
      loginModal.classList.remove('open');
    }
  };

  window.handleLogout = function() {
    state.logout();
    showToast('Logged out safely. Viewing as campus guest.', 'info');
    renderApp();
  };

  // Close modal when clicking on backdrop
  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }
}

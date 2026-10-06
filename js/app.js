import { state } from './state.js';
import { initSplash } from './splash.js';
import { initAuth } from './auth.js';
import { renderStudentPortal, updateCartBadge } from './student.js';
import { renderOwnerPortal } from './owner.js';
import { renderAdminPortal } from './admin.js';
import { openPaymentModal } from './payment.js';

let activePortal = 'student'; // 'student' | 'owner' | 'admin'

// Toast Notification Manager
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <span style="font-size: 0.9rem; flex-grow: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Master Render App Function
export function renderApp() {
  const appContainer = document.getElementById('app-viewport');
  const navUserSection = document.getElementById('nav-user-section');
  const navLinks = document.querySelectorAll('.nav-link-btn');
  const currentUser = state.getCurrentUser();

  // Highlight active portal link in navbar
  navLinks.forEach(link => {
    if (link.dataset.portal === activePortal) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Render Navbar User Session Section
  if (navUserSection) {
    if (currentUser) {
      let roleLabel = 'Student';
      let roleBadgeClass = 'badge-emerald';
      if (currentUser.role === 'shop_owner') {
        roleLabel = `${currentUser.stallNumber || 'Stall'}`;
        roleBadgeClass = 'badge-gold';
      } else if (currentUser.role === 'super_admin') {
        roleLabel = 'Super Admin';
        roleBadgeClass = 'badge-rose';
      }

      navUserSection.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); padding: 5px 12px; border-radius: var(--radius-full); border: 1px solid var(--border-glass);">
            <span style="font-size: 1.1rem;">${currentUser.avatar || currentUser.icon || '👤'}</span>
            <span style="font-size: 0.88rem; font-weight: 700; color: #FFF;">${currentUser.name || currentUser.stallName}</span>
            <span class="badge ${roleBadgeClass}" style="font-size: 0.68rem; padding: 2px 7px;">${roleLabel}</span>
          </div>

          <button class="btn btn-secondary btn-sm" onclick="window.handleLogout()" title="Sign Out">
            <span>🚪</span>
          </button>
        </div>
      `;
    } else {
      navUserSection.innerHTML = `
        <button class="btn btn-primary btn-sm" onclick="window.openLoginModal('student')">
          <span>🔐</span> Sign In
        </button>
      `;
    }
  }

  // Render Portal Content into App Container
  if (appContainer) {
    if (activePortal === 'student') {
      renderStudentPortal(appContainer, showToast, renderApp);
    } else if (activePortal === 'owner') {
      renderOwnerPortal(appContainer, showToast, renderApp);
    } else if (activePortal === 'admin') {
      renderAdminPortal(appContainer, showToast, renderApp);
    }
  }

  updateCartBadge();
}

// Portal Switcher
window.switchAppPortal = function(portalName) {
  activePortal = portalName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
};

// Cart Drawer / Modal Logic
function initCartModal() {
  const floatingBtn = document.getElementById('cart-floating-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartBody = document.getElementById('cart-modal-body');

  if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
      openCartDrawer();
    });
  }

  window.openCartDrawer = function() {
    if (!cartModal || !cartBody) return;
    const cart = state.getCart();

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
          <h3 style="margin-bottom: 8px;">Your campus food tray is empty</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
            Explore the stalls and add delicious food to generate your live token!
          </p>
          <button class="btn btn-primary" onclick="document.getElementById('cart-modal').classList.remove('open')">
            Browse Stalls Now
          </button>
        </div>
      `;
    } else {
      cartBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; max-height: 320px; overflow-y: auto;">
          ${cart.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div>
                <div style="font-weight: 700; color: #FFF; font-size: 0.95rem;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.shopName} (${item.stallNumber})</div>
                <div style="font-weight: 800; color: var(--primary-gold); font-size: 0.9rem; margin-top: 4px;">₹${item.price}</div>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <button class="btn btn-secondary btn-sm btn-cart-dec" data-id="${item.id}" style="width: 28px; height: 28px; padding: 0;">-</button>
                <span style="font-weight: 800; min-width: 20px; text-align: center;">${item.qty}</span>
                <button class="btn btn-secondary btn-sm btn-cart-inc" data-id="${item.id}" style="width: 28px; height: 28px; padding: 0;">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Dine-In or Takeaway Selector -->
        <div style="margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: var(--radius-md);">
          <label style="font-size: 0.82rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 8px;">Order Dining Preference:</label>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9rem;">
              <input type="radio" name="order-type" value="Dine-In" checked />
              <span>🍽️ Dine-In at Food Court</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9rem;">
              <input type="radio" name="order-type" value="Takeaway" />
              <span>🥡 Fast Takeaway</span>
            </label>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div style="border-top: 1px solid var(--border-glass); padding-top: 14px; margin-bottom: 20px; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--text-secondary);">
            <span>Subtotal:</span>
            <span>₹${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-secondary);">
            <span>Campus Service & GST (5%):</span>
            <span>₹${tax}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; color: #FFF;">
            <span>Grand Total:</span>
            <span style="color: var(--primary-gold);">₹${total}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" style="width: 100%;" id="btn-confirm-checkout">
          <span>💳</span> Proceed to Pay with GPay (₹${total})
        </button>
      `;

      // Inc / Dec handlers
      cartBody.querySelectorAll('.btn-cart-inc').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = state.updateCartQty(btn.dataset.id, 1);
          if (res && !res.success) {
            showToast(res.message, 'warning');
          }
          openCartDrawer();
          updateCartBadge();
        });
      });
      cartBody.querySelectorAll('.btn-cart-dec').forEach(btn => {
        btn.addEventListener('click', () => {
          state.updateCartQty(btn.dataset.id, -1);
          openCartDrawer();
          updateCartBadge();
        });
      });

      // Checkout Handler: Triggers GPay Payment Gateway
      const checkoutBtn = document.getElementById('btn-confirm-checkout');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          const diningType = document.querySelector('input[name="order-type"]:checked')?.value || 'Dine-In';
          const currentUser = state.getCurrentUser();
          const firstItem = cart[0];

          // Prepare order parameters for payment verification
          const orderParams = {
            studentName: currentUser ? currentUser.name : "Aravind Kumar",
            studentRoll: currentUser ? (currentUser.rollNo || "21EC108") : "21EC108",
            studentPhone: currentUser ? (currentUser.mobile || currentUser.phone || "98427 06474") : "98427 06474",
            shopId: firstItem.shopId,
            shopName: firstItem.shopName,
            stallNumber: firstItem.stallNumber,
            items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
            totalAmount: total,
            diningType: diningType
          };

          // Close cart modal
          cartModal.classList.remove('open');

          // Open Demo GPay UPI Payment Gateway
          setTimeout(() => {
            openPaymentModal(orderParams, showToast, renderApp);
          }, 200);
        });
      }
    }

    cartModal.classList.add('open');
  };
}

// Global modal closer binding
function initGlobalModals() {
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });
}

// Light / Dark Theme Manager
export function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeText = document.getElementById('theme-toggle-text');

  function updateThemeUI() {
    const isDark = document.documentElement.classList.contains('dark');
    if (themeText) {
      themeText.textContent = isDark ? 'Dark' : 'Light';
    }
  }

  // Initial UI sync
  updateThemeUI();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('kec_foodcourt_theme', isDark ? 'dark' : 'light');
      updateThemeUI();
      showToast(`Switched to ${isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}`, 'info');
    });
  }
}

// Main Bootstrapping
function bootstrap() {
  initTheme();
  initSplash();
  initAuth(showToast, renderApp);
  initCartModal();
  initGlobalModals();

  // Bind Navbar links
  document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPortal = btn.dataset.portal;
      if (targetPortal) {
        window.switchAppPortal(targetPortal);
      }
    });
  });

  // State change observer
  state.subscribe((event, data) => {
    // When state updates (orders, shops), sync badge & view
    updateCartBadge();
  });

  // Initial render
  renderApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}


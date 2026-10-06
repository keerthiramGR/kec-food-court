import { state } from './state.js';

export function renderStudentPortal(container, showToast, renderApp) {
  const shops = state.getShops();
  const orders = state.getOrders();
  const currentUser = state.getCurrentUser();
  const isStudentLoggedIn = currentUser && currentUser.role === 'student';

  // Filter student's active orders
  const studentOrders = isStudentLoggedIn 
    ? orders.filter(o => o.studentRoll === currentUser.rollNo || o.studentRoll === '21EC108')
    : orders.slice(0, 3); // show demo orders for guest preview

  let currentCategory = 'all';
  let searchQuery = '';

  function getFilteredShops() {
    return shops.filter(shop => {
      const matchesCategory = currentCategory === 'all' || shop.category.toLowerCase().includes(currentCategory.toLowerCase());
      const matchesSearch = searchQuery === '' || 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shop.menu && shop.menu.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }

  container.innerHTML = `
    <!-- Student Hero Banner -->
    <div class="portal-hero">
      <div class="portal-hero-content">
        <div class="portal-hero-tag">
          <span>🎓</span> Student Campus Food Portal • Kongu Engineering College
        </div>
        <h1 class="portal-hero-title">
          Skip the Cafeteria Queue.<br/>
          <span class="gradient-text">Order Smart, Dine Fresh.</span>
        </h1>
        <p class="portal-hero-desc">
          Browse real-time stalls, order signature meals and bakery treats, and track your food preparation tokens in real time right from your classroom or hostel.
        </p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          ${!isStudentLoggedIn ? `
            <button class="btn btn-primary btn-lg" onclick="window.openLoginModal('student')">
              <span>🎓</span> Student Login with Roll No
            </button>
            <button class="btn btn-secondary btn-lg" onclick="document.getElementById('stalls-section').scrollIntoView({behavior: 'smooth'})">
              <span>🍔</span> Browse All Stalls
            </button>
          ` : `
            <div style="display: flex; align-items: center; gap: 12px; background: rgba(255, 159, 28, 0.12); padding: 10px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255,159,28,0.3);">
              <span style="font-size: 1.4rem;">💳</span>
              <div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Campus Meal Card Balance</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary-gold);">₹${currentUser.walletBalance || 850}.00</div>
              </div>
            </div>
            <button class="btn btn-outline-gold" onclick="document.getElementById('student-tokens-section').scrollIntoView({behavior: 'smooth'})">
              <span>🎟️</span> Track My Tokens (${studentOrders.length})
            </button>
          `}
        </div>
      </div>
    </div>

    <!-- Quick Metrics Bar -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="color: #FF9F1C;">🏪</div>
        <div>
          <div class="stat-value">${shops.length}</div>
          <div class="stat-label">Active Campus Stalls</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #10B981;">⚡</div>
        <div>
          <div class="stat-value">${shops.filter(s => s.isOpen).length} Open</div>
          <div class="stat-label">Live Kitchen Counters</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #06B6D4;">⏱️</div>
        <div>
          <div class="stat-value">6-12 min</div>
          <div class="stat-label">Avg Pickup Time</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #EC4899;">🥗</div>
        <div>
          <div class="stat-value">100% Pure</div>
          <div class="stat-label">Hygiene Certified</div>
        </div>
      </div>
    </div>

    <!-- Live Tokens Board if active -->
    <div id="student-tokens-section" style="margin-bottom: 40px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 8px;">
            <span>🎟️</span> Live Campus Order Tokens
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Real-time status updates from stall kitchens</p>
        </div>
        <span class="badge badge-emerald">Live Kitchen Feed</span>
      </div>

      <div class="orders-board">
        ${studentOrders.length === 0 ? `
          <div class="glass-panel" style="padding: 24px; text-align: center; grid-column: 1 / -1; color: var(--text-secondary);">
            No active orders right now. Pick your favorite dish below to generate your token!
          </div>
        ` : studentOrders.map(order => {
          const isReady = order.status === 'Ready at Counter';
          return `
            <div class="token-card ${isReady ? 'ready-glow' : ''}">
              <div class="token-header">
                <div>
                  <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">TOKEN NUMBER</span>
                  <div class="token-num">${order.tokenNumber}</div>
                </div>
                <span class="token-status-pill ${order.status.toLowerCase().replace(/\s+/g, '-')}">
                  ${isReady ? '🔔 READY FOR PICKUP' : order.status}
                </span>
              </div>
              
              <div style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF;">
                ${order.shopName} <span style="color: var(--text-secondary); font-size: 0.82rem;">(${order.stallNumber})</span>
              </div>

              <div class="token-items-list">
                ${order.items.map(item => `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>${item.qty}x ${item.name}</span>
                    <span style="font-weight: 600;">₹${item.price * item.qty}</span>
                  </div>
                `).join('')}
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-secondary); pt-2;">
                <span>Type: <strong style="color: #FFF;">${order.diningType || 'Dine-In'}</strong></span>
                <span style="font-weight: 800; color: var(--primary-gold); font-size: 1.05rem;">Total: ₹${order.totalAmount}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Stalls & Food Explore Section -->
    <div id="stalls-section">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: 1.7rem;">Explore Food Stalls</h2>
          <p style="font-size: 0.88rem; color: var(--text-secondary);">Taste the variety across all KEC Food Court zones</p>
        </div>

        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="stall-search-input" placeholder="Search biryani, coffee, stall, dosa..." value="${searchQuery}" />
        </div>
      </div>

      <!-- Filter Categories -->
      <div class="student-filter-bar">
        <div class="filter-chips" id="category-filter-chips">
          <button class="filter-chip ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">🍽️ All Stalls</button>
          <button class="filter-chip ${currentCategory === 'meals' ? 'active' : ''}" data-cat="meals">🍛 Meals & Biryani</button>
          <button class="filter-chip ${currentCategory === 'cafe' ? 'active' : ''}" data-cat="cafe">☕ Cafe & Bakes</button>
          <button class="filter-chip ${currentCategory === 'tiffin' ? 'active' : ''}" data-cat="tiffin">🥞 South Tiffin</button>
          <button class="filter-chip ${currentCategory === 'juices' ? 'active' : ''}" data-cat="juices">🥤 Juices & Shakes</button>
          <button class="filter-chip ${currentCategory === 'chinese' ? 'active' : ''}" data-cat="chinese">🍜 Chinese & Fast Food</button>
        </div>
      </div>

      <!-- Stalls Cards Grid -->
      <div class="stalls-grid" id="stalls-grid-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Render stall cards
  function updateStallGrid() {
    const grid = document.getElementById('stalls-grid-container');
    if (!grid) return;
    const filtered = getFilteredShops();

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="glass-panel" style="padding: 40px; text-align: center; grid-column: 1 / -1;">
          <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 12px;">No stalls or items matched "${searchQuery}".</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-filters">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentCategory = 'all';
          searchQuery = '';
          const searchIn = document.getElementById('stall-search-input');
          if (searchIn) searchIn.value = '';
          document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          document.querySelector('.filter-chip[data-cat="all"]')?.classList.add('active');
          updateStallGrid();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(shop => {
      return `
        <div class="stall-card" data-shop-id="${shop.id}">
          <div class="stall-card-banner">
            <img src="${shop.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'}" alt="${shop.name}" loading="lazy"/>
            <div class="stall-card-banner-overlay"></div>
            <div class="stall-badge-float">
              <span class="badge badge-gold">${shop.stallNumber}</span>
            </div>
            <div class="stall-status-float">
              <span class="badge ${shop.isOpen ? 'badge-emerald' : 'badge-rose'}">
                ${shop.isOpen ? '🟢 Open Now' : '🔴 Closed'}
              </span>
            </div>
          </div>

          <div class="stall-card-body">
            <div class="stall-card-header">
              <h3 class="stall-title">${shop.name}</h3>
              <span style="font-size: 1.3rem;">${shop.icon || '🏪'}</span>
            </div>
            <p class="stall-tagline">${shop.tagline}</p>

            <div style="margin-bottom: 16px;">
              <div style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Featured Delicacies:</div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${(shop.menu || []).slice(0, 3).map(m => `
                  <span style="font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; color: var(--text-secondary);">
                    ${m.name.split(' ')[0]} ${m.name.split(' ')[1] || ''} • ₹${m.price}
                  </span>
                `).join('')}
              </div>
            </div>

            <div class="stall-meta">
              <div class="stall-meta-item rating">
                <span>⭐</span> ${shop.rating || '4.8'} (${shop.reviewsCount || 100})
              </div>
              <div class="stall-meta-item">
                <span>⏱️</span> ${shop.prepTime || '10-15 mins'}
              </div>
              <div class="stall-meta-item" style="margin-left: auto;">
                <button class="btn btn-outline-gold btn-sm btn-view-menu" data-shop-id="${shop.id}">
                  View Menu →
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind Stall Card Click to open Menu Modal
    grid.querySelectorAll('.stall-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const shopId = card.dataset.shopId;
        openStallMenuModal(shopId);
      });
    });
  }

  // Setup Event Listeners
  const searchInput = document.getElementById('stall-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      updateStallGrid();
    });
  }

  const categoryChips = document.querySelectorAll('.filter-chip');
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.cat;
      updateStallGrid();
    });
  });

  // Modal for Stall Menu
  window.openStallMenuModal = function(shopId) {
    const shop = state.getShopById(shopId);
    if (!shop) return;

    const modal = document.getElementById('stall-menu-modal');
    const modalContent = document.getElementById('stall-menu-content');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid var(--border-glass);">
        <div style="width: 68px; height: 68px; border-radius: var(--radius-md); background: ${shop.accentColor || '#FF9F1C'}; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; flex-shrink: 0;">
          ${shop.icon || '🏪'}
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.5rem;">${shop.name}</h2>
            <span class="badge badge-gold">${shop.stallNumber}</span>
            <span class="badge ${shop.isOpen ? 'badge-emerald' : 'badge-rose'}">${shop.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">${shop.tagline}</p>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Managed by: ${shop.ownerName} • Contact: ${shop.email}</div>
        </div>
      </div>

      <h3 style="font-size: 1.15rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        <span>🍽️</span> Stall Menu & Live Kitchen Ordering
      </h3>

      <div class="menu-items-grid">
        ${(!shop.menu || shop.menu.length === 0) ? `
          <p style="color: var(--text-secondary);">No menu items added for this stall yet.</p>
        ` : shop.menu.map(item => {
          return `
            <div class="menu-item-card">
              <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}" alt="${item.name}" class="menu-item-img" />
              <div class="menu-item-details">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}" title="${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
                  <span class="menu-item-name">${item.name}</span>
                </div>
                <div class="menu-item-price">₹${item.price}</div>
                <div class="menu-item-tags">
                  <span style="color: var(--text-secondary);">⏱️ ${item.prepTime || '10m'}</span>
                  ${item.badge ? `<span class="badge badge-gold" style="padding: 2px 6px; font-size: 0.68rem;">${item.badge}</span>` : ''}
                  ${!item.isAvailable ? `<span class="badge badge-rose" style="padding: 2px 6px; font-size: 0.68rem;">Sold Out</span>` : ''}
                </div>
              </div>

              <div>
                ${item.isAvailable ? `
                  <button class="btn btn-primary btn-sm btn-add-item-cart" data-item-id="${item.id}" data-shop-id="${shop.id}">
                    + Add
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.5; cursor: not-allowed;">
                    Out
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Bind Add to Cart buttons
    modalContent.querySelectorAll('.btn-add-item-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.dataset.itemId;
        const targetItem = shop.menu.find(m => m.id === itemId);
        if (targetItem) {
          state.addToCart(targetItem, shop);
          showToast(`Added "${targetItem.name}" to campus tray!`, 'success');
          updateCartBadge();
        }
      });
    });

    modal.classList.add('open');
  };

  updateStallGrid();
  updateCartBadge();
}

export function updateCartBadge() {
  const cart = state.getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-floating-count');
  const trigger = document.getElementById('cart-floating-btn');

  if (badge) {
    badge.textContent = totalCount;
  }
  if (trigger) {
    if (totalCount > 0) {
      trigger.style.display = 'flex';
    } else {
      trigger.style.display = 'none';
    }
  }
}

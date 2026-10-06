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
          Browse real-time stalls, order signature meals and fresh juices & shakes, and track your food preparation tokens in real time right from your classroom or hostel.
        </p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('stalls-section').scrollIntoView({behavior: 'smooth'})">
            <span>🍔</span> Explore Campus Stalls
          </button>
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
          <button class="filter-chip ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">🍽️ All Stalls (2)</button>
          <button class="filter-chip ${currentCategory === 'food' ? 'active' : ''}" data-cat="food">🍛 Food</button>
          <button class="filter-chip ${currentCategory === 'juice' ? 'active' : ''}" data-cat="juice">🥤 Juice</button>
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

    let modalCategory = 'all';
    let modalSearch = '';
    let modalDiet = 'all'; // 'all', 'veg', 'non-veg'

    // Extract unique categories from menu
    const menuCategories = ['all', ...new Set((shop.menu || []).map(m => m.category).filter(Boolean))];

    function renderModalBody() {
      const items = (shop.menu || []).filter(item => {
        const matchesCategory = modalCategory === 'all' || item.category === modalCategory;
        const matchesSearch = modalSearch === '' || 
          item.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
          (item.badge && item.badge.toLowerCase().includes(modalSearch.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(modalSearch.toLowerCase()));
        const matchesDiet = modalDiet === 'all' || 
          (modalDiet === 'veg' && item.isVeg) || 
          (modalDiet === 'non-veg' && !item.isVeg);
        return matchesCategory && matchesSearch && matchesDiet;
      });

      modalContent.innerHTML = `
        <!-- Shop Header & Official Price List Card Banner -->
        <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px solid var(--border-glass); flex-wrap: wrap;">
          <div style="width: 68px; height: 68px; border-radius: var(--radius-md); background: ${shop.accentColor || '#FF9F1C'}; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; flex-shrink: 0; box-shadow: 0 4px 14px rgba(255, 159, 28, 0.35);">
            ${shop.icon || '🍛'}
          </div>
          <div style="flex-grow: 1;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h2 style="font-size: 1.6rem; font-weight: 800;">${shop.name}</h2>
              <span class="badge badge-gold">${shop.stallNumber}</span>
              <span class="badge ${shop.isOpen ? 'badge-emerald' : 'badge-rose'}">${shop.isOpen ? '🟢 Open Now' : '🔴 Closed'}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.92rem; margin-top: 2px;">${shop.tagline}</p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
              <span>👤 Managed by: <strong>${shop.ownerName}</strong></span>
              <span>📞 Stall Phone: <strong style="color: var(--primary-gold);">${shop.phone || '98427 06474 / 94429 06474'}</strong></span>
            </div>
          </div>
        </div>

        <!-- Official Food Court Notice Pill -->
        <div style="background: rgba(255, 159, 28, 0.12); border: 1px dashed rgba(255, 159, 28, 0.4); border-radius: var(--radius-md); padding: 10px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 0.88rem; color: var(--text-main); font-weight: 600;">
            <span>📋 FOOD COURT OFFICIAL MENU</span> • Total Items: <strong style="color: var(--primary-gold);">${shop.menu ? shop.menu.length : 0}</strong>
          </div>
          <div style="font-size: 0.82rem; color: var(--text-secondary);">
            📦 <strong style="color: var(--accent-rose);">Parcel Charges Extra</strong> • 📞 For Orders: <strong>98427 06474 / 94429 06474</strong>
          </div>
        </div>

        <!-- In-Modal Filter Bar: Search + Diet Toggle -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div class="search-input-wrap" style="flex: 1; min-width: 240px; margin-bottom: 0;">
            <span class="search-icon">🔍</span>
            <input type="text" id="modal-menu-search-input" placeholder="Search dish (e.g. Parotta, Kothu, Roast, Biryani, 65...)" value="${modalSearch}" />
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm ${modalDiet === 'all' ? 'btn-primary' : 'btn-secondary'}" data-diet="all" id="diet-all-btn">
              All Dishes
            </button>
            <button class="btn btn-sm ${modalDiet === 'veg' ? 'btn-primary' : 'btn-secondary'}" data-diet="veg" id="diet-veg-btn" style="border-color: #10B981;">
              🟢 Veg Only
            </button>
            <button class="btn btn-sm ${modalDiet === 'non-veg' ? 'btn-primary' : 'btn-secondary'}" data-diet="non-veg" id="diet-nonveg-btn" style="border-color: #EF4444;">
              🔴 Non-Veg
            </button>
          </div>
        </div>

        <!-- Category Sub-Tabs -->
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 18px; scrollbar-width: thin;">
          ${menuCategories.map(cat => {
            const count = cat === 'all' 
              ? (shop.menu || []).length 
              : (shop.menu || []).filter(m => m.category === cat).length;
            const label = cat === 'all' ? 'All Dishes' : cat;
            const isActive = modalCategory === cat;
            return `
              <button class="filter-chip modal-cat-chip ${isActive ? 'active' : ''}" data-cat="${cat}" style="white-space: nowrap; font-size: 0.82rem; padding: 6px 14px;">
                ${label} (${count})
              </button>
            `;
          }).join('')}
        </div>

        <!-- Showing Result Count -->
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px; display: flex; justify-content: space-between;">
          <span>Showing <strong>${items.length}</strong> delicacies</span>
          ${modalCategory !== 'all' || modalSearch || modalDiet !== 'all' ? `
            <a href="javascript:void(0)" id="reset-modal-filters" style="color: var(--primary-gold); text-decoration: underline;">Reset Filters</a>
          ` : ''}
        </div>

        <!-- Items Grid -->
        <div class="menu-items-grid" id="modal-items-grid">
          ${items.length === 0 ? `
            <div class="glass-panel" style="padding: 36px; text-align: center; grid-column: 1 / -1; color: var(--text-secondary);">
              <p style="font-size: 1.05rem; margin-bottom: 8px;">No delicacies found matching your search.</p>
              <button class="btn btn-secondary btn-sm" id="btn-clear-modal-search">Clear Search</button>
            </div>
          ` : items.map(item => {
            return `
              <div class="menu-item-card">
                <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}" alt="${item.name}" class="menu-item-img" loading="lazy" />
                <div class="menu-item-details">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span class="diet-indicator ${item.isVeg ? 'veg' : 'non-veg'}" title="${item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}"></span>
                    <span class="menu-item-name">${item.name}</span>
                  </div>
                  <div class="menu-item-price">₹${item.price}</div>
                  <div class="menu-item-tags">
                    <span style="color: var(--text-secondary);">⏱️ ${item.prepTime || '10m'}</span>
                    ${item.badge ? `<span class="badge badge-gold" style="padding: 2px 6px; font-size: 0.68rem;">${item.badge}</span>` : ''}
                    ${item.category ? `<span style="font-size: 0.7rem; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${item.category}</span>` : ''}
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

      // Bind Search Input
      const searchIn = modalContent.querySelector('#modal-menu-search-input');
      if (searchIn) {
        searchIn.addEventListener('input', (e) => {
          modalSearch = e.target.value;
          renderModalBody();
          // refocus and keep cursor at end
          const newIn = modalContent.querySelector('#modal-menu-search-input');
          if (newIn) {
            newIn.focus();
            newIn.setSelectionRange(newIn.value.length, newIn.value.length);
          }
        });
      }

      // Bind Diet Buttons
      modalContent.querySelectorAll('#diet-all-btn, #diet-veg-btn, #diet-nonveg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modalDiet = btn.dataset.diet;
          renderModalBody();
        });
      });

      // Bind Category Chips
      modalContent.querySelectorAll('.modal-cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          modalCategory = chip.dataset.cat;
          renderModalBody();
        });
      });

      // Reset filter link
      const resetLink = modalContent.querySelector('#reset-modal-filters');
      if (resetLink) {
        resetLink.addEventListener('click', () => {
          modalCategory = 'all';
          modalSearch = '';
          modalDiet = 'all';
          renderModalBody();
        });
      }

      const clearSearchBtn = modalContent.querySelector('#btn-clear-modal-search');
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          modalSearch = '';
          renderModalBody();
        });
      }

      // Bind Add to Cart buttons
      modalContent.querySelectorAll('.btn-add-item-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.dataset.itemId;
          const targetItem = shop.menu.find(m => m.id === itemId);
          if (targetItem) {
            state.addToCart(targetItem, shop);
            showToast(`Added "${targetItem.name}" (₹${targetItem.price}) to tray!`, 'success');
            updateCartBadge();
          }
        });
      });
    }

    renderModalBody();
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

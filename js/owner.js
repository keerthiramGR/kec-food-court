import { state } from './state.js';

let ownerMenuSearchQuery = '';
let ownerMenuCategoryFilter = 'all';
let ownerMenuDietFilter = 'all';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderOwnerPortal(container, showToast, renderApp) {
  const currentUser = state.getCurrentUser();
  const shops = state.getShops();

  // Determine which shop is being managed
  let currentShop = null;
  if (currentUser && currentUser.role === 'shop_owner') {
    currentShop = shops.find(s => s.id === currentUser.shopId || s.email === currentUser.email);
  }

  // Fallback to first shop if not logged in, or show stall selector
  if (!currentShop && shops.length > 0) {
    currentShop = shops[0];
  }

  if (!currentShop) {
    container.innerHTML = `
      <div class="glass-panel" style="padding: 40px; text-align: center;">
        <h2>No stalls registered yet!</h2>
        <p style="color: var(--text-secondary); margin: 12px 0 20px;">Please login as Super Admin to add the first food court shop.</p>
        <button class="btn btn-primary" onclick="window.openLoginModal('super_admin')">Super Admin Login</button>
      </div>
    `;
    return;
  }

  const allOrders = state.getOrders();
  const shopOrders = allOrders.filter(o => o.shopId === currentShop.id);

  const placedOrders = shopOrders.filter(o => o.status === 'Placed');
  const preparingOrders = shopOrders.filter(o => o.status === 'Kitchen Preparing');
  const readyOrders = shopOrders.filter(o => o.status === 'Ready at Counter');
  const completedOrders = shopOrders.filter(o => o.status === 'Completed');

  const totalRevenue = shopOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const menuCategories = ['all', ...Array.from(new Set((currentShop.menu || []).map(d => d.category).filter(Boolean)))];

  container.innerHTML = `
    <!-- Shop Owner Portal Header -->
    <div class="owner-header-bar">
      <div class="owner-stall-info">
        <div class="owner-stall-avatar" style="background: ${currentShop.accentColor || '#FF9F1C'};">
          ${currentShop.icon || '🏪'}
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="font-size: 1.6rem; color: #FFFFFF;">${currentShop.name}</h1>
            <span class="badge badge-gold">${currentShop.stallNumber}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">
            Owner: <strong>${currentShop.ownerName}</strong> (${currentShop.email}) • Category: ${currentShop.category}
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <!-- Switch Stall Selector if multi-stall preview -->
        <select id="owner-shop-switcher" class="form-select" style="padding: 8px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06);">
          ${shops.map(s => `
            <option value="${s.id}" ${s.id === currentShop.id ? 'selected' : ''}>
              ${s.stallNumber} - ${s.name}
            </option>
          `).join('')}
        </select>

        <!-- Live Stall Open/Close Toggle -->
        <div class="toggle-switch" id="toggle-stall-open-status" title="Toggle Stall Open / Closed">
          <div class="toggle-track ${currentShop.isOpen ? 'active' : ''}">
            <div class="toggle-thumb"></div>
          </div>
          <span style="font-weight: 700; font-size: 0.92rem; color: ${currentShop.isOpen ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
            ${currentShop.isOpen ? 'Kitchen Open' : 'Stall Closed'}
          </span>
        </div>

        ${(!currentUser || currentUser.role !== 'shop_owner') ? `
          <button class="btn btn-outline-gold btn-sm" onclick="window.openLoginModal('shop_owner')">
            <span>🔑</span> Authenticate as Owner
          </button>
        ` : `
          <button class="btn btn-secondary btn-sm" onclick="window.handleLogout()">
            <span>🚪</span> Logout
          </button>
        `}
      </div>
    </div>

    <!-- Shop Stats Row -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="color: #FF9F1C;">💰</div>
        <div>
          <div class="stat-value">₹${totalRevenue}</div>
          <div class="stat-label">Stall Today's Revenue</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #06B6D4;">📦</div>
        <div>
          <div class="stat-value">${shopOrders.length}</div>
          <div class="stat-label">Total Orders Today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #F59E0B;">⏳</div>
        <div>
          <div class="stat-value">${placedOrders.length + preparingOrders.length}</div>
          <div class="stat-label">Active in Kitchen</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #10B981;">✅</div>
        <div>
          <div class="stat-value">${completedOrders.length}</div>
          <div class="stat-label">Completed Pickups</div>
        </div>
      </div>
    </div>

    <!-- Live Orders Pipeline / Kanban -->
    <div style="margin-bottom: 36px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 8px;">
            <span>🍳</span> Real-Time Kitchen Order Kanban
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Manage preparation stages and notify student tokens</p>
        </div>
        <span class="badge badge-gold">Auto-Refreshes</span>
      </div>

      <div class="orders-pipeline">
        <!-- Column 1: Placed / Queued -->
        <div class="pipeline-col">
          <div class="pipeline-col-header">
            <span class="pipeline-title" style="color: #F59E0B;">
              <span>📥</span> In Queue / Placed
            </span>
            <span class="pipeline-count">${placedOrders.length}</span>
          </div>

          <div class="pipeline-orders-list">
            ${placedOrders.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 0.88rem;">No new orders in queue.</div>
            ` : placedOrders.map(order => renderOwnerOrderCard(order, 'start-cooking')).join('')}
          </div>
        </div>

        <!-- Column 2: Kitchen Preparing -->
        <div class="pipeline-col">
          <div class="pipeline-col-header">
            <span class="pipeline-title" style="color: #06B6D4;">
              <span>🔥</span> Kitchen Preparing
            </span>
            <span class="pipeline-count">${preparingOrders.length}</span>
          </div>

          <div class="pipeline-orders-list">
            ${preparingOrders.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 0.88rem;">Kitchen counter idle.</div>
            ` : preparingOrders.map(order => renderOwnerOrderCard(order, 'mark-ready')).join('')}
          </div>
        </div>

        <!-- Column 3: Ready at Counter -->
        <div class="pipeline-col">
          <div class="pipeline-col-header">
            <span class="pipeline-title" style="color: #10B981;">
              <span>🔔</span> Ready for Pickup
            </span>
            <span class="pipeline-count">${readyOrders.length}</span>
          </div>

          <div class="pipeline-orders-list">
            ${readyOrders.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 0.88rem;">No tokens waiting at counter.</div>
            ` : readyOrders.map(order => renderOwnerOrderCard(order, 'mark-completed')).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Stall Menu & Stock Manager Section -->
    <div class="admin-card-section">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.4rem;">Stall Menu & Catalog Editor</h2>
            <span class="badge badge-gold" id="owner-menu-count-badge">
              ${(currentShop.menu || []).length} Dishes
            </span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 4px;">
            Edit dish names, prices, categories, diet types, stock availability, and dish photos in real time
          </p>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-open-add-dish-modal">
          <span>+</span> Add New Dish to Menu
        </button>
      </div>

      <!-- Menu Search & Filter Toolbar -->
      <div style="display: flex; gap: 12px; align-items: center; margin: 16px 0 20px; flex-wrap: wrap; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <div style="flex: 1; min-width: 220px; position: relative;">
          <input type="text" id="owner-menu-search-input" class="form-input" 
                 style="width: 100%; padding-left: 36px; padding-top: 8px; padding-bottom: 8px; font-size: 0.88rem;" 
                 placeholder="Search dishes by name, category, or badge..." 
                 value="${escapeHtml(ownerMenuSearchQuery)}" />
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; pointer-events: none; opacity: 0.6;">🔍</span>
        </div>

        <div style="min-width: 180px;">
          <select id="owner-menu-cat-filter" class="form-select" style="width: 100%; padding: 8px 12px; font-size: 0.88rem;">
            <option value="all" ${ownerMenuCategoryFilter === 'all' ? 'selected' : ''}>All Categories (${(currentShop.menu || []).length})</option>
            ${menuCategories.filter(c => c !== 'all').map(c => `
              <option value="${escapeHtml(c)}" ${ownerMenuCategoryFilter === c ? 'selected' : ''}>
                ${escapeHtml(c)} (${(currentShop.menu || []).filter(d => d.category === c).length})
              </option>
            `).join('')}
          </select>
        </div>

        <div style="min-width: 140px;">
          <select id="owner-menu-diet-filter" class="form-select" style="width: 100%; padding: 8px 12px; font-size: 0.88rem;">
            <option value="all" ${ownerMenuDietFilter === 'all' ? 'selected' : ''}>All Diets</option>
            <option value="veg" ${ownerMenuDietFilter === 'veg' ? 'selected' : ''}>🌱 Veg Only</option>
            <option value="non-veg" ${ownerMenuDietFilter === 'non-veg' ? 'selected' : ''}>🍗 Non-Veg Only</option>
          </select>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-reset-menu-filters" style="font-size: 0.82rem; padding: 7px 12px;" title="Reset filters">
          ✕ Reset
        </button>
      </div>

      <div class="stalls-table-wrap">
        <table class="stalls-table">
          <thead>
            <tr>
              <th>Dish</th>
              <th>Category</th>
              <th>Diet</th>
              <th>Price</th>
              <th>Est. Time</th>
              <th>Servings Left</th>
              <th>Availability</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="owner-menu-tbody">
            ${(currentShop.menu || []).map(dish => {
              const servings = dish.servingsCount !== undefined ? dish.servingsCount : 25;
              let servingsBadge = '';
              if (servings <= 0) {
                servingsBadge = `<span class="badge badge-rose" style="font-size: 0.72rem; font-weight: 700;">🔴 0 left (Sold Out)</span>`;
              } else if (servings <= 5) {
                servingsBadge = `<span class="badge badge-gold" style="font-size: 0.72rem; font-weight: 700;">⚠️ ${servings} left</span>`;
              } else {
                servingsBadge = `<span class="badge badge-emerald" style="font-size: 0.72rem; font-weight: 700;">🟢 ${servings} left</span>`;
              }

              return `
              <tr class="dish-row" 
                  data-dish-id="${dish.id}" 
                  data-name="${escapeHtml(dish.name)}" 
                  data-category="${escapeHtml(dish.category || '')}" 
                  data-badge="${escapeHtml(dish.badge || '')}" 
                  data-is-veg="${dish.isVeg ? 'true' : 'false'}">
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${dish.image || 'assets/menu/f-1.jpg'}" 
                         onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" 
                         style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-glass); flex-shrink: 0;" />
                    <div>
                      <div style="font-weight: 700; color: #FFF; font-size: 0.95rem; line-height: 1.3;">${escapeHtml(dish.name)}</div>
                      ${dish.badge ? `<span class="badge badge-gold" style="font-size: 0.65rem; padding: 1px 6px; margin-top: 3px; display: inline-block;">${escapeHtml(dish.badge)}</span>` : ''}
                    </div>
                  </div>
                </td>
                <td><span class="badge badge-gold" style="font-size: 0.74rem;">${escapeHtml(dish.category || 'Special')}</span></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="diet-indicator ${dish.isVeg ? 'veg' : 'non-veg'}"></span>
                    <span style="font-size: 0.82rem;">${dish.isVeg ? 'Veg' : 'Non-Veg'}</span>
                  </div>
                </td>
                <td style="font-weight: 800; color: var(--primary-gold); font-family: var(--font-brand); font-size: 1.05rem;">₹${dish.price}</td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${escapeHtml(dish.prepTime || '10m')}</td>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    ${servingsBadge}
                    <div style="display: inline-flex; align-items: center; gap: 3px; margin-top: 3px;">
                      <button class="btn btn-secondary btn-xs btn-quick-servings" data-shop-id="${currentShop.id}" data-dish-id="${dish.id}" data-delta="-1" title="Deduct 1 serving" style="padding: 2px 7px;">-1</button>
                      <button class="btn btn-secondary btn-xs btn-quick-servings" data-shop-id="${currentShop.id}" data-dish-id="${dish.id}" data-delta="1" title="Add 1 serving" style="padding: 2px 7px;">+1</button>
                      <button class="btn btn-secondary btn-xs btn-quick-servings" data-shop-id="${currentShop.id}" data-dish-id="${dish.id}" data-delta="20" title="Restock +20 servings" style="padding: 2px 7px; color: var(--primary-gold); border-color: rgba(255, 159, 28, 0.4);">+20</button>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge ${dish.isAvailable ? 'badge-emerald' : 'badge-rose'}" style="font-size: 0.74rem;">
                    ${dish.isAvailable ? '● In Stock' : '○ Sold Out'}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; align-items: center; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-primary btn-sm btn-edit-dish" data-dish-id="${dish.id}" title="Edit Dish Details">
                      ✏️ Edit
                    </button>
                    <button class="btn ${dish.isAvailable ? 'btn-secondary' : 'btn-emerald'} btn-sm btn-toggle-dish-stock" data-dish-id="${dish.id}" title="Toggle Availability">
                      ${dish.isAvailable ? 'Sold Out' : 'In Stock'}
                    </button>
                    <button class="btn btn-secondary btn-sm btn-delete-dish" data-dish-id="${dish.id}" title="Delete Dish" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3); padding: 6px 10px;">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              `;
            }).join('')}
            <tr id="owner-menu-empty-state" style="display: none;">
              <td colspan="8" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🍽️</div>
                <strong>No dishes match your filter criteria.</strong>
                <div style="margin-top: 6px; font-size: 0.85rem;">Click "Reset" or change your search terms.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Helper to render Order Card in Owner view
  function renderOwnerOrderCard(order, actionType) {
    let actionBtnHtml = '';
    if (actionType === 'start-cooking') {
      actionBtnHtml = `
        <button class="btn btn-primary btn-sm btn-action-order" style="width: 100%;" data-order-id="${order.id}" data-target-status="Kitchen Preparing">
          🔥 Accept & Start Cooking
        </button>
      `;
    } else if (actionType === 'mark-ready') {
      actionBtnHtml = `
        <button class="btn btn-emerald btn-sm btn-action-order" style="width: 100%;" data-order-id="${order.id}" data-target-status="Ready at Counter">
          🔔 Mark Ready (Ring Token)
        </button>
      `;
    } else if (actionType === 'mark-completed') {
      actionBtnHtml = `
        <button class="btn btn-secondary btn-sm btn-action-order" style="width: 100%;" data-order-id="${order.id}" data-target-status="Completed">
          ✅ Delivered / Picked Up
        </button>
      `;
    }

    return `
      <div class="owner-order-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: var(--primary-gold);">
            ${order.tokenNumber}
          </span>
          <span class="badge badge-gold" style="font-size: 0.72rem;">${order.diningType || 'Dine-In'}</span>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Student: <strong style="color: #FFF;">${order.studentName || 'Student'}</strong> (${order.studentRoll || 'Campus'})
        </div>

        <div style="background: rgba(0,0,0,0.25); border-radius: 6px; padding: 8px 10px; font-size: 0.85rem;">
          ${(order.items || []).map(i => `
            <div style="display: flex; justify-content: space-between;">
              <span>${i.qty}x ${i.name}</span>
              <span style="font-weight: 600;">₹${i.price * i.qty}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-secondary);">
          <span>Amount: <strong style="color: var(--primary-gold); font-size: 0.95rem;">₹${order.totalAmount}</strong></span>
          <span style="font-size: 0.75rem;">${order.timestamp || 'Just now'}</span>
        </div>

        <div style="margin-top: 4px;">
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }

  // Setup Owner Event Handlers
  // 1. Switch shop dropdown
  const switcher = document.getElementById('owner-shop-switcher');
  if (switcher) {
    switcher.addEventListener('change', (e) => {
      const selectedShopId = e.target.value;
      const targetShop = shops.find(s => s.id === selectedShopId);
      if (targetShop) {
        state.login({
          role: 'shop_owner',
          shopId: targetShop.id,
          stallName: targetShop.name,
          stallNumber: targetShop.stallNumber,
          ownerName: targetShop.ownerName,
          email: targetShop.email,
          icon: targetShop.icon || '🏪',
          loginTime: Date.now()
        });
        showToast(`Switched view to ${targetShop.name} (${targetShop.stallNumber})`, 'info');
        renderApp();
      }
    });
  }

  // 2. Toggle Open/Closed
  const toggleStallOpen = document.getElementById('toggle-stall-open-status');
  if (toggleStallOpen) {
    toggleStallOpen.addEventListener('click', () => {
      const newStatus = !currentShop.isOpen;
      state.updateShop(currentShop.id, { isOpen: newStatus });
      showToast(`${currentShop.name} is now ${newStatus ? 'OPEN' : 'CLOSED'}`, newStatus ? 'success' : 'info');
      renderApp();
    });
  }

  // 3. Order Status Transitions
  container.querySelectorAll('.btn-action-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const targetStatus = btn.dataset.targetStatus;
      const updated = state.updateOrderStatus(orderId, targetStatus);
      if (updated) {
        showToast(`Token ${updated.tokenNumber} updated to "${targetStatus}"!`, 'success');
        renderApp();
      }
    });
  });

  // 4. Client-side Search & Category/Diet Filters for Stall Menu
  function applyMenuFilters() {
    const searchInput = document.getElementById('owner-menu-search-input');
    const catFilter = document.getElementById('owner-menu-cat-filter');
    const dietFilter = document.getElementById('owner-menu-diet-filter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = catFilter ? catFilter.value : 'all';
    const diet = dietFilter ? dietFilter.value : 'all';

    ownerMenuSearchQuery = q;
    ownerMenuCategoryFilter = cat;
    ownerMenuDietFilter = diet;

    let visibleCount = 0;
    const rows = container.querySelectorAll('.dish-row');
    rows.forEach(row => {
      const dishName = (row.dataset.name || '').toLowerCase();
      const dishCat = (row.dataset.category || '').toLowerCase();
      const dishBadge = (row.dataset.badge || '').toLowerCase();
      const dishIsVeg = row.dataset.isVeg === 'true';

      const matchesSearch = !q || dishName.includes(q) || dishCat.includes(q) || dishBadge.includes(q);
      const matchesCat = cat === 'all' || row.dataset.category === cat;
      const matchesDiet = diet === 'all' || (diet === 'veg' && dishIsVeg) || (diet === 'non-veg' && !dishIsVeg);

      if (matchesSearch && matchesCat && matchesDiet) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const countBadge = document.getElementById('owner-menu-count-badge');
    if (countBadge) {
      countBadge.textContent = `${visibleCount} / ${(currentShop.menu || []).length} Dishes`;
    }

    const emptyState = document.getElementById('owner-menu-empty-state');
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? '' : 'none';
    }
  }

  const searchInput = document.getElementById('owner-menu-search-input');
  const catFilter = document.getElementById('owner-menu-cat-filter');
  const dietFilter = document.getElementById('owner-menu-diet-filter');
  const resetFiltersBtn = document.getElementById('btn-reset-menu-filters');

  if (searchInput) searchInput.addEventListener('input', applyMenuFilters);
  if (catFilter) catFilter.addEventListener('change', applyMenuFilters);
  if (dietFilter) dietFilter.addEventListener('change', applyMenuFilters);
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (catFilter) catFilter.value = 'all';
      if (dietFilter) dietFilter.value = 'all';
      applyMenuFilters();
    });
  }

  // Initial filter sync if returning with filter state
  applyMenuFilters();

  // 5. Toggle Menu Dish Stock Availability
  container.querySelectorAll('.btn-toggle-dish-stock').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.dataset.dishId;
      const updated = state.toggleMenuItemAvailability(currentShop.id, dishId);
      if (updated) {
        showToast(`${updated.name} marked as ${updated.isAvailable ? 'In Stock' : 'Sold Out'}!`, updated.isAvailable ? 'success' : 'info');
        renderApp();
      }
    });
  });

  // 5b. Quick Servings Stepper (-1, +1, +20)
  container.querySelectorAll('.btn-quick-servings').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dishId = btn.dataset.dishId;
      const shopId = btn.dataset.shopId;
      const delta = parseInt(btn.dataset.delta) || 0;
      const shop = state.getShopById(shopId);
      const dish = (shop?.menu || []).find(d => d.id === dishId);
      if (dish) {
        const currentCount = dish.servingsCount !== undefined ? dish.servingsCount : 25;
        const newCount = Math.max(0, currentCount + delta);
        state.updateDishServings(shopId, dishId, newCount);
        showToast(`Updated "${dish.name}" servings to ${newCount}!`, 'success');
        renderApp();
      }
    });
  });

  // 6. Edit Menu Dish Details
  container.querySelectorAll('.btn-edit-dish').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.dataset.dishId;
      const dish = (currentShop.menu || []).find(d => d.id === dishId);
      if (dish) {
        openEditDishModal(currentShop.id, dish);
      }
    });
  });

  // 7. Delete Menu Dish
  container.querySelectorAll('.btn-delete-dish').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.dataset.dishId;
      const dish = (currentShop.menu || []).find(d => d.id === dishId);
      const dishName = dish ? dish.name : 'this dish';
      if (confirm(`Are you sure you want to delete "${dishName}" from your stall menu?`)) {
        state.deleteMenuItem(currentShop.id, dishId);
        showToast(`"${dishName}" removed from menu!`, 'info');
        renderApp();
      }
    });
  });

  // 8. Add New Dish Modal Trigger
  const addDishBtn = document.getElementById('btn-open-add-dish-modal');
  if (addDishBtn) {
    addDishBtn.addEventListener('click', () => {
      openAddDishModal(currentShop.id);
    });
  }

  // Modal: Edit Dish Details
  function openEditDishModal(shopId, dish) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('generic-modal-title');
    const modalBody = document.getElementById('generic-modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<span>✏️</span> Edit Menu Dish: ${escapeHtml(dish.name)}`;
    modalBody.innerHTML = `
      <form id="form-edit-dish" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Dish Name</label>
          <input type="text" id="edit-dish-name" class="form-input" value="${escapeHtml(dish.name)}" required />
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Price (₹)</label>
            <input type="number" id="edit-dish-price" class="form-input" value="${dish.price}" min="1" step="1" required />
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Category</label>
            <input type="text" id="edit-dish-cat" class="form-input" list="edit-categories-datalist" value="${escapeHtml(dish.category || '')}" required />
            <datalist id="edit-categories-datalist">
              ${menuCategories.filter(c => c !== 'all').map(c => `<option value="${escapeHtml(c)}"></option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Diet Type</label>
            <select id="edit-dish-veg" class="form-select">
              <option value="true" ${dish.isVeg ? 'selected' : ''}>🌱 Vegetarian</option>
              <option value="false" ${!dish.isVeg ? 'selected' : ''}>🍗 Non-Vegetarian</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Estimated Prep Time</label>
            <input type="text" id="edit-dish-prep" class="form-input" value=        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Badge / Highlight Tag</label>
            <input type="text" id="edit-dish-badge" class="form-input" value="${escapeHtml(dish.badge || '')}" placeholder="e.g. Bestseller, Spicy, Popular, Crispy" />
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Available Servings (Qty)</label>
            <input type="number" id="edit-dish-servings" class="form-input" min="0" value="${dish.servingsCount !== undefined ? dish.servingsCount : 25}" required />
          </div>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Availability Status</label>
          <select id="edit-dish-available" class="form-select">
            <option value="true" ${dish.isAvailable ? 'selected' : ''}>● In Stock (Available)</option>
            <option value="false" ${!dish.isAvailable ? 'selected' : ''}>○ Sold Out (Unavailable)</option>
          </select>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Dish Image Path or URL</label>
          <input type="text" id="edit-dish-image" class="form-input" value="${escapeHtml(dish.image || '')}" placeholder="e.g. assets/menu/f-1.jpg or image URL" />
          
          <div style="display: flex; align-items: center; gap: 14px; margin-top: 8px; padding: 10px 14px; background: rgba(0,0,0,0.25); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <img id="edit-dish-preview-img" 
                 src="${dish.image || 'assets/menu/f-1.jpg'}" 
                 onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" 
                 style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-glass); flex-shrink: 0;" />
            <div>
              <div style="font-size: 0.82rem; font-weight: 600; color: #FFF;">Photo Preview</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Instant preview updates as you modify image path or URL</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            <span>💾</span> Save Menu Changes
          </button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-edit-dish">
            Cancel
          </button>
        </div>
      </form>
    `;

    const imageInput = document.getElementById('edit-dish-image');
    const previewImg = document.getElementById('edit-dish-preview-img');
    if (imageInput && previewImg) {
      imageInput.addEventListener('input', () => {
        previewImg.src = imageInput.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
      });
    }

    const cancelBtn = document.getElementById('btn-cancel-edit-dish');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    const form = document.getElementById('form-edit-dish');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-dish-name').value.trim();
        const price = parseFloat(document.getElementById('edit-dish-price').value);
        const category = document.getElementById('edit-dish-cat').value.trim();
        const isVeg = document.getElementById('edit-dish-veg').value === 'true';
        const prepTime = document.getElementById('edit-dish-prep').value.trim();
        const badge = document.getElementById('edit-dish-badge').value.trim();
        const servingsCount = Math.max(0, parseInt(document.getElementById('edit-dish-servings').value) || 0);
        const isAvailable = (document.getElementById('edit-dish-available').value === 'true') && (servingsCount > 0);
        const image = document.getElementById('edit-dish-image').value.trim();

        state.updateMenuItem(shopId, dish.id, {
          name,
          price,
          category,
          isVeg,
          prepTime,
          badge,
          servingsCount,
          isAvailable,
          image: image || dish.image || (isVeg ? 'assets/menu/f-1.jpg' : 'assets/menu/f-43.jpg')
        });

        modal.classList.remove('open');
        showToast(`"${name}" menu details (${servingsCount} servings) updated!`, 'success');
        renderApp();
      });
    }

    modal.classList.add('open');
  }

  // Modal: Add New Dish
  function openAddDishModal(shopId) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('generic-modal-title');
    const modalBody = document.getElementById('generic-modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<span>🍲</span> Add New Dish to ${escapeHtml(currentShop.name)}`;
    modalBody.innerHTML = `
      <form id="form-add-dish" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Dish Name</label>
          <input type="text" id="dish-name" class="form-input" placeholder="e.g. Schezwan Paneer Wrap" required />
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Price (₹)</label>
            <input type="number" id="dish-price" class="form-input" placeholder="e.g. 95" required min="1" step="1" />
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Category</label>
            <input type="text" id="dish-cat" class="form-input" list="add-categories-datalist" placeholder="e.g. Parotta & Roti, Fried Rice" required />
            <datalist id="add-categories-datalist">
              ${menuCategories.filter(c => c !== 'all').map(c => `<option value="${escapeHtml(c)}"></option>`).join('')}
            </datalist>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Diet Type</label>
            <select id="dish-veg" class="form-select">
              <option value="true">🌱 Vegetarian</option>
              <option value="false">🍗 Non-Vegetarian</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Preparation Time</label>
            <input type="text" id="dish-prep" class="form-input" placeholder="e.g. 8m, 10m" value="10m" />
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Badge / Tag (Optional)</label>
            <input type="text" id="dish-badge" class="form-input" placeholder="e.g. Chef Special, Crispy, Popular" />
          </div>
          <div class="form-group">
            <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Available Servings (Qty)</label>
            <input type="number" id="dish-servings" class="form-input" min="0" value="30" required />
          </div>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Initial Stock</label>
          <select id="dish-available" class="form-select">
            <option value="true" selected>● In Stock</option>
            <option value="false">○ Sold Out</option>
          </select>
        </div>

        <div class="form-group">
          <label style="font-weight: 600; font-size: 0.88rem; color: var(--text-secondary);">Dish Image Path or URL</label>
          <input type="text" id="dish-image" class="form-input" placeholder="e.g. assets/menu/f-1.jpg or https://..." />
          
          <div style="display: flex; align-items: center; gap: 14px; margin-top: 8px; padding: 10px 14px; background: rgba(0,0,0,0.25); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <img id="add-dish-preview-img" 
                 src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100" 
                 onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" 
                 style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-glass); flex-shrink: 0;" />
            <div>
              <div style="font-size: 0.82rem; font-weight: 600; color: #FFF;">Photo Preview</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Default campus photo provided if left blank</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            <span>✅</span> Add Dish to Stall Menu
          </button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-add-dish">
            Cancel
          </button>
        </div>
      </form>
    `;

    const imgInput = document.getElementById('dish-image');
    const previewImg = document.getElementById('add-dish-preview-img');
    if (imgInput && previewImg) {
      imgInput.addEventListener('input', () => {
        previewImg.src = imgInput.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
      });
    }

    const cancelBtn = document.getElementById('btn-cancel-add-dish');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    const form = document.getElementById('form-add-dish');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('dish-name').value.trim();
        const price = parseFloat(document.getElementById('dish-price').value);
        const category = document.getElementById('dish-cat').value.trim();
        const isVeg = document.getElementById('dish-veg').value === 'true';
        const prepTime = document.getElementById('dish-prep').value.trim();
        const badge = document.getElementById('dish-badge').value.trim();
        const servingsCount = Math.max(0, parseInt(document.getElementById('dish-servings').value) || 0);
        const isAvailable = (document.getElementById('dish-available').value === 'true') && (servingsCount > 0);
        const customImage = document.getElementById('dish-image').value.trim();

        const image = customImage || (isVeg 
          ? 'assets/menu/f-1.jpg' 
          : 'assets/menu/f-43.jpg');

        state.addMenuItemToShop(shopId, {
          name,
          price,
          category,
          isVeg,
          prepTime: prepTime || '10m',
          badge: badge || 'New',
          servingsCount,
          isAvailable,
          image
        });

        modal.classList.remove('open');
        showToast(`"${name}" (${servingsCount} servings) added to menu!`, 'success');
        renderApp();
      });
    }

    modal.classList.add('open');
  }
}

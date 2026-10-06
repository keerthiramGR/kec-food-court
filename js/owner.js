import { state } from './state.js';

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
      <div class="admin-section-header">
        <div>
          <h2 style="font-size: 1.4rem;">Stall Menu & Availability Control</h2>
          <p style="font-size: 0.88rem; color: var(--text-secondary);">Instantly toggle dishes in-stock or add new campus specials</p>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-open-add-dish-modal">
          <span>+</span> Add New Dish to Menu
        </button>
      </div>

      <div class="stalls-table-wrap">
        <table class="stalls-table">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Category</th>
              <th>Diet</th>
              <th>Price</th>
              <th>Est. Time</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${(currentShop.menu || []).map(dish => {
              return `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;"/>
                      <span style="font-weight: 700; color: #FFF;">${dish.name}</span>
                    </div>
                  </td>
                  <td><span class="badge badge-gold" style="font-size: 0.72rem;">${dish.category || 'Special'}</span></td>
                  <td>
                    <span class="diet-indicator ${dish.isVeg ? 'veg' : 'non-veg'}"></span>
                    <span style="font-size: 0.82rem; margin-left: 6px;">${dish.isVeg ? 'Veg' : 'Non-Veg'}</span>
                  </td>
                  <td style="font-weight: 800; color: var(--primary-gold); font-family: var(--font-brand);">₹${dish.price}</td>
                  <td style="color: var(--text-secondary);">${dish.prepTime || '10m'}</td>
                  <td>
                    <span class="badge ${dish.isAvailable ? 'badge-emerald' : 'badge-rose'}">
                      ${dish.isAvailable ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td>
                    <button class="btn ${dish.isAvailable ? 'btn-secondary' : 'btn-emerald'} btn-sm btn-toggle-dish-stock" data-dish-id="${dish.id}">
                      ${dish.isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
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

  // 4. Toggle Menu Dish Stock Availability
  container.querySelectorAll('.btn-toggle-dish-stock').forEach(btn => {
    btn.addEventListener('click', () => {
      const dishId = btn.dataset.dishId;
      state.toggleMenuItemAvailability(currentShop.id, dishId);
      showToast('Dish availability status updated!', 'info');
      renderApp();
    });
  });

  // 5. Add New Dish Modal
  const addDishBtn = document.getElementById('btn-open-add-dish-modal');
  if (addDishBtn) {
    addDishBtn.addEventListener('click', () => {
      openAddDishModal(currentShop.id);
    });
  }

  function openAddDishModal(shopId) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('generic-modal-title');
    const modalBody = document.getElementById('generic-modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerHTML = `<span>🍲</span> Add New Dish to ${currentShop.name}`;
    modalBody.innerHTML = `
      <form id="form-add-dish" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label>Dish Name</label>
          <input type="text" id="dish-name" class="form-input" placeholder="e.g. Schezwan Paneer Wrap" required />
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Price (₹)</label>
            <input type="number" id="dish-price" class="form-input" placeholder="e.g. 95" required min="10" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="dish-cat" class="form-input" placeholder="e.g. Starters, Rolls" required />
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label>Diet Type</label>
            <select id="dish-veg" class="form-select">
              <option value="true">🌱 Vegetarian</option>
              <option value="false">🍗 Non-Vegetarian</option>
            </select>
          </div>
          <div class="form-group">
            <label>Preparation Time</label>
            <input type="text" id="dish-prep" class="form-input" placeholder="e.g. 8 mins" value="10m" />
          </div>
        </div>

        <div class="form-group">
          <label>Badge / Tag (Optional)</label>
          <input type="text" id="dish-badge" class="form-input" placeholder="e.g. Chef Special, Crispy, Popular" />
        </div>

        <button type="submit" class="btn btn-primary" style="margin-top: 8px;">
          <span>✅</span> Add Dish to Stall Menu
        </button>
      </form>
    `;

    const form = document.getElementById('form-add-dish');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('dish-name').value.trim();
        const price = parseInt(document.getElementById('dish-price').value);
        const category = document.getElementById('dish-cat').value.trim();
        const isVeg = document.getElementById('dish-veg').value === 'true';
        const prepTime = document.getElementById('dish-prep').value.trim();
        const badge = document.getElementById('dish-badge').value.trim();

        state.addMenuItemToShop(shopId, {
          name,
          price,
          category,
          isVeg,
          prepTime,
          badge: badge || 'New',
          image: isVeg 
            ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
            : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300'
        });

        modal.classList.remove('open');
        showToast(`"${name}" added to menu successfully!`, 'success');
        renderApp();
      });
    }

    modal.classList.add('open');
  }
}

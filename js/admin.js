import { state } from './state.js';

export function renderAdminPortal(container, showToast, renderApp) {
  const currentUser = state.getCurrentUser();
  const shops = state.getShops();
  const allOrders = state.getOrders();

  const totalFoodCourtRevenue = allOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeKitchensCount = shops.filter(s => s.isOpen).length;
  const totalMenuItemsCount = shops.reduce((sum, s) => sum + (s.menu ? s.menu.length : 0), 0);

  container.innerHTML = `
    <!-- Super Admin Hero with Warm Orange Shade -->
    <div class="portal-hero portal-hero-orange">
      <div class="portal-hero-content">
        <div class="portal-hero-tag">
          <span>👑</span> Master Food Court Administration • Kongu Engineering College
        </div>
        <h1 class="portal-hero-title">
          Campus Food Court<br/>
          <span class="gradient-text">Command & Portal Provisioning</span>
        </h1>
        <p class="portal-hero-desc">
          Add new vendor stalls, dynamically generate their dedicated management portals with unique credentials, configure campus dining policies, and oversee live order flow.
        </p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('add-shop-section').scrollIntoView({behavior: 'smooth'})">
            <span>➕</span> Add New Shop & Create Portal
          </button>
          <button class="btn btn-secondary btn-lg" onclick="document.getElementById('manage-stalls-section').scrollIntoView({behavior: 'smooth'})">
            <span>📋</span> View Registered Stalls (${shops.length})
          </button>
          ${(!currentUser || currentUser.role !== 'super_admin') ? `
            <button class="btn btn-outline-gold btn-lg" onclick="window.openLoginModal('super_admin')">
              <span>🔑</span> Super Admin Sign In
            </button>
          ` : `
            <button class="btn btn-secondary btn-lg" onclick="window.handleLogout()">
              <span>🚪</span> Admin Logout
            </button>
          `}
        </div>
      </div>
    </div>

    <!-- Master Metrics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="color: #FF9F1C;">🏪</div>
        <div>
          <div class="stat-value">${shops.length} Outlets</div>
          <div class="stat-label">Total Registered Shops</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #10B981;">⚡</div>
        <div>
          <div class="stat-value">${activeKitchensCount} Active</div>
          <div class="stat-label">Live Open Kitchens</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #06B6D4;">🎟️</div>
        <div>
          <div class="stat-value">${allOrders.length}</div>
          <div class="stat-label">Campus Tokens Processed</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color: #EC4899;">💵</div>
        <div>
          <div class="stat-value">₹${totalFoodCourtRevenue.toLocaleString()}</div>
          <div class="stat-label">Campus Total Revenue</div>
        </div>
      </div>
    </div>

    <!-- Section 1: Add New Shop & Portal Provisioning Wizard -->
    <div id="add-shop-section" class="admin-card-section">
      <div class="admin-section-header">
        <div>
          <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
            <span>✨</span> Provision New Shop & Generate Stall Portal
          </h2>
          <p style="font-size: 0.88rem; color: var(--text-secondary);">
            Enter stall details. The system will instantly register the shop and configure a dedicated shop owner portal with live login access.
          </p>
        </div>
        <span class="badge badge-gold">Instant Provisioning</span>
      </div>

      <form id="form-create-new-shop">
        <div class="form-grid-2" style="margin-bottom: 20px;">
          <div class="form-group">
            <label>Shop / Stall Name *</label>
            <input type="text" id="new-shop-name" class="form-input" placeholder="e.g. Malabar Coastal Flavours" required />
          </div>

          <div class="form-group">
            <label>Stall Number *</label>
            <input type="text" id="new-shop-stall" class="form-input" placeholder="e.g. Stall #06" value="Stall #0${shops.length + 1}" required />
          </div>
        </div>

        <div class="form-grid-2" style="margin-bottom: 20px;">
          <div class="form-group">
            <label>Food Category *</label>
            <select id="new-shop-category" class="form-select">
              <option value="Meals & Biryani">🍛 Meals & Biryani</option>
              <option value="Cafe & Bakes">☕ Cafe & Bakes</option>
              <option value="South Indian Tiffin">🥞 South Indian Tiffin</option>
              <option value="Juices & Shakes">🥤 Juices & Shakes</option>
              <option value="Chinese & Asian">🍜 Chinese & Asian</option>
              <option value="Pizzas & Burgers">🍔 Pizzas & Burgers</option>
              <option value="Desserts & Sweets">🍰 Desserts & Sweets</option>
              <option value="Snacks & Chaat">🌮 Snacks & Chaat</option>
            </select>
          </div>

          <div class="form-group">
            <label>Stall Theme Emoji / Icon</label>
            <select id="new-shop-icon" class="form-select">
              <option value="🍱">🍱 Bento / Meals</option>
              <option value="🥘">🥘 Pan / Curry</option>
              <option value="🍕">🍕 Pizza Corner</option>
              <option value="🍔">🍔 Burger Station</option>
              <option value="🥞">🥞 Tiffin Pan</option>
              <option value="☕">☕ Cafe Bean</option>
              <option value="🥤">🥤 Fresh Juices</option>
              <option value="🍜">🍜 Asian Bowls</option>
              <option value="🍧">🍧 Ice Desserts</option>
            </select>
          </div>
        </div>

        <div class="form-grid-2" style="margin-bottom: 20px;">
          <div class="form-group">
            <label>Stall Owner Full Name *</label>
            <input type="text" id="new-shop-owner" class="form-input" placeholder="e.g. Senthil Nathan" required />
          </div>

          <div class="form-group">
            <label>Portal Login Email *</label>
            <input type="email" id="new-shop-email" class="form-input" placeholder="e.g. coastal@kecfood.in" required />
          </div>
        </div>

        <div class="form-grid-2" style="margin-bottom: 20px;">
          <div class="form-group">
            <label>Portal Login Password *</label>
            <input type="text" id="new-shop-password" class="form-input" placeholder="e.g. stall123" value="owner123" required />
          </div>

          <div class="form-group">
            <label>Stall Tagline / Speciality</label>
            <input type="text" id="new-shop-tagline" class="form-input" placeholder="e.g. Authentic Malabar Dum Biryani & Parottas" />
          </div>
        </div>

        <div class="form-grid-2" style="margin-bottom: 24px;">
          <div class="form-group">
            <label>Initial Signature Dish Name</label>
            <input type="text" id="new-shop-first-dish" class="form-input" placeholder="e.g. Malabar Fish Biryani / Paneer Roast" value="Chef Signature Special Meal" />
          </div>

          <div class="form-group">
            <label>Initial Dish Price (₹)</label>
            <input type="number" id="new-shop-first-price" class="form-input" placeholder="120" value="120" min="10" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
          <span>🚀</span> Provision Stall & Generate Portal Access
        </button>
      </form>

      <!-- Credentials Output Container (Dynamically populated after creation) -->
      <div id="credential-receipt-container"></div>
    </div>

    <!-- Section 2: Manage All Food Court Stalls Directory -->
    <div id="manage-stalls-section" class="admin-card-section">
      <div class="admin-section-header">
        <div>
          <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
            <span>🏬</span> Campus Food Court Stalls Directory
          </h2>
          <p style="font-size: 0.88rem; color: var(--text-secondary);">
            Master list of all outlets with stall numbers, operational status, and direct portal testing
          </p>
        </div>
        <span class="badge badge-emerald">${shops.length} Configured</span>
      </div>

      <div class="stalls-table-wrap">
        <table class="stalls-table">
          <thead>
            <tr>
              <th>Stall</th>
              <th>Shop Name</th>
              <th>Category</th>
              <th>Owner & Login Email</th>
              <th>Menu Items</th>
              <th>Status</th>
              <th>Portal Actions</th>
            </tr>
          </thead>
          <tbody>
            ${shops.map(shop => {
              const menuCount = shop.menu ? shop.menu.length : 0;
              return `
                <tr>
                  <td><span class="badge badge-gold">${shop.stallNumber}</span></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.2rem;">${shop.icon || '🏪'}</span>
                      <strong style="color: #FFF;">${shop.name}</strong>
                    </div>
                  </td>
                  <td style="color: var(--text-secondary);">${shop.category}</td>
                  <td>
                    <div>${shop.ownerName}</div>
                    <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--primary-gold);">${shop.email}</div>
                  </td>
                  <td><span class="badge badge-blue">${menuCount} dishes</span></td>
                  <td>
                    <span class="badge ${shop.isOpen ? 'badge-emerald' : 'badge-rose'}">
                      ${shop.isOpen ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-outline-gold btn-sm btn-admin-test-portal" data-shop-id="${shop.id}" title="Test login to this stall portal">
                        <span>🔑</span> Open Portal
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Handle Form Submission for Adding New Shop
  const createForm = document.getElementById('form-create-new-shop');
  if (createForm) {
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('new-shop-name').value.trim();
      const stallNumber = document.getElementById('new-shop-stall').value.trim();
      const category = document.getElementById('new-shop-category').value;
      const icon = document.getElementById('new-shop-icon').value;
      const ownerName = document.getElementById('new-shop-owner').value.trim();
      const email = document.getElementById('new-shop-email').value.trim();
      const password = document.getElementById('new-shop-password').value.trim();
      const tagline = document.getElementById('new-shop-tagline').value.trim() || `${category} Specialist`;
      const firstDishName = document.getElementById('new-shop-first-dish').value.trim();
      const firstDishPrice = parseInt(document.getElementById('new-shop-first-price').value) || 99;

      const newShop = state.addShop({
        name,
        stallNumber,
        category,
        icon,
        ownerName,
        email,
        password,
        tagline,
        accentColor: "#FF9F1C",
        menu: [
          {
            id: `m-${Date.now()}-1`,
            name: firstDishName,
            price: firstDishPrice,
            category: "Special",
            isVeg: true,
            isAvailable: true,
            badge: "Inaugural Special",
            prepTime: "10m",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300"
          }
        ]
      });

      showToast(`Stall "${name}" provisioned and created successfully!`, 'success');

      // Display Credential Receipt Card
      const receiptContainer = document.getElementById('credential-receipt-container');
      if (receiptContainer) {
        receiptContainer.innerHTML = `
          <div class="credentials-receipt">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="font-weight: 800; color: var(--primary-gold); font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                <span>🎉</span> PORTAL CREATED: ${newShop.name} (${newShop.stallNumber})
              </div>
              <span class="badge badge-emerald">Ready for Use</span>
            </div>

            <p style="font-size: 0.88rem; color: var(--text-secondary);">
              The dedicated stall management portal has been generated. Provide the credentials below to <strong>${newShop.ownerName}</strong> or test it directly.
            </p>

            <div class="cred-row">
              <span style="color: var(--text-secondary);">Stall Portal ID:</span>
              <span style="color: #FFF;">${newShop.id}</span>
            </div>
            <div class="cred-row">
              <span style="color: var(--text-secondary);">Login Email:</span>
              <span style="color: var(--primary-gold);">${newShop.email}</span>
            </div>
            <div class="cred-row">
              <span style="color: var(--text-secondary);">Access Password:</span>
              <span style="color: #FFF;">${newShop.password}</span>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btn-login-new-shop-now">
                <span>🚀</span> Log In as ${newShop.name} Now
              </button>
              <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('Stall: ${newShop.name}\\nEmail: ${newShop.email}\\nPassword: ${newShop.password}'); alert('Credentials copied to clipboard!');">
                <span>📋</span> Copy Credentials
              </button>
            </div>
          </div>
        `;

        // Direct login to newly created shop
        const loginNowBtn = document.getElementById('btn-login-new-shop-now');
        if (loginNowBtn) {
          loginNowBtn.addEventListener('click', () => {
            state.login({
              role: 'shop_owner',
              shopId: newShop.id,
              stallName: newShop.name,
              stallNumber: newShop.stallNumber,
              ownerName: newShop.ownerName,
              email: newShop.email,
              icon: newShop.icon || '🏪',
              loginTime: Date.now()
            });
            showToast(`Switched directly to ${newShop.name} Shop Owner Portal!`, 'success');
            // Switch view to owner portal
            window.switchAppPortal('owner');
          });
        }
      }

      // Refresh overall view
      setTimeout(() => {
        renderApp();
      }, 3500);
    });
  }

  // Handle "Open Portal" buttons in directory
  container.querySelectorAll('.btn-admin-test-portal').forEach(btn => {
    btn.addEventListener('click', () => {
      const shopId = btn.dataset.shopId;
      const targetShop = shops.find(s => s.id === shopId);
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
        showToast(`Logged into ${targetShop.name} portal!`, 'success');
        window.switchAppPortal('owner');
      }
    });
  });
}

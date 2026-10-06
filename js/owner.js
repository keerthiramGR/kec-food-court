import { state } from './state.js';

let ownerMenuSearchQuery = '';
let ownerMenuCategoryFilter = 'all';
let ownerMenuDietFilter = 'all';

let showBusinessAnalytics = false;
let purchaseSearchQuery = '';
let purchaseStatusFilter = 'all';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// 1. Audio Bell Chime Synthesizer (Zero External Dependencies)
// ---------------------------------------------------------------------------
export function playOrderAlertSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [659.25, 880, 1174.66, 1318.51]; // E5, A5, D6, E6 harmonic chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.35, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
    });
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// ---------------------------------------------------------------------------
// 2. Incoming Order Pop-up Notification Modal
// ---------------------------------------------------------------------------
export function showIncomingOrderPopup(order, showToast, renderApp) {
  playOrderAlertSound();

  let modal = document.getElementById('owner-order-alert-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'owner-order-alert-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const itemsListHtml = (order.items || []).map(i => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
      <span><strong style="color: var(--primary-gold);">${i.qty}x</strong> ${escapeHtml(i.name)}</span>
      <span style="font-weight: 700; color: #FFF;">₹${(i.price || 0) * (i.qty || 1)}</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-box order-alert-box" style="max-width: 480px; text-align: center; border-radius: var(--radius-lg); padding: 26px;">
      <div style="font-size: 3.2rem; margin-bottom: 2px; display: inline-block; animation: ringBell 0.9s ease infinite alternate;">🔔</div>
      <div style="margin-bottom: 8px;">
        <span class="badge badge-gold" style="font-size: 0.8rem; padding: 4px 14px; letter-spacing: 1px; font-weight: 800;">
          NEW ORDER INCOMING!
        </span>
      </div>

      <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary-gold); font-family: var(--font-mono); line-height: 1.1; margin-bottom: 4px;">
        ${order.tokenNumber}
      </div>
      <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px;">
        Order #${order.id} • <span class="badge badge-emerald" style="font-size: 0.72rem;">${order.diningType || 'Dine-In'}</span>
      </div>

      <div style="background: rgba(0,0,0,0.35); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 20px; border: 1px solid var(--border-glass); text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.86rem;">
          <span style="color: var(--text-secondary);">Student:</span>
          <strong style="color: #FFF;">${escapeHtml(order.studentName || 'Student')} (${escapeHtml(order.studentRoll || 'Campus')})</strong>
        </div>

        <div style="font-size: 0.76rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
          Ordered Food Dishes:
        </div>
        <div style="margin-bottom: 12px;">
          ${itemsListHtml}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-glass); font-size: 1.15rem; font-weight: 800;">
          <span style="color: #FFF;">Total Amount:</span>
          <span style="color: var(--primary-gold);">₹${order.totalAmount}</span>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary btn-lg" id="btn-popup-start-cooking" style="flex: 1; font-weight: 800;">
          🔥 Accept & Start Cooking
        </button>
        <button class="btn btn-secondary btn-lg" id="btn-popup-dismiss" style="min-width: 100px;">
          Dismiss
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const startBtn = modal.querySelector('#btn-popup-start-cooking');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      state.updateOrderStatus(order.id, 'Kitchen Preparing');
      modal.classList.remove('open');
      if (showToast) showToast(`Token ${order.tokenNumber} moved to Kitchen Preparing!`, 'success');
      if (renderApp) renderApp();
    });
  }

  const dismissBtn = modal.querySelector('#btn-popup-dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }
}

// ---------------------------------------------------------------------------
// 3. SVG Sales Graph Generator (Hourly Curve)
// ---------------------------------------------------------------------------
function generateSalesChartSvg(hourlyData) {
  const width = 560;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxVal = Math.max(...hourlyData.map(d => d.revenue), 100);
  const points = hourlyData.map((d, i) => {
    const x = paddingX + (i * ((width - 2 * paddingX) / (hourlyData.length - 1)));
    const y = (height - paddingY) - ((d.revenue / maxVal) * (height - 2 * paddingY));
    return { x, y, ...d };
  });

  // Construct smooth curve path
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    pathD += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF9F1C" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#FF9F1C" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
      <line x1="${paddingX}" y1="${height / 2}" x2="${width - paddingX}" y2="${height / 2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
      <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.15)" />

      <!-- Area fill -->
      <path d="${areaD}" fill="url(#salesGrad)" />

      <!-- Curve Line -->
      <path d="${pathD}" fill="none" stroke="#FF9F1C" stroke-width="3" stroke-linecap="round" />

      <!-- Data Dots & Value Labels -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#FFFFFF" stroke="#FF9F1C" stroke-width="2.5" />
        ${p.revenue > 0 ? `
          <text x="${p.x}" y="${p.y - 10}" fill="#FF9F1C" font-size="10" font-weight="800" text-anchor="middle" font-family="sans-serif">₹${p.revenue}</text>
        ` : ''}
        <text x="${p.x}" y="${height - 6}" fill="rgba(255,255,255,0.6)" font-size="10" text-anchor="middle" font-family="sans-serif">${p.time}</text>
      `).join('')}
    </svg>
  `;
}

// ---------------------------------------------------------------------------
// 4. Export Orders to Excel / CSV
// ---------------------------------------------------------------------------
export function exportOrdersToExcel(currentShop, shopOrders) {
  const headers = [
    "Date", "Time", "Order ID", "Token Number", "Customer Name", "Roll Number", "Phone Number",
    "Ordered Food Dishes", "Total Quantity", "Dining Type", "Amount (INR)", "Payment Method", "Status"
  ];

  const rows = shopOrders.map(order => {
    const d = order.createdTime ? new Date(order.createdTime) : new Date();
    const dateStr = d.toLocaleDateString('en-IN');
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const itemsStr = (order.items || []).map(i => `${i.qty}x ${i.name}`).join('; ');
    const totalQty = (order.items || []).reduce((sum, i) => sum + (i.qty || 1), 0);

    return [
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${order.id}"`,
      `"${order.tokenNumber}"`,
      `"${(order.studentName || 'Student').replace(/"/g, '""')}"`,
      `"${(order.studentRoll || 'Campus').replace(/"/g, '""')}"`,
      `"${(order.studentPhone || '').replace(/"/g, '""')}"`,
      `"${itemsStr.replace(/"/g, '""')}"`,
      totalQty,
      `"${order.diningType || 'Dine-In'}"`,
      order.totalAmount || 0,
      `"${order.paymentMethod || 'Paid Online'}"`,
      `"${order.status || 'Completed'}"`
    ].join(',');
  });

  const totalSum = shopOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalItemsCount = shopOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.qty || 1), 0), 0);

  const footer = `\n"TOTAL","","","","","","",,"${totalItemsCount}","",${totalSum},"",""`;
  const csvContent = headers.join(',') + '\n' + rows.join('\n') + footer;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `KEC_FoodCourt_${currentShop.name.replace(/\s+/g, '_')}_Daily_Sales_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------------------------------------------------------------------
// 5. Printable Daily Sales & Settlement PDF Report
// ---------------------------------------------------------------------------
export function openPrintableDailyReport(currentShop, shopOrders) {
  let modal = document.getElementById('printable-daily-report-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'printable-daily-report-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const d = new Date();
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const totalRevenue = shopOrders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalQty = shopOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.qty || 1), 0), 0);

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 850px; max-height: 90vh; overflow-y: auto; background: #FFF; color: #111;">
      <div id="printable-daily-report" style="padding: 24px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #EA580C; padding-bottom: 14px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 1.3rem; font-weight: 900; color: #1E293B;">KONGU ENGINEERING COLLEGE</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: #EA580C;">CAMPUS FOOD COURT • DAILY BUSINESS SETTLEMENT</div>
            <div style="font-size: 0.82rem; color: #64748B;">Perundurai, Erode - 638 060, Tamil Nadu</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 1.1rem; color: #0F172A;">${escapeHtml(currentShop.name)} (${currentShop.stallNumber})</div>
            <div style="font-size: 0.85rem; color: #475569;">Manager: <strong>${escapeHtml(currentShop.ownerName)}</strong></div>
            <div style="font-size: 0.85rem; color: #64748B;">Report Date: <strong>${dateStr}</strong></div>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #FFF7ED; border: 1px solid #FDBA74; padding: 12px; border-radius: 8px;">
            <div style="font-size: 0.76rem; color: #C2410C; font-weight: 700;">TOTAL REVENUE</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #9A3412;">₹${totalRevenue}</div>
          </div>
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 12px; border-radius: 8px;">
            <div style="font-size: 0.76rem; color: #15803D; font-weight: 700;">TOTAL ORDERS</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #166534;">${shopOrders.length}</div>
          </div>
          <div style="background: #EFF6FF; border: 1px solid #93C5FD; padding: 12px; border-radius: 8px;">
            <div style="font-size: 0.76rem; color: #1D4ED8; font-weight: 700;">TOTAL DISHES SOLD</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #1E40AF;">${totalQty} items</div>
          </div>
          <div style="background: #FAF5FF; border: 1px solid #D8B4FE; padding: 12px; border-radius: 8px;">
            <div style="font-size: 0.76rem; color: #7E22CE; font-weight: 700;">AVG BASKET SIZE</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: #6B21A8;">₹${shopOrders.length > 0 ? Math.round(totalRevenue / shopOrders.length) : 0}</div>
          </div>
        </div>

        <!-- Transactions Table -->
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #1E293B; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
          Itemized Purchase & Settlement Register
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 24px;">
          <thead>
            <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
              <th style="padding: 8px; text-align: left;">Time</th>
              <th style="padding: 8px; text-align: left;">Token</th>
              <th style="padding: 8px; text-align: left;">Customer</th>
              <th style="padding: 8px; text-align: left;">Food Dishes Ordered</th>
              <th style="padding: 8px; text-align: center;">Dining</th>
              <th style="padding: 8px; text-align: right;">Amount</th>
              <th style="padding: 8px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${shopOrders.map(o => {
              const dTime = o.createdTime ? new Date(o.createdTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Today';
              return `
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 8px; color: #64748B;">${dTime}</td>
                  <td style="padding: 8px; font-weight: 800; color: #EA580C;">${o.tokenNumber}</td>
                  <td style="padding: 8px;">${escapeHtml(o.studentName || 'Student')} <span style="color: #64748B; font-size: 0.78rem;">(${escapeHtml(o.studentRoll || 'Campus')})</span></td>
                  <td style="padding: 8px; font-weight: 600;">${(o.items || []).map(i => `${i.qty}x ${escapeHtml(i.name)}`).join(', ')}</td>
                  <td style="padding: 8px; text-align: center;">${o.diningType || 'Dine-In'}</td>
                  <td style="padding: 8px; text-align: right; font-weight: 800;">₹${o.totalAmount}</td>
                  <td style="padding: 8px; text-align: center;">${o.status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Signatures block -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #CBD5E1;">
          <div style="text-align: center;">
            <div style="height: 36px;"></div>
            <div style="border-top: 1px solid #94A3B8; width: 180px; padding-top: 4px; font-size: 0.8rem; font-weight: 700; color: #475569;">Stall Manager Signature</div>
          </div>
          <div style="text-align: center;">
            <div style="height: 36px; display: flex; align-items: center; justify-content: center; color: #16A34A; font-weight: 800; font-size: 0.82rem;">VERIFIED CAMPUS DINING</div>
            <div style="border-top: 1px solid #94A3B8; width: 180px; padding-top: 4px; font-size: 0.8rem; font-weight: 700; color: #475569;">Campus Food Court Authority</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="no-print" style="display: flex; gap: 12px; padding: 16px; border-top: 1px solid #E2E8F0; background: #F8FAFC; justify-content: flex-end;">
        <button class="btn btn-primary" id="btn-trigger-print">🖨️ Print / Save as PDF</button>
        <button class="btn btn-secondary" id="btn-close-print-modal">Close</button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  modal.querySelector('#btn-trigger-print')?.addEventListener('click', () => {
    window.print();
  });
  modal.querySelector('#btn-close-print-modal')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });
}

// ---------------------------------------------------------------------------
// 6. Master Owner Portal View
// ---------------------------------------------------------------------------
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

  // Bind active shop ID globally for live alert listener
  window._activeOwnerShopId = currentShop.id;
  window._ownerShowToast = showToast;
  window._ownerRenderApp = renderApp;

  // Subscribe to live incoming orders (once)
  if (!window._ownerOrderAlertSubscribed) {
    window._ownerOrderAlertSubscribed = true;
    state.subscribe((event, data) => {
      if (event === 'ORDER_CREATED') {
        if (data && data.shopId === window._activeOwnerShopId) {
          showIncomingOrderPopup(data, window._ownerShowToast, window._ownerRenderApp);
          if (window._ownerRenderApp) window._ownerRenderApp();
        }
      }
    });
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

  // Prepare Hourly Revenue Timeline Data for Graph
  const hourlySlots = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];
  const hourlyMap = {
    '8 AM': { revenue: 0, count: 0 },
    '10 AM': { revenue: 0, count: 0 },
    '12 PM': { revenue: 0, count: 0 },
    '2 PM': { revenue: 0, count: 0 },
    '4 PM': { revenue: 0, count: 0 },
    '6 PM': { revenue: 0, count: 0 },
    '8 PM': { revenue: 0, count: 0 },
    '10 PM': { revenue: 0, count: 0 }
  };

  shopOrders.forEach(o => {
    if (o.status !== 'Cancelled') {
      const d = o.createdTime ? new Date(o.createdTime) : new Date();
      const hr = d.getHours();
      let slot = '8 AM';
      if (hr >= 21) slot = '10 PM';
      else if (hr >= 19) slot = '8 PM';
      else if (hr >= 17) slot = '6 PM';
      else if (hr >= 15) slot = '4 PM';
      else if (hr >= 13) slot = '2 PM';
      else if (hr >= 11) slot = '12 PM';
      else if (hr >= 9) slot = '10 AM';
      else slot = '8 AM';

      hourlyMap[slot].revenue += (o.totalAmount || 0);
      hourlyMap[slot].count += 1;
    }
  });

  const hourlyChartData = hourlySlots.map(time => ({
    time,
    revenue: hourlyMap[time].revenue,
    count: hourlyMap[time].count
  }));

  const salesSvgHtml = generateSalesChartSvg(hourlyChartData);

  // Prepare Best-Selling Dishes for Progress Bars
  const dishSalesMap = {};
  shopOrders.forEach(o => {
    if (o.status !== 'Cancelled' && Array.isArray(o.items)) {
      o.items.forEach(i => {
        dishSalesMap[i.name] = (dishSalesMap[i.name] || 0) + (i.qty || 1);
      });
    }
  });

  const totalDishesSold = Object.values(dishSalesMap).reduce((s, c) => s + c, 0) || 1;
  const topDishes = Object.entries(dishSalesMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topDishesHtml = topDishes.length === 0 ? `
    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px 0; text-align: center;">
      No dish orders recorded today yet.
    </div>
  ` : topDishes.map(d => {
    const pct = Math.round((d.count / totalDishesSold) * 100);
    return `
      <div class="dish-progress-item">
        <div class="dish-progress-label">
          <span style="font-weight: 700; color: #FFF;">${escapeHtml(d.name)}</span>
          <span style="color: var(--primary-gold); font-weight: 800;">${d.count} sold (${pct}%)</span>
        </div>
        <div class="dish-progress-track">
          <div class="dish-progress-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  // If shop is closed, automatically show analytics dashboard
  const isStallClosed = !currentShop.isOpen;
  const isAnalyticsVisible = isStallClosed || showBusinessAnalytics;

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

      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <!-- Switch Stall Selector -->
        <select id="owner-shop-switcher" class="form-select" style="padding: 8px 14px; font-size: 0.85rem; background: rgba(255,255,255,0.06);">
          ${shops.map(s => `
            <option value="${s.id}" ${s.id === currentShop.id ? 'selected' : ''}>
              ${s.stallNumber} - ${s.name}
            </option>
          `).join('')}
        </select>

        <!-- Toggle Business Analytics Button -->
        <button class="btn btn-outline-gold btn-sm" id="btn-toggle-business-analytics" title="View Today's Business Graph & Reports">
          <span>📊</span> ${isAnalyticsVisible && !isStallClosed ? 'Hide Analytics' : "Business Graph & Reports"}
        </button>

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

    <!-- =========================================================================
         DAILY BUSINESS ANALYTICS & PURCHASE RECONCILIATION SECTION
         (Shown whenever shop is closed, or toggled on demand)
         ========================================================================= -->
    ${isAnalyticsVisible ? `
      <div class="business-analytics-panel" id="business-analytics-panel">
        ${isStallClosed ? `
          <!-- Closed Stall End-of-Day Banner -->
          <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-lg); padding: 18px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="font-size: 2.2rem;">🌙</div>
              <div>
                <div style="font-weight: 800; font-size: 1.15rem; color: #FFF;">Stall is Closed for Today • End-of-Day Business Summary</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                  All business metrics, sales graph, and detailed transaction logs of today are compiled below.
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-emerald btn-sm" id="btn-export-excel-banner">
                <span>📥</span> Download Excel (.csv)
              </button>
              <button class="btn btn-primary btn-sm" id="btn-export-pdf-banner">
                <span>🖨️</span> Download PDF
              </button>
            </div>
          </div>
        ` : ''}

        <div class="analytics-header">
          <div>
            <h2 style="font-size: 1.35rem; color: #FFF; display: flex; align-items: center; gap: 8px;">
              <span>📊</span> Today's Business Performance & Graph
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
              Visual hourly sales curve, top selling delicacies, and complete purchase audit table
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <button class="btn btn-emerald btn-sm" id="btn-export-excel">
              <span>📥</span> Download Excel (.csv)
            </button>
            <button class="btn btn-primary btn-sm" id="btn-export-pdf">
              <span>🖨️</span> Download PDF
            </button>
          </div>
        </div>

        <!-- 2-Column Visual Charts: Hourly Sales Curve + Top Dishes Progress -->
        <div class="analytics-grid-2">
          <!-- Left: Hourly Sales SVG Curve Graph -->
          <div class="analytics-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div>
                <span style="font-weight: 800; font-size: 0.95rem; color: #FFF;">📈 Hourly Sales & Revenue Curve</span>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">Revenue flow across operating hours</div>
              </div>
              <span class="badge badge-gold">₹${totalRevenue} Total</span>
            </div>
            <div class="chart-svg-container">
              ${salesSvgHtml}
            </div>
          </div>

          <!-- Right: Best Selling Dishes Progress Bars -->
          <div class="analytics-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span style="font-weight: 800; font-size: 0.95rem; color: #FFF;">🥇 Best-Selling Delicacies</span>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">By units sold today</div>
              </div>
              <span class="badge badge-emerald">${totalDishesSold} items</span>
            </div>
            <div>
              ${topDishesHtml}
            </div>
          </div>
        </div>

        <!-- Detailed Purchase Register Table -->
        <div style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 1.1rem; color: #FFF; display: flex; align-items: center; gap: 8px;">
                <span>📋</span> All Details of Purchase & Transactions (${shopOrders.length})
              </h3>
              <p style="font-size: 0.82rem; color: var(--text-secondary);">Itemized register of all tokens, students, ordered dishes, and billing</p>
            </div>

            <!-- Toolbar: Search & Status Filter -->
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <input type="text" id="purchase-table-search" class="form-input" 
                     placeholder="Search customer, token, dish..." 
                     value="${escapeHtml(purchaseSearchQuery)}"
                     style="padding: 6px 12px; font-size: 0.84rem; min-width: 200px;" />

              <select id="purchase-table-status" class="form-select" style="padding: 6px 10px; font-size: 0.84rem;">
                <option value="all" ${purchaseStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                <option value="Completed" ${purchaseStatusFilter === 'Completed' ? 'selected' : ''}>✅ Completed</option>
                <option value="Kitchen Preparing" ${purchaseStatusFilter === 'Kitchen Preparing' ? 'selected' : ''}>🔥 Preparing</option>
                <option value="Placed" ${purchaseStatusFilter === 'Placed' ? 'selected' : ''}>📥 In Queue</option>
              </select>
            </div>
          </div>

          <div class="purchases-table-wrap">
            <table class="purchases-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Order ID</th>
                  <th>Token</th>
                  <th>Customer (Student)</th>
                  <th>Food Dishes Ordered</th>
                  <th style="text-align: center;">Dining</th>
                  <th style="text-align: right;">Amount</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody id="purchase-table-tbody">
                ${shopOrders.length === 0 ? `
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                      No purchases recorded today for this stall.
                    </td>
                  </tr>
                ` : shopOrders.map(order => {
                  const d = order.createdTime ? new Date(order.createdTime) : new Date();
                  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                  const dishesStr = (order.items || []).map(i => `${i.qty}x ${i.name}`).join(', ');

                  return `
                    <tr class="purchase-row" 
                        data-customer="${escapeHtml((order.studentName || '') + ' ' + (order.studentRoll || ''))}"
                        data-dishes="${escapeHtml(dishesStr)}"
                        data-token="${escapeHtml(order.tokenNumber || '')}"
                        data-status="${escapeHtml(order.status || '')}">
                      <td style="color: var(--text-secondary);">${timeStr}</td>
                      <td style="font-family: var(--font-mono); font-weight: 700; color: #FFF;">#${order.id}</td>
                      <td>
                        <span style="font-family: var(--font-mono); font-weight: 800; color: var(--primary-gold); font-size: 1rem;">
                          ${order.tokenNumber}
                        </span>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: #FFF;">${escapeHtml(order.studentName || 'Student')}</div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHtml(order.studentRoll || 'Campus')}</div>
                      </td>
                      <td style="font-weight: 600; color: #FFFFFF;">
                        ${(order.items || []).map(i => `<span style="display: inline-block; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; margin: 2px 4px 2px 0;"><strong style="color: var(--primary-gold);">${i.qty}x</strong> ${escapeHtml(i.name)}</span>`).join('')}
                      </td>
                      <td style="text-align: center;">
                        <span class="badge ${order.diningType === 'Takeaway' ? 'badge-gold' : 'badge-emerald'}" style="font-size: 0.7rem;">
                          ${order.diningType || 'Dine-In'}
                        </span>
                      </td>
                      <td style="text-align: right; font-weight: 800; color: var(--primary-gold); font-size: 1rem;">
                        ₹${order.totalAmount}
                      </td>
                      <td style="text-align: center;">
                        <span class="badge ${order.status === 'Completed' ? 'badge-emerald' : order.status === 'Kitchen Preparing' ? 'badge-cyan' : 'badge-gold'}" style="font-size: 0.72rem;">
                          ${order.status}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : ''}

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

  // 1b. Toggle Business Analytics & Reports
  const toggleAnalyticsBtn = document.getElementById('btn-toggle-business-analytics');
  if (toggleAnalyticsBtn) {
    toggleAnalyticsBtn.addEventListener('click', () => {
      showBusinessAnalytics = !showBusinessAnalytics;
      renderApp();
    });
  }

  // 1c. Excel (.csv) Export
  const excelBtns = container.querySelectorAll('#btn-export-excel, #btn-export-excel-banner');
  excelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      exportOrdersToExcel(currentShop, shopOrders);
      showToast(`Downloading Excel report for ${currentShop.name}...`, 'success');
    });
  });

  // 1d. PDF Export / Printable Report Modal
  const pdfBtns = container.querySelectorAll('#btn-export-pdf, #btn-export-pdf-banner');
  pdfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openPrintableDailyReport(currentShop, shopOrders);
    });
  });

  // 1e. Purchase Details Table Filter & Search
  function applyPurchaseFilters() {
    const pSearch = document.getElementById('purchase-table-search');
    const pStatus = document.getElementById('purchase-table-status');

    const q = (pSearch ? pSearch.value : '').toLowerCase().trim();
    const st = pStatus ? pStatus.value : 'all';

    purchaseSearchQuery = q;
    purchaseStatusFilter = st;

    const rows = container.querySelectorAll('.purchase-row');
    rows.forEach(row => {
      const customer = (row.dataset.customer || '').toLowerCase();
      const dishes = (row.dataset.dishes || '').toLowerCase();
      const token = (row.dataset.token || '').toLowerCase();
      const status = row.dataset.status || '';

      const matchesQuery = !q || customer.includes(q) || dishes.includes(q) || token.includes(q);
      const matchesStatus = st === 'all' || status === st;

      if (matchesQuery && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  const pSearchIn = document.getElementById('purchase-table-search');
  const pStatusSel = document.getElementById('purchase-table-status');
  if (pSearchIn) pSearchIn.addEventListener('input', applyPurchaseFilters);
  if (pStatusSel) pStatusSel.addEventListener('change', applyPurchaseFilters);

  // 2. Toggle Open/Closed
  const toggleStallOpen = document.getElementById('toggle-stall-open-status');
  if (toggleStallOpen) {
    toggleStallOpen.addEventListener('click', () => {
      const newStatus = !currentShop.isOpen;
      if (!newStatus) {
        showBusinessAnalytics = true; // Auto-reveal analytics dashboard when stall is closed
      }
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

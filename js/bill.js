import QRCode from './qrcode.bundle.js';

export async function generateOrderQRCode(order) {
  // Format readable and scannable verification text
  const qrText = [
    `KEC FOOD COURT OFFICIAL BILL`,
    `----------------------------`,
    `Order ID: ${order.id}`,
    `Token: ${order.tokenNumber}`,
    `Stall: ${order.stallNumber || ''} - ${order.shopName || ''}`,
    `Student: ${order.studentName || 'Student'} (${order.studentRoll || 'Campus'})`,
    `Items: ${(order.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}`,
    `Net Amount: Rs.${order.totalAmount}`,
    `Dining: ${order.diningType || 'Dine-In'}`,
    `Status: ${order.status || 'Placed'}`,
    `Payment: PAID ONLINE (Campus UPI/Wallet)`,
    `Verified KEC Smart Dining`
  ].join('\n');

  try {
    const svg = await QRCode.toString(qrText, {
      type: 'svg',
      margin: 1,
      width: 160,
      color: {
        dark: '#0A0E17',
        light: '#FFFFFF'
      }
    });
    return svg;
  } catch (err) {
    console.error('QR code generation failed:', err);
    return `<div style="padding: 16px; font-size: 0.8rem; color: #EF4444; text-align: center;">QR Code: ${order.tokenNumber}</div>`;
  }
}

export async function openOrderBillModal(order) {
  const modal = document.getElementById('bill-receipt-modal');
  const content = document.getElementById('bill-receipt-content');
  if (!modal || !content) return;

  const qrSvg = await generateOrderQRCode(order);

  // Format order date & time
  const orderDate = order.createdTime ? new Date(order.createdTime) : new Date();
  const dateStr = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  content.innerHTML = `
    <!-- Printable Bill Receipt Document -->
    <div class="bill-receipt-card" id="printable-bill">
      <!-- Bill Header -->
      <div class="bill-header">
        <div class="bill-brand-badge">
          <div class="bill-logo-circle">
            <img src="assets/logo.svg" alt="KEC Crest" class="bill-kec-logo" onerror="this.style.display='none'" />
          </div>
          <div>
            <div class="bill-institution">KONGU ENGINEERING COLLEGE</div>
            <div class="bill-title">CAMPUS FOOD COURT TAX INVOICE</div>
            <div class="bill-address">Perundurai, Erode - 638 060, Tamil Nadu</div>
          </div>
        </div>
        <div class="bill-stamp">OFFICIAL DIGITAL TOKEN RECEIPT</div>
      </div>

      <!-- Large Prominent Token Banner -->
      <div class="bill-token-banner">
        <div class="bill-token-caption">FOOD COURT PICKUP TOKEN</div>
        <div class="bill-token-number">${order.tokenNumber}</div>
        <div class="bill-token-sub">Present this token / QR at stall counter when ready</div>
      </div>

      <!-- Meta Grid: Order ID, Date, Stall, Type -->
      <div class="bill-meta-grid">
        <div class="bill-meta-item">
          <span class="bill-meta-label">ORDER NUMBER</span>
          <span class="bill-meta-val" style="font-family: var(--font-mono); font-weight: 800; color: #FFFFFF;">
            #${order.id}
          </span>
        </div>
        <div class="bill-meta-item">
          <span class="bill-meta-label">DATE & TIME</span>
          <span class="bill-meta-val" style="color: var(--text-secondary);">${dateStr}, ${timeStr}</span>
        </div>
        <div class="bill-meta-item">
          <span class="bill-meta-label">FOOD STALL</span>
          <span class="bill-meta-val">
            <strong style="color: var(--primary-gold);">${order.shopName || 'Food'}</strong>
            <span style="opacity: 0.8; font-size: 0.8rem;">(${order.stallNumber || 'Stall #01'})</span>
          </span>
        </div>
        <div class="bill-meta-item">
          <span class="bill-meta-label">DINING TYPE</span>
          <span class="bill-meta-val">
            <span class="badge ${order.diningType === 'Takeaway' ? 'badge-gold' : 'badge-emerald'}" style="font-size: 0.72rem; padding: 2px 8px;">
              ${order.diningType === 'Takeaway' ? '🥡 Takeaway Parcel' : '🍽️ Dine-In Counter'}
            </span>
          </span>
        </div>
      </div>

      <!-- Student Credentials Bar -->
      <div class="bill-student-box">
        <div class="bill-box-title">STUDENT CREDENTIALS</div>
        <div class="bill-student-row">
          <div>Name: <strong style="color: #FFFFFF;">${order.studentName || 'Aravind Kumar'}</strong></div>
          <div>Roll No: <strong style="color: var(--primary-gold);">${order.studentRoll || '21EC108'}</strong></div>
          <div>Mobile: <strong style="color: #FFFFFF;">${order.studentPhone || '98427 06474'}</strong></div>
        </div>
      </div>

      <!-- Itemized Dishes Table -->
      <div class="bill-table-wrap">
        <table class="bill-items-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 50%;">Dish Item</th>
              <th style="text-align: center; width: 14%;">Qty</th>
              <th style="text-align: right; width: 18%;">Price</th>
              <th style="text-align: right; width: 18%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td style="text-align: left;">
                  <span style="font-weight: 700; color: #FFFFFF;">${item.name}</span>
                </td>
                <td style="text-align: center; font-weight: 700;">${item.qty}</td>
                <td style="text-align: right; color: var(--text-secondary);">₹${item.price}</td>
                <td style="text-align: right; font-weight: 800; color: var(--primary-gold);">₹${item.price * item.qty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Summary & Net Payable -->
      <div class="bill-totals-box">
        <div class="bill-total-row">
          <span>Items Subtotal:</span>
          <span style="font-weight: 700;">₹${order.totalAmount}</span>
        </div>
        <div class="bill-total-row" style="color: var(--accent-emerald);">
          <span>Campus Meal Subsidy / GST:</span>
          <span>₹0.00 (Tax Exempt)</span>
        </div>
        <div class="bill-total-row" style="color: var(--text-secondary);">
          <span>Online Ordering Platform Fee:</span>
          <span>₹0.00 (Free)</span>
        </div>
        <div class="bill-grand-total-row">
          <span style="font-weight: 800; font-size: 1.05rem;">TOTAL PAID AMOUNT:</span>
          <span class="bill-grand-price">₹${order.totalAmount}</span>
        </div>
        <div class="bill-payment-status">
          <span class="payment-check-badge">✅ PAID ONLINE</span>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">
            Payment Method: Campus UPI / Student Wallet
          </span>
        </div>
      </div>

      <!-- Unique Encrypted QR Code Section -->
      <div class="bill-qr-section">
        <div class="bill-qr-wrapper">
          <div class="bill-qr-card">
            <div class="qr-svg-holder">
              ${qrSvg}
            </div>
            <div class="qr-scan-guide">
              <span class="qr-corner top-left"></span>
              <span class="qr-corner top-right"></span>
              <span class="qr-corner bottom-left"></span>
              <span class="qr-corner bottom-right"></span>
            </div>
          </div>
        </div>
        <div class="bill-qr-instructions">
          <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>📷</span> UNIQUE ORDER PICKUP QR
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 6px 0 0; line-height: 1.4;">
            Scan at <strong>${order.stallNumber || 'Stall #01'}</strong> counter to verify and claim your order.
          </p>
          <div style="margin-top: 6px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--primary-gold);">
            Token: ${order.tokenNumber} • Order: #${order.id}
          </div>
        </div>
      </div>

      <!-- Bill Footer -->
      <div class="bill-footer">
        <div>Thank you for dining at Kongu Engineering College Food Court!</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px;">
          Smart Campus Dining System • Paperless Initiative
        </div>
      </div>
    </div>

    <!-- Action Buttons (Hidden when printing) -->
    <div class="bill-actions-bar no-print">
      <button class="btn btn-primary" id="btn-print-bill" style="flex: 1;">
        <span>🖨️</span> Print / Save Bill PDF
      </button>
      <button class="btn btn-secondary" id="btn-close-bill" style="min-width: 100px;">
        Close
      </button>
    </div>
  `;

  // Bind Print button
  const printBtn = document.getElementById('btn-print-bill');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Bind Close button
  const closeBtn = document.getElementById('btn-close-bill');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  modal.classList.add('open');
}

// Make globally available for convenience
if (typeof window !== 'undefined') {
  window.openOrderBillModal = openOrderBillModal;
}

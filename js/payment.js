import QRCode from './qrcode.bundle.js';
import { state } from './state.js';
import { openOrderBillModal } from './bill.js';

export async function openPaymentModal(orderParams, showToast, renderApp) {
  const modal = document.getElementById('payment-modal');
  const modalBody = document.getElementById('payment-modal-body');
  if (!modal || !modalBody) return;

  const total = orderParams.totalAmount;
  const upiId = 'kecfoodcourt@okhdfcbank';
  const upiPayload = `upi://pay?pa=${upiId}&pn=KEC%20Food%20Court&am=${total}&cu=INR&tn=KEC-Dining-Order`;

  let qrSvg = '';
  try {
    qrSvg = await QRCode.toString(upiPayload, {
      type: 'svg',
      margin: 1,
      width: 190,
      color: {
        dark: '#0A0E17',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('UPI QR generation error:', err);
    qrSvg = `<div style="padding: 20px; color: #EF4444; text-align: center;">Unable to render QR code</div>`;
  }

  // Initial Payment View
  modalBody.innerHTML = `
    <div class="payment-card" id="payment-view-container">
      <!-- Top Branding -->
      <div class="payment-header">
        <div class="gpay-brand-row">
          <div class="gpay-pill">
            <span style="font-weight: 800; font-family: var(--font-brand); color: #4285F4;">G</span><span style="color: #EA4335;">P</span><span style="color: #FBBC05;">a</span><span style="color: #34A853;">y</span>
          </div>
          <div class="upi-logo-badge">BHIM UPI</div>
          <span style="font-size: 0.74rem; color: var(--accent-emerald); font-weight: 700;">● Verified Merchant</span>
        </div>
        <div style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 8px;">
          Paying to: <strong style="color: #FFFFFF;">Kongu Engineering College Food Court</strong>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
          ${orderParams.stallNumber || 'Stall #01'} • ${orderParams.shopName || 'Food'}
        </div>
      </div>

      <!-- Amount Banner -->
      <div class="payment-amount-box">
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700;">
          TOTAL PAYABLE AMOUNT
        </div>
        <div class="payment-amount-val">₹${total}</div>
        <div style="font-size: 0.76rem; color: var(--accent-emerald); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span>🔒</span> 256-Bit Encrypted Instant UPI Transfer
        </div>
      </div>

      <!-- GPay UPI QR Box -->
      <div class="payment-qr-wrap">
        <div class="gpay-qr-card">
          <div class="gpay-qr-inner">
            ${qrSvg}
          </div>
          <div class="gpay-corner-border">
            <span class="gpay-corner top-left"></span>
            <span class="gpay-corner top-right"></span>
            <span class="gpay-corner bottom-left"></span>
            <span class="gpay-corner bottom-right"></span>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 0.82rem; color: var(--text-secondary); text-align: center;">
          Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI app
        </div>
        <div class="upi-id-pill" id="copy-upi-btn" title="Click to copy UPI ID">
          <span>UPI ID: <strong>${upiId}</strong></span>
          <span style="font-size: 0.75rem; opacity: 0.8;">📋 Copy</span>
        </div>
      </div>

      <!-- Order Summary Pill -->
      <div class="payment-order-summary">
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 4px;">
          <span>Items in Order:</span>
          <span style="font-weight: 700; color: #FFFFFF;">${orderParams.items.length} items (${orderParams.diningType})</span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.3;">
          ${orderParams.items.map(i => `${i.qty}x ${i.name}`).join(' • ')}
        </div>
      </div>

      <!-- Demo Simulation Action -->
      <div style="margin-top: 18px;">
        <button class="btn btn-gpay" id="btn-simulate-pay" style="width: 100%; padding: 13px; font-size: 0.96rem;">
          <span style="font-size: 1.15rem;">⚡</span> Pay ₹${total} via Google Pay (Demo)
        </button>
        <div style="font-size: 0.74rem; color: var(--text-muted); text-align: center; margin-top: 8px;">
          Demo Simulation: Click above to trigger realistic instant payment verification
        </div>
      </div>
    </div>
  `;

  // Copy UPI ID helper
  const copyBtn = document.getElementById('copy-upi-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(upiId);
      showToast('Copied Merchant UPI ID: ' + upiId, 'info');
    });
  }

  // Handle Pay Simulation
  const payBtn = document.getElementById('btn-simulate-pay');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      triggerPaymentProcessing(orderParams, modal, modalBody, showToast, renderApp);
    });
  }

  modal.classList.add('open');
}

function triggerPaymentProcessing(orderParams, modal, modalBody, showToast, renderApp) {
  // 1. Show Processing Screen
  modalBody.innerHTML = `
    <div class="payment-processing-card">
      <div class="payment-spinner"></div>
      <h3 style="font-size: 1.3rem; margin: 18px 0 6px; color: #FFFFFF; font-weight: 800;">
        Verifying Payment...
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary);">Connecting with UPI Banking Switch...</p>
      <div style="font-family: var(--font-mono); font-size: 1.8rem; font-weight: 900; color: var(--primary-gold); margin-top: 10px;">
        ₹${orderParams.totalAmount}
      </div>
      <div style="margin-top: 14px; font-size: 0.78rem; color: var(--text-muted);">
        Please do not refresh or close this window
      </div>
    </div>
  `;

  // 2. Simulate 1.6s verification
  setTimeout(() => {
    const txnId = `UPI${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    // Show Payment Successful Screen
    modalBody.innerHTML = `
      <div class="payment-success-card">
        <div class="success-checkmark-circle">
          <span style="font-size: 2.5rem; line-height: 1;">✓</span>
        </div>
        <h2 style="font-size: 1.55rem; color: #10B981; margin: 14px 0 4px; font-weight: 800;">
          Payment Successful!
        </h2>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 16px;">
          ₹${orderParams.totalAmount} paid to KEC Food Court
        </p>

        <div class="payment-receipt-meta">
          <div class="meta-row">
            <span>Transaction Ref:</span>
            <span style="font-family: var(--font-mono); font-weight: 700; color: #FFFFFF;">${txnId}</span>
          </div>
          <div class="meta-row">
            <span>Payment Method:</span>
            <span style="font-weight: 700; color: #4285F4;">Google Pay UPI</span>
          </div>
          <div class="meta-row">
            <span>Paid To:</span>
            <span>KEC Food Court (${orderParams.stallNumber || 'Stall #01'})</span>
          </div>
          <div class="meta-row" style="background: rgba(255, 159, 28, 0.1); padding: 6px 10px; border-radius: 6px; border: 1px solid rgba(255, 159, 28, 0.25); margin: 6px 0;">
            <span style="color: var(--primary-gold); font-weight: 700;">Ordered Food:</span>
            <span style="font-weight: 800; color: #FFFFFF;">${(orderParams.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}</span>
          </div>
          <div class="meta-row">
            <span>Status:</span>
            <span style="color: #10B981; font-weight: 700;">✅ Confirmed & Credited</span>
          </div>
        </div>

        <button class="btn btn-emerald btn-lg" id="btn-view-generated-bill" style="width: 100%; margin-top: 18px;">
          <span>🧾</span> View Official Bill & Pickup Token
        </button>
      </div>
    `;

    // Create the actual order in state now that payment is confirmed!
    const newOrder = state.createOrder({
      ...orderParams,
      paymentMethod: 'Google Pay (UPI)',
      paymentStatus: 'Paid',
      transactionId: txnId
    });

    // Clear cart tray
    state.clearCart();
    renderApp();

    showToast(`Payment Confirmed! Your Token is ${newOrder.tokenNumber}`, 'success');

    // Handler for clicking View Bill
    const viewBillBtn = document.getElementById('btn-view-generated-bill');
    let autoTimer = null;

    const proceedToBill = () => {
      if (autoTimer) clearTimeout(autoTimer);
      modal.classList.remove('open');
      setTimeout(() => {
        openOrderBillModal(newOrder);
      }, 250);
    };

    if (viewBillBtn) {
      viewBillBtn.addEventListener('click', proceedToBill);
    }

    // Auto-transition to bill modal after 2.6s
    autoTimer = setTimeout(() => {
      if (modal.classList.contains('open')) {
        proceedToBill();
      }
    }, 2600);
  }, 1600);
}

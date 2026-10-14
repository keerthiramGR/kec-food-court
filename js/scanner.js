import { state } from './state.js';

let html5QrScannerInstance = null;

// ---------------------------------------------------------------------------
// 1. Synthesized Audio Chimes for Delivery
// ---------------------------------------------------------------------------
export function playDeliverySuccessSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    // Joyful major chord chime: C5, E5, G5, C6 triumphant fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.75);
    });
  } catch (e) {
    console.warn('Audio notice:', e);
  }
}

export function playErrorAlertSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// 2. Smart QR Text Parser
// ---------------------------------------------------------------------------
export function parseQrOrderData(text) {
  if (!text) return null;
  const str = String(text).trim();

  // Try JSON
  try {
    const data = JSON.parse(str);
    if (data.id || data.orderId || data.token || data.tokenNumber) {
      return {
        orderId: (data.id || data.orderId || '').toUpperCase(),
        tokenNumber: (data.token || data.tokenNumber || '').toUpperCase()
      };
    }
  } catch (e) {}

  // KEC_ORDER prefix: KEC_ORDER:KEC-1234:TK-42
  const prefixMatch = str.match(/KEC_ORDER:([^:\s]+):([^:\s]+)/i);
  if (prefixMatch) {
    return {
      orderId: prefixMatch[1].trim().toUpperCase(),
      tokenNumber: prefixMatch[2].trim().toUpperCase()
    };
  }

  // Regex for Order ID and Token
  const orderIdMatch = str.match(/Order(?:\s*ID)?[:\s#]+(KEC-[0-9]+)/i) || str.match(/\b(KEC-[0-9]+)\b/i);
  const tokenMatch = str.match(/Token(?:\s*Number)?[:\s#]+(TK-[0-9]+)/i) || str.match(/\b(TK-[0-9]+)\b/i);

  if (orderIdMatch || tokenMatch) {
    return {
      orderId: orderIdMatch ? orderIdMatch[1].toUpperCase() : null,
      tokenNumber: tokenMatch ? tokenMatch[1].toUpperCase() : null
    };
  }

  // 2 digits = token number, 4 digits = order ID
  if (/^\d{2}$/.test(str)) {
    return { tokenNumber: `TK-${str}` };
  }
  if (/^\d{4}$/.test(str)) {
    return { orderId: `KEC-${str}` };
  }

  return { raw: str };
}

// ---------------------------------------------------------------------------
// 3. Open QR Delivery Verification Scanner Modal
// ---------------------------------------------------------------------------
export function openDeliveryQrScannerModal({ currentShop, targetOrderId, onDelivered, showToast, renderApp }) {
  let modal = document.getElementById('owner-qr-scanner-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'owner-qr-scanner-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const allOrders = state.getOrders();
  const targetOrder = targetOrderId ? allOrders.find(o => o.id === targetOrderId) : null;
  const readyOrders = allOrders.filter(o => o.shopId === currentShop.id && o.status === 'Ready at Counter');

  modal.innerHTML = `
    <div class="modal-box qr-scanner-modal-box">
      <!-- Modal Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="text-align: left;">
          <h2 style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: #FFF; margin: 0;">
            <span>📷</span> Student Bill QR Verification
          </h2>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 3px 0 0;">
            ${escapeHtml(currentShop.name)} (${escapeHtml(currentShop.stallNumber)}) Counter • Handover & Delivery
          </p>
        </div>
        <button id="btn-close-scanner-modal" class="modal-close-btn" style="font-size: 1.5rem; line-height: 1;">&times;</button>
      </div>

      ${targetOrder ? `
        <div style="background: rgba(255, 159, 28, 0.12); border: 1px solid rgba(255, 159, 28, 0.35); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 10px; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
          <span>Targeting: <strong style="color: var(--primary-gold);">${targetOrder.tokenNumber}</strong> (${escapeHtml(targetOrder.studentName || 'Student')})</span>
          <span class="badge badge-gold" style="font-size: 0.7rem;">Order #${targetOrder.id}</span>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm); padding: 6px 12px; margin-bottom: 10px; font-size: 0.82rem; color: #34D399;">
          Ready to scan any student token bill for <strong>${escapeHtml(currentShop.name)}</strong>
        </div>
      `}

      <!-- Camera Selection Switcher (Defaults to Laptop Webcam) -->
      <div id="camera-select-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; font-size: 0.82rem; background: rgba(0,0,0,0.25); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 5px 10px;">
        <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
          <span>💻</span> Camera:
        </span>
        <select id="camera-source-select" class="form-select" style="flex: 1; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px; background: rgba(0,0,0,0.4);">
          <option value="user">Laptop Webcam (Default)</option>
        </select>
      </div>

      <!-- Scanner Viewfinder Box -->
      <div class="qr-scanner-viewport">
        <div id="qr-video-region"></div>
        <div class="scanner-laser-line"></div>
        <div class="scanner-corner top-left"></div>
        <div class="scanner-corner top-right"></div>
        <div class="scanner-corner bottom-left"></div>
        <div class="scanner-corner bottom-right"></div>
      </div>

      <!-- Live Feedback Alert Box -->
      <div id="scanner-feedback-msg" style="min-height: 24px; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">
        Position the student's bill receipt QR code in front of the laptop webcam
      </div>

      <!-- Scanning Tips -->
      <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.3;">
        💡 Tip: Increase phone screen brightness and hold phone ~15-20cm from webcam
      </div>

      <!-- Quick 1-Click Verification for Ready Tokens at Counter -->
      ${readyOrders.length > 0 ? `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px dashed rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm); padding: 8px 10px; margin-bottom: 12px;">
          <div style="font-size: 0.72rem; color: #34D399; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
            ⚡ Or 1-Click Handover for Ready Orders at Counter:
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
            ${readyOrders.map(ro => `
              <button class="btn btn-secondary btn-xs btn-quick-verify" data-code="${ro.tokenNumber}" style="border-radius: 12px; padding: 3px 10px; font-family: var(--font-mono); font-weight: 700; border-color: rgba(16, 185, 129, 0.4);">
                ✅ Handover ${ro.tokenNumber}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Fallback: Instant Manual Code Verification -->
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 12px 14px; border: 1px solid var(--border-glass); margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">
            Or Enter Token / Order ID Manually:
          </span>
          <!-- Photo / Screenshot Upload Alternative -->
          <input type="file" id="qr-file-picker" accept="image/*" style="display: none;" />
          <button id="btn-browse-qr-img" class="btn btn-outline-gold btn-xs" style="font-size: 0.72rem; padding: 2px 8px;">
            📁 Upload QR Image
          </button>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="manual-verify-input" class="form-input" placeholder="e.g. TK-42 or KEC-1234" style="flex: 1; padding: 7px 12px; font-size: 0.9rem; font-family: var(--font-mono);" />
          <button id="btn-manual-verify-submit" class="btn btn-emerald btn-sm" style="font-weight: 700; padding: 7px 16px;">
            Verify
          </button>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button id="btn-cancel-scanner" class="btn btn-secondary btn-sm" style="width: 100%;">
          Close Scanner
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  let nativePollActive = true;

  async function cleanupScanner() {
    nativePollActive = false;
    if (html5QrScannerInstance) {
      try {
        await html5QrScannerInstance.stop();
        html5QrScannerInstance.clear();
      } catch (e) {}
      html5QrScannerInstance = null;
    }
    modal.classList.remove('open');
  }

  const closeBtn = modal.querySelector('#btn-close-scanner-modal');
  const cancelBtn = modal.querySelector('#btn-cancel-scanner');
  if (closeBtn) closeBtn.addEventListener('click', cleanupScanner);
  if (cancelBtn) cancelBtn.addEventListener('click', cleanupScanner);

  // Process and verify order
  function verifyScannedOrder(scannedCode) {
    if (!scannedCode) return;
    console.log('Scanned QR code payload:', scannedCode);

    const parsed = parseQrOrderData(scannedCode);
    const feedback = modal.querySelector('#scanner-feedback-msg');

    if (!parsed || (!parsed.orderId && !parsed.tokenNumber && !parsed.raw)) {
      if (feedback) {
        feedback.innerHTML = `<span style="color: #EF4444;">❌ Invalid QR format (${scannedCode}). Please scan KEC official bill.</span>`;
      }
      playErrorAlertSound();
      return;
    }

    const currentOrders = state.getOrders();
    let matchedOrder = null;

    if (parsed.orderId) {
      matchedOrder = currentOrders.find(o => (o.id || '').toUpperCase() === parsed.orderId);
    }
    if (!matchedOrder && parsed.tokenNumber) {
      // Find within current shop first
      matchedOrder = currentOrders.find(o => (o.tokenNumber || '').toUpperCase() === parsed.tokenNumber && o.shopId === currentShop.id);
      if (!matchedOrder) {
        matchedOrder = currentOrders.find(o => (o.tokenNumber || '').toUpperCase() === parsed.tokenNumber);
      }
    }
    if (!matchedOrder && parsed.raw) {
      matchedOrder = currentOrders.find(o => (o.id || '').toUpperCase() === parsed.raw.toUpperCase() || (o.tokenNumber || '').toUpperCase() === parsed.raw.toUpperCase());
    }

    if (!matchedOrder) {
      if (feedback) {
        feedback.innerHTML = `<span style="color: #EF4444;">❌ Order not found (${scannedCode}). Check student bill.</span>`;
      }
      playErrorAlertSound();
      return;
    }

    // Check shop match
    if (matchedOrder.shopId !== currentShop.id) {
      if (feedback) {
        feedback.innerHTML = `<span style="color: #F59E0B;">⚠️ Wrong Stall! This order is for <strong>${escapeHtml(matchedOrder.shopName)} (${escapeHtml(matchedOrder.stallNumber)})</strong>.</span>`;
      }
      playErrorAlertSound();
      return;
    }

    // Check if already completed
    if (matchedOrder.status === 'Completed') {
      if (feedback) {
        feedback.innerHTML = `<span style="color: #38BDF8;">ℹ️ Order <strong>${matchedOrder.tokenNumber}</strong> was already marked delivered at ${matchedOrder.deliveredTime || 'earlier'}.</span>`;
      }
      playDeliverySuccessSound();
      cleanupScanner();
      showDeliverySuccessModal(matchedOrder, () => openDeliveryQrScannerModal({ currentShop, onDelivered, showToast, renderApp }));
      return;
    }

    // Success! Mark as Delivered / Completed
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    matchedOrder.deliveredTime = timeStr;
    matchedOrder.deliveredDate = dateStr;
    matchedOrder.isQrVerified = true;
    matchedOrder.verifiedBy = currentShop.name;

    state.updateOrderStatus(matchedOrder.id, 'Completed');
    playDeliverySuccessSound();
    cleanupScanner();

    if (showToast) {
      showToast(`🎉 Order ${matchedOrder.tokenNumber} verified & marked Delivered!`, 'success');
    }
    if (onDelivered) onDelivered(matchedOrder);
    if (renderApp) renderApp();

    // Show celebratory Green Tick Delivered Modal
    showDeliverySuccessModal(matchedOrder, () => openDeliveryQrScannerModal({ currentShop, onDelivered, showToast, renderApp }));
  }

  // Bind 1-click quick verify buttons
  modal.querySelectorAll('.btn-quick-verify').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.code;
      if (code) verifyScannedOrder(code);
    });
  });

  // Bind manual input submit
  const manualInput = modal.querySelector('#manual-verify-input');
  const manualBtn = modal.querySelector('#btn-manual-verify-submit');
  if (manualBtn && manualInput) {
    const handleManualSubmit = () => {
      const val = manualInput.value.trim();
      if (val) verifyScannedOrder(val);
    };
    manualBtn.addEventListener('click', handleManualSubmit);
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleManualSubmit();
    });
  }

  // Bind QR file/photo upload
  const filePicker = modal.querySelector('#qr-file-picker');
  const browseBtn = modal.querySelector('#btn-browse-qr-img');
  if (browseBtn && filePicker) {
    browseBtn.addEventListener('click', () => filePicker.click());
    filePicker.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const feedback = modal.querySelector('#scanner-feedback-msg');
      if (feedback) feedback.innerHTML = `<span>⏳ Analyzing uploaded QR image...</span>`;
      try {
        if (html5QrScannerInstance) {
          const decoded = await html5QrScannerInstance.scanFile(file, true);
          verifyScannedOrder(decoded);
        }
      } catch (err) {
        if (feedback) feedback.innerHTML = `<span style="color: #EF4444;">❌ Could not read QR from image. Try another photo.</span>`;
      }
    });
  }

  // Camera start helper
  async function startScannerCamera(chosenCameraId) {
    if (html5QrScannerInstance) {
      try {
        await html5QrScannerInstance.stop();
        html5QrScannerInstance.clear();
      } catch (e) {}
      html5QrScannerInstance = null;
    }

    const feedback = modal.querySelector('#scanner-feedback-msg');
    const cameraSelect = modal.querySelector('#camera-source-select');

    try {
      html5QrScannerInstance = new window.Html5Qrcode('qr-video-region');
      const scanConfig = {
        fps: 20,
        // Scan full wide frame for maximum detection speed and distance tolerance
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.floor(minDim * 0.95),
            height: Math.floor(minDim * 0.95)
          };
        },
        aspectRatio: 1.0,
        disableFlip: false
      };

      // 1. Get list of all cameras on the device
      let availableCameras = [];
      try {
        availableCameras = await window.Html5Qrcode.getCameras();
      } catch (e) {
        console.warn('getCameras info:', e);
      }

      let activeCamTarget = null;

      if (availableCameras && availableCameras.length > 0) {
        if (cameraSelect) {
          cameraSelect.innerHTML = availableCameras.map((cam, idx) => {
            const label = cam.label || `Camera ${idx + 1}`;
            return `<option value="${cam.id}">${label}</option>`;
          }).join('');
        }

        if (chosenCameraId && availableCameras.some(c => c.id === chosenCameraId)) {
          activeCamTarget = chosenCameraId;
        } else {
          // Look for laptop webcam / front camera first to avoid phone link
          const laptopCam = availableCameras.find(c => {
            const lbl = (c.label || '').toLowerCase();
            return (
              lbl.includes('integrated') ||
              lbl.includes('webcam') ||
              lbl.includes('front') ||
              lbl.includes('user') ||
              lbl.includes('laptop') ||
              lbl.includes('internal') ||
              lbl.includes('hd camera')
            ) && !lbl.includes('phone') && !lbl.includes('virtual');
          });

          activeCamTarget = (laptopCam || availableCameras[0]).id;
        }

        if (cameraSelect && activeCamTarget) {
          cameraSelect.value = activeCamTarget;
        }
      }

      // Use the chosen camera device ID, or user facingMode (laptop webcam)
      const cameraConstraint = activeCamTarget ? activeCamTarget : { facingMode: 'user' };

      await html5QrScannerInstance.start(
        cameraConstraint,
        scanConfig,
        (decodedText) => {
          verifyScannedOrder(decodedText);
        },
        () => {}
      );

      if (feedback) {
        feedback.innerHTML = `<span style="color: #34D399;">Active: Laptop Camera • Hold QR steady in frame</span>`;
      }

      // Native Hardware-Accelerated BarcodeDetector hook if supported in Chrome/Edge
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const pollBarcodeDetector = async () => {
            if (!nativePollActive || !html5QrScannerInstance) return;
            const videoEl = modal.querySelector('#qr-video-region video');
            if (videoEl && videoEl.readyState >= 2) {
              try {
                const barcodes = await detector.detect(videoEl);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  nativePollActive = false;
                  verifyScannedOrder(barcodes[0].rawValue);
                  return;
                }
              } catch (e) {}
            }
            if (nativePollActive) {
              requestAnimationFrame(pollBarcodeDetector);
            }
          };
          requestAnimationFrame(pollBarcodeDetector);
        } catch (e) {}
      }

    } catch (err) {
      console.warn('Laptop camera start attempt:', err);
      // Fallback: try direct user-facing webcam mode
      try {
        if (html5QrScannerInstance) {
          await html5QrScannerInstance.start(
            { facingMode: 'user' },
            { fps: 20, aspectRatio: 1.0 },
            (decodedText) => verifyScannedOrder(decodedText),
            () => {}
          );
          if (feedback) {
            feedback.innerHTML = `<span style="color: #34D399;">Active: Laptop Webcam • Position QR in frame</span>`;
          }
          return;
        }
      } catch (fallbackErr) {
        console.warn('Fallback camera notice:', fallbackErr);
      }

      if (feedback) {
        feedback.innerHTML = `<span style="color: #94A3B8;">Webcam preview unavailable. You can enter the token number manually below.</span>`;
      }
    }
  }

  // Bind camera selector change
  const cameraSelectEl = modal.querySelector('#camera-source-select');
  if (cameraSelectEl) {
    cameraSelectEl.addEventListener('change', (e) => {
      startScannerCamera(e.target.value);
    });
  }

  // Initialize camera scanner via Html5Qrcode
  setTimeout(() => {
    if (typeof window.Html5Qrcode !== 'undefined') {
      startScannerCamera();
    } else {
      const feedback = modal.querySelector('#scanner-feedback-msg');
      if (feedback) {
        feedback.innerHTML = `<span style="color: #94A3B8;">Camera scanner ready. Or enter token number manually below.</span>`;
      }
    }
  }, 100);
}

// ---------------------------------------------------------------------------
// 4. Celebratory Animated Green Tick Delivery Success Modal
// ---------------------------------------------------------------------------
export function showDeliverySuccessModal(order, onScanNext) {
  let modal = document.getElementById('owner-delivery-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'owner-delivery-success-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const itemsHtml = (order.items || []).map(i => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.9rem;">
      <span><strong style="color: var(--primary-gold);">${i.qty}x</strong> ${escapeHtml(i.name)}</span>
      <span style="font-weight: 700; color: #FFF;">₹${(i.price || 0) * (i.qty || 1)}</span>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 480px; text-align: center; border-radius: var(--radius-lg); padding: 28px 24px; position: relative;">
      <!-- Animated Green Tick SVG -->
      <div class="success-checkmark-box">
        <svg class="checkmark-svg" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <div style="margin-bottom: 6px;">
        <span class="badge badge-emerald" style="font-size: 0.82rem; padding: 5px 16px; letter-spacing: 0.5px; font-weight: 800;">
          ✅ ORDER DELIVERED & VERIFIED!
        </span>
      </div>

      <h2 style="font-size: 1.6rem; font-weight: 800; color: #FFFFFF; margin: 6px 0;">
        Food Handover Complete
      </h2>
      <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 16px;">
        Verified student bill for <strong>${escapeHtml(order.shopName || 'Food Stall')}</strong>
      </p>

      <!-- Token Banner -->
      <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid #10B981; border-radius: var(--radius-md); padding: 14px; margin-bottom: 18px;">
        <div style="font-size: 0.72rem; color: #34D399; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
          PICKUP TOKEN NUMBER
        </div>
        <div style="font-size: 2.4rem; font-weight: 900; color: var(--primary-gold); font-family: var(--font-mono); line-height: 1.1; margin: 4px 0;">
          ${order.tokenNumber}
        </div>
        <div style="font-size: 0.82rem; color: #E2E8F0;">
          Order #${order.id} • <span class="badge badge-gold" style="font-size: 0.7rem;">${order.diningType || 'Dine-In'}</span>
        </div>
      </div>

      <!-- Student & Items Summary -->
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 12px 16px; text-align: left; margin-bottom: 20px; border: 1px solid var(--border-glass);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.86rem;">
          <span style="color: var(--text-secondary);">Student:</span>
          <strong style="color: #FFF;">${escapeHtml(order.studentName || 'Student')} (${escapeHtml(order.studentRoll || 'Campus')})</strong>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
          Handed Over Dishes:
        </div>
        <div style="margin-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 6px;">
          ${itemsHtml}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1rem; font-weight: 800;">
          <span>Paid Total:</span>
          <span style="color: var(--primary-gold);">₹${order.totalAmount}</span>
        </div>
        <div style="font-size: 0.75rem; color: #34D399; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
          <span>🕒</span> Delivered at ${order.deliveredTime || 'Just now'}
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 10px;">
        <button id="btn-success-scan-next" class="btn btn-emerald btn-lg" style="flex: 1; font-weight: 800;">
          <span>📷</span> Scan Next Bill
        </button>
        <button id="btn-success-done" class="btn btn-secondary btn-lg" style="min-width: 100px;">
          Done
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const scanNextBtn = modal.querySelector('#btn-success-scan-next');
  if (scanNextBtn) {
    scanNextBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      if (onScanNext) onScanNext();
    });
  }

  const doneBtn = modal.querySelector('#btn-success-done');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

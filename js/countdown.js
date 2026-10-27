/**
 * KEC Food Court - Smart Kitchen Countdown & Estimation Engine
 * 
 * Computes live preparation countdowns for pickup tokens based on:
 * 1. Type of food ordered (Base cooking / preparation time of each dish)
 * 2. Number of people / orders ahead at the stall (Queue length)
 * 3. Same food ordered condition (Tawa/Wok Batching synergy or dedicated prep slot)
 */

import { state } from './state.js';

/**
 * Parses preparation time string like "3m", "5m", "8m", "10-15 mins" into integer minutes
 */
export function parsePrepMinutes(prepStr, defaultMinutes = 5) {
  if (!prepStr) return defaultMinutes;
  const str = String(prepStr).toLowerCase();
  
  // If range like "10-15 mins"
  const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return Math.round((min + max) / 2);
  }

  // If single number like "3m", "8 mins", "5 min"
  const singleMatch = str.match(/(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }

  return defaultMinutes;
}

/**
 * Categorical fallback preparation times for standard campus food court dishes
 */
function getDishCategoryDefaultPrep(dishName, category) {
  const name = (dishName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (name.includes('kalaki') || name.includes('half boil') || name.includes('full boil') || name.includes('omlet')) {
    return 2;
  }
  if (cat.includes('juice') || name.includes('juice') || name.includes('shake') || name.includes('cooler') || name.includes('coffee')) {
    return 3;
  }
  if (name.includes('parotta') || name.includes('chappathi') || name.includes('dosai') || name.includes('roast') || name.includes('poori')) {
    return 4;
  }
  if (name.includes('fried rice') || name.includes('noodles') || name.includes('kothu') || name.includes('chilly')) {
    return 8;
  }
  if (name.includes('gravy') || name.includes('masala') || name.includes('chettinad') || name.includes('65') || name.includes('manjurian') || name.includes('pallipalayam')) {
    return 10;
  }
  if (name.includes('biryani') || name.includes('briyani')) {
    return 5; // Biryani is pre-dum cooked, plated and garnished
  }

  return 5;
}

/**
 * Calculates detailed smart kitchen estimation for an order
 * 
 * @param {Object} order - The target order object
 * @param {Array} [allOrders] - Optional list of all orders; defaults to state.getOrders()
 * @param {Array} [allShops] - Optional list of shops; defaults to state.getShops()
 * @returns {Object} Comprehensive calculation details & live countdown metrics
 */
export function calculateOrderEstimatedPrep(order, allOrders = null, allShops = null) {
  if (!order) {
    return {
      totalEstimatedMinutes: 5,
      totalEstimatedSeconds: 300,
      targetReadyTime: Date.now() + 300000,
      remainingSeconds: 300,
      formattedMMSS: '05:00',
      progressPercent: 0,
      isReady: false,
      isDelivered: false,
      factors: null
    };
  }

  const orders = allOrders || state.getOrders() || [];
  const shops = allShops || state.getShops() || [];
  const shop = shops.find(s => s.id === order.shopId || s.stallNumber === order.stallNumber);

  // --------------------------------------------------------------------------
  // CONDITION 1: TYPE OF FOOD ORDERED (Base Food Cooking Time)
  // --------------------------------------------------------------------------
  const items = Array.isArray(order.items) ? order.items : [];
  let maxDishPrepMinutes = 2;
  let primaryDishName = 'Campus Delicacy';
  let totalItemQty = 0;

  const itemBreakdowns = items.map(item => {
    let prep = parsePrepMinutes(item.prepTime, null);
    if (!prep && shop && Array.isArray(shop.menu)) {
      const menuItem = shop.menu.find(m => m.id === item.id || m.name.toLowerCase() === item.name.toLowerCase());
      if (menuItem && menuItem.prepTime) {
        prep = parsePrepMinutes(menuItem.prepTime, null);
      }
    }
    if (!prep) {
      prep = getDishCategoryDefaultPrep(item.name, item.category);
    }

    const qty = Number(item.qty) || 1;
    totalItemQty += qty;

    if (prep > maxDishPrepMinutes) {
      maxDishPrepMinutes = prep;
      primaryDishName = item.name;
    }

    return {
      name: item.name,
      qty,
      prepMinutes: prep
    };
  });

  // Additional multi-item / multi-quantity buffer (stove concurrency buffer)
  const additionalItemsBuffer = items.length > 1 || totalItemQty > 1
    ? Math.min(4, Math.round((totalItemQty - 1) * 0.5 + (items.length - 1) * 0.5))
    : 0;

  const foodTypePrepMinutes = Math.max(2, maxDishPrepMinutes + additionalItemsBuffer);

  // --------------------------------------------------------------------------
  // CONDITION 2: NO. OF PEOPLE / ORDERS AHEAD (Stall Queue Length)
  // --------------------------------------------------------------------------
  const orderCreatedTime = order.createdTime ? Number(order.createdTime) : Date.now();
  
  // Find all earlier pending orders for this specific stall
  const activeOrdersAhead = orders.filter(o => {
    if (o.id === order.id) return false;
    const sameStall = (o.shopId && order.shopId && o.shopId === order.shopId) ||
                      (o.stallNumber && order.stallNumber && o.stallNumber === order.stallNumber);
    if (!sameStall) return false;

    // Must be placed before this order or earlier in queue
    const oCreated = o.createdTime ? Number(o.createdTime) : 0;
    const isEarlier = oCreated <= orderCreatedTime;

    // Must still be active (not completed or ready)
    const isPending = o.status !== 'Completed' && o.status !== 'Ready at Counter';

    return isEarlier && isPending;
  });

  const peopleAheadCount = activeOrdersAhead.length;
  // Each order ahead adds ~2 mins of queue tawa / plating delay
  const queueMinutes = Math.round(peopleAheadCount * 2.0);

  // --------------------------------------------------------------------------
  // CONDITION 3: SAME FOOD ORDERED (Batching / Tawa Synergy)
  // --------------------------------------------------------------------------
  // Check if people ahead ordered the identical food dishes
  const myDishNames = items.map(i => (i.name || '').trim().toLowerCase());
  const sameFoodMatches = [];

  activeOrdersAhead.forEach(aheadOrder => {
    const aheadItems = Array.isArray(aheadOrder.items) ? aheadOrder.items : [];
    aheadItems.forEach(aheadItem => {
      const aheadDish = (aheadItem.name || '').trim().toLowerCase();
      if (myDishNames.includes(aheadDish)) {
        sameFoodMatches.push({
          tokenNumber: aheadOrder.tokenNumber || `#${aheadOrder.id}`,
          dishName: aheadItem.name,
          qty: aheadItem.qty || 1
        });
      }
    });
  });

  // Batch synergy discount:
  // If identical food is already on the tawa/wok/griddle, preparation runs simultaneously in one shared batch.
  // Each same-food match saves ~1.5 minutes off queue delay (capped at 50% of queue wait).
  let batchSynergySavings = 0;
  if (sameFoodMatches.length > 0 && queueMinutes > 0) {
    batchSynergySavings = Math.min(Math.round(queueMinutes * 0.5), Math.round(sameFoodMatches.length * 1.5));
  }

  // --------------------------------------------------------------------------
  // FINAL COMPUTATION
  // --------------------------------------------------------------------------
  // Total Estimated Minutes = Food Base + Queue Delay - Batch Synergy Discount
  let totalEstimatedMinutes = Math.max(2, Math.round(foodTypePrepMinutes + queueMinutes - batchSynergySavings));

  // If order explicitly stored its estimatedPrepMinutes upon creation, honor it or use computed
  if (order.estimatedPrepMinutes && typeof order.estimatedPrepMinutes === 'number') {
    totalEstimatedMinutes = order.estimatedPrepMinutes;
  }

  const totalEstimatedSeconds = totalEstimatedMinutes * 60;
  const targetReadyTime = order.targetReadyTime
    ? Number(order.targetReadyTime)
    : (orderCreatedTime + (totalEstimatedSeconds * 1000));

  const now = Date.now();
  let remainingSeconds = Math.max(0, Math.floor((targetReadyTime - now) / 1000));
  const elapsedSeconds = Math.max(0, Math.floor((now - orderCreatedTime) / 1000));

  const isDelivered = order.status === 'Completed';
  const isReady = order.status === 'Ready at Counter' || (remainingSeconds === 0 && !isDelivered);

  if (isReady || isDelivered) {
    remainingSeconds = 0;
  }

  // Calculate percentage of preparation completed
  let progressPercent = 0;
  if (isDelivered || isReady) {
    progressPercent = 100;
  } else if (totalEstimatedSeconds > 0) {
    progressPercent = Math.min(96, Math.max(5, Math.round((elapsedSeconds / totalEstimatedSeconds) * 100)));
  }

  // Format MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedMMSS = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const targetDate = new Date(targetReadyTime);
  const formattedTargetTime = targetDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    orderId: order.id,
    tokenNumber: order.tokenNumber,
    shopName: order.shopName,
    stallNumber: order.stallNumber,
    totalEstimatedMinutes,
    totalEstimatedSeconds,
    targetReadyTime,
    remainingSeconds,
    elapsedSeconds,
    formattedMMSS,
    formattedTargetTime,
    progressPercent,
    isReady,
    isDelivered,
    factors: {
      foodType: {
        dishNames: items.map(i => i.name),
        primaryDish: primaryDishName,
        maxDishPrepMinutes,
        additionalItemsBuffer,
        totalFoodMinutes: foodTypePrepMinutes,
        itemBreakdowns,
        summary: `Base dish cooking time: ${maxDishPrepMinutes}m (${primaryDishName})${additionalItemsBuffer > 0 ? ` + ${additionalItemsBuffer}m multi-item buffer` : ''}`
      },
      peopleAhead: {
        count: peopleAheadCount,
        queueMinutes,
        summary: peopleAheadCount === 0
          ? 'No queue ahead • Kitchen begins cooking immediately!'
          : `${peopleAheadCount} active order(s) ahead at stall (+${queueMinutes}m queue wait)`
      },
      sameFoodCondition: {
        hasSameFoodMatch: sameFoodMatches.length > 0,
        matchesCount: sameFoodMatches.length,
        matchedItems: sameFoodMatches,
        savingsMinutes: batchSynergySavings,
        summary: sameFoodMatches.length > 0
          ? `🥘 Same-Food Batching Active: Shared cooking on tawa/wok for ${sameFoodMatches.map(m => m.dishName).slice(0, 2).join(', ')} saves ~${batchSynergySavings}m!`
          : `🍳 Dedicated Cook Slot: Freshly made in separate sequence.`
      }
    }
  };
}

/**
 * Plays a pleasant modern double-chime when food countdown reaches zero
 * Uses Web Audio API with zero external audio assets
 */
export function playReadyChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Chime Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Chime Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.16);
    gain2.gain.setValueAtTime(0.22, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.75);
  } catch (e) {
    // Non-fatal if audio context is blocked by browser policies
  }
}

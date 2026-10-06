import { INITIAL_SHOPS, INITIAL_ORDERS, DEFAULT_USERS } from './data.js';

const STORAGE_KEYS = {
  SHOPS: 'kec_foodcourt_shops_v5',
  ORDERS: 'kec_foodcourt_orders_v5',
  CURRENT_USER: 'kec_foodcourt_user_v2',
  CART: 'kec_foodcourt_cart_v2'
};

class FoodCourtState {
  constructor() {
    this.listeners = [];
    this.init();
    this.syncBackendShops();
  }

  init() {
    // Load or seed shops with exactly 2 default shops: Food and Juice
    const storedShops = localStorage.getItem(STORAGE_KEYS.SHOPS);
    if (!storedShops) {
      localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
    }

    // Load or seed orders
    const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!storedOrders) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }

    // User session
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!storedUser) {
      // Default to null or guest view initially
      this.currentUser = null;
    } else {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    // Cart
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
    this.cart = storedCart ? JSON.parse(storedCart) : [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, payload) {
    this.listeners.forEach(fn => {
      try { fn(eventType, payload); } catch (e) { console.error(e); }
    });
  }

  async syncBackendShops() {
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        if (data && data.shops && data.shops.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(data.shops));
          this.notify('SHOPS_UPDATED', data.shops);
        }
      }
    } catch {
      // offline / static fallback
    }
  }

  getShops() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHOPS);
      return data ? JSON.parse(data) : INITIAL_SHOPS;
    } catch {
      return INITIAL_SHOPS;
    }
  }

  saveShops(shops) {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
    this.notify('SHOPS_UPDATED', shops);
  }

  getShopById(shopId) {
    return this.getShops().find(s => s.id === shopId);
  }

  addShop(shopData) {
    const shops = this.getShops();
    const newShop = {
      id: `shop-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      prepTime: "10-15 mins",
      isOpen: true,
      accentColor: shopData.accentColor || "#FF6B35",
      icon: shopData.icon || "🏪",
      bannerImage: shopData.bannerImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
      menu: shopData.menu || [
        {
          id: `m-${Date.now()}-1`,
          name: "Chef's Signature Welcome Special",
          price: 99,
          category: "Special",
          isVeg: true,
          isAvailable: true,
          badge: "New Stall",
          prepTime: "10m",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80"
        }
      ],
      ...shopData
    };

    shops.push(newShop);
    this.saveShops(shops);
    this.notify('SHOP_CREATED', newShop);

    // Sync with Node.js backend
    try {
      fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShop)
      }).catch(e => console.warn('Backend sync notice:', e));
    } catch {}

    return newShop;
  }

  updateShop(shopId, updateData) {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === shopId);
    if (index !== -1) {
      shops[index] = { ...shops[index], ...updateData };
      this.saveShops(shops);
      this.notify('SHOP_UPDATED', shops[index]);

      // Sync with Node.js backend
      try {
        fetch(`/api/shops/${shopId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        }).catch(e => console.warn('Backend sync notice:', e));
      } catch {}

      return shops[index];
    }
    return null;
  }

  addMenuItemToShop(shopId, itemData) {
    const shops = this.getShops();
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      if (!shop.menu) shop.menu = [];
      const newItem = {
        id: `item-${Date.now()}`,
        isAvailable: true,
        ...itemData
      };
      shop.menu.push(newItem);
      this.saveShops(shops);
      this.notify('MENU_UPDATED', { shopId, item: newItem });

      // Sync with Node.js backend
      try {
        fetch(`/api/shops/${shopId}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        }).catch(e => console.warn('Backend sync notice:', e));
      } catch {}

      return newItem;
    }
    return null;
  }

  updateMenuItem(shopId, itemId, updatedFields) {
    const shops = this.getShops();
    const shop = shops.find(s => s.id === shopId);
    if (shop && shop.menu) {
      const itemIndex = shop.menu.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        shop.menu[itemIndex] = {
          ...shop.menu[itemIndex],
          ...updatedFields
        };
        this.saveShops(shops);
        this.notify('MENU_UPDATED', { shopId, itemId, item: shop.menu[itemIndex] });

        // Sync with Node.js backend
        try {
          fetch(`/api/shops/${shopId}/menu/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
          }).catch(e => console.warn('Backend sync notice:', e));
        } catch {}

        return shop.menu[itemIndex];
      }
    }
    return null;
  }

  deleteMenuItem(shopId, itemId) {
    const shops = this.getShops();
    const shop = shops.find(s => s.id === shopId);
    if (shop && shop.menu) {
      const itemIndex = shop.menu.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        const removed = shop.menu.splice(itemIndex, 1);
        this.saveShops(shops);
        this.notify('MENU_UPDATED', { shopId, itemId, deleted: true });

        // Sync with Node.js backend
        try {
          fetch(`/api/shops/${shopId}/menu/${itemId}`, {
            method: 'DELETE'
          }).catch(e => console.warn('Backend sync notice:', e));
        } catch {}

        return removed[0];
      }
    }
    return null;
  }

  toggleMenuItemAvailability(shopId, itemId) {
    const shops = this.getShops();
    const shop = shops.find(s => s.id === shopId);
    if (shop && shop.menu) {
      const item = shop.menu.find(i => i.id === itemId);
      if (item) {
        item.isAvailable = !item.isAvailable;
        this.saveShops(shops);
        this.notify('MENU_UPDATED', { shopId, itemId, isAvailable: item.isAvailable });

        // Sync with Node.js backend
        try {
          fetch(`/api/shops/${shopId}/menu/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isAvailable: item.isAvailable })
          }).catch(e => console.warn('Backend sync notice:', e));
        } catch {}

        return item;
      }
    }
    return null;
  }

  // Orders
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify('ORDERS_UPDATED', orders);
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const tokenSeq = Math.floor(10 + Math.random() * 90);
    const newOrder = {
      id: `KEC-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: `TK-${tokenSeq}`,
      status: "Placed",
      createdTime: Date.now(),
      timestamp: "Just now",
      ...orderData
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.notify('ORDER_CREATED', newOrder);

    // Sync with Node.js backend
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      }).catch(e => console.warn('Backend sync notice:', e));
    } catch {}

    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders(orders);
      this.notify('ORDER_STATUS_CHANGED', order);

      // Sync with Node.js backend
      try {
        fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }).catch(e => console.warn('Backend sync notice:', e));
      } catch {}

      return order;
    }
    return null;
  }

  // Authentication
  getCurrentUser() {
    return this.currentUser;
  }

  login(userData) {
    this.currentUser = userData;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
    this.notify('AUTH_LOGIN', userData);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify('AUTH_LOGOUT', null);
  }

  // Cart
  getCart() {
    return this.cart;
  }

  addToCart(item, shop) {
    const existing = this.cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        isVeg: item.isVeg,
        prepTime: item.prepTime,
        shopId: shop.id,
        shopName: shop.name,
        stallNumber: shop.stallNumber,
        qty: 1
      });
    }
    this.saveCart();
  }

  updateCartQty(itemId, change) {
    const idx = this.cart.findIndex(c => c.id === itemId);
    if (idx !== -1) {
      this.cart[idx].qty += change;
      if (this.cart[idx].qty <= 0) {
        this.cart.splice(idx, 1);
      }
      this.saveCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.notify('CART_UPDATED', this.cart);
  }
}

export const state = new FoodCourtState();

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Persistent Data Storage Directory & Paths
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const SHOPS_FILE = path.join(DATA_DIR, 'shops.json');

function loadJSON(filePath, fallbackData) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`⚠️ Notice reading ${path.basename(filePath)}:`, err.message);
  }
  return fallbackData;
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`❌ Error writing ${path.basename(filePath)}:`, err.message);
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ypytclolejmdyfmrpowk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

let supabase = null;
let supabaseAdmin = null;

const isSupabaseConfigured = Boolean(
  SUPABASE_KEY &&
  SUPABASE_KEY.trim() !== '' &&
  !SUPABASE_KEY.includes('your_supabase_anon_or_service_role_key_here')
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
      global: { timeout: 1500 }
    });
    console.log(`✅ Supabase configured: ${SUPABASE_URL}`);
  } catch (err) {
    console.warn('⚠️ Supabase initialization warning:', err.message);
  }
} else {
  console.log('ℹ️ Running in resilient mode with local persistent storage (data/orders.json, data/students.json).');
}

if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY.trim() !== '' && !SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')) {
  try {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
      global: { timeout: 1500 }
    });
    console.log(`✅ Supabase Admin (Auth) active: ${SUPABASE_URL}`);
  } catch (err) {
    console.warn('⚠️ Supabase Admin client warning:', err.message);
  }
}

// Helper to run Supabase operations with 1.2s timeout so DNS failure never blocks requests
async function withSupabaseTimeout(promiseFn, timeoutMs = 1200) {
  return Promise.race([
    promiseFn(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timeout')), timeoutMs))
  ]);
}

app.use(cors());
app.use(express.json());


// In-Memory Seed Store (Syncs across all clients)
let shopsData = [
  {
    id: "shop-1",
    name: "Food",
    stallNumber: "Stall #01",
    tagline: "Authentic South Indian & Chinese Delicacies • Call: 98427 06474 / 94429 06474",
    phone: "98427 06474 / 94429 06474",
    category: "Food",
    ownerName: "Murugan Selvam",
    email: "food@kecfood.in",
    password: "owner123",
    rating: 4.8,
    reviewsCount: 342,
    prepTime: "10-15 mins",
    isOpen: true,
    accentColor: "#FF6B35",
    icon: "🍛",
    bannerImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
    menu: [
      // 1-7: PAROTTA / ROTI
      { id: "f-1", name: "Parotta", price: 18, category: "Parotta & Roti", isVeg: true, isAvailable: true, badge: "Popular", prepTime: "3m", image: "assets/menu/f-1.jpg" },
      { id: "f-2", name: "Chappathi", price: 18, category: "Parotta & Roti", isVeg: true, isAvailable: true, prepTime: "3m", image: "assets/menu/f-2.jpg" },
      { id: "f-3", name: "Chilly Parotta", price: 70, category: "Parotta & Roti", isVeg: true, isAvailable: true, badge: "Spicy", prepTime: "8m", image: "assets/menu/f-3.jpg" },
      { id: "f-4", name: "Egg Parotta", price: 60, category: "Parotta & Roti", isVeg: false, isAvailable: true, prepTime: "6m", image: "assets/menu/f-4.jpg" },
      { id: "f-5", name: "Veg. Kothu Parotta", price: 60, category: "Parotta & Roti", isVeg: true, isAvailable: true, badge: "Veg", prepTime: "8m", image: "assets/menu/f-5.jpg" },
      { id: "f-6", name: "Egg. Kothu Parotta", price: 70, category: "Parotta & Roti", isVeg: false, isAvailable: true, badge: "Campus Fav", prepTime: "8m", image: "assets/menu/f-6.jpg" },
      { id: "f-7", name: "Chkn. Kothu Parotta", price: 80, category: "Parotta & Roti", isVeg: false, isAvailable: true, badge: "Bestseller", prepTime: "10m", image: "assets/menu/f-7.jpg" },

      // 8-17: DOSA / ROAST
      { id: "f-8", name: "Roast", price: 40, category: "Dosa & Roast", isVeg: true, isAvailable: true, prepTime: "5m", image: "assets/menu/f-8.jpg" },
      { id: "f-9", name: "Ghee Roast", price: 55, category: "Dosa & Roast", isVeg: true, isAvailable: true, badge: "Crispy", prepTime: "6m", image: "assets/menu/f-9.jpg" },
      { id: "f-10", name: "Onion Roast", price: 55, category: "Dosa & Roast", isVeg: true, isAvailable: true, prepTime: "6m", image: "assets/menu/f-10.jpg" },
      { id: "f-11", name: "Egg Roast", price: 55, category: "Dosa & Roast", isVeg: false, isAvailable: true, prepTime: "7m", image: "assets/menu/f-11.jpg" },
      { id: "f-12", name: "Podi Roast", price: 55, category: "Dosa & Roast", isVeg: true, isAvailable: true, badge: "Ghee Podi", prepTime: "6m", image: "assets/menu/f-12.jpg" },
      { id: "f-13", name: "Masala Roast", price: 60, category: "Dosa & Roast", isVeg: true, isAvailable: true, badge: "Potato Masala", prepTime: "7m", image: "assets/menu/f-13.jpg" },
      { id: "f-14", name: "Dosai", price: 25, category: "Dosa & Roast", isVeg: true, isAvailable: true, prepTime: "4m", image: "assets/menu/f-14.jpg" },
      { id: "f-15", name: "Egg Dosai", price: 35, category: "Dosa & Roast", isVeg: false, isAvailable: true, prepTime: "5m", image: "assets/menu/f-15.jpg" },
      { id: "f-16", name: "Podi Dosai", price: 35, category: "Dosa & Roast", isVeg: true, isAvailable: true, prepTime: "5m", image: "assets/menu/f-16.jpg" },
      { id: "f-17", name: "Poori", price: 20, category: "Dosa & Roast", isVeg: true, isAvailable: true, prepTime: "5m", image: "assets/menu/f-17.jpg" },

      // 18-22: EGG SPECIALS
      { id: "f-18", name: "Omlet", price: 20, category: "Egg Specials", isVeg: false, isAvailable: true, prepTime: "3m", image: "assets/menu/f-18.jpg" },
      { id: "f-19", name: "Half Boil", price: 15, category: "Egg Specials", isVeg: false, isAvailable: true, prepTime: "2m", image: "assets/menu/f-19.jpg" },
      { id: "f-20", name: "Full Boil", price: 15, category: "Egg Specials", isVeg: false, isAvailable: true, prepTime: "2m", image: "assets/menu/f-20.jpg" },
      { id: "f-21", name: "Kalaki", price: 15, category: "Egg Specials", isVeg: false, isAvailable: true, badge: "Kongu Special", prepTime: "2m", image: "assets/menu/f-21.jpg" },
      { id: "f-22", name: "Egg Poriyal", price: 25, category: "Egg Specials", isVeg: false, isAvailable: true, prepTime: "4m", image: "assets/menu/f-22.jpg" },

      // 23-30: FRIED RICE
      { id: "f-23", name: "Veg. Fried Rice", price: 60, category: "Fried Rice", isVeg: true, isAvailable: true, prepTime: "8m", image: "assets/menu/f-23.jpg" },
      { id: "f-24", name: "Sechzwan Veg Frd Rice", price: 65, category: "Fried Rice", isVeg: true, isAvailable: true, badge: "Spicy", prepTime: "8m", image: "assets/menu/f-24.jpg" },
      { id: "f-25", name: "Gobi Fried Rice", price: 65, category: "Fried Rice", isVeg: true, isAvailable: true, prepTime: "9m", image: "assets/menu/f-25.jpg" },
      { id: "f-26", name: "Mushroom Fried Rice", price: 70, category: "Fried Rice", isVeg: true, isAvailable: true, prepTime: "9m", image: "assets/menu/f-26.jpg" },
      { id: "f-27", name: "Egg. Fried Rice", price: 70, category: "Fried Rice", isVeg: false, isAvailable: true, prepTime: "8m", image: "assets/menu/f-27.jpg" },
      { id: "f-28", name: "Sechzwan Egg Rice", price: 75, category: "Fried Rice", isVeg: false, isAvailable: true, prepTime: "8m", image: "assets/menu/f-28.jpg" },
      { id: "f-29", name: "Chicken Fried Rice", price: 80, category: "Fried Rice", isVeg: false, isAvailable: true, badge: "Hot Seller", prepTime: "10m", image: "assets/menu/f-29.jpg" },
      { id: "f-30", name: "Sechzwan Chkn. Frd Rice", price: 85, category: "Fried Rice", isVeg: false, isAvailable: true, badge: "Spicy Chicken", prepTime: "10m", image: "assets/menu/f-30.jpg" },

      // 31-38: NOODLES
      { id: "f-31", name: "Veg Noodles", price: 60, category: "Noodles", isVeg: true, isAvailable: true, prepTime: "8m", image: "assets/menu/f-31.jpg" },
      { id: "f-32", name: "Sechzwan Veg. Noodles", price: 65, category: "Noodles", isVeg: true, isAvailable: true, prepTime: "8m", image: "assets/menu/f-32.jpg" },
      { id: "f-33", name: "Gobi Noodles", price: 65, category: "Noodles", isVeg: true, isAvailable: true, prepTime: "9m", image: "assets/menu/f-33.jpg" },
      { id: "f-34", name: "Mushroom Noodles", price: 70, category: "Noodles", isVeg: true, isAvailable: true, prepTime: "9m", image: "assets/menu/f-34.jpg" },
      { id: "f-35", name: "Egg Noodles", price: 70, category: "Noodles", isVeg: false, isAvailable: true, prepTime: "8m", image: "assets/menu/f-35.jpg" },
      { id: "f-36", name: "Sechzwan Egg Noodles", price: 75, category: "Noodles", isVeg: false, isAvailable: true, prepTime: "8m", image: "assets/menu/f-36.jpg" },
      { id: "f-37", name: "Chicken Noodles", price: 80, category: "Noodles", isVeg: false, isAvailable: true, badge: "Campus Fav", prepTime: "10m", image: "assets/menu/f-37.jpg" },
      { id: "f-38", name: "Sechzwan Chkn. Noodles", price: 85, category: "Noodles", isVeg: false, isAvailable: true, badge: "Spicy", prepTime: "10m", image: "assets/menu/f-38.jpg" },

      // 39-42: CHICKEN BONELESS GRAVY
      { id: "f-39", name: "Chicken Butter Masala", price: 100, category: "Chicken Gravy", isVeg: false, isAvailable: true, badge: "Creamy Rich", prepTime: "12m", image: "assets/menu/f-39.jpg" },
      { id: "f-40", name: "Chicken Chettinad", price: 100, category: "Chicken Gravy", isVeg: false, isAvailable: true, badge: "Spicy Gravy", prepTime: "12m", image: "assets/menu/f-40.jpg" },
      { id: "f-41", name: "Chicken Pallipalayam", price: 100, category: "Chicken Gravy", isVeg: false, isAvailable: true, badge: "Kongu Native", prepTime: "12m", image: "assets/menu/f-41.jpg" },
      { id: "f-42", name: "Chicken Pepper", price: 100, category: "Chicken Gravy", isVeg: false, isAvailable: true, badge: "Pepper Gravy", prepTime: "12m", image: "assets/menu/f-42.jpg" },

      // 43-50: CHICKEN BONELESS DRY
      { id: "f-43", name: "Chicken 65", price: 95, category: "Chicken Dry", isVeg: false, isAvailable: true, badge: "Bestseller", prepTime: "10m", image: "assets/menu/f-43.jpg" },
      { id: "f-44", name: "Chicken Pallipalayam", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, badge: "Kongu Special", prepTime: "12m", image: "assets/menu/f-44.jpg" },
      { id: "f-45", name: "Chicken Maharani", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, prepTime: "12m", image: "assets/menu/f-45.jpg" },
      { id: "f-46", name: "Chicken Pepper", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, badge: "Black Pepper", prepTime: "10m", image: "assets/menu/f-46.jpg" },
      { id: "f-47", name: "Chicken Hyderabad", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, prepTime: "12m", image: "assets/menu/f-47.jpg" },
      { id: "f-48", name: "Chicken Garlic", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, prepTime: "10m", image: "assets/menu/f-48.jpg" },
      { id: "f-49", name: "Chicken Manjurian", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, prepTime: "10m", image: "assets/menu/f-49.jpg" },
      { id: "f-50", name: "Chicken Sechzwan", price: 100, category: "Chicken Dry", isVeg: false, isAvailable: true, prepTime: "10m", image: "assets/menu/f-50.jpg" },

      // 51-60: VEG (Gravy / Starters)
      { id: "f-51", name: "Gobi Chilly", price: 50, category: "Veg Specials", isVeg: true, isAvailable: true, badge: "Crispy", prepTime: "8m", image: "assets/menu/f-51.jpg" },
      { id: "f-52", name: "Gobi Masala", price: 70, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-52.jpg" },
      { id: "f-53", name: "Gobi Manjurian", price: 70, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-53.jpg" },
      { id: "f-54", name: "Gobi Pallipalayam Dry", price: 70, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-54.jpg" },
      { id: "f-55", name: "Mushroom Chilly", price: 70, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "8m", image: "assets/menu/f-55.jpg" },
      { id: "f-56", name: "Mushroom Masala", price: 80, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-56.jpg" },
      { id: "f-57", name: "Mushroom Manjurian", price: 80, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-57.jpg" },
      { id: "f-58", name: "Mushroom Pepper Dry", price: 80, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-58.jpg" },
      { id: "f-59", name: "Panner Butter Masala", price: 100, category: "Veg Specials", isVeg: true, isAvailable: true, badge: "Customer Choice", prepTime: "12m", image: "assets/menu/f-59.jpg" },
      { id: "f-60", name: "Babycorn Manjurian", price: 70, category: "Veg Specials", isVeg: true, isAvailable: true, prepTime: "10m", image: "assets/menu/f-60.jpg" },

      // 61-64: ROTI / NAAN
      { id: "f-61", name: "Naan", price: 35, category: "Naan & Roti", isVeg: true, isAvailable: true, prepTime: "5m", image: "assets/menu/f-61.jpg" },
      { id: "f-62", name: "Butter Naan", price: 40, category: "Naan & Roti", isVeg: true, isAvailable: true, badge: "Fluffy Butter", prepTime: "5m", image: "assets/menu/f-62.jpg" },
      { id: "f-63", name: "Romali Rotti", price: 35, category: "Naan & Roti", isVeg: true, isAvailable: true, prepTime: "4m", image: "assets/menu/f-63.jpg" },
      { id: "f-64", name: "Romali Butter Rotti", price: 40, category: "Naan & Roti", isVeg: true, isAvailable: true, prepTime: "4m", image: "assets/menu/f-64.jpg" },

      // 65-66: BIRYANI & EGG MASALA
      { id: "f-65", name: "Chicken Briyani", price: 100, category: "Biryani", isVeg: false, isAvailable: true, badge: "Super Bestseller", prepTime: "5m", image: "assets/menu/f-65.jpg" },
      { id: "f-66", name: "Egg Masala", price: 50, category: "Egg Specials", isVeg: false, isAvailable: true, prepTime: "8m", image: "assets/menu/f-66.jpg" }
    ]
  },
  {
    id: "shop-2",
    name: "Juice",
    stallNumber: "Stall #02",
    tagline: "Natural Cold-Pressed Juices, Shakes & Coolers",
    category: "Juice",
    ownerName: "Fathima Noor",
    email: "juice@kecfood.in",
    password: "owner123",
    rating: 4.9,
    reviewsCount: 410,
    prepTime: "5-7 mins",
    isOpen: true,
    accentColor: "#06B6D4",
    icon: "🥤",
    bannerImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
    menu: [
      { id: "m2-1", name: "Alphonso Mango Thick Shake", price: 80, category: "Juice", isVeg: true, isAvailable: true, badge: "Bestseller", prepTime: "5m", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-2", name: "Fresh Mint Lime Cooler", price: 35, category: "Juice", isVeg: true, isAvailable: true, badge: "Refreshing", prepTime: "3m", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-3", name: "Oreo Nutella Freak Shake", price: 95, category: "Juice", isVeg: true, isAvailable: true, badge: "Special", prepTime: "6m", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-4", name: "Iced Hazelnut Cold Coffee", price: 75, category: "Juice", isVeg: true, isAvailable: true, badge: "Top Pick", prepTime: "5m", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80" }
    ]
  }
];

// Load or persist shops, orders, and students
if (fs.existsSync(SHOPS_FILE)) {
  const loaded = loadJSON(SHOPS_FILE, null);
  if (Array.isArray(loaded) && loaded.length > 0) {
    shopsData = loaded;
  }
} else {
  saveJSON(SHOPS_FILE, shopsData);
}

let ordersData = loadJSON(ORDERS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) {
  saveJSON(ORDERS_FILE, ordersData);
}

const defaultStudents = [
  {
    id: "std_25CSR134",
    name: "KEERTHIRAM G R",
    rollNo: "25CSR134",
    mobile: "9876543210",
    department: "Computer Science & Engineering",
    year: "Active Student",
    walletBalance: 850,
    avatar: "🎓",
    totalOrders: 0,
    totalSpent: 0,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

let studentsData = loadJSON(STUDENTS_FILE, defaultStudents);
if (!fs.existsSync(STUDENTS_FILE)) {
  saveJSON(STUDENTS_FILE, studentsData);
}

// --------------------------------------------------------------------------
// DATABASE FORMATTERS & HELPERS
// --------------------------------------------------------------------------

function formatShopFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    stallNumber: row.stall_number || row.stallNumber || '',
    tagline: row.tagline || '',
    phone: row.phone || '',
    category: row.category || '',
    ownerName: row.owner_name || row.ownerName || '',
    email: row.email || '',
    password: row.password || '',
    rating: Number(row.rating) || 4.8,
    reviewsCount: Number(row.reviews_count ?? row.reviewsCount) || 0,
    prepTime: row.prep_time || row.prepTime || '10-15 mins',
    isOpen: row.is_open !== undefined ? Boolean(row.is_open) : (row.isOpen !== undefined ? Boolean(row.isOpen) : true),
    accentColor: row.accent_color || row.accentColor || '#FF6B35',
    icon: row.icon || '🍛',
    bannerImage: row.banner_image || row.bannerImage || '',
    menu: Array.isArray(row.menu) ? row.menu : (typeof row.menu === 'string' ? JSON.parse(row.menu) : [])
  };
}

function formatShopToDB(shop) {
  return {
    id: shop.id,
    name: shop.name,
    stall_number: shop.stallNumber || shop.stall_number,
    tagline: shop.tagline || '',
    phone: shop.phone || '',
    category: shop.category || '',
    owner_name: shop.ownerName || shop.owner_name || '',
    email: shop.email || '',
    password: shop.password || '',
    rating: Number(shop.rating) || 4.8,
    reviews_count: Number(shop.reviewsCount ?? shop.reviews_count) || 0,
    prep_time: shop.prepTime || shop.prep_time || '10-15 mins',
    is_open: shop.isOpen !== undefined ? Boolean(shop.isOpen) : (shop.is_open !== undefined ? Boolean(shop.is_open) : true),
    accent_color: shop.accentColor || shop.accent_color || '#FF6B35',
    icon: shop.icon || '🏪',
    banner_image: shop.bannerImage || shop.banner_image || '',
    menu: Array.isArray(shop.menu) ? shop.menu : []
  };
}

function formatOrderFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    tokenNumber: row.token_number || row.tokenNumber,
    studentName: row.student_name || row.studentName || 'Student',
    studentRoll: row.student_roll || row.studentRoll || '',
    studentPhone: row.student_phone || row.studentPhone || '',
    shopId: row.shop_id || row.shopId,
    shopName: row.shop_name || row.shopName || '',
    stallNumber: row.stall_number || row.stallNumber || '',
    items: Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items) : []),
    totalAmount: Number(row.total_amount ?? row.totalAmount) || 0,
    status: row.status || 'Placed',
    diningType: row.dining_type || row.diningType || 'Dine-In',
    paymentMethod: row.payment_method || row.paymentMethod || 'Google Pay (UPI)',
    paymentStatus: row.payment_status || row.paymentStatus || 'Paid',
    transactionId: row.transaction_id || row.transactionId || '',
    qrCodeSvg: row.qr_code_svg || row.qrCodeSvg || '',
    timestamp: row.timestamp || 'Just now',
    createdTime: Number(row.created_time) || (row.created_at ? new Date(row.created_at).getTime() : Date.now())
  };
}

function formatOrderToDB(order) {
  return {
    id: order.id,
    token_number: order.tokenNumber || order.token_number,
    student_name: order.studentName || order.student_name || 'Student',
    student_roll: order.studentRoll || order.student_roll || '',
    student_phone: order.studentPhone || order.student_phone || '',
    shop_id: order.shopId || order.shop_id,
    shop_name: order.shopName || order.shop_name || '',
    stall_number: order.stallNumber || order.stall_number || '',
    items: Array.isArray(order.items) ? order.items : [],
    total_amount: Number(order.totalAmount ?? order.total_amount) || 0,
    status: order.status || 'Placed',
    dining_type: order.diningType || order.dining_type || 'Dine-In',
    payment_method: order.paymentMethod || order.payment_method || 'Google Pay (UPI)',
    payment_status: order.paymentStatus || order.payment_status || 'Paid',
    transaction_id: order.transactionId || order.transaction_id || '',
    qr_code_svg: order.qrCodeSvg || order.qr_code_svg || '',
    timestamp: order.timestamp || 'Just now',
    created_time: order.createdTime || Date.now()
  };
}

// --------------------------------------------------------------------------
// REST API ROUTES
// --------------------------------------------------------------------------

// Diagnostic Supabase Status Endpoint
app.get('/api/supabase-status', async (req, res) => {
  let pingSuccess = false;
  let shopCount = null;
  let orderCount = null;
  let errorMsg = null;

  if (supabase) {
    try {
      const { count: sCount, error: sErr } = await supabase.from('shops').select('*', { count: 'exact', head: true });
      const { count: oCount, error: oErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      if (!sErr) {
        pingSuccess = true;
        shopCount = sCount;
        orderCount = oCount;
      } else {
        errorMsg = sErr.message;
      }
    } catch (err) {
      errorMsg = err.message;
    }
  }

  res.json({
    configured: isSupabaseConfigured,
    connected: Boolean(supabase),
    pingSuccess,
    projectUrl: SUPABASE_URL,
    shopCount,
    orderCount,
    error: errorMsg
  });
});

// 1. Get all shops
app.get('/api/shops', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('shops').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        shopsData = data.map(formatShopFromDB);
        return res.json({ success: true, count: shopsData.length, shops: shopsData, source: 'supabase' });
      } else if (!error && data && data.length === 0) {
        // Auto-seed to Supabase if table is currently empty
        console.log('🌱 Seeding initial shops into empty Supabase shops table...');
        const rows = shopsData.map(formatShopToDB);
        await supabase.from('shops').insert(rows);
      }
    } catch (e) {
      console.warn('Supabase shops query note:', e.message);
    }
  }

  res.json({ success: true, count: shopsData.length, shops: shopsData, source: 'memory' });
});

// 2. Add New Shop (Super Admin)
app.post('/api/shops', async (req, res) => {
  const { name, stallNumber, category, ownerName, email, password, tagline, icon, accentColor, menu } = req.body;

  if (!name || !stallNumber || !email) {
    return res.status(400).json({ success: false, error: "Missing required fields (name, stallNumber, email)" });
  }

  const newShop = {
    id: `shop-${Date.now()}`,
    name,
    stallNumber,
    category: category || "Special Cuisine",
    ownerName: ownerName || "Stall Partner",
    email,
    password: password || "owner123",
    tagline: tagline || "Campus Delicacies",
    icon: icon || "🏪",
    accentColor: accentColor || "#FF9F1C",
    rating: 5.0,
    reviewsCount: 1,
    prepTime: "10-15 mins",
    isOpen: true,
    bannerImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    menu: menu || [
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
    ]
  };

  shopsData.push(newShop);

  if (supabase) {
    try {
      await supabase.from('shops').insert([formatShopToDB(newShop)]);
    } catch (e) {
      console.warn('Supabase shop insert notice:', e.message);
    }
  }

  res.status(201).json({ success: true, shop: newShop });
});

// 3. Update Shop Status (Open/Close / Details)
app.patch('/api/shops/:id', async (req, res) => {
  const shop = shopsData.find(s => s.id === req.params.id);
  if (!shop) return res.status(404).json({ success: false, error: "Shop not found" });

  Object.assign(shop, req.body);

  if (supabase) {
    try {
      await supabase.from('shops').update(formatShopToDB(shop)).eq('id', req.params.id);
    } catch (e) {
      console.warn('Supabase shop update notice:', e.message);
    }
  }

  res.json({ success: true, shop });
});

// 4. Add Dish to Shop Menu
app.post('/api/shops/:id/menu', async (req, res) => {
  const shop = shopsData.find(s => s.id === req.params.id);
  if (!shop) return res.status(404).json({ success: false, error: "Shop not found" });

  const newItem = {
    id: `item-${Date.now()}`,
    isAvailable: true,
    badge: req.body.badge || "Special",
    image: req.body.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300",
    ...req.body
  };

  if (!shop.menu) shop.menu = [];
  shop.menu.push(newItem);

  if (supabase) {
    try {
      await supabase.from('shops').update({ menu: shop.menu }).eq('id', req.params.id);
    } catch (e) {
      console.warn('Supabase menu item insert notice:', e.message);
    }
  }

  res.status(201).json({ success: true, item: newItem });
});

// 5. Update Dish Details / Stock Availability
app.patch('/api/shops/:id/menu/:itemId', async (req, res) => {
  const shop = shopsData.find(s => s.id === req.params.id);
  if (!shop || !shop.menu) return res.status(404).json({ success: false, error: "Shop or menu not found" });

  const item = shop.menu.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ success: false, error: "Dish not found" });

  if (req.body.name !== undefined) item.name = String(req.body.name).trim();
  if (req.body.price !== undefined) item.price = Number(req.body.price);
  if (req.body.category !== undefined) item.category = String(req.body.category).trim();
  if (req.body.isVeg !== undefined) item.isVeg = Boolean(req.body.isVeg);
  if (req.body.isAvailable !== undefined) item.isAvailable = Boolean(req.body.isAvailable);
  if (req.body.prepTime !== undefined) item.prepTime = String(req.body.prepTime).trim();
  if (req.body.badge !== undefined) item.badge = String(req.body.badge).trim();
  if (req.body.image !== undefined) item.image = String(req.body.image).trim();
  if (req.body.servingsCount !== undefined) {
    item.servingsCount = Math.max(0, parseInt(req.body.servingsCount) || 0);
    if (item.servingsCount === 0) {
      item.isAvailable = false;
    } else if (req.body.isAvailable === undefined) {
      item.isAvailable = true;
    }
  }

  if (supabase) {
    try {
      await supabase.from('shops').update({ menu: shop.menu }).eq('id', req.params.id);
    } catch (e) {
      console.warn('Supabase menu item update notice:', e.message);
    }
  }

  res.json({ success: true, item });
});

// 5b. Delete Dish from Menu
app.delete('/api/shops/:id/menu/:itemId', async (req, res) => {
  const shop = shopsData.find(s => s.id === req.params.id);
  if (!shop || !shop.menu) return res.status(404).json({ success: false, error: "Shop or menu not found" });

  const itemIndex = shop.menu.findIndex(i => i.id === req.params.itemId);
  if (itemIndex === -1) return res.status(404).json({ success: false, error: "Dish not found" });

  const removed = shop.menu.splice(itemIndex, 1);

  if (supabase) {
    try {
      await supabase.from('shops').update({ menu: shop.menu }).eq('id', req.params.id);
    } catch (e) {
      console.warn('Supabase menu delete notice:', e.message);
    }
  }

  res.json({ success: true, removedItem: removed[0] });
});

// 6. Orders
app.get('/api/orders', async (req, res) => {
  const { rollNo } = req.query;

  // Always refresh latest orders from persistent disk storage
  ordersData = loadJSON(ORDERS_FILE, ordersData);

  // Attempt fast Supabase sync if enabled, but don't stall
  if (supabase) {
    try {
      await withSupabaseTimeout(async () => {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (rollNo) {
          query = query.ilike('student_roll', rollNo.trim());
        }
        const { data, error } = await query;
        if (!error && data) {
          ordersData = data.map(formatOrderFromDB);
          saveJSON(ORDERS_FILE, ordersData);
        }
      }, 1200);
    } catch (e) {
      // Supabase timeout or offline - rely on local disk store
    }
  }

  let results = ordersData;
  if (rollNo) {
    const cleanRoll = rollNo.trim().toUpperCase();
    results = ordersData.filter(o => o.studentRoll && o.studentRoll.trim().toUpperCase() === cleanRoll);
  }

  res.json({ success: true, count: results.length, orders: results, source: 'disk_store' });
});

app.post('/api/orders', async (req, res) => {
  const tokenSeq = Math.floor(10 + Math.random() * 90);
  const orderId = req.body.id || `KEC-${Math.floor(1000 + Math.random() * 9000)}`;
  const tokenNumber = req.body.tokenNumber || `TK-${tokenSeq}`;

  const qrText = [
    `KEC FOOD COURT OFFICIAL BILL`,
    `----------------------------`,
    `Order ID: ${orderId}`,
    `Token: ${tokenNumber}`,
    `Stall: ${req.body.stallNumber || ''} - ${req.body.shopName || ''}`,
    `Student: ${req.body.studentName || 'Student'} (${req.body.studentRoll || 'Campus'})`,
    `Items: ${(req.body.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}`,
    `Total: Rs.${req.body.totalAmount || 0}`,
    `Dining: ${req.body.diningType || 'Dine-In'}`,
    `Status: ${req.body.status || 'Placed'}`,
    `Payment: PAID ONLINE`,
    `Verified KEC Smart Dining`
  ].join('\n');

  let qrCodeSvg = '';
  try {
    qrCodeSvg = await QRCode.toString(qrText, {
      type: 'svg',
      margin: 1,
      width: 170,
      color: { dark: '#0A0E17', light: '#FFFFFF' }
    });
  } catch (e) {
    console.warn('Backend QR generation note:', e);
  }

  const newOrder = {
    id: orderId,
    tokenNumber,
    status: req.body.status || "Placed",
    createdTime: Date.now(),
    timestamp: "Just now",
    qrCodeSvg,
    ...req.body
  };

  // Automatically deduct servings count for each ordered dish
  const touchedShops = new Set();
  if (Array.isArray(req.body.items)) {
    req.body.items.forEach(orderedItem => {
      shopsData.forEach(shop => {
        if (shop.menu) {
          const dish = shop.menu.find(d => d.id === orderedItem.id);
          if (dish) {
            const currentCount = dish.servingsCount !== undefined ? dish.servingsCount : 25;
            dish.servingsCount = Math.max(0, currentCount - (orderedItem.qty || 1));
            if (dish.servingsCount === 0) {
              dish.isAvailable = false;
            }
            touchedShops.add(shop);
          }
        }
      });
    });
  }

  // 1. Add order to in-memory and disk
  const existingIndex = ordersData.findIndex(o => o.id === newOrder.id);
  if (existingIndex !== -1) {
    ordersData[existingIndex] = newOrder;
  } else {
    ordersData.unshift(newOrder);
  }
  saveJSON(ORDERS_FILE, ordersData);
  if (touchedShops.size > 0) {
    saveJSON(SHOPS_FILE, shopsData);
  }

  // 2. Persist student statistics in studentsData
  const cleanRoll = String(newOrder.studentRoll || '').trim().toUpperCase();
  if (cleanRoll && !cleanRoll.startsWith('GUEST-')) {
    let student = studentsData.find(s => s.rollNo && s.rollNo.toUpperCase() === cleanRoll);
    if (student) {
      student.totalOrders = (student.totalOrders || 0) + 1;
      student.totalSpent = (student.totalSpent || 0) + (Number(newOrder.totalAmount) || 0);
      student.lastOrderTime = new Date().toISOString();
      if (newOrder.studentName && (!student.name || student.name === 'Student')) {
        student.name = newOrder.studentName;
      }
      if (newOrder.studentPhone && !student.mobile) {
        student.mobile = newOrder.studentPhone;
      }
    } else {
      student = {
        id: `std_${cleanRoll}`,
        name: newOrder.studentName || 'Student',
        rollNo: cleanRoll,
        mobile: newOrder.studentPhone || '',
        department: "Computer Science & Engineering",
        year: "Active Student",
        walletBalance: 850,
        avatar: "🎓",
        totalOrders: 1,
        totalSpent: Number(newOrder.totalAmount) || 0,
        lastLogin: new Date().toISOString(),
        lastOrderTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      studentsData.unshift(student);
    }
    saveJSON(STUDENTS_FILE, studentsData);
  }

  // 3. Background sync with Supabase if available
  if (supabase) {
    withSupabaseTimeout(async () => {
      await supabase.from('orders').upsert([formatOrderToDB(newOrder)], { onConflict: 'id' });
      for (const s of touchedShops) {
        await supabase.from('shops').update({ menu: s.menu }).eq('id', s.id);
      }
    }, 1200).catch(e => console.warn('Supabase order insert note:', e.message));
  }

  console.log(`📦 Order placed & saved: ${newOrder.id} (${newOrder.tokenNumber}) for ${newOrder.studentName} (${cleanRoll})`);
  res.status(201).json({ success: true, order: newOrder });
});

// QR Code Generator on Demand
app.get('/api/qrcode', async (req, res) => {
  try {
    const text = req.query.text || 'KEC FOOD COURT';
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: 1,
      width: parseInt(req.query.width) || 170,
      color: { dark: '#0A0E17', light: '#FFFFFF' }
    });
    res.type('image/svg+xml').send(svg);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const order = ordersData.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });

  order.status = req.body.status;
  if (req.body.status === 'Completed') {
    order.deliveredTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    order.deliveredDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  saveJSON(ORDERS_FILE, ordersData);

  if (supabase) {
    withSupabaseTimeout(async () => {
      await supabase.from('orders').update({ status: req.body.status }).eq('id', req.params.id);
    }, 1200).catch(e => console.warn('Supabase status update note:', e.message));
  }

  res.json({ success: true, order });
});

// 6c. Claim / Link unassigned order to student account
app.patch('/api/orders/:id/claim', async (req, res) => {
  const { studentRoll, studentName, studentPhone } = req.body;
  ordersData = loadJSON(ORDERS_FILE, ordersData);
  const order = ordersData.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: "Order not found" });

  if (studentRoll) order.studentRoll = String(studentRoll).trim().toUpperCase();
  if (studentName) order.studentName = String(studentName).trim();
  if (studentPhone) order.studentPhone = String(studentPhone).trim();

  saveJSON(ORDERS_FILE, ordersData);

  // Also update student statistics in studentsData
  if (order.studentRoll) {
    let student = studentsData.find(s => s.rollNo && s.rollNo.toUpperCase() === order.studentRoll);
    if (student) {
      student.totalOrders = (student.totalOrders || 0) + 1;
      student.totalSpent = (student.totalSpent || 0) + (Number(order.totalAmount) || 0);
      saveJSON(STUDENTS_FILE, studentsData);
    }
  }

  res.json({ success: true, order });
});

// 7. Overall Dashboard Statistics
app.get('/api/stats', (req, res) => {
  const totalRevenue = ordersData
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeKitchens = shopsData.filter(s => s.isOpen).length;

  res.json({
    success: true,
    stats: {
      totalShops: shopsData.length,
      activeKitchens,
      totalOrders: ordersData.length,
      totalStudents: studentsData.length,
      totalRevenue
    }
  });
});

// 8. Student Login & Profile Registration (Stores in studentsData & Supabase Auth)
app.post('/api/auth/student-login', async (req, res) => {
  const { name, rollNo, mobile, department, year } = req.body;
  if (!rollNo || !name) {
    return res.status(400).json({ success: false, error: "Missing required fields (name, rollNo)" });
  }

  const cleanRoll = String(rollNo).trim().toUpperCase();
  const cleanName = String(name).trim();
  const cleanMobile = String(mobile || '').trim();
  const studentEmail = `${cleanRoll.toLowerCase()}@kec.ac.in`;

  // Upsert into local persistent studentsData
  let student = studentsData.find(s => s.rollNo && s.rollNo.toUpperCase() === cleanRoll);
  if (student) {
    student.name = cleanName;
    if (cleanMobile) student.mobile = cleanMobile;
    student.lastLogin = new Date().toISOString();
  } else {
    student = {
      id: `std_${cleanRoll}`,
      name: cleanName,
      rollNo: cleanRoll,
      mobile: cleanMobile,
      department: department || "Computer Science & Engineering",
      year: year || "Active Student",
      walletBalance: 850,
      avatar: "🎓",
      totalOrders: 0,
      totalSpent: 0,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    studentsData.unshift(student);
  }
  saveJSON(STUDENTS_FILE, studentsData);

  // Background sync with Supabase Auth
  if (supabaseAdmin) {
    withSupabaseTimeout(async () => {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existing = (userList?.users || []).find(u => 
        u.email === studentEmail || 
        u.user_metadata?.roll_no === cleanRoll
      );

      if (existing) {
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          user_metadata: {
            name: cleanName,
            roll_no: cleanRoll,
            mobile: cleanMobile,
            department: department || "Campus Diner",
            year: year || "Active Student",
            last_login_at: new Date().toISOString()
          }
        });
      } else {
        await supabaseAdmin.auth.admin.createUser({
          email: studentEmail,
          password: `kec_${cleanRoll.toLowerCase()}!`,
          email_confirm: true,
          user_metadata: {
            name: cleanName,
            roll_no: cleanRoll,
            mobile: cleanMobile,
            role: 'student',
            department: department || "Campus Diner",
            year: year || "Active Student",
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          }
        });
      }
    }, 1200).catch(err => console.warn('Supabase Auth student sync note:', err.message));
  }

  // Also sync to public.students table if accessible
  if (supabase) {
    withSupabaseTimeout(async () => {
      await supabase.from('students').upsert({
        id: `std_${cleanRoll}`,
        name: cleanName,
        roll_no: cleanRoll,
        mobile: cleanMobile,
        department: department || 'Campus Diner',
        year: year || 'Active Student',
        wallet_balance: 850,
        avatar: '🎓',
        last_login: new Date().toISOString()
      }, { onConflict: 'roll_no' });
    }, 1200).catch(() => {});
  }

  console.log(`✅ Student logged in & profile saved: ${cleanName} (${cleanRoll})`);
  res.json({
    success: true,
    student: {
      ...student,
      email: studentEmail
    }
  });
});

// 9. Fetch all registered students (Dataset of persons)
app.get('/api/students', (req, res) => {
  res.json({ success: true, count: studentsData.length, students: studentsData, source: 'disk_store' });
});

app.get('/api/auth/students', (req, res) => {
  res.json({ success: true, count: studentsData.length, students: studentsData, source: 'disk_store' });
});

// 10. Fetch specific student details and their orders
app.get('/api/students/:rollNo', (req, res) => {
  const cleanRoll = String(req.params.rollNo).trim().toUpperCase();
  const student = studentsData.find(s => s.rollNo && s.rollNo.toUpperCase() === cleanRoll);
  const studentOrders = ordersData.filter(o => o.studentRoll && o.studentRoll.trim().toUpperCase() === cleanRoll);

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  res.json({
    success: true,
    student,
    orders: studentOrders
  });
});

// Serve frontend static assets
app.use(express.static(__dirname));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KEC Food Court Express server running at:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://10.12.130.65:${PORT}`);
  });
}

export default app;

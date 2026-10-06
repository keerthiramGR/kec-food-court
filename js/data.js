// Initial seed data for KEC FOOD COURT
export const INITIAL_SHOPS = [
  {
    id: "shop-1",
    name: "Kongu Spice Kitchen",
    stallNumber: "Stall #01",
    tagline: "Authentic South Indian & Tandoor Delights",
    category: "Meals & Biryani",
    ownerName: "Murugan Selvam",
    email: "spice@kecfood.in",
    password: "owner123",
    rating: 4.8,
    reviewsCount: 342,
    prepTime: "12-15 mins",
    isOpen: true,
    accentColor: "#FF6B35",
    icon: "🔥",
    bannerImage: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
    menu: [
      { id: "m1-1", name: "Kongu Chicken Dum Biryani", price: 140, category: "Biryani", isVeg: false, isAvailable: true, badge: "Bestseller", prepTime: "10m", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80" },
      { id: "m1-2", name: "Malabar Parotta with Salna (2 pcs)", price: 60, category: "Breads", isVeg: true, isAvailable: true, badge: "Campus Fav", prepTime: "5m", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&auto=format&fit=crop&q=80" },
      { id: "m1-3", name: "Crispy Chicken 65 Boneless", price: 120, category: "Starters", isVeg: false, isAvailable: true, badge: "Hot", prepTime: "12m", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=300&auto=format&fit=crop&q=80" },
      { id: "m1-4", name: "Paneer Butter Masala Combo", price: 110, category: "Curries", isVeg: true, isAvailable: true, badge: "Veg Special", prepTime: "10m", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80" }
    ]
  },
  {
    id: "shop-2",
    name: "Canopy Bakes & Cafe",
    stallNumber: "Stall #02",
    tagline: "Artisan Coffee, Sandwiches & Desserts",
    category: "Cafe & Bakes",
    ownerName: "Priya Ranganathan",
    email: "canopy@kecfood.in",
    password: "owner123",
    rating: 4.9,
    reviewsCount: 520,
    prepTime: "8-10 mins",
    isOpen: true,
    accentColor: "#F59E0B",
    icon: "☕",
    bannerImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    menu: [
      { id: "m2-1", name: "Signature Iced Hazelnut Cold Coffee", price: 75, category: "Beverages", isVeg: true, isAvailable: true, badge: "Top Pick", prepTime: "5m", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-2", name: "Cheesy Grilled Paneer Sandwich", price: 85, category: "Snacks", isVeg: true, isAvailable: true, badge: "Chef Special", prepTime: "8m", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-3", name: "Crunchy Chicken Zinger Burger", price: 110, category: "Burgers", isVeg: false, isAvailable: true, badge: "Popular", prepTime: "12m", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80" },
      { id: "m2-4", name: "Warm Belgian Choco Lava Cake", price: 70, category: "Desserts", isVeg: true, isAvailable: true, badge: "Sweet", prepTime: "6m", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80" }
    ]
  },
  {
    id: "shop-3",
    name: "South Crest Tiffin Corner",
    stallNumber: "Stall #03",
    tagline: "Crisp Ghee Roasts & Morning/Evening Tiffins",
    category: "South Indian Tiffin",
    ownerName: "Ramesh Krishnan",
    email: "tiffin@kecfood.in",
    password: "owner123",
    rating: 4.7,
    reviewsCount: 290,
    prepTime: "6-8 mins",
    isOpen: true,
    accentColor: "#10B981",
    icon: "🥞",
    bannerImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    menu: [
      { id: "m3-1", name: "Crispy Ghee Podi Roast Dosa", price: 70, category: "Tiffin", isVeg: true, isAvailable: true, badge: "Crispy", prepTime: "7m", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80" },
      { id: "m3-2", name: "Mini Tiffin Combo (Idli, Vada, Kesari)", price: 90, category: "Combos", isVeg: true, isAvailable: true, badge: "Value Combo", prepTime: "5m", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80" },
      { id: "m3-3", name: "Golden Medu Vada (2 pcs) with Sambar", price: 40, category: "Tiffin", isVeg: true, isAvailable: true, badge: "Quick Bite", prepTime: "3m", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80" },
      { id: "m3-4", name: "Hot Poori Masala (3 pcs)", price: 65, category: "Tiffin", isVeg: true, isAvailable: true, badge: "Fresh", prepTime: "8m", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&auto=format&fit=crop&q=80" }
    ]
  },
  {
    id: "shop-4",
    name: "Fresh Oasis Juice & Shakes",
    stallNumber: "Stall #04",
    tagline: "Natural Cold-Pressed Juices, Shakes & Bowls",
    category: "Juices & Shakes",
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
      { id: "m4-1", name: "Alphonso Mango Thick Shake", price: 80, category: "Shakes", isVeg: true, isAvailable: true, badge: "Seasonal", prepTime: "5m", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=300&auto=format&fit=crop&q=80" },
      { id: "m4-2", name: "Fresh Mint Lime Cooler", price: 35, category: "Juices", isVeg: true, isAvailable: true, badge: "Refreshing", prepTime: "3m", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80" },
      { id: "m4-3", name: "Oreo Nutella Freak Shake", price: 95, category: "Shakes", isVeg: true, isAvailable: true, badge: "Loaded", prepTime: "6m", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80" }
    ]
  },
  {
    id: "shop-5",
    name: "Wok & Roll Street Chinese",
    stallNumber: "Stall #05",
    tagline: "Sizzling Woks, Momos & Noodles",
    category: "Chinese & Asian",
    ownerName: "Karthik Raja",
    email: "wok@kecfood.in",
    password: "owner123",
    rating: 4.6,
    reviewsCount: 275,
    prepTime: "10-12 mins",
    isOpen: true,
    accentColor: "#EC4899",
    icon: "🍜",
    bannerImage: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80",
    menu: [
      { id: "m5-1", name: "Schezwan Veg Fried Rice", price: 90, category: "Rice", isVeg: true, isAvailable: true, badge: "Spicy", prepTime: "10m", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80" },
      { id: "m5-2", name: "Chicken Steamed Momos (6 pcs)", price: 100, category: "Momos", isVeg: false, isAvailable: true, badge: "Bestseller", prepTime: "8m", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80" },
      { id: "m5-3", name: "Chilli Paneer Dry / Gravy", price: 110, category: "Starters", isVeg: true, isAvailable: true, badge: "Must Try", prepTime: "12m", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&auto=format&fit=crop&q=80" }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: "KEC-1092",
    tokenNumber: "TK-42",
    studentName: "Aravind Kumar",
    studentRoll: "21EC108",
    shopId: "shop-1",
    shopName: "Kongu Spice Kitchen",
    stallNumber: "Stall #01",
    items: [
      { name: "Kongu Chicken Dum Biryani", qty: 1, price: 140 },
      { name: "Crispy Chicken 65 Boneless", qty: 1, price: 120 }
    ],
    totalAmount: 260,
    status: "Kitchen Preparing", // "Placed", "Kitchen Preparing", "Ready at Counter", "Completed"
    diningType: "Dine-In",
    timestamp: "10 mins ago",
    createdTime: Date.now() - 600000
  },
  {
    id: "KEC-1093",
    tokenNumber: "TK-43",
    studentName: "Sneha Reddy",
    studentRoll: "22CS215",
    shopId: "shop-2",
    shopName: "Canopy Bakes & Cafe",
    stallNumber: "Stall #02",
    items: [
      { name: "Signature Iced Hazelnut Cold Coffee", qty: 2, price: 150 },
      { name: "Cheesy Grilled Paneer Sandwich", qty: 1, price: 85 }
    ],
    totalAmount: 235,
    status: "Ready at Counter",
    diningType: "Takeaway",
    timestamp: "4 mins ago",
    createdTime: Date.now() - 240000
  },
  {
    id: "KEC-1094",
    tokenNumber: "TK-44",
    studentName: "Aravind Kumar",
    studentRoll: "21EC108",
    shopId: "shop-4",
    shopName: "Fresh Oasis Juice & Shakes",
    stallNumber: "Stall #04",
    items: [
      { name: "Alphonso Mango Thick Shake", qty: 1, price: 80 }
    ],
    totalAmount: 80,
    status: "Placed",
    diningType: "Takeaway",
    timestamp: "Just now",
    createdTime: Date.now() - 60000
  }
];

export const DEFAULT_USERS = {
  superAdmin: {
    role: "super_admin",
    name: "Food Court Administrator",
    email: "admin@kec.ac.in",
    password: "admin123",
    designation: "Director of Campus Facilities",
    avatar: "👑"
  },
  demoStudent: {
    role: "student",
    name: "Aravind Kumar",
    rollNo: "21EC108",
    department: "Electronics & Communication Engg",
    year: "Final Year",
    email: "student@kec.ac.in",
    password: "student123",
    walletBalance: 850,
    avatar: "🎓"
  }
};

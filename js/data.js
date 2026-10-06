// Initial seed data for KEC FOOD COURT (Food and Juice Outlets)
export const INITIAL_SHOPS = [
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

export const INITIAL_ORDERS = [
  {
    id: "KEC-1092",
    tokenNumber: "TK-42",
    studentName: "Aravind Kumar",
    studentRoll: "21EC108",
    shopId: "shop-1",
    shopName: "Food",
    stallNumber: "Stall #01",
    items: [
      { name: "Kongu Chicken Dum Biryani", qty: 1, price: 140 },
      { name: "Crispy Chicken 65 Boneless", qty: 1, price: 120 }
    ],
    totalAmount: 260,
    status: "Kitchen Preparing",
    diningType: "Dine-In",
    timestamp: "10 mins ago",
    createdTime: Date.now() - 600000
  },
  {
    id: "KEC-1093",
    tokenNumber: "TK-43",
    studentName: "Aravind Kumar",
    studentRoll: "21EC108",
    shopId: "shop-2",
    shopName: "Juice",
    stallNumber: "Stall #02",
    items: [
      { name: "Alphonso Mango Thick Shake", qty: 1, price: 80 }
    ],
    totalAmount: 80,
    status: "Ready at Counter",
    diningType: "Takeaway",
    timestamp: "4 mins ago",
    createdTime: Date.now() - 240000
  }
];

export const DEFAULT_USERS = {
  superAdmin: {
    role: "super_admin",
    name: "Dr. Balakrishnan",
    email: "admin@kec.ac.in",
    password: "admin123",
    designation: "Director of Food Court Facilities",
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

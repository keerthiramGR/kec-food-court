# 🍽️ KEC FOOD COURT - Smart Campus Dining Platform

A smart food court web application built for Kongu Engineering College featuring a 3-4s animated logo splash intro, **Tailwind CSS v3**, **Light & Dark Mode**, a **Node.js Express backend**, live order token management, and 3 multi-role portals.

---

## ✨ Key Highlights

- **🌗 Light Mode & Dark Mode**:
  - Instant toggle in navigation bar (☀️ Sun / 🌙 Moon) with smooth CSS transitions.
  - User preference persisted in `localStorage`.
  - Zero-flash startup theme script.
  - Tailored color palettes for both modes (vibrant obsidian & saffron in dark mode; crisp clean white & warm amber in light mode).
- **🎨 Tailwind CSS v3 & Modern UI/UX**:
  - Tailwind CSS v3 integration with extended brand color tokens and custom font families (`Outfit`, `Plus Jakarta Sans`, `Space Grotesk`).
  - Glassmorphic translucent cards (`backdrop-blur`), subtle borders, hover micro-animations, and dynamic status badges.
- **3.6s Animated Logo Splash Screen**:
  - High-definition SVG crest with steaming gourmet cloche, orbit glow, and rising culinary vapor paths.
  - Linear loading progress bar (0% -> 100%) syncing live campus counters.
  - Smooth cinematic zoom-fade transition revealing the main web application.
  - "Skip Intro" option and interactive "✨ Replay Intro" button in the navbar.
- **3 Distinct Portals & Logins**:
  1. 🎓 **Student Portal**:
     - Browse campus stalls (*Kongu Spice Kitchen*, *Canopy Bakes & Cafe*, *South Crest Tiffin*, *Fresh Oasis Juices*, *Wok & Roll Chinese*).
     - Filter by category & search meals in real-time.
     - View stall menus with veg/non-veg indicators, prices, and preparation times.
     - Interactive Tray / Cart with Dine-In vs Takeaway preferences.
     - Live Campus Order Tokens board tracking orders from *Placed* → *Kitchen Preparing* → *Ready at Counter* → *Delivered*.
  2. 🏪 **Shop Owner Portal**:
     - Stall dashboard with today's revenue (₹), total orders, and active cooking counters.
     - Live Stall Open / Closed toggle switch.
     - Real-time Kitchen Order Kanban (Placed -> Preparing -> Ready at Counter -> Picked Up).
     - Menu & Stock Availability Manager with instant In-Stock / Sold-Out toggles.
     - "Add New Dish" wizard to expand stall menus dynamically.
  3. 👑 **Super Admin Portal**:
     - Campus Food Court Command Center with aggregate metrics and stall monitoring.
     - **Provision New Shop & Generate Portal**: Register stall name, stall number, category, owner details, login email, and initial signature dish.
     - Automatically generates portal access credentials with a 1-click **"🚀 Log In as this Shop Owner Now"** feature and copyable credentials receipt card.
     - Master Stalls Directory with direct access testing.
- **⚡ Node.js Express REST API Backend**:
  - REST endpoints for shops (`/api/shops`), menus (`/api/shops/:id/menu`), orders (`/api/orders`), and analytics (`/api/stats`).
  - Dual sync architecture: Instant client-side state with background Node.js server persistence.

---

## 🔑 Demo Login Credentials

| Role | Email / Identifier | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@kec.ac.in` | `student123` | Browse stalls, add to tray, generate token, live tracker |
| **Shop Owner** | `spice@kecfood.in` *(or any created stall)* | `owner123` | Live kitchen Kanban, stall open/closed switch, dish stock toggle |
| **Super Admin** | `admin@kec.ac.in` | `admin123` | Add new stalls, generate owner portals & credentials, campus analytics |

*(Each login modal also includes 1-click "Auto-Fill" demo buttons for instant testing).*

---

## 🚀 Running Locally

1. Clone repository:
   ```bash
   git clone https://github.com/keerthiramGR/kec-food-court.git
   cd kec-food-court
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js Express server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your web browser.

---

## 🛠️ Tech Stack

- **Backend**: Node.js & Express with RESTful endpoints (`/api/shops`, `/api/orders`, `/api/stats`)
- **Styling**: Tailwind CSS v3 + Custom CSS Variables & Glassmorphism Design Tokens
- **Themes**: System & User-selected Dark / Light Mode with localStorage persistence
- **Vector Graphics**: Custom Animated SVG logo with stroke dash-array and drop-shadow filters
- **State & Logic**: ES Modules with reactive LocalStorage and async API synchronization

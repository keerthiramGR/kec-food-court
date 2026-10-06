# 🍽️ KEC FOOD COURT - Smart Campus Dining Platform

A smart food court web application built for Kongu Engineering College with a 3-4s animated logo splash intro, responsive dining experience, live order token management, and multi-role portals.

---

## ✨ Key Highlights

- **3.6s Animated Logo Splash Screen**:
  - High-definition SVG crest with steaming gourmet cloche, orbit glow, and rising culinary vapor paths.
  - Linear loading progress bar (0% -> 100%) with live campus kitchen network connection status.
  - Smooth cinematic zoom-fade transition revealing the main web application.
  - "Skip Intro" option and interactive "Replay Intro" button in the navbar.
- **3 Distinct Portals & Logins**:
  1. 🎓 **Student Portal**:
     - Browse campus stalls (Kongu Spice Kitchen, Canopy Bakes & Cafe, South Crest Tiffin, Fresh Oasis Juices, Wok & Roll Chinese).
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
     - Automatically generates portal access credentials with a 1-click **"Log In as this Shop Owner Now"** feature and copyable credentials receipt card.
     - Master Stalls Directory with direct access testing.

---

## 🔑 Demo Login Credentials

| Role | Email / Identifier | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@kec.ac.in` | `student123` | Browse stalls, add to tray, generate token, live tracker |
| **Shop Owner** | `spice@kecfood.in` (or any created stall) | `owner123` | Live kitchen Kanban, stall open/closed switch, dish stock toggle |
| **Super Admin** | `admin@kec.ac.in` | `admin123` | Add new stalls, generate owner portals & credentials, campus analytics |

*(Each login modal also includes 1-click "Auto-Fill" demo buttons for instant testing).*

---

## 🚀 Running Locally

1. Clone repository:
   ```bash
   git clone https://github.com/keerthiramGR/kec-food-court.git
   cd kec-food-court
   ```
2. Start the local server:
   ```bash
   npm start
   ```
   *or*
   ```bash
   node server.js
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🛠️ Tech Stack

- **Structure & Semantics**: Semantic HTML5 with accessible dialog modals
- **Design & Styling**: Vanilla CSS with custom properties, glassmorphism, responsive CSS grid/flexbox, keyframe animations
- **Vector Graphics**: Animated SVG logo with stroke dash-array and drop-shadow filters
- **State & Logic**: ES Modules with reactive LocalStorage persistence
- **Local Server**: Zero-dependency Node.js HTTP server supporting MIME types and ES Modules

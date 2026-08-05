# CafeQR — Smart Digital Menu & Table Ordering System

> Production-quality, multi-tenant ready full-stack web application for QR-based digital cafe ordering, kitchen management (KDS), and administrative analytics.

---

## 🌟 Key Features

### 1. Dine-in Customer Mobile Menu (0-Friction Guest Experience)
* **Instant QR Access**: Scans table QR token (`/menu?table=SECURE_TOKEN`) to open branded digital menu in mobile browser.
* **No Account Required**: Customers browse food categories, search items, customize notes, and place orders without creating an account.
* **Search & Category Navigation**: Filter food items by categories (*Pizza, Burgers, Sandwiches, Starters, Main Course, Drinks, Desserts*) or search keywords.
* **Food Cards & Detail Modal**: Images, prices, veg/non-veg indicators, chef specials, preparation estimates, and special instructions.
* **Sticky Bottom Cart & Slide-Over Drawer**: Real-time cart calculations, subtotal, tax breakdown, optional name/phone, and choice of payment (`Pay at Counter`, `Cash on Delivery`).
* **Live Order Tracking**: Customer order tracking page (`/order/:orderToken`) with live status stepper (`PENDING` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `COMPLETED`).

### 2. Kitchen Display System (KDS)
* **Kanban-Style Live Board**: 4 real-time status columns (`NEW`, `ACCEPTED`, `PREPARING`, `READY`).
* **Elapsed Time & Urgency**: Visual indicators flashing orange/red for long-pending orders.
* **Single-Tap Progression**: Kitchen staff advance order status with one click (`Accept` -> `Start Preparing` -> `Mark Ready` -> `Complete`).

### 3. Cafe Admin & Management Portal
* **Analytics Dashboard**: Today's revenue, order breakdown metrics, 7-day revenue trend chart via Recharts, and top-selling food items.
* **Product & Category CRUD**: Manage food titles, prices, descriptions, images, categories, availability toggles, and featured flags.
* **Table & QR Management**: Create seating tables with guest capacity, generate cryptographically random 256-bit entropy QR tokens, preview QR codes, and trigger printable QR card layouts.
* **Staff Management**: Create role-based accounts (`ADMIN` or `KITCHEN`).
* **Store Settings**: Configure Cafe name, logo, address, contact details, tax rate %, and currency symbol.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Icons), Recharts (Analytics Charts).
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, JSON Web Tokens (JWT), `bcryptjs` (Password Hashing), `qrcode` (QR Generator), `express-rate-limit`, Zod (Validation).
* **Database**: MySQL 8.0+.
* **Architecture**: Monorepo split into decoupled `/frontend` and `/backend` packages connected via RESTful JSON API endpoints.

---

## 📁 Project Structure

```
cafe-module/
├── docs/
│   ├── product.md
│   ├── ui.md
│   └── engineering.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       (Sidebar, AdminHeader, StatCard, QRPreviewModal)
│   │   │   ├── common/      (Button, Input, Modal, StatusBadge, ConfirmDialog)
│   │   │   ├── customer/    (Header, SearchBar, CategoryTabs, ProductCard, CartDrawer, StickyCartBar)
│   │   │   └── kitchen/     (KitchenOrderCard)
│   │   ├── pages/           (CustomerMenuPage, CustomerOrderTrackerPage, LoginPage, AdminDashboardPage, KitchenKDSPage)
│   │   ├── services/        (api.ts API client)
│   │   ├── types/           (TypeScript definitions)
│   │   ├── App.tsx          (Main routing controller)
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/          (Prisma client instance)
│   │   ├── controllers/     (public, auth, admin, kitchen)
│   │   ├── middleware/      (auth, errorHandler, rateLimiter)
│   │   ├── routes/          (public, auth, admin, kitchen)
│   │   ├── validators/      (auth, order, product, category)
│   │   └── server.ts        (Main Express server)
│   └── package.json
├── prisma/
│   ├── schema.prisma        (Relational MySQL schema)
│   └── seed.ts              (Database seed script)
├── tests/
│   ├── unit/                (orderCalculation.test.ts)
│   └── integration/         (priceTampering.test.ts)
├── .env.example
└── README.md
```

---

## 🚀 Setup & Installation Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Update your `.env` settings:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/cafeqr"
JWT_SECRET="super-secret-jwt-key-change-in-production-cafeqr-2026"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 2. Database Migration & Seeding

Install dependencies and run database push & seed commands:

```bash
# Push Prisma Schema to MySQL Database
npx prisma db push --schema=./prisma/schema.prisma

# Seed Initial Cafe, Staff Accounts, Tables & Products
npx ts-node ./prisma/seed.ts
```

#### Default Development Login Credentials (Created by Seed):
* **Admin Login**: `admin@cafeqr.com` / `admin123`
* **Kitchen Staff Login**: `kitchen@cafeqr.com` / `kitchen123`

---

## 🏃 Running the Application

### Running Backend Server
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:5000
```

### Running Frontend Application
```bash
cd frontend
npm install
npm run dev
# Frontend dev server will start on http://localhost:5173
```

---

## 🧪 Running Security & Calculation Tests

To verify order math calculation and server-side price tampering defense:

```bash
# Run unit test
npx ts-node tests/unit/orderCalculation.test.ts

# Run price tampering defense integration test
npx ts-node tests/integration/priceTampering.test.ts
```

---

## 🔒 Security Architecture Highlights

1. **Server-Side Price Authority**: Item prices sent in client request bodies are strictly ignored. The backend queries live database prices for line items, taxes, and totals.
2. **256-Bit Entropy QR Tokens**: QR code table URLs use cryptographically generated random tokens (e.g. `/menu?table=tok_9f8a3c...`). Sequential integer table IDs are barred.
3. **Password Security & JWT Auth**: User passwords are salt-hashed via `bcryptjs` (rounds = 10); API management routes are protected by role-based JWT authentication middleware.
4. **Historical Price Snapshots**: `OrderItem` records store `productNameSnapshot` and `priceSnapshot` to preserve accounting accuracy even if menu prices change later.

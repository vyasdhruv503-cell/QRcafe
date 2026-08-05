# CafeQR — Smart Digital Menu & Ordering System
## Product Specification Document (product.md)

---

### 1. Executive Summary & Vision

**CafeQR** is a modern, production-grade, multi-tenant-ready Digital Cafe Menu and Table Ordering System. It bridges the gap between dine-in customers and cafe operations by replacing static paper menus with dynamic, QR-driven mobile ordering interfaces, connected in real-time to an administrative backend and kitchen display system.

The core objective is to deliver a friction-free ordering experience for customers—requiring **no account registration or app installation**—while providing cafe owners and kitchen staff with real-time order processing, menu management, seating QR management, and financial reporting.

---

### 2. User Personas & Target Roles

#### A. The Customer (Dine-in Guest)
* **Context**: Seated at a specific table inside the cafe.
* **Needs**: Instant menu access via QR scan, fast product search/filtering by category, clear visual food representation, transparent cart breakdown (subtotal, tax, discount, total), simple guest checkout, and live order status tracking.
* **Constraints**: Does NOT want to download an app or fill out lengthy registration forms.

#### B. Kitchen Staff
* **Context**: Working in a fast-paced environment behind the counter / kitchen line.
* **Needs**: Real-time high-visibility Kanban board of active incoming orders organized by lifecycle stages (`NEW`, `ACCEPTED`, `PREPARING`, `READY`), single-click status updates, elapsed time timers per order, and clear item/table breakdown.

#### C. Cafe Admin / Owner
* **Context**: Managing daily operations, menu pricing, inventory availability, table arrangements, staff access, and financial metrics.
* **Needs**: Secure role-based dashboard, full CRUD for products and categories, instant table QR generation/regeneration and printable templates, staff management, sales analytics (daily, weekly, monthly), and store-level settings (tax rates, currency, store info).

---

### 3. Key Product Features & Scope

#### 3.1 Secure QR-Based Table Identification
* Unique, cryptographically generated random tokens per table (e.g., `/menu?table=tok_9f8a3c...`).
* Token validation on request: resolves `Cafe` and `CafeTable` details server-side.
* Protection against token guessing and table ID enumeration (`/menu?table=1` is explicitly prohibited).

#### 3.2 Dynamic Customer Digital Menu
* **Branded Header**: Displays Cafe logo, Cafe name, and current Table Number.
* **Live Search & Category Navigation**: Filterable by dynamic backend categories (*Pizza, Burgers, Sandwiches, Starters, Main Course, Drinks, Desserts*).
* **Rich Product Cards**: High-res image, title, description, price, availability status tag, featured badge, and quick add/quantity controls.
* **Product Detail Modal**: Full view with special item instructions/notes, veg/non-veg tags, preparation estimates, and quantity adjustment.
* **Sticky Cart Bar & Slide-out Cart Drawer**: Displays real-time item counts, subtotal, tax calculation, optional instructions, and checkout trigger.
* **Guest Checkout**: Requires optional Name and Phone number only. No password or registration required.

#### 3.3 Server-Calculated Order Engine
* **Tamper-Proof Price Validation**: Frontend submits item IDs and quantities; backend fetches live prices from database to calculate line items, subtotal, tax, discounts, and grand total.
* **Historical Price Snapshots**: `OrderItem` records store `productNameSnapshot` and `priceSnapshot` to preserve historical order integrity if menu prices change later.
* **Order Status Lifecycle**:
  `PENDING` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `COMPLETED` (or `CANCELLED`).
* **Payment Status Handling**: Initial support for `CASH` and `PAY_AT_COUNTER` with schema prepared for `ONLINE` (Stripe/Razorpay) integrations.

#### 3.4 Kitchen Display System (KDS)
* **Kanban-Style Live Dashboard**: Distinct visual columns for order states.
* **Quick Status Transitions**: One-tap progress updates notifying customer tracking screens.
* **Visual Urgency & Elapsed Time**: Color-coded time indicators for long-pending orders.

#### 3.5 Cafe Management & Admin Portal
* **Dashboard Overview**: Metrics cards (Sales, Total Orders, Active Orders, Item Counts) + Recharts analytics.
* **Product & Category CRUD**: Full management including availability toggle, featured flag, price edits, category reassignment safeguards.
* **Table & QR Management**: Table creation, capacity specification, token regeneration, live QR code preview, printable PDF/HTML layout download.
* **Reports & Analytics**: Time-based breakdown (Today, Yesterday, 7 Days, 30 Days, Custom Range) for revenue, category distribution, and top-selling items.
* **Cafe Settings**: Store name, logo, address, tax rate (GST/VAT %), currency symbol, and business hours.

---

### 4. Multi-Tenant / Multi-Cafe Scalability

Although initially deployed for a primary cafe ("My Cafe"), the database model and software architecture are strictly isolated by `cafeId`.
* All major domain tables (`users`, `categories`, `products`, `cafe_tables`, `orders`, `settings`) contain indexed `cafeId` foreign keys.
* Middleware enforces tenant isolation: API requests within admin routes automatically scope database queries to the authenticated user's `cafeId`.

---

### 5. Success Metrics & Non-Functional Requirements

| NFR Metric | Target Requirement |
| :--- | :--- |
| **Response Time** | Menu load API `< 150ms`; Order submission `< 300ms` |
| **Security** | Zero exposed secrets in client code; 100% server-side order calculation |
| **Usability** | 100% responsive customer UI optimized for screen sizes 320px–1440px+ |
| **Data Integrity** | Foreign key constraints on all relations; historical order price snapshots |
| **Availability** | Graceful error fallbacks for invalid QR, empty categories, network errors |

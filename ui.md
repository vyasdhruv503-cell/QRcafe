# CafeQR — Smart Digital Menu & Ordering System
## UI & Design System Specification (ui.md)

---

### 1. Design Aesthetics & Visual Identity

**CafeQR** features a warm, modern cafe atmosphere balanced with sleek digital precision. It deliberately avoids flat generic designs in favor of rich micro-interactions, subtle glassmorphism, soft elevated shadows, and harmonious warm color palettes.

#### 1.1 Color Palette & Theme Tokens
* **Primary / Accent**: Warm Amber & Espresso (`#D97706` / `#B45309` / `#78350F`)
* **Background Light (Customer)**: Warm Vanilla / Cream Soft Gray (`#FFFDF9` / `#F8F6F0`)
* **Dark Mode / Admin Surface**: Deep Charcoal Slate (`#0F172A` / `#1E293B` / `#334155`)
* **Status Badges**:
  * `PENDING`: Warm Amber (`#F59E0B`)
  * `ACCEPTED` / `PREPARING`: Electric Indigo (`#6366F1`)
  * `READY`: Emerald Green (`#10B981`)
  * `COMPLETED`: Muted Slate (`#64748B`)
  * `CANCELLED`: Rose Red (`#EF4444`)

#### 1.2 Typography
* **Primary Font**: `Inter` or `Outfit` (sans-serif, loaded via Google Fonts) for headings and body.
* **Weight Hierarchy**:
  * Heading 1 (Page Titles): `24px` to `30px`, Bold (`700`)
  * Heading 2 (Section Titles): `18px` to `20px`, SemiBold (`600`)
  * Body Text: `14px` to `16px`, Regular (`400`)
  * Metadata / Captions: `12px` to `13px`, Medium (`500`)

#### 1.3 Surface Elevation & Component Stylings
* **Cards**: Border radius `16px` (`rounded-2xl`), subtle border (`border border-amber-950/5`), shadow (`shadow-sm hover:shadow-md transition-shadow`).
* **Buttons**: Border radius `12px` (`rounded-xl`), active scale press effect (`active:scale-95 transition-transform`).

---

### 2. Component Architecture & Library

To maintain code readability and prevent monolithic files, the UI is built strictly with reusable modular components:

```
src/components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── StatusBadge.tsx
│   ├── ConfirmDialog.tsx
│   └── Toast.tsx
├── customer/
│   ├── Header.tsx
│   ├── TableIndicator.tsx
│   ├── SearchBar.tsx
│   ├── CategoryTabs.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetailModal.tsx
│   ├── CartDrawer.tsx
│   └── StickyCartBar.tsx
├── admin/
│   ├── Sidebar.tsx
│   ├── AdminHeader.tsx
│   ├── StatCard.tsx
│   ├── DataTable.tsx
│   ├── QRPreviewModal.tsx
│   └── ProductFormModal.tsx
└── kitchen/
    ├── KitchenColumn.tsx
    ├── KitchenOrderCard.tsx
    └── OrderTimer.tsx
```

---

### 3. Screen Wireframes & Layout Structures

#### 3.1 Customer Mobile Menu Interface (`/menu?table=SECURE_TOKEN`)

```
+---------------------------------------------------+
|  [Logo]  MY CAFE                    [Table #04]   |  <- Header
+---------------------------------------------------+
|  🔍  Search menu items...                        |  <- Search Bar
+---------------------------------------------------+
| [All] [Pizza] [Burgers] [Drinks] [Desserts]       |  <- Horizontal Scroll Tabs
+---------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  | [Food Img]  Artisanal Cheese Burger   ₹249  |  |  <- Product Card
|  |             Brioche bun, aged cheddar       |  |
|  |             [+ ADD]                         |  |
|  +---------------------------------------------+  |
|                                                   |
|  +---------------------------------------------+  |
|  | [Food Img]  Iced Vanilla Latte        ₹149  |  |
|  |             Espresso, vanilla bean, milk    |  |
|  |             [-  1  +]                       |  |
|  +---------------------------------------------+  |
|                                                   |
+---------------------------------------------------+
|  🛒  2 Items • ₹398               [View Cart ->]  |  <- Sticky Bottom Bar
+---------------------------------------------------+
```

#### 3.2 Customer Cart & Checkout Slide-Over Drawer

* **Header**: Cart overview & option to clear.
* **Item List**: Each item with image thumbnail, title, price, quantity controls `[-] N [+]`, sub-note, and delete icon.
* **Special Notes Field**: Textarea for kitchen instructions ("Less spicy", "No ice").
* **Payment Summary**:
  * Subtotal: ₹398.00
  * Tax (5% GST): ₹19.90
  * **Grand Total**: **₹417.90**
* **Customer Info Fields**: Optional Name & Phone number.
* **Payment Method**: Radio selection (`Cash on Delivery`, `Pay at Counter`).
* **CTA Button**: Full-width primary button `"Place Order (₹417.90)"`.

#### 3.3 Customer Live Order Tracker Screen (`/order/:orderToken`)

* **Hero Card**: Order Number (e.g., `#105`), Table Number (e.g., `Table 04`), Total Amount.
* **Live Stepper Visual**:
  `Order Received (✓)` → `Accepted (✓)` → `Preparing (● Animated Pulse)` → `Ready ( )` → `Completed ( )`
* **Order Item Summary**: Itemized list with quantities and notes.
* **Action**: "Back to Menu" or "Need Help?".

---

#### 3.4 Admin Desktop Portal (`/admin/*`)

```
+------------------+--------------------------------------------------------+
|  CAFEQR ADMIN    | TopBar: Cafe Name | Notifications | Admin Profile      |
+------------------+--------------------------------------------------------+
| 📊 Dashboard     | [ Today's Sales ] [ Total Orders ] [ Pending Orders ]  |
| 📦 Products      |   ₹14,850           48               3                 |
| 📁 Categories    |--------------------------------------------------------|
| 🪑 Tables & QRs  | [ Recharts Sales Chart ]  | [ Popular Items Table ]    |
| 🧾 Orders        |                           |                            |
| 👨‍🍳 Kitchen View  |                           |                            |
| 👥 Staff         |                           |                            |
| 📈 Reports       |                           |                            |
| ⚙️ Settings      |                           |                            |
+------------------+--------------------------------------------------------+
```

#### 3.5 Kitchen Display System (`/kitchen`)

* **Layout**: 4-column responsive Kanban grid (`NEW`, `ACCEPTED`, `PREPARING`, `READY`).
* **Order Cards**:
  * Big Order ID (`#105`) + Table Name (`Table 04`).
  * Live Elapsed Timer (e.g. `4 mins ago`, flashes orange if > 15 mins).
  * Bulleted Items List: `2x Cheese Burger (Note: No pickles)`, `1x Cold Coffee`.
  * Status Transition Button: `[Accept Order]` -> `[Start Preparing]` -> `[Mark Ready]` -> `[Complete]`.

---

### 4. Table QR Print Template Layout

When an Admin clicks "Print QR Code", the browser renders a print-optimized clean card:

```
+------------------------------------+
|                                    |
|             [ CAFE LOGO ]          |
|                MY CAFE             |
|                                    |
|             TABLE  04              |
|                                    |
|         +----------------+         |
|         |                |         |
|         |   [QR CODE]    |         |
|         |                |         |
|         +----------------+         |
|                                    |
|     Scan to View Menu & Order      |
|    Powered by CafeQR Digital Menu  |
+------------------------------------+
```
* **CSS Print Styling**: `@media print { body { visibility: hidden; } .printable-qr { visibility: visible; } }`.

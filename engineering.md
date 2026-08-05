# CafeQR — Smart Digital Menu & Ordering System
## Engineering & Technical Architecture Specification (engineering.md)

---

### 1. Technology Stack Architecture

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Icons), Recharts (Analytics Charts), Zod (Validation).
* **Backend**: Node.js, Express, TypeScript, Prisma ORM, JSON Web Tokens (JWT), bcryptjs (Password Hashing), qrcode (QR Image Generator).
* **Database**: MySQL 8.0+.
* **Module Structure**: Monorepo split into decoupled `/frontend` and `/backend` packages connected via RESTful JSON API endpoints.

---

### 2. Database Architecture & Prisma Schema Definition

The database is normalized to 3NF standards, multi-tenant ready with `cafeId` isolation, and equipped with price snapshot fields to guarantee historical accounting integrity.

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  KITCHEN
}

enum OrderStatus {
  PENDING
  ACCEPTED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  CASH
  PAY_AT_COUNTER
  ONLINE
}

model Cafe {
  id          String       @id @default(uuid())
  name        String
  logo        String?      @db.Text
  address     String?      @db.Text
  phone       String?
  email       String?
  taxRate     Decimal      @default(5.00) @db.Decimal(5, 2)
  currency    String       @default("₹")
  openHours   String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  users       User[]
  categories  Category[]
  products    Product[]
  tables      CafeTable[]
  orders      Order[]

  @@map("cafes")
}

model User {
  id        String   @id @default(uuid())
  cafeId    String
  email     String   @unique
  password  String
  name      String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cafe      Cafe     @relation(fields: [cafeId], references: [id], onDelete: Cascade)

  @@index([cafeId])
  @@map("users")
}

model Category {
  id          String    @id @default(uuid())
  cafeId      String
  name        String
  description String?   @db.Text
  image       String?   @db.Text
  sortOrder   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  cafe        Cafe      @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  products    Product[]

  @@index([cafeId])
  @@map("categories")
}

model Product {
  id              String      @id @default(uuid())
  cafeId          String
  categoryId      String
  name            String
  description     String?     @db.Text
  price           Decimal     @db.Decimal(10, 2)
  image           String?     @db.Text
  isAvailable     Boolean     @default(true)
  isFeatured      Boolean     @default(false)
  preparationTime Int?        // in minutes
  isVeg           Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  cafe            Cafe        @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  orderItems      OrderItem[]

  @@index([cafeId])
  @@index([categoryId])
  @@map("products")
}

model CafeTable {
  id        String   @id @default(uuid())
  cafeId    String
  number    String   // e.g. "Table 01"
  capacity  Int      @default(4)
  qrToken   String   @unique // Cryptographically secure random token
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cafe      Cafe     @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  orders    Order[]

  @@index([cafeId])
  @@map("cafe_tables")
}

model Order {
  id            String        @id @default(uuid())
  orderNumber   Int           @default(autoincrement())
  orderToken    String        @unique @default(uuid())
  cafeId        String
  tableId       String
  customerName  String?
  customerPhone String?
  subtotal      Decimal       @db.Decimal(10, 2)
  tax           Decimal       @db.Decimal(10, 2)
  discount      Decimal       @default(0.00) @db.Decimal(10, 2)
  total         Decimal       @db.Decimal(10, 2)
  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod PaymentMethod @default(PAY_AT_COUNTER)
  orderStatus   OrderStatus   @default(PENDING)
  notes         String?       @db.Text
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  cafe          Cafe          @relation(fields: [cafeId], references: [id], onDelete: Cascade)
  table         CafeTable     @relation(fields: [tableId], references: [id], onDelete: Restrict)
  orderItems    OrderItem[]
  payments      Payment[]

  @@index([cafeId])
  @@index([tableId])
  @@index([orderToken])
  @@map("orders")
}

model OrderItem {
  id                  String   @id @default(uuid())
  orderId             String
  productId           String
  productNameSnapshot String
  priceSnapshot       Decimal  @db.Decimal(10, 2)
  quantity            Int
  subtotal            Decimal  @db.Decimal(10, 2)
  specialNote         String?  @db.Text
  createdAt           DateTime @default(now())

  order               Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product             Product  @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model Payment {
  id            String        @id @default(uuid())
  orderId       String
  amount        Decimal       @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  status        PaymentStatus
  transactionId String?
  createdAt     DateTime      @default(now())

  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("payments")
}
```

---

### 3. RESTful API Endpoints & Request/Response Contracts

#### 3.1 Customer Public Endpoints (No Authentication Required)
* `GET /api/public/menu/:tableToken`
  * Validates QR token. Returns Cafe info, Table info, list of active categories & available products.
* `POST /api/public/orders`
  * Body: `{ tableToken: string, customerName?: string, customerPhone?: string, notes?: string, items: Array<{ productId: string, quantity: number, specialNote?: string }> }`
  * Response: `{ orderToken: string, orderNumber: number, total: number, status: string }`
  * **Server-side validation**: Fetches DB prices for each item, calculates line subtotals, applies cafe tax rate, computes final total, creates snapshots.
* `GET /api/public/orders/:orderToken`
  * Returns live order tracking details (status, table number, order items, timestamps).

#### 3.2 Authentication Endpoints
* `POST /api/auth/login`: `{ email, password }` -> returns `{ token, user: { id, email, name, role, cafeId } }`.
* `POST /api/auth/logout`: Clears session / invalidates token.
* `GET /api/auth/me`: Validates JWT token and returns user context.

#### 3.3 Protected Admin / Staff Endpoints (`Authorization: Bearer <JWT>`)
* `GET /api/admin/dashboard`: Returns analytics summary (sales, order breakdown, chart metrics).
* `GET /api/admin/products` / `POST` / `PATCH /:id` / `DELETE /:id`: Product CRUD.
* `GET /api/admin/categories` / `POST` / `PATCH /:id` / `DELETE /:id`: Category CRUD.
* `GET /api/admin/tables` / `POST` / `PATCH /:id` / `POST /:id/qr`: Table & QR management.
* `GET /api/admin/orders` / `PATCH /:id/status`: Order listing & status transition.
* `GET /api/admin/reports`: Aggregate metrics over date ranges.
* `GET /api/admin/settings` / `PATCH`: Store settings updates.

---

### 4. Security Architecture

1. **Password Hashing**: Passwords stored using `bcryptjs` with salt rounds = 10.
2. **Server-Side Price Authority**: Prices sent in client checkout payloads are completely ignored. The backend queries `Product.price` directly for line-item calculations.
3. **Table Token Obfuscation**: QR code URLs use cryptographically generated 256-bit entropy random tokens (`crypto.randomBytes(16).toString('hex')`). Predictable sequential integer IDs (e.g. `/menu?table=1`) are barred.
4. **JWT Authentication & Role-Based Guarding**: Protected endpoints verify JWT signature and check user roles (`ADMIN` vs `KITCHEN`).
5. **Rate Limiting & Input Validation**: Public order submission routes restricted via `express-rate-limit` to prevent denial-of-service spam; inputs validated with Zod.

---

### 5. Project Directory Structure

```
/
├── docs/
│   ├── product.md
│   ├── ui.md
│   └── engineering.md
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
└── README.md
```

---

### 6. Testing Strategy

1. **Unit Testing**:
   * Order total calculation logic (verifying line item calculation, tax multiplication, rounding).
   * Password hashing & JWT token verification helpers.
2. **Integration Testing**:
   * Server-side price tampering defense: Send modified price payload to `POST /api/public/orders` and assert backend overrides payload with actual DB prices.
   * Order status workflow transitions: `PENDING` -> `ACCEPTED` -> `PREPARING` -> `READY` -> `COMPLETED`.
   * QR Token validation: Verify valid token loads menu, invalid token returns 404 error.

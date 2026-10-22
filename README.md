# RentEase — Property Rental & Real Estate Management Platform

RentEase is a full-featured, enterprise-grade property rental management platform built with **Nuxt 4**, **Vue 3**, **Prisma ORM**, and **PostgreSQL**. It streamlines the entire rental lifecycle for property managers, landlords, tenants, and maintenance technicians—from listing vacancies and screening applicants to e-signing leases, collecting automated rent, and dispatching maintenance work orders.

---

## Key Features

### Property & Unit Portfolio Management
- **Property Directory**: Add, update, and categorize residential and commercial properties with address geodata, amenities, and photo galleries.
- **Unit Inventory**: Real-time status tracking (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`) with individual pricing, floor plans, square footage, and security deposit management.

### Rental Applications & Screening
- **Public & Direct Applications**: Prospective tenants can browse vacancies and submit digital applications.
- **Review & Approval**: Landlords review income, employment verification, and history, transitioning approved applications directly into lease drafting.

### Digital Lease Agreements & E-Signatures
- **Automated Lease Generation**: Create standardized residential leases mapped to specific units and rent terms.
- **Dual Party E-Signing**: Step-by-step digital signature tracking for both landlords and tenants.
- **Lifecycle Transitions**: Automatic unit reservation upon approval and transition to `OCCUPIED` upon countersigning.

### Invoicing & Payment Reconciliation
- **Automated Billing**: Issue rent and utility invoices with due dates, late fees, and auto-generated invoice numbering.
- **Flexible Payments**: Support for partial payments, full settlements, and payment method tracking (`CREDIT_CARD`, `BANK_TRANSFER`, `CASH`, `CHECK`).
- **Live Statuses**: Real-time badge indicators for `UNPAID`, `PARTIALLY_PAID`, `PAID`, and `OVERDUE`.

### Maintenance & Work Order Dispatch
- **Tenant Ticketing**: Submit repair requests with priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), descriptions, and photo attachments.
- **Technician Assignment**: Dispatch internal or third-party technicians with assignment instructions.
- **Resolution Lifecycle**: Step-by-step progression (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CONFIRMED_CLOSED`).

### Reports, Analytics & Auditing
- **Occupancy & Financial KPIs**: Aggregate occupancy percentages, total portfolio revenue, outstanding balances, and active leases.
- **Immutable Audit Logging**: Strict traceability recording system actions, user sessions, entity mutations, and IP addresses.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | [Nuxt 4](https://nuxt.com/) (Vue 3 Composition API), Tailwind CSS, Lucide Icons |
| **Backend / API** | Nitro Server Engine, Zod runtime schema validation |
| **Database & ORM** | PostgreSQL 16, [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | Secure database-backed HTTP-only session cookies with `scrypt` password hashing |
| **Testing** | [Vitest](https://vitest.dev/) (Unit/Integration), [Playwright](https://playwright.dev/) (End-to-End) |
| **Containerization** | Docker, Docker Compose |

---

## Demo Accounts (Seed Data)

The database seed provides four pre-configured accounts representing each role. All accounts share the same default password:

> **Default Password:** `RentEase123!`

| Role | Email | Description |
|---|---|---|
| **Admin** | `admin@rentease.com` | Full platform governance, user management, and system-wide audit logs |
| **Landlord** | `landlord@rentease.com` | Property & unit management, applicant approval, lease creation, financials |
| **Tenant** | `tenant@rentease.com` | Rental browsing, lease signing, rent payments, maintenance requests |
| **Technician** | `technician@rentease.com` | Maintenance request queue, status updates, work notes, and resolution logging |

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **PostgreSQL** (via Docker or local PostgreSQL service)

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd property-rental-management-platform
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the `DATABASE_URL` matches your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://rentease_user:rentease_secure_pass@localhost:5432/rentease_db?schema=public"
SESSION_SECRET="super-secret-random-key-change-this-in-production-min-32-chars-long"
PORT="3000"
APP_URL="http://localhost:3000"
```

### 4. Database Initialization

#### Option A: Running PostgreSQL via Docker (if Docker is installed)
```bash
docker compose up -d postgres
```

#### Option B: Running Local PostgreSQL Service
Ensure your local PostgreSQL server is running on port 5432 with the database and user specified in `.env`.

### 5. Run Database Migrations & Seed
Push the Prisma schema and seed the database with initial demo accounts and properties:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# Seed the database with demo accounts & sample properties
npm run prisma:seed
```

### 6. Start the Development Server
```bash
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Project Structure

```text
property-rental-management-platform/
├── app/                        # Nuxt 4 Client Application
│   ├── app.vue                 # App root component
│   ├── assets/css/             # Tailwind & custom CSS styles
│   ├── components/             # Reusable Vue components (auth, properties, leases, etc.)
│   ├── composables/            # Client composables (useAuth, useNotification, etc.)
│   ├── layouts/                # App layouts (default, auth, dashboard)
│   ├── middleware/             # Route guards (auth, role-based protection)
│   └── pages/                  # Nuxt file-based routing
│       ├── index.vue           # Public landing & property search
│       ├── login.vue           # Authentication login
│       ├── register.vue        # Tenant/Landlord registration
│       ├── properties/         # Property details & public application modal
│       └── dashboard/          # Authenticated role-based portal
│           ├── index.vue       # Metrics & quick-action hub
│           ├── applications/   # Rental application review
│           ├── properties/     # Property & unit management
│           ├── leases/         # Lease generation & e-signature
│           ├── invoices/       # Invoicing & payment reconciliation
│           ├── maintenance/    # Maintenance work orders & assignment
│           ├── reports/        # Financial & occupancy reporting
│           ├── users/          # User administration (Admin only)
│           └── audit-logs/     # System activity audit logs (Admin only)
├── server/                     # Nitro Backend Engine
│   ├── api/v1/                 # REST API endpoints grouped by domain
│   ├── middleware/             # Auth session resolver & rate limiter
│   ├── repositories/           # Prisma data access layer
│   ├── services/               # Core business logic services
│   └── utils/                  # Cryptography, auth tokens, and helpers
├── shared/                     # Shared Types & Schemas
│   ├── schemas/                # Zod validation schemas
│   └── types/                  # TypeScript interface contracts
├── prisma/                     # Database Layer
│   ├── schema.prisma           # Prisma models, relations, enums & indexes
│   └── seed.ts                 # Database seeder with realistic test data
├── tests/                      # Testing Suites
│   ├── unit/                   # Vitest unit & integration tests
│   └── e2e/                    # Playwright end-to-end tests
└── docker-compose.yml          # Container orchestration configuration
```

---

## Testing & Quality Assurance

### Run Unit & Integration Tests (Vitest)
```bash
npm run test:unit
```

### Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

### Run Type Checks
```bash
npm run typecheck
```

---

## Docker Deployment

To build and run the complete containerized stack in production:

```bash
# Build and run containers in background
docker compose up -d --build

# Inspect running logs
docker compose logs -f app

# Stop containers
docker compose down
```

The application will be accessible at `http://localhost:3000`.

---

## Security Architecture

- **Session Security**: Cryptographically secure, random session tokens stored server-side and transmitted via HTTP-only, `SameSite=Lax` cookies.
- **Password Protection**: Passwords securely hashed with `scrypt` using distinct cryptographically random per-user salts.
- **Access Control (RBAC)**: Strict role boundaries enforced both client-side via Nuxt route middleware and server-side on every Nitro API event handler.
- **Input Validation**: 100% of API endpoints validate request query params, route parameters, and bodies with Zod before triggering business logic.
- **Data Isolation**: Multi-tenant database queries enforce user ownership checks preventing Insecure Direct Object References (IDOR).

---

## License
This project is licensed under the MIT License.

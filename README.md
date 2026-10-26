# RentEase — Property Rental & Real Estate Management Platform

RentEase is an enterprise-grade full-stack property rental and real estate management platform built with **Nuxt 4**, **Vue 3**, **Prisma ORM**, and **PostgreSQL**. Designed for residential and commercial property operations across Cambodia and Southeast Asia, it unifies the entire rental lifecycle for property managers, landlords, tenants, and maintenance technicians—from vacant unit discovery and applicant vetting to legally enforceable digital lease execution, automated invoicing, and field maintenance dispatch.

---

## Key Features

### Internationalization & Regional Localization (i18n)

- **Bilingual Interface**: Full bidirectional support for **English (`en`)** and **Khmer (`km`)** across public listings, application workflows, landlord portals, invoices, and audit logs.
- **Typography Optimization**: Configured with Google Fonts using **Plus Jakarta Sans** for Latin script and **Kantumruy Pro** for Khmer script.
- **Currency & Regional Context**: Built for USD and regional pricing contexts across major urban hubs (Phnom Penh, Siem Reap, Sihanoukville, Kampot).

### Interactive OpenFreeMap Geolocation & Vector Tiles

- **OpenFreeMap & MapLibre GL**: Privacy-first, open-source vector map integration without proprietary tracking or vendor lock-in.
- **Multiple Listing Views**: Instant toggle between **Grid View**, **Split View (Interactive Map + Property Cards)**, and full-width **Map View** with marker clustering and popups.
- **Detail View Geolocation**: High-resolution neighborhood context maps for individual property listings.

### Property & Unit Portfolio Management

- **Building Directory**: Multi-property portfolio management with address geodata, amenities, floor plans, and media galleries.
- **Unit Inventory Lifecycle**: Real-time room status tracking (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`) with square footage, floor numbers, bedrooms, bathrooms, and security deposits.

### Applicant Vetting & Digital Application Pipeline

- **Public & Direct Submissions**: Streamlined applicant modal allowing prospective tenants to submit employment, declared monthly income, and emergency contact details.
- **Landlord Review Dashboard**: Review applicant credentials and advance applications from `PENDING` to `UNDER_REVIEW` and `APPROVED`.
- **Direct Lease Conversion**: Approving an application automatically triggers draft lease generation with pre-populated tenant and unit data.

### Digital Lease Agreements & Countersignatures

- **Standardized Lease Builder**: Custom lease agreements specifying lease start/end dates, monthly rent, security deposits, and legal clauses.
- **Two-Party Digital Signing**: Step-by-step cryptographic signature confirmation for both landlord and tenant with legal timestamps.
- **Automated Unit Transitions**: Automatically transitions units to `RESERVED` upon approval and `OCCUPIED` upon countersigning.

### Automated Invoicing, Payments & Receipts

- **Automated Billing Engine**: Generation of monthly rent and utility invoices with due dates, payment reference numbers, and status indicators (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).
- **Flexible Payment Methods**: Record settled balances via `BANK_TRANSFER`, `CREDIT_CARD`, `CASH`, and `CHECK`.
- **Digital Printable Receipts**: Formal printable payment receipts with itemized balances and transaction IDs.

### Field Maintenance & Work Order Dispatch

- **Tenant Ticketing**: Submit work orders with priority categorization (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), defect descriptions, and photo attachments.
- **Technician Assignment**: Allocate work orders to specialized field technicians.
- **Resolution Lifecycle**: Multi-step state machine (`OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CONFIRMED_CLOSED`).

### Role-Based Access Control (RBAC) & Platform Governance

- **Four Dedicated Roles**:
  - `ADMIN`: Platform oversight, user status toggling (`ACTIVE` / `SUSPENDED`), and system-wide audit trail logs.
  - `LANDLORD`: Full property and unit portfolio management, lease drafting, and financial reconciliation.
  - `TENANT`: Browse vacancies, sign assigned leases, pay invoices, and file repair tickets.
  - `TECHNICIAN`: View and resolve assigned maintenance work orders.
- **In-Memory Fallback Store**: Built-in zero-config in-memory mock repository layer that activates automatically if PostgreSQL is unreachable during local development, enabling instantaneous onboarding without database setup overhead.

---

## Technology Stack

| Layer                       | Technologies                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Frontend Framework**      | [Nuxt 4](https://nuxt.com/) (Vue 3 Composition API, `<script setup lang="ts">`)                |
| **Styling & Design System** | Tailwind CSS (Tailwind v3 with custom color tokens and aspect ratio extensions)                |
| **Icons**                   | Lucide Icons (`@lucide/vue` / `lucide-vue-next`)                                               |
| **Internationalization**    | `@nuxtjs/i18n` with Vue I18n (English & Khmer)                                                 |
| **Maps & Geolocation**      | `maplibre-gl` with OpenFreeMap vector styles                                                   |
| **Backend Engine**          | Nitro Server Engine (Nuxt 4 server routes and middleware)                                      |
| **Validation**              | Zod runtime schema validation for API request bodies, queries, and headers                     |
| **Database & ORM**          | PostgreSQL 16 & [Prisma ORM](https://www.prisma.io/)                                           |
| **Authentication**          | Cryptographically secure HTTP-only cookies, session tokens, and `scrypt` hashing               |
| **Testing**                 | [Vitest](https://vitest.dev/) (Unit/Integration) & [Playwright](https://playwright.dev/) (E2E) |
| **Code Formatting**         | Prettier with `prettier-plugin-tailwindcss`                                                    |
| **DevOps**                  | Multi-stage Docker, Docker Compose                                                             |

---

## Demo Accounts (Seed Data)

The platform includes seed data with pre-configured accounts for each role. All demo accounts share the same default password:

> **Default Password:** `RentEase123!`

| Role           | Email                     | Permissions & Scope                                                     |
| -------------- | ------------------------- | ----------------------------------------------------------------------- |
| **Admin**      | `admin@rentease.com`      | User governance, account suspension, full platform audit logs           |
| **Landlord**   | `landlord@rentease.com`   | Property & unit portfolios, lease drafting, applicant approval, billing |
| **Tenant**     | `tenant@rentease.com`     | Vacancy browsing, lease signing, rent payment, maintenance requests     |
| **Technician** | `technician@rentease.com` | Assigned maintenance work order management and progress logging         |

---

## Getting Started

### 1. Prerequisites

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **PostgreSQL** (Optional for local development—an automatic in-memory fallback is included)

### 2. Installation

Clone the repository and install project dependencies:

```bash
git clone https://github.com/lydenchai/property-rental-management-platform.git
cd property-rental-management-platform
npm install
```

### 3. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Verify your `.env` configuration:

```env
DATABASE_URL="postgresql://rentease_user:rentease_secure_pass@localhost:5432/rentease_db?schema=public"
SESSION_SECRET="super-secret-random-key-change-this-in-production-min-32-chars-long"
PORT="3000"
APP_URL="http://localhost:3000"
```

### 4. Database Setup (PostgreSQL)

#### Option A: Docker Compose (Recommended)

Launch PostgreSQL in the background:

```bash
docker compose up -d postgres
```

#### Option B: Local PostgreSQL Server

Ensure your local PostgreSQL server is active on port 5432 with the credentials specified in `.env`.

#### Option C: Zero-Config In-Memory Mode

If PostgreSQL is offline or credentials do not match, RentEase automatically boots into resilient **In-Memory Store Mode** with seeded demo accounts, properties, leases, and invoices preloaded.

### 5. Database Migration & Seeding

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npm run prisma:generate

# Seed the database with demo accounts, units, and leases
npm run prisma:seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The application will be accessible at:

- Local: **[http://localhost:3000](http://localhost:3000)**
- LAN / Network: **[http://0.0.0.0:3000](http://0.0.0.0:3000)**

To run on a custom port (e.g., port 4000):

```bash
npm run dev -- --port 4000
```

---

## Available Scripts

| Command                              | Purpose                                                     |
| ------------------------------------ | ----------------------------------------------------------- |
| `npm run dev`                        | Starts the Nuxt 4 development server on `0.0.0.0:3000`      |
| `npm run build`                      | Builds the production bundle with Nitro server output       |
| `npm run preview`                    | Runs the compiled production build locally for verification |
| `npm run typecheck`                  | Validates TypeScript types and prepares Nuxt auto-imports   |
| `npm run format`                     | Formats all source files using Prettier and Tailwind plugin |
| `npm run format:check`               | Verifies code formatting compliance in CI/CD                |
| `npm run test` / `npm run test:unit` | Executes the Vitest unit and integration test suite         |
| `npm run test:e2e`                   | Runs Playwright end-to-end browser automation tests         |
| `npm run prisma:generate`            | Generates the Prisma ORM Client                             |
| `npm run prisma:seed`                | Seeds the database with mock records and test accounts      |

---

## Architecture & Directory Structure

RentEase follows a **Modular Monolith** architecture with strict separation between client-side UI, server logic, and shared schemas:

```text
property-rental-management-platform/
├── app/                        # Client-side presentation layer
│   ├── app.vue                 # App root & global notification toasts
│   ├── assets/css/             # Tailwind & MapLibre stylesheets
│   ├── components/             # Focused Vue components
│   │   ├── common/             # LanguageSwitcher, ThemeToggle, AppTableCard, etc.
│   │   ├── properties/         # Property filters, card views, application modals
│   │   └── units/              # Unit gallery, floor plans, specs modal
│   ├── composables/            # Client-side UI & auth composables (useAuth, useTheme)
│   ├── layouts/                # Route layouts (default, auth, dashboard)
│   ├── middleware/             # Route guards (auth, role protection)
│   ├── pages/                  # Nuxt 4 file-based routing
│   │   ├── index.vue           # Public landing page with regional hubs
│   │   ├── properties/         # Public property listings & OpenFreeMap explorer
│   │   ├── login.vue           # Secure authentication portal
│   │   ├── register.vue        # Dual-role account creation
│   │   └── dashboard/          # Authenticated operations portal
│   │       ├── index.vue       # Operational KPI metrics & quick workflows
│   │       ├── properties/     # Portfolio management & unit inventory
│   │       ├── applications/   # Applicant review & background vetting
│   │       ├── leases/         # Lease generator & digital signing
│   │       ├── invoices/       # Billing management & receipt generation
│   │       ├── maintenance/    # Work order ticketing & dispatch
│   │       ├── reports/        # Financial & occupancy analytics
│   │       ├── users/          # User administration (Admin only)
│   │       └── audit-logs/     # Immutable system event logs (Admin only)
│   └── stores/                 # State management stores (reactive composables)
├── i18n/                       # Internationalization assets
│   └── locales/                # Translation dictionaries (en.json, km.json)
├── prisma/                     # Database layer
│   ├── schema.prisma           # Prisma models, relations, and indexes
│   └── seed.ts                 # Database seeder with realistic fixtures
├── server/                     # Nitro backend server engine
│   ├── api/v1/                 # REST endpoints with Zod input validation
│   ├── middleware/             # Session resolution & authentication middleware
│   ├── repositories/           # Prisma data access layer with in-memory fallbacks
│   ├── services/               # Pure business domain logic
│   └── utils/                  # Session tokens, scrypt cryptography, and error handlers
├── shared/                     # Universal code shared safely across client & server
│   ├── schemas/                # Zod schemas (API request/response contracts)
│   └── types/                  # TypeScript interface definitions and enums
└── tests/                      # Testing suites
    ├── unit/                   # Vitest unit & integration tests
    └── e2e/                    # Playwright end-to-end tests
```

---

## Security Architecture

- **Session Security**: Session tokens generated with 32+ bytes of cryptographic randomness, stored server-side, and delivered via `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies.
- **Password Protection**: Passwords securely hashed with `scrypt` using cryptographically random per-user salts.
- **Server-Side Authorization**: Enforced on every Nitro API event handler (`requireAuth`, `requireRole`) to prevent client-bypass attacks.
- **Insecure Direct Object Reference (IDOR) Mitigation**: Database queries explicitly verify tenant or landlord entity ownership before updating or returning records.
- **Input Sanitization**: 100% of API endpoints validate request query params, route parameters, and bodies with Zod before triggering business logic.
- **Immutable Audit Logging**: Security-sensitive actions (logins, status overrides, lease executions, user role modifications) are recorded in the `AuditLog` table without exposing PII or credentials.

---

## Docker Deployment

To build and run the production containerized stack:

```bash
# Build and run containers in the background
docker compose up -d --build

# View real-time logs
docker compose logs -f app

# Stop containers
docker compose down
```

The production application will be accessible at `http://localhost:3000`.

---

## License

This project is licensed under the [MIT License](LICENSE).

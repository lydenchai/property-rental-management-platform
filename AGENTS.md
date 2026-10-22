# AGENTS.md — Development Instructions for RentEase

This document serves as the permanent operating instruction and engineering standards manual for all AI coding agents working on the **RentEase** repository.

---

## 1. Project Overview & Role Definition

**RentEase** is an enterprise-grade full-stack property rental and real estate management platform built with **Nuxt 4**, **Vue 3**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

### Engineering Persona
Act as an experienced **Senior Full-Stack Software Engineer, Software Architect, Security Engineer, and DevOps Engineer**.
Every contribution must prioritize:
- Production readiness & clean architecture
- Strict type safety & maintainability
- System security & multi-tenant data isolation
- Performance, scalability & reliability
- Accessibility & deterministic testing

Never make assumptions about architecture when the repository can be inspected. Build features incrementally rather than generating monolithic unverified blocks of code.

---

## 2. Technology Stack & Tooling

- **Frontend**: Nuxt 4 (Vue 3 Composition API with `<script setup lang="ts">`), Tailwind CSS, Lucide icons (`lucide-vue-next` / `@lucide/vue`).
- **Backend**: Nitro Server Engine (Nuxt 4 server routes and middleware).
- **Validation**: Zod (runtime validation schemas for all external inputs and environment variables).
- **Database & ORM**: PostgreSQL (with pgAdmin 4 for administrative inspection) managed via Prisma ORM.
- **Authentication**: Secure server-managed sessions with cryptographically secure HTTP-only cookies and `scrypt` password hashing.
- **Testing**: Vitest (unit & integration testing) and Playwright (end-to-end browser automation).
- **DevOps**: Multi-stage Docker, Docker Compose (`postgres` + `app`), and environment-driven configurations.

Always stick to compatible, stable package versions. Do not introduce extraneous dependencies without explicit justification.

---

## 3. Architecture & Code Quality Standards

RentEase follows a **Modular Monolith** architecture with strict separation of concerns:

```text
property-rental-management-platform/
├── app/                        # Client-side UI & presentation layer
│   ├── components/             # Reusable, focused Vue components
│   ├── composables/            # Client-side UI & auth composables (e.g. useAuth)
│   ├── layouts/                # Layout structures (default, auth, dashboard)
│   ├── middleware/             # Client route guards (auth.ts, role.ts)
│   └── pages/                  # Nuxt 4 page routes
├── server/                     # Nitro backend server layer
│   ├── api/v1/                 # REST endpoints with Zod input validation
│   ├── middleware/             # Server middleware (session resolution, rate limits)
│   ├── repositories/           # Prisma data access layer (queries & transactions)
│   ├── services/               # Pure business domain logic
│   └── utils/                  # Cryptography, auth tokens, session handlers
├── shared/                     # Universal code shared safely across client & server
│   ├── schemas/                # Zod schemas (API request/response contracts)
│   └── types/                  # TypeScript interface definitions
├── prisma/                     # Database schema, migrations, and seeds
└── tests/                      # Vitest unit/integration & Playwright E2E suites
```

### Code Standards
- **Client/Server Boundary**: Keep server secrets, database access, and server-only modules strictly inside `server/`. Never export sensitive logic to `app/`.
- **Strict TypeScript**: Avoid `any` or loose type assertions (`as unknown as ...`). Derive types from Zod schemas and Prisma models where possible.
- **Component Design**: Keep Vue components focused and reusable. Extract domain logic into composables or services. Do not mix business rules directly into template presentation components.
- **Consistent States**: Always handle the four fundamental UI states: **Loading**, **Error**, **Empty**, and **Success**.
- **Scope Discipline**: Make minimal, targeted modifications. Never touch unrelated files or delete existing user functionality without explicit instruction.

---

## 4. Database & Prisma Engineering

- **PostgreSQL Connection**: Database credentials must be loaded exclusively through `DATABASE_URL` from `.env`. Never commit credentials or secrets to git. Maintain `.env.example` with non-sensitive placeholder values.
- **Data Modeling**: Design normalized relational tables with clear primary keys, foreign key constraints, explicit deletion cascades/restricts, timestamps (`createdAt`, `updatedAt`), and composite indexes for high-frequency queries.
- **Migrations & Schema Sync**:
  - Use `npx prisma migrate dev` or `npx prisma db push` for schema updates.
  - Never run `prisma migrate reset`, `drop database`, `truncate`, or overwrite production/staging data without explicit, documented user confirmation.
  - Always verify database connectivity before running operations that mutate state.
- **Atomic Transactions**: Wrap multi-step mutations (e.g., approving an application, generating a lease, and updating unit status to `RESERVED`) inside `prisma.$transaction`.

---

## 5. Security & Multi-Tenant Authorization

Security is a primary, non-negotiable requirement across all endpoints.

- **Server-Side Enforcement**: Never rely on client-side route guards alone. Validate authentication and authorization on every Nitro event handler.
- **Role-Based Access Control (RBAC)**: Enforce distinct permissions for all roles:
  - `ADMIN`: Global platform oversight, user management, and system-wide audit logs.
  - `LANDLORD`: Management of owned properties, units, tenant applications, leases, and invoices.
  - `TENANT`: Browsing vacancies, submitting applications, signing assigned leases, paying invoices, submitting maintenance requests.
  - `TECHNICIAN`: Viewing and resolving assigned maintenance work orders.
- **Insecure Direct Object Reference (IDOR) Mitigation**: Always verify ownership before returning or updating entities (e.g., confirm `invoice.tenantId === currentUser.id` or `property.landlordId === currentUser.id`).
- **Session & Cookie Security**:
  - Issue session cookies with `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure` (in production).
  - Use cryptographically random 32+ byte session tokens.
  - Support instant session revocation and password change invalidations.
- **Untrusted Input**: Never trust client-supplied data (such as user roles, rental prices, lease status flags, or payment verification statuses). All input must pass strict Zod schemas before reaching domain services.
- **Audit Logging**: Record security-sensitive actions (logins, status overrides, lease executions, user role changes) in `AuditLog` without logging passwords, tokens, or PII.

---

## 6. Mandatory UI/UX Design Standards

The user interface must look clean, intentional, human-designed, and enterprise-grade.

- **Strict Emoji Prohibition**:
  - **NEVER use emojis anywhere in the application interface**—including buttons, navigation links, cards, headers, tables, modal dialogs, status badges, notifications, or empty states.
  - Use **Lucide icons** (`@lucide/vue` / `lucide-vue-next`) exclusively for iconography.
- **Flat UI Aesthetics**:
  - Use clean, modern, flat design with solid colors, crisp 1px borders (`border-neutral-200` / `border-neutral-800`), minimal shadows (`shadow-sm`), and consistent whitespace.
  - Avoid excessive gradients, glassmorphism, blur effects, pulsating glow animations, or generic AI dashboard tropes.
- **Restrained Color System**:
  - Use deliberate, accessible color palettes with semantic status accents (e.g., Emerald for active/paid, Amber for pending/due soon, Rose for overdue/urgent, Slate/Indigo for primary controls).
- **Data-Dense & Operational Layouts**:
  - Prioritize readable data tables, robust filtering, keyword search, status sorting, clear pagination, and concise modal forms over decorative cards.
- **Accessibility & Responsiveness**:
  - Fully responsive layouts across mobile, tablet, and desktop viewports.
  - Semantic HTML (`<main>`, `<nav>`, `<header>`, `<table>`, `<button>`).
  - Visible focus rings (`focus-visible:ring-2`), keyboard accessibility, and WCAG-compliant contrast ratios.
- **Functional Completeness**:
  - Every button, dropdown, filter, and modal presented to the user must be functional with realistic copy and proper event handling.

---

## 7. Testing & Autonomous Verification

A task is **NOT complete** merely because code was written or saved. Every code change must undergo verification.

- **Unit & Integration Tests**:
  - Maintain Vitest tests in `tests/unit/` covering business services, repository queries, calculations (e.g., rent, partial payments, occupancy rate), and Zod schema validations.
- **End-to-End Tests**:
  - Maintain Playwright tests in `tests/e2e/` for critical multi-role user flows (Application → Approval → Lease signing → Invoicing → Maintenance resolution).
- **Verification Commands**:
  - Run tests: `npm run test:unit`
  - Run type checks / preparation: `npm run typecheck` or `npx vitest run`
  - Build validation: `npm run build`
- **Self-Correction Rule**:
  - If a test, linter, or type-check fails, diagnose the root cause, apply the minimal correct fix, and re-run verification until all checks pass.
  - Never claim a verification command passed without actually executing it.

---

## 8. Development Workflow for Agents

When handling tasks on RentEase:
1. **Inspect First**: Use targeted search tools (`grep_search`, `view_file`) to inspect existing implementations, database models, schemas, and tests before modifying code.
2. **Trace Data Flow**: Trace the complete path from UI component → API handler → Zod validation → Service → Repository → Prisma database.
3. **Plan Significant Changes**: Outline a concise plan before making architectural modifications.
4. **Incremental Implementation**: Build and test one component, service, or route at a time.
5. **Autonomously Verify**: Execute the appropriate test suite (`vitest run <path>`) and build commands before marking the task complete.
6. **Report Clearly**: Summarize the changes made, verification results (with exact command outputs), and any architectural notes.

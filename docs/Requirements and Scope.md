# Requirements and Scope

## 1. Phased Implementation Roadmap

### Phase 0 — Project Audit & Knowledge Base (Completed)
- Inspect workspace (`c:\Users\shizu\OneDrive\Desktop\Sheetsentry`), Figma file (`EaLXKuZ409gE69jAphdxIn`), FigJam (`wsZBCPg0yTOBFEt2Roz4DB`), and library docs via Context7.
- Establish the Obsidian project knowledge base (`docs/`) with all 13 core documents and the [[Conflict Register]].

### Phase 1 — Frontend Implementation (Current Scope)
- **Public Website**:
  - Landing Page (`/`), Features (`/features`), How It Works (`/how-it-works`), Pricing (`/pricing`), FAQ (`/faq`), Login (`/login`), Registration (`/register`), Password Reset & Auth State Machine (`/reset-password`), responsive navigation and footer.
- **Customer Application**:
  - Dashboard (`/app/dashboard`), File Upload (`/app/upload`), Upload Preflight (`/app/upload/preflight`), Spreadsheet Preview & Column Mapping (`/app/upload/preview`), Validation Profiles (`/app/profiles`), Rule Builder & Sandbox (`/app/profiles/builder`), Validation Results (`/app/results/:jobId`), Reports (`/app/reports`), Run History (`/app/history`), Job Details (`/app/jobs/:jobId`), Billing Interface (`/app/billing`), Settings (`/app/settings`), Help Center (`/app/help`).
- **Admin Console**:
  - Admin Dashboard (`/admin/overview`), User Management & Detail Drawer (`/admin/users`), Upload & Pipeline Management (`/admin/uploads`), Subscription Management (`/admin/subscriptions`), Payments Ledger Interface (`/admin/payments`), Storage & Retention Monitoring (`/admin/storage`), Security & Audit Interface (`/admin/security`), Roles & Permissions Matrix (`/admin/roles`), System Settings (`/admin/settings`), Operations & Connections Interface (`/admin/operations`).

### Phase 2 — Frontend Interaction (Current Scope)
- Real client-side safe CSV/TSV/XLSX-workbook preview and validation engine without executing formulas.
- Interactive forms, validation feedback, modals, search, multi-column filters, pagination, tabs, dropdowns, and responsive drawer navigation.
- Loading, empty, error, quarantine, and success states across workflows.
- Centralized provisional plan configuration (`src/config/productConfig.ts`) surfacing conflicts transparently.

### Phase 3 — Backend Foundation (Completed & Connected)
- Node.js + Express + TypeScript REST API (`src/server/`), request validation, centralized error handling, bcrypt + SHA-256 `user_sessions` token management, Customer (`USER`) vs Admin (`ADMIN`) RBAC middleware, and structured `audit_logs`.

### Phase 4 — MySQL 8 & phpMyAdmin (Completed & Verified)
- Relational MySQL 8 schema (`42` tables across `7` domains in `database/schema.sql`), seeded fixtures (`database/seeds.sql`), `mysql2/promise` connection pool (`src/server/database/mysqlClient.ts`), and phpMyAdmin inspection (`http://localhost/phpmyadmin/`).
- *Constraint*: Database credentials remain strictly externalized in gitignored `.env` (never committed in source).

### Phase 5 — Role-Based Portal Wiring & Core Validation Persistence (Completed)
- Public Website workflow CTAs enforce registration/login (`/register`, `/login`), Customer App (`/app/*`) is strictly for authenticated Customer (`USER`) workspaces backed by MySQL, and Admin Console (`/admin/*`) enforces design-preview / Admin-only boundaries (blocking regular Customer accounts). See [[Authentication and Role Access Flow]].

### Phase 6 — Integration & End-to-End QA
- Full-stack integration connecting React frontend, Express API, MySQL 8 database, and 16-domain QA verification.

## 2. Core Business Rules (from Master Config `138:2`)
- **Data Quality Score (DQS)**:
  $$\text{DQS} = \max\left(0, 100 - \left(\frac{1.0 \times N_{\text{crit}} + 0.3 \times N_{\text{warn}}}{\text{Total Evaluated Rows}} \times 100\right)\right)$$
- **Grade Bands**:
  - **Grade A**: `95.00% – 100.00%` (Healthy)
  - **Grade B**: `85.00% – 94.99%` (Acceptable with Warnings)
  - **Grade C**: `70.00% – 84.99%` (Needs Review)
  - **Grade Fail**: `< 70.00%` (Rejected / Quarantined)
- **Processing Eligibility Separation**:
  - A file with **any** `CRITICAL` blocking error (`N_crit > 0`) is marked `BLOCKED_CRITICAL` (Ineligible for automated downstream ingestion) regardless of whether its numerical DQS is `>= 95%`.

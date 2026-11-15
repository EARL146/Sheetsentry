# Architecture Decision Records (ADRs)

## ADR-001: Frontend Stack Selection (React + TypeScript + Vite + Tailwind CSS)
- **Status**: Accepted
- **Context**: The workspace started empty and requires a maintainable, responsive SaaS frontend implementing the Public Website, Customer App, and Admin Console from Figma (`EaLXKuZ409gE69jAphdxIn`).
- **Decision**: Use React 18, TypeScript, Vite, Tailwind CSS, React Router, and Lucide icons.
- **Consequences**: Provides fast HMR, strict compile-time type safety for validation rules and state machines, and direct mapping of Figma design tokens (`3:4` and `128:2`).

## ADR-002: Relational Database Target (MySQL 8 + phpMyAdmin in Phase 4)
- **Status**: Accepted
- **Context**: Figma node `136:1565` illustrates a 42-table relational schema originally labeled with PostgreSQL dialect notes, while project requirements mandate MySQL 8 compatibility administered via phpMyAdmin.
- **Decision**: Target **MySQL 8.0+** (`InnoDB`, `utf8mb4_0900_ai_ci`) managed via **phpMyAdmin** for Phase 4. All UUIDs, JSON columns, foreign keys, and composite indexes in `136:1565` map cleanly to native MySQL 8 types (`CHAR(36)`, `JSON`, `DECIMAL(12,2)`, `TIMESTAMP`). No production credentials or live DB connections are configured in Phases 1–2.

## ADR-003: Centralized Product Configuration & Conflict Transparency
- **Status**: Accepted
- **Context**: Older Figma screens (`22:555` Pricing, `116:2` Preflight) conflict with the newer `138:2` (*Master Product Configuration & Business Rules Specification*) on Free file size (`10 MB` vs `5 MB`) and Pro monthly validations (`300/mo` vs `Unlimited`).
- **Decision**: Centralize all plan limits, pricing, and thresholds in `src/config/productConfig.ts`. Default to `138:2` as the proposed Single Source of Truth (SSOT) while allowing interactive comparison/toggling of the legacy `22:555` values and displaying a clear `PROVISIONAL — OWNER APPROVAL REQUIRED` notice.

## ADR-004: Strict Separation of Data Quality Score (DQS), Grade, and Processing Eligibility
- **Status**: Accepted
- **Context**: In large spreadsheets (e.g., 10,000 rows), a single critical blocking error yields a `99.99%` DQS (`Grade A`). Automatically approving based on score alone would allow corrupt rows into downstream production databases.
- **Decision**: Compute and display three distinct outputs on every validation job:
  1. **Data Quality Score (`DQS`)**: `max(0, 100 - [(1.0 * N_crit + 0.3 * N_warn) / Rows * 100])`
  2. **Validation Grade**: `A` (`>=95%`), `B` (`85–94.99%`), `C` (`70–84.99%`), `Fail` (`<70%`)
  3. **Processing Eligibility**: `BLOCKED_CRITICAL` whenever `N_crit > 0` (or when a rule with `Critical Error (Blocks Job)` fails), `REVIEW_REQUIRED` when `N_crit == 0 && N_warn > 0`, and `ELIGIBLE` only when `N_crit == 0 && N_warn == 0`.

## ADR-005: Safe Client-Side Spreadsheet Parsing & Formula Neutralization
- **Status**: Accepted
- **Context**: Phase 2 requires realistic spreadsheet preview and validation without pretending a backend worker cluster is running, while strictly preventing CSV/XLSX formula execution.
- **Decision**: Implement a deterministic client-side parser (`src/services/spreadsheetParser.ts`) and rule engine (`src/services/validationEngine.ts`) that inspects raw text/bytes, never evaluates formulas (`=SUM`, `=HYPERLINK`, `=CMD`), flags formula-injection payloads (`^[=+\-@\t\r]`), and prefixes dangerous cells with a single quote (`'`) on sanitized CSV export.

## ADR-006: Ticket-Gated Admin Cell Inspection & Multi-Currency Ledger Isolation
- **Status**: Accepted
- **Context**: Admin screens (`115:2`, `138:2`, `114:209`, `136:1265`) require strict privacy and financial governance controls.
- **Decision**:
  1. Mask raw customer spreadsheet cell values in the Admin Console by default; require a valid Support Ticket ID (`SUP-XXXX`) before revealing any customer payload, recording an immutable audit entry.
  2. Never sum USD (`$`) and PHP (`₱`) revenue into a single blended total without explicit FX conversion disclosure; maintain isolated USD and PHP ledger tabs and require Dual-Admin approval for refunds exceeding `$500 USD` (or `₱27,500 PHP`).

# Testing and QA — 16-Domain Matrix & State Machines

Reference: Figma Node `136:1843` (*SheetSentry Developer Handoff, State Machines & 16-Domain QA Matrix*).

## 1. Core State Machines Verified in Frontend & Unit Tests

### A. 9-State Validation Job Lifecycle (`138:2` Section 4)
`UPLOADED` → `SCANNING` → `VALIDATING` → `SCORING` → `COMPLETED` | `FAILED` | `QUARANTINED` | `CANCELLED` | `EXPIRED`

### B. 3-State Processing Eligibility Output
- `ELIGIBLE`: `0` Critical Errors and `0` Warnings (`Grade A`).
- `REVIEW_REQUIRED`: `0` Critical Errors and `>= 1` Warnings (`Grade A/B/C`).
- `BLOCKED_CRITICAL`: `>= 1` Critical Blocking Errors (blocks downstream ingestion even if numerical `DQS >= 95%`).

## 2. Automated Test Suite (Vitest)
Total automated tests passing: **11 / 11 tests** across 2 suites.

### Suite 1: Validation Engine Unit Tests (`src/services/__tests__/validationEngine.test.ts`)
1. **DQS Mathematical Formula Verification**:
   - Verifies `max(0, 100 - [(1.0 * N_crit + 0.3 * N_warn) / Rows * 100])` across zero-error (`100%`), mixed warning/critical, high-error (`0%` floor), and empty (`N/A`) datasets.
2. **DQS vs Processing Eligibility Separation**:
   - Proves that a 100-row sheet with `1` critical blocking error scores `99.00%` (`Grade A`) yet returns `processingEligibility: 'BLOCKED_CRITICAL'`.
3. **Formula Injection Neutralization**:
   - Verifies that cells starting with `=`, `+`, `-`, `@`, `\t`, and `\r` are detected and prefixed with `'` on sanitized CSV export without executing formulas.
4. **Client-Side CSV & Magic-Byte Preflight**:
   - Verifies delimiter detection (`,`, `;`, `\t`), header extraction, extension/magic-byte validation, and plan file-size ceiling enforcement.

### Suite 2: Backend REST Foundation Integration Tests (`src/server/__tests__/api.test.ts`)
5. **GET `/api/health`**: Healthcheck returns HTTP 200 with `UP` status.
6. **POST `/api/v1/auth/login`**: Validates credentials and returns JWT bearer token + user profile.
7. **POST `/api/v1/uploads/preflight`**: Verifies magic bytes (`504B0304` for XLSX) and decompression ratio `< 100:1`.
8. **GET `/api/v1/jobs/:id`**: Confirms decoupled DQS calculation (98.4%) and `ELIGIBLE` processing status.
9. **GET `/api/v1/admin/ledger`**: Verifies admin authentication and currency segregation (`USD` and `PHP`).
10. **POST `/api/v1/admin/unmask-ticket`**: Enforces Security Control #8 Support Ticket ID formatting (`SUP-XXXX`) and 15-minute TTL grant.

## 3. Build & Compiler Verification
- `tsc -b`: Zero TypeScript compilation errors.
- `vite build`: Production bundle generated cleanly (`dist/index.html`, `dist/assets/`).

# Security Design — 15-Point Control Matrix & Data Integrity

Reference: Figma Nodes `122:2` (*Master Cloud Infrastructure & 15-Point Security Control Matrix*) and `138:2` (*Master Product Configuration*).

## 1. Spreadsheet & Ingestion Security Controls
1. **No Formula Execution**:
   - Spreadsheet cells are parsed strictly as raw text literals. Formula strings (`=SUM(...)`, `=CMD|...`, `=HYPERLINK(...)`, `+cmd`, `-cmd`, `@SUM`) are **never** evaluated.
2. **CSV / Spreadsheet Formula Injection Neutralization**:
   - Any cell beginning with `=`, `+`, `-`, `@`, `\t` (`0x09`), or `\r` (`0x0D`) is flagged by the Formula Injection Shield and automatically prefixed with a single quote (`'`) on sanitized CSV export so downstream spreadsheet software (Excel/Google Sheets) treats it as literal text.
3. **Magic-Byte & MIME Verification**:
   - File extension spoofing (`.exe` or `.html` renamed to `.xlsx` or `.csv`) is blocked by inspecting raw magic bytes (`50 4B 03 04` for ZIP/XLSX containers; valid UTF-8/ASCII printable text without null bytes for CSV/TSV).
4. **Zip-Bomb & Decompression Ratio Guard**:
   - Compressed `.xlsx` archives exceeding a `25:1` uncompressed-to-compressed ratio or nested archive depth `> 1` are immediately quarantined (`QUARANTINED`).
5. **Isolated Streaming Worker Ceiling**:
   - Workers operate with no outbound internet egress, a `1,024 MB` hard memory ceiling (`850 MB` pause/flush threshold), `2 vCPU` cap, and `300s` execution timeout.

## 2. Authentication, RBAC & Privacy Governance
6. **13-State Authentication Without Fixed OTP Codes**:
   - Implements the reconciled auth state machine (`119:248`) including progressive rate limiting, 5-attempt temporary lockout (`15m`), TOTP MFA, recovery codes, and expiring password reset tokens—never relying on fixed hardcoded sample codes from early wireframes.
7. **6-Role Admin RBAC Matrix (`117:150`)**:
   - Enforces least privilege across `Super Admin`, `Platform Ops`, `SecOps Auditor`, `Billing Admin`, `Support Tier 2`, and `Support Read-Only`.
8. **Ticket-Gated Admin Cell Inspection (`115:2` & `138:2` Section 6)**:
   - Raw customer cell values are masked (`••••••••`) across all Admin Console views by default. Viewing unmasked customer data requires entering a valid Support Ticket ID (`SUP-XXXX`) and justification, which writes an immutable hash-chained entry to `audit_logs`.
9. **Multi-Currency Financial Integrity (`114:209` & `136:1265`)**:
   - USD (`$`) and PHP (`₱`) ledgers are stored and aggregated separately. Refunds exceeding `$500.00 USD` (or `₱27,500 PHP`) require **Dual-Admin Approval** (`initiated_by_admin_id != approved_by_admin_id`).
10. **Secrets & Environment Hygiene**:
    - Zero hardcoded database credentials, API keys, or `.env` secrets in source code.

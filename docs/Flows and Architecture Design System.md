# Flows and Architecture Design System — SheetSentry

## 1. Overview & Scope
The **Flows and Architecture Design System** governs all diagrammatic, architectural, and engineering documentation interfaces under `/flows` (`04 User and Admin Flows`, Figma Node `2:4` / `23:2`):
- Connected System Topology Map (Node `23:2`)
- Master Product Configuration Matrix (Node `138:2`)
- Reconciled 42-Table MySQL 8 Relational ERD across 7 Modules (Node `136:1565`)
- RESTful API Route Catalog across 28 Endpoint Groups (Node `136:1683`)
- QA Test Verification & Deployment Checklist (Node `136:1843`)

---

## 2. Diagrammatic & Topology Tokens
* **Node Container Tokens**:
  * Public Website Node: Border `#3B82F6`, Background `#EFF6FF`, Accent `#2563EB`
  * Customer App Node: Border `#10B981`, Background `#ECFDF5`, Accent `#059669`
  * Admin Console Node: Border `#8B5CF6`, Background `#F5F3FF`, Accent `#7C3AED`
  * Validation Engine Node: Border `#F59E0B`, Background `#FFFBEB`, Accent `#D97706`
  * Relational Database Node: Border `#6366F1`, Background `#EEF2FF`, Accent `#4F46E5`
* **Flow Connectors**:
  * Forward Flow: Solid `stroke-[#94A3B8]` with directional arrow
  * Async Job Trigger: Dashed `stroke-[#3B82F6]`
  * Security Token Handshake: Dotted `stroke-[#10B981]`

---

## 3. Database ERD Module Styling (42 Tables)
The 42 tables in SheetSentry's MySQL 8 architecture are color-coded into 7 cohesive functional modules:
1. **Module 1 — Identity, Accounts & Auth**: Accent `#2563EB` (Tables: `users`, `user_credentials`, `user_sessions`, `password_resets`, `email_verifications`, `oauth_accounts`)
2. **Module 2 — Workspaces & Memberships**: Accent `#0284C7` (Tables: `workspaces`, `workspace_memberships`, `workspace_invitations`, `workspace_api_keys`, `workspace_settings`)
3. **Module 3 — Uploaded Files & Worksheets**: Accent `#059669` (Tables: `uploaded_files`, `file_chunks`, `worksheets`, `worksheet_columns`, `file_preflight_checks`, `file_storage_objects`)
4. **Module 4 — Validation Profiles & Rules**: Accent `#D97706` (Tables: `validation_profiles`, `profile_versions`, `validation_rules`, `rule_parameters`, `column_mappings`, `rule_templates`)
5. **Module 5 — Validation Jobs & Cell Issues**: Accent `#7C3AED` (Tables: `validation_jobs`, `job_batches`, `job_execution_logs`, `cell_issues`, `row_summaries`, `quality_scores`)
6. **Module 6 — Reports & Audit Logging**: Accent `#DC2626` (Tables: `reports`, `report_exports`, `report_downloads`, `system_audit_logs`, `security_events`, `compliance_archives`)
7. **Module 7 — Subscriptions & Segregated Ledgers**: Accent `#4F46E5` (Tables: `plans`, `plan_entitlements`, `subscriptions`, `subscription_invoices`, `ledger_transactions_usd`, `ledger_transactions_php`, `payment_methods`, `refund_records`)

### Database Field Key Badges:
* `PK` (Primary Key): `#EFF6FF` background, `#1D4ED8` text, `#BFDBFE` border
* `FK` (Foreign Key): `#F5F3FF` background, `#6D28D9` text, `#DDD6FE` border
* `UK` (Unique Key): `#FFFBEB` background, `#B45309` text, `#FDE68A` border
* `IDX` (Index): `#F1F5F9` background, `#475569` text, `#E2E8F0` border

---

## 4. API Catalog Styling (28 Route Groups)
* **HTTP Method Badges**:
  * `GET`: `#ECFDF5` background, `#047857` text, `#A7F3D0` border
  * `POST`: `#EFF6FF` background, `#1D4ED8` text, `#BFDBFE` border
  * `PUT`: `#FFFBEB` background, `#B45309` text, `#FDE68A` border
  * `PATCH`: `#FDF4FF` background, `#A21CAF` text, `#F5D0FE` border
  * `DELETE`: `#FEF2F2` background, `#B91C1C` text, `#FECACA` border

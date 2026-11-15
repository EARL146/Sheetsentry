# Admin Console Design System — SheetSentry

## 1. Overview & Scope
The **Admin Console Design System** governs all multi-tenant administrative and operations screens under `/admin/*` (`03 Admin Console`, Figma Node `2:3` / `4:432`):
- `/admin/overview` (Node `4:430` — Platform KPI Overview & User Growth)
- `/admin/users` (Node `4:538` — Multi-tenant User Management)
- `/admin/uploads` (Node `4:588` — Uploads & Processing Pipeline)
- `/admin/subscriptions` (Node `4:638` — Customer Subscriptions)
- `/admin/ledger` (Node `118:74` — Segregated Dual-Currency Ledger)
- `/admin/storage` (Node `122:191` — Storage Infrastructure & Quotas)
- `/admin/security` (Node `122:358` — Security Audit Logs)
- `/admin/roles` (Node `129:2` — RBAC Permissions Matrix)
- `/admin/settings` (Node `4:690` — System Maintenance & Flags)
- `/admin/operations` (Node `25:2` — Live Connections & Service Health)

---

## 2. Layout & Shell Specifications
* **Sidebar**:
  * Width: Fixed `238px` (`w-[238px]`)
  * Background: `#101C32` (Deeper Midnight, visually distinguishable from customer `#111F37`)
  * Portal Badge: `#23324C` container with `#98B3D6` text and `#334768` border
  * Nav Items: `38px` height, `10px` border radius, `#1E3252` active background, `#C8D5E5` text
  * System Health Card: `#182740` container with active `#16A36A` green pulse indicator
* **Topbar**:
  * Height: `72px`
  * Background: `#FFFFFF` with `#E4E9F1` bottom border
  * Connections Popover Button (Node `25:2`): Live status badge (`4 / 4 connected`)
  * Demo Mode Indicator: `#FFF4DE` badge with `#D99121` text
  * Environment Badge: Monospace `PROD` pill

---

## 3. Dedicated Admin UI Components
* **Dual-Currency Financial Ledger Table**:
  * Strict currency segregation: USD (`$`) vs PHP (`₱`) tabbed ledgers
  * Monospace formatted transaction amounts (`text-right font-mono`)
  * Net Settlement Summary: \$29,460.00 USD / ₱1,620,300.00 PHP (at fixed reference rate \$1 = ₱55)
  * Transaction status chips: `Settled`, `Pending`, `Refunded`
* **RBAC Role Pills**:
  * Super Admin: `#F3E8FF` / `#7E22CE`
  * Operations Lead: `#E0F2FE` / `#0369A1`
  * Compliance Auditor: `#FEF3C7` / `#B45309`
  * Billing Admin: `#DCFCE7` / `#15803D`
  * Support Specialist: `#F1F5F9` / `#475569`
* **Storage Capacity Bars**:
  * Threshold indicators: Normal (<70% `#2563EB`), Warning (70-89% `#D99121`), Critical (>=90% `#DC2626`)
  * Storage breakdown by file type (CSV vs XLSX vs Temporary Preflight Caches)
* **Danger Zone Action Gates**:
  * System purge, tenant lockdown, and global maintenance controls requiring explicit 2-step verification modal.

# SheetSentry — Official Design System Specification (`DESIGN.md`)

This document defines the architecture, tokens, components, and surface separation rules for **SheetSentry**. It provides strict boundaries to ensure the **Public Website**, **Customer App**, **Admin Console**, and **User/Admin Flows** remain visually harmonious with the public website's design language while having clearly separated operational domains.

---

## 1. Surface Isolation & Architecture

SheetSentry is partitioned into four decoupled design domains. Code for one domain must never leak arbitrary styles, backgrounds, or layouts into another:

| Surface | Figma Page | Canvas | Primary Navigation | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **01 Public Website** | `1:7` / `3:65` | `#F6F8FC` / `#FFFFFF` | 82px White Header + Mobile Drawer | Marketing, feature education, transparent pricing tiers, and trust. |
| **02 Customer App** | `2:2` / `4:51` | `#F5F7FB` | 238px `#111F37` Dark Sidebar + 76px White Topbar | Spreadsheet upload, schema preflight, rule building, job tracking, and reports. |
| **03 Admin Console** | `2:3` / `4:432` | `#F5F7FB` | 238px `#101C32` Midnight Sidebar + 72px Topbar | User governance, dual-currency ledger, storage monitoring, and RBAC matrix. |
| **04 Flows & Architecture** | `2:4` / `23:2` | `#F8FAFC` / `#0D1726` | Global Surface Switcher + Section Tabs | System topology, state transitions, 42-table MySQL ERD, and REST API catalog. |

---

## 2. Core Foundations & Tokens

### 2.1 Color Palette
* **Primary Brand Blue:** `#2563EB` (Hover: `#1D4ED8`, Light Fill: `#EAF2FF`, Border: `#BFDBFE`)
* **Heading & Accent Navy:** `#10213B` (Public Hero, Section Titles, Table Headings)
* **Dark Contrast Accent:** `#0D1B31` (Public Footer, Midnight Accents)
* **Body Neutral Text:** `#667085` (Descriptive paragraphs, muted meta text)
* **Card Border Subtle:** `#E4E9F1`
* **Success (Healthy / Pass):** `#16A36A` (Fill: `#E8F7EF`, Border: `#B8E6CD`)
* **Warning (Review / Degraded):** `#D99121` (Fill: `#FFF4DE`, Border: `#FDE68A`)
* **Danger (Blocked / Critical):** `#D84A4A` / `#DC2626` (Fill: `#FDECEC`, Border: `#FECACA`)

### 2.2 Typography
* **Sans Font Family:** `'DM Sans', 'Inter', system-ui, -apple-system, sans-serif`
* **Monospace Font Family:** `'JetBrains Mono', 'Fira Code', monospace` (Used for job IDs, CSV row numbers, currency amounts, and SQL data types)

---

## 3. Surface Specifications

### 3.1 Surface 1: Public Website (`01 Public Website`)
* **Header:** Sticky, 82px height, pure `#FFFFFF` background with `#E4E9F1` bottom divider.
* **Hero Section:** Clean light background. H1 utilizes tight tracking (`tracking-tight`) with `leading-[1.08]`.
* **Actionable Results & Preview Cards:** Rounded `22px` radius (`rounded-[22px]`), border `#E4E9F1`, subtle multi-layer drop shadow (`shadow-xl shadow-slate-200/60`).
* **Pricing Grid:** 3-column layout ($0 Free, $5 Starter, $12 Pro). Pro tier features `#F3F7FF` subtle tint with a `#2563EB` border and floating `POPULAR` badge.
* **Footer:** `#0D1B31` dark background with `#9BB0CD` muted navigation links and copyright.

### 3.2 Surface 2: Customer App (`02 Customer App`)
* **Sidebar:** Exactly `238px` fixed width, `#111F37` deep navy background.
  * Workspace Switcher: `#1B2D4B` container with `#273E63` border and `#DCEBFF` avatar.
  * Nav Items: `38px` height, `10px` border radius, `#233E65` active background, `#D6DFEA` text.
  * Quota Meter: `#1B2D4B` background card with `#304766` track and `#2563EB` progress fill.
* **Topbar:** `76px` white topbar with breadcrumb trail, global search input, and profile dropdown.
* **Spreadsheet Previews:** Alternating rows (`#FAFCFF` vs `#FFFFFF`), sticky column headers (`#F8FAFC`), cell error highlights (`#FEF2F2` text `#991B1B` ring `#F87171`).
* **Rule Builder:** Reusable parameter cards with drop-down type selectors (`REQUIRED`, `NUMERIC_RANGE`, `REGEX_MATCH`, `DATE_FORMAT`, `UNIQUE`).

### 3.3 Surface 3: Admin Console (`03 Admin Console`)
* **Sidebar:** Exactly `238px` fixed width, `#101C32` deeper midnight background to clearly differentiate administrative scope from customer workspaces.
* **Topbar:** `72px` white topbar with live `Connections` indicator pill (Node `25:2`), environment badge (`PROD`), and demo indicator tag (`#FFF4DE` / `#D99121`).
* **Financial Ledgers:** Strict segregation between USD (`$`) and PHP (`₱`) ledgers at reference rate `1 USD = 55 PHP`. Formatted in monospace font.
* **RBAC Matrix:** Visual permissions grid across 6 system roles:
  1. Super Admin (`#7E22CE` / `#F3E8FF`)
  2. Operations Lead (`#0369A1` / `#E0F2FE`)
  3. Compliance Auditor (`#B45309` / `#FEF3C7`)
  4. Billing Admin (`#15803D` / `#DCFCE7`)
  5. Support Specialist (`#475569` / `#F1F5F9`)
  6. Workspace Member (`#2563EB` / `#EFF6FF`)
* **Danger Zone:** `#FFF5F5` container with `#DC2626` high-consequence confirmation modals.

### 3.4 Surface 4: User & Admin Flows (`04 User and Admin Flows`)
* **Connected System Topology:** High-level interactive architectural flow mapping Public Site -> Auth Gateway -> Customer Workspace -> Validation Engine -> MySQL 8 -> Admin Console.
* **ERD Visualization:** Color-coded 7-module relational database diagram with Primary Key (`PK`), Foreign Key (`FK`), Unique Key (`UK`), and Index (`IDX`) badges.
* **API Route Catalog:** RESTful endpoints categorized with HTTP verb pills (`GET` Green, `POST` Blue, `PUT` Amber, `DELETE` Red).

---

## 4. Engineering & Implementation Rules
1. **Never merge Customer sidebar styles with Admin sidebar styles.** Keep Customer `#111F37` and Admin `#101C32` segregated.
2. **Never render raw formula injection risks.** All cell contents starting with `=`, `+`, `-`, or `@` must be prepended with a single quote `'` in exports.
3. **Decouple Data Quality Score (DQS) from Processing Eligibility.** A 98.4% score with 1 critical blocking issue must be labeled `BLOCKED_CRITICAL`, never `ELIGIBLE`.
4. **All dollar signs in documentation prose must be escaped as `\$`** to avoid KaTeX LaTeX syntax conflicts.

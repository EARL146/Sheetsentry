# Design System — SheetSentry

## 1. Overview & Multi-Surface Architecture
SheetSentry derives its core design language from the canonical **01 Public Website** (`node 1:7` / `3:65`) and **00 Foundations** (`node 0:1`), maintaining consistent visual harmony, typography, and polish across all surfaces while maintaining strictly separated design tokens and component systems for each operating domain:

1. **Public Website System (`src/design-system/publicTokens.ts`)**: High-contrast, clean light canvas (`#F6F8FC` / `#FFFFFF`), 82px white header, 22px-radius product preview cards, 3-tier pricing cards ($0, $5, $12), and `#0D1B31` dark footer.
2. **Customer App System (`src/design-system/customerTokens.ts`)**: Operational workspace, 238px `#111F37` dark sidebar, `#1B2D4B` workspace switcher, 76px white topbar, spreadsheet table grids, interactive rule builder blocks, and quality score gauges.
3. **Admin Console System (`src/design-system/adminTokens.ts`)**: Multi-tenant administrative governance, 238px `#101C32` deeper midnight sidebar, live connection status pill (`25:2`), segregated dual-currency ledger (USD/PHP), 6-role RBAC permissions, and storage quota monitors.
4. **Flows & Technical Architecture System (`src/design-system/flowsTokens.ts`)**: System topologies, 42-table relational MySQL 8 ERD modules, and 28 RESTful API endpoint route catalog.

---

## 2. Token Segregation Matrix

| Token Domain | Public Website | Customer App | Admin Console | Flows & Architecture |
|---|---|---|---|---|
| **Canvas Background** | `#F6F8FC` / `#FFFFFF` | `#F5F7FB` | `#F5F7FB` | `#F8FAFC` / `#0D1726` |
| **Sidebar / Nav Chrome** | 82px White Header (`#FFFFFF`) | 238px `#111F37` Navy Sidebar | 238px `#101C32` Midnight Sidebar | Global Surface Switcher Bar |
| **Card Borders** | `#E4E9F1` (22px & 18px radii) | `#E4E9F1` (16px radius) | `#E4E9F1` (14px radius) | `#E2E8F0` / `#334155` |
| **Primary Action** | `#2563EB` (h-54px or h-44px) | `#2563EB` (h-44px r-11px) | `#2563EB` (h-40px r-10px) | Node connection badges |
| **Accent Badges** | Healthy `#16A36A`, Issues `#D99121` | Eligibility pills, Grade pills | Role chips, Demo banner | PK, FK, UK, HTTP verbs |

---

## 3. Typography Scale (Public System Grounded)
* **Font Family**:
  * Body & Headings: `'DM Sans', 'Inter', system-ui, -apple-system, sans-serif`
  * Monospace (Job IDs, Cell Refs, Currency, SQL): `'JetBrains Mono', 'Fira Code', monospace`
* **Scale**:
  * Display / Hero: `38px–52px` (leading `1.08`, tracking `-0.02em`)
  * H1 Dashboard / Admin Title: `26px–28px` (leading `1.2`)
  * H2 Section Header: `18px–20px` (leading `1.3`)
  * H3 Card Title: `15px–16px` (leading `1.4`)
  * Body Default: `13px–14px` (leading `1.6`)
  * Meta & Badges: `10px–11px` (bold uppercase tracking `0.06em`)

---

## 4. Component Rules & Isolation Guardrails
1. **No Sidebar Bleed**: Customer App must always use `#111F37` sidebar background with `#1B2D4B` workspace switcher. Admin Console must always use `#101C32` midnight sidebar with `#23324C` portal badge.
2. **Formula Injection Sanitization**: All exported and displayed spreadsheet values starting with `=`, `+`, `-`, or `@` must be safely prepended with a quote character `'`.
3. **Decoupled Quality Score**: High percentage (e.g. 98.4%) must never override critical blocking errors (`BLOCKED_CRITICAL`).
4. **Segregated Currency Ledgers**: USD (`$`) and PHP (`₱`) transactions must be kept strictly segregated at the reference rate of `1 USD = 55 PHP`.

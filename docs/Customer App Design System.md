# Customer App Design System — SheetSentry

## 1. Overview & Scope
The **Customer App Design System** governs all customer-facing operational screens under `/app/*` (`02 Customer App`, Figma Node `2:2` / `4:51` / `10:15`):
- `/app/dashboard` (Node `4:51` — Customer Dashboard)
- `/app/upload` (Node `4:198` — File Upload Dropzone)
- `/app/upload/preflight` (Node `11:305` — Pre-flight Check Inspection)
- `/app/upload/preview` (Node `12:156` — Spreadsheet Preview & Column Mapping)
- `/app/profiles` (Node `4:247` — Validation Profiles Library)
- `/app/profiles/builder` (Node `136:1265` — Visual Rule Builder Sandbox)
- `/app/history` (Node `4:298` — Validation Job History)
- `/app/results/:jobId` (Node `114:2` — Validation Results & Cell Inspection)
- `/app/reports` (Node `4:347` — Downloadable Reports & Compliance Exports)
- `/app/billing` (Node `116:337` — Customer Billing & Tier Upgrade)
- `/app/settings` (Node `118:2` — Workspace & Profile Settings)
- `/app/help` (Node `118:194` — Knowledge Base & Ticket Support)

---

## 2. Layout & Shell Specifications
* **Sidebar**:
  * Width: Fixed `238px` (`w-[238px]`)
  * Background: `#111F37` (Dark Navy)
  * Workspace Selector: `#1B2D4B` container, border `#273E63`, avatar `#DCEBFF` / `#2563EB`
  * Nav Items: `38px` height, `10px` border radius, `#233E65` active background, `#D6DFEA` text
  * Plan Card: `#1B2D4B` container with `#304766` track and `#2563EB` quota meter
* **Topbar**:
  * Height: `76px`
  * Background: `#FFFFFF` with `#E4E9F1` bottom border
  * Breadcrumb: 12px text `#667085` / `#10213B`
  * Global Search: `w-64` search bar with `#F5F7FB` background
  * User Avatar: `#EAF2FF` background with `#2563EB` initials

---

## 3. Dedicated Customer UI Components
* **Spreadsheet Preview Grid**:
  * Alternating row shading: `#FAFCFF` (even) vs `#FFFFFF` (odd)
  * Column Type Indicator Pills: `Text`, `Number`, `Email`, `Date`, `Currency`, `Custom`
  * Cell Issue Highlights:
    * Critical Error: `#FEF2F2` background with `#991B1B` text and `#F87171` inset ring
    * Warning: `#FFFBEB` background with `#92400E` text and `#FBBF24` inset ring
* **Rule Builder Sandbox**:
  * Reusable condition blocks with draggable rows
  * Severity Selector: `CRITICAL` (blocks pipeline) vs `WARNING` (advisory only)
  * Real-time Sandbox Evaluator against uploaded worksheet sample rows
* **Data Quality Score (DQS) Display**:
  * Gauge / Stat Card: Large 32px bold percentage with color-coded status badge
  * Decoupled Processing Eligibility Badge:
    * `ELIGIBLE` (`#E8F7EF` / `#16A36A`)
    * `REVIEW_REQUIRED` (`#FFF4DE` / `#D99121`)
    * `BLOCKED_CRITICAL` (`#FDECEC` / `#D84A4A`)

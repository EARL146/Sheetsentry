# Figma Screen Inventory

## 1. Source Files
- **Figma Design File**: `EaLXKuZ409gE69jAphdxIn` (*SheetSentry — Product Design*)
- **FigJam Flow Board**: `wsZBCPg0yTOBFEt2Roz4DB` (*Customer User Flow & Admin Operations Flow*)

## 2. Page `0:1` — `00 Foundations`
| Node ID | Frame Name | Dimensions | Status / Role |
|---|---|---|---|
| `3:4` | `SheetSentry Foundations Overview` | `1440 x 1360` | Initial light/hybrid design tokens, brand mark, status pills |
| `128:2` | `SheetSentry Design System Foundations — Tokens, Typography, Components & States` | `2080 x 1958` | Reconciled dark/light color system, `Inter` + `JetBrains Mono` scale, 8px spacing grid, interactive states |
| `138:2` | `SheetSentry Master Product Configuration & Business Rules Specification` | `2200 x 1765` | **Proposed SSOT** for plans, DQS math, job lifecycle, worker limits, retention, and admin guardrails |

## 3. Page `1:7` — `01 Public Website`
| Node ID | Frame Name | Dimensions | Route / Purpose |
|---|---|---|---|
| `3:65` | `SheetSentry — Public Landing Page / Desktop 1440` | `1440 x 3560` | `/` Landing hero, stats, features, how it works, pricing preview, FAQ |
| `113:2` | `Landing — How It Works (Fixed Layout Hierarchy)` | `1440 x 620` | **Visual Fix**: Resolves overlapping eyebrow (`top: 1430`) and heading (`top: 1420`) from `3:65` |
| `22:400` | `Public — Features / Desktop 1440` | `1440 x 2600` | `/features` Deep-dive capability cards & comparison matrix |
| `22:479` | `Public — How It Works / Desktop 1440` | `1440 x 2400` | `/how-it-works` 4-step pipeline & security sandbox walkthrough |
| `22:555` | `Public — Pricing / Desktop 1440` | `1440 x 2500` | `/pricing` USD/PHP toggle, Free/Starter/Pro tiers, comparison table (see [[Conflict Register]]) |
| `22:657` | `Public — FAQ / Desktop 1440` | `1440 x 2200` | `/faq` Category filter, search bar, expandable accordions |
| `22:723` | `Public — Auth / Login, Register, Reset` | `1440 x 1024` | `/login`, `/register`, `/reset-password` |
| `119:248` | `SheetSentry Complete Authentication State Machine (13 States)` | `2200 x 1620` | Reconciled auth flows (MFA, lockout, magic link, OAuth, expired token) without hardcoded OTP codes |
| `21:2` | `Responsive — Public Landing / Tablet 768` | `768 x 4200` | Tablet breakpoint layout |
| `21:87` | `Responsive — Public Landing / Mobile 390` | `390 x 4950` | Mobile breakpoint layout |

## 4. Page `2:2` — `02 Customer App`
| Node ID | Frame Name | Dimensions | Route / Purpose |
|---|---|---|---|
| `4:51` | `Customer — Dashboard / Desktop 1440` | `1440 x 1160` | `/app/dashboard` KPI cards, recent validation jobs, quality trend, quick upload |
| `4:211` | `Customer — Upload File / Desktop 1440` | `1440 x 1080` | `/app/upload` Drag-and-drop dropzone, format/size pre-checks, profile selector |
| `116:2` | `Step 1: Pre-Flight Inspection & Worksheet Selection` | `1440 x 980` | `/app/upload/preflight` Encoding, delimiter, magic-byte check, worksheet picker, header row selector |
| `116:120` | `Step 2 & 3: Spreadsheet Preview & Column Mapping` | `1440 x 1080` | `/app/upload/preview` Interactive grid preview, auto-matched column mapping, type & required badges |
| `4:312` | `Customer — Validation Rules & Profiles` | `1440 x 1120` | `/app/profiles` Saved profiles catalog, version badges, rule counts |
| `115:127` | `Rule Builder & Sandbox (Interactive Profile Editor)` | `1600 x 1180` | `/app/profiles/builder` 5-row live test sandbox, severity selector, regex builder, version diff |
| `136:339` | `Customer Rules Guardrails & Mobile Activity (Fixed Clipping)` | `1440 x 960` | **Visual Fix**: Corrected badge/table overflow on rules & mobile cards |
| `10:2` | `Customer — Validation Results & Issue Inspector` | `1440 x 1240` | `/app/results/:jobId` DQS breakdown, Eligibility banner, row/cell error table, filter by severity |
| `10:155` | `Customer — Reports & Exports` | `1440 x 1024` | `/app/reports` Sanitized CSV export, Executive PDF summary, JSON audit payload |
| `11:2` | `Customer — Run History & Job Queue` | `1440 x 1080` | `/app/history` & `/app/jobs/:jobId` Searchable job log, state machine timeline, retry/cancel |
| `11:130` | `Customer — Billing, Plans & Usage` | `1440 x 1180` | `/app/billing` Quota meters, USD/PHP invoice history, plan upgrade/downgrade modal |
| `118:192` | `Customer Billing Edge Cases & Downgrade Grace Period` | `1600 x 1080` | 7-day read-only excess profile lock, quota exhaustion banner, payment retry grace |
| `11:260` | `Customer — Workspace Settings` | `1440 x 1080` | `/app/settings` Profile, workspace members, API keys, webhooks, notification preferences |
| `114:2` / `136:176` | `Customer Settings — Reconciled Alignment & Responsive` | `1440 x 1120` | **Visual Fix**: Reconciled form grid alignment |
| `117:2` | `Customer — Help Center & Documentation Portal` | `1440 x 1080` | `/app/help` Rule reference, error code dictionary, troubleshooting guides |

## 5. Page `2:3` — `03 Admin Console`
| Node ID | Frame Name | Dimensions | Route / Purpose |
|---|---|---|---|
| `4:430` | `Admin — Overview Dashboard / Desktop 1440` | `1440 x 1180` | `/admin/overview` Platform KPIs, queue throughput, explicit `DEMO DATA` badge |
| `12:2` | `Admin — User & Workspace Management` | `1440 x 1120` | `/admin/users` Tenant table, status filters, seat/quota overrides |
| `115:2` | `Admin — User Detail & Ticket-Gated Inspection Drawer` | `1440 x 1080` | Mandatory Support Ticket ID prompt before viewing any customer metadata/cells |
| `12:80` | `Admin — Upload Pipeline & DLQ Monitor` | `1440 x 1120` | `/admin/uploads` Worker nodes, active jobs, Dead-Letter Queue (DLQ) replay, quarantine |
| `12:156` | `Admin — Subscriptions & Plan Entitlements` | `1440 x 1120` | `/admin/subscriptions` Plan distribution, MRR by tier, entitlement overrides |
| `114:209` / `136:1265` | `Admin — Multi-Currency Payments Ledger & Refund Governance` | `1600 x 1180` | `/admin/payments` Strictly isolated USD (`$`) and PHP (`₱`) ledgers + Dual-Admin refund approval (`> $500`) |
| `12:240` / `118:2` | `Admin — Storage Monitoring & Retention Lifecycle` | `1440 x 1120` | `/admin/storage` S3 bucket tiers, lifecycle purge scheduler, legal hold freeze |
| `13:2` | `Admin — Security & Immutable Audit Logs` | `1440 x 1160` | `/admin/security` Threat events, formula-injection blocks, hash-chained audit trail |
| `13:95` / `117:150` | `Admin — Roles & Permissions (6 Core Roles Matrix)` | `1440 x 1120` | `/admin/roles` Super Admin, Platform Ops, SecOps, Billing Admin, Support L2, Support Read-Only |
| `13:180` | `Admin — System Settings & Feature Flags` | `1440 x 1080` | `/admin/settings` Worker ceilings, maintenance mode, global rate limits |
| `20:2` / `21:905` | `Admin — Operations & Connections Center` | `1440 x 1120` | `/admin/operations` Service health (`DEMO DATA`), Stripe/PayMongo/S3/Redis/ClamAV connectors, incident banner |

## 6. Page `2:4` — `04 User and Admin Flows`
| Node ID | Frame Name | Purpose |
|---|---|---|
| `5:2` | `End-to-End Customer & Admin Swimlane Flows` | Visual swimlanes matching FigJam `wsZBCPg0yTOBFEt2Roz4DB` |
| `23:2` | `System Architecture & Worker Pipeline Overview` | Initial system diagram superseded/expanded by `122:2` |
| `122:2` | `Master Cloud Infrastructure & 15-Point Security Control Matrix` | Production network topology, WAF, ClamAV, worker sandbox, KMS encryption |
| `136:1565` | `Reconciled Production Database ERD — 42 Tables Across 7 Domains` | Full relational schema inventory for Phase 4 MySQL 8 implementation |
| `136:1683` | `Reconciled REST API Architecture — 28 Route Groups` | Complete endpoint specification for Phase 3 backend |
| `136:1843` | `Developer Handoff, State Machines & 16-Domain QA Matrix` | 10 formal state machines & 16 QA verification domains |

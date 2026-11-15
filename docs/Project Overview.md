# Project Overview — SheetSentry

## 1. Executive Summary
**SheetSentry** is a production-oriented SaaS spreadsheet validation, pre-ingestion preflight, and data quality enforcement platform designed for operations, finance, HR, and data engineering teams. It enables organizations to validate CSV and XLSX uploads against configurable schema and business rules before data enters downstream ERP, CRM, or warehouse systems.

## 2. Official Sources of Truth
- **Main Figma File**: `EaLXKuZ409gE69jAphdxIn` (*SheetSentry — Product Design*)
  - `00 Foundations` (`0:1`)
  - `01 Public Website` (`1:7`)
  - `02 Customer App` (`2:2`)
  - `03 Admin Console` (`2:3`)
  - `04 User and Admin Flows` (`2:4`)
  - `Master Product Configuration & Business Rules Specification` (`138:2`)
  - `Architecture & 15-Point Security Control Matrix` (`122:2`)
  - `Reconciled Production Database ERD — 42 Tables Across 7 Domains` (`136:1565`)
  - `Reconciled REST API Architecture — 28 Route Groups` (`136:1683`)
  - `Developer Handoff, State Machines & 16-Domain QA Matrix` (`136:1843`)
- **Official FigJam Flow Board**: `wsZBCPg0yTOBFEt2Roz4DB` (*Customer User Flow & Admin Operations Flow*)

## 3. Core Product Capabilities
1. **Multi-Stage Ingestion & Preflight**:
   - Magic-byte verification (`50 4B 03 04` for XLSX, UTF-8/ASCII validation for CSV), file size ceiling checks per subscription tier, zip-bomb expansion ratio protection (`<= 25:1`), and worksheet/header-row selection.
2. **Interactive Column Mapping & Schema Profiles**:
   - Fuzzy header auto-mapping, required/optional field enforcement, reusable versioned Validation Profiles (`v1`, `v2`, `v3`), and a 5-row live Rule Builder Sandbox.
3. **Deterministic Validation Engine & Formula Injection Shield**:
   - Evaluates Required, Data Type, Regex, Uniqueness/Duplicate, Numeric/Date Range, Enum, and Cross-Column conditional rules.
   - Never executes spreadsheet formulas (`=SUM`, `=CMD`, etc.) and neutralizes leading `=`, `+`, `-`, `@`, `\t`, and `\r` characters on export.
4. **Separated Quality Scoring & Processing Eligibility**:
   - Computes Data Quality Score (`DQS`), Validation Grade (`A`, `B`, `C`, `Fail`), and Processing Eligibility (`ELIGIBLE`, `REVIEW_REQUIRED`, `BLOCKED_CRITICAL`) independently so a high numerical score never masks a critical blocking error.
5. **Dual-Portal Governance (Customer App + Admin Console)**:
   - Customer workspace portal for uploads, validation runs, reports, and billing (USD & PHP).
   - Admin governance console with 6 RBAC roles, isolated multi-currency ledgers, dual-admin refund approval (`> $500 USD`), storage lifecycle monitoring, and support-ticket-gated cell inspection.

## 4. Related Vault Notes
- [[Requirements and Scope]]
- [[Figma Screen Inventory]]
- [[Design System]]
- [[Application Architecture]]
- [[Architecture Decision Records]]
- [[Conflict Register]]
- [[Frontend Implementation Progress]]
- [[API Contract]]
- [[Database Design]]
- [[Security Design]]
- [[Testing and QA]]
- [[Deployment Notes]]

# SheetSentry

**SheetSentry** is a spreadsheet validation and pre-ingestion data quality SaaS built with React, TypeScript, Express, and MySQL. It checks recurring CSV and Excel (`.xlsx`) files against reusable validation rules before they enter downstream workflows, flags row- and cell-level issues, neutralizes dangerous spreadsheet formulas, and exports styled multi-sheet Excel and clean CSV reports.

## Key Features

- **Public Website & Role-Based Authentication**: Product landing page with an interactive 3D hero stage, feature overview, `USD` / `PHP` pricing comparison, and login/registration flows backed by Express & MySQL (`bcryptjs` password hashing).
- **CSV & Native `.xlsx` Ingestion**: Parses uploaded CSV and `.xlsx` spreadsheets with automatic column preview, schema mapping, and pre-flight inspection before running full validation.
- **Validation Profiles & Rule Builder**: Create and manage reusable validation schemas with required-field, data-type, range, enum, uniqueness, and formula-safety checks.
- **Formula Injection Shield**: Automatically detects and neutralizes executable spreadsheet prefixes (`=`, `+`, `-`, `@`) in exported data.
- **Clean Export Studio**:
  - **Styled Multi-Sheet Excel Report (`.xlsx`)** with separated *Executive Summary*, *Issues & Fixes*, *Column Health*, and *Sanitized Data* tabs.
  - **Sanitized Clean CSV** and **Error & Remediation CSV** (UTF-8 BOM formatted for Excel and WPS Office).
  - **JSON Validation Manifest** and print-ready summary view.
- **Admin Console**: Isolated administrative overview, user/subscription monitoring, and operations design surface separated from customer accounts.
- **Separated Phone & Desktop UI**: Dedicated mobile navigation drawer, 5-tab bottom dock, and card-based issue lists for phones alongside a full multi-column workspace and data tables on desktop.

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express 5, TypeScript (`tsx`), MySQL (`mysql2`)
- **Testing & Tooling**: Vitest, `tsc`

## Getting Started

```bash
# 1. Copy environment template and configure your local database settings
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run the Express API server
npm run server

# 4. Run the Vite development server
npm run dev

# 5. Run unit and API tests
npm test

# 6. Build for production
npm run build
```

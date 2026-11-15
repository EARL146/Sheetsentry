/**
 * Separated Text Dictionary Layer (Zero HTML/CSS, Zero UI Logic)
 * Populates [data-ss-text="..."] targets cleanly on static blueprints.
 */

window.SS_TEXT = {
  public: {
    eyebrow: 'SPREADSHEET PRE-INGESTION VALIDATION',
    headline: 'Validate every spreadsheet before it breaks downstream pipelines.',
    subhead:
      'Inspect CSV and Excel workbooks for missing headers, duplicate identifiers, invalid types, and unsafe formulas before import.',
    primaryCta: 'Start validating free',
    secondaryCta: 'See how it works',
    previewFile: 'Q4_Payroll_Submission.xlsx',
    previewScore: '86%',
  },
  customer: {
    breadcrumb: 'Workspace / Dashboard',
    title: 'Workspace Overview',
    subtitle: 'Track recent file checks, data quality scores, and validation profiles.',
    dropTitle: 'Drop workbook to launch structural preflight',
  },
  admin: {
    breadcrumb: 'Platform / Payments Ledger',
    title: 'Multi-Currency Payments Ledger',
    badge: 'SEGREGATED USD & PHP LEDGERS',
    usdVolume: '$14,820.00 USD',
    phpVolume: '₱815,100.00 PHP',
  },
  flows: {
    eyebrow: '04 SYSTEM FLOWS & TECHNICAL ARCHITECTURE',
    title: 'Connected Surface Topology, Relational Schema & API Catalog',
    subtitle: 'Unified product architecture derived cleanly from Public Website visual tokens.',
  },
};

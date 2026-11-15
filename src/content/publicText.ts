/**
 * Separated Text Layer — 01 Public Website Copy
 * Clean customer-facing product copy with zero internal debug references.
 */

export const PUBLIC_HERO_TEXT = {
  eyebrow: 'SPREADSHEET PRE-INGESTION VALIDATION',
  heading: 'Validate every spreadsheet before it breaks downstream pipelines.',
  subheading:
    'Inspect XLSX, XLS, and CSV files for missing headers, duplicate identifiers, invalid types, and unsafe formulas — then review a structured report before import.',
  primaryCta: 'Start validating free',
  secondaryCta: 'See how it works',
  trustItems: [
    'Multi-format CSV & Excel parsing',
    'Formula injection neutralization',
    'Deterministic rule scorecards',
    'Clean sanitized CSV exports',
  ],
} as const;

export const PUBLIC_PREVIEW_TEXT = {
  fileName: 'Q4_Payroll_Submission.xlsx',
  profileTag: 'Payroll Profile v3',
  scoreLabel: 'Data Quality Score',
  scoreValue: '86%',
  scoreNote: 'Grade B · Weighted clean-row score',
  issuesLabel: 'Issues to Review',
  issuesValue: '12 rows flagged',
  issuesNote: '4 critical · 8 warnings · formula cells neutralized',
  checksTitle: 'Column verification highlights',
  openReportCta: 'Open full validation workspace →',
} as const;

export const PUBLIC_HERO_3D_TEXT = {
  workspaceLabel: 'LIVE WORKBOOK ENGINE · 3D VIEW',
  fileTitle: 'Monthly sales export',
  fileMeta: 'Checked just now · XLSX & CSV · 1,250 rows',
  scoreLabel: 'DATA QUALITY SCORE',
  scoreBadge: 'Healthy · Grade A',
  scoreValue: '98.4%',
  scoreCaption: '1,230 of 1,250 rows passed',
  issuesLabel: 'Issues to review',
  issuesCount: '20',
  issuesCaption: 'across 3 columns',
  issuesAlert: 'Missing email · 8 rows flagged',
  columnChecksTitle: 'Column verification',
  columnRows: [
    { col: 'Order ID', type: 'Unique Text', status: 'Passed', tone: 'success' as const },
    { col: 'Customer Email', type: 'RFC Email', status: 'Review', tone: 'warning' as const },
    { col: 'Order Date', type: 'ISO-8601', status: 'Review', tone: 'warning' as const },
    { col: 'Formula Guard', type: 'Sanitized', status: 'Blocked =CMD', tone: 'info' as const },
  ],
  formulaShieldTitle: 'Formula Guard',
  formulaShieldSub: '= + - @ Neutralized',
  telemetryCount: '1,250 Rows Verified',
  telemetryLatency: '~1.4s Preflight',
  ctaLabel: 'View full validation report →',
} as const;

export const PUBLIC_PRICING_TEXT = {
  eyebrow: 'SIMPLE PRICING',
  heading: 'Choose the right amount of checking.',
  subheading: 'Start free. Upgrade when recurring spreadsheet work makes it worthwhile.',
  planConfigLabel: 'Plan tier preview & currency',
  ssotModeLabel: 'Standard Limits',
  legacyModeLabel: 'Alternate Legacy Tier',
} as const;

export const PUBLIC_AUTH_TEXT = {
  login: {
    heading: 'Sign in to SheetSentry',
    subheading: 'Access your validation profiles, preflight checks, and audit reports.',
    submitLabel: 'Sign in',
  },
  register: {
    heading: 'Create your free account',
    subheading: 'Start validating workbooks cleanly with reusable schema profiles.',
    submitLabel: 'Create free account',
  },
  reset: {
    heading: 'Reset your password',
    subheading: 'Enter your work email and we will send a secure verification link.',
    submitLabel: 'Send reset link',
  },
  stateExplorerToggle: 'Preview Auth & Onboarding States',
  stateExplorerHeading: 'Authentication & Onboarding State Flows',
  stateExplorerHint: 'Select any state to preview its inline notification banner',
} as const;

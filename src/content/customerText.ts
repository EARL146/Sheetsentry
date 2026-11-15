/**
 * Separated Text Layer — 02 Customer App Copy
 * Production copy for customer workspace, preflight guardrails, DQS vs
 * eligibility semantics, rule sandbox, reports, settings, and help center.
 */

export const CUSTOMER_DASHBOARD_TEXT = {
  title: 'Workspace Overview',
  subtitle: 'Track recent file checks, workspace quota consumption, and quick validation launches.',
  uploadCta: 'Upload workbook',
  recentTitle: 'Recent Validations',
  quickActionsTitle: 'Quick Actions',
  activityTitle: '14-Day Validation Activity',
  configLabel: 'Workspace quota & billing currency',
} as const;

export const CUSTOMER_UPLOAD_TEXT = {
  title: 'Upload Spreadsheet for Validation',
  subtitle: 'Drop a CSV, XLSX, or XLS workbook for structural preflight and schema verification.',
  step1Eyebrow: 'UPLOAD WORKFLOW · STEP 1 OF 3',
  steps23Eyebrow: 'UPLOAD WORKFLOW · STEPS 2 & 3',
  dropzoneTitle: 'Drop your spreadsheet here, or browse local files',
  dropzoneHint: 'Supports CSV, XLSX, and XLS workbooks with automatic UTF-8 & formula sanitization',
  runButtonLabel: 'Run preflight & validate',
  guidanceTitle: 'Before you upload',
} as const;

export const CUSTOMER_RESULTS_TEXT = {
  dqsVsEligibilityTitle: 'Score vs. Processing Eligibility:',
  dqsVsEligibilityBody:
    'A high Data Quality Score does not automatically approve downstream import. Any single Critical or Blocker violation marks the workbook Blocked until resolved.',
  reportsTitle: 'Reports & Sanitized Exports',
  reportsSubtitle:
    'Download clean validation exports with spreadsheet formula neutralization applied automatically.',
  historyTitle: 'Run History & Job Execution Timeline',
  historySubtitle: 'Inspect historical validation jobs and trace deterministic execution stages.',
  billingTitle: 'Billing & Workspace Plans',
  billingSubtitle: 'Manage monthly subscription entitlements, seat limits, and retention windows.',
  downgradeGraceTitle: '7-DAY PLAN DOWNGRADE GRACE PERIOD ACTIVE',
  settingsTitle: 'Workspace & Account Settings',
  settingsSubtitle: 'Configure profile identity, localization currency preference, and run alerts.',
  settingsStickyNoticeTitle: 'Profile & Preference Controls',
  settingsStickyNoticeBody:
    'Changes to workspace timezone, email digests, and currency formatting take effect on your next validation report.',
  helpTitle: 'Help Center & Validation Error Reference',
  helpSubtitle: 'Guides, deterministic rule behaviors, and preflight error recovery documentation.',
} as const;

export const CUSTOMER_PROFILES_RULES_TEXT = {
  profilesTitle: 'Validation Profiles Catalog',
  profilesSubtitle:
    'Reusable column schemas, expected data types, and severity guardrails for recurring spreadsheets.',
  downgradeBanner:
    '7-Day Plan Downgrade Grace Period Active: Existing custom profiles remain readable and exportable while quota adjustments finalize.',
  ruleBuilderEyebrow: 'RULE BUILDER & LIVE SANDBOX',
  ruleBuilderTitle: 'Interactive Rule Authoring & 5-Row Sandbox',
  ruleBuilderSubtitle:
    'Author custom column checks and test immediately against live preview rows before publishing.',
} as const;

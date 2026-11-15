/**
 * Separated Text Layer — 03 Admin Console Copy
 * Production platform administration copy: zero mock node tags, zero debug
 * labels like "REPAIRED LEDGER".
 */

export const ADMIN_BANNER_TEXT = {
  badge: 'PREVIEW ENVIRONMENT',
  title: 'Simulated Platform Telemetry:',
  body: 'Metrics, service health checks, and worker queue counters represent seeded workspace telemetry.',
  engineTag: 'MySQL 8 + Express API Ready',
} as const;

export const ADMIN_PAYMENTS_TEXT = {
  title: 'Multi-Currency Payments Ledger',
  subtitle: 'Track settled subscriptions, workspace upgrades, and invoice status per currency.',
  isolationBadge: 'SEGREGATED USD & PHP LEDGERS',
  noticeTitle: 'Multi-Currency Ledger Isolation:',
  noticeBody:
    'USD ($) and PHP (₱) transactions are accounted in strictly separate ledgers. Totals are never summed across currencies.',
  usdLedgerTitle: 'Settled USD ($) Ledger',
  phpLedgerTitle: 'Settled PHP (₱) Ledger',
  refundTitle: 'Dual-Admin Refund Governance (> $500 USD / > ₱27,500 PHP)',
  refundSubtitle:
    'High-value refunds require independent initialization and second-administrator cryptographic approval.',
} as const;

export const ADMIN_SECTIONS_TEXT = {
  subscriptionsSubtitle:
    'Active workspace subscription distribution across Free, Starter, and Pro tiers.',
  storageSubtitle: 'Object retention windows, compressed workbook footprint, and expiry sweep status.',
  securitySubtitle:
    '15-point platform security posture, CSP policies, and immutable hash-chained audit trail.',
  rbacSubtitle: '6-role administrative permission matrix enforcing least-privilege access governance.',
  settingsSubtitle: 'Global worker memory limits, chunk streaming thresholds, and upload guardrails.',
  settingsWorkerResolution:
    'Standardized streaming ceiling: 1,024 MB hard limit, 850 MB pause backpressure, < 250 MB resident target, 5,000-row streaming chunks.',
  uploadsTitle: 'Upload Pipeline & Worker Monitoring',
  uploadsSubtitle: 'Inspect file intake throughput, worker container health, and dead-letter queue retries.',
  usersTitle: 'Workspace Users & Ticket-Gated Access',
  usersSubtitle: 'Manage workspace accounts and audit support-ticket-gated cell payload unmasking.',
  ticketModalTitle: 'Support-Ticket-Gated Inspection',
  connectionsTitle: 'Platform Service Connections',
  connectionsSubtitle: 'Monitor database, object storage, message bus, and payment provider readiness.',
} as const;

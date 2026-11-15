/**
 * SheetSentry — Centralized Product Configuration & Business Rules SSOT
 *
 * Source of Truth Reference:
 * - Primary SSOT: Figma Node 138:2 ("SheetSentry Master Product Configuration & Business Rules Specification v1.0")
 * - Conflict Comparison: Figma Node 22:555 ("Public — Pricing") & Node 116:2 ("Preflight Banner")
 *
 * IMPORTANT: Commercial and operational conflicts between older wireframes (22:555) and
 * the Master Product Configuration (138:2) are preserved here as configurable modes and
 * marked PROVISIONAL pending final owner sign-off (see docs/Conflict Register.md).
 */

export type CurrencyCode = 'USD' | 'PHP';
export type PlanTierId = 'free' | 'starter' | 'pro';
export type ConfigSourceMode = 'SSOT_138_2' | 'LEGACY_22_555';

export type ValidationGrade = 'A' | 'B' | 'C' | 'FAIL' | 'N/A';
export type ProcessingEligibility = 'ELIGIBLE' | 'REVIEW_REQUIRED' | 'BLOCKED_CRITICAL';

export type JobLifecycleState =
  | 'UPLOADED'
  | 'SCANNING'
  | 'VALIDATING'
  | 'SCORING'
  | 'COMPLETED'
  | 'FAILED'
  | 'QUARANTINED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface PlanEntitlement {
  id: PlanTierId;
  name: string;
  tagline: string;
  priceUsdMonthly: number;
  pricePhpMonthly: number;
  maxSeats: number;
  maxFileSizeMb: number;
  maxRowsPerFile: number;
  monthlyValidations: number | 'UNLIMITED';
  fairUseCeilingMonthly?: number;
  maxProfiles: number | 'UNLIMITED';
  storageLimitLabel: string;
  retentionDays: number;
  badge?: string;
  isProvisionalConflict: boolean;
  conflictNote?: string;
  features: string[];
}

export const FX_REFERENCE_RATE_USD_TO_PHP = 55.0; // Node 138:2 Section 1 benchmark ($1 = ₱55)

/**
 * Proposed SSOT Plan Matrix from Node 138:2 (Master Product Configuration v1.0)
 */
export const PLANS_SSOT_138_2: Record<PlanTierId, PlanEntitlement> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'For individual analysts testing pre-ingestion validation rules.',
    priceUsdMonthly: 0,
    pricePhpMonthly: 0,
    maxSeats: 1,
    maxFileSizeMb: 5, // Conflict CR-001: 5 MB in 138:2 vs 10 MB in 22:555
    maxRowsPerFile: 10000,
    monthlyValidations: 3,
    maxProfiles: 1,
    storageLimitLabel: '100 MB (7-day auto-purge)',
    retentionDays: 7,
    isProvisionalConflict: true,
    conflictNote: 'CR-001: Master Config (138:2) specifies 5 MB / 10k rows; older Pricing screen (22:555) listed 10 MB.',
    features: [
      '1 Workspace Seat',
      'Up to 5 MB per file (10,000 rows max)',
      '3 Validation runs per month',
      '1 Saved Validation Profile',
      'CSV & XLSX Magic-Byte Preflight',
      '7-day report & log retention',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For small operations teams validating recurring weekly imports.',
    priceUsdMonthly: 5,
    pricePhpMonthly: 280,
    maxSeats: 3,
    maxFileSizeMb: 50,
    maxRowsPerFile: 100000,
    monthlyValidations: 50,
    maxProfiles: 5,
    storageLimitLabel: '2 GB Active Storage',
    retentionDays: 30,
    badge: 'Most Popular for SMBs',
    isProvisionalConflict: false,
    features: [
      'Up to 3 Workspace Seats',
      'Up to 50 MB per file (100,000 rows max)',
      '50 Validation runs per month',
      '5 Versioned Validation Profiles',
      'Sanitized CSV & Error-Only Exports',
      '30-day report & audit retention',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For high-volume data ops & enterprise ingestion pipelines.',
    priceUsdMonthly: 12,
    pricePhpMonthly: 670,
    maxSeats: 10,
    maxFileSizeMb: 250,
    maxRowsPerFile: 1000000,
    monthlyValidations: 'UNLIMITED', // Conflict CR-002: Unlimited in 138:2 vs 300/mo in 22:555 & 116:2
    fairUseCeilingMonthly: 5000,
    maxProfiles: 20,
    storageLimitLabel: '10 GB Active Storage',
    retentionDays: 90,
    badge: 'Recommended for Ops Teams',
    isProvisionalConflict: true,
    conflictNote: 'CR-002: Master Config (138:2) specifies Unlimited Validations (5,000 fair-use); Pricing (22:555) & Preflight (116:2) listed 300/month.',
    features: [
      'Up to 10 Workspace Seats',
      'Up to 250 MB per file (1,000,000 rows max)',
      'Unlimited Validations (Provisional SSOT 138:2)',
      '20 Versioned Profiles + Live Rule Sandbox',
      'REST API Keys & Webhook Notifications',
      '90-day retention + Executive JSON/PDF Audit',
    ],
  },
};

/**
 * Legacy Wireframe Plan Matrix from Node 22:555 (Public Pricing)
 */
export const PLANS_LEGACY_22_555: Record<PlanTierId, PlanEntitlement> = {
  free: {
    ...PLANS_SSOT_138_2.free,
    maxFileSizeMb: 10,
    features: [
      '1 Workspace Seat',
      'Up to 10 MB per file (Legacy 22:555 value)',
      '3 Validation checks per month',
      '1 Validation Profile',
      '100 MB Storage Ceiling',
      '7-day retention',
    ],
  },
  starter: {
    ...PLANS_SSOT_138_2.starter,
  },
  pro: {
    ...PLANS_SSOT_138_2.pro,
    monthlyValidations: 300,
    features: [
      'Up to 10 Workspace Seats',
      'Up to 250 MB per file',
      '300 Validation checks per month (Legacy 22:555 value)',
      '20 Validation Profiles',
      '10 GB Storage Ceiling',
      '90-day retention',
    ],
  },
};

export function getPlansByMode(mode: ConfigSourceMode): Record<PlanTierId, PlanEntitlement> {
  return mode === 'SSOT_138_2' ? PLANS_SSOT_138_2 : PLANS_LEGACY_22_555;
}

/**
 * Section 3 (Node 138:2): Data Quality Score (DQS) Mathematical Formula & Grade Bands
 *
 * Formula:
 *   DQS = max(0, 100 - [(1.0 * N_crit + 0.3 * N_warn) / TotalEvaluatedRows * 100])
 *
 * Rules:
 *   - Evaluated on distinct rows containing >=1 Critical Error (N_crit) or >=1 Warning only (N_warn).
 *   - Completely empty trailing rows are excluded from TotalEvaluatedRows.
 *   - If TotalEvaluatedRows === 0, score is null and grade is 'N/A'.
 *   - CRITICAL SEPARATION REQUIREMENT: Processing Eligibility is computed independently from DQS.
 *     Even if DQS >= 95% (Grade A), any blocking Critical Error (N_crit > 0) sets
 *     processingEligibility = 'BLOCKED_CRITICAL'.
 */
export interface QualityEvaluationSummary {
  totalEvaluatedRows: number;
  cleanRowsCount: number;
  criticalRowsCount: number;
  warningOnlyRowsCount: number;
  totalCriticalIssues: number;
  totalWarningIssues: number;
  formulaInjectionCount: number;
  dataQualityScore: number | null;
  validationGrade: ValidationGrade;
  processingEligibility: ProcessingEligibility;
  eligibilityReason: string;
}

export function calculateQualityAndEligibility(params: {
  totalEvaluatedRows: number;
  criticalRowsCount: number;
  warningOnlyRowsCount: number;
  totalCriticalIssues?: number;
  totalWarningIssues?: number;
  formulaInjectionCount?: number;
}): QualityEvaluationSummary {
  const {
    totalEvaluatedRows,
    criticalRowsCount,
    warningOnlyRowsCount,
    totalCriticalIssues = criticalRowsCount,
    totalWarningIssues = warningOnlyRowsCount,
    formulaInjectionCount = 0,
  } = params;

  if (totalEvaluatedRows <= 0) {
    return {
      totalEvaluatedRows: 0,
      cleanRowsCount: 0,
      criticalRowsCount: 0,
      warningOnlyRowsCount: 0,
      totalCriticalIssues: 0,
      totalWarningIssues: 0,
      formulaInjectionCount: 0,
      dataQualityScore: null,
      validationGrade: 'N/A',
      processingEligibility: 'REVIEW_REQUIRED',
      eligibilityReason: 'Dataset contains 0 evaluable data rows after header extraction.',
    };
  }

  const penaltyPoints = 1.0 * criticalRowsCount + 0.3 * warningOnlyRowsCount;
  const rawScore = 100 - (penaltyPoints / totalEvaluatedRows) * 100;
  const clampedScore = Math.max(0, Math.min(100, Number(rawScore.toFixed(2))));

  let validationGrade: ValidationGrade;
  if (clampedScore >= 95.0) {
    validationGrade = 'A';
  } else if (clampedScore >= 85.0) {
    validationGrade = 'B';
  } else if (clampedScore >= 70.0) {
    validationGrade = 'C';
  } else {
    validationGrade = 'FAIL';
  }

  // Processing Eligibility is strictly separated from numerical DQS and Grade:
  let processingEligibility: ProcessingEligibility;
  let eligibilityReason: string;

  if (criticalRowsCount > 0 || totalCriticalIssues > 0) {
    processingEligibility = 'BLOCKED_CRITICAL';
    eligibilityReason = `Blocked from automated ingestion: ${totalCriticalIssues} critical blocking error(s) across ${criticalRowsCount} row(s). High DQS (${clampedScore.toFixed(2)}%) does not override critical schema/business errors.`;
  } else if (warningOnlyRowsCount > 0 || totalWarningIssues > 0 || validationGrade !== 'A') {
    processingEligibility = 'REVIEW_REQUIRED';
    eligibilityReason = `No blocking critical errors, but ${totalWarningIssues} non-blocking warning(s) across ${warningOnlyRowsCount} row(s) require operator review.`;
  } else {
    processingEligibility = 'ELIGIBLE';
    eligibilityReason = 'All evaluated rows passed critical and warning rules. Cleared for downstream ingestion.';
  }

  const cleanRowsCount = Math.max(
    0,
    totalEvaluatedRows - criticalRowsCount - warningOnlyRowsCount
  );

  return {
    totalEvaluatedRows,
    cleanRowsCount,
    criticalRowsCount,
    warningOnlyRowsCount,
    totalCriticalIssues,
    totalWarningIssues,
    formulaInjectionCount,
    dataQualityScore: clampedScore,
    validationGrade,
    processingEligibility,
    eligibilityReason,
  };
}

/**
 * Section 7 (Node 138:2): Worker Resource & Streaming Execution Ceilings
 */
export const WORKER_RESOURCE_SPEC = {
  containerMemoryCeilingMb: 1024,
  residentOperationalTargetMb: 250,
  backpressurePauseThresholdMb: 850,
  maxVcpuPerWorker: 2,
  streamingChunkRows: 5000,
  memoryCheckpointIntervalRows: 2000,
  hardExecutionTimeoutSeconds: 300,
  maxRetryAttempts: 3,
  retryBackoffSeconds: [5, 15, 45],
  maxZipExpansionRatio: 25,
};

/**
 * Conflict Register Summary exposed to the UI for transparency
 */
export interface ConflictRegisterItem {
  id: string;
  title: string;
  affectedNodes: string[];
  legacyValue: string;
  ssotValue: string;
  proposedSource: string;
  requiresOwnerApproval: boolean;
  resolutionSummary: string;
}

export const CONFLICT_REGISTER_ITEMS: ConflictRegisterItem[] = [
  {
    id: 'CR-001',
    title: 'Free Tier Max Upload File Size',
    affectedNodes: ['22:555 (Public Pricing)', '138:2 (Master Product Config)'],
    legacyValue: '10 MB max file size (100 MB storage)',
    ssotValue: '5 MB max file size (10,000 rows)',
    proposedSource: 'Node 138:2 Section 1 (Master Product Config)',
    requiresOwnerApproval: true,
    resolutionSummary: 'Configurable via SSOT / Legacy toggle; defaults to 5 MB (138:2) with provisional badge.',
  },
  {
    id: 'CR-002',
    title: 'Pro Tier Monthly Validation Quota',
    affectedNodes: ['22:555 (Public Pricing)', '116:2 (Upload Preflight)', '138:2 (Master Product Config)'],
    legacyValue: '300 validations / month',
    ssotValue: 'Unlimited validations (5,000/mo fair-use ceiling)',
    proposedSource: 'Node 138:2 Section 1 (Master Product Config)',
    requiresOwnerApproval: true,
    resolutionSummary: 'Configurable via SSOT / Legacy toggle; surfaced on Pricing, Preflight, and Billing.',
  },
  {
    id: 'CR-003',
    title: 'Database Table Count & Target Engine',
    affectedNodes: ['122:2 (32 Tables)', '136:1565 (42 Tables Reconciled ERD)'],
    legacyValue: '32 Core Tables / PostgreSQL label',
    ssotValue: '42 Core Tables Across 7 Domains / MySQL 8 + phpMyAdmin',
    proposedSource: 'Node 136:1565 + Master Prompt Section 3',
    requiresOwnerApproval: false,
    resolutionSummary: 'Full 42-table inventory mapped to MySQL 8 InnoDB for Phase 4 implementation.',
  },
  {
    id: 'CR-004',
    title: 'REST API Route Group Count',
    affectedNodes: ['122:358 (23 Route Groups)', '136:1683 (28 Route Groups)'],
    legacyValue: '23 Route Groups',
    ssotValue: '28 Reconciled Route Groups',
    proposedSource: 'Node 136:1683 (Reconciled REST API Spec)',
    requiresOwnerApproval: false,
    resolutionSummary: 'Includes SecOps, GDPR, Ticket-Gated Access, and Dual-Approval Refund route groups.',
  },
  {
    id: 'CR-005',
    title: 'Worker Container Memory Limits',
    affectedNodes: ['23:2 (Early Flow)', '122:2 & 138:2 Section 7'],
    legacyValue: '512 MB unsegmented worker',
    ssotValue: '1,024 MB hard ceiling / 850 MB pause / <250 MB resident / 5,000-row chunk',
    proposedSource: 'Node 138:2 Section 7',
    requiresOwnerApproval: true,
    resolutionSummary: 'Standardized in Admin System Settings and worker preflight simulator.',
  },
  {
    id: 'CR-006',
    title: 'Admin Telemetry & Multi-Currency Ledger Isolation',
    affectedNodes: ['4:430 (Admin Overview)', '12:156', '114:209 & 136:1265 (Reconciled Payments)'],
    legacyValue: 'Blended currency totals & unbadged prototype metrics',
    ssotValue: 'Isolated USD ($) & PHP (₱) ledgers + Dual-Admin refund > $500 + DEMO DATA badges',
    proposedSource: 'Nodes 114:209, 136:1265 & Master Prompt Section 5',
    requiresOwnerApproval: false,
    resolutionSummary: 'All Admin views badge mock telemetry and separate USD and PHP ledgers.',
  },
];

export function formatPlanPrice(plan: PlanEntitlement, currency: CurrencyCode): string {
  return currency === 'USD' ? `$${plan.priceUsdMonthly}` : `₱${plan.pricePhpMonthly}`;
}


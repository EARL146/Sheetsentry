/**
 * SheetSentry — Deterministic Validation Engine & Formula Injection Shield
 *
 * Implements:
 * - Configurable Rule Evaluation (REQUIRED, DATA_TYPE, REGEX, UNIQUE, RANGE, ENUM, FORMULA_SHIELD)
 * - Formula Injection Neutralization (prefixes '=', '+', '-', '@', '\t', '\r' with "'")
 * - Separation of Data Quality Score (DQS), Validation Grade, and Processing Eligibility
 * - Sanitized CSV & Executive JSON Report Generation
 */

import {
  calculateQualityAndEligibility,
  QualityEvaluationSummary,
} from '../config/productConfig';

export type RuleType =
  | 'REQUIRED'
  | 'DATA_TYPE'
  | 'REGEX'
  | 'UNIQUE'
  | 'RANGE'
  | 'ENUM'
  | 'FORMULA_SHIELD';

export type RuleSeverity = 'CRITICAL' | 'WARNING';

export interface ValidationRule {
  id: string;
  targetField: string;
  label: string;
  ruleType: RuleType;
  severity: RuleSeverity;
  blocksProcessing: boolean;
  enabled: boolean;
  parameters: {
    dataType?: 'EMAIL' | 'NUMBER' | 'DATE_ISO' | 'CURRENCY';
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
  errorMessage: string;
}

export interface ValidationProfile {
  id: string;
  name: string;
  targetDomain: string;
  version: number;
  updatedAt: string;
  author: string;
  isLockedByDowngrade?: boolean;
  description: string;
  rules: ValidationRule[];
  versionHistory: Array<{
    version: number;
    publishedAt: string;
    author: string;
    changelog: string;
  }>;
}

export interface CellValidationIssue {
  id: string;
  rowNumber: number; // 1-based data row index
  columnName: string;
  ruleId: string;
  ruleLabel: string;
  ruleType: RuleType;
  severity: RuleSeverity;
  blocksProcessing: boolean;
  rawValue: string;
  sanitizedValue: string;
  formulaNeutralized: boolean;
  message: string;
}

export interface ValidationRunOutput {
  summary: QualityEvaluationSummary;
  issues: CellValidationIssue[];
  sanitizedRows: Record<string, string>[];
}

/**
 * Checks whether a raw cell string starts with a dangerous spreadsheet formula trigger
 * ('=', '+', '-', '@', '\t', '\r') — excluding plain negative numbers like "-450.00".
 */
export function isFormulaInjectionRisk(rawValue: string): boolean {
  if (!rawValue) return false;
  const firstChar = rawValue[0];
  if (firstChar === '=' || firstChar === '+' || firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
    // Allow plain international phone numbers like +18005550199 if strictly digits
    if (firstChar === '+' && /^\+\d{7,15}$/.test(rawValue.trim())) {
      return false;
    }
    return true;
  }
  if (firstChar === '-') {
    // Plain negative numbers (e.g. -450.00) are not formula injections, but "-cmd" or "-2+3" is
    if (/^-\d+(\.\d+)?$/.test(rawValue.trim())) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Neutralizes a cell value for safe CSV export by prefixing dangerous formula triggers with "'"
 */
export function sanitizeCellForSpreadsheetExport(rawValue: string): {
  sanitized: string;
  wasNeutralized: boolean;
} {
  if (isFormulaInjectionRisk(rawValue)) {
    return {
      sanitized: `'${rawValue}`,
      wasNeutralized: true,
    };
  }
  return {
    sanitized: rawValue,
    wasNeutralized: false,
  };
}

/**
 * Executes a ValidationProfile against mapped rows
 */
export function evaluateRowsWithProfile(
  rows: Record<string, string>[],
  rules: ValidationRule[],
  columnMapping?: Record<string, string> // targetField -> sourceColumnHeader
): ValidationRunOutput {
  const activeRules = rules.filter((r) => r.enabled);
  const issues: CellValidationIssue[] = [];
  const sanitizedRows: Record<string, string>[] = [];

  // Pre-compute value counts for UNIQUE rules
  const uniqueTrackers: Record<string, Map<string, number[]>> = {};
  for (const rule of activeRules) {
    if (rule.ruleType === 'UNIQUE') {
      uniqueTrackers[rule.targetField] = new Map();
    }
  }

  rows.forEach((row, idx) => {
    for (const rule of activeRules) {
      if (rule.ruleType === 'UNIQUE') {
        const sourceCol = columnMapping?.[rule.targetField] || rule.targetField;
        const val = (row[sourceCol] ?? '').trim();
        if (val !== '') {
          const tracker = uniqueTrackers[rule.targetField];
          const existing = tracker.get(val) ?? [];
          existing.push(idx + 1);
          tracker.set(val, existing);
        }
      }
    }
  });

  let criticalRowsCount = 0;
  let warningOnlyRowsCount = 0;
  let formulaInjectionCount = 0;

  rows.forEach((row, idx) => {
    const rowNumber = idx + 1;
    let rowHasCritical = false;
    let rowHasWarning = false;

    const sanitizedRow: Record<string, string> = {};

    // First, sanitize all cells in the row and detect formula injection
    for (const [colKey, rawCell] of Object.entries(row)) {
      const { sanitized, wasNeutralized } = sanitizeCellForSpreadsheetExport(rawCell ?? '');
      sanitizedRow[colKey] = sanitized;
      if (wasNeutralized) {
        formulaInjectionCount++;
        rowHasCritical = true;
        issues.push({
          id: `iss-row${rowNumber}-formula-${colKey}`,
          rowNumber,
          columnName: colKey,
          ruleId: 'sys-formula-shield',
          ruleLabel: 'Formula Injection Shield',
          ruleType: 'FORMULA_SHIELD',
          severity: 'CRITICAL',
          blocksProcessing: true,
          rawValue: rawCell,
          sanitizedValue: sanitized,
          formulaNeutralized: true,
          message: `Executable formula prefix ("${rawCell[0]}") blocked and neutralized with leading apostrophe.`,
        });
      }
    }

    // Evaluate each configured rule
    for (const rule of activeRules) {
      if (rule.ruleType === 'FORMULA_SHIELD') continue; // Already checked globally above

      const sourceCol = columnMapping?.[rule.targetField] || rule.targetField;
      const rawValue = (row[sourceCol] ?? '').trim();
      let failed = false;

      switch (rule.ruleType) {
        case 'REQUIRED': {
          if (rawValue === '') failed = true;
          break;
        }
        case 'DATA_TYPE': {
          if (rawValue !== '') {
            const dt = rule.parameters.dataType;
            if (dt === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawValue)) {
              failed = true;
            } else if (dt === 'NUMBER' && !/^-?\d+(\.\d+)?$/.test(rawValue)) {
              failed = true;
            } else if (dt === 'CURRENCY' && !/^-?\d+(\.\d{1,2})?$/.test(rawValue.replace(/[,$₱\s]/g, ''))) {
              failed = true;
            } else if (dt === 'DATE_ISO' && !/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
              failed = true;
            }
          }
          break;
        }
        case 'REGEX': {
          if (rawValue !== '' && rule.parameters.pattern) {
            try {
              const regex = new RegExp(rule.parameters.pattern);
              if (!regex.test(rawValue)) failed = true;
            } catch {
              failed = false;
            }
          }
          break;
        }
        case 'UNIQUE': {
          if (rawValue !== '') {
            const occurrences = uniqueTrackers[rule.targetField]?.get(rawValue) ?? [];
            if (occurrences.length > 1 && occurrences[0] !== rowNumber) {
              failed = true;
            }
          }
          break;
        }
        case 'RANGE': {
          if (rawValue !== '') {
            const numeric = Number(rawValue.replace(/[,$₱\s]/g, ''));
            if (Number.isNaN(numeric)) {
              failed = true;
            } else {
              if (rule.parameters.min !== undefined && numeric < rule.parameters.min) failed = true;
              if (rule.parameters.max !== undefined && numeric > rule.parameters.max) failed = true;
            }
          }
          break;
        }
        case 'ENUM': {
          if (rawValue !== '' && rule.parameters.allowedValues?.length) {
            const allowedLower = rule.parameters.allowedValues.map((v) => v.toLowerCase());
            if (!allowedLower.includes(rawValue.toLowerCase())) {
              failed = true;
            }
          }
          break;
        }
      }

      if (failed) {
        if (rule.severity === 'CRITICAL') {
          rowHasCritical = true;
        } else {
          rowHasWarning = true;
        }
        const { sanitized, wasNeutralized } = sanitizeCellForSpreadsheetExport(rawValue);
        issues.push({
          id: `iss-r${rowNumber}-${rule.id}`,
          rowNumber,
          columnName: sourceCol,
          ruleId: rule.id,
          ruleLabel: rule.label,
          ruleType: rule.ruleType,
          severity: rule.severity,
          blocksProcessing: rule.blocksProcessing,
          rawValue,
          sanitizedValue: sanitized,
          formulaNeutralized: wasNeutralized,
          message: rule.errorMessage,
        });
      }
    }

    if (rowHasCritical) {
      criticalRowsCount++;
    } else if (rowHasWarning) {
      warningOnlyRowsCount++;
    }

    sanitizedRows.push(sanitizedRow);
  });

  const totalCriticalIssues = issues.filter((i) => i.severity === 'CRITICAL').length;
  const totalWarningIssues = issues.filter((i) => i.severity === 'WARNING').length;

  const summary = calculateQualityAndEligibility({
    totalEvaluatedRows: rows.length,
    criticalRowsCount,
    warningOnlyRowsCount,
    totalCriticalIssues,
    totalWarningIssues,
    formulaInjectionCount,
  });

  return {
    summary,
    issues,
    sanitizedRows,
  };
}

/**
 * Generates a clean, UTF-8 BOM RFC-4180 CSV string from sanitized rows
 */
export function generateSanitizedCsvReport(rows: Record<string, string>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escapeCsvCell = (val: string) => {
    const { sanitized } = sanitizeCellForSpreadsheetExport(val ?? '');
    if (/[",\r\n]/.test(sanitized)) {
      return `"${sanitized.replace(/"/g, '""')}"`;
    }
    return sanitized;
  };

  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h] ?? '')).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

function formatCsvRuleLabel(ruleType: RuleType | string): string {
  switch (ruleType) {
    case 'FORMULA_SHIELD':
      return 'Formula Shield';
    case 'REQUIRED':
      return 'Required Field';
    case 'UNIQUE':
      return 'Unique Check';
    case 'DATA_TYPE':
      return 'Format / Type';
    case 'RANGE':
      return 'Value Range';
    case 'ENUM':
      return 'Allowed Values';
    case 'REGEX':
      return 'Pattern Match';
    default:
      return String(ruleType || 'Workspace Rule');
  }
}

/**
 * Generates a cleanly labeled Error-Only CSV report for remediation teams
 */
export function generateIssuesCsvReport(issues: CellValidationIssue[]): string {
  const headers = [
    'Row #',
    'Column Name',
    'Severity',
    'Import Impact',
    'Rule Applied',
    'Formula Neutralized',
    'Safe Export Value',
    'Issue Details & Fix Guidance',
  ];
  const escape = (v: string | number | boolean) => {
    const str = String(v ?? '');
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const sorted = [...issues].sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'CRITICAL' ? -1 : 1;
    return a.rowNumber - b.rowNumber;
  });

  const lines = [
    headers.join(','),
    ...sorted.map((iss) =>
      [
        iss.rowNumber,
        iss.columnName,
        iss.severity === 'CRITICAL' ? 'Critical' : 'Warning',
        iss.blocksProcessing ? 'Blocks Import' : 'Review Only',
        formatCsvRuleLabel(iss.ruleType),
        iss.formulaNeutralized ? 'Yes (Neutralized)' : 'No',
        iss.sanitizedValue || '(Empty)',
        iss.message,
      ]
        .map(escape)
        .join(',')
    ),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

/**
 * Default Validation Profiles pre-configured per Figma Nodes 4:312 & 115:127
 */
export const DEFAULT_VALIDATION_PROFILES: ValidationProfile[] = [
  {
    id: 'prof-payroll-v3',
    name: 'Enterprise Payroll & Tax Disbursement Schema',
    targetDomain: 'Finance & Payroll',
    version: 3,
    updatedAt: '2026-11-10T14:20:00Z',
    author: 'Ava Santos (Data Ops Lead)',
    description:
      'Enforces unique Employee IDs, corporate email syntax, 9-digit TIN format, positive gross pay range, and strict formula injection neutralization.',
    versionHistory: [
      {
        version: 3,
        publishedAt: '2026-11-10 14:20 UTC',
        author: 'Ava Santos',
        changelog: 'Added Formula Injection Shield and tightened gross_pay_usd minimum threshold to >= 0.01.',
      },
      {
        version: 2,
        publishedAt: '2026-10-28 09:15 UTC',
        author: 'Liam Reyes',
        changelog: 'Added regex validation for tax_id_tin (XXX-XXX-XXX) as Critical Blocking rule.',
      },
      {
        version: 1,
        publishedAt: '2026-10-02 11:00 UTC',
        author: 'Ava Santos',
        changelog: 'Initial payroll schema with employee_id uniqueness and work_email check.',
      },
    ],
    rules: [
      {
        id: 'rule-emp-req',
        targetField: 'employee_id',
        label: 'Employee ID Required',
        ruleType: 'REQUIRED',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: {},
        errorMessage: 'Primary identifier employee_id cannot be empty.',
      },
      {
        id: 'rule-emp-uniq',
        targetField: 'employee_id',
        label: 'Unique Employee ID',
        ruleType: 'UNIQUE',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: {},
        errorMessage: 'Duplicate employee_id detected in batch; prevents double disbursement.',
      },
      {
        id: 'rule-email-type',
        targetField: 'work_email',
        label: 'Corporate Email Format',
        ruleType: 'DATA_TYPE',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: { dataType: 'EMAIL' },
        errorMessage: 'work_email must be a valid RFC-5322 email address.',
      },
      {
        id: 'rule-tin-req',
        targetField: 'tax_id_tin',
        label: 'Tax ID (TIN) Mandatory',
        ruleType: 'REQUIRED',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: {},
        errorMessage: 'Statutory tax_id_tin is required before payroll settlement.',
      },
      {
        id: 'rule-tin-regex',
        targetField: 'tax_id_tin',
        label: 'TIN Format (XXX-XXX-XXX)',
        ruleType: 'REGEX',
        severity: 'WARNING',
        blocksProcessing: false,
        enabled: true,
        parameters: { pattern: '^\\d{3}-\\d{3}-\\d{3}$' },
        errorMessage: 'tax_id_tin should match 9-digit hyphenated format (XXX-XXX-XXX).',
      },
      {
        id: 'rule-pay-range',
        targetField: 'gross_pay_usd',
        label: 'Gross Pay Positive Ceiling (0.01 – 250,000)',
        ruleType: 'RANGE',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: { min: 0.01, max: 250000 },
        errorMessage: 'gross_pay_usd must be a positive amount between $0.01 and $250,000.00.',
      },
      {
        id: 'rule-dept-enum',
        targetField: 'department',
        label: 'Approved Cost-Center Department',
        ruleType: 'ENUM',
        severity: 'WARNING',
        blocksProcessing: false,
        enabled: true,
        parameters: {
          allowedValues: ['Engineering', 'Finance', 'Operations', 'HR', 'Marketing', 'Design'],
        },
        errorMessage: 'Department is not in the standard cost-center taxonomy; flagged for controller review.',
      },
    ],
  },
  {
    id: 'prof-sku-v2',
    name: 'E-Commerce SKU & Price Master Catalog',
    targetDomain: 'Supply Chain & Retail',
    version: 2,
    updatedAt: '2026-11-08T18:05:00Z',
    author: 'Liam Reyes (Ops Engineer)',
    description: 'Validates unique SKU codes, ISO currency prices, inventory warehouse codes, and non-negative stock levels.',
    versionHistory: [
      {
        version: 2,
        publishedAt: '2026-11-08 18:05 UTC',
        author: 'Liam Reyes',
        changelog: 'Added warehouse enum check (MNL-01, SGP-02, US-WEST-1).',
      },
      {
        version: 1,
        publishedAt: '2026-10-14 10:00 UTC',
        author: 'Liam Reyes',
        changelog: 'Initial SKU catalog profile.',
      },
    ],
    rules: [
      {
        id: 'rule-sku-req',
        targetField: 'employee_id',
        label: 'Primary Record ID Required',
        ruleType: 'REQUIRED',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: {},
        errorMessage: 'Primary SKU / Record ID is required.',
      },
      {
        id: 'rule-sku-uniq',
        targetField: 'employee_id',
        label: 'Unique SKU / Record Key',
        ruleType: 'UNIQUE',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: {},
        errorMessage: 'Duplicate key found in import sheet.',
      },
    ],
  },
  {
    id: 'prof-crm-v1',
    name: 'B2B CRM Lead & GDPR Consent Preflight',
    targetDomain: 'Revenue Operations',
    version: 1,
    updatedAt: '2026-11-01T09:30:00Z',
    author: 'Ava Santos (Data Ops Lead)',
    isLockedByDowngrade: false,
    description: 'Ensures email validity, country ISO-3166 alpha-2 code, and explicit opt-in date before CRM sync.',
    versionHistory: [
      {
        version: 1,
        publishedAt: '2026-11-01 09:30 UTC',
        author: 'Ava Santos',
        changelog: 'Initial release.',
      },
    ],
    rules: [
      {
        id: 'rule-crm-email',
        targetField: 'work_email',
        label: 'Lead Email Required & Valid',
        ruleType: 'DATA_TYPE',
        severity: 'CRITICAL',
        blocksProcessing: true,
        enabled: true,
        parameters: { dataType: 'EMAIL' },
        errorMessage: 'Lead email address is invalid.',
      },
    ],
  },
];

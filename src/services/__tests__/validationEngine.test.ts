import { describe, expect, it } from 'vitest';
import { calculateQualityAndEligibility } from '../../config/productConfig';
import {
  DEFAULT_VALIDATION_PROFILES,
  evaluateRowsWithProfile,
  generateIssuesCsvReport,
  generateSanitizedCsvReport,
  isFormulaInjectionRisk,
  sanitizeCellForSpreadsheetExport,
} from '../validationEngine';
import { parseCsvContentToWorksheet, SAMPLE_DATASETS } from '../spreadsheetParser';
import { generateStyledExcelWorkbook } from '../reportExporter';
import type { ValidationJobRecord } from '../../context/AppStateContext';

describe('SheetSentry Core Validation & Security Engine', () => {
  it('computes Data Quality Score (DQS) accurately per Node 138:2 Section 3 formula', () => {
    // 10 rows total: 2 critical rows (2 * 1.0 = 2.0), 1 warning row (1 * 0.3 = 0.3)
    // DQS = 100 - ((2.3 / 10) * 100) = 77.00% -> Grade C
    const res = calculateQualityAndEligibility({
      totalEvaluatedRows: 10,
      criticalRowsCount: 2,
      warningOnlyRowsCount: 1,
    });
    expect(res.dataQualityScore).toBe(77);
    expect(res.validationGrade).toBe('C');
    expect(res.processingEligibility).toBe('BLOCKED_CRITICAL');
  });

  it('strictly separates high Data Quality Score (Grade A) from Processing Eligibility when a Critical Error exists', () => {
    // 100 rows total with 1 critical blocking row -> DQS = 99.00% (Grade A),
    // but Processing Eligibility MUST be BLOCKED_CRITICAL
    const res = calculateQualityAndEligibility({
      totalEvaluatedRows: 100,
      criticalRowsCount: 1,
      warningOnlyRowsCount: 0,
    });
    expect(res.dataQualityScore).toBe(99);
    expect(res.validationGrade).toBe('A');
    expect(res.processingEligibility).toBe('BLOCKED_CRITICAL');
  });

  it('neutralizes spreadsheet formula injection payloads without breaking negative numbers', () => {
    expect(isFormulaInjectionRisk("=CMD|' /C calc.exe'!A0")).toBe(true);
    expect(isFormulaInjectionRisk('@SUM(A1:A10)')).toBe(true);
    expect(isFormulaInjectionRisk('+2+5')).toBe(true);
    expect(isFormulaInjectionRisk('-450.00')).toBe(false);

    const sanitized = sanitizeCellForSpreadsheetExport("=HYPERLINK(\"http://evil.tld\")");
    expect(sanitized.wasNeutralized).toBe(true);
    expect(sanitized.sanitized.startsWith("'=")).toBe(true);
  });

  it('evaluates sample Q4 Payroll dataset and flags duplicate IDs, missing TIN, invalid email, and formula injection', () => {
    const payrollSheet = SAMPLE_DATASETS.q4_payroll_audit.worksheets[0];
    const profile = DEFAULT_VALIDATION_PROFILES[0];
    const result = evaluateRowsWithProfile(payrollSheet.rows, profile.rules);

    expect(result.summary.totalEvaluatedRows).toBe(10);
    expect(result.summary.formulaInjectionCount).toBeGreaterThanOrEqual(2);
    expect(result.summary.processingEligibility).toBe('BLOCKED_CRITICAL');

    const csvOutput = generateSanitizedCsvReport(result.sanitizedRows);
    expect(csvOutput).toContain("'=CMD");
  });

  it('parses delimited CSV content and ignores empty trailing lines', () => {
    const csv = 'id,email,amount\nEMP-1,a@b.com,100.00\nEMP-2,c@d.com,250.50\n\n';
    const parsed = parseCsvContentToWorksheet(csv, 'TestSheet');
    expect(parsed.delimiter).toBe(',');
    expect(parsed.worksheet.rowCount).toBe(2);
    expect(parsed.worksheet.headers).toEqual(['id', 'email', 'amount']);
  });

  it('generates readable UTF-8 BOM CSV and multi-sheet styled XLSX workbooks without clipped columns', () => {
    const payrollSheet = SAMPLE_DATASETS.q4_payroll_audit.worksheets[0];
    const profile = DEFAULT_VALIDATION_PROFILES[0];
    const evalRes = evaluateRowsWithProfile(payrollSheet.rows, profile.rules);

    const issuesCsv = generateIssuesCsvReport(evalRes.issues);
    expect(issuesCsv.startsWith('\uFEFF')).toBe(true);
    expect(issuesCsv).toContain('Row #,Column Name,Severity,Import Impact,Rule Applied');
    expect(issuesCsv).not.toContain('blocks_processing');

    const job: ValidationJobRecord = {
      id: 'JOB-TEST-01',
      fileName: 'Q4_Payroll.xlsx',
      fileSizeBytes: 24500,
      profileId: profile.id,
      profileName: profile.name,
      profileVersion: profile.version,
      worksheetName: payrollSheet.name,
      state: 'QUARANTINED',
      createdAt: '2026-11-14 23:00:00 UTC',
      completedAt: '2026-11-14 23:00:02 UTC',
      durationMs: 1120,
      workerNode: 'SheetSentry Cloud Validator',
      summary: evalRes.summary,
      issues: evalRes.issues,
      sanitizedRows: evalRes.sanitizedRows,
    };

    const xlsxBytes = generateStyledExcelWorkbook(job, evalRes.issues);
    // Valid PKZIP signature (50 4B 03 04) + EOCD signature present
    expect(xlsxBytes[0]).toBe(0x50);
    expect(xlsxBytes[1]).toBe(0x4b);
    expect(xlsxBytes[2]).toBe(0x03);
    expect(xlsxBytes[3]).toBe(0x04);

    const rawText = new TextDecoder('latin1').decode(xlsxBytes);
    expect(rawText).toContain('1. Executive Summary');
    expect(rawText).toContain('2. Issues &amp; Fixes');
    expect(rawText).toContain('3. Column Health');
    expect(rawText).toContain('4. Sanitized Data');
    expect(rawText).toContain('wrapText="1"');
    expect(rawText).toContain('customWidth="1"');
  });
});

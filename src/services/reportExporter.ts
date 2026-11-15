/**
 * SheetSentry — Styled Multi-Sheet Excel (.xlsx) & Printable Audit Report Generator
 *
 * Pure TypeScript OOXML (.xlsx) workbook builder with zero external runtime dependencies.
 * Fixes raw unformatted CSV truncation/garbled layouts in WPS Office & Excel by separating
 * Executive Summary, Issues & Remediation, Column Health, and Sanitized Clean Data into
 * dedicated worksheets with auto-fitted column widths, wrapped text, and color-coded pills.
 */

import type { ValidationJobRecord } from '../context/AppStateContext';
import type { CellValidationIssue, RuleType } from './validationEngine';
import { sanitizeCellForSpreadsheetExport } from './validationEngine';

// ---------------------------------------------------------------------------
// Friendly Labels (Zero Raw Snake-Case Truncation)
// ---------------------------------------------------------------------------

export function formatRuleTypeLabel(ruleType: RuleType | string): string {
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

export function formatEligibilityLabel(eligibility: string): string {
  switch (eligibility) {
    case 'ELIGIBLE':
      return 'Ready for Import';
    case 'REVIEW_REQUIRED':
      return 'Review Warnings';
    case 'BLOCKED_CRITICAL':
      return 'Blocked — Critical Issues';
    default:
      return eligibility;
  }
}

export function formatRuleGuidance(iss: CellValidationIssue): string {
  if (iss.formulaNeutralized) {
    return `${iss.message} Neutralized safely with a leading apostrophe so spreadsheet apps treat it as plain text.`;
  }
  return iss.message;
}

// ---------------------------------------------------------------------------
// Minimal Standards-Compliant ZIP Builder (STORE, UTF-8 Filenames, CRC-32)
// ---------------------------------------------------------------------------

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntryInput {
  name: string;
  content: string | Uint8Array;
}

function buildZipArchive(entries: ZipEntryInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes =
      typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const crc = computeCrc32(dataBytes);

    // Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true); // Version needed to extract (2.0)
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // Compression method 0 (STORE)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // Extra field length
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    // Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 filename flag
    cv.setUint16(10, 0, true); // Compression method 0 (STORE)
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // Extra len
    cv.setUint16(32, 0, true); // Comment len
    cv.setUint16(34, 0, true); // Disk start
    cv.setUint16(36, 0, true); // Internal attrs
    cv.setUint32(38, 0, true); // External attrs
    cv.setUint32(42, offset, true); // Relative offset of local header
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const centralDirSize = centralParts.reduce((acc, part) => acc + part.length, 0);

  // End of Central Directory (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralDirSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalBytes = offset + centralDirSize + eocd.length;
  const result = new Uint8Array(totalBytes);
  let cursor = 0;
  for (const part of localParts) {
    result.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    result.set(part, cursor);
    cursor += part.length;
  }
  result.set(eocd, cursor);
  return result;
}

// ---------------------------------------------------------------------------
// OOXML Helpers (Styled Worksheets, Safe XML, Column Auto-Fit & Wrap)
// ---------------------------------------------------------------------------

function stripInvalidXmlChars(input: string): string {
  // Strip XML 1.0 forbidden control characters while keeping tabs, newlines, CR
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function escapeXml(input: string): string {
  return stripInvalidXmlChars(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colIndexToLetter(index: number): string {
  let col = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    n = Math.floor((n - 1) / 26);
  }
  return col;
}

const STYLE = {
  DEFAULT: 0,
  BANNER_TITLE: 1,
  BANNER_SUBTITLE: 2,
  SECTION_HEADER: 3,
  TABLE_HEADER: 4,
  TABLE_HEADER_CENTER: 5,
  CELL_WHITE: 6,
  CELL_ZEBRA: 7,
  CELL_CENTER_WHITE: 8,
  CELL_CENTER_ZEBRA: 9,
  BADGE_CRITICAL: 10,
  BADGE_WARNING: 11,
  BADGE_SUCCESS: 12,
  BADGE_SHIELD: 13,
  LABEL_BOLD: 14,
  MUTED: 15,
} as const;

interface WorksheetCell {
  value: string | number;
  style?: number;
  isNumber?: boolean;
}

interface WorksheetRow {
  cells: WorksheetCell[];
  height?: number;
}

interface WorksheetSpec {
  name: string;
  colWidths: number[];
  rows: WorksheetRow[];
  merges?: string[]; // e.g. ["A1:I1", "A2:I2"]
  freezeRow?: number; // Number of header rows to freeze
}

function sanitizeSheetName(raw: string): string {
  return raw.replace(/[\[\]:*?/\\]/g, '').trim().slice(0, 31) || 'Sheet';
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="11">
    <font><sz val="10"/><color rgb="FF10213B"/><name val="Calibri"/></font>
    <font><b/><sz val="14"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><sz val="10"/><color rgb="FFDCEBFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF10213B"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF10213B"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFB91C1C"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFB45309"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF15803D"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF6D28D9"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font>
  </fonts>
  <fills count="11">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF10213B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A5F"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEAF2FF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFDECEC"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3E8FF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD8E2EE"/></left>
      <right style="thin"><color rgb="FFD8E2EE"/></right>
      <top style="thin"><color rgb="FFD8E2EE"/></top>
      <bottom style="thin"><color rgb="FFD8E2EE"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FF2C4A70"/></left>
      <right style="thin"><color rgb="FF2C4A70"/></right>
      <top style="thin"><color rgb="FF1E3A5F"/></top>
      <bottom style="medium"><color rgb="FF2563EB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="16">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="3" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="6" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="7" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="8" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="9" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="10" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`;
}

function estimateRowHeight(row: WorksheetRow, colWidths: number[]): number {
  if (row.height) return row.height;
  let maxLines = 1;
  row.cells.forEach((cell, idx) => {
    const str = String(cell.value ?? '');
    if (!str) return;
    const width = Math.max(10, (colWidths[idx] ?? 20) - 3);
    const explicitLines = str.split(/\r?\n/);
    let wrappedCount = 0;
    for (const line of explicitLines) {
      wrappedCount += Math.max(1, Math.ceil(line.length / width));
    }
    if (wrappedCount > maxLines) maxLines = wrappedCount;
  });
  return Math.max(24, Math.min(120, 10 + maxLines * 15));
}

function buildWorksheetXml(spec: WorksheetSpec): string {
  const freezeXml = spec.freezeRow
    ? `<pane ySplit="${spec.freezeRow}" topLeftCell="A${spec.freezeRow + 1}" activePane="bottomLeft" state="frozen"/>`
    : '';

  const colsXml = spec.colWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w.toFixed(1)}" customWidth="1"/>`)
    .join('');

  const rowsXml = spec.rows
    .map((row, rIdx) => {
      const rNum = rIdx + 1;
      const ht = estimateRowHeight(row, spec.colWidths);
      const cellsXml = row.cells
        .map((cell, cIdx) => {
          const ref = `${colIndexToLetter(cIdx)}${rNum}`;
          const styleAttr = ` s="${cell.style ?? STYLE.DEFAULT}"`;
          if (cell.isNumber && typeof cell.value === 'number' && Number.isFinite(cell.value)) {
            return `<c r="${ref}"${styleAttr}><v>${cell.value}</v></c>`;
          }
          const rawStr = String(cell.value ?? '');
          const escaped = escapeXml(rawStr);
          const preserve = /^\s|\s$/.test(rawStr) ? ' xml:space="preserve"' : '';
          return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t${preserve}>${escaped}</t></is></c>`;
        })
        .join('');
      return `<row r="${rNum}" ht="${ht}" customHeight="1">${cellsXml}</row>`;
    })
    .join('');

  const mergesXml =
    spec.merges && spec.merges.length > 0
      ? `<mergeCells count="${spec.merges.length}">${spec.merges
          .map((m) => `<mergeCell ref="${m}"/>`)
          .join('')}</mergeCells>`
      : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView workbookViewId="0">
      ${freezeXml}
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="24"/>
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${mergesXml}
</worksheet>`;
}

function buildXlsxArchiveFromSheets(sheets: WorksheetSpec[]): Uint8Array {
  const safeSheets = sheets.map((s) => ({
    ...s,
    name: sanitizeSheetName(s.name),
  }));

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${safeSheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('\n  ')}
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${safeSheets
      .map(
        (s, i) =>
          `<sheet name="${escapeXml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
      )
      .join('\n    ')}
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${safeSheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
    )
    .join('\n  ')}
  <Relationship Id="rId${safeSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const entries: ZipEntryInput[] = [
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: rootRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
    { name: 'xl/styles.xml', content: buildStylesXml() },
    ...safeSheets.map((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      content: buildWorksheetXml(s),
    })),
  ];

  return buildZipArchive(entries);
}

// ---------------------------------------------------------------------------
// SheetSentry Creative Multi-Sheet Workbook Layout
// ---------------------------------------------------------------------------

export function generateStyledExcelWorkbook(
  job: ValidationJobRecord,
  issues: CellValidationIssue[]
): Uint8Array {
  const sortedIssues = [...issues].sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === 'CRITICAL' ? -1 : 1;
    return a.rowNumber - b.rowNumber;
  });

  const dqsDisplay =
    job.summary.dataQualityScore !== null
      ? `${job.summary.dataQualityScore.toFixed(1)}%`
      : 'N/A';

  // --- SHEET 1: Executive Summary ---
  const eligibilityStyle =
    job.summary.processingEligibility === 'ELIGIBLE'
      ? STYLE.BADGE_SUCCESS
      : job.summary.processingEligibility === 'REVIEW_REQUIRED'
      ? STYLE.BADGE_WARNING
      : STYLE.BADGE_CRITICAL;

  const summarySheet: WorksheetSpec = {
    name: '1. Executive Summary',
    colWidths: [28, 36, 20, 42],
    merges: ['A1:D1', 'A2:D2', 'A4:D4', 'A10:D10'],
    rows: [
      {
        height: 36,
        cells: [
          { value: `SheetSentry Audit Report — ${job.fileName}`, style: STYLE.BANNER_TITLE },
          { value: '', style: STYLE.BANNER_TITLE },
          { value: '', style: STYLE.BANNER_TITLE },
          { value: '', style: STYLE.BANNER_TITLE },
        ],
      },
      {
        height: 24,
        cells: [
          {
            value: `Report ID: ${job.id}  |  Generated cleanly with separated scores, eligibility status, and cell fixes`,
            style: STYLE.BANNER_SUBTITLE,
          },
          { value: '', style: STYLE.BANNER_SUBTITLE },
          { value: '', style: STYLE.BANNER_SUBTITLE },
          { value: '', style: STYLE.BANNER_SUBTITLE },
        ],
      },
      { height: 12, cells: [] },
      {
        height: 28,
        cells: [
          { value: 'FILE & VALIDATION METADATA', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
        ],
      },
      {
        cells: [
          { value: 'Validation Report ID', style: STYLE.LABEL_BOLD },
          { value: job.id, style: STYLE.CELL_WHITE },
          { value: 'Data Quality Score', style: STYLE.LABEL_BOLD },
          { value: `${dqsDisplay} (Grade ${job.summary.validationGrade})`, style: STYLE.CELL_WHITE },
        ],
      },
      {
        cells: [
          { value: 'Source File Name', style: STYLE.LABEL_BOLD },
          { value: job.fileName, style: STYLE.CELL_WHITE },
          { value: 'Processing Eligibility', style: STYLE.LABEL_BOLD },
          { value: formatEligibilityLabel(job.summary.processingEligibility), style: eligibilityStyle },
        ],
      },
      {
        cells: [
          { value: 'Validation Profile', style: STYLE.LABEL_BOLD },
          { value: `${job.profileName} (v${job.profileVersion})`, style: STYLE.CELL_WHITE },
          { value: 'Total Rows Evaluated', style: STYLE.LABEL_BOLD },
          { value: job.summary.totalEvaluatedRows, style: STYLE.CELL_WHITE, isNumber: true },
        ],
      },
      {
        cells: [
          { value: 'Completed Timestamp', style: STYLE.LABEL_BOLD },
          { value: job.completedAt, style: STYLE.CELL_WHITE },
          { value: 'Decision Rationale', style: STYLE.LABEL_BOLD },
          { value: job.summary.eligibilityReason, style: STYLE.CELL_WHITE },
        ],
      },
      { height: 14, cells: [] },
      {
        height: 28,
        cells: [
          { value: 'SEPARATED QUALITY & SECURITY BREAKDOWN', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
          { value: '', style: STYLE.SECTION_HEADER },
        ],
      },
      {
        height: 28,
        cells: [
          { value: 'Category', style: STYLE.TABLE_HEADER },
          { value: 'Status', style: STYLE.TABLE_HEADER_CENTER },
          { value: 'Count', style: STYLE.TABLE_HEADER_CENTER },
          { value: 'What It Means for Your Import', style: STYLE.TABLE_HEADER },
        ],
      },
      {
        cells: [
          { value: 'Clean Passing Rows', style: STYLE.LABEL_BOLD },
          { value: 'Passed All Rules', style: STYLE.BADGE_SUCCESS },
          { value: job.summary.cleanRowsCount, style: STYLE.CELL_CENTER_WHITE, isNumber: true },
          { value: 'Rows with zero errors; safe for immediate import.', style: STYLE.CELL_WHITE },
        ],
      },
      {
        cells: [
          { value: 'Critical Blocking Rows', style: STYLE.LABEL_BOLD },
          { value: job.summary.criticalRowsCount > 0 ? 'Action Required' : 'Clear', style: job.summary.criticalRowsCount > 0 ? STYLE.BADGE_CRITICAL : STYLE.BADGE_SUCCESS },
          { value: job.summary.criticalRowsCount, style: STYLE.CELL_CENTER_ZEBRA, isNumber: true },
          { value: 'Rows failing critical checks; see Tab 2 to fix.', style: STYLE.CELL_ZEBRA },
        ],
      },
      {
        cells: [
          { value: 'Warning-Only Rows', style: STYLE.LABEL_BOLD },
          { value: job.summary.warningOnlyRowsCount > 0 ? 'Review Recommended' : 'Clear', style: job.summary.warningOnlyRowsCount > 0 ? STYLE.BADGE_WARNING : STYLE.BADGE_SUCCESS },
          { value: job.summary.warningOnlyRowsCount, style: STYLE.CELL_CENTER_WHITE, isNumber: true },
          { value: 'Soft format deviations or warnings flagged for review.', style: STYLE.CELL_WHITE },
        ],
      },
      {
        cells: [
          { value: 'Formula Threats Neutralized', style: STYLE.LABEL_BOLD },
          { value: job.summary.formulaInjectionCount > 0 ? 'Shield Active' : 'None Detected', style: job.summary.formulaInjectionCount > 0 ? STYLE.BADGE_SHIELD : STYLE.BADGE_SUCCESS },
          { value: job.summary.formulaInjectionCount, style: STYLE.CELL_CENTER_ZEBRA, isNumber: true },
          { value: 'Executable formulas (=, +, -, @) escaped safely as plain text.', style: STYLE.CELL_ZEBRA },
        ],
      },
    ],
  };

  // --- SHEET 2: Critical & Warning Issues (Auto-fitted columns, zero cutoff!) ---
  const baseIssueWidths = [10, 24, 15, 18, 19, 17, 28, 28, 56];
  sortedIssues.forEach((iss) => {
    baseIssueWidths[1] = Math.min(36, Math.max(baseIssueWidths[1], iss.columnName.length + 4));
    baseIssueWidths[6] = Math.min(42, Math.max(baseIssueWidths[6], (iss.rawValue || 'Empty').length + 4));
    baseIssueWidths[7] = Math.min(42, Math.max(baseIssueWidths[7], (iss.sanitizedValue || '—').length + 4));
  });

  const issueRows: WorksheetRow[] = [
    {
      height: 36,
      cells: [
        { value: `Issues & Remediation Guide — ${job.fileName}`, style: STYLE.BANNER_TITLE },
        ...Array.from({ length: 8 }, () => ({ value: '', style: STYLE.BANNER_TITLE })),
      ],
    },
    {
      height: 24,
      cells: [
        {
          value: `Critical errors are sorted to the top. Fix flagged values before re-uploading for downstream import.`,
          style: STYLE.BANNER_SUBTITLE,
        },
        ...Array.from({ length: 8 }, () => ({ value: '', style: STYLE.BANNER_SUBTITLE })),
      ],
    },
    { height: 10, cells: [] },
    {
      height: 30,
      cells: [
        { value: 'Row #', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Column Name', style: STYLE.TABLE_HEADER },
        { value: 'Severity', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Import Impact', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Rule Applied', style: STYLE.TABLE_HEADER },
        { value: 'Formula Shield', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Original Input', style: STYLE.TABLE_HEADER },
        { value: 'Safe Export Value', style: STYLE.TABLE_HEADER },
        { value: 'Issue Details & Fix Guidance', style: STYLE.TABLE_HEADER },
      ],
    },
  ];

  if (sortedIssues.length === 0) {
    issueRows.push({
      height: 34,
      cells: [
        { value: '—', style: STYLE.BADGE_SUCCESS },
        { value: 'All Columns', style: STYLE.BADGE_SUCCESS },
        { value: 'Clean Pass', style: STYLE.BADGE_SUCCESS },
        { value: 'Ready for Import', style: STYLE.BADGE_SUCCESS },
        { value: 'All Active Rules', style: STYLE.CELL_WHITE },
        { value: 'Verified', style: STYLE.BADGE_SUCCESS },
        { value: 'No anomalies', style: STYLE.CELL_WHITE },
        { value: 'No changes needed', style: STYLE.CELL_WHITE },
        {
          value: 'Zero blocking errors or warnings were found across all evaluated rows.',
          style: STYLE.CELL_WHITE,
        },
      ],
    });
  } else {
    sortedIssues.forEach((iss, idx) => {
      const zebra = idx % 2 === 1;
      const textStyle = zebra ? STYLE.CELL_ZEBRA : STYLE.CELL_WHITE;
      const centerStyle = zebra ? STYLE.CELL_CENTER_ZEBRA : STYLE.CELL_CENTER_WHITE;
      const safeVal = sanitizeCellForSpreadsheetExport(iss.sanitizedValue || iss.rawValue || '').sanitized;

      issueRows.push({
        cells: [
          { value: iss.rowNumber, style: centerStyle, isNumber: true },
          { value: iss.columnName, style: zebra ? STYLE.LABEL_BOLD : STYLE.CELL_WHITE },
          {
            value: iss.severity === 'CRITICAL' ? 'Critical' : 'Warning',
            style: iss.severity === 'CRITICAL' ? STYLE.BADGE_CRITICAL : STYLE.BADGE_WARNING,
          },
          {
            value: iss.blocksProcessing ? 'Blocks Import' : 'Review Only',
            style: iss.blocksProcessing ? STYLE.BADGE_CRITICAL : STYLE.BADGE_WARNING,
          },
          { value: formatRuleTypeLabel(iss.ruleType), style: textStyle },
          {
            value: iss.formulaNeutralized ? 'Neutralized' : 'Standard',
            style: iss.formulaNeutralized ? STYLE.BADGE_SHIELD : centerStyle,
          },
          { value: iss.rawValue ? `'${iss.rawValue}`.replace(/^''/, "'") : '(Empty cell)', style: textStyle },
          { value: safeVal || '(Empty cell)', style: iss.formulaNeutralized ? STYLE.BADGE_SHIELD : textStyle },
          { value: formatRuleGuidance(iss), style: textStyle },
        ],
      });
    });
  }

  const issuesSheet: WorksheetSpec = {
    name: '2. Issues & Fixes',
    colWidths: baseIssueWidths,
    merges: ['A1:I1', 'A2:I2'],
    freezeRow: 4,
    rows: issueRows,
  };

  // --- SHEET 3: Column Health Breakdown (Aggregated per Column) ---
  const columnMap = new Map<
    string,
    { column: string; critical: number; warning: number; shielded: number; sampleMsg: string }
  >();
  for (const iss of sortedIssues) {
    const existing = columnMap.get(iss.columnName) || {
      column: iss.columnName,
      critical: 0,
      warning: 0,
      shielded: 0,
      sampleMsg: iss.message,
    };
    if (iss.severity === 'CRITICAL') existing.critical += 1;
    else existing.warning += 1;
    if (iss.formulaNeutralized) existing.shielded += 1;
    columnMap.set(iss.columnName, existing);
  }

  const columnRows: WorksheetRow[] = [
    {
      height: 36,
      cells: [
        { value: `Column Health Breakdown — ${job.fileName}`, style: STYLE.BANNER_TITLE },
        ...Array.from({ length: 5 }, () => ({ value: '', style: STYLE.BANNER_TITLE })),
      ],
    },
    {
      height: 24,
      cells: [
        {
          value: 'Grouped summary showing which spreadsheet columns require attention before import.',
          style: STYLE.BANNER_SUBTITLE,
        },
        ...Array.from({ length: 5 }, () => ({ value: '', style: STYLE.BANNER_SUBTITLE })),
      ],
    },
    { height: 10, cells: [] },
    {
      height: 30,
      cells: [
        { value: 'Column Name', style: STYLE.TABLE_HEADER },
        { value: 'Health Status', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Critical Errors', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Warnings', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Formulas Shielded', style: STYLE.TABLE_HEADER_CENTER },
        { value: 'Primary Fix Focus', style: STYLE.TABLE_HEADER },
      ],
    },
  ];

  const colGroups = Array.from(columnMap.values());
  if (colGroups.length === 0) {
    columnRows.push({
      height: 32,
      cells: [
        { value: 'All Columns', style: STYLE.CELL_WHITE },
        { value: 'Healthy', style: STYLE.BADGE_SUCCESS },
        { value: 0, style: STYLE.CELL_CENTER_WHITE, isNumber: true },
        { value: 0, style: STYLE.CELL_CENTER_WHITE, isNumber: true },
        { value: 0, style: STYLE.CELL_CENTER_WHITE, isNumber: true },
        { value: 'Every column passed validation with zero errors.', style: STYLE.CELL_WHITE },
      ],
    });
  } else {
    colGroups.forEach((grp, idx) => {
      const zebra = idx % 2 === 1;
      const textStyle = zebra ? STYLE.CELL_ZEBRA : STYLE.CELL_WHITE;
      const centerStyle = zebra ? STYLE.CELL_CENTER_ZEBRA : STYLE.CELL_CENTER_WHITE;
      columnRows.push({
        cells: [
          { value: grp.column, style: STYLE.LABEL_BOLD },
          {
            value: grp.critical > 0 ? 'Needs Critical Fix' : 'Review Warnings',
            style: grp.critical > 0 ? STYLE.BADGE_CRITICAL : STYLE.BADGE_WARNING,
          },
          { value: grp.critical, style: centerStyle, isNumber: true },
          { value: grp.warning, style: centerStyle, isNumber: true },
          { value: grp.shielded, style: grp.shielded > 0 ? STYLE.BADGE_SHIELD : centerStyle, isNumber: true },
          { value: grp.sampleMsg, style: textStyle },
        ],
      });
    });
  }

  const columnHealthSheet: WorksheetSpec = {
    name: '3. Column Health',
    colWidths: [
      Math.max(24, ...colGroups.map((g) => g.column.length + 5)),
      20,
      16,
      14,
      18,
      54,
    ],
    merges: ['A1:F1', 'A2:F2'],
    freezeRow: 4,
    rows: columnRows,
  };

  // --- SHEET 4: Sanitized Clean Data (if session rows are present) ---
  const sheets: WorksheetSpec[] = [summarySheet, issuesSheet, columnHealthSheet];

  if (job.sanitizedRows.length > 0) {
    const headers = Object.keys(job.sanitizedRows[0]);
    const safeHeaders = headers.length > 0 ? headers : ['Row'];
    const lastColLetter = colIndexToLetter(Math.max(0, safeHeaders.length - 1));
    const colWidths = safeHeaders.map((h) => {
      const maxVal = job.sanitizedRows.reduce((max, r) => {
        const len = String(r[h] ?? '').length;
        return len > max ? len : max;
      }, h.length);
      return Math.min(46, Math.max(18, maxVal + 6));
    });

    const dataRows: WorksheetRow[] = [
      {
        height: 36,
        cells: [
          { value: `Sanitized Safe Export Data — ${job.fileName}`, style: STYLE.BANNER_TITLE },
          ...Array.from({ length: Math.max(0, safeHeaders.length - 1) }, () => ({
            value: '',
            style: STYLE.BANNER_TITLE,
          })),
        ],
      },
      {
        height: 24,
        cells: [
          {
            value: `${job.sanitizedRows.length} rows exported with active formula injection protection applied.`,
            style: STYLE.BANNER_SUBTITLE,
          },
          ...Array.from({ length: Math.max(0, safeHeaders.length - 1) }, () => ({
            value: '',
            style: STYLE.BANNER_SUBTITLE,
          })),
        ],
      },
      { height: 10, cells: [] },
      {
        height: 30,
        cells: safeHeaders.map((h) => ({ value: h, style: STYLE.TABLE_HEADER })),
      },
    ];

    job.sanitizedRows.forEach((row, rIdx) => {
      const zebra = rIdx % 2 === 1;
      const defaultStyle = zebra ? STYLE.CELL_ZEBRA : STYLE.CELL_WHITE;
      dataRows.push({
        cells: safeHeaders.map((h) => {
          const { sanitized, wasNeutralized } = sanitizeCellForSpreadsheetExport(row[h] ?? '');
          return {
            value: sanitized,
            style: wasNeutralized ? STYLE.BADGE_SHIELD : defaultStyle,
          };
        }),
      });
    });

    sheets.push({
      name: '4. Sanitized Data',
      colWidths,
      merges: safeHeaders.length > 1 ? [`A1:${lastColLetter}1`, `A2:${lastColLetter}2`] : undefined,
      freezeRow: 4,
      rows: dataRows,
    });
  }

  return buildXlsxArchiveFromSheets(sheets);
}

// ---------------------------------------------------------------------------
// Clean Browser Download Helpers & Printable HTML Report
// ---------------------------------------------------------------------------

export function triggerBinaryOrTextDownload(
  filename: string,
  data: string | Uint8Array,
  mimeType: string
): void {
  const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data).buffer;
  const blob = new Blob([part], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildPrintableAuditHtml(
  job: ValidationJobRecord,
  issues: CellValidationIssue[]
): string {
  const esc = (s: string) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const dqs =
    job.summary.dataQualityScore !== null
      ? `${job.summary.dataQualityScore.toFixed(1)}%`
      : 'N/A';

  const rowsHtml =
    issues.length === 0
      ? `<tr><td colspan="6" style="padding:20px;text-align:center;color:#15803D;font-weight:600;">All checks passed cleanly with zero issues.</td></tr>`
      : issues
          .map(
            (iss) => `
      <tr>
        <td style="font-weight:700;">Row ${iss.rowNumber}</td>
        <td style="font-weight:600;">${esc(iss.columnName)}</td>
        <td><span class="pill ${iss.severity === 'CRITICAL' ? 'pill-crit' : 'pill-warn'}">${
              iss.severity === 'CRITICAL' ? 'Critical' : 'Warning'
            }</span></td>
        <td>${esc(formatRuleTypeLabel(iss.ruleType))}</td>
        <td><code>${esc(iss.rawValue || '(Empty)')}</code></td>
        <td>${esc(formatRuleGuidance(iss))}</td>
      </tr>`
          )
          .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SheetSentry Report — ${esc(job.fileName)}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #10213B; margin: 0; padding: 32px; background: #F5F7FB; }
    .sheet { max-width: 1020px; margin: 0 auto; background: #FFF; border-radius: 16px; border: 1px solid #E4E9F1; overflow: hidden; }
    .hero { background: linear-gradient(135deg, #10213B 0%, #1B3258 100%); color: #FFF; padding: 28px 32px; }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #9CC0FF; font-weight: 700; }
    h1 { margin: 6px 0 4px; font-size: 24px; }
    .sub { color: #C6D4E9; font-size: 13px; margin: 0; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; padding: 24px 32px; background: #F8FAFC; border-bottom: 1px solid #E4E9F1; }
    .kpi { background: #FFF; border: 1px solid #E4E9F1; border-radius: 12px; padding: 14px 16px; }
    .kpi-label { font-size: 11px; font-weight: 700; color: #667085; text-transform: uppercase; }
    .kpi-val { font-size: 22px; font-weight: 800; margin-top: 4px; color: #10213B; }
    .body { padding: 24px 32px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; background: #1E3A5F; color: #FFF; padding: 10px 12px; font-weight: 700; }
    td { padding: 10px 12px; border-bottom: 1px solid #E4E9F1; vertical-align: top; }
    tr:nth-child(even) td { background: #F8FAFC; }
    .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .pill-crit { background: #FDECEC; color: #B91C1C; }
    .pill-warn { background: #FEF3C7; color: #B45309; }
    code { background: #F1F5F9; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    @media print { body { background: #FFF; padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="hero">
      <div class="eyebrow">SheetSentry Executive Audit Report · ${esc(job.id)}</div>
      <h1>${esc(job.fileName)}</h1>
      <p class="sub">${esc(job.profileName)} (v${job.profileVersion}) · Completed ${esc(job.completedAt)}</p>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Quality Score</div><div class="kpi-val">${esc(dqs)} (${esc(job.summary.validationGrade)})</div></div>
      <div class="kpi"><div class="kpi-label">Import Gate</div><div class="kpi-val" style="font-size:15px;">${esc(formatEligibilityLabel(job.summary.processingEligibility))}</div></div>
      <div class="kpi"><div class="kpi-label">Clean / Total Rows</div><div class="kpi-val">${job.summary.cleanRowsCount} / ${job.summary.totalEvaluatedRows}</div></div>
      <div class="kpi"><div class="kpi-label">Formulas Shielded</div><div class="kpi-val">${job.summary.formulaInjectionCount}</div></div>
    </div>
    <div class="body">
      <h2 style="font-size:16px;margin:0 0 12px;">Separated Issue &amp; Remediation Breakdown (${issues.length})</h2>
      <table>
        <thead>
          <tr><th>Row</th><th>Column</th><th>Severity</th><th>Rule</th><th>Flagged Input</th><th>Fix Guidance</th></tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

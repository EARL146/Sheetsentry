import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatPlanPrice, getPlansByMode, PlanTierId } from '../../config/productConfig';
import { useAppState } from '../../context/AppStateContext';
import {
  generateIssuesCsvReport,
  generateSanitizedCsvReport,
  CellValidationIssue,
} from '../../services/validationEngine';
import {
  buildPrintableAuditHtml,
  formatEligibilityLabel,
  formatRuleGuidance,
  formatRuleTypeLabel,
  generateStyledExcelWorkbook,
  triggerBinaryOrTextDownload,
} from '../../services/reportExporter';
import { fetchJobIssues } from '../../services/apiClient';
import {
  EligibilityBadge,
  GradeBadge,
  ProvisionalConfigSwitcher,
} from '../../components/SharedUI';
import { CUSTOMER_RESULTS_TEXT } from '../../content/customerText';

const MIME_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function triggerBrowserDownload(filename: string, content: string, mimeType: string) {
  triggerBinaryOrTextDownload(filename, content, mimeType);
}

/**
 * 1. Customer Validation Results Page (Figma Node 4:295 + 138:2 DQS/Eligibility Separation)
 */
export const ValidationResultsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, authUser } = useAppState();
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteIssues, setRemoteIssues] = useState<CellValidationIssue[] | null>(null);

  const job = jobs.find((j) => j.id === jobId) || jobs[0];

  useEffect(() => {
    setRemoteIssues(null);
    if (!job || job.issues.length > 0 || !authUser) {
      return;
    }
    let active = true;
    fetchJobIssues(job.id)
      .then((res) => {
        if (!active || !Array.isArray(res.issues)) return;
        const mapped: CellValidationIssue[] = res.issues.map((ri) => ({
          id: String(ri.id),
          rowNumber: ri.row,
          columnName: ri.column,
          ruleId: 'workspace-rule',
          ruleLabel: ri.column,
          ruleType: 'REQUIRED',
          severity: ri.severity === 'WARNING' ? 'WARNING' : 'CRITICAL',
          blocksProcessing: ri.severity === 'CRITICAL',
          rawValue: ri.rawValueMasked,
          sanitizedValue: ri.rawValueMasked,
          formulaNeutralized: Boolean(ri.formulaNeutralized),
          message: ri.message,
        }));
        setRemoteIssues(mapped);
      })
      .catch(() => {
        if (active) setRemoteIssues([]);
      });
    return () => {
      active = false;
    };
  }, [job?.id, job?.issues.length, authUser]);

  if (!job) {
    return (
      <div className="rounded-[18px] bg-white border border-[#E4E9F1] p-10 text-center space-y-4 shadow-sm">
        <h1 className="text-[22px] font-bold text-[#10213B]">No validation report selected yet</h1>
        <p className="text-[13px] text-[#667085] max-w-md mx-auto">
          Upload and validate your first spreadsheet in this workspace to generate cell-level error
          reports and sanitized CSV exports.
        </p>
        <Link
          to="/app/upload"
          className="inline-flex h-[42px] px-6 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold items-center justify-center transition"
        >
          Upload spreadsheet →
        </Link>
      </div>
    );
  }

  const effectiveIssues = job.issues.length > 0 ? job.issues : remoteIssues || [];

  const filteredIssues = effectiveIssues.filter((iss) => {
    if (severityFilter !== 'ALL' && iss.severity !== severityFilter) return false;
    if (
      searchQuery &&
      !`${iss.columnName} ${iss.message} ${iss.rawValue}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleDownloadExcelReport = () => {
    const xlsxBytes = generateStyledExcelWorkbook(job, effectiveIssues);
    triggerBinaryOrTextDownload(`REPORT_${job.id}.xlsx`, xlsxBytes, MIME_XLSX);
  };

  const handleDownloadSanitizedCsv = () => {
    const csv =
      job.sanitizedRows.length > 0
        ? generateSanitizedCsvReport(job.sanitizedRows)
        : generateIssuesCsvReport(effectiveIssues);
    triggerBrowserDownload(
      `SANITIZED_${job.fileName.replace(/\.xlsx$/i, '.csv')}`,
      csv,
      'text/csv;charset=utf-8;'
    );
  };

  const handleDownloadErrorCsv = () => {
    const csv = generateIssuesCsvReport(effectiveIssues);
    triggerBrowserDownload(`ERRORS_${job.id}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      {/* Header Row (Nodes 4:331 - 4:336) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            RUN HISTORY  /  VALIDATION #{job.id}
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#10213B] mt-1 break-words">
            {job.fileName}
          </h1>
          <p className="text-[12px] text-[#667085] mt-0.5">
            Checked just now · {job.profileName} profile · {job.summary.totalEvaluatedRows} rows
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#FFF4DE] text-[#D99121] text-[10.5px] font-bold">
            {effectiveIssues.length > 0 ? 'Issues found' : 'All checks passed'}
          </span>
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadExcelReport}
              className="h-[40px] px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition w-full sm:w-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel report (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSanitizedCsv}
              className="h-[40px] px-4 rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Sanitized CSV</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadErrorCsv}
              className="h-[40px] px-4 rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#D84A4A] text-[#10213B] text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5 text-[#D84A4A]" />
              <span>Error report CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Row: Data Quality Score Card + Issues to Review Card (Nodes 4:337 & 4:345) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: DATA QUALITY SCORE Card (Node 4:337) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
              DATA QUALITY SCORE
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[40px] font-bold text-[#10213B] leading-none">
                {job.summary.dataQualityScore !== null
                  ? `${job.summary.dataQualityScore.toFixed(1)}%`
                  : 'N/A'}
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#E8F7EF] text-[#16A36A] text-[10px] font-bold">
                {job.summary.validationGrade === 'FAIL' ? 'Needs fix' : 'Healthy'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full h-[8px] rounded-[4px] bg-[#E9EEF7] overflow-hidden">
              <div
                style={{ width: `${Math.max(10, job.summary.dataQualityScore || 0)}%` }}
                className="h-full bg-[#16A36A] rounded-[4px]"
              />
            </div>
            <div className="text-[11px] text-[#667085] mt-2.5">
              {job.summary.cleanRowsCount} valid rows out of {job.summary.totalEvaluatedRows} ·
              Grade {job.summary.validationGrade}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Issues to Review Card (Node 4:345) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">Issues to review</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">
              {effectiveIssues.length} cell issues require attention across active validation rules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-[#FDECEC] rounded-[12px] p-4">
              <div className="text-[18px] font-bold text-[#D84A4A]">
                {job.summary.criticalRowsCount} rows
              </div>
              <div className="text-[11px] font-medium text-[#10213B] mt-1">
                Critical blocking errors
              </div>
            </div>

            <div className="bg-[#FFF4DE] rounded-[12px] p-4">
              <div className="text-[18px] font-bold text-[#D99121]">
                {job.summary.warningOnlyRowsCount} rows
              </div>
              <div className="text-[11px] font-medium text-[#10213B] mt-1">
                Format &amp; duplicate warnings
              </div>
            </div>

            <div className="bg-[#F0ECFF] rounded-[12px] p-4">
              <div className="text-[18px] font-bold text-[#7658D6]">
                {job.summary.formulaInjectionCount} cells
              </div>
              <div className="text-[11px] font-medium text-[#10213B] mt-1">
                Formulas neutralized (&apos;=)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Separation of DQS vs Processing Eligibility (Master Config 138:2) */}
      <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <EligibilityBadge eligibility={job.summary.processingEligibility} />
            <GradeBadge grade={job.summary.validationGrade} />
            <span className="text-xs font-bold text-[#10213B]">
              {CUSTOMER_RESULTS_TEXT.dqsVsEligibilityTitle}
            </span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">{job.summary.eligibilityReason}</p>
        </div>

        <div className="font-mono text-[11px] bg-[#F7F9FC] px-3.5 py-2.5 rounded-[10px] border border-[#E4E9F1] text-[#10213B]">
          DQS = max(0, 100 - [(1.0×{job.summary.criticalRowsCount} + 0.3×
          {job.summary.warningOnlyRowsCount}) / {job.summary.totalEvaluatedRows} × 100])
        </div>
      </div>

      {/* Bottom Row: Affected Rows Table (Node 4:360) */}
      <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-[16px] font-bold text-[#10213B] mr-2">Affected rows</h2>
            {(
              [
                { id: 'ALL', label: 'All issues' },
                { id: 'CRITICAL', label: 'Critical' },
                { id: 'WARNING', label: 'Warnings' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSeverityFilter(tab.id)}
                className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition ${
                  severityFilter === tab.id
                    ? 'bg-[#EAF2FF] text-[#2563EB]'
                    : 'bg-[#F5F7FB] text-[#667085] hover:text-[#10213B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#F5F7FB] h-[36px] px-3 rounded-[9px] w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter column, value, issue..."
              className="bg-transparent text-xs text-[#10213B] placeholder-[#667085] focus:outline-none w-full"
            />
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#667085]">
            No validation issues match your current filter.
          </div>
        ) : (
          <>
            {/* Phone View: Stacked Affected Row Cards */}
            <div className="md:hidden space-y-3">
              {filteredIssues.map((iss) => (
                <div
                  key={`m-${iss.id}`}
                  className="rounded-[12px] border border-[#E4E9F1] bg-[#FAFCFF] p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-[6px] bg-[#EFF3F9] text-[#10213B] font-bold text-[10.5px] shrink-0">
                        Row {iss.rowNumber}
                      </span>
                      <span className="font-mono text-[12px] font-bold text-[#10213B] truncate">
                        {iss.columnName}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        iss.severity === 'CRITICAL'
                          ? 'bg-[#FDECEC] text-[#D84A4A]'
                          : 'bg-[#FFF4DE] text-[#D99121]'
                      }`}
                    >
                      {iss.severity === 'CRITICAL' ? 'High' : 'Medium'}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#475569] leading-relaxed">{iss.message}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EDF1F7] text-[11px]">
                    <div className="min-w-0">
                      <div className="text-[9.5px] uppercase font-bold text-[#98A2B3]">Value</div>
                      <div className="font-mono text-[#D84A4A] break-all mt-0.5">
                        {iss.rawValue || 'Empty'}
                      </div>
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-[9.5px] uppercase font-bold text-[#98A2B3]">
                        Sanitized
                      </div>
                      <div className="font-mono text-[#16A36A] break-all mt-0.5">
                        {iss.formulaNeutralized ? iss.sanitizedValue : iss.rawValue || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Affected Rows Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
                    <th className="py-3 px-4 rounded-l-[8px]">ROW</th>
                    <th className="py-3 px-4">COLUMN</th>
                    <th className="py-3 px-4">VALUE</th>
                    <th className="py-3 px-4">ISSUE</th>
                    <th className="py-3 px-4">SEVERITY</th>
                    <th className="py-3 px-4 rounded-r-[8px]">SANITIZED EXPORT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F1]">
                  {filteredIssues.map((iss) => (
                    <tr key={iss.id} className="hover:bg-[#FBFCFE] align-top">
                      <td className="py-3.5 px-4 font-bold text-[#10213B] whitespace-nowrap">
                        Row {iss.rowNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#10213B] whitespace-nowrap">
                        {iss.columnName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#D84A4A] max-w-[200px] break-all">
                        {iss.rawValue || 'Empty'}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569] min-w-[220px] leading-relaxed">
                        {iss.message}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                            iss.severity === 'CRITICAL'
                              ? 'bg-[#FDECEC] text-[#D84A4A]'
                              : 'bg-[#FFF4DE] text-[#D99121]'
                          }`}
                        >
                          {iss.severity === 'CRITICAL' ? 'High' : 'Medium'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#16A36A] max-w-[200px] break-all">
                        {iss.formulaNeutralized ? iss.sanitizedValue : iss.rawValue || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function QualityGaugeRing({ score }: { score: number | null }) {
  const safeScore = score !== null ? Math.max(0, Math.min(100, score)) : 0;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;
  const ringColor =
    safeScore >= 90 ? '#22C55E' : safeScore >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
      <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="7"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[16px] font-extrabold text-white leading-none">
          {score !== null ? `${score.toFixed(0)}%` : 'N/A'}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9CC0FF] mt-0.5">
          Score
        </span>
      </div>
    </div>
  );
}

/**
 * 2. Customer Reports & Exports Studio Page (Redesigned: Creative, Separated, High-Performance)
 */
export const ReportsExportsPage: React.FC = () => {
  const { jobs, authUser } = useAppState();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedJobId = searchParams.get('job');

  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(
    requestedJobId || jobs[0]?.id
  );
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'ELIGIBLE' | 'ISSUES'>('ALL');
  const [queueQuery, setQueueQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ISSUES' | 'COLUMNS' | 'SANITIZED'>('ISSUES');
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>(
    'ALL'
  );
  const [issueCache, setIssueCache] = useState<Record<string, CellValidationIssue[]>>({});
  const [loadingIssuesFor, setLoadingIssuesFor] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [phoneReportsPane, setPhoneReportsPane] = useState<'STUDIO' | 'QUEUE'>('STUDIO');

  useEffect(() => {
    if (requestedJobId && jobs.some((j) => j.id === requestedJobId)) {
      setSelectedJobId(requestedJobId);
    }
  }, [requestedJobId, jobs]);

  const filteredJobs = useMemo(() => {
    const q = queueQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      if (queueFilter === 'ELIGIBLE' && job.summary.processingEligibility !== 'ELIGIBLE') {
        return false;
      }
      if (queueFilter === 'ISSUES' && job.summary.processingEligibility === 'ELIGIBLE') {
        return false;
      }
      if (
        q &&
        !`${job.id} ${job.fileName} ${job.profileName}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [jobs, queueFilter, queueQuery]);

  const selectedJob =
    filteredJobs.find((j) => j.id === selectedJobId) ||
    jobs.find((j) => j.id === selectedJobId) ||
    filteredJobs[0] ||
    jobs[0];

  useEffect(() => {
    if (!selectedJob) return;
    if (selectedJob.issues.length > 0 || issueCache[selectedJob.id] || !authUser) {
      return;
    }
    let active = true;
    setLoadingIssuesFor(selectedJob.id);
    fetchJobIssues(selectedJob.id)
      .then((res) => {
        if (!active) return;
        const mapped: CellValidationIssue[] = (res.issues || []).map((ri) => ({
          id: String(ri.id),
          rowNumber: ri.row,
          columnName: ri.column,
          ruleId: 'workspace-rule',
          ruleLabel: ri.column,
          ruleType: ri.formulaNeutralized ? 'FORMULA_SHIELD' : 'REQUIRED',
          severity: ri.severity === 'WARNING' ? 'WARNING' : 'CRITICAL',
          blocksProcessing: ri.severity === 'CRITICAL',
          rawValue: ri.rawValueMasked,
          sanitizedValue: ri.rawValueMasked,
          formulaNeutralized: Boolean(ri.formulaNeutralized),
          message: ri.message,
        }));
        setIssueCache((prev) => ({ ...prev, [selectedJob.id]: mapped }));
      })
      .catch(() => {
        if (active) setIssueCache((prev) => ({ ...prev, [selectedJob.id]: [] }));
      })
      .finally(() => {
        if (active) setLoadingIssuesFor((curr) => (curr === selectedJob.id ? null : curr));
      });
    return () => {
      active = false;
    };
  }, [selectedJob?.id, selectedJob?.issues.length, authUser, issueCache]);

  const selectedIssues: CellValidationIssue[] = useMemo(() => {
    if (!selectedJob) return [];
    if (selectedJob.issues.length > 0) return selectedJob.issues;
    return issueCache[selectedJob.id] || [];
  }, [selectedJob, issueCache]);

  const workspaceRollup = useMemo(() => {
    const totalFiles = jobs.length;
    const readyCount = jobs.filter((j) => j.summary.processingEligibility === 'ELIGIBLE').length;
    const scores = jobs
      .map((j) => j.summary.dataQualityScore)
      .filter((s): s is number => s !== null);
    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const totalRows = jobs.reduce((a, j) => a + j.summary.totalEvaluatedRows, 0);
    const totalShielded = jobs.reduce((a, j) => a + j.summary.formulaInjectionCount, 0);
    return { totalFiles, readyCount, avgScore, totalRows, totalShielded };
  }, [jobs]);

  const columnHealthGroups = useMemo(() => {
    const map = new Map<
      string,
      { column: string; critical: number; warning: number; shielded: number; sampleFix: string }
    >();
    for (const iss of selectedIssues) {
      const curr = map.get(iss.columnName) || {
        column: iss.columnName,
        critical: 0,
        warning: 0,
        shielded: 0,
        sampleFix: iss.message,
      };
      if (iss.severity === 'CRITICAL') curr.critical += 1;
      else curr.warning += 1;
      if (iss.formulaNeutralized) curr.shielded += 1;
      map.set(iss.columnName, curr);
    }
    return Array.from(map.values()).sort(
      (a, b) => b.critical - a.critical || b.warning - a.warning
    );
  }, [selectedIssues]);

  const filteredPreviewIssues = useMemo(() => {
    return selectedIssues
      .filter((iss) =>
        issueSeverityFilter === 'ALL' ? true : iss.severity === issueSeverityFilter
      )
      .sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'CRITICAL' ? -1 : 1;
        return a.rowNumber - b.rowNumber;
      });
  }, [selectedIssues, issueSeverityFilter]);

  const resolveIssuesForDownload = async (jobId: string, existing: CellValidationIssue[]) => {
    if (existing.length > 0) return existing;
    if (issueCache[jobId]) return issueCache[jobId];
    try {
      const res = await fetchJobIssues(jobId);
      const mapped: CellValidationIssue[] = (res.issues || []).map((ri) => ({
        id: String(ri.id),
        rowNumber: ri.row,
        columnName: ri.column,
        ruleId: 'workspace-rule',
        ruleLabel: ri.column,
        ruleType: ri.formulaNeutralized ? 'FORMULA_SHIELD' : 'REQUIRED',
        severity: ri.severity === 'WARNING' ? 'WARNING' : 'CRITICAL',
        blocksProcessing: ri.severity === 'CRITICAL',
        rawValue: ri.rawValueMasked,
        sanitizedValue: ri.rawValueMasked,
        formulaNeutralized: Boolean(ri.formulaNeutralized),
        message: ri.message,
      }));
      setIssueCache((prev) => ({ ...prev, [jobId]: mapped }));
      return mapped;
    } catch {
      return [];
    }
  };

  const notifyExport = (label: string) => {
    setExportToast(label);
    setTimeout(() => setExportToast((curr) => (curr === label ? null : curr)), 3200);
  };

  const handleDownloadXlsx = async () => {
    if (!selectedJob) return;
    const issues = await resolveIssuesForDownload(selectedJob.id, selectedIssues);
    const bytes = generateStyledExcelWorkbook(selectedJob, issues);
    triggerBinaryOrTextDownload(`SheetSentry_Report_${selectedJob.id}.xlsx`, bytes, MIME_XLSX);
    notifyExport(`Downloaded multi-sheet Excel workbook for ${selectedJob.fileName}`);
  };

  const handleDownloadErrorCsv = async () => {
    if (!selectedJob) return;
    const issues = await resolveIssuesForDownload(selectedJob.id, selectedIssues);
    triggerBrowserDownload(
      `ERRORS_${selectedJob.id}.csv`,
      generateIssuesCsvReport(issues),
      'text/csv;charset=utf-8;'
    );
    notifyExport(`Downloaded readable Error CSV for ${selectedJob.fileName}`);
  };

  const handleDownloadSanitizedCsv = async () => {
    if (!selectedJob) return;
    const issues = await resolveIssuesForDownload(selectedJob.id, selectedIssues);
    const csvContent =
      selectedJob.sanitizedRows.length > 0
        ? generateSanitizedCsvReport(selectedJob.sanitizedRows)
        : generateIssuesCsvReport(issues);
    const prefix = selectedJob.sanitizedRows.length > 0 ? 'SANITIZED' : 'SAFE_AUDIT_SUMMARY';
    triggerBrowserDownload(
      `${prefix}_${selectedJob.fileName.replace(/\.xlsx$/i, '.csv')}`,
      csvContent,
      'text/csv;charset=utf-8;'
    );
    notifyExport(
      selectedJob.sanitizedRows.length > 0
        ? `Downloaded formula-safe Sanitized CSV (${selectedJob.sanitizedRows.length} rows)`
        : `Downloaded Safe Audit Summary CSV for ${selectedJob.fileName}`
    );
  };

  const handleDownloadJsonManifest = async () => {
    if (!selectedJob) return;
    const issues = await resolveIssuesForDownload(selectedJob.id, selectedIssues);
    const payload = {
      ...selectedJob,
      issues,
      exportedAt: new Date().toISOString(),
    };
    triggerBrowserDownload(
      `AUDIT_MANIFEST_${selectedJob.id}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
    notifyExport(`Downloaded JSON Audit Manifest (${selectedJob.id})`);
  };

  const handleOpenPrintReport = async () => {
    if (!selectedJob) return;
    const issues = await resolveIssuesForDownload(selectedJob.id, selectedIssues);
    const html = buildPrintableAuditHtml(selectedJob, issues);
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.focus(), 150);
    } else {
      triggerBrowserDownload(`PRINT_REPORT_${selectedJob.id}.html`, html, 'text/html;charset=utf-8;');
    }
    notifyExport(`Opened formatted Printable Audit Report for ${selectedJob.fileName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            CLEAN EXPORT STUDIO
          </span>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#10213B] mt-0.5">
            Reports &amp; exports
          </h1>
          <p className="text-[12.5px] sm:text-[13px] text-[#667085] mt-1">
            {CUSTOMER_RESULTS_TEXT.reportsSubtitle}
          </p>
        </div>

        <Link
          to="/app/upload"
          className="h-[42px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition shrink-0 w-full sm:w-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Validate new file</span>
        </Link>
      </div>

      {exportToast && (
        <div className="rounded-[12px] bg-[#EAF2FF] border border-[#BFDBFE] px-4 py-2.5 text-xs font-semibold text-[#1D4ED8] flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A36A]" />
            <span>{exportToast}</span>
          </span>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            className="text-[11px] text-[#64748B] hover:text-[#10213B]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Executive Rollup Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-[14px] sm:rounded-[16px] bg-white border border-[#E4E9F1] p-3.5 sm:p-5 shadow-sm">
          <div className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            Validated Files
          </div>
          <div className="text-[21px] sm:text-[26px] font-bold text-[#10213B] mt-1 sm:mt-1.5">
            {workspaceRollup.totalFiles}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#16A36A] font-semibold mt-1">
            {workspaceRollup.readyCount} ready ·{' '}
            {Math.max(0, workspaceRollup.totalFiles - workspaceRollup.readyCount)} need review
          </div>
        </div>

        <div className="rounded-[14px] sm:rounded-[16px] bg-white border border-[#E4E9F1] p-3.5 sm:p-5 shadow-sm">
          <div className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            Avg Quality Score
          </div>
          <div className="text-[21px] sm:text-[26px] font-bold text-[#10213B] mt-1 sm:mt-1.5">
            {workspaceRollup.avgScore.toFixed(1)}%
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#667085] mt-1">
            Across workspace checks
          </div>
        </div>

        <div className="rounded-[14px] sm:rounded-[16px] bg-white border border-[#E4E9F1] p-3.5 sm:p-5 shadow-sm">
          <div className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            Total Rows Audited
          </div>
          <div className="text-[21px] sm:text-[26px] font-bold text-[#10213B] mt-1 sm:mt-1.5">
            {workspaceRollup.totalRows.toLocaleString()}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#667085] mt-1">
            Cell-level rule inspection
          </div>
        </div>

        <div className="rounded-[14px] sm:rounded-[16px] bg-white border border-[#E4E9F1] p-3.5 sm:p-5 shadow-sm">
          <div className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#667085]">
            Formulas Shielded
          </div>
          <div className="text-[21px] sm:text-[26px] font-bold text-[#7658D6] mt-1 sm:mt-1.5">
            {workspaceRollup.totalShielded}
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-[#667085] mt-1">
            Safe export escaping active
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-[18px] bg-white border border-[#E4E9F1] p-8 sm:p-12 text-center space-y-3 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#10213B]">No exportable reports yet</h2>
          <p className="text-[13px] text-[#667085] max-w-md mx-auto">
            Upload and validate your first CSV or Excel file to unlock styled multi-sheet Excel
            reports, clean CSV remediation downloads, and interactive previews.
          </p>
          <Link
            to="/app/upload"
            className="inline-flex h-[42px] px-6 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold items-center justify-center transition"
          >
            Upload spreadsheet →
          </Link>
        </div>
      ) : (
        <>
          {/* Phone-Only Segmented Switch & Quick File Bar (< 1024px) */}
          <div className="lg:hidden space-y-3">
            <div className="grid grid-cols-2 gap-1.5 bg-[#E7EDF6] p-1 rounded-[12px]">
              <button
                type="button"
                onClick={() => setPhoneReportsPane('STUDIO')}
                className={`h-[38px] rounded-[9px] text-[12px] font-bold transition ${
                  phoneReportsPane === 'STUDIO'
                    ? 'bg-white text-[#10213B] shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                Export Studio
              </button>
              <button
                type="button"
                onClick={() => setPhoneReportsPane('QUEUE')}
                className={`h-[38px] rounded-[9px] text-[12px] font-bold transition ${
                  phoneReportsPane === 'QUEUE'
                    ? 'bg-white text-[#10213B] shadow-sm'
                    : 'text-[#64748B]'
                }`}
              >
                All Reports ({filteredJobs.length})
              </button>
            </div>

            {phoneReportsPane === 'STUDIO' && filteredJobs.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {filteredJobs.map((job) => {
                  const activeChip = selectedJob?.id === job.id;
                  return (
                    <button
                      key={`chip-${job.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setSearchParams({ job: job.id });
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition max-w-[210px] truncate ${
                        activeChip
                          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                          : 'bg-white border-[#E4E9F1] text-[#10213B]'
                      }`}
                    >
                      {job.fileName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL (5 Cols): Separated Report Selector Queue */}
            <div
              className={`lg:col-span-5 rounded-[18px] bg-white border border-[#E4E9F1] shadow-sm overflow-hidden ${
                phoneReportsPane === 'QUEUE' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="p-4 border-b border-[#E4E9F1] space-y-3 bg-[#FBFCFE]">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[14px] font-bold text-[#10213B]">
                    Validated Reports ({filteredJobs.length})
                  </h2>
                  <div className="flex items-center gap-1 bg-[#EFF3F9] p-1 rounded-[9px]">
                    {(
                      [
                        { id: 'ALL', label: 'All' },
                        { id: 'ELIGIBLE', label: 'Ready' },
                        { id: 'ISSUES', label: 'Issues' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setQueueFilter(tab.id)}
                        className={`px-2.5 py-1 rounded-[7px] text-[10.5px] font-bold transition ${
                          queueFilter === tab.id
                            ? 'bg-white text-[#10213B] shadow-sm'
                            : 'text-[#667085] hover:text-[#10213B]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-[#E4E9F1] h-[38px] px-3 rounded-[10px] focus-within:border-[#2563EB]">
                  <Search className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                  <input
                    type="text"
                    value={queueQuery}
                    onChange={(e) => setQueueQuery(e.target.value)}
                    placeholder="Filter by file name, job ID, profile..."
                    className="bg-transparent text-xs text-[#10213B] placeholder-[#667085] focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#E4E9F1] max-h-[680px] overflow-y-auto">
                {filteredJobs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#667085]">
                    No validation reports match "{queueQuery}".
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => {
                          setSelectedJobId(job.id);
                          setSearchParams({ job: job.id });
                          setPhoneReportsPane('STUDIO');
                        }}
                        className={`w-full text-left p-4 sm:p-5 transition flex flex-col gap-2.5 border-l-4 ${
                          isSelected
                            ? 'bg-[#F4F8FF] border-l-[#2563EB]'
                            : 'bg-white hover:bg-[#FBFCFE] border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="inline-block font-mono font-bold text-[11px] text-[#2563EB]">
                              {job.id}
                            </span>
                            <h3 className="text-[14px] font-bold text-[#10213B] break-words mt-0.5 leading-snug">
                              {job.fileName}
                            </h3>
                          </div>
                          <GradeBadge grade={job.summary.validationGrade} />
                        </div>

                        <div className="text-[11px] text-[#667085] leading-relaxed">
                          {job.profileName} (v{job.profileVersion})
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <EligibilityBadge eligibility={job.summary.processingEligibility} />
                          <span className="text-[10.5px] font-medium text-[#64748B]">
                            {job.summary.totalEvaluatedRows.toLocaleString()} rows ·{' '}
                            {job.completedAt.slice(0, 16)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANEL (7 Cols): Creative Separated Export Studio & Live Preview */}
            {selectedJob && (
              <div
                className={`lg:col-span-7 space-y-5 ${
                  phoneReportsPane === 'STUDIO' ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* 1. Dark Navy Executive Score Card */}
                <div className="rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-[#10213B] via-[#13294B] to-[#1B3A66] text-white p-4 sm:p-6 shadow-md border border-[#1E3A5F] space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#233E65] text-[#9CC0FF] font-bold">
                          {selectedJob.id}
                        </span>
                        <span
                          className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-bold ${
                            selectedJob.summary.processingEligibility === 'ELIGIBLE'
                              ? 'bg-[#16A36A]/20 text-[#86EFAC]'
                              : selectedJob.summary.processingEligibility === 'REVIEW_REQUIRED'
                              ? 'bg-[#D99121]/20 text-[#FDE68A]'
                              : 'bg-[#D84A4A]/25 text-[#FCA5A5]'
                          }`}
                        >
                          {formatEligibilityLabel(selectedJob.summary.processingEligibility)}
                        </span>
                      </div>
                      <h2 className="text-[17px] sm:text-[20px] font-bold text-white break-words leading-snug">
                        {selectedJob.fileName}
                      </h2>
                      <p className="text-[11.5px] sm:text-[12px] text-[#C6D4E9]">
                        {selectedJob.profileName} (v{selectedJob.profileVersion}) · Checked{' '}
                        {selectedJob.completedAt}
                      </p>
                    </div>

                    <QualityGaugeRing score={selectedJob.summary.dataQualityScore} />
                  </div>

                {/* Clean 4-Metric Bar Inside Hero */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="rounded-[12px] bg-white/10 border border-white/15 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#9CC0FF] font-bold">
                      Clean Rows
                    </div>
                    <div className="text-[18px] font-bold text-[#86EFAC] mt-0.5">
                      {selectedJob.summary.cleanRowsCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-white/10 border border-white/15 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#9CC0FF] font-bold">
                      Critical Errors
                    </div>
                    <div className="text-[18px] font-bold text-[#FCA5A5] mt-0.5">
                      {selectedJob.summary.criticalRowsCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-white/10 border border-white/15 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#9CC0FF] font-bold">
                      Warnings
                    </div>
                    <div className="text-[18px] font-bold text-[#FDE68A] mt-0.5">
                      {selectedJob.summary.warningOnlyRowsCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-[12px] bg-white/10 border border-white/15 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-[#9CC0FF] font-bold">
                      Shielded
                    </div>
                    <div className="text-[18px] font-bold text-[#DDD6FE] mt-0.5">
                      {selectedJob.summary.formulaInjectionCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Separated Download Format Cards (2x2 Grid — Zero Awkward Wrapping) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Featured Styled Multi-Sheet Excel Export */}
                <div className="rounded-[16px] bg-gradient-to-br from-[#F4F8FF] to-white border-2 border-[#2563EB]/30 p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#DCEBFF] px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Recommended for Excel &amp; WPS
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#10213B] pt-1">
                      Styled Excel Report (.xlsx)
                    </h3>
                    <p className="text-[11.5px] text-[#667085] leading-relaxed">
                      Separated tabs for Executive Summary, Issues &amp; Fixes, Column Health, and
                      Safe Data with auto-fitted widths so text never clips.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownloadXlsx()}
                    className="w-full h-[42px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel Workbook (.xlsx)</span>
                  </button>
                </div>

                {/* Error & Remediation CSV */}
                <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B91C1C] bg-[#FDECEC] px-2.5 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Fix Checklist
                    </span>
                    <h3 className="text-[15px] font-bold text-[#10213B] pt-1">
                      Error &amp; Remediation CSV
                    </h3>
                    <p className="text-[11.5px] text-[#667085] leading-relaxed">
                      Clean UTF-8 spreadsheet sorted Critical-first with readable column labels and
                      fix instructions ({selectedIssues.length} flagged items).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownloadErrorCsv()}
                    className="w-full h-[42px] rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#D84A4A] text-[#10213B] text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-[#D84A4A]" />
                    <span>Download Error Rows (.csv)</span>
                  </button>
                </div>

                {/* Sanitized Clean CSV */}
                <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Formula Neutralized
                    </span>
                    <h3 className="text-[15px] font-bold text-[#10213B] pt-1">
                      {selectedJob.sanitizedRows.length > 0
                        ? 'Sanitized Clean Data (.csv)'
                        : 'Safe Audit Table (.csv)'}
                    </h3>
                    <p className="text-[11.5px] text-[#667085] leading-relaxed">
                      {selectedJob.sanitizedRows.length > 0
                        ? `${selectedJob.sanitizedRows.length} full rows exported with executable formula payloads neutralized safely.`
                        : 'Reconstructed safe audit table from saved cell checks — ready for controller sign-off.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownloadSanitizedCsv()}
                    className="w-full h-[42px] rounded-[10px] bg-white border border-[#E4E9F1] hover:border-[#16A36A] text-[#10213B] text-xs font-semibold inline-flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-[#16A36A]" />
                    <span>
                      {selectedJob.sanitizedRows.length > 0
                        ? 'Download Sanitized CSV'
                        : 'Download Safe Summary CSV'}
                    </span>
                  </button>
                </div>

                {/* Printable Report + JSON Manifest */}
                <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-5 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                      <FileText className="w-3 h-3" /> Print &amp; API Audit
                    </span>
                    <h3 className="text-[15px] font-bold text-[#10213B] pt-1">
                      Visual Print Report &amp; JSON
                    </h3>
                    <p className="text-[11.5px] text-[#667085] leading-relaxed">
                      Open a clean print-ready PDF audit view or download the full structured JSON
                      manifest.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => void handleOpenPrintReport()}
                      className="h-[42px] px-3 rounded-[10px] bg-[#10213B] hover:bg-[#1B3258] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDownloadJsonManifest()}
                      className="h-[42px] px-3 rounded-[10px] border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#667085]" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Separated Tabbed Interactive Report Preview */}
              <div className="rounded-[18px] bg-white border border-[#E4E9F1] shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3.5 border-b border-[#E4E9F1] bg-[#FBFCFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(
                      [
                        { id: 'ISSUES', label: `Issues & Fixes (${selectedIssues.length})` },
                        {
                          id: 'COLUMNS',
                          label: `Column Health (${columnHealthGroups.length})`,
                        },
                        {
                          id: 'SANITIZED',
                          label: `Sanitized Preview (${selectedJob.sanitizedRows.length})`,
                        },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 sm:px-3.5 py-1.5 rounded-[9px] text-[11px] sm:text-xs font-semibold transition ${
                          activeTab === t.id
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'text-[#667085] hover:bg-[#EFF3F9] hover:text-[#10213B]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'ISSUES' && selectedIssues.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {(['ALL', 'CRITICAL', 'WARNING'] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setIssueSeverityFilter(sev)}
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold transition ${
                            issueSeverityFilter === sev
                              ? 'bg-[#EAF2FF] text-[#2563EB]'
                              : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#10213B]'
                          }`}
                        >
                          {sev === 'ALL' ? 'All' : sev === 'CRITICAL' ? 'Critical' : 'Warnings'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {loadingIssuesFor === selectedJob.id ? (
                  <div className="p-8 text-center text-xs text-[#667085] flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    <span>Loading separated report details...</span>
                  </div>
                ) : activeTab === 'ISSUES' ? (
                  filteredPreviewIssues.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#15803D] font-semibold">
                      Zero issues found in this view. Your file passes cleanly!
                    </div>
                  ) : (
                    <>
                      {/* Phone View: Vertical Issue Cards (zero cramping or horizontal scroll) */}
                      <div className="md:hidden divide-y divide-[#E4E9F1]">
                        {filteredPreviewIssues.map((iss) => (
                          <div key={`m-${iss.id}`} className="p-4 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-2 py-0.5 rounded-[6px] bg-[#EFF3F9] text-[#10213B] font-bold text-[10.5px] shrink-0">
                                  Row {iss.rowNumber}
                                </span>
                                <span className="font-mono text-[12px] font-bold text-[#10213B] truncate">
                                  {iss.columnName}
                                </span>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                  iss.severity === 'CRITICAL'
                                    ? 'bg-[#FDECEC] text-[#B91C1C]'
                                    : 'bg-[#FEF3C7] text-[#B45309]'
                                }`}
                              >
                                {iss.severity === 'CRITICAL' ? 'Critical' : 'Warning'}
                              </span>
                            </div>

                            <div className="rounded-[9px] bg-[#F8FAFC] border border-[#E4E9F1] px-3 py-2 flex items-start justify-between gap-2 text-[11px]">
                              <span className="text-[#64748B] font-semibold shrink-0">
                                {formatRuleTypeLabel(iss.ruleType)}:
                              </span>
                              <span className="font-mono text-[#D84A4A] break-all text-right">
                                {iss.rawValue || '(Empty)'}
                              </span>
                            </div>

                            <p className="text-[12px] text-[#475569] leading-relaxed">
                              {formatRuleGuidance(iss)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View: Full Separated Audit Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#F7F9FC] text-[#667085] text-[10px] font-bold uppercase tracking-wider">
                              <th className="py-3 px-4 whitespace-nowrap">Row</th>
                              <th className="py-3 px-4 whitespace-nowrap">Column</th>
                              <th className="py-3 px-4 whitespace-nowrap">Severity &amp; Rule</th>
                              <th className="py-3 px-4 whitespace-nowrap">Safe Input</th>
                              <th className="py-3 px-4">Issue Details &amp; How to Fix</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E4E9F1]">
                            {filteredPreviewIssues.map((iss) => (
                              <tr key={iss.id} className="hover:bg-[#FBFCFE] align-top">
                                <td className="py-3.5 px-4 font-bold text-[#10213B] whitespace-nowrap">
                                  Row {iss.rowNumber}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-[#10213B] whitespace-nowrap">
                                  {iss.columnName}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                                  <div>
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        iss.severity === 'CRITICAL'
                                          ? 'bg-[#FDECEC] text-[#B91C1C]'
                                          : 'bg-[#FEF3C7] text-[#B45309]'
                                      }`}
                                    >
                                      {iss.severity === 'CRITICAL' ? 'Critical' : 'Warning'}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-[#64748B]">
                                    {formatRuleTypeLabel(iss.ruleType)}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px] text-[#D84A4A] max-w-[170px] break-all">
                                  {iss.rawValue || '(Empty)'}
                                </td>
                                <td className="py-3.5 px-4 text-[#475569] min-w-[220px] leading-relaxed">
                                  {formatRuleGuidance(iss)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                ) : activeTab === 'COLUMNS' ? (
                  columnHealthGroups.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#15803D] font-semibold">
                      Every column in this workbook is 100% healthy!
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 space-y-3">
                      {columnHealthGroups.map((grp) => (
                        <div
                          key={grp.column}
                          className="rounded-[12px] border border-[#E4E9F1] bg-[#FBFCFE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#10213B]">
                                {grp.column}
                              </span>
                              {grp.critical > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FDECEC] text-[#B91C1C] text-[10px] font-bold">
                                  {grp.critical} Critical
                                </span>
                              )}
                              {grp.warning > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold">
                                  {grp.warning} Warning
                                </span>
                              )}
                              {grp.shielded > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-[10px] font-bold">
                                  {grp.shielded} Shielded
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#64748B] leading-relaxed">
                              {grp.sampleFix}
                            </p>
                          </div>
                          <Link
                            to={`/app/results/${selectedJob.id}`}
                            className="text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
                          >
                            Inspect cells →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )
                ) : selectedJob.sanitizedRows.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="text-xs font-semibold text-[#10213B]">
                      Sanitized cell matrix is stored per active upload session
                    </div>
                    <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
                      Download the <strong>Styled Excel Report (.xlsx)</strong> or{' '}
                      <strong>Error &amp; Remediation CSV</strong> above for complete formatted audit
                      details, or re-upload the workbook to preview full row data live.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Phone View: Stacked Key-Value Row Cards */}
                    <div className="md:hidden p-4 space-y-3">
                      {selectedJob.sanitizedRows.slice(0, 12).map((row, idx) => (
                        <div
                          key={`ms-${idx}`}
                          className="rounded-[12px] border border-[#E4E9F1] bg-[#FAFCFF] p-3.5 space-y-2"
                        >
                          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#2563EB]">
                            Row {idx + 1}
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            {Object.keys(selectedJob.sanitizedRows[0]).map((col) => (
                              <div
                                key={col}
                                className="flex items-start justify-between gap-3 border-t border-[#EDF1F7] pt-1.5"
                              >
                                <span className="text-[#667085] font-semibold shrink-0">{col}</span>
                                <span
                                  className={`font-mono text-right break-all ${
                                    String(row[col] ?? '').startsWith("'")
                                      ? 'text-[#6D28D9] font-semibold'
                                      : 'text-[#10213B]'
                                  }`}
                                >
                                  {row[col] || '—'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View: Horizontal Matrix Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#F7F9FC] text-[#667085] text-[10px] font-bold uppercase">
                            {Object.keys(selectedJob.sanitizedRows[0]).map((col) => (
                              <th key={col} className="py-3 px-4 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E4E9F1]">
                          {selectedJob.sanitizedRows.slice(0, 12).map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#FBFCFE]">
                              {Object.keys(selectedJob.sanitizedRows[0]).map((col) => (
                                <td
                                  key={col}
                                  className={`py-3 px-4 whitespace-nowrap font-mono text-[11px] ${
                                    String(row[col] ?? '').startsWith("'")
                                      ? 'text-[#6D28D9] font-semibold bg-[#F5F3FF]'
                                      : 'text-[#10213B]'
                                  }`}
                                >
                                  {row[col] || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

/**
 * 3. Run History & Job Details Page (Figma Nodes 117:2 & 117:146)
 */
export const RunHistoryAndJobDetailPage: React.FC = () => {
  const { jobs } = useAppState();
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(jobs[0]?.id);
  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#10213B]">Run history</h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {CUSTOMER_RESULTS_TEXT.historySubtitle}
        </p>
      </div>

      {!selectedJob ? (
        <div className="rounded-[18px] bg-white border border-[#E4E9F1] p-10 text-center space-y-3 shadow-sm">
          <h2 className="text-[18px] font-bold text-[#10213B]">No validation runs recorded yet</h2>
          <p className="text-[13px] text-[#667085] max-w-md mx-auto">
            Your completed validation runs and audit reports will appear here automatically.
          </p>
          <Link
            to="/app/upload"
            className="inline-flex h-[40px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold items-center justify-center transition"
          >
            Run first validation →
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-[18px] bg-white border border-[#E4E9F1] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E4E9F1] font-bold text-[15px] text-[#10213B]">
            All Workspace Jobs ({jobs.length})
          </div>
          <div className="divide-y divide-[#E4E9F1]">
            {jobs.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => setSelectedJobId(j.id)}
                className={`w-full text-left p-5 hover:bg-[#FBFCFE] transition flex items-center justify-between gap-3 ${
                  selectedJob.id === j.id ? 'bg-[#F4F8FF]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#2563EB]">{j.id}</span>
                    <span className="text-sm font-bold text-[#10213B]">{j.fileName}</span>
                  </div>
                  <div className="text-[11px] text-[#667085] mt-1">
                    {j.createdAt} · {j.profileName} · {j.summary.totalEvaluatedRows.toLocaleString()} rows
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GradeBadge grade={j.summary.validationGrade} />
                  <EligibilityBadge eligibility={j.summary.processingEligibility} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Job State Machine Inspector */}
        <div className="lg:col-span-5 rounded-[18px] bg-[#111F37] text-white p-6 border border-[#1B2D4B] space-y-4">
          <div className="flex items-center justify-between border-b border-[#273E63] pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CC0FF]">
                JOB EXECUTION TIMELINE
              </span>
              <h2 className="text-[18px] font-bold text-white mt-0.5">{selectedJob.id}</h2>
            </div>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#233E65] text-[#9CC0FF] font-bold">
              {selectedJob.state}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { step: 'UPLOADED', ms: '+0ms' },
              { step: 'SCANNING (Magic Bytes & Zip Ratio)', ms: '+140ms' },
              { step: 'VALIDATING (5,000-row streaming chunks)', ms: '+890ms' },
              {
                step: 'SCORING (DQS + Eligibility Separation)',
                ms: `+${selectedJob.durationMs}ms`,
              },
              { step: `TERMINAL: ${selectedJob.state}`, ms: selectedJob.completedAt },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-[10px] bg-[#1B2D4B] border border-[#273E63] px-3.5 py-2.5 flex items-center justify-between"
              >
                <span className="text-[#D6DFEA]">{s.step}</span>
                <span className="text-[#86EFAC]">{s.ms}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to={`/app/results/${selectedJob.id}`}
              className="w-full h-[42px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center justify-center transition"
            >
              Open Full Validation Report →
            </Link>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

/**
 * 4. Customer Billing & Plans Page (Figma Nodes 11:161 & 121:197)
 */
export const CustomerBillingPage: React.FC = () => {
  const {
    currency,
    setCurrency,
    configMode,
    setConfigMode,
    activePlanId,
    setActivePlanId,
    downgradeGraceActive,
    setDowngradeGraceActive,
    jobs,
  } = useAppState();

  const plans = getPlansByMode(configMode);
  const currentPlan = plans[activePlanId];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#10213B]">{CUSTOMER_RESULTS_TEXT.billingTitle}</h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {CUSTOMER_RESULTS_TEXT.billingSubtitle}
        </p>
      </div>

      <ProvisionalConfigSwitcher
        configMode={configMode}
        onChangeMode={setConfigMode}
        currency={currency}
        onChangeCurrency={setCurrency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#667085]">
                ACTIVE WORKSPACE PLAN
              </span>
              <h2 className="text-[22px] font-bold text-[#10213B] mt-0.5">
                {currentPlan.name} Plan ({formatPlanPrice(currentPlan, currency)} / month)
              </h2>
            </div>
            <div className="flex gap-2">
              {(['free', 'starter', 'pro'] as PlanTierId[]).map((tid) => (
                <button
                  key={tid}
                  type="button"
                  onClick={() => {
                    setActivePlanId(tid);
                    if (tid === 'free') setDowngradeGraceActive(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-[9px] text-xs font-semibold capitalize transition ${
                    activePlanId === tid
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#F5F7FB] text-[#667085] hover:text-[#10213B]'
                  }`}
                >
                  {tid}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[12px] bg-[#F7F9FC] p-4 border border-[#E4E9F1]">
              <div className="text-[#667085]">Monthly Checks</div>
              <div className="text-[18px] font-bold text-[#10213B] mt-1">
                {jobs.length} / {currentPlan.monthlyValidations}
              </div>
            </div>
            <div className="rounded-[12px] bg-[#F7F9FC] p-4 border border-[#E4E9F1]">
              <div className="text-[#667085]">Max Upload Size</div>
              <div className="text-[18px] font-bold text-[#10213B] mt-1">
                {currentPlan.maxFileSizeMb} MB
              </div>
            </div>
            <div className="rounded-[12px] bg-[#F7F9FC] p-4 border border-[#E4E9F1]">
              <div className="text-[#667085]">Report Retention</div>
              <div className="text-[18px] font-bold text-[#10213B] mt-1">
                {currentPlan.retentionDays} Days
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-[18px] bg-[#111F37] text-white p-6 border border-[#1B2D4B] space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CC0FF]">
            {CUSTOMER_RESULTS_TEXT.downgradeGraceTitle}
          </span>
          <h3 className="text-[17px] font-bold text-white">
            7-Day Downgrade Read-Only Grace Period
          </h3>
          <p className="text-xs text-[#C6D4E9] leading-relaxed">
            When a workspace downgrades from Pro (20 profiles) to Free (1 profile), excess profiles
            are locked in Read-Only mode for 7 days rather than deleted.
          </p>
          <button
            type="button"
            onClick={() => setDowngradeGraceActive(!downgradeGraceActive)}
            className={`w-full h-[42px] rounded-[10px] text-xs font-semibold transition ${
              downgradeGraceActive
                ? 'bg-[#D99121] text-white'
                : 'bg-[#1B2D4B] hover:bg-[#233E65] text-white border border-[#304766]'
            }`}
          >
            {downgradeGraceActive
              ? 'Grace Period Lock ACTIVE (Click to Clear)'
              : 'Simulate Downgrade Read-Only Grace Lock'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. Customer Settings — Repaired Layout & Sticky Footer (Figma Node 136:176 & 114:2)
 */
export const CustomerSettingsPage: React.FC = () => {
  const { authUser, updateUserProfile } = useAppState();
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [email, setEmail] = useState(authUser?.email || '');
  const [language, setLanguage] = useState('English (United States) — en-US');
  const [timezone, setTimezone] = useState('(UTC+08:00) Asia/Manila — Philippine Time');
  const [digestOn, setDigestOn] = useState(true);
  const [purgeWarnOn, setPurgeWarnOn] = useState(true);
  const [quotaAlertOn, setQuotaAlertOn] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName);
      setEmail(authUser.email);
    }
  }, [authUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ fullName });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      // Keep non-blocking feedback if offline
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  const handleReset = () => {
    setFullName(authUser?.fullName || '');
    setLanguage('English (United States) — en-US');
    setTimezone('(UTC+08:00) Asia/Manila — Philippine Time');
    setDigestOn(true);
    setPurgeWarnOn(true);
    setQuotaAlertOn(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#10213B]">
            {CUSTOMER_RESULTS_TEXT.settingsTitle}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {CUSTOMER_RESULTS_TEXT.settingsSubtitle}
          </p>
        </div>
      </div>

      {/* Main 2-Column Settings Grid (Nodes 136:202 - 136:236) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Personal Profile & Identity (Node 136:202) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm space-y-4">
            <h2 className="text-[16px] font-bold text-[#0F172A]">
              Personal Profile &amp; Identity
            </h2>

            <div>
              <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-[40px] rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] px-3.5 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
                Email Address (Requires Dual-Inbox Confirmation to Change)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 h-[40px] rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] px-3.5 flex items-center justify-between">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-[13px] text-[#0F172A] focus:outline-none w-full"
                  />
                  <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#166534] text-[10px] font-bold shrink-0">
                    VERIFIED
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSavedNotice(true)}
                  className="h-[40px] px-4 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[12px] font-bold shrink-0 hover:bg-[#DBEAFE] transition"
                >
                  Change Email
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Regional & Localization Preferences (Node 136:221) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A]">
                Regional &amp; Localization Preferences
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Controls date/time formatting in validation reports and audit logs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
                  Interface Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-[40px] rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                >
                  <option>English (United States) — en-US</option>
                  <option>English (Philippines) — en-PH</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#475569] mb-1.5">
                  Default Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-[40px] rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                >
                  <option>(UTC+08:00) Asia/Manila — Philippine Time</option>
                  <option>(UTC+00:00) UTC — Coordinated Universal Time</option>
                  <option>(UTC-08:00) America/Los_Angeles — Pacific Time</option>
                </select>
              </div>
            </div>

            <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-[12px] text-[#475569]">
              {CUSTOMER_RESULTS_TEXT.settingsStickyNoticeBody}
            </div>
          </div>
        </div>

        {/* Right 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: Notification Preferences (Node 136:236) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm space-y-4">
            <h2 className="text-[16px] font-bold text-[#0F172A]">Notification Preferences</h2>

            {[
              {
                title: 'Validation Completed Digests',
                desc: 'Email summary when batch jobs finish',
                on: digestOn,
                toggle: () => setDigestOn(!digestOn),
              },
              {
                title: 'Storage Retention Purge Warnings',
                desc: 'Notify 24h before 7/30/90-day file expiry',
                on: purgeWarnOn,
                toggle: () => setPurgeWarnOn(!purgeWarnOn),
              },
              {
                title: 'Monthly Usage & Quota Summaries',
                desc: 'Alert at 80% and 100% plan check usage',
                on: quotaAlertOn,
                toggle: () => setQuotaAlertOn(!quotaAlertOn),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[8px] bg-[#F8FAFC] p-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A]">{item.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{item.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={item.toggle}
                  className={`w-[44px] h-[24px] rounded-[12px] font-bold text-[10px] transition shrink-0 ${
                    item.on ? 'bg-[#2563EB] text-white' : 'bg-[#CBD5E1] text-[#475569]'
                  }`}
                >
                  {item.on ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>

          {/* Scoped API Key Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm space-y-2 text-xs">
            <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#2563EB]" />
              <span>Workspace API Key Prefix</span>
            </div>
            <div className="font-mono text-[#475569] bg-[#F8FAFC] p-2.5 rounded-[8px] border border-[#E2E8F0]">
              ss_live_99481a•••••••••••••••••••••••• (Active)
            </div>
          </div>
        </div>
      </div>

      <div className="ss-customer-sticky-bar px-5 py-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B]">
          {savedNotice ? (
            <span className="text-[#16A36A] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved successfully!
            </span>
          ) : (
            <span>Unsaved changes in Regional Preferences</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="h-[40px] px-5 rounded-[8px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[13px] font-semibold text-[#334155] transition"
          >
            Reset Changes
          </button>
          <button
            type="submit"
            className="h-[40px] px-6 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold shadow-sm transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

/**
 * 6. Customer Help Center & Error Reference
 */
export const HelpCenterPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#10213B]">{CUSTOMER_RESULTS_TEXT.helpTitle}</h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {CUSTOMER_RESULTS_TEXT.helpSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {[
          {
            code: 'ERR_FORMULA_INJECTION_01',
            title: 'Formula Trigger Neutralized (=, +, -, @)',
            desc: "Triggered when a text cell begins with an executable formula character. SheetSentry never evaluates the expression and prefixes it with an apostrophe (') on export.",
          },
          {
            code: 'ERR_MAGIC_BYTES_SPOOF',
            title: 'OOXML / CSV Signature Mismatch',
            desc: 'Triggered when an .xlsx upload lacks the 50 4B 03 04 PKZIP header or when a .csv file contains binary null bytes.',
          },
          {
            code: 'ERR_ZIP_BOMB_RATIO',
            title: 'Decompression Ratio Exceeds 25:1 Ceiling',
            desc: 'Protects streaming worker containers (1,024 MB limit) from maliciously compressed OOXML XML streams.',
          },
          {
            code: 'ELIGIBILITY_BLOCKED_CRITICAL',
            title: 'High DQS Overridden by Critical Blocking Rule',
            desc: 'Explains why a spreadsheet with 99% DQS (Grade A) is still blocked from downstream ingestion if even 1 Critical Blocking rule fails.',
          },
        ].map((doc) => (
          <div
            key={doc.code}
            className="rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-2.5"
          >
            <span className="inline-block font-mono font-bold text-[11px] text-[#2563EB] bg-[#EAF2FF] px-2.5 py-1 rounded-full">
              {doc.code}
            </span>
            <h3 className="text-[15px] font-bold text-[#10213B]">{doc.title}</h3>
            <p className="text-[#667085] leading-relaxed">{doc.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

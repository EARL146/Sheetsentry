import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileSpreadsheet,
  Lock,
  Play,
  Plus,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { getPlansByMode } from '../../config/productConfig';
import { useAppState } from '../../context/AppStateContext';
import {
  inferColumnsFromWorksheet,
  inspectUploadedFile,
  SAMPLE_DATASETS,
} from '../../services/spreadsheetParser';
import {
  evaluateRowsWithProfile,
  RuleSeverity,
  RuleType,
  ValidationRule,
} from '../../services/validationEngine';
import {
  EligibilityBadge,
  GradeBadge,
  ProvisionalConfigSwitcher,
} from '../../components/SharedUI';
import {
  CUSTOMER_DASHBOARD_TEXT,
  CUSTOMER_PROFILES_RULES_TEXT,
  CUSTOMER_UPLOAD_TEXT,
} from '../../content/customerText';

/**
 * 1. Customer Dashboard (Figma Node 4:51)
 */
export const CustomerDashboardPage: React.FC = () => {
  const {
    authUser,
    jobs,
    activePlanId,
    configMode,
    setConfigMode,
    currency,
    setCurrency,
    loadSampleDataset,
  } = useAppState();
  const navigate = useNavigate();

  const firstName = (authUser?.fullName || 'Customer').trim().split(/\s+/)[0] || 'Customer';
  const totalFilesChecked = jobs.length;
  const totalRowsReviewed = jobs.reduce((acc, j) => acc + (j.summary.totalEvaluatedRows || 0), 0);
  const filesWithIssuesCount = jobs.filter(
    (j) =>
      j.state === 'QUARANTINED' ||
      j.summary.criticalRowsCount > 0 ||
      j.summary.warningOnlyRowsCount > 0
  ).length;
  const avgValidPct =
    totalRowsReviewed > 0
      ? (
          (jobs.reduce((acc, j) => acc + (j.summary.cleanRowsCount || 0), 0) / totalRowsReviewed) *
          100
        ).toFixed(1)
      : '100.0';
  const totalStorageKb = Math.round(
    jobs.reduce((acc, j) => acc + (j.fileSizeBytes || 0), 0) / 1024
  );

  // 14-Day Bar Chart Data (Node 4:127)
  const barChartDays = [
    { label: 'Oct 25', h: jobs.length ? 52 : 12, active: false },
    { label: '', h: jobs.length ? 72 : 14, active: false },
    { label: 'Oct 27', h: jobs.length ? 61 : 12, active: false },
    { label: '', h: jobs.length ? 90 : 16, active: false },
    { label: 'Oct 29', h: jobs.length ? 78 : 14, active: false },
    { label: '', h: jobs.length ? 108 : 18, active: jobs.length > 0 },
    { label: 'Oct 31', h: jobs.length ? 94 : 12, active: false },
    { label: '', h: jobs.length ? 84 : 14, active: false },
    { label: 'Nov 2', h: jobs.length ? 118 : 16, active: jobs.length > 0 },
    { label: '', h: jobs.length ? 102 : 12, active: false },
    { label: 'Nov 4', h: jobs.length ? 126 : 14, active: jobs.length > 0 },
    { label: '', h: jobs.length ? 112 : 16, active: false },
    { label: 'Nov 6', h: jobs.length ? 136 : 18, active: jobs.length > 0 },
    { label: 'Today', h: jobs.length ? 122 : Math.min(136, 20 + jobs.length * 24), active: true },
  ];

  // Live workspace jobs mapped into Recent Validations table rows
  const recentRows = jobs.slice(0, 6).map((j) => {
    const isCritical = j.state === 'QUARANTINED' || j.summary.criticalRowsCount > 0;
    const isReview = !isCritical && j.summary.warningOnlyRowsCount > 0;
    const issuesTotal =
      (j.summary.totalCriticalIssues || 0) + (j.summary.totalWarningIssues || 0);
    return {
      id: j.id,
      file: j.fileName,
      profile: j.profileName,
      rows: j.summary.totalEvaluatedRows.toLocaleString(),
      score:
        j.summary.dataQualityScore !== null ? `${j.summary.dataQualityScore.toFixed(1)}%` : 'N/A',
      issues: String(issuesTotal),
      status: isCritical ? 'Blocked' : isReview ? 'Review' : 'Healthy',
      statusPill: isCritical
        ? 'bg-[#FEECEC] text-[#D84A4A]'
        : isReview
        ? 'bg-[#FFF4DE] text-[#D99121]'
        : 'bg-[#E8F7EF] text-[#16A36A]',
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Row (Node 4:97) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[#10213B] leading-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {authUser?.workspaceName || 'Your spreadsheet workspace'} ·{' '}
            {totalFilesChecked === 0
              ? 'Ready for your first spreadsheet check.'
              : `${totalFilesChecked} completed ${
                  totalFilesChecked === 1 ? 'validation' : 'validations'
                }.`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              loadSampleDataset('q4_payroll_audit');
              navigate('/app/upload/preflight');
            }}
            className="h-[44px] px-3 sm:px-4 rounded-[11px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[12px] font-semibold text-[#10213B] transition w-full sm:w-auto truncate"
          >
            Quick demo preflight
          </button>
          <Link
            to="/app/upload"
            className="h-[44px] px-4 sm:px-6 rounded-[11px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold inline-flex items-center justify-center shadow-sm transition w-full sm:w-auto whitespace-nowrap"
          >
            Upload a file
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Nodes 4:101 - 4:126) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            dot: 'bg-[#2563EB]',
            label: 'Files checked',
            value: String(totalFilesChecked),
            sub: totalFilesChecked > 0 ? 'Saved to workspace' : 'Ready for first check',
            subColor: 'text-[#2563EB]',
          },
          {
            dot: 'bg-[#16A36A]',
            label: 'Rows reviewed',
            value: totalRowsReviewed.toLocaleString(),
            sub: totalRowsReviewed > 0 ? `${avgValidPct}% clean` : 'No rows evaluated yet',
            subColor: 'text-[#16A36A]',
          },
          {
            dot: 'bg-[#D99121]',
            label: 'Files with issues',
            value: String(filesWithIssuesCount),
            sub: filesWithIssuesCount > 0 ? 'Needs review' : 'Zero blockers',
            subColor: 'text-[#D99121]',
          },
          {
            dot: 'bg-[#7658D6]',
            label: 'Storage used',
            value: totalStorageKb >= 1024 ? `${(totalStorageKb / 1024).toFixed(1)} MB` : `${totalStorageKb} KB`,
            sub: `${activePlanId.toUpperCase()} tier quota`,
            subColor: 'text-[#7658D6]',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#E4E9F1] rounded-[16px] p-5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-[6px] h-[6px] rounded-[3px] ${kpi.dot}`} />
              <span className="text-[11px] font-medium text-[#667085]">{kpi.label}</span>
            </div>
            <div className="text-[28px] font-bold text-[#10213B] mt-2 leading-none">
              {kpi.value}
            </div>
            <div className={`text-[10.5px] font-semibold mt-3 ${kpi.subColor}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle Row: 14-Day Validation Activity Chart + Quick Actions (Nodes 4:127 & 4:149) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Validation Activity Card (Node 4:127) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#10213B]">Validation activity</h2>
              <p className="text-[11px] text-[#667085] mt-0.5">
                Files checked over the last 14 days
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
              {totalFilesChecked} {totalFilesChecked === 1 ? 'check' : 'checks'}
            </span>
          </div>

          <div className="mt-8 pt-4 border-b border-[#E4E9F1] flex items-end justify-between gap-2 h-[160px] px-2">
            {barChartDays.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  style={{ height: `${bar.h}px` }}
                  className={`w-full max-w-[28px] rounded-[7px] transition-all ${
                    bar.active ? 'bg-[#2563EB]' : 'bg-[#8CB5FF]'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#667085] pt-2.5 px-1">
            <span>Oct 25</span>
            <span>Oct 27</span>
            <span>Oct 29</span>
            <span>Oct 31</span>
            <span>Nov 2</span>
            <span>Nov 4</span>
            <span>Nov 6</span>
          </div>
        </div>

        {/* Quick Actions Card (Node 4:149) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">Quick actions</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">Common tasks for recurring files</p>
          </div>

          <Link
            to="/app/upload"
            className="block bg-[#F4F8FF] hover:bg-[#EAF2FF] border border-[#DCE8FF] rounded-[12px] p-4 transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#2563EB] text-white font-bold text-[14px] flex items-center justify-center shrink-0">
                ⇧
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#10213B]">Upload a new file</div>
                <div className="text-[10.5px] text-[#667085] mt-0.5">
                  Check a CSV or Excel file now
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/app/profiles/builder"
            className="block bg-[#FAFBFD] hover:bg-[#F5F7FB] border border-[#E4E9F1] rounded-[12px] p-4 transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#EAF2FF] text-[#2563EB] font-bold text-[14px] flex items-center justify-center shrink-0">
                ⛨
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#10213B]">
                  Create a validation profile
                </div>
                <div className="text-[10.5px] text-[#667085] mt-0.5">
                  Save column rules for repeat use
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Validations Card (Node 4:163) */}
      <div className="bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-[#10213B]">Recent validations</h2>
          <Link
            to="/app/history"
            className="text-[11px] font-semibold text-[#2563EB] hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentRows.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center space-y-3">
            <div className="text-[15px] font-bold text-[#10213B]">
              No validation runs in this workspace yet
            </div>
            <p className="text-[12px] text-[#667085] max-w-md mx-auto">
              Upload a CSV or XLSX spreadsheet (or try a sample workbook) to check your columns,
              catch issues early, and save your validation report.
            </p>
            <Link
              to="/app/upload"
              className="inline-flex h-[40px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold items-center justify-center transition"
            >
              Upload first spreadsheet →
            </Link>
          </div>
        ) : (
          <>
            {/* Phone View: Stacked Validation Cards */}
            <div className="md:hidden space-y-3">
              {recentRows.map((row) => (
                <Link
                  key={`m-${row.id}`}
                  to={`/app/results/${row.id}`}
                  className="block rounded-[12px] border border-[#E4E9F1] bg-[#FAFCFF] p-3.5 hover:border-[#2563EB] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-[#10213B] truncate">{row.file}</div>
                      <div className="text-[11px] text-[#667085] truncate mt-0.5">{row.profile}</div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.statusPill}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#EDF1F7] text-[11px]">
                    <div>
                      <div className="text-[#98A2B3] text-[9.5px] uppercase font-bold">Rows</div>
                      <div className="font-semibold text-[#10213B]">{row.rows}</div>
                    </div>
                    <div>
                      <div className="text-[#98A2B3] text-[9.5px] uppercase font-bold">Score</div>
                      <div className="font-bold text-[#10213B]">{row.score}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#98A2B3] text-[9.5px] uppercase font-bold">Issues</div>
                      <div className="font-semibold text-[#10213B]">{row.issues}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop View: Full Validation Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F9FC] text-[#667085] text-[9.5px] font-bold uppercase">
                    <th className="py-3 px-4 rounded-l-[8px]">FILE NAME</th>
                    <th className="py-3 px-4">PROFILE</th>
                    <th className="py-3 px-4">ROWS</th>
                    <th className="py-3 px-4">QUALITY SCORE</th>
                    <th className="py-3 px-4">ISSUES</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right rounded-r-[8px]">REPORT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F1]">
                  {recentRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#FBFCFE]">
                      <td className="py-3.5 px-4 font-semibold text-[#10213B]">{row.file}</td>
                      <td className="py-3.5 px-4 text-[#667085]">{row.profile}</td>
                      <td className="py-3.5 px-4 text-[#667085]">{row.rows}</td>
                      <td className="py-3.5 px-4 font-bold text-[#10213B]">{row.score}</td>
                      <td className="py-3.5 px-4 text-[#667085]">{row.issues}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${row.statusPill}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/app/results/${row.id}`}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          Open report →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Compact Conflict Register Switcher */}
      <ProvisionalConfigSwitcher
        configMode={configMode}
        onChangeMode={setConfigMode}
        currency={currency}
        onChangeCurrency={setCurrency}
        compact
      />
    </div>
  );
};

/**
 * 2. Customer Upload File Page (Figma Node 4:211)
 */
export const UploadFilePage: React.FC = () => {
  const {
    activePlanId,
    configMode,
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    setActivePreflight,
    setSelectedWorksheetIndex,
    loadSampleDataset,
  } = useAppState();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const plan = getPlansByMode(configMode)[activePlanId];

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    const result = await inspectUploadedFile(file, plan.maxFileSizeMb);
    setActivePreflight(result);
    setSelectedWorksheetIndex(0);
    navigate('/app/upload/preflight');
  };

  return (
    <div className="space-y-6">
      {/* Header (Node 4:247) */}
      <div>
        <h1 className="text-[28px] font-bold text-[#10213B]">Upload a spreadsheet</h1>
        <p className="text-[13px] text-[#667085] mt-1">
          Select a CSV or Excel file and choose the validation profile to run.
        </p>
      </div>

      {/* Main Two-Column Upload Layout (Nodes 4:249 & 4:266) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Choose your file Card (Node 4:249) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E9F1] rounded-[18px] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">Choose your file</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">
              Your original spreadsheet is never modified.
            </p>
          </div>

          {/* Dropzone (Node 4:252) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-[16px] border p-10 text-center transition ${
              isDragging
                ? 'bg-[#EAF2FF] border-[#2563EB]'
                : 'bg-[#F7FAFF] border-[#A8C5F7] hover:border-[#2563EB]'
            }`}
          >
            <div className="w-[54px] h-[54px] rounded-full bg-[#DCEBFF] text-[#2563EB] font-bold text-[22px] flex items-center justify-center mx-auto">
              ⇧
            </div>
            <h3 className="text-[18px] font-bold text-[#10213B] mt-4">Drop your file here</h3>
            <p className="text-[12px] text-[#667085] mt-1.5">
              Supports CSV and XLSX files up to {plan.maxFileSizeMb} MB on the {plan.name} plan.
            </p>

            <div className="mt-6">
              <label className="cursor-pointer h-[40px] px-6 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold inline-flex items-center justify-center shadow-sm transition">
                Choose a file
                <input
                  type="file"
                  accept=".csv,.tsv,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileSelected(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          {/* Validation Profile Selector + Run Validation CTA (Nodes 4:259 - 4:265) */}
          <div className="space-y-2 pt-2">
            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#667085]">
              VALIDATION PROFILE
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="flex-1 h-[44px] rounded-[10px] bg-[#F9FAFC] border border-[#E4E9F1] px-4 text-[12px] font-medium text-[#10213B] focus:outline-none focus:border-[#2563EB]"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.rules.length} column rules
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  loadSampleDataset('q4_payroll_audit');
                  navigate('/app/upload/preflight');
                }}
                className="h-[44px] px-6 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[12px] font-semibold shrink-0 transition"
              >
                Run validation
              </button>
            </div>
          </div>

          {/* Interactive Sample Datasets for Instant Testing */}
          <div className="pt-4 border-t border-[#E4E9F1]">
            <div className="text-[11px] font-bold text-[#10213B] mb-2.5">
              Or test immediately with a pre-loaded sample workbook:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(SAMPLE_DATASETS).map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    loadSampleDataset(sample.id);
                    navigate('/app/upload/preflight');
                  }}
                  className="text-left rounded-[12px] border border-[#E4E9F1] hover:border-[#2563EB] bg-[#FBFCFE] p-3.5 transition flex items-start gap-2.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11.5px] font-bold text-[#10213B]">{sample.label}</div>
                    <div className="text-[10.5px] text-[#667085] mt-0.5 line-clamp-2">
                      {sample.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Before you upload Guidance Card (Node 4:266) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">Before you upload</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">
              What SheetSentry checks automatically
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                num: '01',
                title: 'Choose a saved profile',
                desc: 'Use an existing column rule set or create a new one after inspection.',
              },
              {
                num: '02',
                title: 'Upload your file',
                desc: 'SheetSentry checks file structure, headers and encoding.',
              },
              {
                num: '03',
                title: 'Review the results',
                desc: 'See valid rows, grouped issues and downloadable error rows.',
              },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <span className="w-[24px] h-[24px] rounded-full bg-[#EAF2FF] text-[#2563EB] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {step.num}
                </span>
                <div>
                  <div className="text-[12px] font-bold text-[#10213B]">{step.title}</div>
                  <div className="text-[11px] text-[#667085] mt-0.5 leading-relaxed">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F7F9FC] rounded-[12px] p-4">
            <div className="text-[11px] font-bold text-[#10213B]">Security note</div>
            <p className="text-[10.5px] text-[#667085] mt-1 leading-relaxed">
              Spreadsheet formulas are treated as text and never executed during validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Step 1: Pre-Flight Inspection & Worksheet Selection (Figma Node 116:2)
 */
export const UploadPreflightPage: React.FC = () => {
  const {
    activePreflight,
    selectedWorksheetIndex,
    setSelectedWorksheetIndex,
    selectedHeaderRow,
    setSelectedHeaderRow,
  } = useAppState();
  const navigate = useNavigate();

  const currentSheet =
    activePreflight.worksheets[selectedWorksheetIndex] || activePreflight.worksheets[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            {CUSTOMER_UPLOAD_TEXT.step1Eyebrow}
          </span>
          <h1 className="text-[26px] font-bold text-[#10213B] mt-0.5">
            Pre-Flight Inspection &amp; Worksheet Selection
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/app/upload"
            className="h-[40px] px-4 rounded-[10px] border border-[#E4E9F1] bg-white text-xs font-semibold text-[#10213B] inline-flex items-center"
          >
            ← Change file
          </Link>
          <button
            type="button"
            disabled={activePreflight.preflightStatus === 'QUARANTINED_CRITICAL'}
            onClick={() => navigate('/app/upload/preview')}
            className="h-[40px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <span>Continue to Preview &amp; Mapping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preflight Gatekeeper Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-[14px] bg-white border border-[#E4E9F1] p-4 shadow-sm">
          <div className="text-[10px] text-[#667085] uppercase font-bold">File &amp; Size Check</div>
          <div className="text-sm font-bold text-[#10213B] truncate mt-1.5">
            {activePreflight.fileName}
          </div>
          <div className="text-xs text-[#667085] mt-1 font-mono">
            {(activePreflight.fileSizeBytes / 1024).toFixed(1)} KB / {activePreflight.planLimitMb}{' '}
            MB max
          </div>
        </div>

        <div className="rounded-[14px] bg-white border border-[#E4E9F1] p-4 shadow-sm">
          <div className="text-[10px] text-[#667085] uppercase font-bold">
            Magic Bytes Signature
          </div>
          <div className="text-sm font-mono font-bold text-[#2563EB] mt-1.5">
            {activePreflight.magicBytesHex}
          </div>
          <div className="text-xs text-[#16A36A] font-semibold mt-1">
            {activePreflight.magicBytesValid ? 'Verified Authentic Signature' : 'SPOOFED / INVALID'}
          </div>
        </div>

        <div className="rounded-[14px] bg-white border border-[#E4E9F1] p-4 shadow-sm">
          <div className="text-[10px] text-[#667085] uppercase font-bold">
            Encoding &amp; Delimiter
          </div>
          <div className="text-sm font-mono font-bold text-[#10213B] mt-1.5">
            {activePreflight.detectedEncoding} · {activePreflight.detectedDelimiter}
          </div>
          <div className="text-xs text-[#667085] mt-1">Zero Null-Byte Stream</div>
        </div>

        <div className="rounded-[14px] bg-white border border-[#E4E9F1] p-4 shadow-sm">
          <div className="text-[10px] text-[#667085] uppercase font-bold">
            Zip-Bomb Expansion Ratio
          </div>
          <div className="text-sm font-mono font-bold text-[#10213B] mt-1.5">
            {activePreflight.zipExpansionRatio.toFixed(1)} : 1
          </div>
          <div className="text-xs text-[#16A36A] font-semibold mt-1">
            Safe Ceiling (&lt;= 25.0 : 1)
          </div>
        </div>
      </div>

      {/* Preflight Notes */}
      <div className="rounded-[16px] bg-[#111F37] text-white p-5 border border-[#1B2D4B] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9CC0FF]">
            Gatekeeper Diagnostic Log
          </span>
          <span className="font-mono text-[11px] text-[#AEBBD0]">
            SHA-256: {activePreflight.sha256Mock.slice(0, 24)}...
          </span>
        </div>
        <ul className="space-y-1.5 text-xs font-mono text-[#D6DFEA]">
          {activePreflight.preflightNotes.map((note) => (
            <li key={note} className="flex items-start gap-2">
              <span className="text-[#86EFAC]">✓</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Worksheet & Header Row Picker */}
      <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">
              Select Target Worksheet &amp; Header Row Index
            </h2>
            <p className="text-xs text-[#667085]">
              For multi-tab XLSX workbooks, choose which worksheet to validate in this run.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-[#10213B]">Header Row Index:</label>
            <select
              value={selectedHeaderRow}
              onChange={(e) => setSelectedHeaderRow(Number(e.target.value))}
              className="rounded-[8px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-1.5 font-mono text-xs text-[#10213B]"
            >
              <option value={1}>Row 1 (Standard Header)</option>
              <option value={2}>Row 2 (Skip Title Banner)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePreflight.worksheets.map((ws, idx) => {
            const isSelected = idx === selectedWorksheetIndex;
            return (
              <button
                key={ws.name}
                type="button"
                onClick={() => setSelectedWorksheetIndex(idx)}
                className={`text-left rounded-[12px] p-4 border transition ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#F4F8FF] ring-2 ring-[#2563EB]/15'
                    : 'border-[#E4E9F1] hover:border-[#2563EB]/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#10213B]">{ws.name}</span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] font-bold">
                    {ws.rowCount} rows × {ws.columnCount} cols
                  </span>
                </div>
                <div className="mt-2 text-xs text-[#667085] font-mono truncate">
                  Columns: {ws.headers.join(', ')}
                </div>
              </button>
            );
          })}
        </div>

        {currentSheet && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/app/upload/preview')}
              className="h-[42px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-2"
            >
              <span>Inspect {currentSheet.name} Grid &amp; Map Columns</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 4. Step 2 & 3: Spreadsheet Preview & Column Mapping (Figma Node 116:120)
 */
export const SpreadsheetPreviewMappingPage: React.FC = () => {
  const {
    activePreflight,
    selectedWorksheetIndex,
    selectedProfileId,
    setSelectedProfileId,
    profiles,
    columnMapping,
    setColumnMapping,
    executeValidationJob,
  } = useAppState();
  const navigate = useNavigate();

  const worksheet =
    activePreflight.worksheets[selectedWorksheetIndex] || activePreflight.worksheets[0];
  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];
  const inferredCols = worksheet ? inferColumnsFromWorksheet(worksheet) : [];

  const requiredTargetFields = Array.from(new Set(profile.rules.map((r) => r.targetField)));

  const handleRunValidation = () => {
    const newJob = executeValidationJob();
    navigate(`/app/results/${newJob.id}`);
  };

  if (!worksheet) {
    return (
      <div className="p-8 text-center bg-white rounded-[16px] border border-[#E4E9F1]">
        No worksheet loaded.{' '}
        <Link to="/app/upload" className="text-[#2563EB] underline">
          Upload a file first
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            {CUSTOMER_UPLOAD_TEXT.steps23Eyebrow}
          </span>
          <h1 className="text-[26px] font-bold text-[#10213B] mt-0.5">
            Spreadsheet Preview &amp; Column Mapping
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/upload/preflight"
            className="h-[40px] px-4 rounded-[10px] border border-[#E4E9F1] bg-white text-xs font-semibold text-[#10213B] inline-flex items-center"
          >
            ← Back to Preflight
          </Link>
          <button
            type="button"
            onClick={handleRunValidation}
            className="h-[40px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4" />
            <span>Execute Validation Run ({worksheet.rowCount} Rows)</span>
          </button>
        </div>
      </div>

      {/* Target Validation Profile Selector & Column Mapping */}
      <div className="rounded-[16px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E9F1] pb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">
              Map Source Spreadsheet Columns to Target Profile Fields
            </h2>
            <p className="text-xs text-[#667085]">
              Fuzzy header matcher automatically bound {requiredTargetFields.length} target schema
              columns.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-[#10213B]">Target Profile:</label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2 font-medium text-[#10213B]"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (v{p.version})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requiredTargetFields.map((targetField) => {
            const mappedSource = columnMapping[targetField] || targetField;
            const colProfile = inferredCols.find((c) => c.header === mappedSource);
            return (
              <div
                key={targetField}
                className="rounded-[12px] border border-[#E4E9F1] p-3.5 bg-[#FBFCFE] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#10213B]">{targetField}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB]">
                    {colProfile?.inferredType || 'STRING'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#667085]">Source Header:</span>
                  <select
                    value={mappedSource}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [targetField]: e.target.value })
                    }
                    className="flex-1 rounded-[8px] border border-[#E4E9F1] bg-white px-2 py-1 font-mono text-xs text-[#10213B]"
                  >
                    {worksheet.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {colProfile?.hasFormulaPrefix && (
                  <div className="text-[11px] text-[#D84A4A] bg-[#FDECEC] rounded-[8px] px-2.5 py-1 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Contains formula prefix (= / @)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Client-Side Spreadsheet Preview Grid */}
      <div className="rounded-[16px] bg-white border border-[#E4E9F1] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E9F1] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-bold text-[#10213B]">
              Safe Literal Grid Preview:{' '}
              <span className="font-mono text-[#2563EB]">{worksheet.name}</span>
            </h2>
            <p className="text-xs text-[#667085]">
              All cells are rendered strictly as inert text. Cells beginning with{' '}
              <code className="font-mono">=</code>, <code className="font-mono">+</code>,{' '}
              <code className="font-mono">-</code>, or <code className="font-mono">@</code> are
              flagged before rule execution.
            </p>
          </div>
          <span className="text-xs font-mono text-[#667085]">
            Showing {worksheet.rows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-[#E4E9F1] text-[#667085]">
                <th className="py-2.5 px-3 w-12 text-center border-r border-[#E4E9F1]">#</th>
                {worksheet.headers.map((h) => (
                  <th key={h} className="py-2.5 px-3 border-r border-[#E4E9F1]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F1]">
              {worksheet.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F4F8FF]">
                  <td className="py-2 px-3 text-center text-[#667085] bg-[#FBFCFE] border-r border-[#E4E9F1]">
                    {idx + 1}
                  </td>
                  {worksheet.headers.map((h) => {
                    const val = row[h] ?? '';
                    const isFormula =
                      /^[=+\-@\t\r]/.test(val) && !/^-?\d+(\.\d+)?$/.test(val);
                    const isEmpty = val.trim() === '';
                    return (
                      <td
                        key={h}
                        className={`py-2 px-3 border-r border-[#E4E9F1]/60 ${
                          isFormula
                            ? 'bg-[#FDECEC] text-[#D84A4A] font-bold'
                            : isEmpty
                            ? 'bg-[#FFF4DE]/60 text-[#D99121] italic'
                            : 'text-[#10213B]'
                        }`}
                      >
                        {isEmpty ? '(empty)' : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * 5. Validation Profiles Catalog (Figma Nodes 115:2 & 136:339 Repaired Unclipped Cards)
 */
export const ValidationProfilesPage: React.FC = () => {
  const { profiles, downgradeGraceActive, setSelectedProfileId } = useAppState();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#10213B]">Validation profiles</h1>
          <p className="text-[13px] text-[#667085] mt-1">
            {CUSTOMER_PROFILES_RULES_TEXT.profilesSubtitle}
          </p>
        </div>

        <Link
          to="/app/profiles/builder"
          className="h-[44px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition"
        >
          <Sliders className="w-4 h-4" />
          <span>Create / Edit Rules in Sandbox</span>
        </Link>
      </div>

      {downgradeGraceActive && (
        <div className="rounded-[14px] bg-[#FFF4DE] border border-[#F59E0B]/40 p-4 text-xs text-[#92400E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#D99121] shrink-0" />
            <span>{CUSTOMER_PROFILES_RULES_TEXT.downgradeBanner}</span>
          </div>
          <Link to="/app/billing" className="font-bold text-[#2563EB] hover:underline shrink-0">
            Manage Plan →
          </Link>
        </div>
      )}

      {/* Profile Cards — Repaired Unclipped Layout per Node 136:339 */}
      <div className="grid grid-cols-1 gap-4">
        {profiles.map((prof, index) => {
          const isLocked = downgradeGraceActive && index > 0;
          const critCount = prof.rules.filter((r) => r.severity === 'CRITICAL').length;
          const warnCount = prof.rules.filter((r) => r.severity === 'WARNING').length;

          return (
            <div
              key={prof.id}
              className="rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB]">
                    v{prof.version}.0
                  </span>
                  <h2 className="text-[17px] font-bold text-[#10213B]">{prof.name}</h2>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F2F4F7] text-[#667085] font-semibold">
                    {prof.targetDomain}
                  </span>
                  {isLocked && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF4DE] text-[#D99121] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Read-Only (Downgrade Grace)
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#667085] leading-relaxed">{prof.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] pt-1">
                  <span className="px-2.5 py-1 rounded-[8px] bg-[#FDECEC] text-[#D84A4A] font-bold text-[11px]">
                    {critCount} Critical Blocking Rules
                  </span>
                  <span className="px-2.5 py-1 rounded-[8px] bg-[#FFF4DE] text-[#D99121] font-bold text-[11px]">
                    {warnCount} Non-Blocking Warnings
                  </span>
                  <span>Maintainer: {prof.author}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileId(prof.id);
                    navigate('/app/profiles/builder');
                  }}
                  className="h-[40px] px-4 rounded-[10px] border border-[#E4E9F1] hover:border-[#2563EB] text-xs font-semibold text-[#10213B] transition"
                >
                  {isLocked ? 'Inspect Read-Only Rules' : 'Edit Rules & Sandbox'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileId(prof.id);
                    navigate('/app/upload/preview');
                  }}
                  className="h-[40px] px-4 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
                >
                  Run check →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 6. Interactive Rule Builder & 5-Row Live Sandbox (Figma Node 115:127)
 */
export const RuleBuilderSandboxPage: React.FC = () => {
  const {
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    addOrUpdateRule,
    toggleRuleEnabled,
  } = useAppState();

  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const [newTargetField, setNewTargetField] = useState('department');
  const [newRuleLabel, setNewRuleLabel] = useState('Department Required');
  const [newRuleType, setNewRuleType] = useState<RuleType>('REQUIRED');
  const [newSeverity, setNewSeverity] = useState<RuleSeverity>('CRITICAL');
  const [newPattern, setNewPattern] = useState('^[A-Za-z]+$');
  const [newErrorMsg, setNewErrorMsg] = useState('Field failed custom validation rule.');

  const [sandboxRows, setSandboxRows] = useState<Record<string, string>[]>([
    {
      employee_id: 'EMP-101',
      work_email: 'ava.santos@acme-corp.com',
      department: 'Engineering',
      tax_id_tin: '123-456-789',
      gross_pay_usd: '8500.00',
    },
    {
      employee_id: 'EMP-101',
      work_email: 'bad-email-syntax',
      department: 'Finance',
      tax_id_tin: '99-INVALID',
      gross_pay_usd: '-120.00',
    },
    {
      employee_id: 'EMP-103',
      work_email: 'liam@acme-corp.com',
      department: 'ExperimentalUnit',
      tax_id_tin: '',
      gross_pay_usd: "=CMD|' /C calc.exe'!A0",
    },
    {
      employee_id: 'EMP-104',
      work_email: 'mia@acme-corp.com',
      department: 'Operations',
      tax_id_tin: '456-789-012',
      gross_pay_usd: '6400.00',
    },
    {
      employee_id: 'EMP-105',
      work_email: 'noah@acme-corp.com',
      department: 'HR',
      tax_id_tin: '789-012-345',
      gross_pay_usd: '7100.00',
    },
  ]);

  const sandboxEvaluation = evaluateRowsWithProfile(sandboxRows, profile.rules);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule: ValidationRule = {
      id: `rule-custom-${Date.now()}`,
      targetField: newTargetField,
      label: newRuleLabel,
      ruleType: newRuleType,
      severity: newSeverity,
      blocksProcessing: newSeverity === 'CRITICAL',
      enabled: true,
      parameters:
        newRuleType === 'REGEX'
          ? { pattern: newPattern }
          : newRuleType === 'DATA_TYPE'
          ? { dataType: 'EMAIL' }
          : {},
      errorMessage: newErrorMsg,
    };
    addOrUpdateRule(profile.id, rule);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
            {CUSTOMER_PROFILES_RULES_TEXT.ruleBuilderEyebrow}
          </span>
          <h1 className="text-[26px] font-bold text-[#10213B] mt-0.5">
            Rule Builder, Version Diff &amp; 5-Row Live Sandbox
          </h1>
        </div>

        <select
          value={profile.id}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="h-[42px] rounded-[10px] border border-[#E4E9F1] bg-white px-4 text-xs font-semibold text-[#10213B]"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (v{p.version})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Rules + Add Rule Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#10213B]">
                Active Rules in {profile.name} (v{profile.version})
              </h2>
              <span className="text-xs font-mono text-[#667085]">
                {profile.rules.filter((r) => r.enabled).length} of {profile.rules.length} enabled
              </span>
            </div>

            <div className="space-y-2.5">
              {profile.rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`rounded-[12px] border p-3.5 flex items-start justify-between gap-3 ${
                    rule.enabled
                      ? 'border-[#E4E9F1] bg-white'
                      : 'border-[#E4E9F1] bg-[#F5F7FB] opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {rule.targetField}
                      </span>
                      <span className="text-xs font-bold text-[#10213B]">{rule.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          rule.severity === 'CRITICAL'
                            ? 'bg-[#FDECEC] text-[#D84A4A]'
                            : 'bg-[#FFF4DE] text-[#D99121]'
                        }`}
                      >
                        {rule.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2F4F7] text-[#667085]">
                        {rule.ruleType}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085]">{rule.errorMessage}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRuleEnabled(profile.id, rule.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      rule.enabled
                        ? 'bg-[#E8F7EF] text-[#16A36A]'
                        : 'bg-[#F2F4F7] text-[#667085]'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Rule Form */}
          <form
            onSubmit={handleAddRule}
            className="rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-4"
          >
            <h3 className="text-[15px] font-bold text-[#10213B] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Add New Validation Rule (Publishes v{profile.version + 1})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#10213B] mb-1">Target Column</label>
                <select
                  value={newTargetField}
                  onChange={(e) => setNewTargetField(e.target.value)}
                  className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2 font-mono"
                >
                  <option value="employee_id">employee_id</option>
                  <option value="work_email">work_email</option>
                  <option value="department">department</option>
                  <option value="tax_id_tin">tax_id_tin</option>
                  <option value="gross_pay_usd">gross_pay_usd</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#10213B] mb-1">Rule Type</label>
                <select
                  value={newRuleType}
                  onChange={(e) => setNewRuleType(e.target.value as RuleType)}
                  className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2"
                >
                  <option value="REQUIRED">REQUIRED (Non-Empty)</option>
                  <option value="REGEX">REGEX Pattern</option>
                  <option value="UNIQUE">UNIQUE (No Duplicates)</option>
                  <option value="DATA_TYPE">DATA_TYPE (Email)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#10213B] mb-1">
                  Severity &amp; Impact
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as RuleSeverity)}
                  className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2"
                >
                  <option value="CRITICAL">Critical Error (Blocks Job)</option>
                  <option value="WARNING">Warning (Review Only)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#10213B] mb-1">Rule Label</label>
                <input
                  type="text"
                  value={newRuleLabel}
                  onChange={(e) => setNewRuleLabel(e.target.value)}
                  className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2"
                  required
                />
              </div>
              {newRuleType === 'REGEX' && (
                <div>
                  <label className="block font-semibold text-[#10213B] mb-1">Regex Pattern</label>
                  <input
                    type="text"
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-[#10213B] mb-1">
                Custom Error Message
              </label>
              <input
                type="text"
                value={newErrorMsg}
                onChange={(e) => setNewErrorMsg(e.target.value)}
                className="w-full rounded-[10px] border border-[#E4E9F1] bg-[#F9FAFC] px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              className="h-[40px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
            >
              Publish Rule to v{profile.version + 1}
            </button>
          </form>
        </div>

        {/* Right 5 Cols: 5-Row Live Sandbox Evaluator & Version History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[18px] bg-[#111F37] text-white p-6 border border-[#1B2D4B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#9CC0FF] uppercase tracking-wider">
                  LIVE SANDBOX TEST BENCH
                </span>
                <h2 className="text-[16px] font-bold text-white mt-0.5">
                  5-Row Live Rule Sandbox
                </h2>
              </div>
              <GradeBadge grade={sandboxEvaluation.summary.validationGrade} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-[12px] bg-[#1B2D4B] border border-[#273E63] p-3.5">
                <div className="text-[#AFC0D8] text-[11px]">Sandbox Quality Score</div>
                <div className="text-xl font-mono font-bold text-white mt-1">
                  {sandboxEvaluation.summary.dataQualityScore?.toFixed(2)}%
                </div>
              </div>
              <div className="rounded-[12px] bg-[#1B2D4B] border border-[#273E63] p-3.5">
                <div className="text-[#AFC0D8] text-[11px] mb-1">Eligibility</div>
                <EligibilityBadge eligibility={sandboxEvaluation.summary.processingEligibility} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-medium text-[#C6D4E9]">
                Edit any cell below to watch DQS and rule violations update in real time:
              </div>
              <div className="overflow-x-auto rounded-[12px] border border-[#273E63]">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="bg-[#1B2D4B] text-[#9CC0FF] border-b border-[#273E63]">
                      <th className="p-2">Row</th>
                      <th className="p-2">employee_id</th>
                      <th className="p-2">work_email</th>
                      <th className="p-2">gross_pay_usd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#273E63]">
                    {sandboxRows.map((r, rIdx) => (
                      <tr key={rIdx} className="bg-[#0D182B]">
                        <td className="p-2 text-[#8FA0B9]">#{rIdx + 1}</td>
                        {(['employee_id', 'work_email', 'gross_pay_usd'] as const).map((col) => (
                          <td key={col} className="p-1">
                            <input
                              type="text"
                              value={r[col] ?? ''}
                              onChange={(e) => {
                                const copy = [...sandboxRows];
                                copy[rIdx] = { ...copy[rIdx], [col]: e.target.value };
                                setSandboxRows(copy);
                              }}
                              className="w-full bg-[#1B2D4B] border border-[#304766] rounded px-2 py-1 text-white focus:border-[#2563EB] focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-[#C6D4E9]">
                Triggered Sandbox Issues ({sandboxEvaluation.issues.length}):
              </div>
              {sandboxEvaluation.issues.map((iss) => (
                <div
                  key={iss.id}
                  className="rounded-[10px] bg-[#1B2D4B] border border-[#273E63] p-2.5 text-[11px] flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-mono font-bold text-[#FCA5A5]">
                      Row {iss.rowNumber} · {iss.columnName}:
                    </span>{' '}
                    <span className="text-white">{iss.message}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#D84A4A]/20 text-[#FCA5A5] shrink-0">
                    {iss.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Version History Diff */}
          <div className="rounded-[18px] bg-white border border-[#E4E9F1] p-6 shadow-sm space-y-3">
            <h3 className="text-[15px] font-bold text-[#10213B]">
              Profile Version Changelog (v1 → v{profile.version})
            </h3>
            <div className="space-y-2.5 text-xs">
              {profile.versionHistory.map((vh) => (
                <div key={vh.version} className="border-l-2 border-[#2563EB] pl-3 py-0.5">
                  <div className="flex items-center justify-between font-bold text-[#10213B]">
                    <span>Version {vh.version}.0</span>
                    <span className="font-mono text-[11px] text-[#667085]">{vh.publishedAt}</span>
                  </div>
                  <p className="text-[#667085] mt-0.5">{vh.changelog}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  BrandLogo,
  EligibilityBadge,
  GradeBadge,
  ProvisionalConfigSwitcher,
} from '../components/SharedUI';
import { useAppState } from '../context/AppStateContext';
import {
  FLOWS_TEXT,
  FOUNDATIONS_TEXT,
  SURFACE_CATALOG_ROWS,
} from '../content/flowsText';
import { formatPlanPrice, getPlansByMode } from '../config/productConfig';

/**
 * 00 FOUNDATIONS PAGE (Design System Surface Showcase)
 * Derived from 01 Public Website visual tokens — crisp spacing, unclipped type ramp,
 * solid card elevation, and surface directory.
 */
export const FoundationsPage: React.FC = () => {
  const [sampleInput, setSampleInput] = useState('employee_tax_id');
  const [checkedBox, setCheckedBox] = useState(true);
  const [activeToggle, setActiveToggle] = useState(true);

  const colorSwatches = [
    { name: 'Ink', hex: '#10213B', bg: 'bg-[#10213B]', text: 'text-white', role: 'Primary headings, dark sidebar' },
    { name: 'Primary', hex: '#2563EB', bg: 'bg-[#2563EB]', text: 'text-white', role: 'Primary CTAs, active indicators' },
    { name: 'Primary soft', hex: '#EAF2FF', bg: 'bg-[#EAF2FF] border border-[#C9DCFF]', text: 'text-[#2563EB]', role: 'Eyebrow pills, active row highlights' },
    { name: 'Canvas', hex: '#F6F8FC', bg: 'bg-[#F6F8FC] border border-[#D5DFEE]', text: 'text-[#10213B]', role: 'App workspace background surface' },
    { name: 'Success', hex: '#16A36A', bg: 'bg-[#16A36A]', text: 'text-white', role: 'Passed checks, Healthy DQS badge' },
    { name: 'Warning', hex: '#D99121', bg: 'bg-[#D99121]', text: 'text-white', role: 'Needs review, format anomalies' },
    { name: 'Danger', hex: '#D84A4A', bg: 'bg-[#D84A4A]', text: 'text-white', role: 'Critical blocking errors, failed jobs' },
    { name: 'Info', hex: '#3478E5', bg: 'bg-[#3478E5]', text: 'text-white', role: 'Processing state, system telemetry' },
  ];

  return (
    <div className="ss-surface-flows min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[80px] space-y-12">
        <div className="ss-flows-card rounded-[22px] p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{FOUNDATIONS_TEXT.eyebrow}</span>
              </div>
              <h1 className="text-[34px] sm:text-[42px] font-bold text-[#10213B] leading-tight">
                {FOUNDATIONS_TEXT.heading}
              </h1>
              <p className="text-[15px] text-[#667085] max-w-2xl">
                {FOUNDATIONS_TEXT.subheading}
              </p>
            </div>
            <div className="bg-[#F6F8FC] border border-[#E4E9F1] rounded-[16px] px-5 py-4">
              <BrandLogo size={36} subtitle="SPREADSHEET DATA GUARD" />
            </div>
          </div>
        </div>

        {/* Separated Design Surface Directory */}
        <div className="ss-flows-card rounded-[22px] p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                <Layers className="w-3.5 h-3.5" />
                <span>PUBLIC-DERIVED DESIGN SYSTEM ARCHITECTURE</span>
              </div>
              <h2 className="text-[22px] font-bold text-[#10213B] mt-1">
                {FOUNDATIONS_TEXT.directoryTitle}
              </h2>
              <p className="text-[13px] text-[#667085] mt-0.5">
                {FOUNDATIONS_TEXT.directorySubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-[10px] bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition"
              >
                01 Public Website →
              </Link>
              <Link
                to="/app/dashboard"
                className="px-4 py-2 rounded-[10px] bg-[#10213B] text-white text-xs font-semibold hover:bg-[#1B3156] transition"
              >
                02 Customer App →
              </Link>
              <Link
                to="/admin/overview"
                className="px-4 py-2 rounded-[10px] bg-[#F6F8FC] border border-[#D5DFEE] text-[#10213B] text-xs font-semibold hover:border-[#2563EB] transition"
              >
                03 Admin Console →
              </Link>
              <Link
                to="/flows"
                className="px-4 py-2 rounded-[10px] bg-[#EAF2FF] text-[#2563EB] text-xs font-semibold hover:bg-[#DCE8FF] transition"
              >
                04 System Flows →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4E9F1] text-[10px] font-bold uppercase tracking-wider text-[#667085] bg-[#F8FAFC]">
                  <th className="py-3 px-4">Surface</th>
                  <th className="py-3 px-4">Design Tokens</th>
                  <th className="py-3 px-4">Covered Views</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Explore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9F1] text-xs">
                {SURFACE_CATALOG_ROWS.map((item) => (
                  <tr key={item.route} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 font-bold text-[#10213B] whitespace-nowrap">
                      {item.badge}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#667085]">
                      {item.tokensSummary}
                    </td>
                    <td className="py-3.5 px-4 text-[#10213B] max-w-md">{item.scope}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8F7EF] text-[#16A36A] font-semibold text-[10px]">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={item.route}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-[#EAF2FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-semibold text-[11px] transition"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 01 / Color Palette (Node 3:4) */}
        <div className="bg-white border border-[#E4E9F1] rounded-[22px] p-8 shadow-sm space-y-6">
          <h2 className="text-[20px] font-bold text-[#10213B]">01 / Color palette</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {colorSwatches.map((swatch) => (
              <div key={swatch.name} className="space-y-2.5">
                <div
                  className={`h-[76px] rounded-[14px] ${swatch.bg} ${swatch.text} p-4 flex items-end justify-between shadow-xs`}
                >
                  <span className="text-[11px] font-mono font-semibold opacity-90">
                    {swatch.hex}
                  </span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#10213B]">{swatch.name}</div>
                  <div className="text-[11px] font-mono text-[#667085]">{swatch.hex}</div>
                  <div className="text-[11px] text-[#667085] mt-0.5">{swatch.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 02 / Typography Scale (Nodes 3:4 & 128:2 — Unclipped!) */}
        <div className="bg-white border border-[#E4E9F1] rounded-[22px] p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[20px] font-bold text-[#10213B]">
              02 / Typography & Scale Specification
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#E8F7EF] text-[#16A36A] text-[11px] font-bold">
              WCAG 2.1 AAA Contrast Verified · Zero Text Clipping
            </span>
          </div>

          <div className="space-y-5 divide-y divide-[#E4E9F1]">
            <div className="pt-2">
              <div className="text-[11px] font-mono text-[#2563EB] mb-1">
                Display Marketing · DM Sans Bold · 44px / 52px line-height
              </div>
              <div className="text-[32px] sm:text-[42px] font-bold text-[#10213B] leading-tight">
                The data is ready. The decision is clear.
              </div>
            </div>

            <div className="pt-4">
              <div className="text-[11px] font-mono text-[#2563EB] mb-1">
                Display App Hero · DM Sans Bold · 28px / 36px line-height
              </div>
              <div className="text-[24px] sm:text-[28px] font-bold text-[#10213B] leading-snug">
                Make every spreadsheet dependable.
              </div>
            </div>

            <div className="pt-4">
              <div className="text-[11px] font-mono text-[#2563EB] mb-1">
                Heading 1 — Page Titles · 20px / 28px line-height · Bold
              </div>
              <div className="text-[20px] font-bold text-[#10213B]">
                Workspace Validation Profiles & Schema Rules
              </div>
            </div>

            <div className="pt-4">
              <div className="text-[11px] font-mono text-[#2563EB] mb-1">
                Body Regular — Default UI & Paragraphs · Inter 14px / 22px line-height
              </div>
              <p className="text-[14px] text-[#667085] max-w-3xl">
                SheetSentry checks recurring CSV and Excel files against reusable rules, then points
                users directly to the records that need attention without modifying the original
                source file.
              </p>
            </div>

            <div className="pt-4">
              <div className="text-[11px] font-mono text-[#2563EB] mb-1">
                Monospace — Keys, IDs, Formulas & Magic Bytes · JetBrains Mono 12px
              </div>
              <div className="font-mono text-[12px] bg-[#F6F8FC] border border-[#E4E9F1] rounded-[10px] px-4 py-2.5 text-[#10213B] inline-block">
                SHA-256: 9f86d081884c7d659a2feaa0c55ad015 · Magic: 50 4B 03 04 (PK-Zip XLSX) ·
                Pattern: ^INV-\d&#123;6&#125;$
              </div>
            </div>
          </div>
        </div>

        {/* 03 / Core Components & Interactive States (Nodes 3:4 & 128:2 Repaired) */}
        <div className="bg-white border border-[#E4E9F1] rounded-[22px] p-8 shadow-sm space-y-8">
          <h2 className="text-[20px] font-bold text-[#10213B]">
            03 / Core components & interactive states
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Buttons Column — Repaired from blank 3:4 */}
            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                {FOUNDATIONS_TEXT.buttonsSectionTitle}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="h-[42px] px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition"
                >
                  Validate file
                </button>
                <button
                  type="button"
                  className="h-[42px] px-5 rounded-[10px] bg-white border border-[#D5DFEE] hover:border-[#2563EB] text-[#10213B] text-xs font-semibold transition"
                >
                  Secondary outline
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="h-[38px] px-4 rounded-[10px] bg-[#EAF2FF] text-[#2563EB] text-xs font-semibold"
                >
                  ⏳ Parsing workbook...
                </button>
                <button
                  type="button"
                  className="h-[38px] px-4 rounded-[10px] bg-[#D84A4A] hover:bg-[#B93838] text-white text-xs font-semibold transition"
                >
                  Delete profile
                </button>
                <button
                  type="button"
                  disabled
                  className="h-[38px] px-4 rounded-[10px] bg-[#E4E9F1] text-[#667085] text-xs font-semibold cursor-not-allowed"
                >
                  Disabled state
                </button>
              </div>
            </div>

            {/* Status Badges Column */}
            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                STATUS, GRADE & ELIGIBILITY BADGES
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <span className="h-[34px] rounded-full bg-[#E8F7EF] text-[#16A36A] text-xs font-bold inline-flex items-center justify-center">
                  Passed
                </span>
                <span className="h-[34px] rounded-full bg-[#FFF4DE] text-[#D99121] text-xs font-bold inline-flex items-center justify-center">
                  Needs review
                </span>
                <span className="h-[34px] rounded-full bg-[#FDECEC] text-[#D84A4A] text-xs font-bold inline-flex items-center justify-center">
                  Failed
                </span>
                <span className="h-[34px] rounded-full bg-[#EAF2FF] text-[#2563EB] text-xs font-bold inline-flex items-center justify-center">
                  Processing
                </span>
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <GradeBadge grade="A" />
                <GradeBadge grade="B" />
                <GradeBadge grade="FAIL" />
                <EligibilityBadge eligibility="ELIGIBLE" />
                <EligibilityBadge eligibility="BLOCKED_CRITICAL" />
              </div>
            </div>

            {/* Surfaces & Form Controls Column */}
            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                SURFACES & FORM CONTROLS
              </div>
              <div className="bg-white border border-[#E4E9F1] rounded-[14px] p-4 shadow-2xs">
                <div className="text-[14px] font-bold text-[#10213B]">Validation profile</div>
                <div className="text-[12px] text-[#667085] mt-1">
                  Monthly sales · 8 required columns · 5 rules
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase text-[#2563EB]">
                  Focus / Active Input State (2px Blue Ring)
                </label>
                <input
                  type="text"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[8px] bg-white border-2 border-[#2563EB] text-xs font-mono text-[#10213B] outline-none"
                />
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedBox}
                    onChange={(e) => setCheckedBox(e.target.checked)}
                    className="rounded border-[#D5DFEE] text-[#2563EB]"
                  />
                  <span className="font-medium text-[#10213B]">Auto-trim whitespace</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveToggle(!activeToggle)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                    activeToggle
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#E4E9F1] text-[#667085]'
                  }`}
                >
                  {activeToggle ? 'Strict Mode: ON' : 'Strict Mode: OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 04 / Layout Principles (Node 3:4) */}
        <div className="bg-white border border-[#E4E9F1] rounded-[22px] p-8 shadow-sm">
          <h2 className="text-[20px] font-bold text-[#10213B]">04 / Layout principles</h2>
          <p className="text-[14px] text-[#667085] mt-2">
            12-column desktop grid (`1440px` container) · `238px` persistent dark navy sidebar in
            Customer (`#111F37`) and Admin (`#101C32`) portals · `24px` app content gutters · `8px`
            spacing scale · `12–22px` card radii · restrained shadows · clear keyboard focus states
            · table-first layouts for data review.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 04 USER & ADMIN FLOWS, ARCHITECTURE, 42-TABLE ERD & 28-ROUTE API CATALOG
 * (Figma Page 2:4 — Nodes 23:2, 122:2, 122:191, 122:358, 136:1565, 136:1683, 136:1843, 138:2)
 * Fixes:
 * - Node 122:191: Un-garbles Module 7 Admin & RBAC table rows that were stacked on top of each other.
 */
export const FlowsAndArchitecturePage: React.FC = () => {
  const { configMode, setConfigMode, currency, setCurrency } = useAppState();
  const plans = getPlansByMode(configMode);

  const erdDomains = [
    {
      module: 'MODULE 1: IDENTITY & WORKSPACES (7 Tables)',
      badge: 'bg-[#EAF2FF] text-[#2563EB]',
      tables: [
        { name: 'users', cols: 'id (PK), email (UQ), password_hash (Argon2id), status, email_verified_at, created_at' },
        { name: 'workspaces', cols: 'id (PK), name, slug (UQ), owner_user_id (FK), active_plan_id (FK), created_at' },
        { name: 'workspace_members', cols: 'id (PK), workspace_id (FK), user_id (FK), role (OWNER|ADMIN|EDITOR|VIEWER), joined_at' },
        { name: 'workspace_invitations', cols: 'id (PK), workspace_id (FK), email, token_hash (UQ), role, expires_at' },
        { name: 'user_sessions', cols: 'id (PK), user_id (FK), token_hash, ip_address, user_agent, revoked_at, expires_at' },
        { name: 'user_mfa_factors', cols: 'id (PK), user_id (FK), factor_type (TOTP|WEBAUTHN), secret_enc, recovery_codes_hash' },
        { name: 'oauth_identities', cols: 'id (PK), user_id (FK), provider (GOOGLE), provider_subject_id (UQ), linked_at' },
      ],
    },
    {
      module: 'MODULE 2: VALIDATION PROFILES & IMMUTABLE RULES (6 Tables)',
      badge: 'bg-[#E8F7EF] text-[#16A36A]',
      tables: [
        { name: 'validation_profiles', cols: 'id (PK), workspace_id (FK), name, slug, current_version_id (FK), is_archived' },
        { name: 'profile_versions', cols: 'id (PK), profile_id (FK), semver (v1.2.0), is_immutable (1), published_by (FK), created_at' },
        { name: 'profile_columns', cols: 'id (PK), profile_version_id (FK), target_key, data_type, is_required, is_unique' },
        { name: 'validation_rules', cols: 'id (PK), profile_version_id (FK), rule_type, target_column, severity (CRITICAL|WARNING), config_json' },
        { name: 'cross_column_rules', cols: 'id (PK), profile_version_id (FK), condition_expr, target_column, error_template' },
        { name: 'profile_diff_snapshots', cols: 'id (PK), profile_id (FK), from_version_id (FK), to_version_id (FK), diff_payload_json' },
      ],
    },
    {
      module: 'MODULE 3: UPLOAD INGESTION & PRE-FLIGHT SAFETY (6 Tables)',
      badge: 'bg-[#F3E8FF] text-[#7E22CE]',
      tables: [
        { name: 'uploaded_files', cols: 'id (PK), workspace_id (FK), uploaded_by (FK), original_filename, size_bytes, sha256_hash' },
        { name: 'file_preflight_scans', cols: 'id (PK), file_id (FK), magic_bytes_hex, clamav_status, compression_ratio, formula_cells_neutralized' },
        { name: 'workbook_sheets', cols: 'id (PK), file_id (FK), sheet_index, sheet_name, detected_row_count, detected_col_count' },
        { name: 'sheet_header_samples', cols: 'id (PK), sheet_id (FK), header_row_index, sample_rows_json (first 20 rows sanitized)' },
        { name: 'column_mappings', cols: 'id (PK), job_id (FK), source_header, target_schema_key, confidence_pct, inferred_type' },
        { name: 'quarantined_blobs', cols: 'id (PK), file_id (FK), rejection_code (ZIP_BOMB|ENCRYPTED|SIGNATURE_MISMATCH), isolated_at' },
      ],
    },
    {
      module: 'MODULE 4: ASYNC JOBS, DQS & ROW ISSUES (6 Tables)',
      badge: 'bg-[#FFF4DE] text-[#D99121]',
      tables: [
        { name: 'validation_jobs', cols: 'id (PK), workspace_id (FK), file_id (FK), profile_version_id (FK), status, eligibility_state' },
        { name: 'job_execution_attempts', cols: 'id (PK), job_id (FK), attempt_no, worker_node_id, duration_ms, error_code' },
        { name: 'data_quality_scores', cols: 'job_id (PK,FK), dqs_score (DECIMAL 5,2), grade (A|B|C|D|F), critical_count, warning_count' },
        { name: 'validation_issue_groups', cols: 'id (PK), job_id (FK), rule_id (FK), column_name, severity, affected_row_count' },
        { name: 'validation_row_issues', cols: 'id (PK), job_id (FK), row_number, column_name, sanitized_value, message, suggestion' },
        { name: 'dead_letter_queue_jobs', cols: 'id (PK), job_id (FK), failure_reason, payload_snapshot_json, replayed_by_admin_id (FK)' },
      ],
    },
    {
      module: 'MODULE 5: REPORTS, EXPORTS & RETENTION PURGE (4 Tables)',
      badge: 'bg-[#FCE7F3] text-[#BE185D]',
      tables: [
        { name: 'validation_reports', cols: 'id (PK), job_id (FK), workspace_id (FK), report_type (SUMMARY_PDF|ERROR_CSV|CLEAN_CSV), blob_key' },
        { name: 'report_download_tokens', cols: 'id (PK), report_id (FK), issued_to_user_id (FK), sas_signature_hash, expires_at' },
        { name: 'retention_purge_schedules', cols: 'id (PK), workspace_id (FK), file_id (FK), plan_retention_days, purge_due_at, purged_at' },
        { name: 'storage_purge_certificates', cols: 'id (PK), file_id (FK), sha256_erasure_proof, executed_by_job, verified_at' },
      ],
    },
    {
      module: 'MODULE 6: MULTI-CURRENCY BILLING & LEDGERS (6 Tables)',
      badge: 'bg-[#E0F2FE] text-[#0369A1]',
      tables: [
        { name: 'subscription_plans', cols: 'id (PK), code (FREE|STARTER|PRO), price_usd_cents, price_php_centavos, monthly_checks_limit, max_file_mb' },
        { name: 'workspace_subscriptions', cols: 'id (PK), workspace_id (FK,UQ), plan_id (FK), gateway (LEMON_SQUEEZY|PAYMONGO), status, period_end' },
        { name: 'usage_quota_counters', cols: 'id (PK), workspace_id (FK), billing_month (YYYY-MM), checks_used, checks_limit, storage_bytes_used' },
        { name: 'payment_transactions', cols: 'id (PK), workspace_id (FK), gateway_tx_id (UQ), currency (USD|PHP), raw_amount_minor, status, settled_at' },
        { name: 'payment_refunds', cols: 'id (PK), transaction_id (FK), currency (USD|PHP), refund_amount_minor, reason, approved_by_admin_id (FK)' },
        { name: 'webhook_idempotency_keys', cols: 'id (PK), provider, event_id (UQ), hmac_verified (1), processed_at, payload_hash' },
      ],
    },
    {
      module: 'MODULE 7: ADMIN GOVERNANCE, 6-ROLE RBAC & AUDIT LOGS (7 Tables)',
      badge: 'bg-[#FDECEC] text-[#D84A4A]',
      tables: [
        { name: 'admin_roles', cols: 'id (PK), code (SUPER_ADMIN|SUPPORT_ADMIN|BILLING_ADMIN|OPS_ADMIN|SECURITY_ADMIN|AUDITOR_RO), requires_mfa (1)' },
        { name: 'admin_permissions', cols: 'id (PK), role_id (FK), module_key, can_read, can_write, can_approve_refund, requires_ticket_ref' },
        { name: 'admin_role_assignments', cols: 'id (PK), user_id (FK), role_id (FK), granted_by_user_id (FK), hardware_key_verified_at' },
        { name: 'sensitive_access_audit_logs', cols: 'id (PK), admin_user_id (FK), target_workspace_id (FK), support_ticket_ref, reason, prev_hash, entry_hash' },
        { name: 'immutable_audit_trail', cols: 'id (PK), actor_id (FK), event_category, action_name, ip_address, metadata_json, created_at' },
        { name: 'system_settings_versions', cols: 'id (PK), version_no, config_payload_json, proposed_by (FK), approved_by (FK), applied_at' },
        { name: 'maintenance_windows', cols: 'id (PK), title, starts_at, ends_at, pause_queue_workers, created_by_admin_id (FK)' },
      ],
    },
  ];

  const apiRouteGroups = [
    {
      domain: 'Customer Authentication & Workspace Tenancy (Routes 01–09)',
      routes: [
        { method: 'POST', path: '/api/v1/auth/register', desc: 'Create account & dispatch 6-digit email verification OTP' },
        { method: 'POST', path: '/api/v1/auth/login', desc: 'Argon2id credential verification + optional TOTP step-up' },
        { method: 'POST', path: '/api/v1/auth/refresh', desc: 'Rotate short-lived JWT access token & HTTP-only cookie' },
        { method: 'GET', path: '/api/v1/users/me', desc: 'Fetch authenticated profile, locale & MFA status' },
        { method: 'POST', path: '/api/v1/users/me/export-gdpr', desc: 'Generate GDPR Art. 20 machine-readable JSON/ZIP archive' },
        { method: 'GET', path: '/api/v1/workspaces/:id', desc: 'Fetch tenant workspace metadata, plan quotas & storage usage' },
        { method: 'GET', path: '/api/v1/workspaces/:id/members', desc: 'List workspace members & RBAC roles (Owner/Admin/Editor/Viewer)' },
      ],
    },
    {
      domain: 'Validation Engine, Safe Preflight & Reports (Routes 10–19)',
      routes: [
        { method: 'POST', path: '/api/v1/uploads/preflight', desc: 'Verify magic bytes, compression ratio (<100:1) & neutralize formulas' },
        { method: 'GET', path: '/api/v1/files/:id/preview', desc: 'Sample first 20 rows in-memory & detect column header row' },
        { method: 'GET', path: '/api/v1/validation-profiles', desc: 'List workspace validation profiles & immutable semver history' },
        { method: 'POST', path: '/api/v1/validation-profiles/:id/publish', desc: 'Publish new immutable profile version (e.g. v1.3.0)' },
        { method: 'POST', path: '/api/v1/validation-jobs', desc: 'Enqueue validation job & compute decoupled DQS + Eligibility' },
        { method: 'GET', path: '/api/v1/validation-jobs/:id/issues', desc: 'Paginated cell-level issues filtered by severity or column' },
        { method: 'POST', path: '/api/v1/reports/:jobId/export', desc: 'Generate signed download for Sanitized CSV or Audit PDF' },
      ],
    },
    {
      domain: 'Multi-Currency Billing & Privileged Admin Console (Routes 20–28)',
      routes: [
        { method: 'POST', path: '/api/v1/billing/checkout', desc: 'Create Lemon Squeezy (USD) or PayMongo (PHP) checkout session' },
        { method: 'POST', path: '/api/v1/billing/webhooks', desc: 'HMAC-verified idempotent webhook ingestion for USD & PHP ledgers' },
        { method: 'GET', path: '/api/v1/admin/overview', desc: 'Platform KPIs, user growth & worker queue telemetry' },
        { method: 'POST', path: '/api/v1/admin/access-gate', desc: 'Mandatory Support Ticket Reference + Justification audit gate' },
        { method: 'POST', path: '/api/v1/admin/payments/:txId/refund', desc: 'Issue native-currency USD/PHP refund (dual approval >$100)' },
        { method: 'POST', path: '/api/v1/admin/pipeline/dlq/:jobId/retry', desc: 'Safely replay poisoned Dead-Letter Queue job on isolated worker' },
        { method: 'POST', path: '/api/v1/admin/storage/purge-expired', desc: 'Execute retention purge & emit cryptographic erasure proof' },
      ],
    },
  ];

  return (
    <div className="ss-surface-flows min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-[80px] space-y-12">
        <div className="ss-flows-card rounded-[22px] p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[11px] font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>{FLOWS_TEXT.eyebrow}</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-bold text-[#10213B] mt-3 leading-tight">
            {FLOWS_TEXT.heading}
          </h1>
          <p className="text-[14px] text-[#667085] mt-2 max-w-3xl">
            {FLOWS_TEXT.subheading}
          </p>
        </div>

        <div className="ss-flows-card rounded-[22px] p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                {FLOWS_TEXT.mapEyebrow}
              </div>
              <h2 className="text-[22px] font-bold text-[#10213B] mt-1">
                {FLOWS_TEXT.mapTitle}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>01 Public Acquisition & Auth</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                Landing Page (`/`) → Features (`/features`) → How It Works (`/how-it-works`) →
                Pricing (`/pricing`) → Registration & 6-Digit Email Verification (`/register`).
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link to="/" className="text-[11px] font-semibold text-[#2563EB] hover:underline">
                  Landing →
                </Link>
                <Link
                  to="/pricing"
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Pricing →
                </Link>
                <Link
                  to="/login"
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                >
                  Auth →
                </Link>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#16A36A]">
                <ShieldCheck className="w-4 h-4" />
                <span>02 Customer Validation Pipeline</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                Upload (`/app/upload`) → Magic-Byte & Zip-Bomb Preflight (`/app/upload/preflight`) →
                20-Row Preview & Fuzzy Mapping (`/app/upload/preview`) → DQS & Eligibility Results
                (`/app/results/:id`).
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  to="/app/upload"
                  className="text-[11px] font-semibold text-[#16A36A] hover:underline"
                >
                  Upload →
                </Link>
                <Link
                  to="/app/upload/preflight"
                  className="text-[11px] font-semibold text-[#16A36A] hover:underline"
                >
                  Preflight →
                </Link>
                <Link
                  to="/app/profiles/builder"
                  className="text-[11px] font-semibold text-[#16A36A] hover:underline"
                >
                  Rule Builder →
                </Link>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#10213B]">
                <Lock className="w-4 h-4" />
                <span>03 Admin Governance & Ledgers</span>
              </div>
              <p className="text-xs text-[#667085] leading-relaxed">
                Platform Overview (`/admin/overview`) → Ticket-Gated File Inspection
                (`/admin/uploads`) → Segregated USD/PHP Ledgers (`/admin/payments`) → 6-Role RBAC
                Matrix (`/admin/roles`).
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  to="/admin/overview"
                  className="text-[11px] font-semibold text-[#10213B] hover:underline"
                >
                  Admin Overview →
                </Link>
                <Link
                  to="/admin/payments"
                  className="text-[11px] font-semibold text-[#10213B] hover:underline"
                >
                  USD/PHP Ledger →
                </Link>
                <Link
                  to="/admin/roles"
                  className="text-[11px] font-semibold text-[#10213B] hover:underline"
                >
                  RBAC Matrix →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ss-flows-card rounded-[22px] p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                {FLOWS_TEXT.configEyebrow}
              </div>
              <h2 className="text-[22px] font-bold text-[#10213B] mt-1">
                {FLOWS_TEXT.configTitle}
              </h2>
            </div>
          </div>

          <ProvisionalConfigSwitcher
            configMode={configMode}
            onChangeMode={setConfigMode}
            currency={currency}
            onChangeCurrency={setCurrency}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['free', 'starter', 'pro'] as const).map((tier) => {
              const p = plans[tier];
              return (
                <div
                  key={tier}
                  className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#10213B]">{p.name} Tier</span>
                    <span className="text-lg font-bold text-[#2563EB]">
                      {formatPlanPrice(p, currency)}/mo
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] space-y-1 pt-1">
                    <div>• Monthly Checks: {p.monthlyValidations}</div>
                    <div>• Max File Size: {p.maxFileSizeMb} MB ({p.maxRowsPerFile.toLocaleString()} rows)</div>
                    <div>• Validation Profiles: {p.maxProfiles}</div>
                    <div>• Workspace Storage: {p.storageLimitLabel}</div>
                    <div>• Retention Window: {p.retentionDays} days</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ss-flows-card rounded-[22px] p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#16A36A]">
                <Database className="w-3.5 h-3.5" />
                <span>{FLOWS_TEXT.erdEyebrow}</span>
              </div>
              <h2 className="text-[22px] font-bold text-[#10213B] mt-1">
                {FLOWS_TEXT.erdTitle}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-xs font-mono font-semibold">
              database/schema.sql · InnoDB utf8mb4
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {erdDomains.map((dom) => (
              <div
                key={dom.module}
                className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${dom.badge}`}>
                    {dom.module}
                  </span>
                </div>
                <div className="space-y-2">
                  {dom.tables.map((t) => (
                    <div
                      key={t.name}
                      className="bg-white border border-[#E4E9F1] rounded-[10px] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-mono font-bold text-[#10213B] shrink-0">{t.name}</span>
                      <span className="font-mono text-[11px] text-[#667085] sm:text-right">
                        {t.cols}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ss-flows-card rounded-[22px] p-8 space-y-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
            <Server className="w-3.5 h-3.5" />
            <span>{FLOWS_TEXT.apiEyebrow}</span>
          </div>
          <h2 className="text-[22px] font-bold text-[#10213B]">
            {FLOWS_TEXT.apiTitle} (`/api/v1/*`)
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {apiRouteGroups.map((group) => (
              <div
                key={group.domain}
                className="bg-[#F8FAFC] border border-[#E4E9F1] rounded-[16px] p-5 space-y-3"
              >
                <h3 className="text-[13px] font-bold text-[#10213B]">{group.domain}</h3>
                <div className="space-y-2">
                  {group.routes.map((r) => (
                    <div
                      key={r.path}
                      className="bg-white border border-[#E4E9F1] rounded-[10px] p-3 space-y-1"
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            r.method === 'GET'
                              ? 'bg-[#EAF2FF] text-[#2563EB]'
                              : 'bg-[#E8F7EF] text-[#16A36A]'
                          }`}
                        >
                          {r.method}
                        </span>
                        <span className="font-bold text-[#10213B] break-all">{r.path}</span>
                      </div>
                      <p className="text-[11px] text-[#667085]">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

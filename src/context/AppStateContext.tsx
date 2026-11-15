import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ConfigSourceMode,
  CurrencyCode,
  JobLifecycleState,
  PlanTierId,
  QualityEvaluationSummary,
} from '../config/productConfig';
import {
  AuthSessionUser,
  RemoteJobSummary,
  clearStoredAuthToken,
  fetchCurrentSession,
  fetchHealthStatus,
  fetchWorkspaceJobs,
  fetchWorkspaceProfiles,
  getStoredAuthToken,
  loginWithCredentials,
  loginWithGoogleOAuth,
  logoutSession,
  registerCustomerAccount,
  saveProfileRule,
  saveValidationJob,
  updateWorkspacePrefs,
} from '../services/apiClient';
import type { RuleSeverity, RuleType } from '../services/validationEngine';
import {
  PreflightInspectionResult,
  SAMPLE_DATASETS,
} from '../services/spreadsheetParser';
import {
  CellValidationIssue,
  DEFAULT_VALIDATION_PROFILES,
  evaluateRowsWithProfile,
  ValidationProfile,
  ValidationRule,
} from '../services/validationEngine';

export interface ValidationJobRecord {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  worksheetName: string;
  profileId: string;
  profileName: string;
  profileVersion: number;
  state: JobLifecycleState;
  createdAt: string;
  completedAt: string;
  durationMs: number;
  workerNode: string;
  summary: QualityEvaluationSummary;
  issues: CellValidationIssue[];
  sanitizedRows: Record<string, string>[];
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  actionType: string;
  targetEntity: string;
  supportTicketId?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL_SECURITY';
  entryHash: string;
  details: string;
}

export interface RefundRequestRecord {
  id: string;
  transactionId: string;
  tenantName: string;
  currency: CurrencyCode;
  amount: number;
  reason: string;
  initiatedBy: string;
  approvedBy?: string;
  requiresDualApproval: boolean;
  status: 'PENDING_SECOND_APPROVAL' | 'APPROVED_PROCESSED' | 'REJECTED';
  createdAt: string;
}

interface AppStateContextValue {
  // Authentication & Role Session (MySQL 8 / Express API)
  authUser: AuthSessionUser | null;
  authLoading: boolean;
  dbConnected: boolean | null;
  phpmyadminUrl: string;
  login: (email: string, password: string) => Promise<AuthSessionUser>;
  register: (fullName: string, email: string, password: string) => Promise<AuthSessionUser>;
  loginWithGoogle: (email?: string, fullName?: string) => Promise<AuthSessionUser>;
  logout: () => Promise<void>;
  refreshWorkspaceData: () => Promise<void>;
  updateUserProfile: (updates: { fullName?: string; workspaceName?: string }) => Promise<void>;

  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  configMode: ConfigSourceMode;
  setConfigMode: (m: ConfigSourceMode) => void;
  activePlanId: PlanTierId;
  setActivePlanId: (p: PlanTierId) => void;
  downgradeGraceActive: boolean;
  setDowngradeGraceActive: (v: boolean) => void;

  // Upload & Preflight Wizard State
  activePreflight: PreflightInspectionResult;
  setActivePreflight: (p: PreflightInspectionResult) => void;
  selectedWorksheetIndex: number;
  setSelectedWorksheetIndex: (i: number) => void;
  selectedHeaderRow: number;
  setSelectedHeaderRow: (r: number) => void;
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  columnMapping: Record<string, string>;
  setColumnMapping: (m: Record<string, string>) => void;
  loadSampleDataset: (sampleKey: string) => void;

  // Validation Profiles & Jobs
  profiles: ValidationProfile[];
  addOrUpdateRule: (profileId: string, rule: ValidationRule) => void;
  toggleRuleEnabled: (profileId: string, ruleId: string) => void;
  jobs: ValidationJobRecord[];
  executeValidationJob: () => ValidationJobRecord;

  // Admin Governance: Ticket-Gated Cell Access & Dual-Approval Refunds
  adminTicketGrants: Record<string, { ticketId: string; justification: string; grantedAt: string }>;
  grantTicketAccess: (entityKey: string, ticketId: string, justification: string) => void;
  auditLogs: AuditLogRecord[];
  appendAuditLog: (entry: Omit<AuditLogRecord, 'id' | 'timestamp' | 'entryHash'>) => void;
  refundRequests: RefundRequestRecord[];
  approveRefundSecondAdmin: (refundId: string, approverName: string) => void;
  initiateRefundRequest: (req: {
    transactionId: string;
    tenantName: string;
    currency: CurrencyCode;
    amount: number;
    reason: string;
  }) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function buildInitialJobs(): ValidationJobRecord[] {
  const payrollSample = SAMPLE_DATASETS.q4_payroll_audit;
  const payrollSheet = payrollSample.worksheets[0];
  const payrollProfile = DEFAULT_VALIDATION_PROFILES[0];
  const evalPayroll = evaluateRowsWithProfile(payrollSheet.rows, payrollProfile.rules);

  const cleanSample = SAMPLE_DATASETS.clean_vendor_ledger;
  const cleanSheet = cleanSample.worksheets[0];
  const evalClean = evaluateRowsWithProfile(cleanSheet.rows, payrollProfile.rules);

  // High DQS (98.00% Grade A) yet BLOCKED_CRITICAL demonstration job
  const highScoreBlockedSummary: QualityEvaluationSummary = {
    totalEvaluatedRows: 250,
    cleanRowsCount: 248,
    criticalRowsCount: 1,
    warningOnlyRowsCount: 1,
    totalCriticalIssues: 1,
    totalWarningIssues: 1,
    formulaInjectionCount: 0,
    dataQualityScore: 99.48,
    validationGrade: 'A',
    processingEligibility: 'BLOCKED_CRITICAL',
    eligibilityReason:
      'Blocked from automated ingestion: 1 critical blocking error across 1 row (duplicate primary key). High DQS (99.48% / Grade A) never overrides a blocking critical error.',
  };

  return [
    {
      id: 'JOB-2026-8941',
      fileName: payrollSample.preflight.fileName,
      fileSizeBytes: payrollSample.preflight.fileSizeBytes,
      worksheetName: payrollSheet.name,
      profileId: payrollProfile.id,
      profileName: payrollProfile.name,
      profileVersion: payrollProfile.version,
      state: 'COMPLETED',
      createdAt: '2026-11-11 19:42:10 UTC',
      completedAt: '2026-11-11 19:42:14 UTC',
      durationMs: 3840,
      workerNode: 'worker-sandbox-ap-southeast-1a',
      summary: evalPayroll.summary,
      issues: evalPayroll.issues,
      sanitizedRows: evalPayroll.sanitizedRows,
    },
    {
      id: 'JOB-2026-8940',
      fileName: cleanSample.preflight.fileName,
      fileSizeBytes: cleanSample.preflight.fileSizeBytes,
      worksheetName: cleanSheet.name,
      profileId: payrollProfile.id,
      profileName: payrollProfile.name,
      profileVersion: payrollProfile.version,
      state: 'COMPLETED',
      createdAt: '2026-11-11 18:15:02 UTC',
      completedAt: '2026-11-11 18:15:04 UTC',
      durationMs: 1920,
      workerNode: 'worker-sandbox-ap-southeast-1b',
      summary: evalClean.summary,
      issues: evalClean.issues,
      sanitizedRows: evalClean.sanitizedRows,
    },
    {
      id: 'JOB-2026-8938',
      fileName: 'Global_Treasury_Wire_Batch_Nov.xlsx',
      fileSizeBytes: 3145728,
      worksheetName: 'Treasury_Wires',
      profileId: payrollProfile.id,
      profileName: payrollProfile.name,
      profileVersion: 3,
      state: 'COMPLETED',
      createdAt: '2026-11-11 15:08:40 UTC',
      completedAt: '2026-11-11 15:08:46 UTC',
      durationMs: 5610,
      workerNode: 'worker-sandbox-us-east-1c',
      summary: highScoreBlockedSummary,
      issues: [
        {
          id: 'iss-treasury-1',
          rowNumber: 142,
          columnName: 'employee_id',
          ruleId: 'rule-emp-uniq',
          ruleLabel: 'Unique Employee ID',
          ruleType: 'UNIQUE',
          severity: 'CRITICAL',
          blocksProcessing: true,
          rawValue: 'EMP-8841',
          sanitizedValue: 'EMP-8841',
          formulaNeutralized: false,
          message: 'Duplicate employee_id EMP-8841 found at Row 142 (first seen at Row 19).',
        },
      ],
      sanitizedRows: cleanSheet.rows,
    },
    {
      id: 'JOB-2026-8932',
      fileName: 'Suspicious_Vendor_Macro_Payload.xlsx',
      fileSizeBytes: 842190,
      worksheetName: 'N/A (Quarantined at Gate)',
      profileId: 'prof-sku-v2',
      profileName: 'E-Commerce SKU & Price Master Catalog',
      profileVersion: 2,
      state: 'QUARANTINED',
      createdAt: '2026-11-10 22:19:00 UTC',
      completedAt: '2026-11-10 22:19:01 UTC',
      durationMs: 410,
      workerNode: 'preflight-gatekeeper-02',
      summary: {
        totalEvaluatedRows: 0,
        cleanRowsCount: 0,
        criticalRowsCount: 0,
        warningOnlyRowsCount: 0,
        totalCriticalIssues: 1,
        totalWarningIssues: 0,
        formulaInjectionCount: 0,
        dataQualityScore: null,
        validationGrade: 'FAIL',
        processingEligibility: 'BLOCKED_CRITICAL',
        eligibilityReason:
          'QUARANTINED at Preflight Gate: Zip expansion ratio 41.8:1 exceeds maximum 25:1 zip-bomb threshold.',
      },
      issues: [],
      sanitizedRows: [],
    },
  ];
}

function mapRemoteJobToRecord(remote: RemoteJobSummary): ValidationJobRecord {
  const grade = remote.validationGrade === 'NA' ? 'N/A' : remote.validationGrade;
  const totalRows = remote.totalRowsEvaluated || 0;
  const critRows = remote.criticalRowsCount || 0;
  const warnRows = remote.warningRowsCount || 0;
  return {
    id: remote.id,
    fileName: remote.fileName,
    fileSizeBytes: remote.fileSizeBytes || 0,
    worksheetName: 'Sheet1',
    profileId: remote.profileId || 'prof-payroll-v3',
    profileName: remote.profileName || 'Monthly sales',
    profileVersion: 1,
    state: (remote.state as JobLifecycleState) || 'COMPLETED',
    createdAt: remote.startedAt
      ? new Date(remote.startedAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    completedAt: remote.completedAt
      ? new Date(remote.completedAt).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      : new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    durationMs: 1180,
    workerNode: remote.workerNode || 'SheetSentry Cloud Validator',
    summary: {
      totalEvaluatedRows: totalRows,
      cleanRowsCount: Math.max(0, totalRows - critRows - warnRows),
      criticalRowsCount: critRows,
      warningOnlyRowsCount: warnRows,
      totalCriticalIssues: critRows,
      totalWarningIssues: warnRows,
      formulaInjectionCount: 0,
      dataQualityScore: remote.dataQualityScore,
      validationGrade: grade,
      processingEligibility: remote.processingEligibility || 'ELIGIBLE',
      eligibilityReason:
        remote.processingEligibility === 'BLOCKED_CRITICAL'
          ? 'Blocked due to critical validation issues that require review before import.'
          : remote.processingEligibility === 'REVIEW_REQUIRED'
          ? 'Warnings detected; manual review recommended.'
          : 'All critical checks passed. Ready for downstream import.',
    },
    issues: [],
    sanitizedRows: [],
  };
}

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthSessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => Boolean(getStoredAuthToken()));
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [phpmyadminUrl, setPhpmyadminUrl] = useState<string>('http://localhost/phpmyadmin');

  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [configMode, setConfigMode] = useState<ConfigSourceMode>('SSOT_138_2');
  const [activePlanId, setActivePlanIdState] = useState<PlanTierId>('pro');
  const [downgradeGraceActive, setDowngradeGraceActive] = useState<boolean>(false);

  const [activePreflight, setActivePreflight] = useState<PreflightInspectionResult>(
    SAMPLE_DATASETS.q4_payroll_audit.preflight
  );
  const [selectedWorksheetIndex, setSelectedWorksheetIndex] = useState<number>(0);
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<number>(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('prof-payroll-v3');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    employee_id: 'employee_id',
    work_email: 'work_email',
    department: 'department',
    tax_id_tin: 'tax_id_tin',
    gross_pay_usd: 'gross_pay_usd',
    bank_routing_note: 'bank_routing_note',
  });

  const [profiles, setProfiles] = useState<ValidationProfile[]>(DEFAULT_VALIDATION_PROFILES);
  const [jobs, setJobs] = useState<ValidationJobRecord[]>(() => buildInitialJobs());
  const [adminTicketGrants, setAdminTicketGrants] = useState<
    Record<string, { ticketId: string; justification: string; grantedAt: string }>
  >({});

  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([
    {
      id: 'AUD-9924',
      timestamp: '2026-11-11 19:42:14 UTC',
      actor: 'System Worker (ap-southeast-1a)',
      actorRole: 'SYSTEM_WORKER',
      actionType: 'FORMULA_INJECTION_NEUTRALIZED',
      targetEntity: 'JOB-2026-8941 (Q4_Enterprise_Payroll_Import.xlsx)',
      severity: 'CRITICAL_SECURITY',
      entryHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      details: "Neutralized 2 executable cell prefixes (=CMD|' /C calc.exe'!A0 and @SUM) with leading apostrophes.",
    },
    {
      id: 'AUD-9921',
      timestamp: '2026-11-11 16:05:19 UTC',
      actor: 'marco.villanueva@sheetsentry.io',
      actorRole: 'SUPPORT_L2',
      actionType: 'ADMIN_TICKET_GATED_INSPECTION',
      targetEntity: 'Tenant: Acme Global Logistics (usr-104)',
      supportTicketId: 'SUP-4812',
      severity: 'WARNING',
      entryHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      details: 'Support Tier 2 unmasked cell validation metadata under ticket SUP-4812 (15-minute TTL).',
    },
    {
      id: 'AUD-9918',
      timestamp: '2026-11-10 22:19:01 UTC',
      actor: 'Preflight Gatekeeper 02',
      actorRole: 'SECOPS_GATE',
      actionType: 'UPLOAD_QUARANTINED_ZIP_BOMB',
      targetEntity: 'JOB-2026-8932 (Suspicious_Vendor_Macro_Payload.xlsx)',
      severity: 'CRITICAL_SECURITY',
      entryHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      details: 'Decompression ratio 41.8:1 exceeded 25:1 safety ceiling. File isolated in S3 Quarantine bucket.',
    },
  ]);

  const [refundRequests, setRefundRequests] = useState<RefundRequestRecord[]>([
    {
      id: 'REF-2026-301',
      transactionId: 'TXN-USD-88412',
      tenantName: 'NorthStar Financial Holdings Inc.',
      currency: 'USD',
      amount: 720.0, // > $500 USD -> Requires Dual-Admin Approval per Node 138:2 & 136:1265
      reason: 'Annual Pro seat over-provisioning adjustment requested within 48h window.',
      initiatedBy: 'claire.santos@sheetsentry.io (Billing Admin)',
      requiresDualApproval: true,
      status: 'PENDING_SECOND_APPROVAL',
      createdAt: '2026-11-11 14:10 UTC',
    },
    {
      id: 'REF-2026-298',
      transactionId: 'TXN-PHP-44109',
      tenantName: 'BGC Retail Supply Chain Corp.',
      currency: 'PHP',
      amount: 670.0, // <= ₱27,500 ($500 eq) -> Single admin approval sufficient
      reason: 'Duplicate PayMongo GCash webhook capture reversal.',
      initiatedBy: 'claire.santos@sheetsentry.io (Billing Admin)',
      approvedBy: 'claire.santos@sheetsentry.io (Auto-Cleared <= $500 eq)',
      requiresDualApproval: false,
      status: 'APPROVED_PROCESSED',
      createdAt: '2026-11-09 11:25 UTC',
    },
  ]);

  const appendAuditLog = (entry: Omit<AuditLogRecord, 'id' | 'timestamp' | 'entryHash'>) => {
    const newId = `AUD-${9925 + auditLogs.length}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    const entryHash = Array.from(newId + entry.actionType + timestamp)
      .reduce((acc, c, i) => acc + ((c.charCodeAt(0) * (i + 11)) % 256).toString(16).padStart(2, '0'), '')
      .slice(0, 64);

    setAuditLogs((prev) => [{ ...entry, id: newId, timestamp, entryHash }, ...prev]);
  };

  const loadSampleDataset = (sampleKey: string) => {
    const sample = SAMPLE_DATASETS[sampleKey];
    if (!sample) return;
    setActivePreflight(sample.preflight);
    setSelectedWorksheetIndex(0);
    setSelectedHeaderRow(1);
    setSelectedProfileId(sample.recommendedProfileId);
    const sheet = sample.worksheets[0];
    if (sheet) {
      const mapping: Record<string, string> = {};
      sheet.headers.forEach((h) => {
        mapping[h] = h;
      });
      setColumnMapping(mapping);
    }
  };

  const hydrateWorkspaceForUser = useCallback(async (user: AuthSessionUser) => {
    setAuthUser(user);
    if (user.currency === 'USD' || user.currency === 'PHP') {
      setCurrencyState(user.currency);
    }
    if (user.planId === 'free' || user.planId === 'starter' || user.planId === 'pro') {
      setActivePlanIdState(user.planId);
    }

    try {
      const { jobs: remoteJobs } = await fetchWorkspaceJobs();
      setJobs((prev) => {
        const seedSamples = user.workspaceId === 'ws_olivia_01' ? buildInitialJobs() : [];
        const byId = new Map<string, ValidationJobRecord>([
          ...seedSamples.map((j) => [j.id, j] as const),
          ...prev.map((j) => [j.id, j] as const),
        ]);
        return remoteJobs.map((rj) => {
          const existing = byId.get(rj.id);
          if (existing && existing.sanitizedRows.length > 0) {
            return existing;
          }
          return mapRemoteJobToRecord(rj);
        });
      });
    } catch {
      // Keep an empty workspace job list for newly created/isolated customer accounts if jobs fetch fails
      setJobs([]);
    }

    try {
      const { profiles: remoteProfiles } = await fetchWorkspaceProfiles();
      if (remoteProfiles.length > 0) {
        const customPersistedRules: ValidationRule[] = [];
        for (const rp of remoteProfiles) {
          for (const rr of rp.rules || []) {
            if (rr.id.startsWith('rule-custom-')) {
              customPersistedRules.push({
                id: rr.id,
                targetField: rr.targetField,
                label: `${rr.targetField} (${rr.type})`,
                ruleType: (rr.type as RuleType) || 'REQUIRED',
                severity: (rr.severity as RuleSeverity) || 'CRITICAL',
                blocksProcessing: Boolean(rr.blocksProcessing),
                enabled: true,
                parameters: (rr.params as ValidationRule['parameters']) || {},
                errorMessage: rr.errorMessageTemplate || 'Validation rule failed',
              });
            }
          }
        }
        if (customPersistedRules.length > 0) {
          setProfiles((prev) =>
            prev.map((prof, idx) => {
              if (idx !== 0) return prof;
              const existingIds = new Set(prof.rules.map((r) => r.id));
              const newOnes = customPersistedRules.filter((r) => !existingIds.has(r.id));
              if (newOnes.length === 0) return prof;
              return {
                ...prof,
                version: prof.version + newOnes.length,
                rules: [...prof.rules, ...newOnes],
              };
            })
          );
        }
      }
    } catch {
      // Ignore optional profile hydration errors cleanly
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchHealthStatus()
      .then((health) => {
        if (!active) return;
        setDbConnected(Boolean(health.database?.connected));
        if (health.database?.phpmyadminUrl) {
          setPhpmyadminUrl(health.database.phpmyadminUrl);
        }
      })
      .catch(() => {
        if (active) setDbConnected(false);
      });

    if (getStoredAuthToken()) {
      fetchCurrentSession()
        .then(async (res) => {
          if (!active) return;
          if (res.user) {
            await hydrateWorkspaceForUser(res.user);
          }
        })
        .catch(() => {
          clearStoredAuthToken();
          if (active) setAuthUser(null);
        })
        .finally(() => {
          if (active) setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }

    return () => {
      active = false;
    };
  }, [hydrateWorkspaceForUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthSessionUser> => {
      const res = await loginWithCredentials(email, password);
      await hydrateWorkspaceForUser(res.user);
      return res.user;
    },
    [hydrateWorkspaceForUser]
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthSessionUser> => {
      const res = await registerCustomerAccount(fullName, email, password);
      await hydrateWorkspaceForUser(res.user);
      return res.user;
    },
    [hydrateWorkspaceForUser]
  );

  const loginWithGoogle = useCallback(
    async (email?: string, fullName?: string): Promise<AuthSessionUser> => {
      const res = await loginWithGoogleOAuth(email, fullName);
      await hydrateWorkspaceForUser(res.user);
      return res.user;
    },
    [hydrateWorkspaceForUser]
  );

  const logout = useCallback(async () => {
    await logoutSession();
    setAuthUser(null);
    setActivePlanIdState('pro');
    setCurrencyState('USD');
    setJobs(buildInitialJobs());
  }, []);

  const refreshWorkspaceData = useCallback(async () => {
    if (!authUser) return;
    await hydrateWorkspaceForUser(authUser);
  }, [authUser, hydrateWorkspaceForUser]);

  const setCurrency = useCallback(
    (nextCurrency: CurrencyCode) => {
      setCurrencyState(nextCurrency);
      if (authUser?.workspaceId) {
        void updateWorkspacePrefs(authUser.workspaceId, { currency: nextCurrency }).catch(() => {});
      }
    },
    [authUser?.workspaceId]
  );

  const setActivePlanId = useCallback(
    (nextPlan: PlanTierId) => {
      setActivePlanIdState(nextPlan);
      if (authUser?.workspaceId) {
        void updateWorkspacePrefs(authUser.workspaceId, { planId: nextPlan }).catch(() => {});
      }
    },
    [authUser?.workspaceId]
  );

  const updateUserProfile = useCallback(
    async (updates: { fullName?: string; workspaceName?: string }) => {
      if (authUser?.workspaceId) {
        await updateWorkspacePrefs(authUser.workspaceId, updates);
      }
      setAuthUser((prev) =>
        prev
          ? {
              ...prev,
              fullName: updates.fullName?.trim() || prev.fullName,
              workspaceName: updates.workspaceName?.trim() || prev.workspaceName,
            }
          : prev
      );
    },
    [authUser?.workspaceId]
  );

  const addOrUpdateRule = (profileId: string, rule: ValidationRule) => {
    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.id !== profileId) return prof;
        const exists = prof.rules.some((r) => r.id === rule.id);
        const updatedRules = exists
          ? prof.rules.map((r) => (r.id === rule.id ? rule : r))
          : [...prof.rules, rule];
        return {
          ...prof,
          version: prof.version + 1,
          updatedAt: new Date().toISOString(),
          rules: updatedRules,
        };
      })
    );
    if (authUser) {
      void saveProfileRule(profileId, {
        id: rule.id,
        targetField: rule.targetField,
        ruleType: rule.ruleType,
        severity: rule.severity,
        blocksProcessing: rule.blocksProcessing,
        params: rule.parameters as Record<string, unknown>,
        message: rule.errorMessage,
      }).catch(() => {});
    }
  };

  const toggleRuleEnabled = (profileId: string, ruleId: string) => {
    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.id !== profileId) return prof;
        return {
          ...prof,
          rules: prof.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
        };
      })
    );
  };

  const executeValidationJob = (): ValidationJobRecord => {
    const worksheet =
      activePreflight.worksheets[selectedWorksheetIndex] || activePreflight.worksheets[0];
    const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];
    const rows = worksheet ? worksheet.rows : [];
    const evalOutput = evaluateRowsWithProfile(rows, profile.rules, columnMapping);

    const existingIds = new Set(jobs.map((j) => j.id));
    let nextJobId = `JOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    while (existingIds.has(nextJobId)) {
      nextJobId = `JOB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newJob: ValidationJobRecord = {
      id: nextJobId,
      fileName: activePreflight.fileName,
      fileSizeBytes: activePreflight.fileSizeBytes,
      worksheetName: worksheet?.name || 'Sheet1',
      profileId: profile.id,
      profileName: profile.name,
      profileVersion: profile.version,
      state:
        activePreflight.preflightStatus === 'QUARANTINED_CRITICAL'
          ? 'QUARANTINED'
          : 'COMPLETED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      durationMs: 1420,
      workerNode: authUser ? 'SheetSentry Cloud Validator' : 'SheetSentry Preview Validator',
      summary: evalOutput.summary,
      issues: evalOutput.issues,
      sanitizedRows: evalOutput.sanitizedRows,
    };

    setJobs((prev) => [newJob, ...prev]);

    if (authUser) {
      void saveValidationJob({
        id: newJob.id,
        profileId: newJob.profileId,
        fileName: newJob.fileName,
        fileSizeBytes: newJob.fileSizeBytes,
        worksheetName: newJob.worksheetName,
        extension: activePreflight.extension,
        magicBytesHex: activePreflight.magicBytesHex,
        magicBytesValid: activePreflight.magicBytesValid,
        zipExpansionRatio: activePreflight.zipExpansionRatio,
        state: newJob.state,
        summary: {
          totalEvaluatedRows: newJob.summary.totalEvaluatedRows,
          criticalRowsCount: newJob.summary.criticalRowsCount,
          warningOnlyRowsCount: newJob.summary.warningOnlyRowsCount,
          dataQualityScore: newJob.summary.dataQualityScore,
          validationGrade:
            newJob.summary.validationGrade === 'N/A' ? 'NA' : newJob.summary.validationGrade,
          processingEligibility: newJob.summary.processingEligibility,
        },
        issues: newJob.issues.slice(0, 100).map((iss) => ({
          rowNumber: iss.rowNumber,
          columnName: iss.columnName,
          severity: iss.severity,
          rawValue: iss.rawValue,
          sanitizedValue: iss.sanitizedValue,
          formulaNeutralized: iss.formulaNeutralized,
          message: iss.message,
        })),
      }).catch(() => {});
    }

    return newJob;
  };

  const grantTicketAccess = (entityKey: string, ticketId: string, justification: string) => {
    const grantedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    setAdminTicketGrants((prev) => ({
      ...prev,
      [entityKey]: { ticketId, justification, grantedAt },
    }));
    appendAuditLog({
      actor: 'admin.session@sheetsentry.io',
      actorRole: 'SECOPS_AUDITOR',
      actionType: 'ADMIN_TICKET_GATED_INSPECTION',
      targetEntity: entityKey,
      supportTicketId: ticketId,
      severity: 'WARNING',
      details: `Unmasked customer payload for ${entityKey} under Support Ticket ${ticketId}. Reason: ${justification}`,
    });
  };

  const approveRefundSecondAdmin = (refundId: string, approverName: string) => {
    setRefundRequests((prev) =>
      prev.map((r) =>
        r.id === refundId
          ? { ...r, approvedBy: approverName, status: 'APPROVED_PROCESSED' }
          : r
      )
    );
    appendAuditLog({
      actor: approverName,
      actorRole: 'SUPER_ADMIN',
      actionType: 'DUAL_ADMIN_REFUND_APPROVED',
      targetEntity: refundId,
      severity: 'WARNING',
      details: `Second admin (${approverName}) approved high-value refund ${refundId} (> $500 USD threshold).`,
    });
  };

  const initiateRefundRequest = (req: {
    transactionId: string;
    tenantName: string;
    currency: CurrencyCode;
    amount: number;
    reason: string;
  }) => {
    const requiresDual =
      (req.currency === 'USD' && req.amount > 500) ||
      (req.currency === 'PHP' && req.amount > 27500);
    const newRef: RefundRequestRecord = {
      id: `REF-2026-${302 + refundRequests.length}`,
      transactionId: req.transactionId,
      tenantName: req.tenantName,
      currency: req.currency,
      amount: req.amount,
      reason: req.reason,
      initiatedBy: 'claire.santos@sheetsentry.io (Billing Admin)',
      approvedBy: requiresDual ? undefined : 'claire.santos@sheetsentry.io (Auto-Cleared <= $500 eq)',
      requiresDualApproval: requiresDual,
      status: requiresDual ? 'PENDING_SECOND_APPROVAL' : 'APPROVED_PROCESSED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    };
    setRefundRequests((prev) => [newRef, ...prev]);
  };

  return (
    <AppStateContext.Provider
      value={{
        authUser,
        authLoading,
        dbConnected,
        phpmyadminUrl,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshWorkspaceData,
        updateUserProfile,
        currency,
        setCurrency,
        configMode,
        setConfigMode,
        activePlanId,
        setActivePlanId,
        downgradeGraceActive,
        setDowngradeGraceActive,
        activePreflight,
        setActivePreflight,
        selectedWorksheetIndex,
        setSelectedWorksheetIndex,
        selectedHeaderRow,
        setSelectedHeaderRow,
        selectedProfileId,
        setSelectedProfileId,
        columnMapping,
        setColumnMapping,
        loadSampleDataset,
        profiles,
        addOrUpdateRule,
        toggleRuleEnabled,
        jobs,
        executeValidationJob,
        adminTicketGrants,
        grantTicketAccess,
        auditLogs,
        appendAuditLog,
        refundRequests,
        approveRefundSecondAdmin,
        initiateRefundRequest,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}

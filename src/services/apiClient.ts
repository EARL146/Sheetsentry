/**
 * SheetSentry Frontend API Client
 * Communicates with the Express REST API (/api/v1/*) backed by MySQL 8 / phpMyAdmin.
 */

export const AUTH_TOKEN_STORAGE_KEY = 'sheetsentry_auth_token';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  appRole: 'USER' | 'ADMIN';
  adminRole?: string;
  role: string;
  workspaceId?: string;
  workspaceName?: string;
  planId?: 'free' | 'starter' | 'pro' | string;
  currency?: 'USD' | 'PHP';
}

export interface AuthSuccessResponse {
  message: string;
  token: string;
  userId?: string;
  email?: string;
  status?: string;
  user: AuthSessionUser;
}

export interface HealthStatusResponse {
  status: string;
  service: string;
  version: string;
  database: {
    engine: 'mysql8' | 'in-memory';
    name: string;
    connected: boolean;
    phpmyadminUrl: string;
  };
  timestamp: string;
}

export interface RemoteJobSummary {
  id: string;
  state: string;
  fileName: string;
  fileSizeBytes: number;
  profileId: string;
  profileName: string;
  totalRowsEvaluated: number;
  criticalRowsCount: number;
  warningRowsCount: number;
  dataQualityScore: number | null;
  validationGrade: 'A' | 'B' | 'C' | 'FAIL' | 'NA';
  processingEligibility: 'ELIGIBLE' | 'REVIEW_REQUIRED' | 'BLOCKED_CRITICAL';
  workerNode: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface RemoteJobIssue {
  id: number | string;
  row: number;
  column: string;
  severity: 'CRITICAL' | 'WARNING';
  rawValueMasked: string;
  formulaNeutralized: boolean;
  message: string;
}

export interface RemoteProfileItem {
  id: string;
  name: string;
  targetDomain: string;
  version: number;
  versionId?: string;
  ruleCount: number;
  rules?: Array<{
    id: string;
    targetField: string;
    type: string;
    severity: 'CRITICAL' | 'WARNING';
    blocksProcessing: boolean;
    params?: Record<string, unknown>;
    errorMessageTemplate: string;
  }>;
}

export interface SaveJobPayload {
  id: string;
  fileId?: string;
  profileId: string;
  fileName: string;
  fileSizeBytes: number;
  worksheetName?: string;
  extension?: string;
  magicBytesHex?: string;
  magicBytesValid?: boolean;
  zipExpansionRatio?: number;
  state: 'COMPLETED' | 'QUARANTINED' | string;
  summary?: {
    totalEvaluatedRows?: number;
    criticalRowsCount?: number;
    warningOnlyRowsCount?: number;
    dataQualityScore?: number | null;
    validationGrade?: string;
    processingEligibility?: string;
  };
  issues?: Array<{
    rowNumber: number;
    columnName: string;
    severity: 'CRITICAL' | 'WARNING';
    rawValue?: string;
    sanitizedValue?: string;
    formulaNeutralized?: boolean;
    message: string;
  }>;
}

export class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

export function getStoredAuthToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function clearStoredAuthToken(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuthHeader = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuthHeader) {
    const token = getStoredAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiClientError(
      'Unable to reach SheetSentry API server. Ensure the backend server (port 4000) is running.',
      0,
      'NETWORK_ERROR'
    );
  }

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  if (text) {
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      parsed = { message: text };
    }
  }

  if (!response.ok) {
    const nestedError = parsed.error as { code?: string; message?: string } | undefined;
    const message =
      nestedError?.message ||
      (typeof parsed.message === 'string' ? parsed.message : null) ||
      `Request failed (${response.status})`;
    const code = nestedError?.code || 'REQUEST_FAILED';
    throw new ApiClientError(message, response.status, code);
  }

  return parsed as T;
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthSuccessResponse> {
  const result = await apiRequest<AuthSuccessResponse>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false
  );
  if (result.token) {
    setStoredAuthToken(result.token);
  }
  return result;
}

export async function registerCustomerAccount(
  fullName: string,
  email: string,
  password: string
): Promise<AuthSuccessResponse> {
  const result = await apiRequest<AuthSuccessResponse>(
    '/api/v1/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    },
    false
  );
  if (result.token) {
    setStoredAuthToken(result.token);
  }
  return result;
}

export async function loginWithGoogleOAuth(
  email?: string,
  fullName?: string
): Promise<AuthSuccessResponse> {
  const result = await apiRequest<AuthSuccessResponse>(
    '/api/v1/auth/oauth',
    {
      method: 'POST',
      body: JSON.stringify({
        provider: 'GOOGLE',
        email,
        fullName,
      }),
    },
    false
  );
  if (result.token) {
    setStoredAuthToken(result.token);
  }
  return result;
}

export async function fetchCurrentSession(): Promise<{ user: AuthSessionUser }> {
  return apiRequest<{ user: AuthSessionUser }>('/api/v1/auth/me', { method: 'GET' }, true);
}

export async function logoutSession(): Promise<{ message: string }> {
  try {
    if (!getStoredAuthToken()) {
      return { message: 'Signed out' };
    }
    return await apiRequest<{ message: string }>(
      '/api/v1/auth/logout',
      { method: 'POST' },
      true
    );
  } finally {
    clearStoredAuthToken();
  }
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    '/api/v1/auth/password-reset',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
    false
  );
}

export async function fetchHealthStatus(): Promise<HealthStatusResponse> {
  return apiRequest<HealthStatusResponse>('/api/health', { method: 'GET' }, false);
}

export async function fetchWorkspaceJobs(): Promise<{ jobs: RemoteJobSummary[] }> {
  return apiRequest<{ jobs: RemoteJobSummary[] }>('/api/v1/jobs', { method: 'GET' }, true);
}

export async function fetchJobIssues(jobId: string): Promise<{
  jobId: string;
  totalIssues: number;
  issues: RemoteJobIssue[];
}> {
  return apiRequest<{ jobId: string; totalIssues: number; issues: RemoteJobIssue[] }>(
    `/api/v1/jobs/${encodeURIComponent(jobId)}/issues`,
    { method: 'GET' },
    true
  );
}

export async function fetchWorkspaceProfiles(): Promise<{ profiles: RemoteProfileItem[] }> {
  return apiRequest<{ profiles: RemoteProfileItem[] }>('/api/v1/profiles', { method: 'GET' }, true);
}

export async function saveValidationJob(
  payload: SaveJobPayload
): Promise<{ jobId: string; state: string; fileId: string; savedToMysql?: boolean }> {
  return apiRequest('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateWorkspacePrefs(
  workspaceId: string,
  prefs: {
    currency?: 'USD' | 'PHP';
    planId?: 'free' | 'starter' | 'pro';
    fullName?: string;
    workspaceName?: string;
  }
): Promise<{ updated: boolean; workspaceId?: string }> {
  return apiRequest(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  });
}

export async function saveProfileRule(
  profileId: string,
  rule: {
    id?: string;
    targetField: string;
    ruleType: string;
    severity: 'CRITICAL' | 'WARNING';
    blocksProcessing: boolean;
    params?: Record<string, unknown>;
    message: string;
  }
): Promise<{ saved: boolean; ruleId?: string }> {
  return apiRequest(`/api/v1/profiles/${encodeURIComponent(profileId)}/rules`, {
    method: 'POST',
    body: JSON.stringify(rule),
  });
}

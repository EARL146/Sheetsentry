/**
 * SheetSentry Flows & Technical Architecture Design System Tokens
 * Source of Truth: Figma "04 User and Admin Flows" (Node 2:4 / 23:2)
 * Engineering references: Architecture 122:2, ERD 136:1565, API Catalog 136:1683
 *
 * Isolated surface tokens for system topologies, state machine transitions,
 * relational database schema diagrams, and REST API route catalogs.
 */

export const FLOWS_TOKENS = {
  surface: 'flows',
  canvas: {
    light: '#F8FAFC',
    dark: '#0D1726',
    border: '#E2E8F0',
  },
  systemNodes: {
    publicSite: {
      border: '#3B82F6',
      bg: '#EFF6FF',
      header: '#1E40AF',
      accent: '#2563EB',
    },
    customerApp: {
      border: '#10B981',
      bg: '#ECFDF5',
      header: '#065F46',
      accent: '#059669',
    },
    adminConsole: {
      border: '#8B5CF6',
      bg: '#F5F3FF',
      header: '#5B21B6',
      accent: '#7C3AED',
    },
    validationEngine: {
      border: '#F59E0B',
      bg: '#FFFBEB',
      header: '#92400E',
      accent: '#D97706',
    },
    databaseStorage: {
      border: '#6366F1',
      bg: '#EEF2FF',
      header: '#3730A3',
      accent: '#4F46E5',
    },
  },
  erdModules: {
    m1_identity: {
      name: 'Module 1 — Identity, Accounts & Auth',
      accent: '#2563EB',
      badge: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    },
    m2_workspaces: {
      name: 'Module 2 — Workspaces & Memberships',
      accent: '#0284C7',
      badge: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
    },
    m3_uploads: {
      name: 'Module 3 — Uploaded Files & Worksheets',
      accent: '#059669',
      badge: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    },
    m4_rules: {
      name: 'Module 4 — Validation Profiles & Rules',
      accent: '#D97706',
      badge: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    },
    m5_jobs: {
      name: 'Module 5 — Validation Jobs & Cell Issues',
      accent: '#7C3AED',
      badge: 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]',
    },
    m6_reports: {
      name: 'Module 6 — Reports & Audit Logging',
      accent: '#DC2626',
      badge: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
    },
    m7_financials: {
      name: 'Module 7 — Subscriptions & Segregated Ledgers',
      accent: '#4F46E5',
      badge: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]',
    },
  },
  erdKeyBadges: {
    pk: 'px-1.5 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#1D4ED8] font-mono text-[9px] font-bold border border-[#BFDBFE]',
    fk: 'px-1.5 py-0.5 rounded-[4px] bg-[#F5F3FF] text-[#6D28D9] font-mono text-[9px] font-bold border border-[#DDD6FE]',
    uk: 'px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#B45309] font-mono text-[9px] font-bold border border-[#FDE68A]',
    idx: 'px-1.5 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] font-mono text-[9px] font-medium border border-[#E2E8F0]',
  },
  apiBadges: {
    GET: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    POST: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    PUT: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
    PATCH: 'bg-[#FDF4FF] text-[#A21CAF] border-[#F5D0FE]',
    DELETE: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
  },
} as const;

/**
 * Separated Text Layer — Global Navigation & Surface Shell Copy
 * Zero internal developer annotations or raw coordinate references.
 */

export interface PortalSurfaceOption {
  id: 'public' | 'customer' | 'admin' | 'foundations' | 'flows';
  label: string;
  badge: string;
  to: string;
  match: (pathname: string) => boolean;
}

export const PORTAL_SURFACES: PortalSurfaceOption[] = [
  {
    id: 'public',
    label: 'Public Website',
    badge: '01',
    to: '/',
    match: (p) =>
      p === '/' ||
      ['/features', '/how-it-works', '/pricing', '/faq', '/login', '/register', '/reset-password'].includes(p),
  },
  {
    id: 'customer',
    label: 'Customer App',
    badge: '02',
    to: '/app/dashboard',
    match: (p) => p.startsWith('/app'),
  },
  {
    id: 'admin',
    label: 'Admin Console',
    badge: '03',
    to: '/admin/overview',
    match: (p) => p.startsWith('/admin'),
  },
  {
    id: 'foundations',
    label: 'Design System',
    badge: '00',
    to: '/foundations',
    match: (p) => p.startsWith('/foundations'),
  },
  {
    id: 'flows',
    label: 'System Flows',
    badge: '04',
    to: '/flows',
    match: (p) => p.startsWith('/flows'),
  },
];

export const PUBLIC_NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
] as const;

export const PUBLIC_FOOTER_TEXT = {
  tagline:
    'Spreadsheet pre-ingestion validation for clean CSV and Excel workflows — built with deterministic guardrails and export sanitization.',
  productLinks: [
    { to: '/features', label: 'Features' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/faq', label: 'FAQ' },
  ],
  workspaceLinks: [
    { to: '/app/dashboard', label: 'Customer Dashboard' },
    { to: '/app/upload', label: 'Upload Workbook' },
    { to: '/app/rules', label: 'Rule Builder' },
    { to: '/admin/overview', label: 'Admin Console' },
  ],
  copyright: 'SheetSentry Data Quality Platform',
} as const;

export const CUSTOMER_WORKSPACE_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', glyph: '▦' },
  { to: '/app/upload', label: 'Upload file', glyph: '⇧' },
  { to: '/app/profiles', label: 'Validation profiles', glyph: '≡' },
  { to: '/app/rules', label: 'Rule builder', glyph: '⊞' },
  { to: '/app/history', label: 'Run history', glyph: '◷' },
  { to: '/app/reports', label: 'Reports & exports', glyph: '↓' },
] as const;

export const CUSTOMER_ACCOUNT_NAV = [
  { to: '/app/billing', label: 'Billing & plans', glyph: '◇' },
  { to: '/app/settings', label: 'Settings', glyph: '⚙' },
  { to: '/app/help', label: 'Help center', glyph: '?' },
] as const;

export const CUSTOMER_MOBILE_TABS = [
  { to: '/app/dashboard', label: 'Home', glyph: '▦' },
  { to: '/app/upload', label: 'Upload', glyph: '⇧' },
  { to: '/app/reports', label: 'Reports', glyph: '↓' },
  { to: '/app/history', label: 'Activity', glyph: '◷' },
  { to: '/app/settings', label: 'Account', glyph: '⚙' },
] as const;

export const ADMIN_MANAGEMENT_NAV = [
  { to: '/admin/overview', label: 'Overview', glyph: '▦' },
  { to: '/admin/users', label: 'Users', glyph: '◉' },
  { to: '/admin/subscriptions', label: 'Subscriptions', glyph: '◇' },
  { to: '/admin/payments', label: 'Payments', glyph: '¤' },
  { to: '/admin/uploads', label: 'Upload monitoring', glyph: '⇧' },
  { to: '/admin/storage', label: 'Storage', glyph: '▤' },
  { to: '/admin/security', label: 'Security center', glyph: '⌑' },
  { to: '/admin/roles', label: 'Audit logs & RBAC', glyph: '≡' },
  { to: '/admin/settings', label: 'Settings', glyph: '⚙' },
  { to: '/admin/operations', label: 'Connections', glyph: '⇄' },
] as const;

export const ADMIN_MOBILE_TABS = [
  { to: '/admin/overview', label: 'Overview', glyph: '▦' },
  { to: '/admin/users', label: 'Users', glyph: '◉' },
  { to: '/admin/payments', label: 'Payments', glyph: '¤' },
  { to: '/admin/roles', label: 'RBAC', glyph: '≡' },
] as const;

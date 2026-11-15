/**
 * Separated Text Layer — 00 Foundations & 04 System Flows Copy
 * Clean engineering design-system specification copy derived from Public Website.
 */

export const FOUNDATIONS_TEXT = {
  eyebrow: '00 FOUNDATIONS · CANONICAL DESIGN SYSTEM',
  heading: 'SheetSentry Design System & Surface Tokens',
  subheading:
    'Anchored in the crisp Public Website visual identity and cleanly propagated across Customer App, Admin Console, and System Flows.',
  directoryTitle: 'Separated Surface Directory',
  directorySubtitle:
    'Each surface shares core typography and brand anchors while maintaining isolated CSS layers and layout contracts.',
  buttonsSectionTitle: 'BUTTONS & INTERACTIVE STATES',
  typographyTitle: 'Typography Scale & Fluid Wrapping',
  colorsTitle: 'Canonical Color Palette',
  layoutTitle: 'Surface Layout Principles',
} as const;

export const SURFACE_CATALOG_ROWS = [
  {
    badge: '01 Public Website',
    route: '/',
    scope: 'Marketing Hero, Interactive Preview Card, Pricing, FAQ & Auth Flows',
    tokensSummary: 'White #FFFFFF canvas · #2563EB primary blue · #0D1B31 footer chrome',
    status: 'Canonical Source',
  },
  {
    badge: '02 Customer App',
    route: '/app/dashboard',
    scope: 'Dashboard, Upload Preflight, Validation Results, Rule Sandbox, Billing & Settings',
    tokensSummary: '#F5F7FB canvas · 238px #111F37 sidebar · 76px white topbar',
    status: 'Isolated CSS',
  },
  {
    badge: '03 Admin Console',
    route: '/admin/overview',
    scope: 'Overview, Users, Multi-Currency USD/PHP Ledger, RBAC Matrix, Security & Connections',
    tokensSummary: '#F5F7FB canvas · 238px #101C32 sidebar · Popover z-40 · Dual ledgers',
    status: 'Isolated CSS',
  },
  {
    badge: '00 Design System',
    route: '/foundations',
    scope: 'Foundational Color Tokens, Unclipped Typography Scale & Component States',
    tokensSummary: 'Shared DM Sans & JetBrains Mono scale · Solid opaque card isolation',
    status: 'Active Spec',
  },
  {
    badge: '04 System Flows',
    route: '/flows',
    scope: 'Connected System Map, Worker Architecture, 42-Table ERD & 28 REST API Groups',
    tokensSummary: '7 database domain modules · Segregated financial & audit schemas',
    status: 'Engineering Handoff',
  },
] as const;

export const FLOWS_TEXT = {
  eyebrow: '04 SYSTEM FLOWS & TECHNICAL ARCHITECTURE',
  heading: 'SheetSentry Connected System Flows & Engineering Handoff',
  subheading:
    'End-to-end validation architecture connecting Public Onboarding, Customer Preflight, Worker Containers, MySQL 8 Relational Storage, and Admin Governance.',
  mapEyebrow: 'CONNECTED SYSTEM MAP',
  mapTitle: 'End-to-End Platform Surface & Processing Topology',
  configEyebrow: 'PRODUCT CONFIGURATION & BUSINESS RULES',
  configTitle: 'Plan Entitlements, Currency Modes & Worker Thresholds',
  erdEyebrow: 'MYSQL 8 & PHPMYADMIN RELATIONAL SCHEMA (42 TABLES)',
  erdTitle: 'Relational Schema Across 7 Domain Modules',
  apiEyebrow: 'RESTFUL API SPECIFICATION CATALOG',
  apiTitle: '28 Reconciled API Route Groups',
} as const;

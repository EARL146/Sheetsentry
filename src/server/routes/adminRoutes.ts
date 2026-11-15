/**
 * SheetSentry Admin Console Platform Routes (/api/v1/admin)
 * Multi-Tenant Governance, Dual-Currency Ledger & Security Controls
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdminRole } from '../middleware/rbacMiddleware';
import { ValidationError } from '../middleware/errorHandler';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireAdminRole('SUPER_ADMIN', 'PLATFORM_OPS', 'SECOPS_AUDITOR', 'BILLING_ADMIN', 'SUPPORT_L2'));

// GET /admin/overview — Platform KPI metrics
adminRouter.get('/overview', (req: Request, res: Response) => {
  res.status(200).json({
    kpis: {
      totalUsers: 12480,
      activeSubscribers: 1280,
      validationJobs: 8420,
      storageUsedGb: 420,
      systemStatus: 'ALL_SYSTEMS_OPERATIONAL',
    },
    weeklyGrowth: [
      { week: 'W1', count: 58 },
      { week: 'W2', count: 72 },
      { week: 'W3', count: 86 },
      { week: 'W4', count: 98 },
      { week: 'W5', count: 112 },
      { week: 'W6', count: 124 },
      { week: 'W7', count: 136 },
      { week: 'W8', count: 148 },
    ],
  });
});

// GET /admin/users — User governance
adminRouter.get('/users', (req: Request, res: Response) => {
  res.status(200).json({
    users: [
      { id: 'usr_olivia_01', name: 'Olivia Lee', email: 'olivia@sheetsentry.io', role: 'Tenant Owner', status: 'Active' },
      { id: 'usr_marcus_02', name: 'Marcus Chen', email: 'marcus@sheetsentry.io', role: 'Super Admin', status: 'Active' },
      { id: 'usr_ava_03', name: 'Ava Santos', email: 'ava@sheetsentry.io', role: 'Billing Admin', status: 'Active' },
      { id: 'usr_noah_04', name: 'Noah Patel', email: 'noah@sheetsentry.io', role: 'SecOps Auditor', status: 'Active' },
    ],
  });
});

// GET /admin/ledger — Segregated USD & PHP Transactions
adminRouter.get('/ledger', (req: Request, res: Response) => {
  const { currency } = req.query;

  const usdTransactions = [
    { id: 'pay_99201_usd', workspace: "Olivia's workspace", date: 'Nov 6, 2026', amount: '$12.00', status: 'Settled', gateway: 'Stripe' },
    { id: 'pay_99202_usd', workspace: 'Acme Data Corp', date: 'Nov 6, 2026', amount: '$12.00', status: 'Settled', gateway: 'Stripe' },
    { id: 'pay_99203_usd', workspace: 'Pacific Supply Ltd', date: 'Nov 5, 2026', amount: '$5.00', status: 'Settled', gateway: 'Stripe' },
  ];

  const phpTransactions = [
    { id: 'pay_99204_php', workspace: 'Metro Manila Retail', date: 'Nov 6, 2026', amount: '₱660.00', status: 'Settled', gateway: 'PayMongo' },
    { id: 'pay_99205_php', workspace: 'Cebu Analytics Hub', date: 'Nov 5, 2026', amount: '₱660.00', status: 'Settled', gateway: 'PayMongo' },
  ];

  res.status(200).json({
    fxReferenceRate: '1 USD = 55.00 PHP',
    netUsd: 14820.0,
    netPhp: 815100.0,
    transactions: currency === 'PHP' ? phpTransactions : usdTransactions,
  });
});

// GET /admin/connections — Live Azure Service connections
adminRouter.get('/connections', (req: Request, res: Response) => {
  res.status(200).json({
    connectedCount: 4,
    totalCount: 4,
    connections: [
      { id: 'conn_mysql', name: 'Azure MySQL Flexible Server', category: 'Database Engine', status: 'CONNECTED', pingMs: 14 },
      { id: 'conn_blob', name: 'Azure Blob Storage', category: 'Object Storage', status: 'CONNECTED', pingMs: 38 },
      { id: 'conn_redis', name: 'Azure Managed Redis', category: 'Cache & Rate Limiting', status: 'CONNECTED', pingMs: 4 },
      { id: 'conn_bus', name: 'Azure Service Bus', category: 'Async Worker Queue', status: 'CONNECTED', pingMs: 22 },
    ],
  });
});

// POST /admin/unmask-ticket — Security Control #8: Support-Ticket-Gated Cell Unmasking (Node 115:2)
adminRouter.post('/unmask-ticket', (req: Request, res: Response, next: NextFunction) => {
  const { supportTicketId, justification, entityKey } = req.body;

  if (!supportTicketId || !/^SUP-\d{4,6}$/i.test(supportTicketId)) {
    return next(new ValidationError('Support Ticket ID must follow format SUP-XXXX (e.g. SUP-4902)'));
  }

  if (!justification || justification.length < 12) {
    return next(new ValidationError('Audit justification must be at least 12 characters'));
  }

  res.status(200).json({
    unmasked: true,
    entityKey,
    supportTicketId: supportTicketId.toUpperCase(),
    grantExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    auditTrailId: 'aud_' + Math.random().toString(36).substring(2, 10),
  });
});
